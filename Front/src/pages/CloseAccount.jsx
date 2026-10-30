import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './Forms.css';

export default function CloseAccount() {
    const { token } = useAuth();
    const { id: accountId } = useParams();
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token || !accountId) return;
        
        const fetchAccount = async () => {
            try {
                setLoading(true);
                const data = await api('GET', `/accounts/${accountId}`, null, { token });
                setAccount(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchAccount();
    }, [token, accountId]);

    const handleClose = async () => {
        if (!window.confirm(`Êtes-vous sûr de vouloir clôturer ce compte ? Cette action est irréversible.`)) {
            return;
        }
        
        try {
            setLoading(true);
            await api('DELETE', `/accounts/${accountId}`, null, { token });
            setSuccess(true);
            setTimeout(() => {
                navigate('/accounts');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!accountId) {
        return (
            <div className="form-container">
                <p>ID de compte manquant.</p>
            </div>
        );
    }

    if (loading && !account) {
        return <div className="form-container"><p>Chargement...</p></div>;
    }

    if (error) {
        return <div className="form-container"><div className="error-message">{error}</div></div>;
    }

    if (success) {
        return (
            <div className="form-container">
                <div className="success-message">
                    <h2>Compte clôturé avec succès !</h2>
                    <p>Vous allez être redirigé vers la liste des comptes.</p>
                </div>
            </div>
        );
    }

    if (!account) {
        return <div className="form-container"><p>Compte introuvable.</p></div>;
    }

    return (
        <div className="form-container">
            <h1>Clôturer le compte</h1>
            
            <div className="account-info">
                <h2>Informations du compte à clôturer</h2>
                <p><strong>Type:</strong> {account.type === 'principal' ? 'Principal' : 'Secondaire'}</p>
                <p><strong>IBAN:</strong> {account.iban}</p>
                <p><strong>Solde:</strong> {account.balance.toFixed(2)} €</p>
            </div>

            {account.type === 'principal' && (
                <div className="error-message">
                    <p>⚠️ Vous ne pouvez pas clôturer le compte principal.</p>
                    <div className="action-buttons">
                        <Link to="/accounts" className="btn-primary">Retour aux comptes</Link>
                    </div>
                </div>
            )}

            {account.balance !== 0 && account.type !== 'principal' && (
                <div className="error-message">
                    <p>⚠️ Vous ne pouvez pas clôturer un compte avec un solde différent de 0 €.</p>
                    <p>Solde actuel : {account.balance.toFixed(2)} €</p>
                    <p>Veuillez d'abord transférer le solde vers un autre compte.</p>
                    <div className="action-buttons">
                        <Link to={`/accounts/${accountId}/deposits`} className="btn-primary">
                            Effectuer un dépôt
                        </Link>
                        <Link to="/transfer" state={{ fromAccountId: accountId }} className="btn-primary">
                            Effectuer un virement
                        </Link>
                        <Link to="/accounts" className="btn-secondary">
                            Retour aux comptes
                        </Link>
                    </div>
                </div>
            )}

            {account.type !== 'principal' && account.balance === 0 && (
                <div className="confirmation">
                    <h2>Confirmation</h2>
                    <p>Vous êtes sur le point de clôturer ce compte secondaire. Cette action est irréversible.</p>
                    <p>Tous les historiques de transactions seront conservés.</p>
                    <div className="action-buttons">
                        <button onClick={handleClose} disabled={loading} className="btn-danger">
                            {loading ? 'Clôture en cours...' : 'Clôturer le compte'}
                        </button>
                        <Link to="/accounts" className="btn-secondary">Annuler</Link>
                    </div>
                </div>
            )}
        </div>
    );
}
