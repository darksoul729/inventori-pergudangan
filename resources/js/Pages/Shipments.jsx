import DashboardLayout from '@/Layouts/DashboardLayout';
import CustomDropdown from '@/Components/CustomDropdown';
import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useEffect, useState, useRef } from 'react';
import ShipmentMap from '@/Components/ShipmentMap';
import 'leaflet/dist/leaflet.css';
import {
    AlertCircle,
    CheckCircle2,
    ChevronRight,
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
} from 'lucide-react';

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

export default function Shipments({ shipments = [], stats = {}, filters = {} }) {
    const { props } = usePage();
    const flash = props.flash || {};
    const roleName = String(props.auth?.user?.role_name || props.auth?.user?.role || '').toLowerCase();
    const isManager = roleName.includes('manager') || roleName.includes('manajer') || roleName.includes('admin gudang');
    const isSupervisor = roleName.includes('supervisor') || roleName.includes('spv');
    const canManageShipments = isManager || isSupervisor;

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('id');
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
            : [];
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

    return (
        <DashboardLayout
            headerSearchPlaceholder="Cari nomor kirim, asal, tujuan, atau driver..."
            searchValue={searchTerm}
            onSearch={setSearchTerm}
        >
            <Head title="Pengiriman" />



            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-[26px] font-black text-[#4722B3] tracking-tight">Pengiriman Aktif</h1>
                    <p className="text-[14px] font-semibold text-gray-500 mt-1">Pantau status pengiriman barang keluar dari gudang operasional.</p>
                </div>
                {canManageShipments && (
                    <Link
                        href={route('shipments.create')}
                        className="px-6 py-2.5 bg-[#5B33CC] hover:bg-[#5B33CC] text-white font-bold rounded-lg transition-colors flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" strokeWidth={2.2} />
                        <span>Buat Pengiriman</span>
                    </Link>
                )}
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]">
                    <div className="flex justify-between items-start mb-5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
                            <Truck className="w-5 h-5" strokeWidth={2.2} />
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-blue-50 text-blue-600 tracking-wide">+12%</span>
                    </div>
                    <div className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-1.5 uppercase">Dalam Perjalanan</div>
                    <div className="text-[24px] font-black text-[#4722B3]">{currentStats.in_transit.toLocaleString()}</div>
                </div>

                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]">
                    <div className="flex justify-between items-start mb-5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 text-red-600">
                            <AlertCircle className="w-5 h-5" strokeWidth={2.2} />
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-red-50 text-red-600 tracking-wide">-3%</span>
                    </div>
                    <div className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-1.5 uppercase">Terlambat</div>
                    <div className="text-[24px] font-black text-[#4722B3]">{currentStats.delayed}</div>
                </div>

                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]">
                    <div className="flex justify-between items-start mb-5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-50 text-yellow-600">
                            <CheckCircle2 className="w-5 h-5" strokeWidth={2.2} />
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-yellow-50 text-yellow-600 tracking-wide">Optimal</span>
                    </div>
                    <div className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-1.5 uppercase">Terkirim Hari Ini</div>
                    <div className="text-[24px] font-black text-[#4722B3]">{currentStats.delivered_today}</div>
                </div>

            </div>

            {/* Global Network Map */}
            <div className="bg-white rounded-[28px] p-6 md:p-7 mb-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-[16px] font-black text-[#4722B3]">JARINGAN GLOBAL LANGSUNG</h2>
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

                {/* Area Peta */}
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
                                        placeholder="ID pengiriman, driver, asal, tujuan..."
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-bold text-slate-700"
                                    />
                                    <div className="mt-2 text-[11px] font-semibold text-slate-500">
                                        Menampilkan <span className="text-indigo-600">{mapShipments.length}</span> dari {currentShipments.length} pengiriman.
                                    </div>
                                </>
                            )}

                            {isMapSettingsOpen && (
                                <>
                                    <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Layer & Muat Ulang</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            ['showRoutes', 'Rute'],
                                            ['showOriginMarkers', 'Asal'],
                                            ['showDestinationMarkers', 'Tujuan'],
                                            ['showDriverMarkers', 'Driver'],
                                            ['showLegend', 'Legenda'],
                                            ['showAlertsOnly', 'Hanya Alert'],
                                            ['showGpsOnly', 'Hanya GPS'],
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
                                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">Muat Ulang Otomatis</label>
                                        <CustomDropdown
                                            value={String(mapOptions.refreshIntervalSec)}
                                            onChange={(value) => setMapOption('refreshIntervalSec', Number(value))}
                                            options={[
                                                { value: '10', label: '10 detik' },
                                                { value: '15', label: '15 detik' },
                                                { value: '30', label: '30 detik' },
                                                { value: '60', label: '60 detik' },
                                            ]}
                                            className="min-w-[130px]"
                                        />
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
            <div className="bg-white rounded-[24px] p-7 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[16px] font-black text-[#4722B3]">Daftar Pengiriman</h2>
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
                                                        LACAK
                                                    </Link>
                                                ) : (
                                                    <span className="px-3 py-1.5 bg-gray-100 text-gray-400 text-[10px] font-black rounded-lg">
                                                        BELUM ADA DRIVER
                                                    </span>
                                                )}
                                                {canManageShipments && (
                                                    <>
                                                        <Link
                                                            href={route('shipments.edit', { shipment: shipment.id, page: currentPage })}
                                                            className="px-3 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black rounded-lg hover:bg-amber-100 transition-colors"
                                                        >
                                                            UBAH
                                                        </Link>
                                                        {isManager && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteShipment(shipment)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-black rounded-lg hover:bg-red-100 transition-colors"
                                                                title="Hapus pengiriman"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" strokeWidth={2.2} />
                                                                <span>HAPUS</span>
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
                            {filteredShipments.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12">
                                        <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-7 text-center">
                                            <p className="text-lg font-black text-[#4722B3]">Belum ada data pengiriman</p>
                                            <p className="mt-2 text-sm font-semibold text-gray-500">
                                                Buat pengiriman pertama agar status kirim dan pelacakan driver mulai tercatat.
                                            </p>
                                            {canManageShipments && (
                                                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                                                    <Link
                                                        href={route('shipments.create')}
                                                        className="inline-flex rounded-xl bg-[#5B33CC] px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
                                                    >
                                                        Buat Pengiriman
                                                    </Link>
                                                    <Link
                                                        href={route('invoices.index')}
                                                        className="inline-flex rounded-xl border border-[#E5EAF3] bg-white px-4 py-2 text-sm font-bold text-[#5B33CC] hover:bg-gray-50"
                                                    >
                                                        Lihat Tagihan
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
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
                <div className="fixed inset-0 z-[999] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteTarget(null)}></div>
                    <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl mx-4">
                        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500">Konfirmasi Hapus</div>
                        <h3 className="mt-2 text-[20px] font-black text-[#4722B3]">Hapus Pengiriman #{deleteTarget.id}?</h3>
                        <p className="mt-3 text-[13px] font-semibold leading-6 text-gray-500">
                            Data pengiriman akan dihapus permanen dan tindakan ini tidak bisa dibatalkan.
                        </p>
                        <div className="mt-6 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-[12px] font-black text-gray-600 hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteShipment}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-[12px] font-black text-white hover:bg-red-700"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
}
