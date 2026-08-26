import { useState, useCallback } from 'react';
import { syncUser } from '../services/api';
import type { User } from '../types';

export function useSyncUser() {
  const [syncing, setSyncing] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    open: boolean;
    severity: 'success' | 'error';
    message: string;
  }>({ open: false, severity: 'success', message: '' });

  const handleSync = useCallback(async (user: User) => {
    setSyncing(user.id);
    try {
      const result = await syncUser(user);
      if (result.success) {
        setFeedback({
          open: true,
          severity: 'success',
          message: `Contacto "${user.name}" sincronizado correctamente`,
        });
      } else {
        setFeedback({
          open: true,
          severity: 'error',
          message: result.error?.message || 'Error al sincronizar contacto',
        });
      }
    } catch (err) {
      const apiError = err as { message?: string };
      setFeedback({
        open: true,
        severity: 'error',
        message: apiError.message || 'Error al sincronizar contacto',
      });
    } finally {
      setSyncing(null);
    }
  }, []);

  const closeFeedback = useCallback(() => {
    setFeedback((prev) => ({ ...prev, open: false }));
  }, []);

  return { syncing, feedback, handleSync, closeFeedback };
}
