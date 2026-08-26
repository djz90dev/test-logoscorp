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

interface ZohoErrorBody {
  code?: string;
  message?: string;
  details?: {
    api_name?: string;
    duplicate_record?: {
      id?: string;
      module?: { api_name?: string };
    };
  };
}

function isDuplicateData(zohoBody: unknown): zohoBody is ZohoErrorBody {
  return (
    typeof zohoBody === 'object' &&
    zohoBody !== null &&
    (zohoBody as ZohoErrorBody).code === 'DUPLICATE_DATA'
  );
}

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
      const response = await this.zohoCRMClient.upsertContact(
        zohoContact,
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
      if (error instanceof ZohoApiError && isDuplicateData(error.zohoBody)) {
        return {
          userId: user.id,
          success: false,
          sourceId: user.id,
          error: {
            message: 'El contacto ya existe en Zoho CRM (duplicado por otro campo)',
            code: 'CONTACT_ALREADY_EXISTS',
            details: {
              field: error.zohoBody.details?.api_name || 'Unknown',
              existingRecordId: error.zohoBody.details?.duplicate_record?.id || '',
            },
          },
        };
      }

      const details = error instanceof ZohoApiError ? error.zohoBody : undefined;
      return {
        userId: user.id,
        success: false,
        sourceId: user.id,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'ZOHO_API_ERROR',
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

    for (const user of users) {
      const result = await this.syncOne(user, accessToken);
      results.push(result);
    }

    return {
      total: users.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }
}
