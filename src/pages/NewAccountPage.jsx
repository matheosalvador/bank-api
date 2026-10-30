import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { openAccount } from '../services/accounts';
import { getAuthEmail, logout } from '../services/demoAuth';

export default function NewAccountPage() {
  const navigate = useNavigate();
  const email = getAuthEmail();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      openAccount(email);
      navigate('/accounts', { replace: true });
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : 'L’ouverture du compte a échoué.');
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
        <div className="dashboard-card new-account-card">
          <span className="eyebrow">NOUVEAU COMPTE</span>
          <h1>Ouvrir un compte</h1>
          <p className="intro">Un compte courant de démonstration sera créé pour {email}.</p>

          <div className="account-preview">
            <span className="account-type">Compte courant</span>
            <span className="account-preview-balance">Solde initial : 0,00 €</span>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <form onSubmit={handleSubmit}>
            <button className="submit-button" type="submit" disabled={loading}>
              {loading ? 'Ouverture en cours...' : 'Confirmer l’ouverture'}
            </button>
          </form>
          <p className="demo-notice">
            Cette action est une simulation locale. Aucun compte bancaire réel ne sera créé.
          </p>
        </div>
      </section>
    </main>
  );
}
