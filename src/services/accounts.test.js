import { beforeEach, describe, expect, it } from 'vitest';
import {
  depositIntoAccount,
  getBeneficiaries,
  getAccount,
  getAccounts,
  getTransactions,
  openAccount,
  saveBeneficiary,
  transferBetweenAccounts,
} from './accounts';

describe('accounts', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts with no accounts and stores newly opened accounts locally', () => {
    expect(getAccounts('demo@noria.fr')).toEqual([]);

    const account = openAccount('demo@noria.fr');

    expect(account.balanceCents).toBe(0);
    expect(getAccounts('demo@noria.fr')).toEqual([account]);
  });

  it('keeps accounts separate for each email address', () => {
    openAccount('demo@noria.fr');

    expect(getAccounts('other@noria.fr')).toEqual([]);
  });

  it('reports unreadable stored account data', () => {
    window.localStorage.setItem('noria_demo_accounts:demo@noria.fr', '{');

    expect(() => getAccounts('demo@noria.fr')).toThrow(
      'Les données des comptes enregistrés sont illisibles.',
    );
  });

  it('deposits an exact amount into the selected account and persists the new balance', () => {
    const account = openAccount('demo@noria.fr');
    const otherAccount = openAccount('demo@noria.fr');

    const updatedAccount = depositIntoAccount('demo@noria.fr', account.id, 1234);

    expect(updatedAccount.balanceCents).toBe(1234);
    expect(getAccount('demo@noria.fr', account.id).balanceCents).toBe(1234);
    expect(getAccount('demo@noria.fr', otherAccount.id).balanceCents).toBe(0);
    expect(getTransactions('demo@noria.fr', account.id)).toMatchObject([
      {
        amountCents: 1234,
        sourceAccountId: null,
        sourceLabel: 'Dépôt externe',
        recipientAccountId: account.id,
        type: 'credit',
      },
    ]);
  });

  it('rejects invalid deposits and unknown accounts', () => {
    const account = openAccount('demo@noria.fr');

    expect(() => depositIntoAccount('demo@noria.fr', account.id, 0)).toThrow(
      'Le montant du dépôt doit être positif.',
    );
    expect(() => depositIntoAccount('demo@noria.fr', 'unknown', 100)).toThrow(
      'Ce compte est introuvable.',
    );
  });

  it('transfers money between accounts and rejects invalid destinations or insufficient funds', () => {
    const source = openAccount('demo@noria.fr');
    const recipient = openAccount('other@noria.fr');
    depositIntoAccount('demo@noria.fr', source.id, 5000);

    const result = transferBetweenAccounts('demo@noria.fr', source.id, recipient.id, 1250);

    expect(result.sourceAccount.balanceCents).toBe(3750);
    expect(result.recipientAccount.balanceCents).toBe(1250);
    expect(getAccount('demo@noria.fr', source.id).balanceCents).toBe(3750);
    expect(getAccount('other@noria.fr', recipient.id).balanceCents).toBe(1250);
    const sourceTransactions = getTransactions('demo@noria.fr', source.id);
    const recipientTransactions = getTransactions('other@noria.fr', recipient.id);
    expect(sourceTransactions).toHaveLength(2);
    expect(sourceTransactions[0]).toMatchObject({
      amountCents: 1250,
      sourceAccountId: source.id,
      recipientAccountId: recipient.id,
      type: 'debit',
    });
    expect(recipientTransactions).toHaveLength(1);
    expect(recipientTransactions[0]).toMatchObject({
      id: sourceTransactions[0].id,
      amountCents: 1250,
      sourceAccountId: source.id,
      recipientAccountId: recipient.id,
      type: 'credit',
    });
    expect(() => transferBetweenAccounts('demo@noria.fr', source.id, 'unknown', 100))
      .toThrow('Le compte destinataire est introuvable.');
    expect(() => transferBetweenAccounts('demo@noria.fr', source.id, recipient.id, 4000))
      .toThrow('Solde insuffisant pour effectuer ce virement.');
  });

  it('saves and updates a beneficiary without duplicating its account number', () => {
    const account = openAccount('demo@noria.fr');

    saveBeneficiary('demo@noria.fr', 'Alex', account.id);
    saveBeneficiary('demo@noria.fr', 'Alex Martin', account.id);

    expect(getBeneficiaries('demo@noria.fr')).toEqual([
      { name: 'Alex Martin', accountId: account.id },
    ]);
  });
});
