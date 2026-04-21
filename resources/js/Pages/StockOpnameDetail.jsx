import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
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
    <div className="grid grid-cols-1 gap-1 border-b border-[#edf2f7] py-3 last:border-b-0 sm:grid-cols-[160px_1fr]">
        <dt className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">{label}</dt>
        <dd className="text-[14px] font-bold text-[#1a202c]">{value || '-'}</dd>
    </div>
);

export default function StockOpnameDetail({ opname, adjustment }) {
    return (
        <DashboardLayout contentClassName="max-w-[1180px] mx-auto">
            <Head title={`Opname ${opname.number}`} />

            <div className="pb-12 pt-2">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('stock-opname.index')}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#dbe4f0] bg-white text-slate-500 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition hover:border-[#4338ca] hover:text-[#4338ca]"
                        >
                            <BackIcon className="h-5 w-5" />
                        </Link>
                        <div>
                            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">Dokumen Stock Opname</p>
                            <h1 className="text-2xl font-black tracking-tight text-[#1a202c]">{opname.number}</h1>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={route('stock-opname.pdf', opname.id)}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#4338ca] px-4 text-[12px] font-black text-white transition hover:bg-[#3730a3]"
                        >
                            <DownloadIcon className="h-4 w-4" />
                            PDF
                        </a>
                        <span className="inline-flex w-fit rounded-xl bg-indigo-50 px-4 py-2 text-[12px] font-black uppercase tracking-[0.14em] text-indigo-700">
                            {opname.variance_count} variance
                        </span>
                    </div>
                </div>

                <div className="space-y-6">
                    <section className="overflow-hidden rounded-[24px] border border-[#edf2f7] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
                        <header className="border-b border-[#edf2f7] px-7 py-6">
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="rounded-xl bg-[#f8f9fb] px-5 py-4">
                                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Tanggal</div>
                                    <div className="mt-1 text-[20px] font-black text-[#1a202c]">{opname.date_label}</div>
                                </div>
                                <div className="rounded-xl bg-[#f8f9fb] px-5 py-4">
                                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">SKU Dihitung</div>
                                    <div className="mt-1 text-[20px] font-black text-[#1a202c]">{opname.items_count}</div>
                                </div>
                                <div className="rounded-xl bg-[#f8f9fb] px-5 py-4">
                                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Total Selisih</div>
                                    <div className="mt-1 text-[20px] font-black text-[#1a202c]">{formatNumber(opname.total_variance)}</div>
                                </div>
                                <div className="rounded-xl bg-[#f8f9fb] px-5 py-4">
                                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Operator</div>
                                    <div className="mt-1 text-[20px] font-black text-[#1a202c]">{opname.operator?.name || 'System'}</div>
                                </div>
                            </div>
                        </header>

                        <main className="grid gap-7 px-7 py-7 lg:grid-cols-[1fr_0.82fr]">
                            <section>
                                <h2 className="mb-4 text-[13px] font-black uppercase tracking-[0.14em] text-[#1a202c]">Hasil Hitung Fisik</h2>
                                <div className="overflow-hidden rounded-xl border border-[#edf2f7]">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[#f8f9fb] text-[11px] uppercase tracking-[0.12em] text-gray-400">
                                            <tr>
                                                <th className="px-4 py-3 font-black">Produk</th>
                                                <th className="px-4 py-3 text-right font-black">Sistem</th>
                                                <th className="px-4 py-3 text-right font-black">Fisik</th>
                                                <th className="px-4 py-3 text-right font-black">Selisih</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#edf2f7]">
                                            {opname.items.map((item) => {
                                                const tone = item.difference > 0 ? 'text-emerald-600' : item.difference < 0 ? 'text-rose-600' : 'text-gray-400';
                                                return (
                                                    <tr key={item.id}>
                                                        <td className="px-4 py-4">
                                                            <div className="font-bold text-[#1a202c]">{item.name}</div>
                                                            <div className="font-mono text-[11px] font-semibold text-gray-400">{item.sku}</div>
                                                        </td>
                                                        <td className="px-4 py-4 text-right font-black text-gray-600">{formatNumber(item.system_stock)}</td>
                                                        <td className="px-4 py-4 text-right font-black text-gray-600">{formatNumber(item.physical_stock)}</td>
                                                        <td className={`px-4 py-4 text-right font-black ${tone}`}>{item.difference > 0 ? '+' : ''}{formatNumber(item.difference)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <aside>
                                <h2 className="mb-4 text-[13px] font-black uppercase tracking-[0.14em] text-[#1a202c]">Rincian Opname</h2>
                                <dl className="rounded-xl border border-[#edf2f7] px-5">
                                    <DetailRow label="Warehouse" value={opname.warehouse?.name} />
                                    <DetailRow label="Lokasi" value={opname.warehouse?.location} />
                                    <DetailRow label="Dibuat Oleh" value={opname.operator?.name} />
                                    <DetailRow label="Disetujui Oleh" value={opname.approver?.name} />
                                    <DetailRow label="Catatan" value={opname.notes} />
                                </dl>
                            </aside>
                        </main>
                    </section>

                    <section className="rounded-[24px] border border-[#edf2f7] bg-white p-7 shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
                        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-[18px] font-black text-[#1a202c]">Adjustment Otomatis</h2>
                                <p className="mt-1 text-[13px] font-semibold text-gray-500">Dokumen koreksi stok yang dibuat dari variance opname.</p>
                            </div>
                            {adjustment && (
                                <Link
                                    href={route('stock-adjustments.show', adjustment.id)}
                                    className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-[#4338ca] px-4 py-2 text-[12px] font-black text-white transition hover:bg-[#3730a3]"
                                >
                                    {adjustment.number}
                                    <ArrowIcon className="h-3.5 w-3.5" />
                                </Link>
                            )}
                        </div>

                        {!adjustment && (
                            <div className="rounded-xl bg-[#f8f9fb] px-5 py-4 text-[13px] font-bold text-gray-500">
                                Tidak ada adjustment karena tidak ada selisih stok.
                            </div>
                        )}

                        {adjustment && (
                            <div className="overflow-hidden rounded-xl border border-[#edf2f7]">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#f8f9fb] text-[11px] uppercase tracking-[0.12em] text-gray-400">
                                        <tr>
                                            <th className="px-4 py-3 font-black">Produk</th>
                                            <th className="px-4 py-3 font-black">Tipe</th>
                                            <th className="px-4 py-3 text-right font-black">Qty</th>
                                            <th className="px-4 py-3 font-black">Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#edf2f7]">
                                        {adjustment.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-4">
                                                    <div className="font-bold text-[#1a202c]">{item.name}</div>
                                                    <div className="font-mono text-[11px] font-semibold text-gray-400">{item.sku}</div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`rounded-md px-2 py-1 text-[10px] font-black uppercase ${item.adjustment_type === 'in' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                                        {item.adjustment_type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-right font-black text-[#4338ca]">{formatNumber(item.quantity)}</td>
                                                <td className="px-4 py-4 font-semibold text-gray-600">{item.note || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}
