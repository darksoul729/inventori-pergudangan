import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

// Fix for default marker icons not showing in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom component to handle map auto-bounds/centering
function RecenterMap({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords.length > 0) {
            const bounds = L.latLngBounds(coords.map(c => [c.lat, c.lng]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [coords, map]);
    return null;
}

// Custom component to handle smooth focusing on a specific driver
function FocusMap({ focusedDriverId, drivers }) {
    const map = useMap();
    useEffect(() => {
        if (focusedDriverId) {
            const driver = drivers.find(d => d.id === focusedDriverId);
            if (driver && driver.latitude && driver.longitude) {
                map.flyTo([parseFloat(driver.latitude), parseFloat(driver.longitude)], 16, {
                    duration: 1.5,
                    easeLinearity: 0.25
                });
            }
        }
    }, [focusedDriverId, drivers, map]);
    return null;
}

export default function LiveMap({ onDriversLoad = () => {}, focusedDriverId = null, onMarkerClick = () => {} }) {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLocations = async () => {
        try {
            const response = await axios.get(route('drivers.locations'));
            setDrivers(response.data);
            onDriversLoad(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching driver locations:', error);
        }
    };

    useEffect(() => {
        fetchLocations();
        // Poll every 15 seconds
        const interval = setInterval(fetchLocations, 15000);
        return () => clearInterval(interval);
    }, []);

    const activeCoords = drivers
        .filter(d => d.latitude && d.longitude)
        .map(d => ({ lat: parseFloat(d.latitude), lng: parseFloat(d.longitude) }));

    return (
        <div className="h-full w-full rounded-[32px] overflow-hidden border border-gray-100 shadow-xl relative bg-gray-50 bg-white">
            {loading && (
                <div className="absolute inset-0 z-[1000] bg-white/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3632c0]"></div>
                </div>
            )}
            
            <MapContainer 
                center={[-6.200000, 106.816666]} 
                zoom={13} 
                style={{ height: '100%', width: '100%', background: '#f8fafc' }}
                className="z-10"
            >
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='Tiles &copy; Esri'
                />
                <TileLayer
                    url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                    attribution='Labels &copy; Esri'
                    opacity={0.9}
                />
                
                {drivers.map((driver) => (
                    driver.latitude && driver.longitude && (
                        <Marker 
                            key={driver.id} 
                            position={[parseFloat(driver.latitude), parseFloat(driver.longitude)]}
                            eventHandlers={{
                                click: () => onMarkerClick(driver.id)
                            }}
                            icon={L.divIcon({
                                className: 'custom-div-icon',
                                html: `
                                    <div class="truck-marker-container" style="--marker-color: ${driver.last_location_mock ? '#ef4444' : '#3632c0'};">
                                        <div class="truck-pulse"></div>
                                        <div class="truck-icon-bg">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M22.21 10.74c-.04-.08-.08-.16-.13-.23l-3-4C18.84 6.18 18.44 6 18 6H9c-1.1 0-2 .9-2 2v2H2c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4c0 1.66 1.34 3 3 3s3-1.34 3-3h1c1.1 0 2-.9 2-2v-5.26c0-.28-.06-.56-.16-.8c-.06-.15-.14-.29-.24-.42l-.39-.58zM7 19c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm11 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm1-9.5V12h-3V7.5L18 9.5z" />
                                            </svg>
                                        </div>
                                    </div>
                                `,
                                iconSize: [40, 40],
                                iconAnchor: [20, 20],
                                popupAnchor: [0, -20]
                            })}
                        >
                            <Popup className="custom-map-popup">
                                <div className="p-2 min-w-[150px]">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Driver Aktif</div>
                                    <div className="font-black text-[#1a202c] text-[15px] leading-tight mb-2">{driver.user.name}</div>
                                    
                                    {driver.active_shipment_id ? (
                                        <div className="mb-3 p-2 bg-emerald-50 rounded-xl border border-emerald-100/50">
                                            <div className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter mb-1">Tugas Saat Ini</div>
                                            <div className="font-black text-emerald-900 text-[13px] tracking-tight">{driver.active_shipment_id}</div>
                                            <div className="text-[9px] font-bold text-emerald-600/70 mt-0.5">
                                                {driver.active_shipment_stage === 'ready_for_pickup' && 'Siap Diambil'}
                                                {driver.active_shipment_stage === 'picked_up' && 'Sudah Diambil'}
                                                {driver.active_shipment_stage === 'in_transit' && 'Dalam Perjalanan'}
                                                {driver.active_shipment_stage === 'arrived_at_destination' && 'Sampai Tujuan'}
                                                {driver.active_shipment_stage === 'delivered' && 'Menunggu Verifikasi'}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mb-3 p-2 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Status</div>
                                            <div className="font-black text-gray-400 text-[11px]">Istirahat / Standby</div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2 px-1 inline-block">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                            <span className="text-[9px] font-black text-gray-500 uppercase">Live Tracking</span>
                                        </div>

                                        {Boolean(driver.last_location_mock) && (
                                            <div className="flex items-center space-x-2 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                                <span className="text-[10px] font-black text-red-600 uppercase">Fake GPS Terdeteksi</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-[9px] text-gray-400 font-bold">
                                        <span>Update Terakhir</span>
                                        <span>{new Date(driver.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}

                {!focusedDriverId && <RecenterMap coords={activeCoords} />}
                <FocusMap focusedDriverId={focusedDriverId} drivers={drivers} />
            </MapContainer>

            <div className="absolute bottom-6 left-6 z-[1000] bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">Live Monitoring Active</span>
            </div>
        </div>
    );
}
