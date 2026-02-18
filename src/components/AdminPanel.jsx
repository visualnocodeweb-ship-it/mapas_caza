import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import AdminLogin from './AdminLogin';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AdminPanel = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Estado para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    useEffect(() => {
        const auth = localStorage.getItem('adminAuth');
        if (auth === 'true') {
            setIsAuthenticated(true);
            fetchSubmissions(1);
        } else {
            setLoading(false);
        }
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        fetchSubmissions(1);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminAuth');
        setIsAuthenticated(false);
        setSubmissions([]);
    };

    // Fetch con paginación
    const fetchSubmissions = async (page) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/submissions?page=${page}&limit=10`);

            setSubmissions(response.data.data);

            // Actualizar info de paginación
            if (response.data.pagination) {
                setCurrentPage(response.data.pagination.currentPage);
                setTotalPages(response.data.pagination.totalPages);
                setTotalRecords(response.data.pagination.totalRecords);
            }

            setLoading(false);
        } catch (err) {
            console.error('Error al cargar registros:', err);
            setError('Error al cargar los registros');
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchSubmissions(newPage);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/api/submissions/${id}`);
            // Recargar página actual
            fetchSubmissions(currentPage);
        } catch (err) {
            console.error('Error al eliminar:', err);
            alert('Error al eliminar el registro');
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

    // Helper para convertir GeoJSON a Leaflet positions
    const getPolygonPositions = (geoJsonGeometry) => {
        if (!geoJsonGeometry || !geoJsonGeometry.coordinates) return [];

        const swapCoords = (coords) => coords.map(coord => [coord[1], coord[0]]);

        if (geoJsonGeometry.type === 'Polygon') {
            // Polygon: [ [[lng, lat], ...], [hole] ]
            return geoJsonGeometry.coordinates.map(ring => swapCoords(ring));
        } else if (geoJsonGeometry.type === 'MultiPolygon') {
            // MultiPolygon: [ [ [[lng, lat], ...] ], ... ]
            return geoJsonGeometry.coordinates.map(polygon =>
                polygon.map(ring => swapCoords(ring))
            );
        }
        return [];
    };

    if (!isAuthenticated) {
        return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
    }

    if (loading && submissions.length === 0) {
        return <div className="admin-panel"><p>Cargando registros...</p></div>;
    }

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <div>
                    <h2>📊 Panel de Administración</h2>
                    <p>Total de registros: {totalRecords}</p>
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

            {submissions.length > 0 && (
                <div className="admin-map-container" style={{ height: '400px', marginBottom: '30px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                    <MapContainer center={[-40.1687, -71.3473]} zoom={9} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                            maxZoom={20}
                            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                        />
                        {submissions.map((sub) => {
                            const positions = getPolygonPositions(sub.polygon);
                            if (positions.length === 0) return null;
                            return (
                                <Polygon
                                    key={sub.id}
                                    positions={positions}
                                    pathOptions={{ color: '#e53e3e', fillColor: '#e53e3e', fillOpacity: 0.4 }}
                                >
                                    <Popup>
                                        <strong>{sub.establecimiento}</strong><br />
                                        Superficie: {sub.area_has} ha<br />
                                        Fecha: {sub.fecha ? new Date(sub.fecha).toLocaleDateString('es-AR') : 'N/A'}<br />
                                        <button
                                            onClick={() => downloadKML(sub.id, sub.establecimiento)}
                                            style={{ marginTop: '5px', cursor: 'pointer' }}
                                        >
                                            📥 Descargar KML
                                        </button>
                                    </Popup>
                                </Polygon>
                            );
                        })}
                    </MapContainer>
                </div>
            )}

            {submissions.length === 0 ? (
                <p className="no-data">No hay registros todavía</p>
            ) : (
                <>
                    <div className="submissions-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Fecha</th>
                                    <th>Establecimiento</th>
                                    <th>Superficie</th>
                                    <th>Email</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((sub) => (
                                    <tr key={sub.id}>
                                        <td>{sub.id}</td>
                                        <td>{sub.fecha ? new Date(sub.fecha).toLocaleDateString('es-AR') : '-'}</td>
                                        <td>{sub.establecimiento}</td>
                                        <td><strong>{sub.area_has} ha</strong></td>
                                        <td>{sub.email}</td>
                                        <td className="actions-cell">
                                            <button
                                                onClick={() => downloadKML(sub.id, sub.establecimiento)}
                                                className="action-btn download-btn"
                                                title="Descargar KML"
                                            >
                                                📥
                                            </button>
                                            <button
                                                onClick={() => handleDelete(sub.id)}
                                                className="action-btn delete-btn"
                                                title="Eliminar registro"
                                                style={{ backgroundColor: '#e53e3e', marginLeft: '5px' }}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    <div className="pagination" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px', alignItems: 'center' }}>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{ padding: '8px 16px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            ⬅️ Anterior
                        </button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={{ padding: '8px 16px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                        >
                            Siguiente ➡️
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminPanel;
