import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './Auth.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api('POST', '/auth/login', { email, password });
            login(response.accessToken, response.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Email ou mot de passe incorrect');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Connexion</h1>
                <p>Connectez-vous à votre compte bancaire</p>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="alice@banque.fr"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Votre mot de passe"
                            required
                        />
                    </div>
                    
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>
                
                <div className="auth-footer">
                    <p>Vous n'avez pas de compte ? <Link to="/register">S'inscrire</Link></p>
                </div>
            </div>
            
            <div className="auth-info">
                <h2>Comptes de test</h2>
                <ul>
                    <li><strong>alice@banque.fr</strong> / alice1234</li>
                    <li><strong>bob@banque.fr</strong> / bob12345</li>
                </ul>
            </div>
        </div>
    );
}
