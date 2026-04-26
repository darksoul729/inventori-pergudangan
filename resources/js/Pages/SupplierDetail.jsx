import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

const ArrowLeftIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

export default function SupplierDetail({ supplier }) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const { auth } = usePage().props;
    const roleName = String(auth?.user?.role_name || auth?.user?.role || '').toLowerCase();
    const isManager = roleName.includes('manager') || roleName.includes('manajer') || roleName.includes('admin gudang');
    const isSupervisor = roleName.includes('supervisor') || roleName.includes('spv');
    const canAssessSupplier = isManager || isSupervisor;

    // Convert 1-indexed month to string name
    const getMonthName = (monthNumber) => {
        const date = new Date();
        date.setMonth(monthNumber - 1);
        return date.toLocaleString('id-ID', { month: 'long' });
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        period_month: new Date().getMonth() + 1,
        period_year: new Date().getFullYear(),
        total_orders: 0,
        on_time_deliveries: 0,
        late_deliveries: 0,
        avg_lead_time_days: 0,
        performance_score: 0,
    });

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

            <div className="flex flex-col space-y-6 pb-12 w-full pt-2 min-w-[1000px] overflow-x-auto">
                <div className="flex items-center space-x-4 mb-4">
                    <Link href={route('supplier')} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-[28px] font-black text-[#28106F] tracking-tight">{supplier.name} <span className="text-gray-400 text-lg ml-2">[{supplier.code}]</span></h1>
                        <p className="text-[14px] font-bold text-gray-500 mt-1">{supplier.category} • {supplier.contact_person} • {supplier.email}</p>
                    </div>
                </div>

                <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC]">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-[18px] font-black text-[#28106F]">Riwayat Performa</h2>
                        {canAssessSupplier && (
                            <button onClick={() => setIsEditOpen(true)} className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 shadow-lg shadow-indigo-200 hover:bg-indigo-700 text-white font-bold rounded-xl text-[13px] transition-colors">
                                <span>Input Penilaian</span>
                            </button>
                        )}
                    </div>

                    <div className="w-full">
                        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-100 text-[10px] font-black text-gray-400 tracking-[0.1em] uppercase">
                            <div className="col-span-2 pl-2">Periode</div>
                            <div className="col-span-2">Skor</div>
                            <div className="col-span-2">Waktu Tunggu</div>
                            <div className="col-span-2">Total Pesanan</div>
                            <div className="col-span-2">Tepat Waktu</div>
                            <div className="col-span-2 text-right pr-4">Terlambat</div>
                        </div>

                        <div className="divide-y divide-gray-50/80">
                            {supplier.performances && supplier.performances.length > 0 ? (
                                supplier.performances.map((perf) => (
                                    <div key={perf.id} className="grid grid-cols-12 gap-4 py-5 items-center hover:bg-gray-50/50 transition-colors">
                                        <div className="col-span-2 flex items-center space-x-4 pl-2">
                                            <div className="text-[13px] font-black text-[#28106F]">{getMonthName(perf.period_month)} {perf.period_year}</div>
                                        </div>
                                        <div className="col-span-2 flex items-center space-x-3">
                                            <span className={`px-2.5 py-1 rounded-lg text-[12px] font-black ${perf.performance_score >= 80 ? 'bg-emerald-100 text-emerald-700' : (perf.performance_score >= 70 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')}`}>
                                                {perf.performance_score} / 100
                                            </span>
                                        </div>
                                        <div className="col-span-2 flex flex-col justify-center">
                                            <span className="text-[14px] font-black text-[#28106F]">{perf.avg_lead_time_days} Hari</span>
                                        </div>
                                        <div className="col-span-2 flex flex-col justify-center">
                                            <span className="text-[14px] font-black text-[#28106F]">{perf.total_orders} Pesanan</span>
                                        </div>
                                        <div className="col-span-2 flex flex-col justify-center">
                                            <span className="text-[14px] font-black text-emerald-600">{perf.on_time_deliveries} Pesanan</span>
                                        </div>
                                        <div className="col-span-2 flex justify-end pr-4">
                                            <span className="text-[14px] font-black text-red-500">{perf.late_deliveries} Pesanan</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-[13px] font-bold text-gray-400">
                                    Belum ada riwayat performa untuk pemasok ini.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Edit Performance */}
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
                        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" />
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
                                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-xl font-black text-gray-900 mb-2">
                                        Input Performa Pemasok
                                    </Dialog.Title>
                                    <p className="text-[13px] text-gray-500 mb-6 font-semibold">
                                        Rekam atau timpa log performa murni untuk melacak kesalahan atau transaksi luring.
                                    </p>

                                    <form onSubmit={submitPerformance} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-black tracking-wider text-gray-500 uppercase mb-1">Bulan (1-12)</label>
                                                <input required type="number" min="1" max="12" value={data.period_month} onChange={e => setData('period_month', e.target.value)} className="w-full rounded-xl bg-gray-50 border-gray-200 text-[14px] font-bold focus:ring-indigo-500 focus:border-indigo-500" />
                                                {errors.period_month && <p className="text-red-500 text-xs mt-1">{errors.period_month}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-black tracking-wider text-gray-500 uppercase mb-1">Tahun</label>
                                                <input required type="number" min="2000" value={data.period_year} onChange={e => setData('period_year', e.target.value)} className="w-full rounded-xl bg-gray-50 border-gray-200 text-[14px] font-bold focus:ring-indigo-500 focus:border-indigo-500" />
                                                {errors.period_year && <p className="text-red-500 text-xs mt-1">{errors.period_year}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-black tracking-wider text-gray-500 uppercase mb-1">Total Pesanan</label>
                                                <input required type="number" min="0" value={data.total_orders} onChange={e => setData('total_orders', e.target.value)} className="w-full rounded-xl bg-gray-50 border-gray-200 text-[14px] font-bold focus:ring-indigo-500 focus:border-indigo-500" />
                                                {errors.total_orders && <p className="text-red-500 text-xs mt-1">{errors.total_orders}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-black tracking-wider text-gray-500 uppercase mb-1">Tepat Waktu</label>
                                                <input required type="number" min="0" value={data.on_time_deliveries} onChange={e => setData('on_time_deliveries', e.target.value)} className="w-full rounded-xl bg-gray-50 border-gray-200 text-[14px] font-bold focus:ring-emerald-500 focus:border-emerald-500" />
                                                {errors.on_time_deliveries && <p className="text-red-500 text-xs mt-1">{errors.on_time_deliveries}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-black tracking-wider text-gray-500 uppercase mb-1">Terlambat</label>
                                                <input required type="number" min="0" value={data.late_deliveries} onChange={e => setData('late_deliveries', e.target.value)} className="w-full rounded-xl bg-gray-50 border-gray-200 text-[14px] font-bold focus:ring-red-500 focus:border-red-500" />
                                                {errors.late_deliveries && <p className="text-red-500 text-xs mt-1">{errors.late_deliveries}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-black tracking-wider text-gray-500 uppercase mb-1">Rata-rata Waktu Tunggu (Hari)</label>
                                                <input required type="number" step="0.1" min="0" value={data.avg_lead_time_days} onChange={e => setData('avg_lead_time_days', e.target.value)} className="w-full rounded-xl bg-gray-50 border-gray-200 text-[14px] font-bold focus:ring-indigo-500 focus:border-indigo-500" />
                                                {errors.avg_lead_time_days && <p className="text-red-500 text-xs mt-1">{errors.avg_lead_time_days}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-black tracking-wider text-gray-500 uppercase mb-1">Skor Performa (0-100)</label>
                                                <input required type="number" step="0.1" min="0" max="100" value={data.performance_score} onChange={e => setData('performance_score', e.target.value)} className="w-full rounded-xl bg-gray-50 border-gray-200 text-[14px] font-bold focus:ring-indigo-500 focus:border-indigo-500" />
                                                {errors.performance_score && <p className="text-red-500 text-xs mt-1">{errors.performance_score}</p>}
                                            </div>
                                        </div>

                                        <div className="mt-8 flex justify-end space-x-3">
                                            <button type="button" onClick={() => setIsEditOpen(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-[13px] hover:bg-gray-50">Batal</button>
                                            <button type="submit" disabled={processing} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-[13px] hover:bg-indigo-700 disabled:opacity-50 flex items-center shadow-lg shadow-indigo-200">
                                                {processing ? 'Menyimpan...' : 'Simpan Performa'}
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
