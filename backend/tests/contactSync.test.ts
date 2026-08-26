import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContactSyncService } from '../src/services/contactSync.service.js';
import { ZohoApiError } from '../src/shared/types.js';
import type { JsonPlaceholdeUser } from '../src/shared/types.js';

vi.mock('../src/clients/zoho.crm.client.js', () => ({
  ZohoCRMClient: vi.fn().mockImplementation(() => ({
    upsertContact: vi.fn().mockResolvedValue({
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

const duplicateError = new ZohoApiError(
  'ZOHO_API_ERROR: 400',
  400,
  {
    code: 'DUPLICATE_DATA',
    message: 'duplicate data',
    details: {
      api_name: 'Email',
      duplicate_record: {
        id: 'existing-record-id-123',
        module: { api_name: 'Contacts' },
      },
    },
  },
  'https://www.zohoapis.com/crm/v2/Contacts/upsert'
);

const unknownZohoError = new ZohoApiError(
  'ZOHO_API_ERROR: 500',
  500,
  { code: 'INTERNAL_ERROR', message: 'server error' },
  'https://www.zohoapis.com/crm/v2/Contacts/upsert'
);

describe('ContactSyncService', () => {
  let service: ContactSyncService;
  let mockUpsertContact: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    const MockedZohoCRMClient = vi.mocked(ZohoCRMClient);
    const instance = new MockedZohoCRMClient();
    mockUpsertContact = instance.upsertContact as ReturnType<typeof vi.fn>;
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
      expect(mockUpsertContact).toHaveBeenCalledOnce();
    });

    it('detects updated operation from Zoho response', async () => {
      mockUpsertContact.mockResolvedValueOnce({
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
      expect(mockUpsertContact).toHaveBeenCalledWith(
        expect.objectContaining({ Source_Id__c: '5' }),
        'test-token'
      );
    });

    it('simulates error for username starting with C', async () => {
      const result = await service.syncOne(mockUserC, 'test-token');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SIMULATED_ERROR');
      expect(result.error?.message).toBe('Simulated error: username starts with C');
      expect(result.sourceId).toBe(2);
      expect(mockUpsertContact).not.toHaveBeenCalled();
    });

    it('returns CONTACT_ALREADY_EXISTS for DUPLICATE_DATA', async () => {
      mockUpsertContact.mockRejectedValueOnce(duplicateError);

      const result = await service.syncOne(mockUser, 'test-token');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CONTACT_ALREADY_EXISTS');
      expect(result.sourceId).toBe(1);
    });

    it('returns ZOHO_API_ERROR for unexpected Zoho errors', async () => {
      mockUpsertContact.mockRejectedValueOnce(unknownZohoError);

      const result = await service.syncOne(mockUser, 'test-token');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ZOHO_API_ERROR');
      expect(result.sourceId).toBe(1);
    });

    it('returns ZOHO_API_ERROR for non-Zoho errors', async () => {
      mockUpsertContact.mockRejectedValueOnce(new Error('Network timeout'));

      const result = await service.syncOne(mockUser, 'test-token');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ZOHO_API_ERROR');
      expect(result.error?.message).toBe('Network timeout');
    });
  });

  describe('syncBulk', () => {
    it('syncs multiple users successfully', async () => {
      const users = [mockUser, { ...mockUser, id: 3, username: 'Ervin' }];
      const result = await service.syncBulk(users, 'test-token');

      expect(result.total).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(2);
    });

    it('bulk with mixed created + updated', async () => {
      mockUpsertContact
        .mockResolvedValueOnce({
          data: [{ code: 0, message: 'record added', details: { id: '111' }, status: 'success' }],
        })
        .mockResolvedValueOnce({
          data: [{ code: 0, message: 'record updated', details: { id: '222' }, status: 'success' }],
        });

      const users = [mockUser, { ...mockUser, id: 3, username: 'Ervin' }];
      const result = await service.syncBulk(users, 'test-token');

      expect(result.total).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.results[0].operation).toBe('created');
      expect(result.results[1].operation).toBe('updated');
    });

    it('continues after DUPLICATE_DATA', async () => {
      mockUpsertContact
        .mockResolvedValueOnce({
          data: [{ code: 0, details: { id: '111' }, status: 'success' }],
        })
        .mockRejectedValueOnce(duplicateError)
        .mockResolvedValueOnce({
          data: [{ code: 0, details: { id: '333' }, status: 'success' }],
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
      expect(result.results[1].error?.code).toBe('CONTACT_ALREADY_EXISTS');
    });

    it('handles mixed results: success + duplicate + simulated', async () => {
      mockUpsertContact
        .mockResolvedValueOnce({
          data: [{ code: 0, details: { id: '111' }, status: 'success' }],
        })
        .mockRejectedValueOnce(duplicateError);

      const users = [
        mockUser,
        { ...mockUser, id: 3, username: 'Ervin' },
        mockUserC,
      ];

      const result = await service.syncBulk(users, 'test-token');

      expect(result.total).toBe(3);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(2);
      expect(result.results[0].success).toBe(true);
      expect(result.results[0].operation).toBe('created');
      expect(result.results[1].error?.code).toBe('CONTACT_ALREADY_EXISTS');
      expect(result.results[2].error?.code).toBe('SIMULATED_ERROR');
    });

    it('error in one record does not stop the rest', async () => {
      mockUpsertContact
        .mockResolvedValueOnce({
          data: [{ code: 0, details: { id: '111' }, status: 'success' }],
        })
        .mockRejectedValueOnce(unknownZohoError)
        .mockResolvedValueOnce({
          data: [{ code: 0, message: 'record updated', details: { id: '333' }, status: 'success' }],
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
      expect(result.results[2].success).toBe(true);
      expect(result.results[2].operation).toBe('updated');
    });

    it('same sourceId with different email updates the same contact', async () => {
      mockUpsertContact.mockResolvedValue({
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
    });
  });
});
