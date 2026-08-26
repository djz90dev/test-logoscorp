import { ZohoCRMClient } from '../clients/zoho.crm.client.js';
import { shouldSimulateError } from './simulateError.js';
import type {
  JsonPlaceholdeUser,
  ZohoContact,
  SyncResult,
  BulkSyncResult,
} from '../shared/types.js';

function toZohoContact(user: JsonPlaceholdeUser): ZohoContact {
  const nameParts = user.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ');

  return {
    First_Name: firstName,
    Last_Name: lastName,
    Email: user.email,
    Phone: user.phone.replace(/[^0-9]/g, ''),
    Website: user.website.startsWith('http')
      ? user.website
      : `https://${user.website}`,
    Company: user.company.name,
  };
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
        error: {
          message: 'Simulated error: username starts with C',
          code: 'SIMULATED_ERROR',
        },
      };
    }

    try {
      const zohoContact = toZohoContact(user);
      const response = await this.zohoCRMClient.createContact(
        zohoContact,
        accessToken
      );

      return {
        userId: user.id,
        success: true,
        contactId: response.data?.[0]?.details?.id,
      };
    } catch (error) {
      return {
        userId: user.id,
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'ZOHO_API_ERROR',
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
