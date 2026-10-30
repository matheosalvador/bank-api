const STORAGE_PREFIX = 'noria_demo_accounts:';

function getStorageKey(email) {
  if (!email) {
    throw new Error('Aucun utilisateur connecté.');
  }

  return `${STORAGE_PREFIX}${email}`;
}

export function getAccounts(email) {
  const storageKey = getStorageKey(email);
  let storedAccounts;
  try {
    storedAccounts = window.localStorage.getItem(storageKey);
  } catch {
    throw new Error('Impossible de lire les comptes enregistrés dans ce navigateur.');
  }

  if (!storedAccounts) {
    return [];
  }

  let accounts;
  try {
    accounts = JSON.parse(storedAccounts);
  } catch {
    throw new Error('Les données des comptes enregistrés sont illisibles.');
  }

  if (
    !Array.isArray(accounts)
    || accounts.some((account) => (
      account === null
      || typeof account !== 'object'
      || typeof account.id !== 'string'
      || typeof account.label !== 'string'
      || typeof account.openedAt !== 'string'
      || !Number.isFinite(Date.parse(account.openedAt))
      || !Number.isInteger(account.balanceCents)
    ))
  ) {
    throw new Error('Les données des comptes enregistrés sont invalides.');
  }

  return accounts;
}

export function openAccount(email) {
  const accounts = getAccounts(email);
  const storageKey = getStorageKey(email);
  const account = {
    id: `NOR-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    label: 'Compte courant',
    balanceCents: 0,
    openedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify([...accounts, account]),
    );
  } catch {
    throw new Error('Impossible d’enregistrer le nouveau compte dans ce navigateur.');
  }

  return account;
}
