import { useState, useEffect, useCallback } from 'react';
import { fetchUsers } from '../services/api';
import { isValidCompany } from '../utils/isValidCompany';
import type { User } from '../types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchUsers();
      setUsers(response.data);
    } catch (err) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const updateUser = useCallback((updated: User) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === updated.id
          ? { ...updated, isValidCompany: isValidCompany(updated.company.name) }
          : u
      )
    );
  }, []);

  return { users, loading, error, refetch: loadUsers, updateUser };
}
