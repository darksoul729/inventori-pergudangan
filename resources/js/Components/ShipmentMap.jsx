import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Component to handle map view changes
function MapFocus({ shipments }) {
    const map = useMap();

    useEffect(() => {
        if (!shipments || shipments.length === 0) return;

        const bounds = [];
        shipments.forEach(s => {
            if (s.origin_lat && s.origin_lng) bounds.push([parseFloat(s.origin_lat), parseFloat(s.origin_lng)]);
            if (s.dest_lat && s.dest_lng) bounds.push([parseFloat(s.dest_lat), parseFloat(s.dest_lng)]);
            if (s.driver_lat && s.driver_lng) bounds.push([parseFloat(s.driver_lat), parseFloat(s.driver_lng)]);
        });

        if (bounds.length > 0) {
            try {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
            } catch (e) {
                console.error("Leaflet fitBounds error:", e);
            }
        }
    }, [shipments, map]);

    return null;
}

export default function ShipmentMap({ shipments = [] }) {
    const center = [-2.5489, 118.0149]; // Center of Indonesia
    
    // Custom icon for shipment nodes
    const nodeIcon = L.divIcon({
        className: 'shipment-node',
        html: `<div style="background-color: #6366f1; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });

    return (
        <div className="relative w-full h-full rounded-[20px] overflow-hidden border border-gray-100">
            <MapContainer 
                center={center} 
                zoom={5} 
                style={{ height: '100%', width: '100%', background: '#f8fafc' }}
                zoomControl={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                touchZoom={false}
                boxZoom={false}
                keyboard={false}
                dragging={false}
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
                
                <MapFocus shipments={shipments} />
                
                {shipments.map((shipment, idx) => {
                    const hasOrigin = shipment.origin_lat && shipment.origin_lng;
                    const hasDest = shipment.dest_lat && shipment.dest_lng;
                    const hasDriver = shipment.driver_lat && shipment.driver_lng;
                    const originPos = hasOrigin ? [parseFloat(shipment.origin_lat), parseFloat(shipment.origin_lng)] : null;
                    const destPos = hasDest ? [parseFloat(shipment.dest_lat), parseFloat(shipment.dest_lng)] : null;
                    const driverPos = hasDriver ? [parseFloat(shipment.driver_lat), parseFloat(shipment.driver_lng)] : null;
                    
                    return (
                        <React.Fragment key={idx}>
                            {/* Planned Route */}
                            {originPos && destPos && (
                                <Polyline 
                                    positions={[originPos, destPos]} 
                                    color="#6366f1" 
                                    weight={3} 
                                    opacity={0.4} 
                                    dashArray="10, 10" 
                                />
                            )}

                            {/* Actual Driver Route */}
                            {originPos && driverPos && (
                                <Polyline
                                    positions={[originPos, driverPos]}
                                    color="#22c55e"
                                    weight={4}
                                    opacity={0.85}
                                />
                            )}

                            {driverPos && destPos && shipment.status === 'in-transit' && (
                                <Polyline
                                    positions={[driverPos, destPos]}
                                    color="#f59e0b"
                                    weight={4}
                                    opacity={0.7}
                                    dashArray="8, 8"
                                />
                            )}

                            {/* Origin Marker */}
                            {originPos && (
                                <Marker position={originPos} icon={nodeIcon}>
                                    <Popup>
                                        <div className="font-bold text-[11px]">Asal: {shipment.origin_name}</div>
                                    </Popup>
                                </Marker>
                            )}

                            {/* Destination Marker */}
                            {destPos && (
                                <Marker position={destPos} icon={nodeIcon}>
                                    <Popup>
                                        <div className="font-bold text-[11px]">Tujuan: {shipment.destination_name}</div>
                                    </Popup>
                                </Marker>
                            )}

                            {/* Driver Live Position (If In-Transit) */}
                            {shipment.driver_lat && shipment.driver_lng && (
                                <Marker 
                                    position={[parseFloat(shipment.driver_lat), parseFloat(shipment.driver_lng)]}
                                    icon={L.divIcon({
                                        className: 'driver-live',
                                        html: `<div style="background-color: ${shipment.status === 'delivered' ? '#22c55e' : '#ef4444'}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(${shipment.status === 'delivered' ? '34, 197, 94' : '239, 68, 68'}, 0.6); animation: pulse 2s infinite;"></div>`,
                                        iconSize: [14, 14],
                                        iconAnchor: [7, 7]
                                    })}
                                >
                                    <Popup>
                                        <div className={`font-black text-[12px] uppercase mb-1 ${shipment.status === 'delivered' ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {shipment.status === 'delivered' ? 'Pengiriman Selesai' : 'Posisi Driver'}
                                        </div>
                                        <div className="font-bold text-[11px]">{shipment.driver_name}</div>
                                    </Popup>
                                </Marker>
                            )}
                        </React.Fragment>
                    );
                })}

                <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase">Live Shipment Routes</span>
                    </div>
                </div>
            </MapContainer>
            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.5); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
