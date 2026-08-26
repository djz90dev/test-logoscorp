import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContactSyncService } from '../src/services/contactSync.service.js';
import { ZohoApiError } from '../src/shared/types.js';
import type { JsonPlaceholdeUser } from '../src/shared/types.js';

vi.mock('../src/clients/zoho.crm.client.js', () => ({
  ZohoCRMClient: vi.fn().mockImplementation(() => ({
    upsertContacts: vi.fn().mockResolvedValue({
      data: [{ code: 0, message: 'record added', details: { id: '12345' }, status: 'success' }],
    }),
  })),
}));

import { ZohoCRMClient } from '../src/clients/zoho.crm.client.js';

const mockUser: JsonPlaceholdeUser = {
  id: 1,
  name: 'Leanne Graham',
  username: 'Bret',
  email: 'Sincere@april.biz',
  phone: '1-770-736-803164',
  website: 'hildegard.org',
  company: {
    name: 'Romaguera-Crona',
    catchPhrase: 'Multi-layered client-server neural-net',
    bs: 'harness real-time e-markets',
  },
};

const mockUserC: JsonPlaceholdeUser = {
  ...mockUser,
  id: 2,
  username: 'Clementine',
};

const networkError = new ZohoApiError(
  'ZOHO_API_ERROR: 500',
  500,
  { code: 'INTERNAL_ERROR', message: 'server error' },
  'https://www.zohoapis.com/crm/v2/Contacts/upsert'
);

describe('ContactSyncService', () => {
  let service: ContactSyncService;
  let mockUpsertContacts: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    const MockedZohoCRMClient = vi.mocked(ZohoCRMClient);
    const instance = new MockedZohoCRMClient();
    mockUpsertContacts = instance.upsertContacts as ReturnType<typeof vi.fn>;
    service = new ContactSyncService(instance);
  });

  describe('syncOne', () => {
    it('syncs valid user - created', async () => {
      const result = await service.syncOne(mockUser, 'test-token');

      expect(result.success).toBe(true);
      expect(result.userId).toBe(1);
      expect(result.sourceId).toBe(1);
      expect(result.contactId).toBe('12345');
      expect(result.operation).toBe('created');
      expect(mockUpsertContacts).toHaveBeenCalledOnce();
      expect(mockUpsertContacts).toHaveBeenCalledWith(
        [expect.objectContaining({ Source_Id__c: '1' })],
        'test-token'
      );
    });

    it('detects updated operation from Zoho response', async () => {
      mockUpsertContacts.mockResolvedValueOnce({
        data: [{ code: 0, message: 'record updated', details: { id: '99999' }, status: 'success' }],
      });

      const result = await service.syncOne(mockUser, 'test-token');

      expect(result.success).toBe(true);
      expect(result.operation).toBe('updated');
      expect(result.contactId).toBe('99999');
    });

    it('preserves sourceId through entire flow', async () => {
      const user5 = { ...mockUser, id: 5 };
      const result = await service.syncOne(user5, 'test-token');

      expect(result.sourceId).toBe(5);
      expect(mockUpsertContacts).toHaveBeenCalledWith(
        [expect.objectContaining({ Source_Id__c: '5' })],
        'test-token'
      );
    });

    it('simulates error for username starting with C', async () => {
      const result = await service.syncOne(mockUserC, 'test-token');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SIMULATED_ERROR');
      expect(result.error?.message).toBe('Simulated error: username starts with C');
      expect(result.sourceId).toBe(2);
      expect(mockUpsertContacts).not.toHaveBeenCalled();
    });

    it('returns ZOHO_API_ERROR for network errors', async () => {
      mockUpsertContacts.mockRejectedValueOnce(networkError);

      const result = await service.syncOne(mockUser, 'test-token');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ZOHO_API_ERROR');
      expect(result.sourceId).toBe(1);
    });
  });

  describe('syncBulk', () => {
    it('makes single batch API call for all valid users', async () => {
      const users = [
        mockUser,
        { ...mockUser, id: 3, username: 'Ervin' },
        { ...mockUser, id: 4, username: 'Dan' },
      ];

      const result = await service.syncBulk(users, 'test-token');

      expect(result.total).toBe(3);
      expect(result.successful).toBe(3);
      expect(result.failed).toBe(0);
      expect(mockUpsertContacts).toHaveBeenCalledOnce();
      expect(mockUpsertContacts).toHaveBeenCalledWith(
        [
          expect.objectContaining({ Source_Id__c: '1' }),
          expect.objectContaining({ Source_Id__c: '3' }),
          expect.objectContaining({ Source_Id__c: '4' }),
        ],
        'test-token'
      );
    });

    it('filters simulated errors and sends only valid users in batch', async () => {
      mockUpsertContacts.mockResolvedValueOnce({
        data: [
          { code: 0, message: 'record added', details: { id: '111' }, status: 'success' },
          { code: 0, message: 'record added', details: { id: '333' }, status: 'success' },
        ],
      });

      const users = [mockUser, mockUserC, { ...mockUser, id: 3, username: 'Ervin' }];
      const result = await service.syncBulk(users, 'test-token');

      expect(result.total).toBe(3);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
      expect(mockUpsertContacts).toHaveBeenCalledOnce();
      expect(mockUpsertContacts).toHaveBeenCalledWith(
        [
          expect.objectContaining({ Source_Id__c: '1' }),
          expect.objectContaining({ Source_Id__c: '3' }),
        ],
        'test-token'
      );
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].error?.code).toBe('SIMULATED_ERROR');
      expect(result.results[2].success).toBe(true);
    });

    it('bulk with mixed created + updated', async () => {
      mockUpsertContacts.mockResolvedValueOnce({
        data: [
          { code: 0, message: 'record added', details: { id: '111' }, status: 'success' },
          { code: 0, message: 'record updated', details: { id: '222' }, status: 'success' },
        ],
      });

      const users = [mockUser, { ...mockUser, id: 3, username: 'Ervin' }];
      const result = await service.syncBulk(users, 'test-token');

      expect(result.total).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.results[0].operation).toBe('created');
      expect(result.results[1].operation).toBe('updated');
    });

    it('handles per-record errors in batch response', async () => {
      mockUpsertContacts.mockResolvedValueOnce({
        data: [
          { code: 0, message: 'record added', details: { id: '111' }, status: 'success' },
          { code: 3001, message: 'invalid data', details: {}, status: 'error' },
          { code: 0, message: 'record updated', details: { id: '333' }, status: 'success' },
        ],
      });

      const users = [
        mockUser,
        { ...mockUser, id: 3, username: 'Ervin' },
        { ...mockUser, id: 4, username: 'Dan' },
      ];

      const result = await service.syncBulk(users, 'test-token');

      expect(result.total).toBe(3);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(false);
      expect(result.results[1].error?.code).toBe('ZOHO_UPSERT_ERROR');
      expect(result.results[2].success).toBe(true);
    });

    it('network error fails all valid users in batch', async () => {
      mockUpsertContacts.mockRejectedValueOnce(networkError);

      const users = [mockUser, { ...mockUser, id: 3, username: 'Ervin' }];
      const result = await service.syncBulk(users, 'test-token');

      expect(result.total).toBe(2);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(2);
      expect(result.results[0].error?.code).toBe('ZOHO_API_ERROR');
      expect(result.results[1].error?.code).toBe('ZOHO_API_ERROR');
    });

    it('network error does not affect simulated errors', async () => {
      mockUpsertContacts.mockRejectedValueOnce(networkError);

      const users = [mockUser, mockUserC];
      const result = await service.syncBulk(users, 'test-token');

      expect(result.total).toBe(2);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(2);
      expect(result.results[0].error?.code).toBe('ZOHO_API_ERROR');
      expect(result.results[1].error?.code).toBe('SIMULATED_ERROR');
    });

    it('same sourceId with different email updates the same contact', async () => {
      mockUpsertContacts.mockResolvedValue({
        data: [{ code: 0, message: 'record updated', details: { id: '555' }, status: 'success' }],
      });

      const userA = { ...mockUser, id: 5, email: 'old@example.com' };
      const userB = { ...mockUser, id: 5, email: 'new@example.com' };

      const result1 = await service.syncOne(userA, 'test-token');
      const result2 = await service.syncOne(userB, 'test-token');

      expect(result1.sourceId).toBe(5);
      expect(result1.operation).toBe('updated');
      expect(result2.sourceId).toBe(5);
      expect(result2.operation).toBe('updated');
    });

    it('returns empty result for empty input', async () => {
      const result = await service.syncBulk([], 'test-token');

      expect(result.total).toBe(0);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(0);
      expect(mockUpsertContacts).not.toHaveBeenCalled();
    });

    it('individual and bulk use the same underlying upsert', async () => {
      mockUpsertContacts.mockResolvedValue({
        data: [{ code: 0, message: 'record added', details: { id: '999' }, status: 'success' }],
      });

      await service.syncOne(mockUser, 'test-token');
      await service.syncBulk([{ ...mockUser, id: 10 }], 'test-token');

      expect(mockUpsertContacts).toHaveBeenCalledTimes(2);
      expect(mockUpsertContacts.mock.calls[0][0]).toHaveLength(1);
      expect(mockUpsertContacts.mock.calls[1][0]).toHaveLength(1);
    });
  });
});
