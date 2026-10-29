import { beforeEach, describe, expect, it } from 'vitest';
import { getAccounts, openAccount } from './accounts';

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
});
