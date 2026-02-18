import React, { useState } from 'react';
import axios from 'axios';
import MapDrawer from './MapDrawer';
import { ESTABLECIMIENTOS } from '../constants/establecimientos';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const SubmissionForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        establecimiento: ''
    });
    const [polygon, setPolygon] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

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
        setMessage({ type: '', text: '' });

        // Validaciones
        if (!formData.email || !formData.establecimiento) {
            setMessage({ type: 'error', text: 'Por favor completa todos los campos' });
            return;
        }

        if (!polygon) {
            setMessage({ type: 'error', text: 'Por favor dibuja un polígono en el mapa' });
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/api/submissions`, {
                email: formData.email,
                establecimiento: formData.establecimiento,
                polygon: polygon
            });

            setMessage({
                type: 'success',
                text: '✅ Registro guardado exitosamente. Puedes descargar el KML desde el panel de administración.'
            });

            // Limpiar formulario
            setFormData({ email: '', establecimiento: '' });
            setPolygon(null);

            // Recargar el mapa (esto limpiará el polígono dibujado)
            window.location.reload();

        } catch (error) {
            console.error('Error al enviar:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.error || 'Error al guardar el registro. Intenta nuevamente.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="submission-form">
            <div className="form-header">
                <h1>🗺️ Registro de Campos de Caza</h1>
                <p>Completa el formulario y dibuja el polígono de tu campo destinado a actividad de caza</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">
                        Email <span className="required">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="tu@email.com"
                        required
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
