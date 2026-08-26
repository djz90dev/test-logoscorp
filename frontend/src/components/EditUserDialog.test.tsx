import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { EditUserDialog } from '../components/EditUserDialog';
import type { User } from '../types';

const mockUser: User = {
  id: 1,
  name: 'Leanne Graham',
  username: 'Bret',
  email: 'Sincere@april.biz',
  phone: '1-770-736-803164',
  website: 'hildegard.org',
  company: { name: 'Romaguera-Crona', catchPhrase: '', bs: '' },
  normalizedPhone: '1770736803164',
  normalizedWebsite: 'https://hildegard.org',
  isValidCompany: true,
};

describe('EditUserDialog', () => {
  it('renders when open', () => {
    render(
      <EditUserDialog
        open={true}
        user={mockUser}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByText('Editar Contacto')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <EditUserDialog
        open={false}
        user={mockUser}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    expect(screen.queryByText('Editar Contacto')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <EditUserDialog
        open={true}
        user={mockUser}
        onClose={onClose}
        onSave={vi.fn()}
      />
    );

    await user.click(screen.getByText('Cancelar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();

    render(
      <EditUserDialog
        open={true}
        user={mockUser}
        onClose={vi.fn()}
        onSave={onSave}
      />
    );

    const nameInput = screen.getAllByRole('textbox')[0];
    await user.clear(nameInput);

    await user.click(screen.getByText('Guardar y Enviar a CRM'));

    expect(onSave).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();

    render(
      <EditUserDialog
        open={true}
        user={mockUser}
        onClose={vi.fn()}
        onSave={onSave}
      />
    );

    const emailInput = screen.getAllByRole('textbox')[1];
    await user.clear(emailInput);
    await user.type(emailInput, 'invalid');

    await user.click(screen.getByText('Guardar y Enviar a CRM'));

    expect(onSave).not.toHaveBeenCalled();
  });

  it('validates phone digits only', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();

    render(
      <EditUserDialog
        open={true}
        user={mockUser}
        onClose={vi.fn()}
        onSave={onSave}
      />
    );

    const phoneInput = screen.getAllByRole('textbox')[2];
    await user.clear(phoneInput);
    await user.type(phoneInput, 'abc');

    await user.click(screen.getByText('Guardar y Enviar a CRM'));

    expect(onSave).not.toHaveBeenCalled();
  });
});
