import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import {
    Layers, Grid3x3, Package, Activity, Clock, ChevronRight,
    LayoutGrid, Zap, History, ArrowRight, Lock, CheckCircle2,
    AlertCircle, MapPin, Settings2
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color = '#5B33CC', sub }) => (
    <div className="bg-white rounded-2xl border border-[#E5EAF3] p-5 flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}12` }}>
            <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">{label}</p>
            <p className="text-2xl font-black text-[#1f2a3d] mt-0.5 tracking-tight">{value}</p>
            {sub && <p className="text-[11px] font-semibold text-gray-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const featureList = [
    { icon: LayoutGrid,  title: 'Canvas Editor Interaktif',   desc: 'Drag & drop zona dan rak langsung di peta visual gudang.' },
    { icon: Layers,      title: 'Multi-zona & Multi-rak',     desc: 'Kelola ratusan rak dalam zona terpisah dengan sub-layout.' },
    { icon: Zap,         title: 'Preset Otomatis',            desc: 'Generate layout gudang instan dari preset template.' },
    { icon: History,     title: 'Riwayat Snapshot',           desc: 'Simpan & kembalikan kondisi layout ke versi sebelumnya.' },
    { icon: Settings2,   title: 'Konfigurasi Lanjutan',       desc: 'Atur tipe rak, kapasitas, rotasi, dan metadata per elemen.' },
    { icon: Activity,    title: 'Heatmap Utilisasi',          desc: 'Visualisasi tingkat kepenuhan tiap rak secara real-time.' },
];

export default function WarehouseAdvanced({ warehouse, stats, zones = [], snapshots = [] }) {
    const [activeZone, setActiveZone] = useState(null);

    const fmt = (n) => new Intl.NumberFormat('id-ID').format(n ?? 0);

    return (
        <DashboardLayout headerSearchPlaceholder="Cari zona atau rak...">
            <Head title="Mode Lanjutan — Layout Gudang" />
            <div className="space-y-6 pb-12 pt-4">

                {/* Page Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#5B33CC]/10 flex items-center justify-center">
                            <Layers className="w-6 h-6 text-[#5B33CC]" />
                        </div>
                        <div>
                            <h1 className="text-[28px] font-black tracking-tight text-[#1f2a3d]">Mode Lanjutan</h1>
                            <p className="text-sm font-semibold text-gray-400 mt-0.5">
                                Editor canvas interaktif · {warehouse?.name ?? 'Gudang Utama'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/warehouse"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5B33CC] text-white text-[13px] font-bold shadow-[0_4px_14px_rgba(89,50,201,0.25)] hover:bg-[#4722B3] transition-all"
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Buka Canvas Editor
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={MapPin}    label="Total Zona"     value={fmt(stats.total_zones)}    color="#5B33CC" />
                    <StatCard icon={Grid3x3}   label="Total Rak"      value={fmt(stats.total_racks)}    color="#0EA5E9" />
                    <StatCard icon={CheckCircle2} label="Rak Aktif"   value={fmt(stats.active_racks)}   color="#10B981" sub={`dari ${fmt(stats.total_racks)} rak`} />
                    <StatCard icon={Package}   label="Total Kapasitas" value={fmt(stats.total_capacity)} color="#F59E0B" sub="unit kapasitas terpasang" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Zone & Rack Table */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5EAF3]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5EAF3]">
                            <div>
                                <h2 className="text-[15px] font-black text-[#1f2a3d]">Zona & Rak</h2>
                                <p className="text-[11px] font-semibold text-gray-400 mt-0.5">Struktur layout gudang saat ini</p>
                            </div>
                            <Link href="/warehouse" className="text-[12px] font-bold text-[#5B33CC] hover:underline flex items-center gap-1">
                                Kelola <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {zones.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center px-8">
                                <div className="w-14 h-14 rounded-2xl bg-[#5B33CC]/8 flex items-center justify-center mb-4">
                                    <Grid3x3 className="w-7 h-7 text-[#5B33CC]/40" />
                                </div>
                                <p className="text-[13px] font-black text-gray-400">Belum ada zona</p>
                                <p className="text-[12px] font-semibold text-gray-400 mt-1">Buat zona dan rak di halaman Layout Gudang terlebih dahulu.</p>
                                <Link href="/warehouse" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5B33CC] text-white text-[12px] font-bold hover:bg-[#4722B3] transition-all">
                                    Buka Layout Gudang <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#E5EAF3]">
                                {zones.map(zone => (
                                    <div key={zone.id}>
                                        <button
                                            onClick={() => setActiveZone(activeZone === zone.id ? null : zone.id)}
                                            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[#f8f9fb] transition-all text-left"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-[#5B33CC]/10 flex items-center justify-center flex-shrink-0">
                                                <MapPin className="w-4 h-4 text-[#5B33CC]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[13px] font-black text-[#1f2a3d]">{zone.name}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{zone.code}</span>
                                                    {!zone.is_active && (
                                                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Nonaktif</span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] font-semibold text-gray-400 mt-0.5">{zone.racks.length} rak · {zone.type}</p>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${activeZone === zone.id ? 'rotate-90' : ''}`} />
                                        </button>

                                        {activeZone === zone.id && zone.racks.length > 0 && (
                                            <div className="bg-[#f8f9fb] border-t border-[#E5EAF3] px-6 py-3">
                                                <table className="w-full text-[12px]">
                                                    <thead>
                                                        <tr className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
                                                            <th className="text-left pb-2">Kode</th>
                                                            <th className="text-left pb-2">Nama</th>
                                                            <th className="text-left pb-2">Tipe</th>
                                                            <th className="text-left pb-2">Kapasitas</th>
                                                            <th className="text-left pb-2">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[#E5EAF3]">
                                                        {zone.racks.map(rack => (
                                                            <tr key={rack.id} className="text-[12px]">
                                                                <td className="py-2 font-bold text-[#5B33CC]">{rack.code}</td>
                                                                <td className="py-2 font-semibold text-gray-700">{rack.name}</td>
                                                                <td className="py-2 text-gray-500">{rack.rack_type ?? '-'}</td>
                                                                <td className="py-2 text-gray-500">{fmt(rack.capacity)}</td>
                                                                <td className="py-2">
                                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${rack.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                                                        {rack.status === 'active' ? '● Aktif' : '○ Nonaktif'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">

                        {/* Snapshot History */}
                        <div className="bg-white rounded-2xl border border-[#E5EAF3]">
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5EAF3]">
                                <History className="w-4 h-4 text-[#5B33CC]" />
                                <h2 className="text-[14px] font-black text-[#1f2a3d]">Riwayat Snapshot</h2>
                            </div>
                            {snapshots.length === 0 ? (
                                <div className="px-5 py-8 text-center">
                                    <p className="text-[12px] font-semibold text-gray-400">Belum ada snapshot tersimpan</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#E5EAF3]">
                                    {snapshots.map(snap => (
                                        <div key={snap.id} className="flex items-start gap-3 px-5 py-3.5">
                                            <div className="w-7 h-7 rounded-lg bg-[#5B33CC]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Clock className="w-3.5 h-3.5 text-[#5B33CC]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[12px] font-bold text-gray-700 truncate">{snap.name}</p>
                                                <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
                                                    {snap.user_name} · {new Date(snap.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Enterprise Features Info */}
                        <div className="bg-white rounded-2xl border border-[#E5EAF3]">
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5EAF3]">
                                <Zap className="w-4 h-4 text-amber-500" />
                                <h2 className="text-[14px] font-black text-[#1f2a3d]">Fitur Enterprise Aktif</h2>
                            </div>
                            <div className="divide-y divide-[#E5EAF3]">
                                {featureList.map(f => (
                                    <div key={f.title} className="flex items-start gap-3 px-5 py-3.5">
                                        <div className="w-7 h-7 rounded-lg bg-[#5B33CC]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <f.icon className="w-3.5 h-3.5 text-[#5B33CC]" />
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-bold text-gray-700">{f.title}</p>
                                            <p className="text-[11px] font-semibold text-gray-400 mt-0.5 leading-relaxed">{f.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
