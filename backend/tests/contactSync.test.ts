import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContactSyncService } from '../src/services/contactSync.service.js';
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
      expect(mockCreateContact).not.toHaveBeenCalled();
    });

    it('handles Zoho API error', async () => {
      mockCreateContact.mockRejectedValueOnce(new Error('ZOHO_API_ERROR: 500'));

      const result = await service.syncOne(mockUser, 'test-token');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ZOHO_API_ERROR');
    });
  });

  describe('syncBulk', () => {
    it('syncs multiple users', async () => {
      const users = [mockUser, { ...mockUser, id: 3, username: 'Ervin' }];
      const result = await service.syncBulk(users, 'test-token');

      expect(result.total).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(2);
    });

    it('continues after failure', async () => {
      const users = [mockUser, mockUserC];
      const result = await service.syncBulk(users, 'test-token');

      expect(result.total).toBe(2);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
    });

    it('handles mixed results', async () => {
      mockCreateContact
        .mockResolvedValueOnce({
          data: [{ code: 0, details: { id: '111' }, status: 'success' }],
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const users = [
        mockUser,
        { ...mockUser, id: 3, username: 'Ervin' },
        { ...mockUser, id: 4, username: 'Dan' },
      ];

      const result = await service.syncBulk(users, 'test-token');

      expect(result.total).toBe(3);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
    });

    it('returns empty array for empty input', async () => {
      const result = await service.syncBulk([], 'test-token');

      expect(result.total).toBe(0);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(0);
    });
  });
});
