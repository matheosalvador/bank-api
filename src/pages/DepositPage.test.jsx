import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { openAccount } from '../services/accounts';
import DepositPage from './DepositPage';
import AccountDetailPage from './AccountDetailPage';

function CurrentPath() {
  const location = useLocation();
  return <span data-testid="current-path">{location.pathname}</span>;
}

function renderDeposit(accountId) {
  return render(
    <MemoryRouter initialEntries={[`/accounts/${accountId}/deposit`]}>
      <Routes>
        <Route path="/accounts/:accountId/deposit" element={<DepositPage />} />
        <Route path="/accounts/:accountId" element={<AccountDetailPage />} />
      </Routes>
      <CurrentPath />
    </MemoryRouter>,
  );
}

describe('DepositPage', () => {
  afterEach(cleanup);

  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.setItem('noria_demo_email', 'demo@noria.fr');
  });

  it('rejects zero and returns to the selected account with its updated balance', async () => {
    const user = userEvent.setup();
    const account = openAccount('demo@noria.fr');
    renderDeposit(account.id);

    const amountInput = screen.getByLabelText('Montant du dépôt (€)');
    await user.type(amountInput, '0');
    fireEvent.submit(amountInput.closest('form'));

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Saisissez un montant positif avec au maximum deux décimales.',
    );
    expect(screen.getByTestId('current-path').textContent).toBe(`/accounts/${account.id}/deposit`);

    await user.clear(amountInput);
    await user.type(amountInput, '12.34');
    await user.click(screen.getByRole('button', { name: 'Confirmer le dépôt' }));

    await waitFor(() => {
      expect(screen.getByTestId('current-path').textContent).toBe(`/accounts/${account.id}`);
    });
    expect(screen.getByText((text) => text.includes('12,34'))).toBeTruthy();
  });
});
