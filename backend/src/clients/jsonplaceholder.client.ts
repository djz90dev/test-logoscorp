import { config } from '../config/env.js';
import { logger } from '../config/logger.js';
import type { JsonPlaceholdeUser } from '../shared/types.js';

export class JSONPlaceholderClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.JSONPLACEHOLDER_BASE_URL;
  }

  async getUsers(): Promise<JsonPlaceholdeUser[]> {
    logger.info({ url: `${this.baseUrl}/users` }, 'Fetching users from JSONPlaceholder');

    const response = await fetch(`${this.baseUrl}/users`);

    if (!response.ok) {
      logger.error({ status: response.status }, 'Failed to fetch users from JSONPlaceholder');
      throw new Error(`JSONPlaceholder API error: ${response.status}`);
    }

    const data = (await response.json()) as JsonPlaceholdeUser[];
    logger.info({ count: data.length }, 'Users fetched successfully');
    return data;
  }
}
