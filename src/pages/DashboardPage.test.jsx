import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { getAccounts } from '../services/accounts';
import { getAuthEmail } from '../services/demoAuth';
import DashboardPage from './DashboardPage';

vi.mock('../services/accounts', () => ({
  getAccounts: vi.fn(),
}));

vi.mock('../services/demoAuth', () => ({
  getAuthEmail: vi.fn(),
  logout: vi.fn(),
}));

describe('DashboardPage', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.mocked(getAccounts).mockReset();
    vi.mocked(getAuthEmail).mockReturnValue('demo@noria.fr');
  });

  it('shows the signed-in email, account count, calculated balance, and account links', () => {
    vi.mocked(getAccounts).mockReturnValue([
      { id: 'NOR-1', label: 'Compte courant', balanceCents: 200000, openedAt: '2026-01-01' },
      { id: 'NOR-2', label: 'Compte courant', balanceCents: 175050, openedAt: '2026-01-02' },
    ]);

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('demo@noria.fr')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(document.querySelector('.summary-card-balance .summary-value').textContent)
      .toBe(new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(3750.5));
    expect(screen.getByRole('link', { name: 'Voir la liste de mes comptes' }).getAttribute('href'))
      .toBe('/accounts');
    expect(screen.getByRole('link', { name: 'Ouvrir un nouveau compte' }).getAttribute('href'))
      .toBe('/accounts/new');
  });
});
