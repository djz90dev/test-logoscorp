import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { User } from '../types';

interface EditUserDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  website: string;
  companyName: string;
}

export function EditUserDialog({ open, user, onClose, onSave }: EditUserDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    website: '',
    companyName: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.normalizedPhone,
        website: user.normalizedWebsite,
        companyName: user.company.name,
      });
      setErrors({});
    }
  }, [user]);

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name es requerido (mín. 2 caracteres)';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone || !/^\d+$/.test(formData.phone)) {
      newErrors.phone = 'Solo dígitos permitidos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;

    onSave({
      ...user,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      normalizedPhone: formData.phone,
      website: formData.website,
      normalizedWebsite: formData.website,
      company: { ...user.company, name: formData.companyName },
    });
  };

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-dialog-title"
    >
      <DialogTitle id="edit-dialog-title">
        Editar Contacto
        <IconButton
          onClick={onClose}
          aria-label="Close dialog"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <form id="edit-form" onSubmit={handleSubmit}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={handleChange('name')}
              required
              fullWidth
              error={!!errors.name}
              helperText={errors.name}
              slotProps={{ htmlInput: { 'aria-label': 'Name' } }}
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
              fullWidth
              error={!!errors.email}
              helperText={errors.email}
              slotProps={{ htmlInput: { 'aria-label': 'Email' } }}
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={handleChange('phone')}
              required
              fullWidth
              error={!!errors.phone}
              helperText={errors.phone || 'Solo dígitos'}
              slotProps={{ htmlInput: { 'aria-label': 'Phone' } }}
            />
            <TextField
              label="Website"
              value={formData.website}
              onChange={handleChange('website')}
              fullWidth
              slotProps={{ htmlInput: { 'aria-label': 'Website' } }}
            />
            <TextField
              label="Company Name"
              value={formData.companyName}
              onChange={handleChange('companyName')}
              fullWidth
              slotProps={{ htmlInput: { 'aria-label': 'Company Name' } }}
            />
          </Stack>
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button type="submit" form="edit-form" variant="contained" color="primary">
          Guardar y Enviar a CRM
        </Button>
      </DialogActions>
    </Dialog>
  );
}
