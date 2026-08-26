import { config } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ZohoApiError } from '../shared/types.js';
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
    const payload = { data: [contact] };

    logger.info(
      { url, payload },
      'Creating contact in Zoho CRM'
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
