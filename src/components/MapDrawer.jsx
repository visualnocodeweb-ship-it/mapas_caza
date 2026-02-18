import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix para iconos de Leaflet en Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para manejar los controles de dibujo
function DrawControls({ onPolygonChange }) {
    const map = useMap();
    const featureGroupRef = useRef(new L.FeatureGroup());

    useEffect(() => {
        const featureGroup = featureGroupRef.current;
        map.addLayer(featureGroup);

        const drawControl = new L.Control.Draw({
            position: 'topright',
            draw: {
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
                polygon: {
                    allowIntersection: false,
                    drawError: {
                        color: '#e74c3c',
                        message: 'El polígono no puede intersectarse'
                    },
                    shapeOptions: {
                        color: '#2ecc71',
                        weight: 3,
                        fillOpacity: 0.3
                    }
                }
            },
            edit: {
                featureGroup: featureGroup
            }
        });

        map.addControl(drawControl);

        // Evento cuando se crea un polígono
        map.on(L.Draw.Event.CREATED, (e) => {
            const layer = e.layer;

            // Limpiar polígonos anteriores
            featureGroup.clearLayers();
            featureGroup.addLayer(layer);

            const geoJSON = layer.toGeoJSON();
            onPolygonChange(geoJSON.geometry);
        });

        // Evento cuando se edita un polígono
        map.on(L.Draw.Event.EDITED, (e) => {
            const layers = e.layers;
            layers.eachLayer((layer) => {
                const geoJSON = layer.toGeoJSON();
                onPolygonChange(geoJSON.geometry);
            });
        });

        // Evento cuando se elimina un polígono
        map.on(L.Draw.Event.DELETED, () => {
            onPolygonChange(null);
        });

        return () => {
            map.removeControl(drawControl);
            map.removeLayer(featureGroup);
        };
    }, [map, onPolygonChange]);

    return null;
}

const MapDrawer = ({ onPolygonChange }) => {
    // Centro de Argentina (aproximadamente Neuquén)
    const center = [-38.9516, -68.0591];
    const zoom = 8;

    return (
        <div className="map-container">
            <MapContainer center={[-40.1687, -71.3473]} zoom={10} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    maxZoom={20}
                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                    attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                />
                <DrawControls onPolygonChange={onPolygonChange} />
            </MapContainer>
            <div className="map-hint">
                <span className="hint-icon">👆</span>
                Usa el botón del polígono (⬠) arriba a la derecha para dibujar tu área de caza
            </div>
        </div>
    );
};

export default MapDrawer;
