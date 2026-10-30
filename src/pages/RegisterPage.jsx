import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { register } from '../services/demoAuth';


export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email.trim(), password);
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'inscription a échoué.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="site-header">
        <Link className="brand" to="/register" aria-label="Noria, accueil">
          <span className="brand-mark" aria-hidden="true">n</span>
          <span>noria</span>
        </Link>
      </header>
      <section className="auth-layout">
        <div className="auth-card">
          <span className="eyebrow">BIENVENUE CHEZ NORIA</span>
          <h1>Votre compte commence ici.</h1>
          <p className="intro">Quelques instants suffisent pour créer votre espace personnel.</p>
          <form className="register-form" onSubmit={handleSubmit}>
            {error && <p className="form-error" role="alert">{error}</p>}

            <div className="field">
              <label htmlFor="register-email">Adresse e-mail</label>
              <input
                autoComplete="email"
                id="register-email"
                type="email"
                placeholder="vous@exemple.fr"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="register-password">Mot de passe</label>
              <input
                autoComplete="new-password"
                id="register-password"
                type="password"
                placeholder="Choisissez un mot de passe"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <button className="submit-button" type="submit" disabled={loading}>
              {loading ? 'Création en cours...' : "Créer mon compte"}
            </button>
          </form>

          <p className="form-footer">
            Déjà un compte ? <Link className="text-link" to="/login">Se connecter</Link>
          </p>
        </div>
        <aside className="benefit-panel">
          <span className="benefit-symbol" aria-hidden="true">n</span>
          <div className="benefit-copy">
            <h2>Votre argent, en mouvement.</h2>
            <p>Un compte pensé pour vous accompagner au quotidien, simplement et en toute sérénité.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
