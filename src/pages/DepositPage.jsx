import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { depositIntoAccount, getAccount } from '../services/accounts';
import { getAuthEmail, logout } from '../services/demoAuth';

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

export default function DepositPage() {
  const navigate = useNavigate();
  const { accountId } = useParams();
  const email = getAuthEmail();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountState] = useState(() => {
    try {
      return { account: getAccount(email, accountId), error: '' };
    } catch (loadError) {
      return {
        account: null,
        error: loadError instanceof Error ? loadError.message : 'Le compte est indisponible.',
      };
    }
  });
  const { account, error: accountError } = accountState;

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const amountCents = parseAmountInCents(amount);
    if (amountCents === null) {
      setError('Saisissez un montant positif avec au maximum deux décimales.');
      return;
    }

    setLoading(true);
    try {
      depositIntoAccount(email, accountId, amountCents);
      navigate(`/accounts/${encodeURIComponent(accountId)}`, { replace: true });
    } catch (depositError) {
      setError(depositError instanceof Error ? depositError.message : 'Le dépôt a échoué.');
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
        <Link
          className="back-link"
          to={account ? `/accounts/${encodeURIComponent(account.id)}` : '/accounts'}
        >
          ← Retour au détail du compte
        </Link>
        {accountError && <p className="form-error" role="alert">{accountError}</p>}
        {account && (
          <section className="dashboard-card deposit-card">
            <span className="eyebrow">DÉPÔT</span>
            <h1>Déposer sur {account.label.toLowerCase()}</h1>
            <p className="intro">Compte concerné : {account.id}</p>

            {error && <p className="form-error" role="alert">{error}</p>}

            <form className="deposit-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="deposit-amount">Montant du dépôt (€)</label>
                <input
                  autoComplete="off"
                  id="deposit-amount"
                  inputMode="decimal"
                  min="0.01"
                  name="amount"
                  onChange={(event) => setAmount(event.target.value)}
                  onInvalid={() => setError('Saisissez un montant strictement supérieur à 0.')}
                  placeholder="Ex. 25.50"
                  required
                  step="0.01"
                  type="number"
                  value={amount}
                />
              </div>
              <button className="submit-button" type="submit" disabled={loading}>
                {loading ? 'Dépôt en cours...' : 'Confirmer le dépôt'}
              </button>
            </form>
            <p className="demo-notice">
              Dépôt simulé : le nouveau solde est enregistré dans ce navigateur.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}
