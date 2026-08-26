import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Skeleton,
  Typography,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SyncIcon from '@mui/icons-material/Sync';
import InboxIcon from '@mui/icons-material/Inbox';
import ErrorIcon from '@mui/icons-material/Error';
import { StatusChip } from './StatusChip';
import type { User } from '../types';

interface UserTableProps {
  users: User[];
  selectedIds: number[];
  loading: boolean;
  error: string | null;
  onSelect: (ids: number[]) => void;
  onEdit: (user: User) => void;
  onSync: (user: User) => void;
  onRetry: () => void;
}

export function UserTable({
  users,
  selectedIds,
  loading,
  error,
  onSelect,
  onEdit,
  onSync,
  onRetry,
}: UserTableProps) {
  const validUsers = users.filter((u) => u.isValidCompany);
  const allSelected = validUsers.length > 0 && selectedIds.length === validUsers.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < validUsers.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelect(validUsers.map((u) => u.id));
    } else {
      onSelect([]);
    }
  };

  const handleSelectOne = (userId: number, checked: boolean) => {
    if (checked) {
      onSelect([...selectedIds, userId]);
    } else {
      onSelect(selectedIds.filter((id) => id !== userId));
    }
  };

  if (loading) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell padding="checkbox">
                  <Skeleton variant="rectangular" width={24} height={24} />
                </TableCell>
                <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <Skeleton variant="text" width="70%" />
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <Skeleton variant="text" width="50%" />
                </TableCell>
                <TableCell><Skeleton variant="rectangular" width={60} height={24} /></TableCell>
                <TableCell>
                  <Skeleton variant="circular" width={32} height={32} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'grey.700' }}>
          Error al cargar usuarios
        </Typography>
        <Typography variant="body2" sx={{ color: 'grey.500', mb: 3 }}>
          {error}
        </Typography>
        <Box component="button" onClick={onRetry} sx={{
          border: '1px solid',
          borderColor: 'error.main',
          color: 'error.main',
          bgcolor: 'transparent',
          px: 3,
          py: 1,
          borderRadius: 1,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'error.main', color: 'white' },
        }}>
          Reintentar
        </Box>
      </Box>
    );
  }

  if (users.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <InboxIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'grey.700' }}>
          No se encontraron usuarios
        </Typography>
        <Typography variant="body2" sx={{ color: 'grey.500' }}>
          No hay contactos disponibles para sincronizar
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table stickyHeader aria-label="Contactos">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={someSelected}
                checked={allSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                slotProps={{ input: { 'aria-label': 'Select all valid contacts' } }}
              />
            </TableCell>
            <TableCell scope="col">Name</TableCell>
            <TableCell scope="col">Email</TableCell>
            <TableCell scope="col" sx={{ display: { xs: 'none', md: 'table-cell' } }}>Phone</TableCell>
            <TableCell scope="col" sx={{ display: { xs: 'none', md: 'table-cell' } }}>Company Name</TableCell>
            <TableCell scope="col">Estado</TableCell>
            <TableCell scope="col">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user, index) => (
            <TableRow
              key={user.id}
              hover
              aria-rowindex={index + 2}
              aria-selected={selectedIds.includes(user.id)}
              sx={{
                opacity: user.isValidCompany ? 1 : 0.5,
                bgcolor: user.isValidCompany ? 'inherit' : 'grey.50',
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedIds.includes(user.id)}
                  disabled={!user.isValidCompany}
                  onChange={(e) => handleSelectOne(user.id, e.target.checked)}
                  slotProps={{ input: { 'aria-label': `Select ${user.name}` } }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {user.name}
                </Typography>
                {!user.isValidCompany && (
                  <Typography variant="caption" sx={{ color: 'error' }}>
                    Empresa inválida
                  </Typography>
                )}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                {user.normalizedPhone}
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                {user.company.name}
              </TableCell>
              <TableCell>
                <StatusChip isValid={user.isValidCompany} />
              </TableCell>
              <TableCell>
                <IconButton
                  onClick={() => onEdit(user)}
                  aria-label={`Edit ${user.name}`}
                  size="small"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={() => onSync(user)}
                  disabled={!user.isValidCompany}
                  aria-label={`Sync ${user.name} with Zoho`}
                  size="small"
                >
                  <SyncIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
