import { beforeEach, describe, expect, it } from 'vitest';
import {
  depositIntoAccount,
  getAccount,
  getAccounts,
  openAccount,
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
});
