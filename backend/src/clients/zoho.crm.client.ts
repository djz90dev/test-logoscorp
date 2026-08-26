import { config } from '../config/env.js';
import { logger } from '../config/logger.js';
import type { ZohoContact, ZohoCreateResponse } from '../shared/types.js';

export class ZohoCRMClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = config.ZOHO_API_BASE_URL;
    this.timeout = 30000;
  }

  async createContact(
    contact: ZohoContact,
    accessToken: string
  ): Promise<ZohoCreateResponse> {
    const url = `${this.baseUrl}/Contacts`;
    logger.info({ url }, 'Creating contact in Zoho CRM');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: [contact] }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(
          { status: response.status, body: errorText },
          'Zoho CRM API error'
        );
        throw new Error(`ZOHO_API_ERROR: ${response.status}`);
      }

      const data = (await response.json()) as ZohoCreateResponse;
      logger.info(
        { contactId: data.data?.[0]?.details?.id },
        'Contact created in Zoho CRM'
      );
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}
