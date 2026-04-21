import React, { useEffect } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { router } from '@inertiajs/react';
import 'leaflet/dist/leaflet.css';

const INDONESIA_CENTER = [-2.5489, 118.0149];

function isValidCoordinate(value) {
    if (value === null || value === undefined || value === '') return false;

    return Number.isFinite(Number(value));
}

function pointFrom(lat, lng) {
    return isValidCoordinate(lat) && isValidCoordinate(lng)
        ? [Number(lat), Number(lng)]
        : null;
}

function pointIcon({ color, icon, pulse = false }) {
    const iconHtml = icon === 'warehouse' 
        ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V8l9-5 9 5v13"/><path d="M9 21V11h6v10"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`;

    return L.divIcon({
        className: 'shipment-map-marker',
        html: `
            <div class="shipment-marker ${pulse ? 'shipment-marker-pulse' : ''}" style="--marker-color: ${color};">
                ${iconHtml}
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    });
}

function MapFocus({ shipments }) {
    const map = useMap();

    useEffect(() => {
        if (!shipments || shipments.length === 0) return;

        const bounds = [];

        shipments.forEach((shipment) => {
            const origin = pointFrom(shipment.origin_lat, shipment.origin_lng);
            const destination = pointFrom(shipment.dest_lat, shipment.dest_lng);
            const driver = pointFrom(shipment.driver_lat, shipment.driver_lng);

            if (origin) bounds.push(origin);
            if (destination) bounds.push(destination);
            if (driver) bounds.push(driver);
        });

        if (bounds.length === 1) {
            map.flyTo(bounds[0], 11, { duration: 0.6 });
            return;
        }

        if (bounds.length > 1) {
            map.fitBounds(bounds, { padding: [72, 72], maxZoom: 9 });
        }
    }, [shipments, map]);

    return null;
}

function RouteLines({ origin, destination, driver, shipment }) {
    const isDelivered = shipment.tracking_stage === 'delivered' || shipment.status === 'delivered';
    const hasLiveDriver = Boolean(driver);

    return (
        <>
            {origin && destination && (
                <Polyline
                    positions={[origin, destination]}
                    color="#2563eb"
                    weight={4}
                    opacity={0.55}
                    dashArray="10 12"
                />
            )}

            {origin && hasLiveDriver && (
                <Polyline
                    positions={[origin, driver]}
                    color={isDelivered ? '#10b981' : '#059669'}
                    weight={5}
                    opacity={0.9}
                />
            )}

            {hasLiveDriver && destination && !isDelivered && (
                <Polyline
                    positions={[driver, destination]}
                    color="#f59e0b"
                    weight={4}
                    opacity={0.8}
                    dashArray="8 10"
                />
            )}
        </>
    );
}

export default function ShipmentMap({ shipments = [] }) {
    const hasAnyGps = shipments.some((shipment) => pointFrom(shipment.driver_lat, shipment.driver_lng));

    return (
        <div className="relative h-full w-full overflow-hidden rounded-[20px] border border-gray-100 bg-slate-100">
            <MapContainer
                center={INDONESIA_CENTER}
                zoom={5}
                style={{ height: '100%', width: '100%', background: '#eef2f7' }}
                zoomControl={false}
                scrollWheelZoom
            >
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='Tiles &copy; Esri'
                />
                <TileLayer
                    url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                    attribution='Labels &copy; Esri'
                    opacity={0.8}
                />

                <MapFocus shipments={shipments} />

                {shipments.map((shipment, index) => {
                    const origin = pointFrom(shipment.origin_lat, shipment.origin_lng);
                    const destination = pointFrom(shipment.dest_lat, shipment.dest_lng);
                    const driver = pointFrom(shipment.driver_lat, shipment.driver_lng);
                    const isDelivered = shipment.tracking_stage === 'delivered' || shipment.status === 'delivered';

                    return (
                        <React.Fragment key={shipment.database_id || shipment.id || index}>
                            <RouteLines
                                origin={origin}
                                destination={destination}
                                driver={driver}
                                shipment={shipment}
                            />

                            {origin && (
                                <Marker position={origin} icon={pointIcon({ color: '#4f46e5', icon: 'warehouse' })}>
                                    <Popup>
                                        <div className="text-[11px] font-black uppercase tracking-wide text-indigo-600">Asal Pengiriman</div>
                                        <div className="text-[13px] font-bold text-slate-900">{shipment.origin_name}</div>
                                        <div className="text-[11px] font-semibold text-slate-500">{shipment.origin}</div>
                                    </Popup>
                                </Marker>
                            )}

                            {destination && (
                                <Marker position={destination} icon={pointIcon({ color: '#2563eb', icon: 'flag' })}>
                                    <Popup>
                                        <div className="text-[11px] font-black uppercase tracking-wide text-blue-600">Tujuan Akhir</div>
                                        <div className="text-[13px] font-bold text-slate-900">{shipment.destination_name}</div>
                                        <div className="text-[11px] font-semibold text-slate-500">{shipment.destination}</div>
                                    </Popup>
                                </Marker>
                            )}

                            {driver && (
                                <Marker
                                    position={driver}
                                    icon={L.divIcon({
                                        className: 'custom-div-icon',
                                        html: `
                                            <div class="truck-marker-container" style="--marker-color: ${shipment.last_location_mock ? '#ef4444' : '#10b981'};">
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
                                    <Popup>
                                        <div className={`mb-1 text-[11px] font-black uppercase tracking-wide ${isDelivered ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {isDelivered ? 'Pengiriman Selesai' : 'Posisi Driver dari GPS App'}
                                        </div>
                                        <div className="text-[13px] font-bold text-slate-900">{shipment.driver_name || 'Driver'}</div>
                                        <div className="text-[11px] font-semibold text-slate-500">
                                            {shipment.last_location_at ? `Update ${shipment.last_location_at}` : `${driver[0]}, ${driver[1]}`}
                                        </div>
                                        
                                        {shipment.driver_id && (
                                            <button
                                                onClick={() => router.get(route('drivers.index'), { tab: 'tracking', id: shipment.driver_id })}
                                                className="mt-3 w-full flex items-center justify-center gap-2 bg-[#3632c0] hover:bg-[#2a27a3] text-white text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-lg transition-all shadow-md active:scale-95"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Lihat di Live Tracking
                                            </button>
                                        )}
                                    </Popup>
                                </Marker>
                            )}
                        </React.Fragment>
                    );
                })}
            </MapContainer>

            {!hasAnyGps && (
                <div className="absolute left-4 top-4 z-[1000] max-w-[280px] rounded-2xl border border-amber-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
                    <div className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-600">GPS Driver Belum Masuk</div>
                    <div className="mt-1 text-[12px] font-semibold leading-relaxed text-slate-600">
                        Marker driver akan muncul setelah driver app mengirim lokasi ke server.
                    </div>
                </div>
            )}

            <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-gray-100 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Rute Asal - Tujuan</span>
                </div>
            </div>

            <style>{`
                .shipment-map-marker {
                    background: transparent;
                    border: 0;
                }

                .shipment-marker {
                    align-items: center;
                    background: var(--marker-color);
                    border: 3px solid #fff;
                    border-radius: 999px;
                    box-shadow: 0 10px 25px rgb(15 23 42 / 0.25);
                    color: #fff;
                    display: flex;
                    justify-content: center;
                    position: relative;
                    width: 32px;
                    height: 32px;
                }

                .shipment-marker svg {
                    width: 16px;
                    height: 16px;
                }

                .truck-marker-container {
                    position: relative;
                    width: 42px;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .truck-icon-bg {
                    width: 42px;
                    height: 42px;
                    background: var(--marker-color);
                    border: 3px solid white;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.25);
                    z-index: 2;
                }

                .truck-icon-bg svg {
                    width: 24px;
                    height: 24px;
                }

                .shipment-marker-pulse::after, .truck-pulse {
                    animation: shipment-marker-pulse 2s infinite;
                    border: 2px solid var(--marker-color);
                    border-radius: 999px;
                    content: '';
                    inset: -8px;
                    opacity: 0.45;
                    position: absolute;
                }
                
                .truck-pulse {
                    border-radius: 16px;
                    inset: -6px;
                }

                @keyframes shipment-marker-pulse {
                    0% { transform: scale(0.8); opacity: 0.6; }
                    70% { transform: scale(1.4); opacity: 0; }
                    100% { transform: scale(1.4); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
