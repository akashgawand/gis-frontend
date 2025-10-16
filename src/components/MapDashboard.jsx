import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import Draw from 'ol/interaction/Draw';
import { defaults as defaultControls } from 'ol/control';
import { fromLonLat } from 'ol/proj';
import { GeoJSON } from 'ol/format';
import { geometriesAPI } from '../services/api';
import GeometryForm from './GeometryForm';
import './MapDashboard.css';

const MapDashboard = () => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const vectorSourceRef = useRef(null);
    const drawInteractionRef = useRef(null);

    const [drawType, setDrawType] = useState('None');
    const [showForm, setShowForm] = useState(false);
    const [currentGeometry, setCurrentGeometry] = useState(null);
    const [geometries, setGeometries] = useState([]);

 
    useEffect(() => {
        if (!mapRef.current) {
            console.error('[Map] mapRef is null');
            return;
        }

      
        const initTimer = setTimeout(() => {
            const vectorSource = new VectorSource();
            vectorSourceRef.current = vectorSource;

            const vectorLayer = new VectorLayer({
                source: vectorSource
            });

            const map = new Map({
                target: mapRef.current,
                layers: [
                    new TileLayer({
                        source: new OSM()
                    }),
                    vectorLayer,
                ],
                view: new View({
                    center: fromLonLat([78.9629, 20.5937]),
                    zoom: 5,
                }),
                controls: defaultControls(),
            });

            mapInstanceRef.current = map;

           
            setTimeout(() => {
                map.updateSize();
                console.log('[Map] initialized and sized');
            }, 100);

           
            loadGeometries();
        }, 50);

        return () => {
            clearTimeout(initTimer);
            if (drawInteractionRef.current && mapInstanceRef.current) {
                mapInstanceRef.current.removeInteraction(drawInteractionRef.current);
                drawInteractionRef.current = null;
            }
            if (mapInstanceRef.current) {
                mapInstanceRef.current.setTarget(null);
                mapInstanceRef.current = null;
            }
        };
    }, []);

  
    useEffect(() => {
        const map = mapInstanceRef.current;
        const source = vectorSourceRef.current;

        if (!map || !source) return;

       
        if (drawInteractionRef.current) {
            map.removeInteraction(drawInteractionRef.current);
            drawInteractionRef.current = null;
        }

        const canDraw = drawType !== 'None';

        if (canDraw) {
            if (!['Point', 'LineString', 'Polygon'].includes(drawType)) {
                console.warn('[Draw] invalid type', drawType);
                return;
            }

            const draw = new Draw({
                source,
                type: drawType,
            });

            draw.on('drawend', (event) => {
                const feature = event.feature;
                const geometry = feature.getGeometry();
                console.log('[Draw] drawend', geometry.getType(), geometry.getCoordinates());

                setCurrentGeometry({
                    type: drawType,
                    coordinates: geometry.getCoordinates(),
                    feature,
                });
                setShowForm(true);
            });

            map.addInteraction(draw);
            drawInteractionRef.current = draw;
            console.log('[Draw] added', drawType);
        } else {
            console.log('[Draw] none selected');
        }
    }, [drawType]);

    const loadGeometries = async () => {
        try {
            const resp = await geometriesAPI.getAll();
            setGeometries(resp.data);

            const features = resp.data.map((geom) => {
                const feature = new GeoJSON().readFeature(geom.geometry, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857',
                });
                feature.setId(geom.id);
                return feature;
            });

            if (vectorSourceRef.current) {
                vectorSourceRef.current.clear();
                vectorSourceRef.current.addFeatures(features);
            }
            console.log('[Load] features added', features.length);
        } catch (err) {
            console.error('[Load] geometries error', err);
        }
    };

    const handleSaveGeometry = async (formData) => {
        try {
            await geometriesAPI.create({
                name: formData.name,
                description: formData.description,
                geometryType: currentGeometry.type,
                coordinates: currentGeometry.coordinates,
                metadata: formData.metadata,
            });

            setShowForm(false);
            setCurrentGeometry(null);
            await loadGeometries();
            alert('Geometry saved successfully!');
        } catch (error) {
            console.error('[Save] error', error);
            alert(error.response?.data?.message || 'Error saving geometry');

            if (currentGeometry?.feature && vectorSourceRef.current) {
                vectorSourceRef.current.removeFeature(currentGeometry.feature);
            }
        }
    };

    const handleCancelForm = () => {
        if (currentGeometry?.feature && vectorSourceRef.current) {
            vectorSourceRef.current.removeFeature(currentGeometry.feature);
        }
        setShowForm(false);
        setCurrentGeometry(null);
    };

    const handleDeleteGeometry = async (id) => {
        try {
            await geometriesAPI.delete(id);
            await loadGeometries();
            alert('Geometry deleted successfully!');
        } catch (error) {
            console.error('[Delete] error', error);
            alert('Error deleting geometry');
        }
    };

    return (
        <div className="map-dashboard">
            <div className="map-controls">
                <h3>Drawing Tools</h3>
                <div className="control-buttons">

                    <button
                        onClick={() => setDrawType('None')}
                        className={drawType === 'None' ? 'active' : ''}
                    >
                        None
                    </button>
                    <button
                        onClick={() => setDrawType('Point')}
                        className={drawType === 'Point' ? 'active' : ''}
                    >
                        Point
                    </button>
                    <button
                        onClick={() => setDrawType('LineString')}
                        className={drawType === 'LineString' ? 'active' : ''}
                    >
                        Line
                    </button>
                    <button
                        onClick={() => setDrawType('Polygon')}
                        className={drawType === 'Polygon' ? 'active' : ''}
                    >
                        Polygon
                    </button>
                </div>
                <button
                    onClick={() => window.location.href = '/admin'}
                    style={{
                        padding: '12px 16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        marginBottom: '20px',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                    Admin Panel
                </button>

                <div className="geometries-list">
                    <h3>Saved Geometries</h3>
                    <div className="list-items">
                        {geometries.length === 0 ? (
                            <p style={{ color: '#999', fontSize: '0.9rem' }}>No geometries yet</p>
                        ) : (
                            geometries.map((geom) => (
                                <div key={geom.id} className="list-item">
                                    <div>
                                        <strong>{geom.name}</strong>
                                        <span className="geometry-type">{geom.geometry_type}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteGeometry(geom.id)}
                                        className="delete-btn"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div
                ref={mapRef}
                className="map-container"
                style={{
                    flex: 1,
                    minHeight: 0,
                    position: 'relative',
                    width: '100%'
                }}
            />

            {showForm && (
                <GeometryForm
                    onSave={handleSaveGeometry}
                    onCancel={handleCancelForm}
                    geometryType={currentGeometry?.type}
                />
            )}
        </div>
    );
};

export default MapDashboard;
