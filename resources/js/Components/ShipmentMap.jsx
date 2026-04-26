import React, { useEffect } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { router } from '@inertiajs/react';
import 'leaflet/dist/leaflet.css';

const INDONESIA_CENTER = [-2.5489, 118.0149];

// Waypoint rute realistis dari Samarinda ke berbagai tujuan
// Jalur darat mengikuti jalan utama Kalimantan, jalur laut mengikuti Selat Makassar
const ROUTE_WAYPOINTS = {
    // === JALUR DARAT KALTIM ===
    // Samarinda → Balikpapan: via Jl. Soekarno-Hatta (jalan pantai timur)
    'SMD-BPN': [
        [-0.4948, 117.1436], [-0.4700, 117.0500], [-0.5200, 116.9200],
        [-0.7000, 116.8700], [-0.9000, 116.8400], [-1.1000, 116.8312], [-1.2654, 116.8312],
    ],
    // Samarinda → Tenggarong: via Jl. PT Pupuk Kaltim (jalan pedalaman)
    'SMD-TGR': [
        [-0.4948, 117.1436], [-0.4800, 117.0800], [-0.4600, 117.0200], [-0.4167, 116.9833],
    ],
    // Samarinda → Bontang: via jalan utara pantai timur
    'SMD-BXT': [
        [-0.4948, 117.1436], [-0.4000, 117.2000], [-0.2000, 117.3000],
        [0.0000, 117.4000], [0.1000, 117.4500], [0.1333, 117.4833],
    ],
    // Samarinda → Sangatta: via jalan utara (Bontang → Sangatta)
    'SMD-SGQ': [
        [-0.4948, 117.1436], [-0.4000, 117.2000], [-0.2000, 117.3000],
        [0.0000, 117.4000], [0.1333, 117.4833], [0.3000, 117.5200], [0.5167, 117.5500],
    ],
    // Samarinda → Tarakan: laut utara via Selat Makassar → Tarakan
    'SMD-TRK': [
        [-0.4948, 117.1436], [-0.3000, 117.3000], [0.5000, 117.5000],
        [1.5000, 117.5000], [2.5000, 117.6000], [3.3000, 117.5833],
    ],

    // === JALUR LAUT VIA SELAT MAKASSAR ===
    // Samarinda → Banjarmasin: laut selatan via Selat Makassar → Kalimantan Selatan
    'SMD-BJM': [
        [-0.4948, 117.1436], [-0.8000, 117.0000], [-1.5000, 116.5000],
        [-2.2000, 115.8000], [-2.8000, 115.2000], [-3.2000, 114.8000], [-3.4434, 114.8361],
    ],
    // Samarinda → Palangkaraya: laut via Selat Makassar → darat Kalteng
    'SMD-PKY': [
        [-0.4948, 117.1436], [-0.8000, 117.0000], [-1.5000, 116.5000],
        [-2.0000, 115.5000], [-2.1000, 114.5000], [-2.2083, 113.9167],
    ],
    // Samarinda → Pontianak: laut via Selat Makassar → Selat Karimata → Kalbar
    'SMD-PNK': [
        [-0.4948, 117.1436], [-0.8000, 117.0000], [-1.5000, 116.5000],
        [-2.0000, 115.5000], [-1.5000, 113.0000], [-0.8000, 110.5000], [-0.0226, 109.3444],
    ],
    // Samarinda → Makassar: laut via Selat Makassar
    'SMD-UPG': [
        [-0.4948, 117.1436], [-1.0000, 117.5000], [-2.0000, 118.0000],
        [-3.0000, 118.5000], [-4.0000, 119.0000], [-5.1476, 119.4327],
    ],
    // Samarinda → Surabaya: laut via Selat Makassar → Laut Jawa
    'SMD-SUB': [
        [-0.4948, 117.1436], [-1.0000, 117.5000], [-2.5000, 118.0000],
        [-4.0000, 118.5000], [-5.5000, 117.5000], [-6.5000, 115.5000],
        [-7.0000, 113.0000], [-7.2575, 112.7521],
    ],
    // Samarinda → Jakarta: laut via Selat Makassar → Laut Jawa → Tanjung Priok
    'SMD-JKT': [
        [-0.4948, 117.1436], [-1.0000, 117.5000], [-2.5000, 118.0000],
        [-4.0000, 118.5000], [-5.5000, 117.5000], [-6.5000, 115.5000],
        [-7.0000, 113.0000], [-7.0000, 111.0000], [-6.8000, 109.0000],
        [-6.6000, 107.5000], [-6.4000, 106.9000], [-6.2088, 106.8456],
    ],
    // Samarinda → Semarang: laut via Selat Makassar → Laut Jawa
    'SMD-SRG': [
        [-0.4948, 117.1436], [-1.0000, 117.5000], [-2.5000, 118.0000],
        [-5.5000, 117.5000], [-6.5000, 115.5000], [-6.8000, 112.0000],
        [-6.9667, 110.4167],
    ],
    // Samarinda → Singapore: laut via Selat Makassar → Laut Jawa → Selat Malaka
    'SMD-SIN': [
        [-0.4948, 117.1436], [-1.0000, 117.5000], [-2.5000, 118.0000],
        [-4.0000, 118.5000], [-3.0000, 117.5000], [-2.0000, 116.0000],
        [-1.0000, 114.0000], [0.0000, 110.0000], [0.5000, 107.0000],
        [1.0000, 104.5000], [1.3521, 103.8198],
    ],
    // Samarinda → Denpasar/Bali: laut via Selat Makassar → Laut Jawa → Bali
    'SMD-DPS': [
        [-0.4948, 117.1436], [-1.0000, 117.5000], [-2.5000, 118.0000],
        [-5.5000, 117.5000], [-7.0000, 115.0000], [-7.5000, 114.0000],
        [-8.2000, 114.5000], [-8.6705, 115.2126],
    ],
    // Samarinda → Bandung: laut + darat via Jakarta
    'SMD-BDO': [
        [-0.4948, 117.1436], [-1.0000, 117.5000], [-2.5000, 118.0000],
        [-5.5000, 117.5000], [-6.5000, 115.5000], [-7.0000, 113.0000],
        [-7.0000, 111.0000], [-6.8000, 109.0000], [-6.6000, 107.5000],
        [-6.9175, 107.6191],
    ],
    // Samarinda → Medan: laut via Selat Makassar → Laut Sulawesi → Selat Makassar utara
    'SMD-KNO': [
        [-0.4948, 117.1436], [1.0000, 117.8000], [2.5000, 118.0000],
        [3.0000, 115.0000], [2.0000, 108.0000], [1.0000, 103.0000],
        [2.0000, 100.0000], [3.5952, 98.6722],
    ],
    // Samarinda → Palembang: laut via Selat Makassar → Laut Jawa → Selat Bangka
    'SMD-PLM': [
        [-0.4948, 117.1436], [-1.0000, 117.5000], [-2.5000, 118.0000],
        [-5.5000, 117.5000], [-6.5000, 115.5000], [-5.5000, 108.0000],
        [-4.0000, 106.0000], [-2.9761, 104.7754],
    ],
};

// Fallback: generate curved route using bezier-like midpoint offset
function generateCurvedRoute(origin, destination) {
    if (!origin || !destination) return [origin, destination];

    const [lat1, lng1] = origin;
    const [lat2, lng2] = destination;
    const distLat = lat2 - lat1;
    const distLng = lng2 - lng1;
    const distance = Math.sqrt(distLat * distLat + distLng * distLng);

    // Number of intermediate points based on distance
    const steps = Math.max(3, Math.min(8, Math.floor(distance * 4)));

    // Perpendicular offset for curve (avoids straight line, simulates land/sea detour)
    const offsetFactor = distance > 10 ? 0.08 : distance > 3 ? 0.12 : 0.15;
    const perpLat = -distLng / distance;
    const perpLng = distLat / distance;
    const sign = (lat1 + lat2) / 2 < 0 ? 1 : -1; // curve direction based on hemisphere

    const points = [origin];
    for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const baseLat = lat1 + distLat * t;
        const baseLng = lng1 + distLng * t;
        // Bell curve offset peaking at midpoint
        const bellOffset = Math.sin(t * Math.PI) * distance * offsetFactor * sign;
        points.push([baseLat + perpLat * bellOffset, baseLng + perpLng * bellOffset]);
    }
    points.push(destination);

    return points;
}

// Get route points: use predefined waypoints if available, otherwise generate curved route
function getRoutePoints(originCode, destCode, origin, destination) {
    const key = `${originCode}-${destCode}`;
    if (ROUTE_WAYPOINTS[key]) return ROUTE_WAYPOINTS[key];
    // Try reverse
    const reverseKey = `${destCode}-${originCode}`;
    if (ROUTE_WAYPOINTS[reverseKey]) return [...ROUTE_WAYPOINTS[reverseKey]].reverse();
    // Fallback: curved line
    return generateCurvedRoute(origin, destination);
}

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

    // Get realistic route points
    const routePoints = getRoutePoints(shipment.origin, shipment.destination, origin, destination);

    // Determine route style based on load type
    const isSea = shipment.load_type === 'sea';
    const routeColor = isSea ? '#0ea5e9' : '#2563eb'; // sky blue for sea, indigo for ground
    const routeDash = isSea ? '12 8' : '10 12';

    return (
        <>
            {origin && destination && (
                <Polyline
                    positions={routePoints}
                    color={routeColor}
                    weight={4}
                    opacity={0.6}
                    dashArray={routeDash}
                    lineCap="round"
                    lineJoin="round"
                />
            )}

            {origin && hasLiveDriver && (
                <Polyline
                    positions={[origin, driver]}
                    color={isDelivered ? '#10b981' : '#059669'}
                    weight={5}
                    opacity={0.9}
                    lineCap="round"
                />
            )}

            {hasLiveDriver && destination && !isDelivered && (
                <Polyline
                    positions={[driver, destination]}
                    color="#f59e0b"
                    weight={4}
                    opacity={0.8}
                    dashArray="8 10"
                    lineCap="round"
                />
            )}
        </>
    );
}

export default function ShipmentMap({ shipments = [], mapOptions = {} }) {
    const options = {
        showRoutes: true,
        showOriginMarkers: true,
        showDestinationMarkers: true,
        showDriverMarkers: true,
        showLegend: true,
        ...mapOptions,
    };
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
                            {options.showRoutes && (
                                <RouteLines
                                    origin={origin}
                                    destination={destination}
                                    driver={driver}
                                    shipment={shipment}
                                />
                            )}

                            {options.showOriginMarkers && origin && (
                                <Marker position={origin} icon={pointIcon({ color: '#5932C9', icon: 'warehouse' })}>
                                    <Popup>
                                        <div className="text-[11px] font-black uppercase tracking-wide text-indigo-600">Asal Pengiriman</div>
                                        <div className="text-[13px] font-bold text-slate-900">{shipment.origin_name}</div>
                                        <div className="text-[11px] font-semibold text-slate-500">{shipment.origin}</div>
                                    </Popup>
                                </Marker>
                            )}

                            {options.showDestinationMarkers && destination && (
                                <Marker position={destination} icon={pointIcon({ color: '#2563eb', icon: 'flag' })}>
                                    <Popup>
                                        <div className="text-[11px] font-black uppercase tracking-wide text-blue-600">Tujuan Akhir</div>
                                        <div className="text-[13px] font-bold text-slate-900">{shipment.destination_name}</div>
                                        <div className="text-[11px] font-semibold text-slate-500">{shipment.destination}</div>
                                    </Popup>
                                </Marker>
                            )}

                            {options.showDriverMarkers && driver && (
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
                                                className="mt-3 w-full flex items-center justify-center gap-2 bg-[#28106F] hover:bg-[#2a27a3] text-white text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-lg transition-all shadow-md active:scale-95"
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

            {options.showDriverMarkers && !hasAnyGps && (
                <div className="absolute left-4 top-4 z-[1000] max-w-[280px] rounded-2xl border border-amber-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
                    <div className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-600">GPS Driver Belum Masuk</div>
                    <div className="mt-1 text-[12px] font-semibold leading-relaxed text-slate-600">
                        Marker driver akan muncul setelah driver app mengirim lokasi ke server.
                    </div>
                </div>
            )}

            {options.showLegend && (
                <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-gray-100 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="h-0.5 w-5 bg-indigo-600" style={{ borderTop: '2px dashed #2563eb' }}></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Darat</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-0.5 w-5 bg-sky-500" style={{ borderTop: '2px dashed #0ea5e9' }}></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Laut</span>
                        </div>
                    </div>
                </div>
            )}

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
