import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import { 
    CheckCircle2, 
    ArrowRight, 
    Rocket, 
    PartyPopper, 
    Tags, 
    Ruler, 
    MapPin, 
    LayoutGrid, 
    Package,
    Lightbulb,
    ChevronRight,
    Circle
} from 'lucide-react';

const steps = [
    { 
        key: 'has_categories', 
        title: 'Buat Kategori Barang', 
        color: '#8B5CF6', 
        href: '/settings?active=categories', 
        icon: <Tags className="w-5 h-5" />, 
        instructions: ['Buka menu Pengaturan, pilih tab Kategori', 'Klik tombol "Tambah" di pojok kanan atas', 'Ketik nama kategori seperti Elektronik, Makanan, dll', 'Klik Simpan untuk menyimpan kategori baru'], 
        tip: 'Buat minimal 2-3 kategori umum dulu. Bisa ditambah kapan saja sesuai kebutuhan operasional.' 
    },
    { 
        key: 'has_units', 
        title: 'Buat Satuan Ukuran', 
        color: '#3B82F6', 
        href: '/settings?active=units', 
        icon: <Ruler className="w-5 h-5" />, 
        instructions: ['Buka menu Pengaturan, pilih tab Satuan', 'Klik tombol "Tambah" di pojok kanan atas', 'Isi nama lengkap (Kilogram) dan simbol singkat (kg)', 'Klik Simpan untuk menyimpan satuan baru'], 
        tip: 'Satuan yang umum dipakai: pcs, kg, box, liter, meter, roll, lembar.' 
    },
    { 
        key: 'has_zones', 
        title: 'Buat Zona Gudang', 
        color: '#10B981', 
        href: '/warehouse', 
        icon: <MapPin className="w-5 h-5" />, 
        instructions: ['Buka menu Layout Gudang dari sidebar', 'Klik tombol "Tambah Zona" di halaman gudang', 'Beri nama zona sesuai area fisik (Zona A, Zona Dingin)', 'Klik Simpan untuk membuat zona baru'], 
        tip: 'Pisahkan zona berdasarkan jenis barang, suhu, atau area fisik gudang kamu.' 
    },
    { 
        key: 'has_racks', 
        title: 'Buat Rak Penyimpanan', 
        color: '#F59E0B', 
        href: '/warehouse', 
        icon: <LayoutGrid className="w-5 h-5" />, 
        instructions: ['Pilih zona yang sudah kamu buat tadi', 'Klik tombol "Tambah Rak" di dalam zona', 'Isi kode rak (A-01, A-02) dan kapasitas unit', 'Klik Simpan untuk membuat rak baru'], 
        tip: 'Gunakan kode rak yang mudah diingat dan konsisten. Sesuaikan kapasitas dengan ukuran rak fisik.' 
    },
    { 
        key: 'has_products', 
        title: 'Tambah Barang Pertama', 
        color: '#EF4444', 
        href: '/inventory/create', 
        icon: <Package className="w-5 h-5" />, 
        instructions: ['Buka menu Daftar Barang dari sidebar', 'Klik tombol "Tambah Produk" di pojok kanan', 'Isi nama barang, SKU, pilih kategori dan satuan', 'Klik Simpan untuk menambahkan ke inventaris'], 
        tip: 'SKU harus unik per produk. Gunakan format yang konsisten seperti ELK-001, MKN-001.' 
    },
];

export default function PanduanSetup({ setup }) {
    const [active, setActive] = useState(() => { 
        const i = steps.findIndex(s => !setup[s.key]); 
        return i >= 0 ? i : 0; 
    });
    
    const doneCount = steps.filter(s => setup[s.key]).length;
    const current = steps[active];
    const progress = (doneCount / steps.length) * 100;

    // View: All steps completed
    if (doneCount === steps.length) {
        return (
            <DashboardLayout contentClassName="!max-w-none !p-0 !m-0" hideMainScrollbar>
                <Head title="Setup Selesai" />
                <div className="h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center bg-[#F8FAFC] relative overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]" />
                    
                    <div className="relative z-10 text-center animate-in fade-in zoom-in duration-700">
                        <div className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-200">
                            <PartyPopper className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 mb-4">Luar Biasa! Gudang Siap</h1>
                        <p className="text-gray-500 text-lg max-w-md mx-auto mb-10 font-medium">
                            Semua konfigurasi dasar telah selesai. Sekarang Anda bisa mulai mengelola stok dengan lebih efisien.
                        </p>
                        <Link 
                            href="/dashboard" 
                            className="inline-flex items-center gap-3 px-10 py-5 bg-[#5B33CC] text-white font-black rounded-2xl text-lg hover:bg-[#4722B3] transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-200"
                        >
                            Masuk ke Dashboard <ArrowRight className="w-6 h-6" />
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout contentClassName="!max-w-none !p-0 !m-0" hideMainScrollbar>
            <Head title="Panduan Setup" />
            <div className="h-[calc(100vh-64px)] grid grid-cols-[350px_1fr] bg-white overflow-hidden">
                
                {/* --- SIDEBAR PANEL --- */}
                <div className="bg-slate-50 border-r border-slate-200 flex flex-col h-full overflow-hidden">
                    {/* Header Sidebar */}
                    <div className="p-8 pb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                                <Rocket className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900">Mulai Cepat</h1>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Konfigurasi Awal</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-black text-slate-700">{doneCount} / {steps.length} Selesai</span>
                                <span className="text-sm font-bold text-indigo-600">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out" 
                                    style={{ width: `${progress}%` }} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Step List */}
                    <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2 scrollbar-hide">
                        {steps.map((step, i) => {
                            const isDone = setup[step.key];
                            const isActive = i === active;
                            
                            return (
                                <button 
                                    key={step.key} 
                                    onClick={() => setActive(i)} 
                                    className={`
                                        w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group
                                        ${isActive ? 'bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-200 scale-[1.02]' : 'hover:bg-slate-100'}
                                    `}
                                >
                                    <div className={`
                                        w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                                        ${isDone ? 'bg-emerald-100 text-emerald-600' : isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-200 text-slate-500'}
                                    `}>
                                        {isDone ? <CheckCircle2 className="w-6 h-6" /> : step.icon}
                                    </div>
                                    
                                    <div className="flex-1 text-left">
                                        <p className={`text-[15px] font-black ${isDone ? 'text-slate-400 line-through' : isActive ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                            {step.title}
                                        </p>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase">Langkah {i + 1}</p>
                                    </div>

                                    {isActive && !isDone && <ChevronRight className="w-5 h-5 text-indigo-600" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Skip Button */}
                    <div className="p-6 border-t border-slate-200">
                        <Link href="/dashboard" className="flex items-center justify-center gap-2 w-full py-3 text-sm font-black text-slate-400 hover:text-indigo-600 transition-colors">
                            Lewati ke Dashboard <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* --- CONTENT PANEL --- */}
                <div className="flex flex-col h-full overflow-hidden relative">
                    {/* Header Content */}
                    <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-current" style={{ backgroundColor: current.color }}>
                                {React.cloneElement(current.icon, { className: "w-8 h-8" })}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-slate-100 text-slate-500">Step {active + 1}</span>
                                    {setup[current.key] && (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-emerald-100 text-emerald-600 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Selesai
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-3xl font-black text-slate-900">{current.title}</h2>
                            </div>
                        </div>

                        {!setup[current.key] ? (
                            <Link 
                                href={`${current.href}${current.href.includes('?') ? '&' : '?'}from=panduan-setup`} 
                                className="group flex items-center gap-3 px-8 py-4 text-white font-black rounded-2xl text-lg shadow-2xl transition-all hover:scale-105 active:scale-95" 
                                style={{ backgroundColor: current.color, boxShadow: `0 20px 40px -12px ${current.color}40` }}
                            >
                                Mulai Sekarang <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-100 text-slate-400 font-black text-lg cursor-not-allowed">
                                Sudah Diselesaikan
                            </button>
                        )}
                    </div>

                    {/* Main Layout Content */}
                    <div className="flex-1 grid grid-cols-2 overflow-hidden">
                        
                        {/* Instructions Column */}
                        <div className="p-10 flex flex-col h-full border-r border-slate-50 overflow-y-auto scrollbar-hide">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Instruksi Langkah Demi Langkah</h3>
                            
                            <div className="space-y-8 flex-1">
                                {current.instructions.map((inst, i) => (
                                    <div key={i} className="flex items-start gap-5 group">
                                        <div className="relative flex flex-col items-center">
                                            <div 
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white z-10 transition-transform group-hover:scale-110" 
                                                style={{ backgroundColor: current.color }}
                                            >
                                                {i + 1}
                                            </div>
                                            {i !== current.instructions.length - 1 && (
                                                <div className="w-0.5 h-12 bg-slate-100 absolute top-10" />
                                            )}
                                        </div>
                                        <div className="pt-2">
                                            <p className="text-[17px] font-bold text-slate-700 leading-snug">{inst}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Tips Card */}
                            <div className="mt-10 p-6 rounded-3xl bg-amber-50 border border-amber-100 flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    <Lightbulb className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-amber-900 mb-1">Pro Tip!</p>
                                    <p className="text-sm font-bold text-amber-700/80 leading-relaxed">{current.tip}</p>
                                </div>
                            </div>
                        </div>

                        {/* Visual Preview Column */}
                        <div className="bg-slate-50/50 p-10 flex flex-col items-center justify-center overflow-hidden">
                            <div className="w-full max-w-lg aspect-[4/3] bg-white rounded-[2rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden flex flex-col">
                                {/* Browser Chrome */}
                                <div className="h-12 bg-slate-50 border-b border-slate-100 flex items-center px-6 gap-2">
                                    <div className="flex gap-1.5">
                                        <Circle className="w-3 h-3 fill-rose-400 text-rose-400" />
                                        <Circle className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        <Circle className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                                    </div>
                                    <div className="ml-4 h-6 bg-slate-200/50 rounded-lg w-1/2" />
                                </div>

                                {/* Mockup Content */}
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="space-y-2">
                                            <div className="h-6 bg-slate-200 rounded-md w-32" />
                                            <div className="h-3 bg-slate-100 rounded-md w-48" />
                                        </div>
                                        <div className="relative">
                                            <div 
                                                className="px-6 py-3 rounded-xl text-xs font-black text-white shadow-xl animate-bounce" 
                                                style={{ backgroundColor: current.color }}
                                            >
                                                {current.instructions[1]?.replace('Klik tombol ', '').replace('Klik ', '').replace(/"/g, '')}
                                            </div>
                                            <svg className="absolute -bottom-6 -right-2 w-8 h-8 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Table Simulation */}
                                    <div className="space-y-3">
                                        <div className="h-10 bg-slate-50 rounded-xl border border-slate-100" />
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-12 bg-white rounded-xl border border-slate-100 flex items-center px-4 gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50" />
                                                <div className="h-3 bg-slate-100 rounded w-full" />
                                                <div className="h-3 bg-slate-100 rounded w-20" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="mt-8 text-xs font-black text-slate-400 uppercase tracking-widest italic">Visualisasi Antarmuka</p>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}