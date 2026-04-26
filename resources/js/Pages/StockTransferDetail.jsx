import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import React from 'react';

const BackIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const TransferIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h11m0 0l-4-4m4 4l-4 4M17 17H6m0 0l4 4m-4-4l4-4" />
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

export default function StockTransferDetail({ transfer, can_approve = false }) {
    const { auth } = usePage().props;
    const currentUserId = Number(auth?.user?.id);
    const canApproveThis = can_approve && transfer.status === 'pending' && Number(transfer.created_by) !== currentUserId;
    return (
        <DashboardLayout contentClassName="max-w-[1120px] mx-auto">
            <Head title={`Transfer ${transfer.number}`} />

            <div className="pb-12 pt-2">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('rack.allocation')}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#dbe4f0] bg-white text-slate-500 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition hover:border-[#28106F] hover:text-[#28106F]"
                        >
                            <BackIcon className="h-5 w-5" />
                        </Link>
                        <div>
                            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">Dokumen Transfer</p>
                            <h1 className="text-2xl font-black tracking-tight text-[#28106F]">{transfer.number}</h1>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {canApproveThis && (
                            <>
                                <button
                                    onClick={() => router.post(route('rack.allocation.transfers.approve', transfer.id))}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-[12px] font-black text-white transition hover:bg-emerald-700"
                                >
                                    Setujui & Pindah
                                </button>
                                <button
                                    onClick={() => router.post(route('rack.allocation.transfers.reject', transfer.id))}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-[12px] font-black text-white transition hover:bg-rose-700"
                                >
                                    Tolak
                                </button>
                            </>
                        )}
                        <a
                            href={route('rack.allocation.transfers.pdf', transfer.id)}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#28106F] px-4 text-[12px] font-black text-white transition hover:bg-[#3730a3]"
                        >
                            <DownloadIcon className="h-4 w-4" />
                            PDF
                        </a>
                        <span className={`inline-flex w-fit items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-black uppercase tracking-[0.14em] ${
                            transfer.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                            transfer.status === 'rejected' ? 'bg-rose-50 text-rose-700' :
                            'bg-emerald-50 text-emerald-700'
                        }`}>
                            <TransferIcon className="h-4 w-4" />
                            {transfer.status === 'pending' ? 'Menunggu' : transfer.status === 'rejected' ? 'Ditolak' : 'Selesai'}
                        </span>
                    </div>
                </div>

                <div className="overflow-hidden rounded-[24px] border border-[#EDE8FC] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
                    <header className="border-b border-[#EDE8FC] px-7 py-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl bg-[#f8f9fb] px-5 py-4">
                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Tanggal</div>
                                <div className="mt-1 text-[20px] font-black text-[#28106F]">{transfer.date_label}</div>
                            </div>
                            <div className="rounded-xl bg-[#f8f9fb] px-5 py-4">
                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Total Quantity</div>
                                <div className="mt-1 text-[20px] font-black text-[#28106F]">{formatNumber(transfer.total_quantity)} unit</div>
                            </div>
                            <div className="rounded-xl bg-[#f8f9fb] px-5 py-4">
                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Operator</div>
                                <div className="mt-1 text-[20px] font-black text-[#28106F]">{transfer.operator?.name || 'System'}</div>
                            </div>
                        </div>
                    </header>

                    <main className="grid gap-7 px-7 py-7 lg:grid-cols-[1fr_0.85fr]">
                        <section>
                            <h2 className="mb-4 text-[13px] font-black uppercase tracking-[0.14em] text-[#28106F]">Item Transfer</h2>
                            <div className="overflow-hidden rounded-xl border border-[#EDE8FC]">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#f8f9fb] text-[11px] uppercase tracking-[0.12em] text-gray-400">
                                        <tr>
                                            <th className="px-4 py-3 font-black">Produk</th>
                                            <th className="px-4 py-3 font-black">SKU</th>
                                            <th className="px-4 py-3 font-black">Rack Asal</th>
                                            <th className="px-4 py-3 font-black">Rack Tujuan</th>
                                            <th className="px-4 py-3 text-right font-black">Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#EDE8FC]">
                                        {transfer.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-4 font-bold text-[#28106F]">{item.name}</td>
                                                <td className="px-4 py-4 font-mono font-semibold text-gray-600">{item.sku}</td>
                                                <td className="px-4 py-4 font-semibold text-gray-600">{item.from_rack || '-'}</td>
                                                <td className="px-4 py-4 font-semibold text-[#0f766e]">{item.to_rack || '-'}</td>
                                                <td className="px-4 py-4 text-right font-black text-[#28106F]">{formatNumber(item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <aside>
                            <h2 className="mb-4 text-[13px] font-black uppercase tracking-[0.14em] text-[#28106F]">Rincian Operasional</h2>
                            <dl className="rounded-xl border border-[#EDE8FC] px-5">
                                <DetailRow label="Warehouse Asal" value={transfer.from_warehouse?.name} />
                                <DetailRow label="Warehouse Tujuan" value={transfer.to_warehouse?.name} />
                                <DetailRow label="Lokasi" value={transfer.from_warehouse?.location || transfer.to_warehouse?.location} />
                                <DetailRow label="Email Operator" value={transfer.operator?.email} />
                                <DetailRow label="Catatan" value={transfer.notes} />
                            </dl>
                        </aside>
                    </main>
                </div>
            </div>
        </DashboardLayout>
    );
}
