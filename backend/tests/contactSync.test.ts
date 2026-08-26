import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContactSyncService } from '../src/services/contactSync.service.js';
import { ZohoApiError } from '../src/shared/types.js';
import type { JsonPlaceholdeUser } from '../src/shared/types.js';

vi.mock('../src/clients/zoho.crm.client.js', () => ({
  ZohoCRMClient: vi.fn().mockImplementation(() => ({
    createContact: vi.fn().mockResolvedValue({
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
  'https://www.zohoapis.com/crm/v2/Contacts'
);

const unknownZohoError = new ZohoApiError(
  'ZOHO_API_ERROR: 500',
  500,
  { code: 'INTERNAL_ERROR', message: 'server error' },
  'https://www.zohoapis.com/crm/v2/Contacts'
);

describe('ContactSyncService', () => {
  let service: ContactSyncService;
  let mockCreateContact: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    const MockedZohoCRMClient = vi.mocked(ZohoCRMClient);
    const instance = new MockedZohoCRMClient();
    mockCreateContact = instance.createContact as ReturnType<typeof vi.fn>;
    service = new ContactSyncService(instance);
  });

  describe('syncOne', () => {
    it('syncs valid user successfully', async () => {
      const result = await service.syncOne(mockUser, 'test-token');

      expect(result.success).toBe(true);
      expect(result.userId).toBe(1);
      expect(result.contactId).toBe('12345');
      expect(mockCreateContact).toHaveBeenCalledOnce();
    });

    it('simulates error for username starting with C', async () => {
      const result = await service.syncOne(mockUserC, 'test-token');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SIMULATED_ERROR');
      expect(result.error?.message).toBe('Simulated error: username starts with C');
      expect(mockCreateContact).not.toHaveBeenCalled();
    });

    it('returns CONTACT_ALREADY_EXISTS for DUPLICATE_DATA', async () => {
      mockCreateContact.mockRejectedValueOnce(duplicateError);

      const result = await service.syncOne(mockUser, 'test-token');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CONTACT_ALREADY_EXISTS');
      expect(result.error?.message).toBe('El contacto ya existe en Zoho CRM');
      expect(result.error?.details).toEqual({
        field: 'Email',
        existingRecordId: 'existing-record-id-123',
      });
    });

    it('returns ZOHO_API_ERROR for unexpected Zoho errors', async () => {
      mockCreateContact.mockRejectedValueOnce(unknownZohoError);

      const result = await service.syncOne(mockUser, 'test-token');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ZOHO_API_ERROR');
      expect(result.error?.details).toEqual({ code: 'INTERNAL_ERROR', message: 'server error' });
    });

    it('returns ZOHO_API_ERROR for non-Zoho errors', async () => {
      mockCreateContact.mockRejectedValueOnce(new Error('Network timeout'));

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

    it('continues after DUPLICATE_DATA', async () => {
      mockCreateContact
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
      mockCreateContact
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
      expect(result.results[1].error?.code).toBe('CONTACT_ALREADY_EXISTS');
      expect(result.results[2].error?.code).toBe('SIMULATED_ERROR');
    });

    it('continues after unexpected Zoho error', async () => {
      mockCreateContact
        .mockResolvedValueOnce({
          data: [{ code: 0, details: { id: '111' }, status: 'success' }],
        })
        .mockRejectedValueOnce(unknownZohoError);

      const users = [mockUser, { ...mockUser, id: 3, username: 'Ervin' }];
      const result = await service.syncBulk(users, 'test-token');

      expect(result.total).toBe(2);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.results[1].error?.code).toBe('ZOHO_API_ERROR');
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
