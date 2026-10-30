const STORAGE_PREFIX = 'noria_demo_accounts:';
const BENEFICIARIES_STORAGE_PREFIX = 'noria_demo_beneficiaries:';

function getStorageKey(email) {
  if (!email) {
    throw new Error('Aucun utilisateur connecté.');
  }

  return `${STORAGE_PREFIX}${email}`;
}

function getBeneficiariesStorageKey(email) {
  if (!email) {
    throw new Error('Aucun utilisateur connecté.');
  }

  return `${BENEFICIARIES_STORAGE_PREFIX}${email}`;
}

function parseAccounts(storedAccounts) {
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
      || (
        account.transactions !== undefined
        && (
          !Array.isArray(account.transactions)
          || account.transactions.some((transaction) => (
            transaction === null
            || typeof transaction !== 'object'
            || typeof transaction.id !== 'string'
            || !Number.isSafeInteger(transaction.amountCents)
            || transaction.amountCents <= 0
            || typeof transaction.date !== 'string'
            || !Number.isFinite(Date.parse(transaction.date))
            || !['debit', 'credit'].includes(transaction.type)
            || (
              transaction.sourceAccountId !== null
              && typeof transaction.sourceAccountId !== 'string'
            )
            || typeof transaction.recipientAccountId !== 'string'
            || (
              transaction.sourceLabel !== undefined
              && typeof transaction.sourceLabel !== 'string'
            )
          ))
        )
      )
    ))
  ) {
    throw new Error('Les données des comptes enregistrés sont invalides.');
  }

  return accounts.map((account) => ({
    ...account,
    transactions: account.transactions || [],
  }));
}

export function getAccounts(email) {
  const storageKey = getStorageKey(email);
  let storedAccounts;
  try {
    storedAccounts = window.localStorage.getItem(storageKey);
  } catch {
    throw new Error('Impossible de lire les comptes enregistrés dans ce navigateur.');
  }
  return parseAccounts(storedAccounts);
}

export function getAccount(email, accountId) {
  const account = getAccounts(email).find((item) => item.id === accountId);
  if (!account) {
    throw new Error('Ce compte est introuvable.');
  }

  return account;
}

export function getTransactions(email, accountId) {
  return getAccount(email, accountId).transactions
    .map((transaction, index) => ({ transaction, index }))
    .sort((first, second) => (
      Date.parse(second.transaction.date) - Date.parse(first.transaction.date)
      || second.index - first.index
    ))
    .map(({ transaction }) => transaction);
}

export function openAccount(email) {
  const accounts = getAccounts(email);
  const storageKey = getStorageKey(email);
  const account = {
    id: `NOR-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    label: 'Compte courant',
    balanceCents: 0,
    openedAt: new Date().toISOString(),
    transactions: [],
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

export function depositIntoAccount(email, accountId, amountCents) {
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) {
    throw new Error('Le montant du dépôt doit être positif.');
  }

  const accounts = getAccounts(email);
  const accountIndex = accounts.findIndex((account) => account.id === accountId);
  if (accountIndex === -1) {
    throw new Error('Ce compte est introuvable.');
  }

  const updatedBalance = accounts[accountIndex].balanceCents + amountCents;
  if (!Number.isSafeInteger(updatedBalance)) {
    throw new Error('Le solde du compte dépasse la limite autorisée.');
  }

  const account = accounts[accountIndex];
  const transaction = {
    id: `TX-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    amountCents,
    date: new Date().toISOString(),
    sourceAccountId: null,
    sourceLabel: 'Dépôt externe',
    recipientAccountId: accountId,
    type: 'credit',
  };
  const updatedAccount = {
    ...account,
    balanceCents: updatedBalance,
    transactions: [...account.transactions, transaction],
  };
  accounts[accountIndex] = updatedAccount;

  try {
    window.localStorage.setItem(getStorageKey(email), JSON.stringify(accounts));
  } catch {
    throw new Error('Impossible d’enregistrer le dépôt dans ce navigateur.');
  }

  return updatedAccount;
}

export function getBeneficiaries(email) {
  const storageKey = getBeneficiariesStorageKey(email);
  let storedBeneficiaries;
  try {
    storedBeneficiaries = window.localStorage.getItem(storageKey);
  } catch {
    throw new Error('Impossible de lire les bénéficiaires enregistrés dans ce navigateur.');
  }

  if (!storedBeneficiaries) {
    return [];
  }

  let beneficiaries;
  try {
    beneficiaries = JSON.parse(storedBeneficiaries);
  } catch {
    throw new Error('Les bénéficiaires enregistrés sont illisibles.');
  }

  if (
    !Array.isArray(beneficiaries)
    || beneficiaries.some((beneficiary) => (
      beneficiary === null
      || typeof beneficiary !== 'object'
      || typeof beneficiary.name !== 'string'
      || !beneficiary.name.trim()
      || typeof beneficiary.accountId !== 'string'
      || !beneficiary.accountId.trim()
    ))
  ) {
    throw new Error('Les bénéficiaires enregistrés sont invalides.');
  }

  return beneficiaries;
}

export function saveBeneficiary(email, name, accountId) {
  if (typeof name !== 'string' || typeof accountId !== 'string') {
    throw new Error('Saisissez le nom et le numéro de compte du bénéficiaire.');
  }

  const normalizedName = name.trim();
  const normalizedAccountId = accountId.trim();
  if (!normalizedName || !normalizedAccountId) {
    throw new Error('Saisissez le nom et le numéro de compte du bénéficiaire.');
  }

  const beneficiaries = getBeneficiaries(email);
  const existingBeneficiary = beneficiaries.find(
    (beneficiary) => beneficiary.accountId === normalizedAccountId,
  );
  const beneficiary = { name: normalizedName, accountId: normalizedAccountId };
  const nextBeneficiaries = existingBeneficiary
    ? beneficiaries.map((item) => (
      item.accountId === normalizedAccountId ? beneficiary : item
    ))
    : [...beneficiaries, beneficiary];

  try {
    window.localStorage.setItem(
      getBeneficiariesStorageKey(email),
      JSON.stringify(nextBeneficiaries),
    );
  } catch {
    throw new Error('Impossible d’enregistrer le bénéficiaire dans ce navigateur.');
  }

  return beneficiary;
}

function findAccountLocations(accountId) {
  const matches = [];
  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const storageKey = window.localStorage.key(index);
      if (!storageKey || !storageKey.startsWith(STORAGE_PREFIX)) {
        continue;
      }

      const storedAccounts = window.localStorage.getItem(storageKey);
      const accounts = parseAccounts(storedAccounts);
      const accountIndex = accounts.findIndex((account) => account.id === accountId);
      if (accountIndex !== -1) {
        matches.push({
          email: storageKey.slice(STORAGE_PREFIX.length),
          accounts,
          accountIndex,
        });
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Les données des comptes')) {
      throw error;
    }
    throw new Error('Impossible de vérifier les comptes destinataires dans ce navigateur.');
  }

  if (matches.length > 1) {
    throw new Error('Ce numéro de compte correspond à plusieurs comptes.');
  }
  return matches[0] || null;
}

export function transferBetweenAccounts(email, sourceAccountId, recipientAccountId, amountCents) {
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) {
    throw new Error('Le montant du virement doit être positif.');
  }

  const sourceAccounts = getAccounts(email);
  const sourceIndex = sourceAccounts.findIndex((account) => account.id === sourceAccountId);
  if (sourceIndex === -1) {
    throw new Error('Le compte source est introuvable.');
  }

  if (typeof recipientAccountId !== 'string') {
    throw new Error('Saisissez le numéro du compte destinataire.');
  }
  const normalizedRecipientId = recipientAccountId.trim();
  if (!normalizedRecipientId) {
    throw new Error('Saisissez le numéro du compte destinataire.');
  }
  if (sourceAccountId === normalizedRecipientId) {
    throw new Error('Le compte destinataire doit être différent du compte source.');
  }

  const recipientLocation = findAccountLocations(normalizedRecipientId);
  if (!recipientLocation) {
    throw new Error('Le compte destinataire est introuvable.');
  }

  const sourceAccount = sourceAccounts[sourceIndex];
  if (sourceAccount.balanceCents < amountCents) {
    throw new Error('Solde insuffisant pour effectuer ce virement.');
  }

  const recipientAccount = recipientLocation.accounts[recipientLocation.accountIndex];
  const updatedSourceBalance = sourceAccount.balanceCents - amountCents;
  const updatedRecipientBalance = recipientAccount.balanceCents + amountCents;
  if (!Number.isSafeInteger(updatedSourceBalance) || !Number.isSafeInteger(updatedRecipientBalance)) {
    throw new Error('Le solde d’un compte dépasse la limite autorisée.');
  }

  const nextSourceAccounts = [...sourceAccounts];
  const transactionId = `TX-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const transactionDate = new Date().toISOString();
  const transaction = {
    id: transactionId,
    amountCents,
    date: transactionDate,
    sourceAccountId,
    recipientAccountId: normalizedRecipientId,
  };
  nextSourceAccounts[sourceIndex] = {
    ...sourceAccount,
    balanceCents: updatedSourceBalance,
    transactions: [
      ...sourceAccount.transactions,
      { ...transaction, type: 'debit' },
    ],
  };

  if (recipientLocation.email === email) {
    nextSourceAccounts[recipientLocation.accountIndex] = {
      ...recipientAccount,
      balanceCents: updatedRecipientBalance,
      transactions: [
        ...recipientAccount.transactions,
        { ...transaction, type: 'credit' },
      ],
    };
    try {
      window.localStorage.setItem(getStorageKey(email), JSON.stringify(nextSourceAccounts));
    } catch {
      throw new Error('Impossible d’enregistrer le virement dans ce navigateur.');
    }
  } else {
    const nextRecipientAccounts = [...recipientLocation.accounts];
    nextRecipientAccounts[recipientLocation.accountIndex] = {
      ...recipientAccount,
      balanceCents: updatedRecipientBalance,
      transactions: [
        ...recipientAccount.transactions,
        { ...transaction, type: 'credit' },
      ],
    };
    const sourceStorageKey = getStorageKey(email);
    const recipientStorageKey = getStorageKey(recipientLocation.email);
    let previousRecipientData;
    let recipientWasUpdated = false;
    try {
      previousRecipientData = window.localStorage.getItem(recipientStorageKey);
      window.localStorage.setItem(recipientStorageKey, JSON.stringify(nextRecipientAccounts));
      recipientWasUpdated = true;
      window.localStorage.setItem(sourceStorageKey, JSON.stringify(nextSourceAccounts));
    } catch {
      if (recipientWasUpdated) {
        try {
          if (previousRecipientData === null) {
            window.localStorage.removeItem(recipientStorageKey);
          } else {
            window.localStorage.setItem(recipientStorageKey, previousRecipientData);
          }
        } catch {
          throw new Error('Le virement a échoué et les soldes n’ont pas pu être rétablis.');
        }
      }
      throw new Error('Impossible d’enregistrer le virement dans ce navigateur.');
    }
  }

  return {
    sourceAccount: nextSourceAccounts[sourceIndex],
    recipientAccount: {
      ...recipientAccount,
      balanceCents: updatedRecipientBalance,
      transactions: [
        ...recipientAccount.transactions,
        { ...transaction, type: 'credit' },
      ],
    },
  };
}
