import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React from 'react';

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID');
const formatMoney = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
const formatDate = (value, options = {}) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString('id-ID', { dateStyle: options.dateStyle || 'long', timeStyle: options.timeStyle || undefined });
};

const getStatusInfo = (transaction) => {
    const map = {
        in: { label: 'Barang Masuk', tone: 'text-indigo-700 bg-indigo-50 border-indigo-200', sign: '+' },
        out: { label: 'Barang Keluar', tone: 'text-rose-700 bg-rose-50 border-rose-200', sign: '-' },
        transfer: { label: 'Transfer Stok', tone: 'text-teal-700 bg-teal-50 border-teal-200', sign: '-' },
        adjustment: { label: 'Penyesuaian', tone: 'text-amber-700 bg-amber-50 border-amber-200', sign: transaction.stock_after >= transaction.stock_before ? '+' : '-' },
        opname: { label: 'Hitung Stok', tone: 'text-slate-700 bg-slate-50 border-slate-200', sign: transaction.stock_after >= transaction.stock_before ? '+' : '-' },
    };
    return map[transaction.movement_type] || { label: 'Selesai', tone: 'text-slate-700 bg-slate-50 border-slate-200', sign: '' };
};

export default function TransactionDetail({ transaction }) {
    const { props } = usePage();
    const roleName = String(props.auth?.user?.role_name || props.auth?.user?.role || '').toLowerCase();
    const isAuditor = roleName.includes('manager') || roleName.includes('manajer') || roleName.includes('supervisor') || roleName.includes('spv');
    const { post, processing } = useForm({});

    const handleVerify = () => {
        if (confirm('Verifikasi transaksi ini?')) post(route('transaction.verify', transaction.id));
    };

    const status = getStatusInfo(transaction);
    const trxNum = `TRX-${transaction.id.toString().padStart(6, '0')}`;
    const refNum = transaction.source_document?.number || (transaction.reference_id ? `REF-${transaction.reference_id.toString().padStart(5, '0')}` : trxNum);
    const unitPrice = Number(transaction.product?.purchase_price || 0);
    const totalValue = Number(transaction.quantity || 0) * unitPrice;

    return (
        <DashboardLayout>
            <Head title={`Detail Transaksi ${trxNum}`} />

            <div className="pb-12 pt-2 space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('transaction')} className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-[#4722B3] hover:text-[#4722B3] transition">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Detail Transaksi</p>
                            <h1 className="text-2xl font-black text-[#4722B3]">{trxNum}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {transaction.verification_status === 'pending' && isAuditor && (
                            <button onClick={handleVerify} disabled={processing} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-[12px] font-black text-white hover:bg-emerald-700 disabled:opacity-50">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                Verifikasi
                            </button>
                        )}
                        <a href={route('transaction.pdf', transaction.id)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#4722B3] px-4 text-[12px] font-black text-white hover:bg-[#3730a3]">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 3v12m0 0l-4-4m4 4l4-4M5 19h14" /></svg>
                            Export PDF
                        </a>
                    </div>
                </div>

                {/* Status + Verification Badge */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-[11px] font-black uppercase tracking-wider ${status.tone}`}>{status.label}</span>
                    <span className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-[11px] font-black uppercase tracking-wider ${transaction.verification_status === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {transaction.verification_status === 'verified' ? '✓ Terverifikasi' : '⏳ Belum Diverifikasi'}
                    </span>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-[#E5EAF3] bg-white p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Jumlah Mutasi</p>
                        <p className="mt-2 font-mono text-2xl font-black text-[#4722B3]">{status.sign}{formatNumber(transaction.quantity)}</p>
                        <p className="text-[11px] font-semibold text-gray-400 mt-1">unit</p>
                    </div>
                    <div className="rounded-xl border border-[#E5EAF3] bg-white p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Harga Satuan</p>
                        <p className="mt-2 text-2xl font-black text-slate-800">{formatMoney(unitPrice)}</p>
                        <p className="text-[11px] font-semibold text-gray-400 mt-1">per unit</p>
                    </div>
                    <div className="rounded-xl border border-[#E5EAF3] bg-white p-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Estimasi Nilai</p>
                        <p className="mt-2 text-2xl font-black text-[#4722B3]">{formatMoney(totalValue)}</p>
                        <p className="text-[11px] font-semibold text-gray-400 mt-1">total</p>
                    </div>
                </div>

                {/* Stock Movement Flow */}
                <div className="rounded-xl border border-[#E5EAF3] bg-white p-6">
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">Pergerakan Stok</h2>
                    <div className="grid grid-cols-3 gap-4 items-center">
                        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
                            <p className="text-[10px] font-bold uppercase text-gray-400">Stok Awal</p>
                            <p className="mt-1 font-mono text-2xl font-black text-slate-700">{formatNumber(transaction.stock_before)}</p>
                        </div>
                        <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4 text-center">
                            <p className="text-[10px] font-bold uppercase text-indigo-500">Mutasi</p>
                            <p className="mt-1 font-mono text-2xl font-black text-[#4722B3]">{status.sign}{formatNumber(transaction.quantity)}</p>
                        </div>
                        <div className="rounded-xl bg-[#4722B3] p-4 text-center shadow-lg">
                            <p className="text-[10px] font-bold uppercase text-indigo-200">Stok Akhir</p>
                            <p className="mt-1 font-mono text-2xl font-black text-white">{formatNumber(transaction.stock_after)}</p>
                        </div>
                    </div>
                </div>

                {/* Detail Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Informasi Barang */}
                    <div className="rounded-xl border border-[#E5EAF3] bg-white overflow-hidden">
                        <div className="px-5 py-3 bg-slate-50 border-b border-[#E5EAF3]">
                            <h2 className="text-[11px] font-black uppercase tracking-widest text-[#4722B3]">Informasi Barang</h2>
                        </div>
                        <div className="divide-y divide-[#E5EAF3]">
                            <div className="px-5 py-3 grid grid-cols-[120px_1fr] gap-2"><span className="text-[11px] font-bold text-gray-400 uppercase">Nama</span><span className="text-[13px] font-bold text-slate-800">{transaction.product?.name || '-'}</span></div>
                            <div className="px-5 py-3 grid grid-cols-[120px_1fr] gap-2"><span className="text-[11px] font-bold text-gray-400 uppercase">SKU</span><span className="text-[13px] font-mono font-bold text-slate-600">{transaction.product?.sku || '-'}</span></div>
                            <div className="px-5 py-3 grid grid-cols-[120px_1fr] gap-2"><span className="text-[11px] font-bold text-gray-400 uppercase">Harga Satuan</span><span className="text-[13px] font-bold text-slate-800">{formatMoney(unitPrice)}</span></div>
                            <div className="px-5 py-3 grid grid-cols-[120px_1fr] gap-2"><span className="text-[11px] font-bold text-gray-400 uppercase">Total Nilai</span><span className="text-[13px] font-black text-[#4722B3]">{formatMoney(totalValue)}</span></div>
                        </div>
                    </div>

                    {/* Data Operasional */}
                    <div className="rounded-xl border border-[#E5EAF3] bg-white overflow-hidden">
                        <div className="px-5 py-3 bg-slate-50 border-b border-[#E5EAF3]">
                            <h2 className="text-[11px] font-black uppercase tracking-widest text-[#4722B3]">Data Operasional</h2>
                        </div>
                        <div className="divide-y divide-[#E5EAF3]">
                            <div className="px-5 py-3 grid grid-cols-[120px_1fr] gap-2"><span className="text-[11px] font-bold text-gray-400 uppercase">Operator</span><span className="text-[13px] font-bold text-slate-800">{transaction.user?.name || 'Sistem Otomatis'}</span></div>
                            <div className="px-5 py-3 grid grid-cols-[120px_1fr] gap-2"><span className="text-[11px] font-bold text-gray-400 uppercase">Gudang</span><span className="text-[13px] font-bold text-slate-800">{transaction.warehouse?.name || '-'}</span></div>
                            <div className="px-5 py-3 grid grid-cols-[120px_1fr] gap-2"><span className="text-[11px] font-bold text-gray-400 uppercase">Lokasi</span><span className="text-[13px] font-bold text-slate-600">{transaction.warehouse?.location || '-'}</span></div>
                            <div className="px-5 py-3 grid grid-cols-[120px_1fr] gap-2"><span className="text-[11px] font-bold text-gray-400 uppercase">Tanggal</span><span className="text-[13px] font-bold text-slate-800">{formatDate(transaction.movement_date, { dateStyle: 'long', timeStyle: 'short' })}</span></div>
                            {transaction.verification_status === 'verified' && (
                                <>
                                    <div className="px-5 py-3 grid grid-cols-[120px_1fr] gap-2"><span className="text-[11px] font-bold text-gray-400 uppercase">Diverifikasi</span><span className="text-[13px] font-bold text-emerald-700">{transaction.verified_by_name}</span></div>
                                    <div className="px-5 py-3 grid grid-cols-[120px_1fr] gap-2"><span className="text-[11px] font-bold text-gray-400 uppercase">Waktu</span><span className="text-[13px] font-bold text-slate-600">{formatDate(transaction.verified_at, { dateStyle: 'medium', timeStyle: 'short' })}</span></div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Referensi */}
                    <div className="rounded-xl border border-[#E5EAF3] bg-white overflow-hidden">
                        <div className="px-5 py-3 bg-slate-50 border-b border-[#E5EAF3]">
                            <h2 className="text-[11px] font-black uppercase tracking-widest text-[#4722B3]">Referensi Dokumen</h2>
                        </div>
                        <div className="divide-y divide-[#E5EAF3]">
                            <div className="px-5 py-3 grid grid-cols-[120px_1fr] gap-2"><span className="text-[11px] font-bold text-gray-400 uppercase">No. Dokumen</span><span className="text-[13px] font-mono font-bold text-[#4722B3]">{trxNum}</span></div>
                            <div className="px-5 py-3 grid grid-cols-[120px_1fr] gap-2"><span className="text-[11px] font-bold text-gray-400 uppercase">Tipe</span><span className="text-[13px] font-bold text-slate-800">{{ stock_adjustment: 'Penyesuaian Stok', goods_receipt: 'Penerimaan Barang', stock_out: 'Stok Keluar', stock_transfer: 'Transfer Stok', stock_opname: 'Cek Stok Fisik', purchase_order: 'Pesanan Pembelian' }[transaction.reference_type] || transaction.reference_type || 'Manual'}</span></div>
                            <div className="px-5 py-3 grid grid-cols-[120px_1fr] gap-2"><span className="text-[11px] font-bold text-gray-400 uppercase">No. Referensi</span><span className="text-[13px] font-mono font-bold text-slate-600">{refNum}</span></div>
                            {transaction.source_document && (
                                <div className="px-5 py-3 grid grid-cols-[120px_1fr] gap-2">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase">Sumber</span>
                                    <Link href={transaction.source_document.url} className="text-[13px] font-black text-[#4722B3] hover:underline">{transaction.source_document.label} — {transaction.source_document.number}</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Catatan */}
                    <div className="rounded-xl border border-[#E5EAF3] bg-white overflow-hidden">
                        <div className="px-5 py-3 bg-slate-50 border-b border-[#E5EAF3]">
                            <h2 className="text-[11px] font-black uppercase tracking-widest text-[#4722B3]">Catatan</h2>
                        </div>
                        <div className="px-5 py-4">
                            <p className="text-[13px] font-medium leading-relaxed text-slate-700">{transaction.notes || 'Tidak ada catatan tambahan.'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
