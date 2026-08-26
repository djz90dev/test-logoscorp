import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  CircularProgress,
  Paper,
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import { UserTable } from '../components/UserTable';
import { EditUserDialog } from '../components/EditUserDialog';
import { BulkSyncDialog } from '../components/BulkSyncDialog';
import { FeedbackSnackbar } from '../components/FeedbackSnackbar';
import { useUsers } from '../hooks/useUsers';
import { useSyncUser } from '../hooks/useSyncUser';
import { useSyncBulk } from '../hooks/useSyncBulk';
import { isValidCompany } from '../utils/isValidCompany';
import type { User } from '../types';

export function UsersPage() {
  const { users, loading, error, refetch, updateUser } = useUsers();
  const { feedback, handleSync, closeFeedback } = useSyncUser();
  const { syncing: syncingBulk, result: bulkResult, error: bulkError, handleBulkSync, closeDialog: closeBulkDialog } = useSyncBulk();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditDialogOpen(true);
  };

  const handleSave = async (user: User) => {
    setEditDialogOpen(false);
    updateUser(user);
    if (!isValidCompany(user.company.name)) {
      setSelectedIds((prev) => prev.filter((id) => id !== user.id));
    }
    await handleSync(user);
  };

  const handleBulkClick = () => {
    const selectedUsers = users.filter((u) => selectedIds.includes(u.id));
    if (selectedUsers.length > 0) {
      handleBulkSync(selectedUsers);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="fixed" elevation={4}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1 }}
            aria-label="Zoho Contact Sync"
          >
            Zoho Contact Sync
          </Typography>
          <Button
            color="inherit"
            startIcon={syncingBulk ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
            onClick={handleBulkClick}
            disabled={selectedIds.length === 0 || syncingBulk}
            aria-label={`Sincronizar ${selectedIds.length} contactos seleccionados`}
          >
            Sincronizar Seleccionados ({selectedIds.length})
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'grey.600' }}>
            Administra y sincroniza contactos con Zoho CRM. Selecciona usuarios válidos para sincronizar.
          </Typography>
        </Paper>

        <UserTable
          users={users}
          selectedIds={selectedIds}
          loading={loading}
          error={error}
          onSelect={setSelectedIds}
          onEdit={handleEdit}
          onSync={handleSync}
          onRetry={refetch}
        />
      </Container>

      <EditUserDialog
        open={editDialogOpen}
        user={editingUser}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleSave}
      />

      <BulkSyncDialog
        open={syncingBulk || !!bulkResult || !!bulkError}
        syncing={syncingBulk}
        result={bulkResult}
        error={bulkError}
        onClose={closeBulkDialog}
      />

      <FeedbackSnackbar
        open={feedback.open}
        severity={feedback.severity}
        message={feedback.message}
        onClose={closeFeedback}
      />
    </Box>
  );
}
