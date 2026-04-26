import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
import React, { useEffect, useState, useRef } from 'react';
import ShipmentMap from '@/Components/ShipmentMap';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    Crosshair,
    Filter,
    MapPinned,
    Package2,
    Plane,
    Plus,
    Search,
    Settings2,
    Ship,
    Trash2,
    Truck,
    X,
} from 'lucide-react';

const LOCATION_INPUT_MODES = [
    { id: 'city', label: 'Cari Kota', icon: Search },
    { id: 'map', label: 'Pin Map', icon: MapPinned },
    { id: 'manual', label: 'Manual', icon: Crosshair },
];

const TRACKING_STAGE_OPTIONS = [
    { value: 'ready_for_pickup', label: 'Siap Diambil' },
    { value: 'picked_up', label: 'Sudah Diambil' },
    { value: 'in_transit', label: 'Dalam Perjalanan' },
    { value: 'arrived_at_destination', label: 'Sampai Gudang Tujuan' },
];

const DEFAULT_MAP_OPTIONS = {
    showRoutes: true,
    showOriginMarkers: true,
    showDestinationMarkers: true,
    showDriverMarkers: true,
    showLegend: true,
    showAlertsOnly: false,
    showGpsOnly: false,
    refreshIntervalSec: 15,
};
const MAP_OPTIONS_STORAGE_KEY = 'shipments_map_options_v1';

const pickerIcon = new L.DivIcon({
    className: 'shipment-location-picker',
    html: `
        <div style="width:18px;height:18px;border-radius:999px;background:#5932C9;border:3px solid #ffffff;box-shadow:0 6px 18px rgba(89,50,201,.35);"></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
});

function LocationMapEvents({ position, onPick }) {
    const map = useMapEvents({
        click(event) {
            onPick(event.latlng);
        },
    });

    useEffect(() => {
        if (position?.lat && position?.lng) {
            map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 7), {
                animate: true,
                duration: 0.5,
            });
        }
    }, [map, position]);

    return position?.lat && position?.lng ? (
        <Marker position={[position.lat, position.lng]} icon={pickerIcon} />
    ) : null;
}

function CoordinateMapPicker({ value, onPick }) {
    const center = value?.lat && value?.lng ? [value.lat, value.lng] : [-0.4948, 117.1436];

    return (
        <div className="overflow-hidden rounded-[24px] border border-gray-200">
            <MapContainer
                center={center}
                zoom={value?.lat && value?.lng ? 8 : 5}
                style={{ height: '260px', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                <LocationMapEvents value={value} position={value} onPick={onPick} />
            </MapContainer>
            <div className="flex items-center justify-between gap-4 bg-slate-50 px-4 py-3 text-[12px] font-semibold text-slate-500">
                <span>Klik pada map untuk menentukan titik lokasi.</span>
                <span className="text-indigo-600">
                    {value?.lat && value?.lng ? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}` : 'Belum ada titik'}
                </span>
            </div>
        </div>
    );
}

export default function Shipments({ shipments = [], stats = {}, drivers = [], filters = {} }) {
    const { props } = usePage();
    const roleName = String(props.auth?.user?.role_name || props.auth?.user?.role || '').toLowerCase();
    const isManager = roleName.includes('manager') || roleName.includes('manajer') || roleName.includes('admin gudang');
    const isSupervisor = roleName.includes('supervisor') || roleName.includes('spv');
    const canManageShipments = isManager || isSupervisor;

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('id');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [originMode, setOriginMode] = useState('city');
    const [destinationMode, setDestinationMode] = useState('city');
    const [originSearch, setOriginSearch] = useState('');
    const [destinationSearch, setDestinationSearch] = useState('');
    const [isMapSearchOpen, setIsMapSearchOpen] = useState(false);
    const [isMapSettingsOpen, setIsMapSettingsOpen] = useState(false);
    const [mapSearchQuery, setMapSearchQuery] = useState('');
    const [mapOptions, setMapOptions] = useState(DEFAULT_MAP_OPTIONS);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const isMounted = useRef(false);
    const mapToolbarRef = useRef(null);
    const mapPopoverRef = useRef(null);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            router.get(route('shipments.index'), { search: searchTerm }, { 
                preserveState: true, 
                preserveScroll: true,
                replace: true
            });
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(MAP_OPTIONS_STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return;

            setMapOptions((prev) => ({
                ...prev,
                ...Object.fromEntries(
                    Object.keys(DEFAULT_MAP_OPTIONS).map((key) => [key, parsed[key] ?? prev[key]])
                ),
            }));
        } catch {
            // ignore invalid saved settings
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(MAP_OPTIONS_STORAGE_KEY, JSON.stringify(mapOptions));
        } catch {
            // ignore storage issues
        }
    }, [mapOptions]);

    // Gudang utama - Samarinda, Kalimantan Timur
    const WAREHOUSE_ORIGIN = {
        code: 'SMD',
        label: 'Gudang Samarinda, Kaltim',
        lat: -0.4948,
        lng: 117.1436,
        name: 'Gudang Utama Samarinda',
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        origin: WAREHOUSE_ORIGIN.code,
        origin_name: WAREHOUSE_ORIGIN.label,
        destination: '',
        destination_name: '',
        tracking_stage: 'ready_for_pickup',
        estimated_arrival: '',
        load_type: 'ground',
        driver_id: '',
        origin_lat: WAREHOUSE_ORIGIN.lat,
        origin_lng: WAREHOUSE_ORIGIN.lng,
        dest_lat: '',
        dest_lng: ''
    });

    const cityCoords = {
        'SAMARINDA': { lat: -0.4948, lng: 117.1436, code: 'SMD', label: 'Samarinda, Kaltim' },
        'BALIKPAPAN': { lat: -1.2654, lng: 116.8312, code: 'BPN', label: 'Balikpapan, Kaltim' },
        'BONTANG': { lat: 0.1333, lng: 117.4833, code: 'BXT', label: 'Bontang, Kaltim' },
        'TENGGARONG': { lat: -0.4167, lng: 116.9833, code: 'TGR', label: 'Tenggarong, Kaltim' },
        'SANGATTA': { lat: 0.5167, lng: 117.5500, code: 'SGQ', label: 'Sangatta, Kaltim' },
        'TARAKAN': { lat: 3.3000, lng: 117.5833, code: 'TRK', label: 'Tarakan, Kaltara' },
        'BANJARMASIN': { lat: -3.4434, lng: 114.8361, code: 'BJM', label: 'Banjarmasin, Kalsel' },
        'PALANGKARAYA': { lat: -2.2083, lng: 113.9167, code: 'PKY', label: 'Palangkaraya, Kalteng' },
        'PONTIANAK': { lat: -0.0226, lng: 109.3444, code: 'PNK', label: 'Pontianak, Kalbar' },
        'JAKARTA': { lat: -6.2088, lng: 106.8456, code: 'JKT', label: 'Jakarta' },
        'SURABAYA': { lat: -7.2575, lng: 112.7521, code: 'SUB', label: 'Surabaya' },
        'MEDAN': { lat: 3.5952, lng: 98.6722, code: 'KNO', label: 'Medan' },
        'BANDUNG': { lat: -6.9175, lng: 107.6191, code: 'BDO', label: 'Bandung' },
        'MAKASSAR': { lat: -5.1476, lng: 119.4327, code: 'UPG', label: 'Makassar' },
        'SEMARANG': { lat: -6.9667, lng: 110.4167, code: 'SRG', label: 'Semarang' },
        'PALEMBANG': { lat: -2.9761, lng: 104.7754, code: 'PLM', label: 'Palembang' },
        'DENPASAR': { lat: -8.6705, lng: 115.2126, code: 'DPS', label: 'Denpasar' },
        'BALI': { lat: -8.4095, lng: 115.1889, code: 'DPS', label: 'Bali' },
        'SINGAPORE': { lat: 1.3521, lng: 103.8198, code: 'SIN', label: 'Singapore' },
        'DUBAI': { lat: 25.2048, lng: 55.2708, code: 'DXB', label: 'Dubai, UAE' },
        'TOKYO': { lat: 35.6762, lng: 139.6503, code: 'NRT', label: 'Tokyo, JP' },
        'SYDNEY': { lat: -33.8688, lng: 151.2093, code: 'SYD', label: 'Sydney, AUS' },
        'LONDON': { lat: 51.5072, lng: -0.1276, code: 'LHR', label: 'London, UK' },
        'PARIS': { lat: 48.8566, lng: 2.3522, code: 'CDG', label: 'Paris, FRA' },
        'LOS ANGELES': { lat: 34.0522, lng: -118.2437, code: 'LAX', label: 'Los Angeles, USA' },
        'NEW YORK': { lat: 40.7128, lng: -74.0060, code: 'JFK', label: 'New York, USA' },
        'HAMBURG': { lat: 53.5511, lng: 9.9937, code: 'HAM', label: 'Hamburg, GER' },
        'SHANGHAI': { lat: 31.2304, lng: 121.4737, code: 'PVG', label: 'Shanghai, CN' },
    };

    const cityOptions = Object.entries(cityCoords).map(([key, city]) => ({
        key,
        ...city,
    }));

    const autoFillCoords = (type) => {
        const cityName = type === 'origin' ? data.origin_name : data.destination_name;
        const upperCity = cityName.toUpperCase();
        if (cityCoords[upperCity]) {
            if (type === 'origin') {
                setData(prev => ({
                    ...prev,
                    origin: cityCoords[upperCity].code,
                    origin_lat: cityCoords[upperCity].lat,
                    origin_lng: cityCoords[upperCity].lng
                }));
            } else {
                setData(prev => ({
                    ...prev,
                    destination: cityCoords[upperCity].code,
                    dest_lat: cityCoords[upperCity].lat,
                    dest_lng: cityCoords[upperCity].lng
                }));
            }
        }
    };

    const applyLocationSelection = (type, location) => {
        if (type === 'origin') {
            // Origin locked to warehouse - ignore changes
            return;
        }

        setData(prev => ({
            ...prev,
            destination: location.code ?? prev.destination,
            destination_name: location.label ?? prev.destination_name,
            dest_lat: location.lat,
            dest_lng: location.lng,
        }));
    };

    const handleMapLocationPick = (type, latlng) => {
        if (type === 'origin') return; // Origin locked

        const roundedLat = Number(latlng.lat.toFixed(6));
        const roundedLng = Number(latlng.lng.toFixed(6));
        const nearbyCity = cityOptions.find((city) =>
            Math.abs(city.lat - roundedLat) < 0.8 && Math.abs(city.lng - roundedLng) < 0.8
        );

        applyLocationSelection(type, {
            code: nearbyCity?.code ?? (data.destination || 'PIN'),
            label: nearbyCity?.label ?? `Pinned ${roundedLat}, ${roundedLng}`,
            lat: roundedLat,
            lng: roundedLng,
        });
    };

    const getFilteredCities = (query) => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return cityOptions.slice(0, 8);

        return cityOptions.filter((city) =>
            city.label.toLowerCase().includes(normalized) ||
            city.code.toLowerCase().includes(normalized) ||
            city.key.toLowerCase().includes(normalized)
        ).slice(0, 8);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('shipments.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                setOriginMode('city');
                setDestinationMode('city');
                setOriginSearch('');
                setDestinationSearch('');
                reset();
            }
        });
    };

    const handleDeleteShipment = (shipment) => {
        setDeleteTarget(shipment);
    };

    const confirmDeleteShipment = () => {
        if (!deleteTarget) return;

        router.delete(route('shipments.destroy', deleteTarget.id), {
            data: { page: currentPage },
            preserveScroll: true,
            onFinish: () => setDeleteTarget(null),
        });
    };

    // Default stats if not provided
    const defaultStats = {
        in_transit: 1284,
        in_transit_trend: '+12%',
        delayed: 14,
        delayed_trend: '-3%',
        delivered_today: 342,
        delivered_trend: 'Optimal',
        sea_freight: 642,
        air_cargo: 128,
        ground: 514
    };

    const currentStats = { ...defaultStats, ...stats };

    // Default shipments data if not provided
    const defaultShipments = [
        {
            id: 'TRK-10293',
            origin: 'LHR',
            origin_name: 'London, UK',
            destination: 'JFK',
            destination_name: 'New York, USA',
            status: 'on-time',
            estimated_arrival: 'Oct 24, 14:30',
            load_type: 'air'
        },
        {
            id: 'TRK-10294',
            origin: 'SIN',
            origin_name: 'Singapore',
            destination: 'DXB',
            destination_name: 'Dubai, UAE',
            status: 'delayed',
            estimated_arrival: 'Oct 24, 18:45',
            load_type: 'sea'
        },
        {
            id: 'TRK-10295',
            origin: 'HAM',
            origin_name: 'Hamburg, GER',
            destination: 'PVG',
            destination_name: 'Shanghai, CN',
            status: 'on-time',
            estimated_arrival: 'Oct 25, 09:15',
            load_type: 'sea'
        }
    ];

    const hasPaginatedShipments =
        shipments &&
        !Array.isArray(shipments) &&
        typeof shipments === 'object' &&
        Array.isArray(shipments.data);

    const paginatedShipments = hasPaginatedShipments ? shipments : null;
    const shipmentsData = paginatedShipments?.data ?? shipments;
    const currentShipments = hasPaginatedShipments
        ? shipmentsData
        : shipmentsData.length > 0
            ? shipmentsData
            : defaultShipments;
    const currentPage = paginatedShipments?.current_page ?? 1;
    const fromItem = paginatedShipments?.from ?? (currentShipments.length ? 1 : 0);
    const toItem = paginatedShipments?.to ?? currentShipments.length;
    const totalItems = paginatedShipments?.total ?? currentShipments.length;

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['shipments', 'stats', 'drivers', 'notifications'],
                preserveState: true,
                preserveScroll: true,
            });
        }, Math.max(5, Number(mapOptions.refreshIntervalSec || 15)) * 1000);

        return () => clearInterval(interval);
    }, [mapOptions.refreshIntervalSec]);

    useEffect(() => {
        if (!isMapSearchOpen && !isMapSettingsOpen) return undefined;

        const handlePointerDown = (event) => {
            const target = event.target;
            const isInsideToolbar = mapToolbarRef.current?.contains(target);
            const isInsidePopover = mapPopoverRef.current?.contains(target);
            if (isInsideToolbar || isInsidePopover) return;

            setIsMapSearchOpen(false);
            setIsMapSettingsOpen(false);
        };

        const handleEscape = (event) => {
            if (event.key !== 'Escape') return;
            setIsMapSearchOpen(false);
            setIsMapSettingsOpen(false);
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isMapSearchOpen, isMapSettingsOpen]);

    // Filter logic (status filtering only, search is handled server-side now)
    const filteredShipments = currentShipments.filter(shipment => {
        return filterStatus === 'all' || shipment.status === filterStatus;
    }).sort((a, b) => {
        if (sortBy === 'date') {
            return new Date(b.estimated_arrival) - new Date(a.estimated_arrival);
        }
        return a.id.localeCompare(b.id);
    });

    const normalizedMapSearch = mapSearchQuery.trim().toLowerCase();
    const mapShipments = currentShipments.filter((shipment) => {
        const matchesSearch = !normalizedMapSearch || [
            shipment.id,
            shipment.driver_name,
            shipment.origin,
            shipment.origin_name,
            shipment.destination,
            shipment.destination_name,
        ].some((value) => String(value || '').toLowerCase().includes(normalizedMapSearch));

        const matchesAlerts = !mapOptions.showAlertsOnly || shipment.alerts?.is_delayed || shipment.alerts?.is_off_route;
        const matchesGps = !mapOptions.showGpsOnly || (shipment.driver_lat && shipment.driver_lng);

        return matchesSearch && matchesAlerts && matchesGps;
    });

    const setMapOption = (key, value) => {
        setMapOptions((prev) => ({ ...prev, [key]: value }));
    };

    const resetMapControls = () => {
        setMapSearchQuery('');
        setMapOptions(DEFAULT_MAP_OPTIONS);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'on-time': { label: 'TEPAT WAKTU', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
            'delayed': { label: 'TERLAMBAT', color: 'bg-red-100 text-red-700', icon: AlertCircle },
            'in-transit': { label: 'DALAM PERJALANAN', color: 'bg-yellow-100 text-yellow-700', icon: Truck },
            'delivered': { label: 'TERKIRIM', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 }
        };
        return statusMap[status] || statusMap['in-transit'];
    };

    const getTrackingBadge = (trackingStage, trackingLabel) => {
        const trackingMap = {
            ready_for_pickup: {
                label: 'Siap Diambil',
                color: 'bg-slate-100 text-slate-700',
                icon: Package2,
            },
            picked_up: {
                label: 'Sudah Diambil',
                color: 'bg-indigo-100 text-indigo-700',
                icon: Truck,
            },
            in_transit: {
                label: 'Dalam Perjalanan',
                color: 'bg-amber-100 text-amber-700',
                icon: Ship,
            },
            arrived_at_destination: {
                label: 'Sampai Gudang Tujuan',
                color: 'bg-cyan-100 text-cyan-700',
                icon: MapPinned,
            },
            delivered: {
                label: 'Terkirim',
                color: 'bg-emerald-100 text-emerald-700',
                icon: CheckCircle2,
            },
        };

        const fallback = {
            label: trackingLabel || 'Belum Bergerak',
            color: 'bg-slate-100 text-slate-700',
            icon: Package2,
        };

        return trackingMap[trackingStage] || fallback;
    };

    const getLoadTypeIcon = (loadType) => {
        const icons = {
            sea: { icon: Ship, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-100' },
            air: { icon: Plane, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
            ground: { icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
        };
        return icons[loadType] || { icon: Package2, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-100' };
    };

    const formatPaginationLabel = (label = '') => {
        return label
            .replace('&laquo; Previous', 'Sebelumnya')
            .replace('Next &raquo;', 'Berikutnya')
            .replace('&laquo;', '«')
            .replace('&raquo;', '»');
    };

    const renderLocationSection = ({
        type,
        title,
        tone,
        mode,
        setMode,
        search,
        setSearch,
        codeValue,
        nameValue,
        latValue,
        lngValue,
    }) => {
        const filteredCities = getFilteredCities(search);
        const isOrigin = type === 'origin';
        const position = latValue && lngValue ? { lat: Number(latValue), lng: Number(lngValue) } : null;

        return (
            <div className={`col-span-2 p-5 rounded-[24px] border space-y-4 ${tone}`}>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{title}</span>
                        <p className="mt-1 text-[12px] font-semibold text-slate-500">
                            Pilih kota cepat, pin langsung di map, atau isi koordinat manual.
                        </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black text-indigo-600 border border-indigo-100">
                        {latValue && lngValue ? 'Koordinat siap' : 'Titik belum dipilih'}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    {LOCATION_INPUT_MODES.map((item) => {
                        const Icon = item.icon;
                        const active = mode === item.id;

                        return (
                            <button
                                key={`${type}-${item.id}`}
                                type="button"
                                onClick={() => setMode(item.id)}
                                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-[12px] font-black transition-all ${active
                                    ? 'border-indigo-200 bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                    : 'border-gray-200 bg-white text-slate-500 hover:border-indigo-100 hover:text-indigo-600'
                                    }`}
                            >
                                <Icon className="h-4 w-4" strokeWidth={2.1} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Kode lokasi"
                        className="px-4 py-3 border border-gray-200 rounded-2xl text-[12px] font-bold"
                        value={codeValue}
                        onChange={(e) => setData(isOrigin ? 'origin' : 'destination', e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Nama kota / gudang / alamat ringkas"
                        className="px-4 py-3 border border-gray-200 rounded-2xl text-[12px] font-bold"
                        value={nameValue}
                        onChange={(e) => setData(isOrigin ? 'origin_name' : 'destination_name', e.target.value)}
                        required
                    />
                </div>

                {mode === 'city' && (
                    <div className="space-y-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2.1} />
                            <input
                                type="text"
                                placeholder="Cari kota, kode bandara, atau hub logistik"
                                className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-[13px] font-semibold text-slate-700"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredCities.map((city) => (
                                <button
                                    key={`${type}-${city.key}`}
                                    type="button"
                                    onClick={() => applyLocationSelection(type, city)}
                                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition-all hover:border-indigo-100 hover:bg-indigo-50/50"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="text-[13px] font-black text-slate-800">{city.label}</div>
                                            <div className="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">{city.code}</div>
                                        </div>
                                        <div className="text-right text-[11px] font-semibold text-slate-400">
                                            <div>Lat {city.lat}</div>
                                            <div>Lng {city.lng}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {mode === 'map' && (
                    <CoordinateMapPicker
                        value={position}
                        onPick={(latlng) => handleMapLocationPick(type, latlng)}
                    />
                )}

                {mode === 'manual' && (
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="number"
                            step="any"
                            placeholder="Latitude / Lat"
                            className="px-4 py-3 border border-gray-200 rounded-2xl text-[12px] font-bold"
                            value={latValue}
                            onChange={(e) => setData(isOrigin ? 'origin_lat' : 'dest_lat', e.target.value)}
                        />
                        <input
                            type="number"
                            step="any"
                            placeholder="Longitude / Lng"
                            className="px-4 py-3 border border-gray-200 rounded-2xl text-[12px] font-bold"
                            value={lngValue}
                            onChange={(e) => setData(isOrigin ? 'origin_lng' : 'dest_lng', e.target.value)}
                        />
                    </div>
                )}

                <div className="rounded-2xl bg-white/80 border border-white px-4 py-3 text-[12px] leading-6 text-slate-500">
                    <span className="font-black text-slate-700">Lat</span> menunjukkan posisi utara atau selatan.
                    <span className="mx-1 font-black text-slate-700">Lng</span> menunjukkan posisi timur atau barat.
                    Contoh Jakarta: <span className="font-black text-indigo-600">Lat -6.2088</span>,
                    <span className="ml-1 font-black text-indigo-600">Lng 106.8456</span>.
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout
            headerSearchPlaceholder="Cari ID pengiriman, asal, tujuan, atau driver..."
            searchValue={searchTerm}
            onSearch={setSearchTerm}
        >
            <Head title="Pengiriman" />

            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-[26px] font-black text-[#28106F] tracking-tight">Pengiriman Aktif</h1>
                    <p className="text-[14px] font-semibold text-gray-500 mt-1">Pantau status pengiriman barang keluar dari gudang operasional.</p>
                </div>
                {canManageShipments && (
                    <Link
                        href={route('shipments.create')}
                        className="px-6 py-2.5 bg-[#5932C9] hover:bg-[#5932C9] text-white font-bold rounded-lg transition-colors flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" strokeWidth={2.2} />
                        <span>Tambah Pengiriman</span>
                    </Link>
                )}
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC]">
                    <div className="flex justify-between items-start mb-5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
                            <Truck className="w-5 h-5" strokeWidth={2.2} />
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-blue-50 text-blue-600 tracking-wide">+12%</span>
                    </div>
                    <div className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-1.5 uppercase">Dalam Perjalanan</div>
                    <div className="text-[24px] font-black text-[#28106F]">{currentStats.in_transit.toLocaleString()}</div>
                </div>

                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC]">
                    <div className="flex justify-between items-start mb-5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 text-red-600">
                            <AlertCircle className="w-5 h-5" strokeWidth={2.2} />
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-red-50 text-red-600 tracking-wide">-3%</span>
                    </div>
                    <div className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-1.5 uppercase">Terlambat</div>
                    <div className="text-[24px] font-black text-[#28106F]">{currentStats.delayed}</div>
                </div>

                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC]">
                    <div className="flex justify-between items-start mb-5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-50 text-yellow-600">
                            <CheckCircle2 className="w-5 h-5" strokeWidth={2.2} />
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-yellow-50 text-yellow-600 tracking-wide">Optimal</span>
                    </div>
                    <div className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-1.5 uppercase">Terkirim Hari Ini</div>
                    <div className="text-[24px] font-black text-[#28106F]">{currentStats.delivered_today}</div>
                </div>

                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC]">
                    <div className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-4 uppercase">Jaringan Global</div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[12px] font-semibold text-gray-600">Kargo Laut</span>
                            <span className="text-[14px] font-black text-blue-600">{currentStats.sea_freight}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[12px] font-semibold text-gray-600">Kargo Udara</span>
                            <span className="text-[14px] font-black text-purple-600">{currentStats.air_cargo}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[12px] font-semibold text-gray-600">Kargo Darat</span>
                            <span className="text-[14px] font-black text-gray-600">{currentStats.ground}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Network Map */}
            <div className="bg-white rounded-[28px] p-6 md:p-7 mb-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-[16px] font-black text-[#28106F]">JARINGAN GLOBAL LANGSUNG</h2>
                        <p className="mt-1 text-[12px] font-semibold text-slate-500">Pantau lintasan aktif, posisi driver, dan anomali rute secara real-time.</p>
                    </div>
                    <div ref={mapToolbarRef} className="flex space-x-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsMapSettingsOpen((v) => !v);
                                setIsMapSearchOpen(false);
                            }}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                                isMapSettingsOpen
                                    ? 'bg-indigo-50 border-indigo-200'
                                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                            }`}
                        >
                            <Settings2 className="w-5 h-5 text-gray-600" strokeWidth={2.1} />
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsMapSearchOpen((v) => !v);
                                setIsMapSettingsOpen(false);
                            }}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                                isMapSearchOpen
                                    ? 'bg-indigo-50 border-indigo-200'
                                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                            }`}
                        >
                            <Search className="w-5 h-5 text-gray-600" strokeWidth={2.1} />
                        </button>
                    </div>
                </div>

                {/* Map Placeholder - showing network routes */}
                <div className="relative h-[420px] md:h-[520px] xl:h-[620px]">
                    <ShipmentMap shipments={mapShipments} mapOptions={mapOptions} />

                    {(isMapSearchOpen || isMapSettingsOpen) && (
                        <div
                            ref={mapPopoverRef}
                            className="map-popover-enter absolute right-4 top-4 z-[1200] w-[360px] max-w-[calc(100%-2rem)] rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-2xl backdrop-blur"
                        >
                            {isMapSearchOpen && (
                                <>
                                    <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Cari di Map</div>
                                    <input
                                        type="text"
                                        value={mapSearchQuery}
                                        onChange={(e) => setMapSearchQuery(e.target.value)}
                                        placeholder="ID shipment, driver, asal, tujuan..."
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-bold text-slate-700"
                                    />
                                    <div className="mt-2 text-[11px] font-semibold text-slate-500">
                                        Menampilkan <span className="text-indigo-600">{mapShipments.length}</span> dari {currentShipments.length} shipment.
                                    </div>
                                </>
                            )}

                            {isMapSettingsOpen && (
                                <>
                                    <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Layer & Refresh</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            ['showRoutes', 'Rute'],
                                            ['showOriginMarkers', 'Asal'],
                                            ['showDestinationMarkers', 'Tujuan'],
                                            ['showDriverMarkers', 'Driver'],
                                            ['showLegend', 'Legenda'],
                                            ['showAlertsOnly', 'Alert Only'],
                                            ['showGpsOnly', 'GPS Only'],
                                        ].map(([key, label]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setMapOption(key, !mapOptions[key])}
                                                className={`rounded-lg border px-3 py-2 text-[11px] font-black transition ${
                                                    mapOptions[key]
                                                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-3 flex items-center justify-between gap-2">
                                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Auto Refresh</label>
                                        <select
                                            value={mapOptions.refreshIntervalSec}
                                            onChange={(e) => setMapOption('refreshIntervalSec', Number(e.target.value))}
                                            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[12px] font-bold text-slate-700"
                                        >
                                            <option value={10}>10 detik</option>
                                            <option value={15}>15 detik</option>
                                            <option value={30}>30 detik</option>
                                            <option value={60}>60 detik</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className="mt-3 flex justify-end gap-2 border-t border-slate-200 pt-3">
                                <button
                                    type="button"
                                    onClick={resetMapControls}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-black text-slate-600 hover:bg-slate-50"
                                >
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMapSearchOpen(false);
                                        setIsMapSettingsOpen(false);
                                    }}
                                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-black text-white hover:bg-indigo-700"
                                >
                                    Selesai
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .map-popover-enter {
                    animation: mapPopoverIn .18s ease-out;
                    transform-origin: top right;
                }

                @keyframes mapPopoverIn {
                    from {
                        opacity: 0;
                        transform: translateY(-8px) scale(0.98);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>

            {/* Shipment Pipeline Table */}
            <div className="bg-white rounded-[24px] p-7 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[16px] font-black text-[#28106F]">JALUR PENGIRIMAN</h2>
                    <div className="flex items-center space-x-3">
                        <div className="text-[13px] font-bold text-gray-400 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                            ID: {searchTerm || 'Semua'}
                        </div>
                        <button className="px-4 py-2 text-[13px] font-semibold text-gray-600 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-1.5">
                            <Filter className="w-4 h-4" strokeWidth={2.1} />
                            <span>Filter</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="px-4 py-3.5 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">ID Pengiriman</th>
                                <th className="px-4 py-3.5 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Asal / Tujuan</th>
                                <th className="px-4 py-3.5 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Barang Dikirim</th>
                                <th className="px-4 py-3.5 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Driver / Kurir</th>
                                <th className="px-4 py-3.5 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Status</th>
                                <th className="px-4 py-3.5 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Progress Driver</th>
                                <th className="px-4 py-3.5 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Perkiraan Tiba</th>
                                <th className="px-4 py-3.5 text-center text-[11px] font-black text-gray-500 uppercase tracking-wide">Jenis Kargo</th>
                                <th className="px-4 py-3.5 text-center text-[11px] font-black text-gray-500 uppercase tracking-wide">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredShipments.map((shipment) => {
                                const statusInfo = getStatusBadge(shipment.status);
                                return (
                                    <tr key={shipment.database_id ?? shipment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 text-[13px] font-bold text-blue-600">#{shipment.id}</td>
                                        <td className="px-4 py-4">
                                            <div className="text-[13px] font-semibold text-gray-800">{shipment.origin} → {shipment.destination}</div>
                                            <div className="text-[12px] text-gray-500 mt-0.5">{shipment.origin_name} — {shipment.destination_name}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {shipment.items_summary ? (
                                                <div>
                                                    <div className="text-[12px] font-bold text-gray-700">
                                                        {shipment.items_summary.total_items} produk · {shipment.items_summary.total_quantity} {shipment.items_summary.top_items?.[0]?.unit || 'unit'}
                                                    </div>
                                                    {shipment.items_summary.total_weight_kg && (
                                                        <div className="text-[11px] text-gray-400 mt-0.5">{shipment.items_summary.total_weight_kg.toLocaleString()} kg total</div>
                                                    )}
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {shipment.items_summary.top_items?.map((item, i) => (
                                                            <span key={i} className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">
                                                                {item.product_name} ×{item.quantity}
                                                            </span>
                                                        ))}
                                                        {shipment.items_summary.total_items > 3 && (
                                                            <span className="inline-flex px-2 py-0.5 bg-indigo-50 text-indigo-500 text-[10px] font-bold rounded-md">
                                                                +{shipment.items_summary.total_items - 3} lagi
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[12px] text-gray-400">Belum ada item</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500">
                                                    {shipment.driver_name.charAt(0)}
                                                </div>
                                                <div className="text-[13px] font-bold text-gray-700">{shipment.driver_name}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-3 py-1 text-[10px] font-black rounded-lg ${statusInfo.color}`}>
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="space-y-1">
                                                {(() => {
                                                    const trackingInfo = getTrackingBadge(shipment.tracking_stage, shipment.tracking_stage_label);
                                                    const TrackingIcon = trackingInfo.icon;
                                                    return (
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black rounded-lg ${trackingInfo.color}`}>
                                                            <TrackingIcon className="h-3.5 w-3.5" strokeWidth={2.4} />
                                                            {shipment.tracking_stage_label || trackingInfo.label}
                                                        </span>
                                                    );
                                                })()}
                                                {(shipment.alerts?.is_delayed || shipment.alerts?.is_off_route) && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {shipment.alerts?.is_delayed && (
                                                            <span className="inline-flex px-2.5 py-1 text-[10px] font-black rounded-lg bg-red-100 text-red-700">
                                                                ETA Lewat
                                                            </span>
                                                        )}
                                                        {shipment.alerts?.is_off_route && (
                                                            <span className="inline-flex px-2.5 py-1 text-[10px] font-black rounded-lg bg-amber-100 text-amber-700">
                                                                Keluar Jalur
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {shipment.last_tracking_note && (
                                                    <div className="text-[11px] font-semibold text-gray-500">{shipment.last_tracking_note}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-[13px] font-semibold text-gray-800">{shipment.estimated_arrival}</div>
                                            {shipment.last_location_at && shipment.driver_id && (
                                                <div className="text-[11px] text-gray-400 mt-1">GPS terakhir {shipment.last_location_at}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {(() => {
                                                const loadType = getLoadTypeIcon(shipment.load_type);
                                                const LoadTypeIcon = loadType.icon;

                                                return (
                                                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border ${loadType.bg}`}>
                                                        <LoadTypeIcon className={`h-[18px] w-[18px] ${loadType.color}`} strokeWidth={2.1} />
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                {shipment.driver_id ? (
                                                    <Link
                                                        href={route('shipments.show', shipment.id)}
                                                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg hover:bg-indigo-100 transition-colors"
                                                    >
                                                        TRACK
                                                    </Link>
                                                ) : (
                                                    <span className="px-3 py-1.5 bg-gray-100 text-gray-400 text-[10px] font-black rounded-lg">
                                                        NO DRIVER
                                                    </span>
                                                )}
                                                {canManageShipments && (
                                                    <>
                                                        <Link
                                                            href={route('shipments.edit', { shipment: shipment.id, page: currentPage })}
                                                            className="px-3 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black rounded-lg hover:bg-amber-100 transition-colors"
                                                        >
                                                            EDIT
                                                        </Link>
                                                        {isManager && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteShipment(shipment)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-black rounded-lg hover:bg-red-100 transition-colors"
                                                                title="Hapus shipment"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" strokeWidth={2.2} />
                                                                <span>DELETE</span>
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                                <Link
                                                    href={route('shipments.show', shipment.id)}
                                                    className="w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center p-1.5"
                                                    title="Lacak Pengiriman"
                                                >
                                                    <ChevronRight className="w-5 h-5 text-gray-400 hover:text-indigo-600 transition-colors" strokeWidth={2.2} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-4 md:flex-row md:items-center md:justify-between">
                    <div className="text-[12px] font-semibold text-gray-500">
                        Menampilkan {fromItem}-{toItem} dari {totalItems} pengiriman
                    </div>
                    {paginatedShipments?.links?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            {paginatedShipments.links.map((link, index) => (
                                link.url ? (
                                    <Link
                                        key={`${link.label}-${index}`}
                                        href={link.url}
                                        preserveScroll
                                        preserveState
                                        className={`rounded-lg border px-3 py-1.5 text-[12px] font-bold transition-colors ${link.active
                                            ? 'border-indigo-200 bg-indigo-600 text-white'
                                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {formatPaginationLabel(link.label)}
                                    </Link>
                                ) : (
                                    <span
                                        key={`${link.label}-${index}`}
                                        className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-[12px] font-bold text-gray-400"
                                    >
                                        {formatPaginationLabel(link.label)}
                                    </span>
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isManager && deleteTarget && (
                <div className="fixed inset-0 z-[10010] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-[28px] border border-gray-200 bg-white p-6 shadow-2xl">
                        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500">Konfirmasi Hapus</div>
                        <h3 className="mt-2 text-[20px] font-black text-[#28106F]">Hapus Shipment #{deleteTarget.id}?</h3>
                        <p className="mt-3 text-[13px] font-semibold leading-6 text-gray-500">
                            Data shipment akan dihapus permanen dan tindakan ini tidak bisa dibatalkan.
                        </p>
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[12px] font-black text-gray-600 hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteShipment}
                                className="px-4 py-2.5 rounded-xl bg-red-600 text-[12px] font-black text-white hover:bg-red-700"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Shipment Modal */}
            {canManageShipments && showCreateModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 md:p-6">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                            <div>
                                <h3 className="text-[18px] font-black text-[#28106F]">Tambah Pengiriman Baru</h3>
                                <p className="text-[12px] font-bold text-gray-400">Input data logistik dan tugaskan kurir pengantar.</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" strokeWidth={2.1} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
                            <div className="p-8 overflow-y-auto space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">ID Pengiriman</label>
                                        <input
                                            type="text"
                                            placeholder="Akan dibuat otomatis saat disimpan"
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-[14px] font-bold focus:ring-[#5932C9] focus:border-[#5932C9] transition-all"
                                            value=""
                                            disabled
                                        />
                                        <div className="text-slate-500 text-[10px] mt-1 font-bold">Nomor pengiriman di-generate sistem.</div>
                                    </div>

                                    <div className="col-span-2 rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
                                        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Cara Isi Lokasi</div>
                                        <div className="mt-2 text-[13px] font-semibold text-slate-600 leading-6">
                                            Gunakan <span className="font-black text-indigo-600">Cari Kota</span> untuk pilihan cepat,
                                            <span className="mx-1 font-black text-indigo-600">Pin Map</span> untuk klik titik langsung di peta,
                                            atau <span className="font-black text-indigo-600">Manual</span> kalau Anda sudah tahu koordinatnya.
                                        </div>
                                    </div>

                                    {renderLocationSection({
                                        type: 'origin',
                                        title: 'Data Asal (Origin)',
                                        tone: 'bg-indigo-50/40 border-indigo-100/70',
                                        mode: originMode,
                                        setMode: setOriginMode,
                                        search: originSearch,
                                        setSearch: setOriginSearch,
                                        codeValue: data.origin,
                                        nameValue: data.origin_name,
                                        latValue: data.origin_lat,
                                        lngValue: data.origin_lng,
                                    })}

                                    {renderLocationSection({
                                        type: 'destination',
                                        title: 'Data Tujuan (Destination)',
                                        tone: 'bg-fuchsia-50/35 border-fuchsia-100/70',
                                        mode: destinationMode,
                                        setMode: setDestinationMode,
                                        search: destinationSearch,
                                        setSearch: setDestinationSearch,
                                        codeValue: data.destination,
                                        nameValue: data.destination_name,
                                        latValue: data.dest_lat,
                                        lngValue: data.dest_lng,
                                    })}

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">Estimasi Tiba</label>
                                        <input type="datetime-local" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-[13px] font-bold" value={data.estimated_arrival} onChange={e => setData('estimated_arrival', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">Tahap Tracking</label>
                                        <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-[13px] font-bold appearance-none" value={data.tracking_stage} onChange={e => setData('tracking_stage', e.target.value)}>
                                            {TRACKING_STAGE_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">Jenis Kargo</label>
                                        <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-[13px] font-bold appearance-none" value={data.load_type} onChange={e => setData('load_type', e.target.value)}>
                                            <option value="ground">Darat (Ground)</option>
                                            <option value="sea">Laut (Sea)</option>
                                            <option value="air">Udara (Air)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">Tugaskan Driver</label>
                                        <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-[13px] font-bold appearance-none" value={data.driver_id} onChange={e => setData('driver_id', e.target.value)}>
                                            <option value="">Pilih Driver (Opsional)</option>
                                            {drivers.map(driver => (
                                                <option
                                                    key={driver.id}
                                                    value={driver.id}
                                                    disabled={driver.is_busy}
                                                >
                                                    {driver.name} {driver.is_busy ? '(SIBUK)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.driver_id && <div className="text-red-500 text-[10px] mt-1 font-bold">{errors.driver_id}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex space-x-4 flex-shrink-0">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-6 py-4 border border-gray-200 rounded-2xl text-[14px] font-black text-gray-500 hover:bg-white transition-all capitalize">Batal</button>
                                <button type="submit" disabled={processing} className="flex-[2] px-6 py-4 bg-[#5932C9] text-white rounded-2xl text-[14px] font-black shadow-lg shadow-indigo-200 hover:bg-[#4D2AB5] transition-all disabled:opacity-50 uppercase">Buat Pengiriman</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
