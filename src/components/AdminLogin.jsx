import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AdminLogin = ({ onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/api/admin/login`, {
                password
            });

            if (response.data.success) {
                // Guardar en localStorage que está autenticado
                localStorage.setItem('adminAuth', 'true');
                onLoginSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error al autenticar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login">
            <div className="login-card">
                <h2>🔒 Acceso Administrativo</h2>
                <p>Ingresa la contraseña para acceder al panel de administración</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingresa la contraseña"
                            required
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="message error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Verificando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
