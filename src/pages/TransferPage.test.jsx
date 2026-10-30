import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  depositIntoAccount,
  getAccount,
  getBeneficiaries,
  openAccount,
} from '../services/accounts';
import TransferPage from './TransferPage';

function renderTransfer() {
  return render(
    <MemoryRouter initialEntries={['/transfers']}>
      <Routes>
        <Route path="/transfers" element={<TransferPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('TransferPage', () => {
  afterEach(cleanup);

  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.setItem('noria_demo_email', 'demo@noria.fr');
  });

  it('saves a beneficiary, transfers money, and refreshes the source balance', async () => {
    const user = userEvent.setup();
    const source = openAccount('demo@noria.fr');
    const recipient = openAccount('other@noria.fr');
    depositIntoAccount('demo@noria.fr', source.id, 5000);
    renderTransfer();

    await user.selectOptions(screen.getByLabelText('Compte source'), source.id);
    await user.type(screen.getByLabelText('Numéro du compte destinataire'), recipient.id);
    await user.type(screen.getByLabelText('Nom du bénéficiaire'), 'Alex');
    await user.click(screen.getByRole('button', { name: 'Enregistrer ce bénéficiaire' }));

    expect(getBeneficiaries('demo@noria.fr')).toEqual([
      { name: 'Alex', accountId: recipient.id },
    ]);

    await user.selectOptions(screen.getByLabelText('Bénéficiaire enregistré'), recipient.id);
    await user.type(screen.getByLabelText('Montant (€)'), '12.50');
    await user.click(screen.getByRole('button', { name: 'Confirmer le virement' }));

    expect((await screen.findByRole('status')).textContent).toContain('Le virement a été effectué.');
    expect(getAccount('demo@noria.fr', source.id).balanceCents).toBe(3750);
    expect(getAccount('other@noria.fr', recipient.id).balanceCents).toBe(1250);
    expect(screen.getByLabelText('Compte source').selectedOptions[0].textContent)
      .toContain('37,50');
  });

  it('shows an error when the transfer exceeds the source balance', async () => {
    const user = userEvent.setup();
    const source = openAccount('demo@noria.fr');
    const recipient = openAccount('other@noria.fr');
    renderTransfer();

    await user.selectOptions(screen.getByLabelText('Compte source'), source.id);
    await user.type(screen.getByLabelText('Numéro du compte destinataire'), recipient.id);
    await user.type(screen.getByLabelText('Montant (€)'), '1');
    await user.click(screen.getByRole('button', { name: 'Confirmer le virement' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Solde insuffisant');
    expect(getAccount('demo@noria.fr', source.id).balanceCents).toBe(0);
  });
});
