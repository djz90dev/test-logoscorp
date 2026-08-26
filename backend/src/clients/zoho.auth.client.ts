import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

export class ZohoAuthClient {
  private accessToken: string | null = null;
  private expiresAt: number = 0;

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.expiresAt) {
      return this.accessToken;
    }

    logger.info('Refreshing Zoho access token');

    const response = await fetch(
      `${config.ZOHO_ACCOUNT_SERVER}/oauth/v2/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: config.ZOHO_CLIENT_ID,
          client_secret: config.ZOHO_CLIENT_SECRET,
          refresh_token: config.ZOHO_REFRESH_TOKEN,
        }),
      }
    );

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }
      logger.error(
        { status: response.status, zohoBody: errorBody },
        'Failed to refresh Zoho token'
      );
      throw new Error(`ZOHO_AUTH_ERROR: ${response.status}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    this.accessToken = data.access_token;
    this.expiresAt = Date.now() + data.expires_in * 1000 - 60000;

    logger.info('Zoho access token refreshed successfully');
    return this.accessToken;
  }
}
