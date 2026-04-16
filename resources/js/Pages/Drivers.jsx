import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
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

export default function Drivers({ drivers = [] }) {
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'tracking'
    const [trackingDrivers, setTrackingDrivers] = useState([]);
    const [focusedDriverId, setFocusedDriverId] = useState(null);
    
    const { put, processing } = useForm();

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
                onSuccess: () => setShowDetailModal(false)
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
        <DashboardLayout headerTitle="Manajemen Driver">
            <Head title="Manajemen Driver" />

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-[26px] font-black text-[#1a202c] tracking-tight">Daftar Driver</h1>
                    <p className="text-[14px] font-semibold text-gray-500 mt-1">Kelola verifikasi dan status aktif driver di lapangan.</p>
                </div>
                <div className="flex items-center space-x-6">
                     <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
                        <button 
                            onClick={() => setActiveTab('list')}
                            className={`px-6 py-2.5 rounded-xl text-[12px] font-black transition-all ${activeTab === 'list' ? 'bg-white text-[#3632c0] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            DAFTAR DRIVER
                        </button>
                        <button 
                            onClick={() => setActiveTab('tracking')}
                            className={`px-6 py-2.5 rounded-xl text-[12px] font-black transition-all ${activeTab === 'tracking' ? 'bg-white text-[#3632c0] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            LIVE TRACKING
                        </button>
                     </div>
                     <div className="text-right border-l border-gray-200 pl-6">
                         <div className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Total Driver</div>
                         <div className="text-[20px] font-black text-[#3632c0]">{drivers.length}</div>
                     </div>
                </div>
            </div>

            {activeTab === 'list' ? (
                <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Driver</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Kontak</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">No. SIM</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-right text-[11px] font-black text-gray-400 uppercase tracking-widest">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {drivers.map((driver) => (
                                    <tr key={driver.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                                                    {driver.user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-[14px] font-bold text-[#1a202c]">{driver.user.name}</div>
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
                                            <div className="flex justify-end items-center space-x-2">
                                                <button 
                                                    onClick={() => { setSelectedDriver(driver); setShowDetailModal(true); }}
                                                    className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                </button>
                                                {driver.status !== 'approved' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(driver.id, 'approved')}
                                                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-colors"
                                                        title="Setujui Driver"
                                                    >
                                                        <UserCheckIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {driver.status !== 'suspended' && (
                                                    <button 
                                                        onClick={() => handleUpdateStatus(driver.id, 'suspended')}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                        title="Tangguhkan Driver"
                                                    >
                                                        <UserXIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="flex h-[600px] gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Sidebar Driver Cards */}
                    <div className="w-[320px] bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
                        <div className="mb-4">
                            <h3 className="text-[16px] font-black text-[#1a202c]">Daftar Driver Aktif</h3>
                            <p className="text-[11px] font-bold text-gray-400">Klik kartu untuk fokus pada peta.</p>
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
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                                            focusedDriverId === driver.id 
                                            ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                                            : 'bg-gray-50/50 border-gray-100 hover:border-indigo-100 hover:bg-white hover:shadow-md'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${
                                                focusedDriverId === driver.id ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'
                                            }`}>
                                                {driver.user.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[13px] font-black text-[#1a202c] truncate">{driver.user.name}</div>
                                                <div className="flex flex-col space-y-1 mt-1">
                                                    <div className="flex items-center space-x-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${driver.latitude && driver.longitude ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                            {driver.latitude && driver.longitude ? 'Terhubung' : 'Offline'}
                                                        </span>
                                                    </div>
                                                    {driver.last_location_mock && (
                                                        <div className="flex items-center space-x-1.5 bg-red-50 px-2 py-0.5 rounded-md self-start border border-red-100">
                                                            <svg className="w-2.5 h-2.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="text-[9px] font-black text-red-600 uppercase tracking-tight">Fake GPS Terdeteksi</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                        
                                        {driver.latitude && driver.longitude && (
                                            <div className="mt-3 pt-3 border-t border-gray-100/50 flex justify-between items-center">
                                                <span className="text-[9px] font-black text-gray-400 uppercase">Update</span>
                                                <span className="text-[9px] font-bold text-indigo-600/70">
                                                    {new Date(driver.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    ))
                            )}
                        </div>
                    </div>

                    {/* Map View */}
                    <div className="flex-1">
                        <LiveMap 
                            onDriversLoad={setTrackingDrivers} 
                            focusedDriverId={focusedDriverId} 
                        />
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedDriver && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[200] p-6">
                    <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-[18px] font-black text-[#1a202c]">Verifikasi Driver</h3>
                                <p className="text-[12px] font-bold text-gray-400">Tinjau dokumen identitas sebelum menyetujui akses.</p>
                            </div>
                            <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Lengkap</label>
                                    <p className="text-[15px] font-bold text-[#1a202c] mt-1">{selectedDriver.user.name}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</label>
                                    <p className="text-[15px] font-bold text-[#1a202c] mt-1">{selectedDriver.user.email}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No. SIM</label>
                                    <p className="text-[15px] font-bold text-[#1a202c] mt-1">{selectedDriver.license_number}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Saat Ini</label>
                                    <div className="mt-1">{getStatusBadge(selectedDriver.status)}</div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Foto ID Karyawan / KTP</label>
                                {selectedDriver.photo_id_card ? (
                                    <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video flex items-center justify-center">
                                        <img 
                                            src={`/storage/${selectedDriver.photo_id_card}`} 
                                            alt="ID Card Proof" 
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-12 text-center">
                                        <p className="text-[13px] font-bold text-gray-400 italic">Driver belum mengunggah foto ID.</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-3 pt-4 border-t border-gray-100">
                                <button 
                                    onClick={() => handleUpdateStatus(selectedDriver.id, 'approved')}
                                    disabled={selectedDriver.status === 'approved'}
                                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-2xl shadow-lg shadow-emerald-200 transition-all text-[13px] uppercase tracking-wider"
                                >
                                    Setujui Akses
                                </button>
                                <button 
                                    onClick={() => handleUpdateStatus(selectedDriver.id, 'suspended')}
                                    disabled={selectedDriver.status === 'suspended'}
                                    className="px-6 py-4 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold rounded-2xl transition-colors text-[13px]"
                                >
                                    Tangguhkan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
