import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import LiveMap from '@/Components/LiveMap';

// Icons
const UserCheckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const UserXIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
);

const EyeIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const PlusIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

export default function Drivers({ drivers = [] }) {
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'tracking'
    const [trackingDrivers, setTrackingDrivers] = useState([]);
    const [focusedDriverId, setFocusedDriverId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDrivers = React.useMemo(() => {
        if (!searchTerm) return drivers;
        const lowerSearchText = searchTerm.toLowerCase();
        return drivers.filter((driver) => {
            return (
                (driver.user?.name && driver.user.name.toLowerCase().includes(lowerSearchText)) ||
                (driver.user?.email && driver.user.email.toLowerCase().includes(lowerSearchText)) ||
                (driver.license_number && driver.license_number.toLowerCase().includes(lowerSearchText)) ||
                (driver.phone && driver.phone.toLowerCase().includes(lowerSearchText))
            );
        });
    }, [drivers, searchTerm]);

    const hasValidCoords = (driver) => {
        const latRaw = driver?.latitude;
        const lngRaw = driver?.longitude;
        if (latRaw === null || latRaw === undefined || latRaw === '' || lngRaw === null || lngRaw === undefined || lngRaw === '') {
            return false;
        }
        const lat = Number(latRaw);
        const lng = Number(lngRaw);
        return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    };

    const { put } = useForm();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        const driverId = params.get('id');

        if (tab === 'tracking') {
            setActiveTab('tracking');
        }

        if (driverId) {
            setFocusedDriverId(parseInt(driverId));
        }
    }, []);

    useEffect(() => {
        if (activeTab !== 'list') return undefined;

        const interval = setInterval(() => {
            router.reload({
                only: ['drivers', 'notifications'],
                preserveState: true,
                preserveScroll: true,
            });
        }, 20000);

        return () => clearInterval(interval);
    }, [activeTab]);

    const handleUpdateStatus = (id, status) => {
        if (confirm(`Apakah Anda yakin ingin mengubah status driver ini menjadi ${status}?`)) {
            put(route('drivers.status.update', id), {
                data: { status },
            });
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            pending: 'bg-amber-50 text-amber-600 border-amber-100',
            suspended: 'bg-red-50 text-red-600 border-red-100'
        };
        const labels = {
            approved: 'TERVERIFIKASI',
            pending: 'MENUNGGU',
            suspended: 'DITANGGUHKAN'
        };
        return (
            <span className={`px-3 py-1 text-[10px] font-black rounded-lg border ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    return (
        <DashboardLayout
            headerTitle="Manajemen Driver"
            headerSearchPlaceholder="Cari driver, kontak, atau nomor SIM..."
            searchValue={searchTerm}
            onSearch={setSearchTerm}
            contentClassName="w-full max-w-none"
        >
            <Head title="Manajemen Driver" />

            <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <h1 className="text-[26px] font-black text-[#28106F] tracking-tight">Daftar Driver</h1>
                    <p className="text-[14px] font-semibold text-gray-500 mt-1">Kelola verifikasi dan status aktif driver di lapangan.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {activeTab === 'list' && (
                        <Link
                            href={route('drivers.create')}
                            className="flex h-11 items-center space-x-2 rounded-[8px] bg-[#28106F] px-5 text-[12px] font-black text-white shadow-sm transition hover:bg-[#3730a3]"
                        >
                            <PlusIcon className="h-4 w-4" />
                            <span>Buat Driver</span>
                        </Link>
                    )}
                    <div className="flex rounded-[8px] border border-gray-200 bg-white p-1 shadow-sm">
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`h-9 px-5 rounded-[6px] text-[12px] font-black transition-all ${activeTab === 'list' ? 'bg-[#eef2ff] text-[#28106F]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            DAFTAR DRIVER
                        </button>
                        <button
                            onClick={() => setActiveTab('tracking')}
                            className={`h-9 px-5 rounded-[6px] text-[12px] font-black transition-all ${activeTab === 'tracking' ? 'bg-[#eef2ff] text-[#28106F]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            LIVE TRACKING
                        </button>
                    </div>
                    <div className="rounded-[8px] border border-gray-200 bg-white px-5 py-2 text-right shadow-sm">
                        <div className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Total Driver</div>
                        <div className="text-[20px] font-black text-[#28106F]">{drivers.length}</div>
                    </div>
                </div>
            </div>

            {activeTab === 'list' ? (
                <section className="overflow-hidden rounded-[8px] border border-[#EDE8FC] bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px]">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/70">
                                    <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Driver</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Kontak</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">No. SIM</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredDrivers.map((driver) => (
                                    <tr key={driver.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-[12px] bg-[#28106F] flex items-center justify-center text-white font-black text-xs shadow-sm shadow-indigo-100">
                                                    {driver.user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-[14px] font-bold text-[#28106F]">{driver.user.name}</div>
                                                    <div className="text-[12px] text-gray-400">{driver.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-[13px] font-semibold text-gray-600">{driver.phone || '-'}</td>
                                        <td className="px-6 py-5">
                                            <span className="text-[12px] font-black bg-gray-100 px-2 py-1 rounded text-gray-600 tracking-tighter uppercase">
                                                {driver.license_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">{getStatusBadge(driver.status)}</td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <Link
                                                    href={route('drivers.show', driver.id)}
                                                    className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-indigo-100 bg-indigo-50 px-3 text-[11px] font-black text-[#28106F] transition-colors hover:bg-indigo-100"
                                                    title="Lihat Detail"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                    Detail
                                                </Link>
                                                {driver.status !== 'approved' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(driver.id, 'approved')}
                                                        className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-emerald-100 bg-emerald-50 px-3 text-[11px] font-black text-emerald-600 transition-colors hover:bg-emerald-100"
                                                        title="Setujui Driver"
                                                    >
                                                        <UserCheckIcon className="w-4 h-4" />
                                                        Setujui
                                                    </button>
                                                )}
                                                {driver.status !== 'suspended' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(driver.id, 'suspended')}
                                                        className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-red-100 bg-red-50 px-3 text-[11px] font-black text-red-600 transition-colors hover:bg-red-100"
                                                        title="Tangguhkan Driver"
                                                    >
                                                        <UserXIcon className="w-4 h-4" />
                                                        Tahan
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : (
                <div className="grid h-[calc(100vh-230px)] min-h-[620px] grid-cols-[360px_1fr] gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Sidebar Driver Cards */}
                    <div className="flex h-full flex-col overflow-hidden rounded-[8px] border border-[#EDE8FC] bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-[16px] font-black text-[#28106F]">Daftar Driver Tracking</h3>
                                <p className="text-[11px] font-bold text-gray-400">
                                    Online {trackingDrivers.filter((driver) => hasValidCoords(driver)).length} / Total {trackingDrivers.length}
                                </p>
                            </div>
                            <span className="rounded-[8px] bg-indigo-50 px-3 py-1 text-[11px] font-black text-[#28106F]">{trackingDrivers.length}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {trackingDrivers.length === 0 ? (
                                <div className="py-20 text-center">
                                    <p className="text-[13px] font-bold text-gray-400 italic">Tidak ada driver online.</p>
                                </div>
                            ) : (
                                trackingDrivers.map((driver) => (
                                    <div
                                        key={driver.id}
                                        onClick={() => setFocusedDriverId(driver.id)}
                                        className={`p-4 rounded-[8px] border transition-all cursor-pointer group relative overflow-hidden ${focusedDriverId === driver.id
                                                ? 'bg-indigo-50/60 border-indigo-200 ring-1 ring-indigo-100'
                                                : 'bg-white border-gray-100 hover:border-indigo-100 hover:bg-gray-50/70'
                                            }`}
                                    >
                                        <div className="flex items-start space-x-3 relative z-10">
                                            <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center font-black text-sm transition-all duration-300 ${focusedDriverId === driver.id ? 'bg-[#28106F] text-white' : 'bg-indigo-50 text-[#28106F]'
                                                }`}>
                                                {(driver.user?.name || 'D').charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div className="text-[14px] font-black text-[#28106F] truncate pr-2">{driver.user?.name || 'Driver tanpa nama'}</div>
                                                    {driver.active_shipment_id && (
                                                        <div className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[9px] font-black text-indigo-600 tracking-tighter">
                                                            {driver.active_shipment_id}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col space-y-1.5 mt-1.5">
                                                    <div className="flex items-center space-x-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${hasValidCoords(driver) ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest gap-2 flex items-center">
                                                            {hasValidCoords(driver) ? 'Terhubung' : 'Offline'}
                                                            {focusedDriverId === driver.id && <span className="text-[8px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full flex items-center">LIVE</span>}
                                                        </span>
                                                    </div>

                                                    {Boolean(driver.last_location_mock) && (
                                                        <div className="flex items-center space-x-1.5 bg-red-50 px-2 py-1 rounded-lg self-start border border-red-100">
                                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                                            <span className="text-[9px] font-black text-red-600 uppercase tracking-tight">Fake GPS Terdeteksi</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        <div className={`transition-all duration-300 overflow-hidden ${focusedDriverId === driver.id ? 'mt-4 max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                                                {driver.active_shipment_id ? (
                                                    <div className="space-y-3">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-2 h-2 rounded-full border-2 border-indigo-400 bg-white"></div>
                                                                <div className="text-[10px] font-bold text-gray-500 truncate">{driver.active_shipment_origin || 'Asal'}</div>
                                                            </div>
                                                            <div className="ml-1 w-0.5 h-2 bg-gray-200"></div>
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                                <div className="text-[10px] font-black text-[#28106F] truncate">{driver.active_shipment_destination || 'Tujuan'}</div>
                                                            </div>
                                                        </div>
                                                        <div className="pt-2 border-t border-gray-200/50">
                                                            <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">Status Pengiriman</div>
                                                            <div className="text-[11px] font-bold text-gray-600">
                                                                {driver.active_shipment_stage === 'ready_for_pickup' && 'Siap Diambil'}
                                                                {driver.active_shipment_stage === 'picked_up' && 'Sudah Diambil'}
                                                                {driver.active_shipment_stage === 'in_transit' && 'Dalam Perjalanan'}
                                                                {driver.active_shipment_stage === 'arrived_at_destination' && 'Sampai Tujuan'}
                                                                {driver.active_shipment_stage === 'delivered' && 'Menunggu Verifikasi'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center py-2 opacity-60">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Standby</span>
                                                    </div>
                                                )}
                                            </div>

                                            {hasValidCoords(driver) && (
                                                <div className="mt-3 pt-3 border-t border-gray-100/50 flex justify-between items-center">
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Update Terakhir</span>
                                                    <span className="text-[9px] font-bold text-indigo-400">
                                                        {new Date(driver.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {focusedDriverId === driver.id && (
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Map View */}
                    <div className="min-w-0">
                        <LiveMap
                            onDriversLoad={setTrackingDrivers}
                            focusedDriverId={focusedDriverId}
                            onMarkerClick={setFocusedDriverId}
                        />
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
}
