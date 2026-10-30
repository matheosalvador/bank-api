import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './Details.css';

export default function Details() {
    const { token, user } = useAuth();
    const { id: accountId } = useParams();
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!token || !accountId) return;
        
        const fetchAccount = async () => {
            try {
                setLoading(true);
                setError('');
                const accountData = await api('GET', `/accounts/${accountId}`, null, { token });
                
                // Vérification que le compte appartient à l'utilisateur
                if (!accountData || (user && accountData.userId !== user.id)) {
                    throw new Error('Compte introuvable ou vous n\'êtes pas autorisé à accéder à ce compte.');
                }
                
                setAccount(accountData);
            } catch (err) {
                setError(err.message);
                setAccount(null);
            } finally {
                setLoading(false);
            }
        };
        
        fetchAccount();
    }, [token, accountId, user]);

    if (!accountId) {
        return (
            <div className="details-container">
                <div className="error-message">
                    <p>ID de compte manquant.</p>
                    <Link to="/dashboard" className="btn-primary">Retour au tableau de bord</Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="details-container"><p>Chargement des détails du compte...</p></div>;
    }

    if (error) {
        return (
            <div className="details-container">
                <div className="error-message">
                    <p>{error}</p>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                        <Link to="/accounts" className="btn-primary">Voir mes comptes</Link>
                        <Link to="/dashboard" className="btn-secondary">Retour au tableau de bord</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!account) {
        return (
            <div className="details-container">
                <div className="error-message">
                    <p>Compte introuvable ou vous n'êtes pas autorisé à accéder à ce compte.</p>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                        <Link to="/accounts" className="btn-primary">Voir mes comptes</Link>
                        <Link to="/dashboard" className="btn-secondary">Retour au tableau de bord</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="details-container">
            <div className="account-header">
                <h1>Détails du compte</h1>
                <div className="account-actions">
                    <Link to={`/accounts/${accountId}/deposits`} className="btn-small btn-primary">
                        Faire un dépôt
                    </Link>
                    <Link to="/transfer" state={{ fromAccountId: accountId }} className="btn-small btn-primary">
                        Faire un virement
                    </Link>
                    <Link to={`/history?accountId=${accountId}`} className="btn-small btn-primary">
                        Voir l'historique
                    </Link>
                    <Link to="/dashboard" className="btn-small btn-secondary">
                        Retour au dashboard
                    </Link>
                    <button onClick={() => navigate('/accounts')} className="btn-small btn-secondary">
                        Retour aux comptes
                    </button>
                </div>
            </div>

            <div className="account-info">
                <div className="info-card">
                    <h2>Informations du compte</h2>
                    <p><strong>Type:</strong> {account.type === 'principal' ? 'Principal' : 'Secondaire'}</p>
                    <p><strong>Numéro de compte (IBAN):</strong> {account.iban}</p>
                    <p><strong>Solde:</strong> {account.balance.toFixed(2)} €</p>
                    <p><strong>Date d'ouverture:</strong> {new Date(account.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>

                {account.type !== 'principal' && (
                    <div className="info-card warning">
                        <h2>Attention</h2>
                        <p>Ce compte est secondaire. Il peut être clôturé si le solde est à 0 €.</p>
                        <Link to={`/accounts/${accountId}/close`} className="btn-small btn-danger">
                            Clôturer le compte
                        </Link>
                    </div>
                )}
            </div>

            <div className="back-link">
                <Link to="/dashboard" className="btn-secondary">
                    ← Retour au tableau de bord
                </Link>
            </div>
        </div>
    );
}
