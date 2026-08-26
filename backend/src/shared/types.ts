export interface JsonPlaceholdeUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

export interface NormalizedUser extends JsonPlaceholdeUser {
  normalizedPhone: string;
  normalizedWebsite: string;
  isValidCompany: boolean;
}

export interface SyncResult {
  userId: number;
  success: boolean;
  contactId?: string;
  operation?: SyncOperation;
  sourceId?: number;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
}

export interface BulkSyncResult {
  total: number;
  successful: number;
  failed: number;
  results: SyncResult[];
}

export interface ZohoContact {
  First_Name?: string;
  Last_Name: string;
  Email: string;
  Phone: string;
  Account_Name?: string;
  Source_Id__c?: string;
}

export type SyncOperation = 'created' | 'updated';

export interface ZohoUpsertResponse {
  data: Array<{
    code: number;
    message: string;
    details: { id: string };
    status: string;
  }>;
}

export interface AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;
}

export interface SyncUserRequest {
  user: JsonPlaceholdeUser;
}

export interface SyncBulkRequest {
  users: JsonPlaceholdeUser[];
}

export class ZohoApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public zohoBody: unknown,
    public endpoint: string
  ) {
    super(message);
    this.name = 'ZohoApiError';
  }
}
