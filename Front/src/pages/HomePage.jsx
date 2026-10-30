import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

export default function HomePage() {
    const { token, user } = useAuth();

    return (
        <div className="home-container">
            <div className="hero">
                <h1>Bienvenue sur votre banque en ligne</h1>
                <p>Gérez vos comptes, effectuez des virements et suivez vos transactions en toute sécurité.</p>
                
                {token ? (
                    <div className="welcome-message">
                        <p>Bonjour, {user?.email} !</p>
                        <Link to="/dashboard" className="btn-primary">Accéder à mon espace</Link>
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <Link to="/login" className="btn-primary">Se connecter</Link>
                        <Link to="/register" className="btn-secondary">S'inscrire</Link>
                    </div>
                )}
            </div>

            <div className="features">
                <h2>Nos services</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <h3>Comptes bancaires</h3>
                        <p>Ouvrez et gérez plusieurs comptes avec des IBAN uniques.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Virements</h3>
                        <p>Effectuez des virements entre vos comptes ou vers des bénéficiaires externes.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Historique</h3>
                        <p>Consultez l'historique complet de toutes vos transactions.</p>
                    </div>
                </div>
            </div>

            <div className="test-accounts">
                <h2>Comptes de test</h2>
                <p>Pour essayer notre plateforme, vous pouvez utiliser ces comptes de démonstration :</p>
                <ul>
                    <li><strong>alice@banque.fr</strong> / alice1234</li>
                    <li><strong>bob@banque.fr</strong> / bob12345</li>
                </ul>
            </div>
        </div>
    );
}
