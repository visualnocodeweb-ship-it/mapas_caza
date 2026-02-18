import tokml from 'tokml';

/**
 * Convierte un objeto GeoJSON a formato KML
 * @param {Object} geojson - Objeto GeoJSON con geometría de polígono
 * @param {Object} properties - Propiedades adicionales para el KML
 * @returns {string} - String en formato KML
 */
export function geojsonToKml(geojson, properties = {}) {
    const feature = {
        type: 'Feature',
        geometry: geojson,
        properties: {
            name: properties.establecimiento || 'Campo de Caza',
            description: `Email: ${properties.email || 'N/A'}\nFecha: ${properties.created_at || new Date().toISOString()}`,
            ...properties
        }
    };

    const featureCollection = {
        type: 'FeatureCollection',
        features: [feature]
    };

    return tokml(featureCollection);
}

/**
 * Convierte múltiples registros a un solo archivo KML
 * @param {Array} submissions - Array de registros con geometría y propiedades
 * @returns {string} - String en formato KML
 */
export function submissionsToKml(submissions) {
    const features = submissions.map(sub => ({
        type: 'Feature',
        geometry: sub.polygon,
        properties: {
            name: sub.establecimiento,
            description: `Email: ${sub.email}\nFecha: ${sub.created_at}`,
            id: sub.id,
            email: sub.email,
            establecimiento: sub.establecimiento
        }
    }));

    const featureCollection = {
        type: 'FeatureCollection',
        features
    };

    return tokml(featureCollection);
}
