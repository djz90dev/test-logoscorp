import { useState, useCallback } from 'react';
import { syncUser } from '../services/api';
import type { User } from '../types';

function getSyncSuccessMessage(operation?: string): string {
  if (operation === 'updated') return 'Contacto actualizado en Zoho CRM.';
  return 'Contacto creado en Zoho CRM.';
}

function getSyncErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'CONTACT_ALREADY_EXISTS':
      return 'Conflicto: el contacto ya existe por otro campo.';
    case 'SIMULATED_ERROR':
      return 'No se pudo sincronizar este contacto.';
    default:
      return 'Error al sincronizar contacto.';
  }
}

export function useSyncUser() {
  const [syncing, setSyncing] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    open: boolean;
    severity: 'success' | 'error' | 'warning';
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
          message: getSyncSuccessMessage(result.data?.operation),
        });
      } else {
        const errorCode = result.error?.code || 'UNKNOWN';
        const severity = errorCode === 'CONTACT_ALREADY_EXISTS' ? 'warning' : 'error';
        setFeedback({
          open: true,
          severity,
          message: getSyncErrorMessage(errorCode),
        });
      }
    } catch (err) {
      const apiError = err as { message?: string };
      setFeedback({
        open: true,
        severity: 'error',
        message: apiError.message || 'Error al sincronizar contacto.',
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
