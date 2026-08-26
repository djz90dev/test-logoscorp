import { config } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ZohoApiError } from '../shared/types.js';
import type { ZohoContact, ZohoUpsertResponse } from '../shared/types.js';

export class ZohoCRMClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = config.ZOHO_API_BASE_URL;
    this.timeout = 30000;
  }

  async upsertContacts(
    contacts: ZohoContact[],
    accessToken: string
  ): Promise<ZohoUpsertResponse> {
    const url = `${this.baseUrl}/Contacts/upsert`;
    const payload = { data: contacts };

    logger.info(
      { url, count: contacts.length, sourceIds: contacts.map((c) => c.Source_Id__c) },
      'Batch upserting contacts in Zoho CRM'
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let zohoBody: unknown;
        try {
          zohoBody = await response.json();
        } catch {
          zohoBody = await response.text();
        }

        logger.error(
          {
            status: response.status,
            endpoint: url,
            zohoBody,
          },
          'Zoho CRM API error'
        );

        throw new ZohoApiError(
          `ZOHO_API_ERROR: ${response.status}`,
          response.status,
          zohoBody,
          url
        );
      }

      const data = (await response.json()) as ZohoUpsertResponse;
      logger.info(
        { count: data.data?.length },
        'Batch contacts upserted in Zoho CRM'
      );
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}
