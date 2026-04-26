import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import React from 'react';

const BackIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const ArrowIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H8M17 7v9" />
    </svg>
);

const DownloadIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" />
    </svg>
);

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID');

const DetailRow = ({ label, value }) => (
    <div className="grid grid-cols-1 gap-1 border-b border-[#EDE8FC] py-3 last:border-b-0 sm:grid-cols-[160px_1fr]">
        <dt className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">{label}</dt>
        <dd className="text-[14px] font-bold text-[#28106F]">{value || '-'}</dd>
    </div>
);

export default function StockAdjustmentDetail({ adjustment }) {
    const { auth } = usePage().props;
    const canApproveThis = adjustment.can_approve && adjustment.status === 'pending' && Number(adjustment.operator?.id) !== Number(auth?.user?.id);

    return (
        <DashboardLayout contentClassName="max-w-[1180px] mx-auto">
            <Head title={`Adjustment ${adjustment.number}`} />

            <div className="pb-12 pt-2">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('wms-documents.index')}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#dbe4f0] bg-white text-slate-500 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition hover:border-[#28106F] hover:text-[#28106F]"
                        >
                            <BackIcon className="h-5 w-5" />
                        </Link>
                        <div>
                            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">Dokumen Stock Adjustment</p>
                            <h1 className="text-2xl font-black tracking-tight text-[#28106F]">{adjustment.number}</h1>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {canApproveThis && (
                            <>
                                <button
                                    onClick={() => router.post(route('stock-adjustments.approve', adjustment.id))}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-[12px] font-black text-white transition hover:bg-emerald-700"
                                >
                                    Setujui
                                </button>
                                <button
                                    onClick={() => router.post(route('stock-adjustments.reject', adjustment.id))}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-[12px] font-black text-white transition hover:bg-rose-700"
                                >
                                    Tolak
                                </button>
                            </>
                        )}
                        <a
                            href={route('stock-adjustments.pdf', adjustment.id)}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#28106F] px-4 text-[12px] font-black text-white transition hover:bg-[#3730a3]"
                        >
                            <DownloadIcon className="h-4 w-4" />
                            PDF
                        </a>
                        <span className={`inline-flex w-fit rounded-xl px-4 py-2 text-[12px] font-black uppercase tracking-[0.14em] ${
                            adjustment.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                            adjustment.status === 'rejected' ? 'bg-rose-50 text-rose-700' :
                            'bg-emerald-50 text-emerald-700'
                        }`}>
                            {adjustment.status === 'pending' ? 'Menunggu' : adjustment.status === 'rejected' ? 'Ditolak' : 'Selesai'}
                        </span>
                        <span className="inline-flex w-fit rounded-xl bg-indigo-50 px-4 py-2 text-[12px] font-black uppercase tracking-[0.14em] text-indigo-700">
                            {adjustment.reason || 'adjustment'}
                        </span>
                    </div>
                </div>

                <div className="space-y-6">
                    <section className="overflow-hidden rounded-[24px] border border-[#EDE8FC] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
                        <header className="border-b border-[#EDE8FC] px-7 py-6">
                            <div className="grid gap-4 md:grid-cols-5">
                                <div className="rounded-xl bg-[#f8f9fb] px-5 py-4">
                                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Tanggal</div>
                                    <div className="mt-1 text-[20px] font-black text-[#28106F]">{adjustment.date_label}</div>
                                </div>
                                <div className="rounded-xl bg-[#f8f9fb] px-5 py-4">
                                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">SKU Koreksi</div>
                                    <div className="mt-1 text-[20px] font-black text-[#28106F]">{formatNumber(adjustment.items_count)}</div>
                                </div>
                                <div className="rounded-xl bg-emerald-50 px-5 py-4">
                                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-500">Qty Masuk</div>
                                    <div className="mt-1 text-[20px] font-black text-emerald-700">{formatNumber(adjustment.in_quantity)}</div>
                                </div>
                                <div className="rounded-xl bg-rose-50 px-5 py-4">
                                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-500">Qty Keluar</div>
                                    <div className="mt-1 text-[20px] font-black text-rose-700">{formatNumber(adjustment.out_quantity)}</div>
                                </div>
                                <div className="rounded-xl bg-[#f8f9fb] px-5 py-4">
                                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Net</div>
                                    <div className={`mt-1 text-[20px] font-black ${adjustment.net_quantity >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        {adjustment.net_quantity > 0 ? '+' : ''}{formatNumber(adjustment.net_quantity)}
                                    </div>
                                </div>
                            </div>
                        </header>

                        <main className="grid gap-7 px-7 py-7 lg:grid-cols-[1fr_0.82fr]">
                            <section>
                                <h2 className="mb-4 text-[13px] font-black uppercase tracking-[0.14em] text-[#28106F]">Item Adjustment</h2>
                                <div className="overflow-hidden rounded-xl border border-[#EDE8FC]">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[#f8f9fb] text-[11px] uppercase tracking-[0.12em] text-gray-400">
                                            <tr>
                                                <th className="px-4 py-3 font-black">Produk</th>
                                                <th className="px-4 py-3 font-black">Tipe</th>
                                                <th className="px-4 py-3 text-right font-black">Qty</th>
                                                <th className="px-4 py-3 font-black">Catatan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#EDE8FC]">
                                            {adjustment.items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-4">
                                                        <div className="font-bold text-[#28106F]">{item.name}</div>
                                                        <div className="font-mono text-[11px] font-semibold text-gray-400">{item.sku}</div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className={`rounded-md px-2 py-1 text-[10px] font-black uppercase ${item.adjustment_type === 'in' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                                            {item.adjustment_type === 'in' ? 'Masuk' : 'Keluar'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-right font-black text-[#28106F]">{formatNumber(item.quantity)}</td>
                                                    <td className="px-4 py-4 font-semibold text-gray-600">{item.note || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <aside>
                                <h2 className="mb-4 text-[13px] font-black uppercase tracking-[0.14em] text-[#28106F]">Rincian Adjustment</h2>
                                <dl className="rounded-xl border border-[#EDE8FC] px-5">
                                    <DetailRow label="Warehouse" value={adjustment.warehouse?.name} />
                                    <DetailRow label="Lokasi" value={adjustment.warehouse?.location} />
                                    <DetailRow label="Operator" value={adjustment.operator?.name} />
                                    <DetailRow label="Email Operator" value={adjustment.operator?.email} />
                                    <DetailRow label="Alasan" value={adjustment.reason} />
                                    <DetailRow label="Catatan" value={adjustment.notes} />
                                </dl>

                                {adjustment.stock_opname && (
                                    <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-4">
                                        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-indigo-500">Dokumen Sumber</p>
                                        <div className="mt-2 flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-black text-indigo-950">{adjustment.stock_opname.number}</p>
                                                <p className="mt-0.5 text-xs font-bold text-indigo-500">{adjustment.stock_opname.date_label}</p>
                                            </div>
                                            <Link
                                                href={adjustment.stock_opname.url}
                                                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 text-xs font-black text-white transition hover:bg-indigo-700"
                                            >
                                                Opname
                                                <ArrowIcon className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </aside>
                        </main>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}
