import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix para iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para manejar los controles de dibujo
const DrawControls = ({ onPolygonChange }) => {
    const map = useMap();
    const featureGroupRef = useRef(new L.FeatureGroup());

    useEffect(() => {
        const featureGroup = featureGroupRef.current;
        map.addLayer(featureGroup);

        const updateParent = () => {
            const layers = featureGroup.getLayers();
            if (layers.length === 0) {
                onPolygonChange(null);
                return;
            }

            // Construir MultiPolygon a partir de todas las capas
            const coordinates = layers.map(layer => {
                const geoJSON = layer.toGeoJSON();
                return geoJSON.geometry.coordinates; // [[[x,y],...]]
            });

            const multiPolygon = {
                type: "MultiPolygon",
                coordinates: coordinates
            };

            onPolygonChange(multiPolygon);
        };

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

        // Eventos
        map.on(L.Draw.Event.CREATED, (e) => {
            const layer = e.layer;
            featureGroup.addLayer(layer);
            updateParent();
        });

        map.on(L.Draw.Event.EDITED, () => {
            updateParent();
        });

        map.on(L.Draw.Event.DELETED, () => {
            updateParent();
        });

        return () => {
            map.removeControl(drawControl);
            map.removeLayer(featureGroup);
            map.off(L.Draw.Event.CREATED);
            map.off(L.Draw.Event.EDITED);
            map.off(L.Draw.Event.DELETED);
        };
    }, [map, onPolygonChange]);

    return null;
};

const MapDrawer = ({ onPolygonChange }) => {
    return (
        <div className="map-container">
            <MapContainer center={[-40.1687, -71.3473]} zoom={9} style={{ height: '500px', width: '100%', borderRadius: '12px' }}>
                <TileLayer
                    url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    maxZoom={20}
                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                    attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                />
                <DrawControls onPolygonChange={onPolygonChange} />
            </MapContainer>
            <div className="map-hint">
                <span className="hint-icon">💡</span>
                <strong>Tip:</strong> Puedes dibujar varios polígonos. Usa el botón <strong>DIBUJAR</strong> para agregar áreas y <strong>EDITAR/BORRAR</strong> para modificar.
            </div>
        </div>
    );
};

export default MapDrawer;
