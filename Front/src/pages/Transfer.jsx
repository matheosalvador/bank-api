import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './Forms.css';

export default function Transfer() {
    const { token } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [fromAccountId, setFromAccountId] = useState('');
    const [toIban, setToIban] = useState('');
    const [amount, setAmount] = useState('');
    const [label, setLabel] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) return;
        
        const fetchData = async () => {
            try {
                setLoading(true);
                const [accountsData, beneficiariesData] = await Promise.all([
                    api('GET', '/accounts', null, { token }),
                    api('GET', '/beneficiaries', null, { token }).catch(() => []) // Ignore error if no beneficiaries endpoint
                ]);
                setAccounts(accountsData);
                setBeneficiaries(beneficiariesData || []);
                if (accountsData.length > 0) {
                    setFromAccountId(accountsData[0].id.toString());
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const numericAmount = parseFloat(amount);
            if (isNaN(numericAmount) || numericAmount <= 0) {
                throw new Error('Le montant doit être un nombre positif');
            }
            
            await api('POST', '/transfers', {
                fromAccountId: parseInt(fromAccountId),
                toIban,
                amount: numericAmount,
                label: label || null
            }, { token });
            
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

    if (success) {
        return (
            <div className="form-container">
                <div className="success-message">
                    <h2>Virement effectué avec succès !</h2>
                    <p>Vous allez être redirigé vers la liste des comptes.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="form-container">
            <h1>Effectuer un virement</h1>

            {error && <div className="error-message">{error}</div>}

            {loading && !accounts.length ? (
                <p>Chargement...</p>
            ) : (
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label htmlFor="fromAccountId">Compte source</label>
                        <select
                            id="fromAccountId"
                            value={fromAccountId}
                            onChange={(e) => setFromAccountId(e.target.value)}
                            required
                        >
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.type} - {account.iban} (Solde: {account.balance.toFixed(2)} €)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="toIban">IBAN du destinataire</label>
                        <input
                            type="text"
                            id="toIban"
                            value={toIban}
                            onChange={(e) => setToIban(e.target.value.toUpperCase().replace(/\s/g, ''))}
                            placeholder="FR76 9999 9000 0101 2345 6789 012"
                            required
                        />
                    </div>

                    {beneficiaries.length > 0 && (
                        <div className="beneficiaries-list">
                            <h3>Bénéficiaires enregistrés</h3>
                            <ul>
                                {beneficiaries.map((ben) => (
                                    <li key={ben.id}>
                                        <button 
                                            type="button"
                                            className="btn-small btn-secondary"
                                            onClick={() => setToIban(ben.iban)}
                                        >
                                            {ben.name} - {ben.iban}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="amount">Montant (en €)</label>
                        <input
                            type="number"
                            id="amount"
                            step="0.01"
                            min="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Ex: 100.50"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="label">Libellé (optionnel)</label>
                        <input
                            type="text"
                            id="label"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Ex: Loyer, Remboursement"
                            maxLength="100"
                        />
                    </div>

                    <div className="action-buttons">
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Traitement...' : 'Effectuer le virement'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => navigate('/accounts')}
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
            )}
        </div>
    );
}
