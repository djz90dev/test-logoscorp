export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: Company;
  normalizedPhone: string;
  normalizedWebsite: string;
  isValidCompany: boolean;
}

export interface SyncResult {
  userId: number;
  success: boolean;
  contactId?: string;
  operation?: 'created' | 'updated';
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

export interface ApiError {
  message: string;
  code: string;
  details?: Array<{ field: string; message: string }>;
}
