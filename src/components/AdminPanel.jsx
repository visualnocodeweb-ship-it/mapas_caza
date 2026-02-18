import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLogin from './AdminLogin';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AdminPanel = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Verificar si ya está autenticado
        const auth = localStorage.getItem('adminAuth');
        if (auth === 'true') {
            setIsAuthenticated(true);
            fetchSubmissions();
        } else {
            setLoading(false);
        }
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        fetchSubmissions();
    };

    const handleLogout = () => {
        localStorage.removeItem('adminAuth');
        setIsAuthenticated(false);
        setSubmissions([]);
    };

    const fetchSubmissions = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/submissions`);
            setSubmissions(response.data.data);
            setLoading(false);
        } catch (err) {
            console.error('Error al cargar registros:', err);
            setError('Error al cargar los registros');
            setLoading(false);
        }
    };

    const downloadKML = async (id, establecimiento) => {
        try {
            const response = await axios.get(`${API_URL}/api/submissions/${id}/kml`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${establecimiento}_${id}.kml`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Error al descargar KML:', err);
            alert('Error al descargar el archivo KML');
        }
    };

    const downloadAllKML = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/export/all-kml`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `mapas_caza_todos_${Date.now()}.kml`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Error al descargar KML:', err);
            alert('Error al descargar el archivo KML');
        }
    };

    // Si no está autenticado, mostrar login
    if (!isAuthenticated) {
        return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
    }

    if (loading) {
        return <div className="admin-panel"><p>Cargando registros...</p></div>;
    }

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <div>
                    <h2>📊 Panel de Administración</h2>
                    <p>Total de registros: {submissions.length}</p>
                </div>
                <div className="admin-actions">
                    {submissions.length > 0 && (
                        <button onClick={downloadAllKML} className="download-all-btn">
                            📥 Descargar Todos los KML
                        </button>
                    )}
                    <button onClick={handleLogout} className="logout-btn">
                        🚪 Cerrar Sesión
                    </button>
                </div>
            </div>

            {error && <div className="message error">{error}</div>}

            {submissions.length === 0 ? (
                <p className="no-data">No hay registros todavía</p>
            ) : (
                <div className="submissions-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Establecimiento</th>
                                <th>IP</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((sub) => (
                                <tr key={sub.id}>
                                    <td>{sub.id}</td>
                                    <td>{sub.email}</td>
                                    <td>{sub.establecimiento}</td>
                                    <td>{sub.user_ip || 'N/A'}</td>
                                    <td>{new Date(sub.created_at).toLocaleDateString('es-AR')}</td>
                                    <td>
                                        <button
                                            onClick={() => downloadKML(sub.id, sub.establecimiento)}
                                            className="download-btn"
                                        >
                                            📥 KML
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
