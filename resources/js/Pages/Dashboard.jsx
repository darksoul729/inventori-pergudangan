import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import React, { useState } from 'react';

// Icons
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

const ActivityIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const TrendingUpIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const AlertCircleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export default function Dashboard({ stats, trends, racks }) {
    const [selectedRack, setSelectedRack] = useState(null);
    const [sortBy, setSortBy] = useState('zone'); // 'zone', 'capacity', 'newest'
    const [hoveredTrendIndex, setHoveredTrendIndex] = useState(null);


    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    // Sorting & Grouping Logic
    const getProcessedRacks = () => {
        let processed = [...racks];
        
        if (sortBy === 'capacity') {
            return { all: processed.sort((a, b) => b.fill_percent - a.fill_percent) };
        } else if (sortBy === 'newest') {
            return { all: processed.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) };
        } else {
            // Group by Zone
            const grouped = {};
            processed.forEach(rack => {
            const zone = rack.zone_name || 'Belum Ditentukan';
                if (!grouped[zone]) grouped[zone] = [];
                grouped[zone].push(rack);
            });
            // Sort zones by name or newest first? User said "pilih rack paling baru ditambahkan di zone apa sehingga akan dikelompokkan dalam satu zone tersebut"
            // Let's sort zones by the latest added rack in that zone
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
    const totalRacks = racks.length;
    const occupiedRacks = racks.filter((rack) => rack.is_occupied).length;
    const emptyRacks = Math.max(totalRacks - occupiedRacks, 0);
    const alertRacks = racks.filter((rack) => rack.has_alert).length;
    const rackOccupancyPercent = totalRacks > 0 ? Math.round((occupiedRacks / totalRacks) * 100) : 0;
    const latestTrend = trends[trends.length - 1] || { inbound: 0, outbound: 0, date: '-' };
    const previousTrend = trends[trends.length - 2] || latestTrend;
    const inboundDelta = latestTrend.inbound - previousTrend.inbound;
    const outboundDelta = latestTrend.outbound - previousTrend.outbound;

    const formatDelta = (value) => {
        if (value === 0) return '0';
        return `${value > 0 ? '+' : ''}${value}`;
    };


    // Calculate SVG paths for trends
    const maxVal = Math.max(...trends.flatMap(t => [t.inbound, t.outbound]), 10);
    
    const generatePath = (key, isArea = false) => {
        if (trends.length < 2) return "";
        const points = trends.map((t, i) => ({
            x: (i / (trends.length - 1)) * 100,
            y: 30 - ((t[key] / maxVal) * 20 + 5) // Scale to fit 30-unit vertical viewBox
        }));

        let path = `M ${points[0].x},${points[0].y}`;
        
        // Use cubic bezier curves for smoothness
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) / 3;
            const cp2x = p0.x + (2 * (p1.x - p0.x)) / 3;
            path += ` C ${cp1x},${p0.y} ${cp2x},${p1.y} ${p1.x},${p1.y}`;
        }


        if (isArea) {
            path += ` L 100,100 L 0,100 Z`;
        }

        return path;
    };


    return (
        <DashboardLayout>
            <Head title="Dashboard Gudang" />

            <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
                <div>
                    <h1 className="text-[24px] font-black text-[#1a202c] tracking-tight leading-tight">Dashboard Gudang</h1>
                    <p className="text-[13px] font-semibold text-gray-500 mt-1">Ringkasan kondisi stok, rack, dan pergerakan barang di gudang operasional.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-1.5">
                    <span className="inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700">Mode Operasional Aktif</span>
                </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                <div className="rounded-xl border border-[#e9edf5] bg-white px-3.5 py-2.5">
                    <div className="text-[9px] font-black tracking-[0.14em] text-gray-400 uppercase">Total Rack</div>
                    <div className="mt-1 text-[18px] font-black text-[#1a202c] leading-none">{totalRacks}</div>
                </div>
                <div className="rounded-xl border border-[#e9edf5] bg-white px-3.5 py-2.5">
                    <div className="text-[9px] font-black tracking-[0.14em] text-gray-400 uppercase">Terisi</div>
                    <div className="mt-1 text-[18px] font-black text-[#1a202c] leading-none">{occupiedRacks} <span className="text-[11px] text-gray-400">{rackOccupancyPercent}%</span></div>
                </div>
                <div className="rounded-xl border border-[#e9edf5] bg-white px-3.5 py-2.5">
                    <div className="text-[9px] font-black tracking-[0.14em] text-gray-400 uppercase">Kosong</div>
                    <div className="mt-1 text-[18px] font-black text-[#1a202c] leading-none">{emptyRacks}</div>
                </div>
                <div className="rounded-xl border border-red-100 bg-red-50/60 px-3.5 py-2.5">
                    <div className="text-[9px] font-black tracking-[0.14em] text-red-400 uppercase">Perlu Tinjau</div>
                    <div className="mt-1 text-[18px] font-black text-red-600 leading-none">{alertRacks} Rack</div>
                </div>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-1 gap-3 mb-5 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { title: "TOTAL INVENTARIS", value: formatNumber(stats.total_inventory), trend: stats.inventory_trend, color: "text-[#3632c0]", bg: "bg-[#eef2ff]", icon: BoxIcon },
                    { title: "TINGKAT KELUAR", value: `${stats.outbound_rate}/jam`, trend: stats.outbound_trend, color: "text-[#10b981]", bg: "bg-[#ecfdf5]", icon: TrendingUpIcon },
                    { title: "PERINGATAN SISTEM", value: stats.system_alerts.toString(), trend: stats.system_alerts > 0 ? "Tinjau" : "Aman", color: "text-[#ef4444]", bg: "bg-[#fef2f2]", icon: AlertCircleIcon },
                    { title: "NODE AKTIF", value: stats.active_nodes.toString(), trend: "Aktif", color: "text-[#f97316]", bg: "bg-[#fff7ed]", icon: ActivityIcon },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-[16px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#edf2f7] flex flex-col justify-between min-h-[118px]">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                            <span className={`px-2 py-0.5 text-[9px] font-black rounded-md tracking-wide ${stat.bg} ${stat.color}`}>{stat.trend}</span>
                        </div>
                        <div>
                            <div className="text-[9px] font-extrabold text-gray-400 tracking-[0.12em] mb-1 uppercase">{stat.title}</div>
                            <div className="text-[28px] font-black text-[#111827] leading-none tracking-tight">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-5">
                {/* Intelligence Hub */}
                <div className="col-span-12 lg:col-span-5 bg-[#2d2a7f] rounded-[20px] p-6 text-white shadow-[0_10px_30px_rgba(45,42,127,0.13)] flex flex-col justify-between min-h-[340px] relative overflow-hidden">
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
                        <p className="text-[17px] font-extrabold leading-[1.4] text-white">
                            Kekurangan stok diprediksi pada <strong className="text-white font-black border-b-2 border-white/30 pb-0.5">Zona penyimpanan cepat bergerak</strong> dalam waktu 48 jam. Disarankan untuk mengisi ulang stok penyangga dan memeriksa alokasi rak.
                        </p>
                    </div>

                    <div className="relative z-10 mt-auto flex items-center justify-between">
                        <button className="flex items-center space-x-2.5 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-[10px] transition-all backdrop-blur-md border border-white/5 group">
                            <span className="text-[11px] font-black tracking-wide text-white">JALANKAN REKOMENDASI</span>
                            <ArrowRightIcon className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="relative z-10 mt-5 pt-4 border-t border-white/10 w-full">
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-[9px] font-extrabold text-[#93c5fd]/70 uppercase tracking-[0.16em] mb-1 block">Skor Efisiensi</span>
                                <div className="text-[28px] font-black text-white leading-none">{stats.efficiency_score}%</div>

                            </div>
                            <div className="flex space-x-1 items-end">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className={`w-2 rounded-full ${i < 6 ? 'h-5 bg-[#60a5fa]' : 'h-3 bg-white/20'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Warehouse Floor Visualization */}
                <div className="col-span-12 lg:col-span-7 bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#edf2f7] min-h-[340px] flex flex-col relative overflow-visible">


                    <div className="flex justify-between items-start mb-5 relative z-10">
                        <div>
                            <h2 className="text-[16px] font-black text-[#1a202c]">Visualisasi Lantai Gudang</h2>
                            <p className="text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-wider">
                                Tampilan: <span className="text-[#4338ca] font-black">{sortBy === 'zone' ? 'Zona' : sortBy === 'capacity' ? 'Kapasitas Penuh' : 'Baru Ditambahkan'}</span>
                            </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
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
                                        className={`px-2.5 py-1 rounded-[7px] text-[9px] font-black transition-all ${sortBy === option.id ? 'bg-white text-[#4338ca] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            
                            {racks.filter(r => r.has_alert).length > 0 && (
                                <div className="flex items-center space-x-2 bg-red-50 px-2.5 py-1 rounded-[9px] border border-red-100 animate-pulse">
                                    <AlertCircleIcon className="w-3 h-3 text-red-500" />
                                    <span className="text-[9px] font-black text-red-600 uppercase tracking-tight">{racks.filter(r => r.has_alert).length} RAK HAMPIR PENUH</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 mb-4">
                        <div className="rounded-lg border border-[#e9edf5] bg-slate-50/70 px-3 py-2">
                            <div className="text-[8px] font-black uppercase tracking-[0.14em] text-gray-400">Utilisasi</div>
                            <div className="mt-1 text-[14px] font-black text-[#1a202c]">{rackOccupancyPercent}%</div>
                        </div>
                        <div className="rounded-lg border border-[#e9edf5] bg-slate-50/70 px-3 py-2">
                            <div className="text-[8px] font-black uppercase tracking-[0.14em] text-gray-400">Terisi</div>
                            <div className="mt-1 text-[14px] font-black text-[#4338ca]">{occupiedRacks} Rack</div>
                        </div>
                        <div className="rounded-lg border border-red-100 bg-red-50/70 px-3 py-2">
                            <div className="text-[8px] font-black uppercase tracking-[0.14em] text-red-400">Kritis</div>
                            <div className="mt-1 text-[14px] font-black text-red-600">{alertRacks} Rack</div>
                        </div>
                    </div>

                    <div className="flex-1 bg-[#fbfcfd] rounded-[18px] border border-[#edf2f7] relative flex flex-col overflow-y-auto max-h-[470px] custom-scrollbar">
                        <div className="p-5 px-10 pt-10 space-y-6">


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
                                            let arrowPosClass = "left-1/2 -translate-x-1/2";
                                            
                                            if (isLeftEdge) {
                                                tooltipPosClass = "left-0 translate-x-0";
                                                arrowPosClass = "left-4 translate-x-0";
                                            } else if (isRightEdge) {
                                                tooltipPosClass = "right-0 translate-x-0";
                                                arrowPosClass = "right-4 translate-x-0";
                                            }

                                            return (
                                                <div 
                                                    key={rack.id} 
                                                    onClick={() => setSelectedRack(rack)}
                                                    className={`h-4 rounded-[5px] transition-all duration-300 relative group cursor-pointer ${rack.has_alert ? 'bg-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.3)]' : rack.is_occupied ? 'bg-[#4338ca]' : 'bg-[#e2e8f0]'}`}
                                                >
                                                    {/* Advanced Tooltip (Edge-Aware) */}
                                                    <div className={`absolute bottom-full ${tooltipPosClass} mb-2.5 w-40 p-2.5 bg-white text-[#1a202c] rounded-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 z-50 pointer-events-none shadow-[0_10px_24px_rgba(0,0,0,0.08)] border border-[#edf2f7]`}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="text-[9px] font-black tracking-wider uppercase opacity-40">Info Rak</span>
                                                            {rack.has_alert && <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>}
                                                        </div>
                                                        <div className="text-[12px] font-black mb-2 text-[#1a202c]">{rack.name}</div>
                                                        
                                                        <div className="space-y-1.5">
                                                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-400">
                                                                <span>Kapasitas</span>
                                                                <span className={rack.has_alert ? 'text-red-600' : 'text-[#4338ca]'}>{rack.fill_percent}%</span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div 
                                                                    className={`h-full rounded-full transition-all duration-500 ${rack.has_alert ? 'bg-red-500' : 'bg-[#4338ca]'}`}
                                                                    style={{ width: `${Math.min(rack.fill_percent, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                            <div className="text-[8px] font-bold text-gray-500">
                                                                {rack.current_qty.toLocaleString()} / {rack.capacity.toLocaleString()} unit
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Pointer Arrow - Fixed to Rack Center */}
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
                        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center space-x-3">
                            <div className="flex items-center space-x-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#4338ca]"></span>
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Terisi</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#e2e8f0]"></span>
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Kosong</span>
                            </div>
                        </div>

                </div>
            </div>

            {/* Stock Movement Trend */}
            <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#edf2f7] min-h-[250px] flex flex-col mt-5">
                <div className="flex justify-between items-center mb-5">
                    <div>
                        <h2 className="text-[16px] font-black text-[#1a202c]">Tren Pergerakan Stok</h2>
                        <p className="text-[11px] font-semibold text-gray-500 mt-1">Perbandingan barang masuk dan keluar.</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                            <div className="rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1">
                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.12em]">Masuk</span>
                                <div className="text-[12px] font-black text-blue-700 leading-none mt-0.5">
                                    {latestTrend.inbound.toLocaleString()} <span className="text-[10px]">{formatDelta(inboundDelta)}</span>
                                </div>
                            </div>
                            <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.12em]">Keluar</span>
                                <div className="text-[12px] font-black text-slate-700 leading-none mt-0.5">
                                    {latestTrend.outbound.toLocaleString()} <span className="text-[10px]">{formatDelta(outboundDelta)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-4 text-[10px] font-bold text-gray-600">
                            <div className="flex items-center space-x-1.5">
                                <span className="w-2.5 h-2.5 rounded-md bg-[#2563eb]"></span>
                                <span>Masuk</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <span className="w-2.5 h-2.5 rounded-md bg-[#94a3b8]"></span>
                                <span>Keluar</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full relative group/chart">
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


                             {/* Outbound (Dashed Smooth Curve) */}
                             <path d={generatePath('outbound')} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" strokeLinecap="round" opacity="0.6" vectorEffect="non-scaling-stroke" />
                             
                             {/* Inbound (Solid Smooth Curve) */}
                             <path d={generatePath('inbound')} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                             <path 
                                d={generatePath('inbound') + " L 100,30 L 0,30 Z"} 
                                fill="url(#blue-gradient)" 
                                opacity="0.08" 
                             />


                             
                             {/* Interaction Rects (for better hover detection) */}
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

                             {/* Markers */}
                             {trends.map((t, i) => {
                                 const x = (i / (trends.length - 1)) * 100;
                                 const yIn = 30 - ((t.inbound / maxVal) * 20 + 5);
                                 const yOut = 30 - ((t.outbound / maxVal) * 20 + 5);
                                 const isHovered = hoveredTrendIndex === i;

                                 return (
                                     <React.Fragment key={i}>
                                         <ellipse 
                                             cx={x} cy={yIn} 
                                             rx={isHovered ? 1 : 0.6} 
                                             ry={isHovered ? 3 : 2}
                                             fill="#2563eb" 
                                             className="transition-all duration-200"
                                             stroke="white"
                                             strokeWidth="2"
                                             vectorEffect="non-scaling-stroke"
                                         />
                                         <ellipse 
                                             cx={x} cy={yOut} 
                                             rx={isHovered ? 0.8 : 0.5} 
                                             ry={isHovered ? 2.5 : 1.5}
                                             fill="#94a3b8" 
                                             className="transition-all duration-200"
                                             stroke="white"
                                             strokeWidth="1.5"
                                             vectorEffect="non-scaling-stroke"
                                         />
                                     </React.Fragment>


                                 );
                             })}

                             <defs>
                                <linearGradient id="blue-gradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#2563eb" />
                                    <stop offset="100%" stopColor="transparent" />
                                </linearGradient>
                            </defs>
                         </svg>
                    </div>

                    {/* Interactive Tooltip */}
                    {hoveredTrendIndex !== null && (
                        <div 
                            className="absolute z-50 pointer-events-none transition-all duration-200 bg-[#1a202c] rounded-xl p-3 shadow-2xl border border-white/10 text-white min-w-[140px]"
                            style={{ 
                                left: `${(hoveredTrendIndex / (trends.length - 1)) * 100}%`,
                                bottom: '60%',
                                transform: `translateX(${hoveredTrendIndex > 3 ? '-100%' : '0%'}) ${hoveredTrendIndex > 3 ? 'translateX(-10px)' : 'translateX(10px)'}`
                            }}
                        >
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{trends[hoveredTrendIndex].date}</div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center space-x-6">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb]"></div>
                                        <span className="text-[11px] font-bold">Masuk</span>
                                    </div>
                                    <span className="text-[11px] font-black">{trends[hoveredTrendIndex].inbound.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center space-x-6">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#94a3b8]"></div>
                                        <span className="text-[11px] font-bold">Keluar</span>
                                    </div>
                                    <span className="text-[11px] font-black">{trends[hoveredTrendIndex].outbound.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Labels for X-axis */}
                    <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-1">
                        {trends.map((t, i) => (
                            <span key={i} className={`text-[10px] font-black transition-colors ${hoveredTrendIndex === i ? 'text-[#2563eb]' : 'text-gray-400'}`}>
                                {t.label}
                            </span>
                        ))}
                    </div>
                </div>

            </div>

            {/* Rack Detail Modal (Pop-up) */}
            {selectedRack && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pb-24">
                    <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-md" onClick={() => setSelectedRack(null)}></div>
                    <div className="relative bg-white rounded-[32px] w-full max-w-[440px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className={`h-24 flex items-center justify-center ${selectedRack.has_alert ? 'bg-red-500' : 'bg-[#4338ca]'} relative`}>
                            <button 
                                onClick={() => setSelectedRack(null)}
                                className="absolute top-6 right-6 text-white opacity-60 hover:opacity-100"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <BoxIcon className="w-10 h-10 text-white opacity-20" />
                        </div>
                        
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-[20px] font-black text-[#1a202c]">{selectedRack.name}</h3>
                                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">{selectedRack.code}</p>
                                </div>
                                <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wide ${selectedRack.has_alert ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#4338ca]'}`}>
                                    {selectedRack.fill_percent}% TERISI
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[11px] font-black text-gray-500 tracking-wider">
                                        <span>STATUS KETERISIAN</span>
                                        <span className="text-[#1a202c]">{selectedRack.current_qty} / {selectedRack.capacity} Unit</span>
                                    </div>
                                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-700 ${selectedRack.has_alert ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-[#4338ca]'}`}
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
                                        <div className="text-[18px] font-black text-[#1a202c]">{Math.max(0, selectedRack.capacity - selectedRack.current_qty)} Unit</div>
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
                                                Rak ini memiliki tingkat pemanfaatan di atas 90%. Disarankan untuk segera melakukan audit atau pengaturan ulang sisa barang.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <button 
                                    disabled
                                    className="w-full py-4 bg-[#1a202c] hover:bg-[#2d3748] text-white rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all shadow-lg shadow-black/10 active:scale-[0.98]"
                                >
                                    Lihat Detail Inventaris
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
