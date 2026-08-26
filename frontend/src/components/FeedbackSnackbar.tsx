import { Snackbar, Alert } from '@mui/material';

interface FeedbackSnackbarProps {
  open: boolean;
  severity: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose: () => void;
}

export function FeedbackSnackbar({
  open,
  severity,
  message,
  onClose,
}: FeedbackSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
