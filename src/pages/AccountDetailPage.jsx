import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { getAccount } from '../services/accounts';
import { getAuthEmail, logout } from '../services/demoAuth';

const euroFormat = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

export default function AccountDetailPage() {
  const navigate = useNavigate();
  const { accountId } = useParams();
  const email = getAuthEmail();
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
  const { account, error } = accountState;

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
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
        {error && <p className="form-error" role="alert">{error}</p>}
        {account && (
          <section className="dashboard-card account-detail-card">
            <span className="eyebrow">DÉTAIL DU COMPTE</span>
            <h1>{account.label}</h1>
            <p className="account-reference">Référence : {account.id}</p>
            <div className="account-detail-balance">
              <span className="summary-label">Solde disponible</span>
              <strong>{euroFormat.format(account.balanceCents / 100)}</strong>
            </div>
            <Link
              className="action-link"
              to={`/accounts/${encodeURIComponent(account.id)}/deposit`}
            >
              Effectuer un dépôt
            </Link>
          </section>
        )}
      </section>
    </main>
  );
}
