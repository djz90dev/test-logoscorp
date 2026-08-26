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
  error?: {
    message: string;
    code: string;
  };
}

export interface BulkSyncResult {
  total: number;
  successful: number;
  failed: number;
  results: SyncResult[];
}

export interface ZohoContact {
  First_Name: string;
  Last_Name: string;
  Email: string;
  Phone: string;
  Website?: string;
  Company?: string;
}

export interface ZohoCreateResponse {
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
