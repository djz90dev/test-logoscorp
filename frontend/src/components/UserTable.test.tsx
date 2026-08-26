import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { UserTable } from '../components/UserTable';
import type { User } from '../types';

const mockUsers: User[] = [
  {
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
  },
  {
    id: 2,
    name: 'Clementine',
    username: 'Clementine',
    email: 'clem@test.com',
    phone: '010-692-6593',
    website: 'anastasia.net',
    company: { name: 'Deckow-Crist', catchPhrase: '', bs: '' },
    normalizedPhone: '0106926593',
    normalizedWebsite: 'https://anastasia.net',
    isValidCompany: false,
  },
];

describe('UserTable', () => {
  it('renders users', () => {
    render(
      <UserTable
        users={mockUsers}
        selectedIds={[]}
        loading={false}
        error={null}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onSync={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText('Leanne Graham')).toBeInTheDocument();
    expect(screen.getByText('Clementine')).toBeInTheDocument();
  });

  it('shows loading skeleton', () => {
    render(
      <UserTable
        users={[]}
        selectedIds={[]}
        loading={true}
        error={null}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onSync={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows error state', () => {
    render(
      <UserTable
        users={[]}
        selectedIds={[]}
        loading={false}
        error="Failed to load"
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onSync={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText('Error al cargar usuarios')).toBeInTheDocument();
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(
      <UserTable
        users={[]}
        selectedIds={[]}
        loading={false}
        error={null}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onSync={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText('No se encontraron usuarios')).toBeInTheDocument();
  });

  it('disables sync button for invalid users', () => {
    render(
      <UserTable
        users={mockUsers}
        selectedIds={[]}
        loading={false}
        error={null}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onSync={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    const syncButtons = screen.getAllByLabelText(/Sync/);
    expect(syncButtons[0]).not.toBeDisabled();
    expect(syncButtons[1]).toBeDisabled();
  });

  it('disables checkbox for invalid users', () => {
    render(
      <UserTable
        users={mockUsers}
        selectedIds={[]}
        loading={false}
        error={null}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onSync={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).not.toBeDisabled();
    expect(checkboxes[1]).not.toBeDisabled();
    expect(checkboxes[2]).toBeDisabled();
  });

  it('select-all does not include invalid users', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <UserTable
        users={mockUsers}
        selectedIds={[]}
        loading={false}
        error={null}
        onSelect={onSelect}
        onEdit={vi.fn()}
        onSync={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    const selectAll = screen.getAllByRole('checkbox')[0];
    await user.click(selectAll);

    expect(onSelect).toHaveBeenCalledWith([1]);
  });

  it('calls onSelect when checkbox clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <UserTable
        users={mockUsers}
        selectedIds={[]}
        loading={false}
        error={null}
        onSelect={onSelect}
        onEdit={vi.fn()}
        onSync={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    expect(onSelect).toHaveBeenCalledWith([1]);
  });

  it('calls onEdit when edit button clicked', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();

    render(
      <UserTable
        users={mockUsers}
        selectedIds={[]}
        loading={false}
        error={null}
        onSelect={vi.fn()}
        onEdit={onEdit}
        onSync={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    const editButtons = screen.getAllByLabelText(/Edit/);
    await user.click(editButtons[0]);

    expect(onEdit).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('calls onRetry when retry button clicked', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <UserTable
        users={[]}
        selectedIds={[]}
        loading={false}
        error="Error"
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onSync={vi.fn()}
        onRetry={onRetry}
      />
    );

    await user.click(screen.getByText('Reintentar'));
    expect(onRetry).toHaveBeenCalled();
  });
});
