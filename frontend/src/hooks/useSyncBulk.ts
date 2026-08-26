import { useState, useCallback } from 'react';
import { syncBulk } from '../services/api';
import type { User, BulkSyncResult } from '../types';

export function useSyncBulk() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<BulkSyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBulkSync = useCallback(async (users: User[]) => {
    setSyncing(true);
    setResult(null);
    setError(null);
    try {
      const response = await syncBulk(users);
      setResult(response);
    } catch (err) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Error en sincronización masiva');
    } finally {
      setSyncing(false);
    }
  }, []);

  const closeDialog = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { syncing, result, error, handleBulkSync, closeDialog };
}
