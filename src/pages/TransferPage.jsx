import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import {
  getAccounts,
  getBeneficiaries,
  saveBeneficiary,
  transferBetweenAccounts,
} from '../services/accounts';
import { getAuthEmail, logout } from '../services/demoAuth';

const euroFormat = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

function parseAmountInCents(value) {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const euros = Number(match[1]);
  const cents = Number((match[2] || '').padEnd(2, '0'));
  const amountCents = euros * 100 + cents;
  return Number.isSafeInteger(amountCents) && amountCents > 0 ? amountCents : null;
}

export default function TransferPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = getAuthEmail();
  const [initialState] = useState(() => {
    let loadedAccounts;
    try {
      loadedAccounts = getAccounts(email);
    } catch (loadError) {
      return {
        accounts: [],
        beneficiaries: [],
        accountError: loadError instanceof Error ? loadError.message : 'Les comptes sont indisponibles.',
        beneficiaryError: '',
      };
    }

    try {
      return {
        accounts: loadedAccounts,
        beneficiaries: getBeneficiaries(email),
        accountError: '',
        beneficiaryError: '',
      };
    } catch (loadError) {
      return {
        accounts: loadedAccounts,
        beneficiaries: [],
        accountError: '',
        beneficiaryError: loadError instanceof Error
          ? loadError.message
          : 'Les bénéficiaires sont indisponibles.',
      };
    }
  });
  const [accounts, setAccounts] = useState(initialState.accounts);
  const [beneficiaries, setBeneficiaries] = useState(initialState.beneficiaries);
  const [sourceAccountId, setSourceAccountId] = useState(searchParams.get('source') || '');
  const [recipientAccountId, setRecipientAccountId] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(initialState.accountError);
  const [beneficiaryError, setBeneficiaryError] = useState(initialState.beneficiaryError);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Combiner les autres comptes de l'utilisateur avec les bénéficiaires
  const allRecipients = [
    ...accounts
      .filter((account) => account.id !== sourceAccountId)
      .map((account) => ({
        name: `${account.label} (Mes comptes)`,
        accountId: account.id,
        isUserAccount: true,
      })),
    ...beneficiaries.map((beneficiary) => ({
      ...beneficiary,
      isUserAccount: false,
    })),
  ];

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  function handleBeneficiaryChange(event) {
    const selectedAccountId = event.target.value;
    setRecipientAccountId(selectedAccountId);
    const recipient = allRecipients.find((item) => item.accountId === selectedAccountId);
    setBeneficiaryName(recipient ? recipient.name : '');
    setError('');
    setSuccess('');
  }

  function handleRecipientAccountChange(event) {
    const accountId = event.target.value;
    setRecipientAccountId(accountId);
    const recipient = allRecipients.find((item) => item.accountId === accountId);
    setBeneficiaryName(recipient ? recipient.name : '');
    setError('');
    setSuccess('');
  }

  function handleSaveBeneficiary() {
    setError('');
    setSuccess('');
    try {
      const recipient = allRecipients.find((item) => item.accountId === recipientAccountId);
      if (recipient?.isUserAccount) {
        setError('Ce compte vous appartient déjà. Vous ne pouvez pas l’enregistrer comme bénéficiaire.');
        return;
      }
      const beneficiary = saveBeneficiary(email, beneficiaryName, recipientAccountId);
      setBeneficiaries(getBeneficiaries(email));
      setBeneficiaryError('');
      setRecipientAccountId(beneficiary.accountId);
      setSuccess(`${beneficiary.name} a été enregistré comme bénéficiaire.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Impossible d’enregistrer le bénéficiaire.');
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const amountCents = parseAmountInCents(amount);
    if (amountCents === null) {
      setError('Saisissez un montant positif avec au maximum deux décimales.');
      return;
    }

    setLoading(true);
    try {
      transferBetweenAccounts(email, sourceAccountId, recipientAccountId, amountCents);
      setSuccess('Le virement a été effectué.');
      setAmount('');
      try {
        setAccounts(getAccounts(email));
      } catch {
        setError('Le virement a été effectué, mais le solde ne peut pas être actualisé.');
      }
    } catch (transferError) {
      setError(transferError instanceof Error ? transferError.message : 'Le virement a échoué.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="site-header dashboard-header">
        <Link className="brand" to="/dashboard" aria-label="Noria, tableau de bord">
          <span className="brand-mark" aria-hidden="true">n</span>
          <span>noria</span>
        </Link>
        <button className="logout-button" onClick={handleLogout} type="button">
          Se déconnecter
        </button>
      </header>

      <section className="dashboard-content">
        <Link className="back-link" to="/accounts">← Retour à mes comptes</Link>
        <section className="dashboard-card transfer-card">
          <span className="eyebrow">VIREMENT</span>
          <h1>Effectuer un virement</h1>
          <p className="intro">Les virements sont simulés et enregistrés dans ce navigateur.</p>

          {error && <p className="form-error" role="alert">{error}</p>}
          {beneficiaryError && <p className="form-error" role="alert">{beneficiaryError}</p>}
          {success && <p className="form-success" role="status">{success}</p>}

          {accounts.length === 0 && !initialState.accountError && (
            <p className="demo-notice">
              Aucun compte source disponible. <Link className="text-link" to="/accounts/new">Ouvrir un compte</Link>.
            </p>
          )}

          <form className="transfer-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="transfer-source">Compte source</label>
              <select
                id="transfer-source"
                onChange={(event) => setSourceAccountId(event.target.value)}
                required
                value={sourceAccountId}
              >
                <option value="">Choisir un compte</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.label} — {account.id} — {euroFormat.format(account.balanceCents / 100)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="transfer-beneficiary">Bénéficiaire ou mes autres comptes</label>
              <select
                id="transfer-beneficiary"
                onChange={handleBeneficiaryChange}
                value={allRecipients.some((item) => item.accountId === recipientAccountId)
                  ? recipientAccountId
                  : ''}
              >
                <option value="">Choisir un bénéficiaire ou un autre de mes comptes (facultatif)</option>
                {allRecipients.map((recipient) => (
                  <option key={recipient.accountId} value={recipient.accountId}>
                    {recipient.name} — {recipient.accountId}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="transfer-recipient">Numéro du compte destinataire</label>
              <input
                autoComplete="off"
                id="transfer-recipient"
                onChange={handleRecipientAccountChange}
                placeholder="Ex. NOR-123456"
                required
                value={recipientAccountId}
              />
            </div>

            <div className="field">
              <label htmlFor="transfer-beneficiary-name">Nom du bénéficiaire</label>
              <input
                autoComplete="name"
                id="transfer-beneficiary-name"
                onChange={(event) => setBeneficiaryName(event.target.value)}
                placeholder="Pour enregistrer ce bénéficiaire"
                value={beneficiaryName}
              />
            </div>

            <button
              className="action-link action-link-secondary"
              onClick={handleSaveBeneficiary}
              type="button"
            >
              Enregistrer ce bénéficiaire
            </button>

            <div className="field">
              <label htmlFor="transfer-amount">Montant (€)</label>
              <input
                autoComplete="off"
                id="transfer-amount"
                inputMode="decimal"
                min="0.01"
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Ex. 25.50"
                required
                step="0.01"
                type="number"
                value={amount}
              />
            </div>

            <button
              className="submit-button"
              disabled={loading || accounts.length === 0 || Boolean(initialState.accountError)}
              type="submit"
            >
              {loading ? 'Virement en cours...' : 'Confirmer le virement'}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
