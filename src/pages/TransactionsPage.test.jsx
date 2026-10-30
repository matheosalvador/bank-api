import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import {
  depositIntoAccount,
  openAccount,
  transferBetweenAccounts,
} from '../services/accounts';
import TransactionsPage from './TransactionsPage';

function renderTransactions(accountId) {
  return render(
    <MemoryRouter initialEntries={[`/accounts/${accountId}/transactions`]}>
      <Routes>
        <Route
          path="/accounts/:accountId/transactions"
          element={<TransactionsPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('TransactionsPage', () => {
  afterEach(cleanup);

  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.setItem('noria_demo_email', 'demo@noria.fr');
  });

  it('shows an explicit empty state when the account has no transactions', () => {
    const account = openAccount('demo@noria.fr');
    renderTransactions(account.id);

    expect(screen.getByText('Aucune transaction pour ce compte.')).toBeTruthy();
  });

  it('shows transaction details newest first and derives the type for the viewed account', () => {
    const userAccount = openAccount('demo@noria.fr');
    const recipientAccount = openAccount('other@noria.fr');
    depositIntoAccount('demo@noria.fr', userAccount.id, 5000);
    transferBetweenAccounts('demo@noria.fr', userAccount.id, recipientAccount.id, 1250);

    renderTransactions(userAccount.id);

    const transactionTypes = screen.getAllByText(/Débit|Crédit/);
    expect(transactionTypes[0].textContent).toBe('Débit');
    expect(transactionTypes[1].textContent).toBe('Crédit');
    expect(screen.getAllByText(userAccount.id)).toHaveLength(2);
    expect(screen.getByText(recipientAccount.id)).toBeTruthy();
    expect(screen.getByText('Dépôt externe')).toBeTruthy();
    expect(screen.getByText(/−.*12,50/)).toBeTruthy();
    expect(screen.getByText(/\+.*50,00/)).toBeTruthy();
  });

  it('shows the same transfer as a credit on the recipient account', () => {
    const sourceAccount = openAccount('demo@noria.fr');
    const recipientAccount = openAccount('other@noria.fr');
    depositIntoAccount('demo@noria.fr', sourceAccount.id, 5000);
    transferBetweenAccounts('demo@noria.fr', sourceAccount.id, recipientAccount.id, 1250);
    window.sessionStorage.setItem('noria_demo_email', 'other@noria.fr');

    renderTransactions(recipientAccount.id);

    expect(screen.getByText('Crédit')).toBeTruthy();
    expect(screen.getByText(sourceAccount.id)).toBeTruthy();
    expect(screen.getByText(recipientAccount.id)).toBeTruthy();
  });
});
