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

// Fix traducciones al español para leaflet-draw
if (L.drawLocal) {
    L.drawLocal.draw.toolbar.actions.title = 'Cancelar dibujo';
    L.drawLocal.draw.toolbar.actions.text = 'Cancelar';
    L.drawLocal.draw.toolbar.finish.title = 'Finalizar dibujo';
    L.drawLocal.draw.toolbar.finish.text = 'Finalizar';
    L.drawLocal.draw.toolbar.undo.title = 'Borrar último punto dibujado';
    L.drawLocal.draw.toolbar.undo.text = 'Borrar último punto';
    L.drawLocal.draw.toolbar.buttons.polygon = 'Dibujar un polígono';

    L.drawLocal.draw.handlers.polygon.tooltip.start = 'Haga clic para empezar a dibujar el polígono.';
    L.drawLocal.draw.handlers.polygon.tooltip.cont = 'Haga clic para continuar. (Botón "Borrar último punto" arriba).';
    L.drawLocal.draw.handlers.polygon.tooltip.end = 'Haga clic en el primer punto para cerrar el polígono.';

    L.drawLocal.edit.toolbar.actions.save.title = 'Guardar cambios';
    L.drawLocal.edit.toolbar.actions.save.text = 'Guardar';
    L.drawLocal.edit.toolbar.actions.cancel.title = 'Cancelar edición';
    L.drawLocal.edit.toolbar.actions.cancel.text = 'Cancelar';
    L.drawLocal.edit.toolbar.actions.clearAll.title = 'Borrar todos los polígonos';
    L.drawLocal.edit.toolbar.actions.clearAll.text = 'Borrar todo';

    L.drawLocal.edit.toolbar.buttons.edit = 'Editar polígonos';
    L.drawLocal.edit.toolbar.buttons.editDisabled = 'No hay polígonos para editar';
    L.drawLocal.edit.toolbar.buttons.remove = 'Borrar polígonos usando la herramienta';
    L.drawLocal.edit.toolbar.buttons.removeDisabled = 'No hay polígonos para borrar';

    L.drawLocal.edit.handlers.edit.tooltip.text = 'Arrastre los nodos para editar el polígono.';
    L.drawLocal.edit.handlers.edit.tooltip.subtext = 'Haga clic en Guardar para conservar los cambios.';
    L.drawLocal.edit.handlers.remove.tooltip.text = 'Haga clic en un polígono para borrarlo, luego pulse Guardar.';
}

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
                featureGroup: featureGroupRef.current,
                remove: true // Asegura que el botón de borrar está presente en la barra de herramientas de edición de Leaflet-Draw
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
                <strong>Tip:</strong> Puedes agregar 2 o 3 polígonos más. Usa <strong>DIBUJAR</strong> para añadir otras áreas y guardar todo junto.
            </div>
        </div>
    );
};

export default MapDrawer;
