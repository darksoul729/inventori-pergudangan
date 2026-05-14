import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { 
    LayoutDashboard, 
    Boxes, 
    Truck, 
    Receipt, 
    FileText, 
    ArrowRight, 
    ArrowLeft,
    CheckCircle2, 
    Info, 
    ShieldCheck, 
    Users, 
    ChevronRight,
    BookOpen
} from 'lucide-react';

export default function GettingStarted() {
    const { props } = usePage();
    const roleName = String(props.auth?.user?.role_name || props.auth?.user?.role || '').toLowerCase();
    const isManager = roleName.includes('manager') || roleName.includes('manajer') || roleName.includes('admin gudang');
    const isSupervisor = roleName.includes('supervisor') || roleName.includes('spv');

    const steps = [
        { 
            id: 1,
            title: 'Cek Dasbor', 
            desc: 'Lihat ringkasan operasional, peringatan stok menipis, pengiriman terlambat, dan tagihan belum lunas.', 
            href: '/dashboard',
            icon: LayoutDashboard,
        },
        { 
            id: 2,
            title: 'Cek Barang & Stok', 
            desc: 'Pastikan data barang masuk dan keluar sudah benar, serta pantau pergerakan inventaris harian.', 
            href: '/inventory',
            icon: Boxes,
        },
        { 
            id: 3,
            title: 'Proses Pengiriman', 
            desc: 'Pantau pengiriman aktif, tugaskan driver, dan update status pengiriman bila ada kendala di jalan.', 
            href: '/shipments',
            icon: Truck,
        },
        { 
            id: 4,
            title: 'Cek Tagihan', 
            desc: 'Tindak lanjuti tagihan pelanggan atau supplier yang belum lunas untuk menjaga arus kas tetap sehat.', 
            href: '/tagihan',
            icon: Receipt,
        },
        { 
            id: 5,
            title: 'Buka Laporan', 
            desc: 'Lihat ringkasan akhir kinerja gudang untuk keperluan evaluasi harian, mingguan, atau bulanan.', 
            href: '/reports',
            icon: FileText,
        },
    ];
    
    const [activeStep, setActiveStep] = useState(0);
    const activeItem = useMemo(() => steps[activeStep] || steps[0], [activeStep, steps]);

    const roleTips = isManager
        ? [
            { icon: ShieldCheck, text: 'Fokus pada keputusan akhir, approval, dan evaluasi harian dari keseluruhan proses.' },
            { icon: Info, text: 'Gunakan mode lanjutan hanya saat ada perubahan struktur gudang berskala besar.' },
        ]
        : isSupervisor
            ? [
                { icon: Users, text: 'Fokus pada validasi operasional harian tim dan eskalasi kendala ke manager.' },
                { icon: CheckCircle2, text: 'Pastikan status pengiriman, stok fisik, dan mutasi barang sudah tersinkronisasi.' },
            ]
            : [
                { icon: CheckCircle2, text: 'Fokus pada input data harian, ketepatan pencatatan, dan pembaruan status tepat waktu.' },
                { icon: Info, text: 'Segera laporkan apabila ditemukan selisih stok fisik atau keterlambatan ke supervisor.' },
            ];

    return (
        <DashboardLayout headerTitle="Panduan Mulai" contentClassName="w-full max-w-none">
            <Head title="Panduan Mulai" />

            <div className="mx-auto max-w-6xl space-y-6 pb-16 pt-2">
                
                {/* Clean Header Box */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">
                                Panduan Memulai Sistem
                            </h1>
                            <p className="mt-1 text-sm font-medium text-slate-500">
                                Ikuti langkah-langkah di bawah ini untuk memahami alur kerja standar operasional Petayu WMS.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Column: List of Steps */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">Alur Operasional</h2>
                            <span className="rounded bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                                {steps.length} Langkah
                            </span>
                        </div>

                        <div className="space-y-3">
                            {steps.map((step, idx) => {
                                const isActive = idx === activeStep;
                                const isPast = idx < activeStep;
                                const StepIcon = step.icon;
                                
                                return (
                                    <button
                                        key={step.id}
                                        onClick={() => setActiveStep(idx)}
                                        className={`w-full text-left flex items-start gap-4 rounded-xl p-4 transition-all duration-200 ${
                                            isActive 
                                                ? 'bg-violet-50 border-2 border-violet-600 shadow-sm' 
                                                : 'bg-white border border-slate-200 shadow-sm hover:border-violet-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg ${
                                            isActive 
                                                ? 'bg-violet-600 text-white' 
                                                : isPast
                                                    ? 'bg-slate-800 text-white'
                                                    : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            <StepIcon className="h-5 w-5" />
                                        </div>

                                        <div className="flex-1 pt-0.5">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                                    isActive ? 'text-violet-700' : 'text-slate-400'
                                                }`}>
                                                    Langkah {idx + 1}
                                                </span>
                                                {isPast && !isActive && (
                                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                )}
                                            </div>
                                            <h3 className={`text-sm font-bold ${
                                                isActive ? 'text-violet-900' : 'text-slate-800'
                                            }`}>
                                                {step.title}
                                            </h3>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Detail Content */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        
                        {/* Detail Card */}
                        <div className="flex flex-col rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                            {/* Card Header */}
                            <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 text-violet-700 shadow-sm">
                                        <activeItem.icon className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-800">
                                        {activeItem.title}
                                    </h2>
                                </div>
                                <span className="text-2xl font-black text-slate-200 select-none">
                                    0{activeStep + 1}
                                </span>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Detail Aktivitas</p>
                                    <p className="text-base font-medium leading-relaxed text-slate-700">
                                        {activeItem.desc}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                                            disabled={activeStep === 0}
                                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            <span className="hidden sm:inline">Sebelumnya</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                                            disabled={activeStep === steps.length - 1}
                                            className="flex items-center gap-1 rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span>Lanjut</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <Link
                                        href={activeItem.href}
                                        className="inline-flex items-center gap-2 rounded-lg bg-slate-100 border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                                    >
                                        <span>Buka Halaman</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Role Notes */}
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-200 text-emerald-800">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wide">
                                        Catatan Peran: <span className="capitalize">{roleName || 'Staff'}</span>
                                    </h3>
                                </div>
                            </div>
                            
                            <div className="grid gap-3 sm:grid-cols-2">
                                {roleTips.map((tip, i) => (
                                    <div key={i} className="flex gap-3 rounded-xl bg-white p-4 border border-emerald-100 shadow-sm">
                                        <tip.icon className="h-5 w-5 shrink-0 text-emerald-600" />
                                        <p className="text-sm font-medium leading-relaxed text-emerald-800">
                                            {tip.text}
                                        </p>
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

