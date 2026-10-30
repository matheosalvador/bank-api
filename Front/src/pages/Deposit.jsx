import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './Forms.css';

export default function Deposit() {
    const { token } = useAuth();
    const { id: accountId } = useParams();
    const [amount, setAmount] = useState('');
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    // If no accountId in params, redirect to accounts
    useEffect(() => {
        if (!accountId) {
            navigate('/accounts');
        }
    }, [accountId, navigate]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const numericAmount = parseFloat(amount);
            if (isNaN(numericAmount) || numericAmount <= 0) {
                throw new Error('Le montant doit être un nombre positif');
            }
            
            if (numericAmount > 10000) {
                throw new Error('Le montant maximum par dépôt est de 10 000 €');
            }
            
            await api('POST', `/accounts/${accountId}/deposits`, { amount: numericAmount }, { token });
            setSuccess(true);
            setTimeout(() => {
                navigate(`/accounts/${accountId}`);
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!accountId) {
        return null;
    }

    if (loading && !account) {
        return <div className="form-container"><p>Chargement...</p></div>;
    }

    if (success) {
        return (
            <div className="form-container">
                <div className="success-message">
                    <h2>Dépôt effectué avec succès !</h2>
                    <p>Vous allez être redirigé vers les détails du compte.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="form-container">
            <h1>Dépôt sur le compte</h1>
            {account && (
                <div className="account-info">
                    <p><strong>Type:</strong> {account.type === 'principal' ? 'Principal' : 'Secondaire'}</p>
                    <p><strong>IBAN:</strong> {account.iban}</p>
                    <p><strong>Solde actuel:</strong> {account.balance.toFixed(2)} €</p>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <label htmlFor="amount">Montant à déposer (en €)</label>
                    <input
                        type="number"
                        id="amount"
                        step="0.01"
                        min="0.01"
                        max="10000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Ex: 100.50"
                        required
                    />
                </div>
                <p className="hint">Maximum: 10 000 € par opération. Le montant doit être positif avec maximum 2 décimales.</p>
                
                <div className="action-buttons">
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Traitement...' : 'Effectuer le dépôt'}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => navigate(`/accounts/${accountId}`)}
                        className="btn-secondary"
                    >
                        Annuler
                    </button>
                    <button 
                        type="button" 
                        onClick={() => navigate('/dashboard')}
                        className="btn-secondary"
                    >
                        Retour au dashboard
                    </button>
                </div>
            </form>
        </div>
    );
}
