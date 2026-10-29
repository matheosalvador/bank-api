import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './Details.css';

export default function Details() {
    const { token } = useAuth();
    const { id: accountId } = useParams();
    const [account, setAccount] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!token || !accountId) return;
        
        const fetchData = async () => {
            try {
                setLoading(true);
                const [accountData, transactionsData] = await Promise.all([
                    api('GET', `/accounts/${accountId}`, null, { token }),
                    api('GET', `/accounts/${accountId}/transactions`, null, { token })
                ]);
                setAccount(accountData);
                setTransactions(transactionsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [token, accountId]);

    if (!accountId) {
        return (
            <div className="details-container">
                <p>ID de compte manquant.</p>
            </div>
        );
    }

    if (loading) {
        return <div className="details-container"><p>Chargement...</p></div>;
    }

    if (error) {
        return <div className="details-container"><div className="error-message">{error}</div></div>;
    }

    if (!account) {
        return <div className="details-container"><p>Compte introuvable.</p></div>;
    }

    return (
        <div className="details-container">
            <div className="account-header">
                <h1>Détails du compte</h1>
                <div className="account-actions">
                    <Link to={`/accounts/${accountId}/deposits`} className="btn-small btn-primary">Dépôt</Link>
                    <Link to="/transfer" state={{ fromAccountId: accountId }} className="btn-small btn-primary">Virement</Link>
                    <Link to={`/accounts/${accountId}/statement`} className="btn-small btn-secondary" target="_blank" rel="noopener noreferrer">
                        Relevé PDF
                    </Link>
                    <button onClick={() => navigate('/accounts')} className="btn-small btn-secondary">Retour</button>
                </div>
            </div>

            <div className="account-info">
                <div className="info-card">
                    <h2>Informations du compte</h2>
                    <p><strong>Type:</strong> {account.type === 'principal' ? 'Principal' : 'Secondaire'}</p>
                    <p><strong>IBAN:</strong> {account.iban}</p>
                    <p><strong>Solde:</strong> {account.balance.toFixed(2)} €</p>
                    <p><strong>Date de création:</strong> {new Date(account.createdAt).toLocaleDateString('fr-FR')}</p>
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

            <div className="transactions-section">
                <h2>Historique des transactions</h2>
                
                {transactions.length === 0 ? (
                    <p>Aucune transaction pour ce compte.</p>
                ) : (
                    <table className="transactions-table">
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
                )}
            </div>
        </div>
    );
}
