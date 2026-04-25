import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';

// --- ICONS ---
const ArrowRightIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
);

const BoxIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

const AlertCircleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const DocumentIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const InboundIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 11l3 3m0 0l3-3m-3 3V5m-6 3a9 9 0 1118 0v2" />
    </svg>
);

const OutboundIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13l-3-3m0 0l-3 3m3-3v14m6-17a9 9 0 10-18 0v2" />
    </svg>
);

const RackIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16M5 6v12M19 6v12M9 6v12M14 6v12" />
    </svg>
);

const CheckCircleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export default function Dashboard({ stats = {}, trends = [], racks = [], wmsKpis = {} }) {
    const [selectedRack, setSelectedRack] = useState(null);
    const [sortBy, setSortBy] = useState('zone');
    const [hoveredTrendIndex, setHoveredTrendIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDocuments = React.useMemo(() => {
        const docs = wmsKpis.latest_documents || [];
        if (!searchTerm) return docs;
        const term = searchTerm.toLowerCase();
        return docs.filter(doc =>
            (doc.number || '').toLowerCase().includes(term) ||
            (doc.type || '').toLowerCase().includes(term) ||
            (doc.party || '').toLowerCase().includes(term)
        );
    }, [wmsKpis.latest_documents, searchTerm]);

    const [aiInsight, setAiInsight] = useState('Analisis koneksi saraf Aether sedang memproses data...');
    const [aiLoading, setAiLoading] = useState(true);

    const fetchAiInsight = (refresh = false) => {
        if (refresh) {
            setAiLoading(true);
            setAiInsight('Menghubungkan ulang ke Aether AI untuk menyusun analitik terbaru...');
        }
        fetch(`/aether/dashboard-insight${refresh ? '?refresh=1' : ''}`)
            .then(res => res.json())
            .then(data => {
                setAiInsight(data.text || 'Sistem Prediksi AI beroperasi dalam mode pemantauan rutin.');
            })
            .catch(() => {
                setAiInsight('Sistem dalam mode luring jarak jauh. Pemantauan lokal aktif secara fallback.');
            })
            .finally(() => setAiLoading(false));
    };

    useEffect(() => {
        fetchAiInsight();
    }, []);

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num ? num.toString() : '0';
    };

    const formatPreciseNumber = (num) => num ? num.toLocaleString('id-ID') : '0';

    // Rack Calculations
    const totalRacks = racks.length;
    const occupiedRacks = racks.filter((r) => r.is_occupied).length;
    const emptyRacks = Math.max(totalRacks - occupiedRacks, 0);
    const alertRacks = racks.filter((r) => r.has_alert).length;
    
    const utilizationRaw = wmsKpis.rack_utilization || (totalRacks > 0 ? Math.round((occupiedRacks / totalRacks) * 100) : 0);
    const rackUtilization = Math.min(Math.max(utilizationRaw, 0), 100);

    const getUtilColorObj = (val) => {
        if (val >= 90) return { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600', iconBg: 'bg-rose-100', dot: 'bg-rose-500' };
        if (val >= 75) return { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', iconBg: 'bg-amber-100', dot: 'bg-amber-500' };
        return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', iconBg: 'bg-emerald-100', dot: 'bg-emerald-500' };
    };
    const utilColors = getUtilColorObj(rackUtilization);

    // Alerts Combined (System + Audit Queue)
    const combinedAlertsTotal = (stats.system_alerts || 0) + (wmsKpis.audit_queue || 0);

    // Visualizer Sorting Logic
    const getProcessedRacks = () => {
        let processed = [...racks];
        if (sortBy === 'capacity') {
            return { all: processed.sort((a, b) => b.fill_percent - a.fill_percent) };
        } else if (sortBy === 'newest') {
            return { all: processed.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) };
        } else {
            const grouped = {};
            processed.forEach(rack => {
                const zone = rack.zone_name || 'Belum Ditentukan';
                if (!grouped[zone]) grouped[zone] = [];
                grouped[zone].push(rack);
            });
            return Object.fromEntries(
                Object.entries(grouped).sort((a, b) => {
                    const lastA = new Date(Math.max(...a[1].map(r => new Date(r.created_at))));
                    const lastB = new Date(Math.max(...b[1].map(r => new Date(r.created_at))));
                    return lastB - lastA;
                })
            );
        }
    };
    const processedData = getProcessedRacks();

    // Trend Calculations
    const latestTrend = trends[trends.length - 1] || { inbound: 0, outbound: 0, date: '-' };
    const previousTrend = trends[trends.length - 2] || latestTrend;
    const inboundDelta = latestTrend.inbound - previousTrend.inbound;
    const outboundDelta = latestTrend.outbound - previousTrend.outbound;
    const formatDelta = (value) => value === 0 ? '0' : `${value > 0 ? '+' : ''}${value}`;
    const maxVal = Math.max(...trends.flatMap(t => [t.inbound, t.outbound]), 10);

    const generatePath = (key, isArea = false) => {
        if (trends.length < 2) return "";
        const points = trends.map((t, i) => ({
            x: (i / (trends.length - 1)) * 100,
            y: 30 - ((t[key] / maxVal) * 20 + 5)
        }));
        let path = `M ${points[0].x},${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) / 3;
            const cp2x = p0.x + (2 * (p1.x - p0.x)) / 3;
            path += ` C ${cp1x},${p0.y} ${cp2x},${p1.y} ${p1.x},${p1.y}`;
        }
        if (isArea) path += ` L 100,100 L 0,100 Z`;
        return path;
    };


    return (
        <DashboardLayout headerSearchPlaceholder="Cari dokumen aktivitas..." searchValue={searchTerm} onSearch={setSearchTerm}>
            <Head title="WMS Dashboard" />
            
            <div className="max-w-[1500px] mx-auto pb-12 space-y-6 animate-in fade-in duration-500">
                {/* --- 0. Header --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">Dashboard Operasional</h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">Status gudang dan ringkasan aktivitas harian.</p>
                    </div>
                    {stats.active_nodes !== undefined && (
                        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 pl-2.5 pr-4 py-1.5 shadow-sm">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-[11px] font-bold tracking-wide text-emerald-700 uppercase">
                                {stats.active_nodes} Node Aktif
                            </span>
                        </div>
                    )}
                </div>

                {/* --- 1. KPI Utama (5 Cards) --- */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    {/* Inbound */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between group">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                            <InboundIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Inbound Hari Ini</p>
                            <h3 className="text-2xl font-black text-slate-900">{formatPreciseNumber(wmsKpis.today_inbound || 0)}</h3>
                        </div>
                    </div>

                    {/* Outbound & Tingkat Keluar */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                                <OutboundIcon className="w-5 h-5" />
                            </div>
                            {stats.outbound_rate !== undefined && (
                                <span className="bg-slate-50 text-slate-500 border border-slate-100 text-[9px] font-black px-2 py-1 rounded-md tracking-wide" title="Tingkat Keluar per Jam">
                                    {stats.outbound_rate}/JAM
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Outbound Hari Ini</p>
                            <h3 className="text-2xl font-black text-slate-900">{formatPreciseNumber(wmsKpis.today_outbound || 0)}</h3>
                        </div>
                    </div>

                    {/* Utilisasi Rack */}
                    <div className={`rounded-2xl p-5 border ${utilColors.border} ${utilColors.bg} flex flex-col justify-between group`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${utilColors.iconBg} ${utilColors.text}`}>
                                <RackIcon className="w-5 h-5" />
                            </div>
                            <span className={`block h-3 w-3 rounded-full ${utilColors.dot}`}></span>
                        </div>
                        <div>
                            <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 opacity-70 ${utilColors.text}`}>Utilisasi Rack</p>
                            <h3 className={`text-2xl font-black ${utilColors.text}`}>{rackUtilization}%</h3>
                        </div>
                    </div>

                    {/* Total Inventaris */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between group">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-4">
                            <BoxIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Inventaris</p>
                            <h3 className="text-2xl font-black text-slate-900">{formatNumber(stats.total_inventory || 0)}</h3>
                        </div>
                    </div>

                    {/* Peringatan Sistem (Digabung) */}
                    <div className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between group ${combinedAlertsTotal > 0 ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${combinedAlertsTotal > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {combinedAlertsTotal > 0 ? <AlertCircleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                            </div>
                            {(wmsKpis.audit_queue || 0) > 0 && (
                                <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-black px-2 py-1 rounded-md tracking-wide">
                                    {wmsKpis.audit_queue} AUDIT
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Peringatan Sistem</p>
                            <h3 className={`text-2xl font-black ${combinedAlertsTotal > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                                {formatPreciseNumber(combinedAlertsTotal)}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* --- 2. Rack Summary (1 Row) --- */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <h2 className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">Ringkasan Rack Gudang</h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                        <div className="px-6 py-4 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Rack</span>
                            <span className="text-xl font-black text-slate-800">{formatPreciseNumber(totalRacks)}</span>
                        </div>
                        <div className="px-6 py-4 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Terisi</span>
                            <span className="text-xl font-black text-blue-600">{formatPreciseNumber(occupiedRacks)}</span>
                        </div>
                        <div className="px-6 py-4 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Kosong</span>
                            <span className="text-xl font-black text-emerald-600">{formatPreciseNumber(emptyRacks)}</span>
                        </div>
                        <div className={`px-6 py-4 flex items-center justify-between transition-colors ${alertRacks > 0 ? 'bg-rose-50/60' : ''}`}>
                            <span className={`text-[11px] font-bold uppercase tracking-widest ${alertRacks > 0 ? 'text-rose-500' : 'text-slate-400'}`}>Perlu Tinjau</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-xl font-black ${alertRacks > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{formatPreciseNumber(alertRacks)}</span>
                                {alertRacks > 0 && <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 3. Middle Section: Visualisasi Gudang & Pusat AI --- */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    
                    {/* Visualisasi Lantai Gudang */}
                    <div className="xl:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-[#edf2f7] min-h-[340px] flex flex-col relative">
                        <div className="flex justify-between items-start mb-5 relative z-10">
                            <div>
                                <h2 className="text-[16px] font-black text-[#1a202c]">Visualisasi Lantai Gudang</h2>
                                <p className="text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-wider">
                                    Tampilan: <span className="text-[#3632c0] font-black">{sortBy === 'zone' ? 'Zona' : sortBy === 'capacity' ? 'Kapasitas Penuh' : 'Baru Ditambahkan'}</span>
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                {/* Filter UI */}
                                <div className="flex bg-[#f4f5f9] p-1 rounded-lg border border-gray-100 shadow-sm">
                                    {[
                                        { id: 'zone', label: 'ZONA' },
                                        { id: 'capacity', label: 'PENUH' },
                                        { id: 'newest', label: 'BARU' }
                                    ].map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => setSortBy(option.id)}
                                            className={`px-2.5 py-1 rounded-[7px] text-[9px] font-black transition-all ${sortBy === option.id ? 'bg-white text-[#3632c0] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 bg-[#fbfcfd] rounded-[18px] border border-[#edf2f7] relative flex flex-col overflow-y-auto max-h-[400px] custom-scrollbar">
                            <div className="p-5 px-10 pt-8 space-y-6">
                                {Object.entries(processedData).map(([groupName, groupRacks]) => (
                                    <div key={groupName} className="space-y-3">
                                        {sortBy === 'zone' && (
                                            <div className="flex items-center space-x-3">
                                                <div className="h-px flex-1 bg-gray-100"></div>
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.16em]">{groupName}</span>
                                                <div className="h-px flex-1 bg-gray-100"></div>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-12 gap-2.5">
                                            {groupRacks.map((rack, index) => {
                                                const column = index % 12;
                                                const isLeftEdge = column < 2;
                                                const isRightEdge = column > 9;
                                                let tooltipPosClass = "left-1/2 -translate-x-1/2";
                                                if (isLeftEdge) tooltipPosClass = "left-0 translate-x-0";
                                                else if (isRightEdge) tooltipPosClass = "right-0 translate-x-0";

                                                return (
                                                    <div
                                                        key={rack.id}
                                                        onClick={() => setSelectedRack(rack)}
                                                        className={`h-4 rounded-[5px] transition-all duration-300 relative group cursor-pointer ${rack.has_alert ? 'bg-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.3)]' : rack.is_occupied ? 'bg-[#3632c0]' : 'bg-[#e2e8f0]'}`}
                                                    >
                                                        {/* Advanced Tooltip */}
                                                        <div className={`absolute bottom-full ${tooltipPosClass} mb-2.5 w-40 p-2.5 bg-white text-[#1a202c] rounded-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 z-50 pointer-events-none shadow-[0_10px_24px_rgba(0,0,0,0.08)] border border-[#edf2f7]`}>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="text-[9px] font-black tracking-wider uppercase opacity-40">Info Rak</span>
                                                                {rack.has_alert && <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>}
                                                            </div>
                                                            <div className="text-[12px] font-black mb-2 text-[#1a202c]">{rack.name}</div>
                                                            <div className="space-y-1.5">
                                                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-400">
                                                                    <span>Kapasitas</span>
                                                                    <span className={rack.has_alert ? 'text-red-600' : 'text-[#3632c0]'}>{rack.fill_percent}%</span>
                                                                </div>
                                                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-500 ${rack.has_alert ? 'bg-red-500' : 'bg-[#3632c0]'}`}
                                                                        style={{ width: `${Math.min(rack.fill_percent, 100)}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="text-[8px] font-bold text-gray-500">
                                                                    {formatPreciseNumber(rack.current_qty)} / {formatPreciseNumber(rack.capacity)} unit
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* Pointer Arrow */}
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[10px] border-[6px] border-transparent border-t-white opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 z-50 pointer-events-none shadow-sm"></div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary Legend Overlay */}
                        <div className="absolute bottom-10 left-10 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center space-x-3 z-10 pointer-events-none">
                            <div className="flex items-center space-x-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#3632c0]"></span>
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Terisi</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#e2e8f0]"></span>
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Kosong</span>
                            </div>
                        </div>
                    </div>

                    {/* Pusat Intelejen Prediksi AI */}
                    <div className="xl:col-span-4 bg-[#2d2a7f] rounded-[20px] p-6 text-white shadow-sm flex flex-col justify-between min-h-[340px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[320px] h-[320px] bg-[#4a46c8] rounded-full filter blur-[70px] opacity-55 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                        <div className="relative z-10 w-full mb-5 flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center space-x-2 mb-1.5">
                                    <div className="w-[7px] h-[7px] bg-[#60a5fa] rounded-full shadow-[0_0_10px_rgba(96,165,250,0.9)] animate-pulse"></div>
                                    <span className="text-[10px] font-black text-[#93c5fd] tracking-[0.18em] uppercase">Pusat Intelejen</span>
                                </div>
                                <div className="text-[9px] font-bold text-[#93c5fd]/70 tracking-[0.16em] uppercase">Prediksi AI Aktif</div>
                            </div>
                            <div className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/90">
                                Alert {alertRacks}
                            </div>
                        </div>
                        <div className="relative z-10 mb-6 max-w-[95%]">
                            <p className={`text-[17px] font-extrabold leading-[1.4] text-white transition-opacity duration-500 ${aiLoading ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
                                {aiInsight.split(/(\*\*.*?\*\*)/g).map((part, index) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                        return <strong key={index} className="text-white font-black border-b-[1.5px] border-white/40 pb-[1px]">{part.slice(2, -2)}</strong>;
                                    }
                                    return part;
                                })}
                            </p>
                        </div>
                        <div className="relative z-10 mt-auto flex items-center justify-between mb-4">
                            <button 
                                onClick={() => fetchAiInsight(true)}
                                disabled={aiLoading}
                                className="flex items-center space-x-2.5 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-[10px] transition-all backdrop-blur-md border border-white/5 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-[11px] font-black tracking-wide text-white">
                                    {aiLoading ? 'MENYUSUN...' : 'GENERATE ULANG AI'}
                                </span>
                                {!aiLoading && <ArrowRightIcon className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                        <div className="relative z-10 pt-4 border-t border-white/10 w-full">
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-[9px] font-extrabold text-[#93c5fd]/70 uppercase tracking-[0.16em] mb-1 block">Skor Efisiensi</span>
                                    <div className="text-[28px] font-black text-white leading-none">{stats.efficiency_score || 88}%</div>
                                </div>
                                <div className="flex space-x-1 items-end">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className={`w-2 rounded-full ${i < 6 ? 'h-5 bg-[#60a5fa]' : 'h-3 bg-white/20'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 4. Bottom Section: Tren Stok & Dokumen Terbaru --- */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    
                    {/* Tren Pergerakan Stok */}
                    <div className="xl:col-span-8 bg-white rounded-[20px] p-6 shadow-sm border border-[#edf2f7] min-h-[320px] flex flex-col">
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <h2 className="text-[16px] font-black text-[#1a202c]">Tren Pergerakan Stok</h2>
                                <p className="text-[11px] font-semibold text-gray-500 mt-1">Perbandingan barang masuk dan keluar historikal.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-1.5 text-[10px] font-bold text-gray-600">
                                    <span className="w-2.5 h-2.5 rounded-md bg-[#2563eb]"></span>
                                    <span>Masuk</span>
                                </div>
                                <div className="flex items-center space-x-1.5 text-[10px] font-bold text-gray-600">
                                    <span className="w-2.5 h-2.5 rounded-md bg-[#94a3b8]"></span>
                                    <span>Keluar</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full relative group/chart mt-4">
                            {/* Dynamic SVG Graph */}
                            <div className="absolute inset-0">
                                <svg
                                    width="100%"
                                    height="100%"
                                    preserveAspectRatio="none"
                                    viewBox="0 0 100 30"
                                    onMouseLeave={() => setHoveredTrendIndex(null)}
                                    className="overflow-visible"
                                >
                                    {/* Horizontal Grid Lines */}
                                    {[7.5, 15, 22.5].map(y => (
                                        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f1f5f9" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                                    ))}

                                    {/* Vertical Crosshair */}
                                    {hoveredTrendIndex !== null && (
                                        <line
                                            x1={(hoveredTrendIndex / (trends.length - 1)) * 100}
                                            y1="0"
                                            x2={(hoveredTrendIndex / (trends.length - 1)) * 100}
                                            y2="30"
                                            stroke="#e2e8f0"
                                            strokeWidth="1"
                                            strokeDasharray="4 4"
                                            vectorEffect="non-scaling-stroke"
                                        />
                                    )}

                                    {/* Outbound & Inbound Paths */}
                                    <path d={generatePath('outbound')} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" strokeLinecap="round" opacity="0.6" vectorEffect="non-scaling-stroke" />
                                    <path d={generatePath('inbound')} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                                    <path d={generatePath('inbound') + " L 100,30 L 0,30 Z"} fill="url(#blue-gradient)" opacity="0.08" />

                                    {/* Interaction Rects */}
                                    {trends.map((_, i) => (
                                        <rect
                                            key={i}
                                            x={(i / (trends.length - 1)) * 100 - 5}
                                            y="0"
                                            width="10"
                                            height="100"
                                            fill="transparent"
                                            onMouseEnter={() => setHoveredTrendIndex(i)}
                                            className="cursor-pointer"
                                        />
                                    ))}

                                    <defs>
                                        <linearGradient id="blue-gradient" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#2563eb" />
                                            <stop offset="100%" stopColor="transparent" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* HTML Hover Markers (Perfect Circles avoiding SVG stretch) */}
                                {trends.map((t, i) => {
                                    const xPct = (i / (trends.length - 1)) * 100;
                                    const yInTopPct = ( (30 - ((t.inbound / maxVal) * 20 + 5)) / 30 ) * 100;
                                    const yOutTopPct = ( (30 - ((t.outbound / maxVal) * 20 + 5)) / 30 ) * 100;
                                    const isHovered = hoveredTrendIndex === i;

                                    return (
                                        <React.Fragment key={`marker-${i}`}>
                                            <div 
                                                className={`absolute w-[11px] h-[11px] bg-[#2563eb] rounded-full border-2 border-white shadow-sm transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none ${isHovered ? 'scale-[1.4] ring-[3px] ring-blue-100 z-10' : 'scale-100 z-0'}`}
                                                style={{ left: `${xPct}%`, top: `${yInTopPct}%` }}
                                            />
                                            <div 
                                                className={`absolute w-2.5 h-2.5 bg-[#94a3b8] rounded-full border-[1.5px] border-white shadow-sm transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none ${isHovered ? 'scale-[1.4] ring-[3px] ring-slate-100 z-10' : 'scale-100 z-0'}`}
                                                style={{ left: `${xPct}%`, top: `${yOutTopPct}%` }}
                                            />
                                        </React.Fragment>
                                    );
                                })}
                            </div>

                            {/* Interactive Tooltip */}
                            {hoveredTrendIndex !== null && (
                                <div
                                    className="absolute z-50 pointer-events-none transition-all duration-200 bg-[#1a202c] rounded-xl p-3 shadow-2xl border border-white/10 text-white min-w-[140px]"
                                    style={{
                                        left: `${(hoveredTrendIndex / (trends.length - 1)) * 100}%`,
                                        bottom: '60%',
                                        transform: `translateX(${hoveredTrendIndex > (trends.length / 2) ? '-100%' : '0%'}) ${hoveredTrendIndex > (trends.length / 2) ? 'translateX(-10px)' : 'translateX(10px)'}`
                                    }}
                                >
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{trends[hoveredTrendIndex].date}</div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center space-x-6">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb]"></div>
                                                <span className="text-[11px] font-bold">Masuk</span>
                                            </div>
                                            <span className="text-[11px] font-black">{formatPreciseNumber(trends[hoveredTrendIndex].inbound)}</span>
                                        </div>
                                        <div className="flex justify-between items-center space-x-6">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#94a3b8]"></div>
                                                <span className="text-[11px] font-bold">Keluar</span>
                                            </div>
                                            <span className="text-[11px] font-black">{formatPreciseNumber(trends[hoveredTrendIndex].outbound)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* X-axis Labels */}
                            <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-1">
                                {trends.map((t, i) => (
                                    <span key={i} className={`text-[10px] font-black transition-colors ${hoveredTrendIndex === i ? 'text-[#2563eb]' : 'text-gray-400'}`}>
                                        {t.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Dokumen Terbaru */}
                    <div className="xl:col-span-4 bg-white rounded-[20px] p-6 shadow-sm border border-[#edf2f7] min-h-[320px] flex flex-col h-full max-h-[350px]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[16px] font-black text-[#1a202c]">Dokumen Terbaru</h2>
                            {filteredDocuments.length > 0 && (
                                <span className="rounded-[8px] bg-[#f4f3ff] px-2.5 py-1 text-[10px] font-black text-[#3632c0]">
                                    {filteredDocuments.length} Baru
                                </span>
                            )}
                        </div>
                        
                        {filteredDocuments.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                <div className="w-12 h-12 rounded-full border border-dashed border-gray-200 flex items-center justify-center mb-3 text-gray-300">
                                    <DocumentIcon className="w-5 h-5" />
                                </div>
                                <p className="text-[12px] font-bold text-gray-400">Tidak ada kelompok dokumen baru.</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-2">
                                {filteredDocuments.map((doc, idx) => {
                                    const isGr = doc.type && doc.type.toLowerCase().includes('gr');
                                    const badgeColor = isGr ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-violet-50 text-violet-600 border-violet-200';
                                    const Wrapper = doc.url ? Link : 'div';
                                    
                                    return (
                                        <Wrapper 
                                            key={`${doc.number}-${idx}`} 
                                            {...(doc.url ? { href: doc.url } : {})}
                                            className={`block p-3 rounded-xl border border-[#edf2f7] hover:border-slate-300 transition-all ${doc.url ? 'cursor-pointer hover:bg-slate-50/50 shadow-sm hover:shadow' : ''}`}
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${badgeColor}`}>
                                                        {doc.type}
                                                    </span>
                                                    <p className="text-[12px] font-bold text-slate-900">{doc.number}</p>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 mt-0.5 whitespace-nowrap">{doc.date}</span>
                                            </div>
                                            <p className="text-[11px] font-medium text-slate-500">{doc.party || 'Internal / Sistem'}</p>
                                        </Wrapper>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
            
            {/* Rack Detail Modal (Pop-up) */}
            {selectedRack && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pb-24">
                    <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-md" onClick={() => setSelectedRack(null)}></div>
                    <div className="relative bg-white rounded-[32px] w-full max-w-[440px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className={`h-24 flex items-center justify-center ${selectedRack.has_alert ? 'bg-red-500' : 'bg-[#3632c0]'} relative`}>
                            <button
                                onClick={() => setSelectedRack(null)}
                                className="absolute top-6 right-6 text-white opacity-60 hover:opacity-100"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <RackIcon className="w-10 h-10 text-white opacity-20" />
                        </div>

                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-[20px] font-black text-[#1a202c]">{selectedRack.name}</h3>
                                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">{selectedRack.code}</p>
                                </div>
                                <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wide ${selectedRack.has_alert ? 'bg-red-50 text-red-600' : 'bg-[#f4f3ff] text-[#3632c0]'}`}>
                                    {selectedRack.fill_percent}% TERISI
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[11px] font-black text-gray-500 tracking-wider">
                                        <span>STATUS KETERISIAN</span>
                                        <span className="text-[#1a202c]">{formatPreciseNumber(selectedRack.current_qty)} / {formatPreciseNumber(selectedRack.capacity)} Unit</span>
                                    </div>
                                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-700 ${selectedRack.has_alert ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-[#3632c0]'}`}
                                            style={{ width: `${Math.min(selectedRack.fill_percent, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#f8fafc] p-4 rounded-2xl border border-gray-100">
                                        <div className="text-[9px] font-black text-gray-400 uppercase mb-1">Pemanfaatan</div>
                                        <div className="text-[18px] font-black text-[#1a202c]">{selectedRack.fill_percent}%</div>
                                    </div>
                                    <div className="bg-[#f8fafc] p-4 rounded-2xl border border-gray-100">
                                        <div className="text-[9px] font-black text-gray-400 uppercase mb-1">Tersedia</div>
                                        <div className="text-[18px] font-black text-[#1a202c]">{formatPreciseNumber(Math.max(0, selectedRack.capacity - selectedRack.current_qty))} Unit</div>
                                    </div>
                                </div>

                                {selectedRack.has_alert && (
                                    <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <AlertCircleIcon className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-black text-red-900 leading-none mb-1 uppercase tracking-tight">Peringatan Kapasitas</div>
                                            <p className="text-[10px] font-bold text-red-700/80 leading-relaxed">
                                                Rak ini memiliki tingkat pemanfaatan di atas batas aman.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
            `}</style>
        </DashboardLayout>
    );
}
