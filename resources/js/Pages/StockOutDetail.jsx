import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

const BackIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const DownloadIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" />
    </svg>
);

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID');
const formatMoney = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

const statusLabel = (status) => {
    switch (String(status || '').toLowerCase()) {
        case 'completed':
        case 'complete':
        case 'done':
            return 'Selesai';
        case 'pending':
            return 'Menunggu';
        case 'cancelled':
        case 'canceled':
            return 'Dibatalkan';
        default:
            return status || 'Selesai';
    }
};

const purposeLabel = (purpose) => {
    switch (String(purpose || '').toLowerCase()) {
        case 'delivery':
            return 'Pengiriman barang';
        case 'sales':
        case 'sale':
            return 'Penjualan';
        case 'return':
            return 'Retur';
        case 'damage':
        case 'damaged':
            return 'Barang rusak';
        default:
            return purpose || 'Pengeluaran barang';
    }
};

const DetailRow = ({ label, value }) => (
    <div className="grid grid-cols-1 gap-1 border-b border-[#EDE8FC] py-3 last:border-b-0 sm:grid-cols-[160px_1fr]">
        <dt className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">{label}</dt>
        <dd className="text-[14px] font-bold text-[#28106F]">{value || '-'}</dd>
    </div>
);

export default function StockOutDetail({ stockOut }) {
    return (
        <DashboardLayout contentClassName="w-full max-w-none">
            <Head title={`Barang Keluar ${stockOut.number}`} />

            <div className="pb-12 pt-2">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('transaction')}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#dbe4f0] bg-white text-slate-500 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition hover:border-[#28106F] hover:text-[#28106F]"
                        >
                            <BackIcon className="h-5 w-5" />
                        </Link>
                        <div>
                            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">Dokumen Barang Keluar</p>
                            <h1 className="text-2xl font-black tracking-tight text-[#28106F]">{stockOut.number}</h1>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            href={route('stock-outs.pdf', stockOut.id)}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#28106F] px-4 text-[12px] font-black text-white transition hover:bg-[#3730a3]"
                        >
                            <DownloadIcon className="h-4 w-4" />
                            Unduh PDF
                        </a>
                        <span className="inline-flex w-fit rounded-xl bg-rose-50 px-4 py-2 text-[12px] font-black uppercase tracking-[0.14em] text-rose-700">
                            {statusLabel(stockOut.status)}
                        </span>
                    </div>
                </div>

                <article className="w-full">
                    <header className="border-b border-[#EDE8FC] pb-6">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="rounded-xl bg-[#f8f9fb] px-5 py-4">
                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Tanggal Keluar</div>
                                <div className="mt-1 text-[20px] font-black text-[#28106F]">{stockOut.date_label}</div>
                            </div>
                            <div className="rounded-xl bg-[#f8f9fb] px-5 py-4">
                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Total Jumlah</div>
                                <div className="mt-1 text-[20px] font-black text-[#28106F]">{formatNumber(stockOut.total_quantity)}</div>
                            </div>
                            <div className="rounded-xl bg-[#f8f9fb] px-5 py-4">
                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Total Nilai</div>
                                <div className="mt-1 text-[20px] font-black text-[#28106F]">{formatMoney(stockOut.total_amount)}</div>
                            </div>
                            <div className="rounded-xl bg-[#f8f9fb] px-5 py-4">
                                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">Operator</div>
                                <div className="mt-1 text-[20px] font-black text-[#28106F]">{stockOut.operator?.name || 'System'}</div>
                            </div>
                        </div>
                    </header>

                    <main className="grid gap-7 py-7 lg:grid-cols-[1fr_0.85fr]">
                        <section>
                            <h2 className="mb-4 text-[13px] font-black uppercase tracking-[0.14em] text-[#28106F]">Item Keluar</h2>
                            <div className="overflow-hidden rounded-xl border border-[#EDE8FC]">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#f8f9fb] text-[11px] uppercase tracking-[0.12em] text-gray-400">
                                        <tr>
                                            <th className="px-4 py-3 font-black">Produk</th>
                                            <th className="px-4 py-3 font-black">Rack Asal</th>
                                            <th className="px-4 py-3 font-black">Batch</th>
                                            <th className="px-4 py-3 font-black">Exp. Date</th>
                                            <th className="px-4 py-3 text-right font-black">Jumlah</th>
                                            <th className="px-4 py-3 text-right font-black">Harga</th>
                                            <th className="px-4 py-3 text-right font-black">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#EDE8FC]">
                                        {stockOut.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-4">
                                                    <div className="font-bold text-[#28106F]">{item.name}</div>
                                                    <div className="font-mono text-[11px] font-semibold text-gray-400">{item.sku}</div>
                                                </td>
                                                <td className="px-4 py-4 font-bold text-[#0f766e]">{item.rack_code || '-'}</td>
                                                <td className="px-4 py-4 font-semibold text-indigo-600">{item.batch_number || '-'}</td>
                                                <td className="px-4 py-4 font-semibold text-rose-600">{item.expired_date || '-'}</td>
                                                <td className="px-4 py-4 text-right font-black text-[#28106F]">{formatNumber(item.quantity)}</td>
                                                <td className="px-4 py-4 text-right font-semibold text-gray-600">{formatMoney(item.unit_price)}</td>
                                                <td className="px-4 py-4 text-right font-black text-[#28106F]">{formatMoney(item.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <aside>
                            <h2 className="mb-4 text-[13px] font-black uppercase tracking-[0.14em] text-[#28106F]">Rincian Pengeluaran</h2>
                            <dl className="rounded-xl border border-[#EDE8FC] px-5">
                                <DetailRow label="Tujuan" value={stockOut.customer?.name} />
                                <DetailRow label="Kode Pelanggan" value={stockOut.customer?.code} />
                                <DetailRow label="Gudang" value={stockOut.warehouse?.name} />
                                <DetailRow label="Lokasi" value={stockOut.warehouse?.location} />
                                <DetailRow label="Keperluan" value={purposeLabel(stockOut.purpose)} />
                                <DetailRow label="Email Operator" value={stockOut.operator?.email} />
                                <DetailRow label="Catatan" value={stockOut.notes} />
                            </dl>
                        </aside>
                    </main>
                </article>
            </div>
        </DashboardLayout>
    );
}
