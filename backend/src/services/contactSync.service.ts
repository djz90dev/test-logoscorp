import { ZohoCRMClient } from '../clients/zoho.crm.client.js';
import { shouldSimulateError } from './simulateError.js';
import { mapUserToZohoContact } from './mapUserToZohoContact.js';
import { ZohoApiError } from '../shared/types.js';
import type {
  JsonPlaceholdeUser,
  SyncResult,
  SyncOperation,
  BulkSyncResult,
} from '../shared/types.js';

function detectOperation(zohoMessage: string): SyncOperation {
  const lower = zohoMessage.toLowerCase();
  if (lower.includes('updated')) return 'updated';
  return 'created';
}

export class ContactSyncService {
  private zohoCRMClient: ZohoCRMClient;

  constructor(zohoCRMClient: ZohoCRMClient) {
    this.zohoCRMClient = zohoCRMClient;
  }

  async syncOne(
    user: JsonPlaceholdeUser,
    accessToken: string
  ): Promise<SyncResult> {
    if (shouldSimulateError(user.username)) {
      return {
        userId: user.id,
        success: false,
        sourceId: user.id,
        error: {
          message: 'Simulated error: username starts with C',
          code: 'SIMULATED_ERROR',
        },
      };
    }

    try {
      const zohoContact = mapUserToZohoContact(user);
      const response = await this.zohoCRMClient.upsertContacts(
        [zohoContact],
        accessToken
      );

      const record = response.data?.[0];
      const operation = detectOperation(record?.message || '');

      return {
        userId: user.id,
        success: true,
        contactId: record?.details?.id,
        operation,
        sourceId: user.id,
      };
    } catch (error) {
      const details = error instanceof ZohoApiError ? error.zohoBody : undefined;
      return {
        userId: user.id,
        success: false,
        sourceId: user.id,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: error instanceof ZohoApiError ? 'ZOHO_API_ERROR' : 'ZOHO_API_ERROR',
          details,
        },
      };
    }
  }

  async syncBulk(
    users: JsonPlaceholdeUser[],
    accessToken: string
  ): Promise<BulkSyncResult> {
    const results: SyncResult[] = [];

    // Separate simulated errors from valid users
    const validUsers: { user: JsonPlaceholdeUser; originalIndex: number }[] = [];
    const simulatedMap = new Map<number, SyncResult>();

    users.forEach((user, index) => {
      if (shouldSimulateError(user.username)) {
        simulatedMap.set(index, {
          userId: user.id,
          success: false,
          sourceId: user.id,
          error: {
            message: 'Simulated error: username starts with C',
            code: 'SIMULATED_ERROR',
          },
        });
      } else {
        validUsers.push({ user, originalIndex: index });
      }
    });

    // Single batch API call for all valid users
    if (validUsers.length > 0) {
      try {
        const zohoContacts = validUsers.map(({ user }) =>
          mapUserToZohoContact(user)
        );
        const response = await this.zohoCRMClient.upsertContacts(
          zohoContacts,
          accessToken
        );

        // Map Zoho response back to results (index-based)
        validUsers.forEach(({ user, originalIndex }, i) => {
          const record = response.data?.[i];

          if (record?.status === 'error' || (record?.code && record.code !== 0)) {
            results[originalIndex] = {
              userId: user.id,
              success: false,
              sourceId: user.id,
              error: {
                message: record?.message || 'Zoho upsert error',
                code: 'ZOHO_UPSERT_ERROR',
                details: record,
              },
            };
          } else {
            const operation = detectOperation(record?.message || '');
            results[originalIndex] = {
              userId: user.id,
              success: true,
              contactId: record?.details?.id,
              operation,
              sourceId: user.id,
            };
          }
        });
      } catch (error) {
        // Network/auth error — all valid users fail
        const details = error instanceof ZohoApiError ? error.zohoBody : undefined;
        validUsers.forEach(({ user, originalIndex }) => {
          results[originalIndex] = {
            userId: user.id,
            success: false,
            sourceId: user.id,
            error: {
              message: error instanceof Error ? error.message : 'Unknown error',
              code: 'ZOHO_API_ERROR',
              details,
            },
          };
        });
      }
    }

    // Insert simulated errors at their original positions
    simulatedMap.forEach((result, originalIndex) => {
      results[originalIndex] = result;
    });

    return {
      total: users.length,
      successful: results.filter((r) => r?.success).length,
      failed: results.filter((r) => r && !r.success).length,
      results,
    };
  }
}
