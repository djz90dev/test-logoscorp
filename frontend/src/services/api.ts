import type { User, BulkSyncResult, ApiError } from '../types';

const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      message: 'Network error',
      code: 'NETWORK_ERROR',
    }));
    throw error;
  }
  return response.json();
}

export async function fetchUsers(): Promise<{ data: User[] }> {
  const response = await fetch(`${API_BASE}/users`);
  return handleResponse<{ data: User[] }>(response);
}

export async function syncUser(user: User): Promise<{ success: boolean; data?: { contactId: string; message: string }; error?: ApiError }> {
  const response = await fetch(`${API_BASE}/contacts/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user }),
  });
  return handleResponse(response);
}

export async function syncBulk(users: User[]): Promise<BulkSyncResult> {
  const response = await fetch(`${API_BASE}/contacts/sync-bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ users }),
  });
  return handleResponse<BulkSyncResult>(response);
}
