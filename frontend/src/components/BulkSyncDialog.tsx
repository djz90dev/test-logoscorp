import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import type { BulkSyncResult } from '../types';

interface BulkSyncDialogProps {
  open: boolean;
  syncing: boolean;
  result: BulkSyncResult | null;
  error: string | null;
  onClose: () => void;
}

export function BulkSyncDialog({
  open,
  syncing,
  result,
  error,
  onClose,
}: BulkSyncDialogProps) {
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Resultado de Sincronización</DialogTitle>

      <DialogContent dividers>
        {syncing && (
          <Stack sx={{ alignItems: 'center', spacing: 2, py: 4 }}>
            <CircularProgress />
            <Typography>Sincronizando contactos...</Typography>
          </Stack>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Stack spacing={2}>
            <Alert severity={result.failed > 0 ? 'warning' : 'success'}>
              Sincronización completada
            </Alert>

            <Stack sx={{ direction: 'row', spacing: 4, justifyContent: 'center', py: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4">{result.total}</Typography>
                <Typography variant="caption">Total</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: 'success.main' }}>{result.successful}</Typography>
                <Typography variant="caption">Exitosos</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: 'error.main' }}>{result.failed}</Typography>
                <Typography variant="caption">Fallidos</Typography>
              </Box>
            </Stack>

            <Divider />

            <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
              {result.results.map((r) => (
                <ListItem key={r.userId}>
                  <ListItemIcon>
                    {r.success ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <ErrorIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={`Usuario #${r.userId}`}
                    secondary={r.error?.message || 'Sincronizado correctamente'}
                  />
                </ListItem>
              ))}
            </List>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={syncing}>
          {syncing ? 'Cancelando...' : 'Cerrar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
