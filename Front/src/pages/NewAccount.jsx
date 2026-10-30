import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './Forms.css';

export default function NewAccount() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api('POST', '/accounts', null, { token });
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
                    <h2>Compte créé avec succès !</h2>
                    <p>Vous allez être redirigé vers la liste des comptes.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="form-container">
            <h1>Ouvrir un nouveau compte</h1>
            <p>Ce compte sera un compte secondaire avec un solde initial de 0 €.</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="form">
                <p>Souhaitez-vous ouvrir un nouveau compte secondaire ?</p>
                <div className="action-buttons">
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Création en cours...' : 'Ouvrir le compte'}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => navigate('/accounts')}
                        className="btn-secondary"
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
}
