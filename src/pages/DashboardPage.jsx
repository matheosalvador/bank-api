import { Link, useNavigate } from 'react-router';
import { logout } from '../services/demoAuth';

export default function DashboardPage() {
  const navigate = useNavigate();

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
        <p className="intro">Vous êtes connecté à votre espace de démonstration Noria.</p>
        <p className="demo-notice">
          Cette connexion est une simulation locale. Aucun compte réel ni donnée bancaire n’est enregistré.
        </p>
      </section>
    </main>
  );
}
