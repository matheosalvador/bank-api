import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import api from '../api/api';
import './History.css';

export default function History() {
    const { token } = useAuth();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) return;
        
        const fetchAccounts = async () => {
            try {
                setLoading(true);
                const data = await api('GET', '/accounts', null, { token });
                setAccounts(data);
                
                // Vérifier si un accountId est passé dans l'URL
                const urlAccountId = searchParams.get('accountId');
                if (urlAccountId && data.some(acc => acc.id.toString() === urlAccountId)) {
                    setSelectedAccountId(urlAccountId);
                } else if (data.length > 0) {
                    setSelectedAccountId(data[0].id.toString());
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchAccounts();
    }, [token, searchParams]);

    useEffect(() => {
        if (!token || !selectedAccountId) return;
        
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const data = await api('GET', `/accounts/${selectedAccountId}/transactions`, null, { token });
                setTransactions(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchTransactions();
    }, [token, selectedAccountId]);

    if (loading && accounts.length === 0) {
        return <div className="history-container"><p>Chargement...</p></div>;
    }

    return (
        <div className="history-container">
            <h1>Historique des transactions</h1>

            {error && <div className="error-message">{error}</div>}

            {accounts.length > 0 && (
                <div className="account-selector">
                    <label htmlFor="accountSelect">Sélectionnez un compte:</label>
                    <select
                        id="accountSelect"
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                    >
                        {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.type} - {account.iban} (Solde: {account.balance.toFixed(2)} €)
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {loading ? (
                <p>Chargement des transactions...</p>
            ) : transactions.length === 0 ? (
                <p>Aucune transaction pour ce compte.</p>
            ) : (
                <div className="transactions-list">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Libellé</th>
                                <th>Montant</th>
                                <th>Direction</th>
                                <th>IBAN source</th>
                                <th>IBAN destination</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx.id} className={tx.direction}>
                                    <td>{new Date(tx.createdAt).toLocaleString('fr-FR')}</td>
                                    <td>{tx.kind === 'deposit' ? 'Dépôt' : 'Virement'}</td>
                                    <td>{tx.label}</td>
                                    <td>{tx.amount.toFixed(2)} €</td>
                                    <td>
                                        <span className={`badge ${tx.direction}`}>
                                            {tx.direction === 'credit' ? 'Crédit' : 'Débit'}
                                        </span>
                                    </td>
                                    <td>{tx.fromIban || 'N/A'}</td>
                                    <td>{tx.toIban}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <Link to="/accounts" className="btn-secondary">← Retour aux comptes</Link>
                <Link to="/dashboard" className="btn-secondary">Retour au tableau de bord</Link>
            </div>
        </div>
    );
}
