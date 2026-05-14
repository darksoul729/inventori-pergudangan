import DashboardLayout from '@/Layouts/DashboardLayout';
import CustomDropdown from '@/Components/CustomDropdown';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { BarChart3, Clock3, CheckCircle2, AlertTriangle, ArrowLeft, Send, X, Calendar, Star, TrendingUp } from 'lucide-react';

export default function SupplierDetail({ supplier }) {
    // Convert 1-indexed month to string name
    const getMonthName = (monthNumber) => {
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return months[monthNumber - 1] || '';
    };

    const [isEditOpen, setIsEditOpen] = useState(false);
    const { auth } = usePage().props;
    const roleName = String(auth?.user?.role_name || auth?.user?.role || '').toLowerCase();
    const isManager = roleName.includes('manager') || roleName.includes('manajer') || roleName.includes('admin gudang');
    const isSupervisor = roleName.includes('supervisor') || roleName.includes('spv');
    const canAssessSupplier = isManager || isSupervisor;
    const performances = supplier.performances || [];
    const latestScore = performances[0]?.performance_score ?? 0;
    const avgLead = performances.length > 0
        ? (performances.reduce((sum, item) => sum + Number(item.avg_lead_time_days || 0), 0) / performances.length).toFixed(1)
        : 0;
    const onTimeRate = performances.length > 0
        ? Math.round(
            performances.reduce((sum, item) => sum + Number(item.on_time_deliveries || 0), 0)
            / Math.max(1, performances.reduce((sum, item) => sum + Number(item.total_orders || 0), 0))
            * 100
        )
        : 0;
    
    const chartPoints = React.useMemo(() => {
        const ordered = [...performances].reverse();
        if (ordered.length === 0) return [];
        const w = 1000;
        const h = 220;
        const leftPad = 36;
        const rightPad = 20;
        const topPad = 16;
        const bottomPad = 24;
        const usableW = w - leftPad - rightPad;
        const usableH = h - topPad - bottomPad;
        const count = ordered.length;

        return ordered.map((perf, index) => {
            const score = Number(perf.performance_score || 0);
            const x = leftPad + (count === 1 ? usableW / 2 : (index * usableW) / (count - 1));
            const y = topPad + ((100 - Math.max(0, Math.min(100, score))) / 100) * usableH;
            return {
                id: perf.id,
                score,
                label: `${getMonthName(perf.period_month).slice(0, 3)} ${perf.period_year}`,
                x,
                y,
            };
        });
    }, [performances]);
    const linePath = chartPoints
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ');

    const { data, setData, post, processing, errors, reset } = useForm({
        period_month: new Date().getMonth() + 1,
        period_year: new Date().getFullYear(),
        total_orders: 0,
        on_time_deliveries: 0,
        late_deliveries: 0,
        avg_lead_time_days: 0,
        manual_adjustment: 0,
    });

    const draftAutoScore = React.useMemo(() => {
        const totalOrders = Number(data.total_orders || 0);
        const onTime = Number(data.on_time_deliveries || 0);
        const lead = Number(data.avg_lead_time_days || 0);
        const onTimeRate = totalOrders > 0 ? (onTime / totalOrders) * 100 : 0;
        const leadScore = Math.max(0, Math.min(100, 100 - (lead * 4)));
        return Number(((onTimeRate * 0.7) + (leadScore * 0.3)).toFixed(2));
    }, [data.total_orders, data.on_time_deliveries, data.avg_lead_time_days]);

    const draftFinalScore = React.useMemo(() => {
        const manual = Number(data.manual_adjustment || 0);
        return Math.max(0, Math.min(100, Number((draftAutoScore + manual).toFixed(2))));
    }, [draftAutoScore, data.manual_adjustment]);

    const submitPerformance = (e) => {
        e.preventDefault();
        post(route('supplier.performance.store', supplier.id), {
            onSuccess: () => {
                setIsEditOpen(false);
                reset();
            }
        });
    };

    return (
        <DashboardLayout headerSearchPlaceholder="Cari riwayat performa...">
            <Head title={`${supplier.name} - Performa`} />

            <div className="flex flex-col space-y-6 pb-12 w-full pt-2">
                <div className="flex items-center space-x-4 mb-4">
                    <Link href={route('supplier')} className="p-2.5 border border-[#E5EAF3] rounded-xl hover:bg-gray-50 text-gray-400 transition-all hover:text-[#5B33CC]">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-[28px] font-black text-[#4722B3] tracking-tight">{supplier.name} <span className="text-gray-400 text-lg ml-2">[{supplier.code}]</span></h1>
                        <p className="text-[14px] font-bold text-gray-500 mt-1">{supplier.category} • {supplier.contact_person} • {supplier.email}</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="bg-white rounded-[20px] p-5 border border-[#E5EAF3] shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest">Skor Terakhir</span>
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <BarChart3 className="w-4 h-4 text-[#5B33CC]" />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-[#4722B3]">{latestScore}</div>
                    </div>
                    <div className="bg-white rounded-[20px] p-5 border border-[#E5EAF3] shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest">Rata-rata Pengiriman</span>
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                <Clock3 className="w-4 h-4 text-amber-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-amber-600">{avgLead} hari</div>
                    </div>
                    <div className="bg-white rounded-[20px] p-5 border border-[#E5EAF3] shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest">Ketepatan Kirim</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-emerald-600">{onTimeRate}%</div>
                    </div>
                    <div className="bg-white rounded-[20px] p-5 border border-[#E5EAF3] shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest">Periode Dinilai</span>
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-slate-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-slate-700">{performances.length}</div>
                    </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E5EAF3]">
                    <div className="flex items-center space-x-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-[#5B33CC]" />
                        <h2 className="text-[18px] font-black text-[#4722B3]">Grafik Skor Performa</h2>
                    </div>
                    {performances.length > 0 ? (
                        <div className="rounded-2xl border border-[#E5EAF3] bg-[#fafbff] p-6">
                            <svg viewBox="0 0 1000 220" className="w-full h-[240px]">
                                {[0, 25, 50, 75, 100].map((value) => {
                                    const y = 16 + ((100 - value) / 100) * (220 - 16 - 24);
                                    return (
                                        <g key={value}>
                                            <line x1="36" y1={y} x2="980" y2={y} stroke="#e5eaf3" strokeDasharray="4 6" />
                                            <text x="8" y={y + 4} fontSize="10" fill="#94a3b8" fontWeight="600">{value}</text>
                                        </g>
                                    );
                                })}

                                {linePath && (
                                    <>
                                        <path d={linePath} fill="none" stroke="#5B33CC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                        {chartPoints.map((point) => (
                                            <g key={point.id}>
                                                <circle cx={point.x} cy={point.y} r="6" fill="#ffffff" stroke="#5B33CC" strokeWidth="4" />
                                                <text x={point.x} y={point.y - 15} textAnchor="middle" fontSize="12" fill="#4722B3" fontWeight="900">
                                                    {point.score}
                                                </text>
                                                <text x={point.x} y="215" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">
                                                    {point.label}
                                                </text>
                                            </g>
                                        ))}
                                    </>
                                )}
                            </svg>
                        </div>
                    ) : (
                        <div className="py-12 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <BarChart3 className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-[14px] font-bold text-gray-400">Belum ada data performa untuk ditampilkan.</p>
                        </div>
                    )}
                </div>

                {/* History Table */}
                <div className="bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E5EAF3]">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center space-x-2">
                            <Clock3 className="w-5 h-5 text-[#5B33CC]" />
                            <h2 className="text-[18px] font-black text-[#4722B3]">Riwayat Performa</h2>
                        </div>
                        {canAssessSupplier && (
                            <button onClick={() => setIsEditOpen(true)} className="flex items-center space-x-2 px-6 py-3 bg-[#5B33CC] shadow-lg shadow-indigo-100 hover:bg-indigo-700 text-white font-black rounded-xl text-[13px] transition-all active:scale-95">
                                <Star className="w-4 h-4 mr-1" />
                                <span>Input Penilaian</span>
                            </button>
                        )}
                    </div>

                    <div className="w-full overflow-x-auto">
                        <div className="min-w-[800px]">
                            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-[#E5EAF3] text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">
                                <div className="col-span-2 pl-2">Periode</div>
                                <div className="col-span-2">Skor Akhir</div>
                                <div className="col-span-2">Skor Auto</div>
                                <div className="col-span-1">Adj</div>
                                <div className="col-span-2">Waktu Tunggu</div>
                                <div className="col-span-1">Total</div>
                                <div className="col-span-1">On Time</div>
                                <div className="col-span-1 text-right pr-2">Late</div>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {supplier.performances && supplier.performances.length > 0 ? (
                                    supplier.performances.map((perf) => (
                                        <div key={perf.id} className="grid grid-cols-12 gap-4 py-5 items-center hover:bg-gray-50/50 transition-colors">
                                            <div className="col-span-2 pl-2">
                                                <div className="text-[13px] font-black text-[#4722B3]">{getMonthName(perf.period_month)} {perf.period_year}</div>
                                            </div>
                                            <div className="col-span-2">
                                                <span className={`px-3 py-1 rounded-lg text-[12px] font-black ${perf.performance_score >= 80 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : (perf.performance_score >= 70 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-red-50 text-red-600 border border-red-100')}`}>
                                                    {perf.performance_score} / 100
                                                </span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-[13px] font-black text-indigo-500">{perf.auto_score ?? perf.performance_score}</span>
                                            </div>
                                            <div className="col-span-1">
                                                <span className={`text-[12px] font-black ${(Number(perf.manual_adjustment || 0) >= 0) ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {Number(perf.manual_adjustment || 0) > 0 ? '+' : ''}{Number(perf.manual_adjustment || 0)}
                                                </span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-[13px] font-black text-[#4722B3]">{perf.avg_lead_time_days} Hari</span>
                                            </div>
                                            <div className="col-span-1">
                                                <span className="text-[13px] font-bold text-gray-500">{perf.total_orders}</span>
                                            </div>
                                            <div className="col-span-1">
                                                <span className="text-[13px] font-bold text-emerald-600">{perf.on_time_deliveries}</span>
                                            </div>
                                            <div className="col-span-1 text-right pr-2">
                                                <span className="text-[13px] font-bold text-red-500">{perf.late_deliveries}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-[14px] font-bold text-gray-300">
                                        Belum ada riwayat performa.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Input Performance */}
            <Transition appear show={canAssessSupplier && isEditOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[12000]" onClose={() => setIsEditOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-[32px] bg-white p-8 text-left align-middle shadow-2xl transition-all border border-gray-100">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                                <BarChart3 className="w-6 h-6 text-[#5B33CC]" />
                                            </div>
                                            <div>
                                                <Dialog.Title as="h3" className="text-xl font-black text-[#4722B3]">
                                                    Nilai Performa Pemasok
                                                </Dialog.Title>
                                                <p className="text-[12px] text-gray-400 font-bold mt-0.5">Sistem Hybrid Score • Penilaian Cepat</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setIsEditOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                            <X className="w-5 h-5 text-gray-400" />
                                        </button>
                                    </div>

                                    <form onSubmit={submitPerformance} className="space-y-6">
                                        {/* Periode */}
                                        <div className="bg-[#fafbff] rounded-[24px] p-5 border border-[#E5EAF3] grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2">Bulan Penilaian</label>
                                                <CustomDropdown
                                                    value={data.period_month}
                                                    onChange={(value) => setData('period_month', value)}
                                                    options={[...Array(12)].map((_, i) => ({ value: i + 1, label: getMonthName(i + 1) }))}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2">Tahun</label>
                                                <input 
                                                    required type="number" min="2000" 
                                                    value={data.period_year} 
                                                    onChange={e => setData('period_year', e.target.value)} 
                                                    className="w-full rounded-xl border-[#E5EAF3] bg-white text-sm font-bold focus:ring-[#5B33CC] focus:border-[#5B33CC]" 
                                                />
                                            </div>
                                        </div>

                                        {/* Pengiriman */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Send className="w-4 h-4 text-indigo-400" />
                                                <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em]">Data Pengiriman</h4>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Total Kirim</label>
                                                    <input required type="number" min="0" value={data.total_orders} onChange={e => setData('total_orders', e.target.value)} className="w-full rounded-xl border-[#E5EAF3] text-sm font-black focus:ring-[#5B33CC]" />
                                                    <p className="text-[9px] text-gray-400 mt-1.5 font-bold">Total pesanan</p>
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-emerald-600 mb-1.5">Tepat Waktu</label>
                                                    <input required type="number" min="0" value={data.on_time_deliveries} onChange={e => setData('on_time_deliveries', e.target.value)} className="w-full rounded-xl border-emerald-100 bg-emerald-50/20 text-sm font-black text-emerald-700" />
                                                    <p className="text-[9px] text-gray-400 mt-1.5 font-bold">Sesuai jadwal</p>
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-red-500 mb-1.5">Terlambat</label>
                                                    <input required type="number" min="0" value={data.late_deliveries} onChange={e => setData('late_deliveries', e.target.value)} className="w-full rounded-xl border-red-100 bg-red-50/20 text-sm font-black text-red-700" />
                                                    <p className="text-[9px] text-gray-400 mt-1.5 font-bold">Lewat batas</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Waktu & Adjustment */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Lama Kirim (Rata-rata)</label>
                                                <div className="relative">
                                                    <input required type="number" step="0.1" min="0" value={data.avg_lead_time_days} onChange={e => setData('avg_lead_time_days', e.target.value)} className="w-full rounded-xl border-[#E5EAF3] text-sm font-black pr-12 focus:ring-[#5B33CC]" />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase">Hari</span>
                                                </div>
                                                <p className="text-[9px] text-gray-400 mt-1.5 font-bold italic">Berdasarkan data operasional</p>
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-[#5B33CC] mb-1.5">Bonus / Penalti Nilai</label>
                                                <div className="relative">
                                                    <input required type="number" step="0.1" min="-10" max="10" value={data.manual_adjustment} onChange={e => setData('manual_adjustment', e.target.value)} className="w-full rounded-xl border-indigo-100 bg-indigo-50/20 text-sm font-black text-[#5B33CC] pr-12 focus:ring-[#5B33CC]" />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-300 uppercase">Poin</span>
                                                </div>
                                                <p className="text-[9px] text-gray-400 mt-1.5 font-bold italic">Maksimum +/- 10 poin</p>
                                            </div>
                                        </div>

                                        {/* Result Card - Light Theme Version */}
                                        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#5B33CC] to-[#4722B3] p-7 text-white shadow-xl shadow-indigo-100">
                                            <div className="relative z-10 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-1.5">Prediksi Skor Akhir</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-5xl font-black">{draftFinalScore}</span>
                                                        <span className="text-indigo-300 font-bold text-sm">/ 100</span>
                                                    </div>
                                                </div>
                                                <div className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-tight flex items-center gap-2 border ${
                                                    draftFinalScore >= 80 ? 'bg-white/20 border-white/30 text-white' :
                                                    draftFinalScore >= 60 ? 'bg-amber-400/20 border-amber-400/30 text-amber-200' :
                                                    'bg-red-400/20 border-red-400/30 text-red-200'
                                                }`}>
                                                    <Star className="w-3.5 h-3.5 fill-current" />
                                                    {draftFinalScore >= 80 ? 'Sangat Memuaskan' :
                                                     draftFinalScore >= 60 ? 'Kinerja Cukup' :
                                                     'Perlu Perbaikan'}
                                                </div>
                                            </div>
                                            {/* Decorative element */}
                                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                                        </div>

                                        <div className="flex gap-4 pt-2">
                                            <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 px-6 py-4 rounded-2xl border border-[#E5EAF3] text-gray-500 font-black text-[13px] hover:bg-gray-50 transition-all">Batal</button>
                                            <button type="submit" disabled={processing} className="flex-[2] px-6 py-4 rounded-2xl bg-[#5B33CC] text-white font-black text-[13px] hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]">
                                                {processing ? 'Sedang Menyimpan...' : 'Simpan & Publikasikan'}
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </DashboardLayout>
    );
}
