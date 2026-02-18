import React, { useState } from 'react';
import axios from 'axios';
import MapDrawer from './MapDrawer';
import { ESTABLECIMIENTOS } from '../constants/establecimientos';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const SubmissionForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        establecimiento: '',
        fecha: new Date().toISOString().split('T')[0] // Fecha de hoy por defecto
    });
    const [polygon, setPolygon] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [submittedId, setSubmittedId] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePolygonChange = (polygonData) => {
        setPolygon(polygonData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        if (!formData.email || !formData.establecimiento) {
            setMessage({ type: 'error', text: 'Por favor completa todos los campos' });
            setLoading(false);
            return;
        }

        if (!polygon) {
            setMessage({ type: 'error', text: 'Por favor dibuja el área en el mapa' });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/api/submissions`, {
                ...formData,
                polygon
            });

            console.log('Respuesta:', response.data);
            setSubmittedId(response.data.data.id); // Guardar ID para descarga
            setMessage({ type: 'success', text: 'Registro guardado exitosamente!' });

            // NO reseteamos formulario aquí para dejar que el usuario descargue
        } catch (error) {
            console.error('Error al enviar:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.error || 'Error al guardar el registro'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            email: '',
            establecimiento: '',
            fecha: new Date().toISOString().split('T')[0]
        });
        setPolygon(null);
        setSubmittedId(null);
        setMessage({ type: '', text: '' });
        // Recargar la página es la forma más limpia de limpiar el mapa completamente
        window.location.reload();
    };

    const downloadKML = async () => {
        if (!submittedId) return;
        try {
            const response = await axios.get(`${API_URL}/api/submissions/${submittedId}/kml`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${formData.establecimiento}_${submittedId}.kml`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Error al descargar el archivo KML');
        }
    };

    if (submittedId) {
        return (
            <div className="submission-form">
                <div className="success-container">
                    <h1>✅ ¡Registro Exitoso!</h1>
                    <p>Se ha guardado el polígono para el establecimiento: <strong>{formData.establecimiento}</strong></p>

                    <div className="success-actions">
                        <button onClick={downloadKML} className="download-btn-large">
                            📥 Descargar KML Ahora
                        </button>

                        <button onClick={handleReset} className="new-submission-btn">
                            📝 Crear Nuevo Registro
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="submission-form">
            <div className="form-header">
                <h1>🗺️ Registro de Campos de Caza</h1>
                <p>Completa el formulario y dibuja el polígono de tu campo destinado a actividad de caza</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Fecha de Siembra/Verdeo:</label>
                    <input
                        type="date"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label>Correo Electrónico:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="tu@email.com"
                        required
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="establecimiento">
                        Establecimiento <span className="required">*</span>
                    </label>
                    <select
                        id="establecimiento"
                        name="establecimiento"
                        value={formData.establecimiento}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Selecciona un establecimiento</option>
                        {ESTABLECIMIENTOS.map((est, index) => (
                            <option key={index} value={est}>
                                {est}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>
                        Área del Campo <span className="required">*</span>
                    </label>
                    <MapDrawer onPolygonChange={handlePolygonChange} />
                </div>

                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                >
                    {loading ? 'Guardando...' : 'Guardar Registro'}
                </button>
            </form>
        </div>
    );
};

export default SubmissionForm;
