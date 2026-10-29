import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './Dashboard.css';

export default function Dashboard() {
    const { user, token, logout } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) return;
        
        const fetchAccounts = async () => {
            try {
                setLoading(true);
                const data = await api('GET', '/accounts', null, { token });
                setAccounts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchAccounts();
    }, [token]);

    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    if (!user) {
        return (
            <div className="dashboard-container">
                <div className="warning-message">
                    <p>Veuillez vous connecter pour accéder au tableau de bord.</p>
                    <Link to="/login" className="btn-primary">Se connecter</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Tableau de bord</h1>
                <div className="user-info">
                    <span>Bienvenue, {user.email}</span>
                    <button onClick={logout} className="btn-logout">Déconnexion</button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="dashboard-summary">
                <div className="summary-card">
                    <h2>Solde total</h2>
                    <p className="balance">{totalBalance.toFixed(2)} €</p>
                </div>
                
                <div className="summary-card">
                    <h2>Nombre de comptes</h2>
                    <p>{accounts.length}</p>
                </div>
            </div>

            <div className="accounts-section">
                <div className="section-header">
                    <h2>Vos comptes</h2>
                    <Link to="/accounts/new" className="btn-primary">Ouvrir un compte</Link>
                </div>

                {loading ? (
                    <p>Chargement des comptes...</p>
                ) : accounts.length === 0 ? (
                    <p>Aucun compte trouvé.</p>
                ) : (
                    <div className="accounts-list">
                        {accounts.map((account) => (
                            <div key={account.id} className="account-card">
                                <div className="account-info">
                                    <h3>Compte {account.type}</h3>
                                    <p className="iban">{account.iban}</p>
                                    <p className="balance">{account.balance.toFixed(2)} €</p>
                                </div>
                                <div className="account-actions">
                                    <Link to={`/accounts/${account.id}`} className="btn-small btn-primary">Détails</Link>
                                    <Link to={`/accounts/${account.id}/deposits`} className="btn-small btn-primary">Dépôt</Link>
                                    <Link to="/transfer" className="btn-small btn-primary">Virement</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="quick-actions">
                <h2>Actions rapides</h2>
                <div className="actions-grid">
                    <Link to="/accounts" className="action-card">
                        <h3>Gérer les comptes</h3>
                    </Link>
                    <Link to="/transfer" className="action-card">
                        <h3>Faire un virement</h3>
                    </Link>
                    <Link to="/history" className="action-card">
                        <h3>Historique des transactions</h3>
                    </Link>
                </div>
            </div>
        </div>
    );
}
