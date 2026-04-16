import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
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

const pickerIcon = new L.DivIcon({
    className: 'shipment-location-picker',
    html: `
        <div style="width:18px;height:18px;border-radius:999px;background:#4f46e5;border:3px solid #ffffff;box-shadow:0 6px 18px rgba(79,70,229,.35);"></div>
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
    const center = value?.lat && value?.lng ? [value.lat, value.lng] : [-2.5489, 118.0149];

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

export default function Shipments({ shipments = [], stats = {}, drivers = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('id');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [originMode, setOriginMode] = useState('city');
    const [destinationMode, setDestinationMode] = useState('city');
    const [originSearch, setOriginSearch] = useState('');
    const [destinationSearch, setDestinationSearch] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        shipment_id: '',
        origin: '',
        origin_name: '',
        destination: '',
        destination_name: '',
        status: 'in-transit',
        estimated_arrival: '',
        load_type: 'ground',
        driver_id: '',
        origin_lat: '',
        origin_lng: '',
        dest_lat: '',
        dest_lng: ''
    });

    const cityCoords = {
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
            setData(prev => ({
                ...prev,
                origin: location.code ?? prev.origin,
                origin_name: location.label ?? prev.origin_name,
                origin_lat: location.lat,
                origin_lng: location.lng,
            }));
        } else {
            setData(prev => ({
                ...prev,
                destination: location.code ?? prev.destination,
                destination_name: location.label ?? prev.destination_name,
                dest_lat: location.lat,
                dest_lng: location.lng,
            }));
        }
    };

    const handleMapLocationPick = (type, latlng) => {
        const roundedLat = Number(latlng.lat.toFixed(6));
        const roundedLng = Number(latlng.lng.toFixed(6));
        const nearbyCity = cityOptions.find((city) =>
            Math.abs(city.lat - roundedLat) < 0.8 && Math.abs(city.lng - roundedLng) < 0.8
        );

        applyLocationSelection(type, {
            code: nearbyCity?.code ?? (type === 'origin' ? data.origin || 'PIN' : data.destination || 'PIN'),
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
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    // Filter and search logic
    const filteredShipments = currentShipments.filter(shipment => {
        const matchesSearch = shipment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            shipment.origin_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            shipment.destination_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || shipment.status === filterStatus;
        return matchesSearch && matchesFilter;
    }).sort((a, b) => {
        if (sortBy === 'date') {
            return new Date(b.estimated_arrival) - new Date(a.estimated_arrival);
        }
        return a.id.localeCompare(b.id);
    });

    const getStatusBadge = (status) => {
        const statusMap = {
            'on-time': { label: 'TEPAT WAKTU', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
            'delayed': { label: 'TERLAMBAT', color: 'bg-red-100 text-red-700', icon: AlertCircle },
            'in-transit': { label: 'DALAM PERJALANAN', color: 'bg-yellow-100 text-yellow-700', icon: Truck },
            'delivered': { label: 'TERKIRIM', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 }
        };
        return statusMap[status] || statusMap['in-transit'];
    };

    const getTrackingBadge = (trackingStage) => {
        const trackingMap = {
            ready_for_pickup: 'bg-slate-100 text-slate-700',
            picked_up: 'bg-indigo-100 text-indigo-700',
            in_transit: 'bg-amber-100 text-amber-700',
            arrived_at_destination: 'bg-cyan-100 text-cyan-700',
            delivered: 'bg-emerald-100 text-emerald-700',
        };

        return trackingMap[trackingStage] || 'bg-slate-100 text-slate-700';
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
                                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-[12px] font-black transition-all ${
                                    active
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
        <DashboardLayout>
            <Head title="Pengiriman" />

            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-[26px] font-black text-[#1a202c] tracking-tight">Pengiriman Aktif</h1>
                    <p className="text-[14px] font-semibold text-gray-500 mt-1">Pantau status pengiriman barang keluar dari gudang operasional.</p>
                </div>
                <Link
                    href={route('shipments.create')}
                    className="px-6 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold rounded-lg transition-colors flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" strokeWidth={2.2} />
                    <span>Tambah Pengiriman</span>
                </Link>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                    <div className="flex justify-between items-start mb-5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
                            <Truck className="w-5 h-5" strokeWidth={2.2} />
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-blue-50 text-blue-600 tracking-wide">+12%</span>
                    </div>
                    <div className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-1.5 uppercase">Dalam Perjalanan</div>
                    <div className="text-[24px] font-black text-[#1a202c]">{currentStats.in_transit.toLocaleString()}</div>
                </div>

                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                    <div className="flex justify-between items-start mb-5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 text-red-600">
                            <AlertCircle className="w-5 h-5" strokeWidth={2.2} />
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-red-50 text-red-600 tracking-wide">-3%</span>
                    </div>
                    <div className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-1.5 uppercase">Terlambat</div>
                    <div className="text-[24px] font-black text-[#1a202c]">{currentStats.delayed}</div>
                </div>

                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                    <div className="flex justify-between items-start mb-5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-50 text-yellow-600">
                            <CheckCircle2 className="w-5 h-5" strokeWidth={2.2} />
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-yellow-50 text-yellow-600 tracking-wide">Optimal</span>
                    </div>
                    <div className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-1.5 uppercase">Terkirim Hari Ini</div>
                    <div className="text-[24px] font-black text-[#1a202c]">{currentStats.delivered_today}</div>
                </div>

                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
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
            <div className="bg-white rounded-[28px] p-6 md:p-7 mb-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[16px] font-black text-[#1a202c]">JARINGAN GLOBAL LANGSUNG</h2>
                    <div className="flex space-x-2">
                        <button className="w-10 h-10 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center border border-gray-200 transition-colors">
                            <Settings2 className="w-5 h-5 text-gray-600" strokeWidth={2.1} />
                        </button>
                        <button className="w-10 h-10 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center border border-gray-200 transition-colors">
                            <Search className="w-5 h-5 text-gray-600" strokeWidth={2.1} />
                        </button>
                    </div>
                </div>
                
                {/* Map Placeholder - showing network routes */}
                <div className="h-[420px] md:h-[520px] xl:h-[620px]">
                    <ShipmentMap shipments={currentShipments} />
                </div>
            </div>

            {/* Shipment Pipeline Table */}
            <div className="bg-white rounded-[24px] p-7 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[16px] font-black text-[#1a202c]">JALUR PENGIRIMAN</h2>
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2.1} />
                            <input
                                type="text"
                                placeholder="Cari ID Pengiriman..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 text-[13px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
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
                                                <span className={`inline-flex px-3 py-1 text-[10px] font-black rounded-lg ${getTrackingBadge(shipment.tracking_stage)}`}>
                                                    {shipment.tracking_stage_label || 'Belum Bergerak'}
                                                </span>
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
                                                <Link
                                                    href={route('shipments.edit', { shipment: shipment.id, page: currentPage })}
                                                    className="px-3 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black rounded-lg hover:bg-amber-100 transition-colors"
                                                >
                                                    EDIT
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteShipment(shipment)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-black rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Hapus shipment"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2.2} />
                                                    <span>DELETE</span>
                                                </button>
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
                                        className={`rounded-lg border px-3 py-1.5 text-[12px] font-bold transition-colors ${
                                            link.active
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

            {deleteTarget && (
                <div className="fixed inset-0 z-[10010] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-[28px] border border-gray-200 bg-white p-6 shadow-2xl">
                        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500">Konfirmasi Hapus</div>
                        <h3 className="mt-2 text-[20px] font-black text-[#1a202c]">Hapus Shipment #{deleteTarget.id}?</h3>
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
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 md:p-6">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                            <div>
                                <h3 className="text-[18px] font-black text-[#1a202c]">Tambah Pengiriman Baru</h3>
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
                                            placeholder="TRK-XXXXX"
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-[14px] font-bold focus:ring-[#6366f1] focus:border-[#6366f1] transition-all"
                                            value={data.shipment_id}
                                            onChange={e => setData('shipment_id', e.target.value)}
                                            required
                                        />
                                        {errors.shipment_id && <div className="text-red-500 text-[10px] mt-1 font-bold">{errors.shipment_id}</div>}
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
                                        <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest">Status</label>
                                        <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-[13px] font-bold appearance-none" value={data.status} onChange={e => setData('status', e.target.value)}>
                                            <option value="in-transit">Dalam Perjalanan</option>
                                            <option value="on-time">Tepat Waktu</option>
                                            <option value="delayed">Terlambat</option>
                                            <option value="delivered">Sampai Tujuan</option>
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
                                                >
                                                    {driver.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.driver_id && <div className="text-red-500 text-[10px] mt-1 font-bold">{errors.driver_id}</div>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex space-x-4 flex-shrink-0">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-6 py-4 border border-gray-200 rounded-2xl text-[14px] font-black text-gray-500 hover:bg-white transition-all capitalize">Batal</button>
                                <button type="submit" disabled={processing} className="flex-[2] px-6 py-4 bg-[#6366f1] text-white rounded-2xl text-[14px] font-black shadow-lg shadow-indigo-200 hover:bg-[#5558e3] transition-all disabled:opacity-50 uppercase">Buat Pengiriman</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
