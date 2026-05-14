import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Tags, Ruler, MapPin, LayoutGrid, Package, ChevronRight, CheckCircle2, X } from 'lucide-react';

const steps = [
    { key: 'has_categories', icon: Tags, title: 'Buat Kategori', desc: 'Kelompokkan barang agar mudah dikelola.', href: '/settings?active=categories', btn: 'Buat Kategori' },
    { key: 'has_units', icon: Ruler, title: 'Buat Satuan', desc: 'Tentukan satuan barang (pcs, kg, box, dll).', href: '/settings?active=units', btn: 'Buat Satuan' },
    { key: 'has_zones', icon: MapPin, title: 'Buat Zona Gudang', desc: 'Bagi gudang jadi beberapa zona penyimpanan.', href: '/warehouse', btn: 'Atur Zona' },
    { key: 'has_racks', icon: LayoutGrid, title: 'Buat Rak', desc: 'Tambah rak di dalam zona untuk menyimpan barang.', href: '/warehouse', btn: 'Atur Rak' },
    { key: 'has_products', icon: Package, title: 'Tambah Barang', desc: 'Mulai input barang pertama ke inventaris.', href: '/inventory', btn: 'Tambah Barang' },
];

export default function OnboardingTutorial({ setup, onDismiss }) {
    const [activeStep, setActiveStep] = useState(() => {
        const idx = steps.findIndex(s => !setup[s.key]);
        return idx >= 0 ? idx : 0;
    });

    const completedCount = steps.filter(s => setup[s.key]).length;
    const allDone = completedCount === steps.length;

    const current = steps[activeStep];
    const Icon = current.icon;

    return (
        <div className="fixed inset-0 z-[998] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onDismiss}></div>
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl mx-4 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-[#4722B3] to-[#5B33CC] text-white flex items-center justify-between">
                    <div>
                        <h2 className="text-[16px] font-black">{allDone ? 'Setup Selesai!' : 'Setup Gudang Kamu'}</h2>
                        <p className="text-[11px] font-semibold text-indigo-200 mt-0.5">{completedCount} dari {steps.length} langkah selesai</p>
                    </div>
                    <button onClick={onDismiss} className="p-1.5 hover:bg-white/20 rounded-lg transition"><X className="w-5 h-5" /></button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 pt-4">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#5B33CC] rounded-full transition-all" style={{ width: `${(completedCount / steps.length) * 100}%` }}></div>
                    </div>
                </div>

                {/* Steps */}
                <div className="px-6 py-4 space-y-2">
                    {steps.map((step, i) => {
                        const done = setup[step.key];
                        const StepIcon = step.icon;
                        const isActive = i === activeStep;
                        return (
                            <button
                                key={step.key}
                                onClick={() => !done && setActiveStep(i)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${isActive && !done ? 'bg-violet-50 border border-violet-200' : 'hover:bg-gray-50'} ${done ? 'opacity-60' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-100' : isActive ? 'bg-[#5B33CC] text-white' : 'bg-gray-100'}`}>
                                    {done ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <StepIcon className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`text-[13px] font-bold ${done ? 'line-through text-gray-400' : 'text-slate-800'}`}>{step.title}</div>
                                    {isActive && !done && <div className="text-[11px] text-gray-500 mt-0.5">{step.desc}</div>}
                                </div>
                                {!done && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                            </button>
                        );
                    })}
                </div>

                {/* Action */}
                <div className="px-6 pb-5 flex gap-3">
                    {allDone ? (
                        <button onClick={onDismiss} className="flex-1 px-4 py-2.5 bg-[#5B33CC] text-white font-bold rounded-xl text-[13px] hover:bg-indigo-700">Mulai Bekerja</button>
                    ) : (
                        <>
                            <button onClick={onDismiss} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl text-[13px] hover:bg-gray-50">Nanti Saja</button>
                            <Link href={current.href} className="flex-1 px-4 py-2.5 bg-[#5B33CC] text-white font-bold rounded-xl text-[13px] text-center hover:bg-indigo-700">
                                {current.btn}
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
