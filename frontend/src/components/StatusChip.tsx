import { Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CircularProgress from '@mui/material/CircularProgress';

interface StatusChipProps {
  isValid: boolean;
  syncStatus?: 'pending' | 'syncing' | 'success' | 'error';
}

export function StatusChip({ isValid, syncStatus }: StatusChipProps) {
  if (!isValid) {
    return (
      <Chip
        label="Inválido"
        color="error"
        size="small"
        icon={<WarningIcon />}
        aria-label="Company invalid"
      />
    );
  }

  if (syncStatus === 'syncing') {
    return (
      <Chip
        label="Sincronizando"
        color="info"
        size="small"
        icon={<CircularProgress size={14} />}
      />
    );
  }

  if (syncStatus === 'success') {
    return (
      <Chip
        label="Sincronizado"
        color="success"
        size="small"
        icon={<CheckCircleIcon />}
      />
    );
  }

  if (syncStatus === 'error') {
    return (
      <Chip
        label="Error"
        color="error"
        size="small"
        icon={<ErrorIcon />}
      />
    );
  }

  return (
    <Chip
      label="Válido"
      color="success"
      size="small"
      variant="outlined"
    />
  );
}
