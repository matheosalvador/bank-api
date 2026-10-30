import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { getAccounts } from '../services/accounts';
import { getAuthEmail, logout } from '../services/demoAuth';

const euroFormat = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

export default function DashboardPage() {
  const navigate = useNavigate();
  const email = getAuthEmail();
  const [accountState] = useState(() => {
    try {
      const accounts = getAccounts(email);
      const totalBalance = accounts.reduce((sum, account) => sum + account.balanceCents, 0);
      return { accounts, totalBalance, error: '' };
    } catch (loadError) {
      return {
        accounts: [],
        totalBalance: 0,
        error: loadError instanceof Error ? loadError.message : 'Impossible de charger les comptes.',
      };
    }
  });
  const { accounts, totalBalance, error } = accountState;

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
      <section className="dashboard-card">
        <span className="eyebrow">ESPACE CLIENT</span>
        <h1>Bienvenue sur votre dashboard.</h1>
        
        <div className="dashboard-summary">
          <p className="intro">
            Vous êtes connecté avec l'adresse : <strong>{email}</strong>
          </p>
          
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Nombre de comptes</span>
              <strong className="stat-value">{accounts.length}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Solde total</span>
              <strong className="stat-value">{euroFormat.format(totalBalance / 100)}</strong>
            </div>
          </div>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="dashboard-actions">
          <Link className="action-link" to="/accounts">
            La liste de mes comptes
          </Link>
          <Link className="action-link secondary" to="/accounts/new">
            Ouvrir un nouveau compte
          </Link>
        </div>
        
        <p className="demo-notice">
          Cette connexion est une simulation locale. Aucun compte réel ni donnée bancaire n’est enregistré.
        </p>
      </section>
    </main>
  );
}
