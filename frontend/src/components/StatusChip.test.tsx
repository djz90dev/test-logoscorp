import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusChip } from '../components/StatusChip';

describe('StatusChip', () => {
  it('shows invalid for invalid company', () => {
    render(<StatusChip isValid={false} />);
    expect(screen.getByText('Inválido')).toBeInTheDocument();
  });

  it('shows valid for valid company', () => {
    render(<StatusChip isValid={true} />);
    expect(screen.getByText('Válido')).toBeInTheDocument();
  });

  it('shows syncing status', () => {
    render(<StatusChip isValid={true} syncStatus="syncing" />);
    expect(screen.getByText('Sincronizando')).toBeInTheDocument();
  });

  it('shows success status', () => {
    render(<StatusChip isValid={true} syncStatus="success" />);
    expect(screen.getByText('Sincronizado')).toBeInTheDocument();
  });

  it('shows error status', () => {
    render(<StatusChip isValid={true} syncStatus="error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
