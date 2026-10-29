import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './Accounts.css';

export default function Accounts() {
    const { token } = useAuth();
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

    const handleCloseAccount = async (accountId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir clôturer ce compte ?')) return;
        
        try {
            await api('DELETE', `/accounts/${accountId}`, null, { token });
            setAccounts(accounts.filter(account => account.id !== accountId));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="accounts-page">
            <div className="page-header">
                <h1>Mes comptes</h1>
                <Link to="/accounts/new" className="btn-primary">Ouvrir un nouveau compte</Link>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <p>Chargement des comptes...</p>
            ) : accounts.length === 0 ? (
                <div className="empty-state">
                    <p>Vous n'avez aucun compte.</p>
                    <Link to="/accounts/new" className="btn-primary">Ouvrir un compte</Link>
                </div>
            ) : (
                <div className="accounts-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>IBAN</th>
                                <th>Solde</th>
                                <th>Date de création</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map((account) => (
                                <tr key={account.id}>
                                    <td>{account.type === 'principal' ? 'Principal' : 'Secondaire'}</td>
                                    <td className="iban">{account.iban}</td>
                                    <td className="balance">{account.balance.toFixed(2)} €</td>
                                    <td>{new Date(account.createdAt).toLocaleDateString('fr-FR')}</td>
                                    <td className="actions">
                                        <Link to={`/accounts/${account.id}`} className="btn-small btn-primary">Voir</Link>
                                        <Link to={`/accounts/${account.id}/deposits`} className="btn-small btn-primary">Dépôt</Link>
                                        {account.type !== 'principal' && (
                                            <Link 
                                                to={`/accounts/${account.id}/close`}
                                                className="btn-small btn-danger"
                                            >
                                                Clôturer
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
