import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React from 'react';

const InboundIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
);

const OutboundIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const AdjustmentIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
);

const TransferIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
);

const BackIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const DownloadIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 3v12m0 0l-4-4m4 4l4-4M5 19h14" />
    </svg>
);

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID');
const formatMoney = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

const formatDate = (value, options = {}) => {
    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return '-';
    }

    return parsedDate.toLocaleString('id-ID', {
        dateStyle: options.dateStyle || 'long',
        timeStyle: options.timeStyle || undefined,
    });
};

const DetailRow = ({ label, value, mono = false }) => (
    <div className="grid grid-cols-1 gap-1 border-b border-[#edf2f7] py-3 last:border-b-0 sm:grid-cols-[190px_1fr] sm:gap-5">
        <dt className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</dt>
        <dd className={`text-[14px] font-semibold text-[#1a202c] ${mono ? 'font-mono tracking-wide' : ''}`}>{value || '-'}</dd>
    </div>
);

const SectionTitle = ({ children }) => (
    <h2 className="mb-4 flex items-center gap-3 text-[13px] font-black uppercase tracking-[0.14em] text-[#1a202c]">
        <span className="h-5 w-1 rounded-full bg-[#4338ca]" />
        {children}
    </h2>
);

export default function TransactionDetail({ transaction }) {
    const { props } = usePage();
    const roleName = String(props.auth?.user?.role_name || props.auth?.user?.role || '').toLowerCase();
    const isAuditor = roleName.includes('manager') || roleName.includes('manajer') || roleName.includes('supervisor') || roleName.includes('spv');
    
    const { post, processing } = useForm({
        notes: ''
    });

    const handleVerify = () => {
        if (confirm('Verifikasi transaksi ini? Tindakan ini akan mencatat nama Anda sebagai pemeriksa resmi.')) {
            post(route('transaction.verify', transaction.id));
        }
    };

    const getStatusInfo = (tx) => {
        switch (tx.movement_type) {
            case 'in':
                return { label: 'Barang Masuk', tone: 'text-[#4338ca] bg-[#eef2ff] border-[#c7d2fe]', icon: <InboundIcon className="h-5 w-5" />, sign: '+' };
            case 'out':
                return { label: 'Barang Keluar', tone: 'text-[#ef4444] bg-[#fef2f2] border-[#fecaca]', icon: <OutboundIcon className="h-5 w-5" />, sign: '-' };
            case 'transfer':
                return { label: 'Transfer Stok', tone: 'text-[#0f766e] bg-[#ecfeff] border-[#a5f3fc]', icon: <TransferIcon className="h-5 w-5" />, sign: '-' };
            case 'adjustment':
                return { label: 'Penyesuaian', tone: 'text-[#9a3412] bg-[#fff7ed] border-[#fed7aa]', icon: <AdjustmentIcon className="h-5 w-5" />, sign: transaction.stock_after >= transaction.stock_before ? '+' : '-' };
            case 'opname':
                return { label: 'Stock Opname', tone: 'text-[#475569] bg-[#f8fafc] border-[#e2e8f0]', icon: <AdjustmentIcon className="h-5 w-5" />, sign: transaction.stock_after >= transaction.stock_before ? '+' : '-' };
            default:
                return { label: 'Selesai', tone: 'text-[#475569] bg-[#f8fafc] border-[#e2e8f0]', icon: <InboundIcon className="h-5 w-5" />, sign: '' };
        }
    };

    const status = getStatusInfo(transaction);
    const transactionNumber = `TRX-${transaction.id.toString().padStart(6, '0')}`;
    const referenceNumber = transaction.source_document?.number || (transaction.reference_id
        ? `REF-${transaction.reference_id.toString().padStart(5, '0')}`
        : transactionNumber);
    const unitPrice = Number(transaction.product?.purchase_price || 0);
    const totalValue = Number(transaction.quantity || 0) * unitPrice;
    const generatedAt = formatDate(new Date(), { dateStyle: 'medium', timeStyle: 'short' });

    return (
        <DashboardLayout headerSearchPlaceholder="Cari transaksi lain..." contentClassName="max-w-[1180px] mx-auto">
            <Head title={`Detail Transaksi #${transaction.id.toString().padStart(6, '0')}`} />

            <div className="detail-page-root w-full pb-16 pt-2">
                <div className="action-bar mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('transaction')}
                            aria-label="Kembali ke riwayat transaksi"
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#dbe4f0] bg-white text-slate-500 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition hover:border-[#4338ca] hover:text-[#4338ca]"
                        >
                            <BackIcon className="h-5 w-5" />
                        </Link>
                        <div>
                            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">Detail Transaksi</p>
                            <h1 className="text-2xl font-black tracking-tight text-[#1a202c]">Voucher Mutasi Stok</h1>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {transaction.verification_status === 'pending' && isAuditor && (
                            <button
                                onClick={handleVerify}
                                disabled={processing}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-[13px] font-black text-white shadow-[0_10px_20px_rgba(16,185,129,0.18)] transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-50"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                Verifikasi Sekarang
                            </button>
                        )}
                        <a
                            href={route('transaction.pdf', transaction.id)}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#4338ca] px-5 text-[13px] font-black text-white shadow-[0_10px_20px_rgba(67,56,202,0.18)] transition hover:bg-[#3730a3] focus:outline-none focus:ring-2 focus:ring-[#c7d2fe] focus:ring-offset-2"
                        >
                            <DownloadIcon className="h-4 w-4" />
                            Export PDF
                        </a>
                    </div>
                </div>

                <article className="overflow-hidden rounded-[24px] border border-[#edf2f7] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
                    <header className="border-b border-[#edf2f7] bg-white px-6 py-6 sm:px-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#3632c0] text-white shadow-lg shadow-indigo-200/50">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.3 7L12 12l8.7-5M12 22V12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-black uppercase tracking-[0.18em] text-slate-500">Aether Logistix</p>
                                        <h2 className="text-xl font-black tracking-tight text-[#1a202c]">Bukti Transaksi Persediaan</h2>
                                    </div>
                                </div>
                                <p className="max-w-2xl text-sm font-medium leading-6 text-slate-600">
                                    Dokumen ini mencatat mutasi persediaan berdasarkan data transaksi yang tersimpan di sistem inventori pergudangan.
                                </p>
                            </div>

                            <div className="min-w-[260px] rounded-xl border border-[#edf2f7] bg-[#f8f9fc] p-4">
                                <div className="grid grid-cols-[92px_1fr] gap-y-2 text-sm">
                                    <span className="font-semibold text-slate-500">No. Dokumen</span>
                                    <span className="font-mono font-black text-[#1a202c]">{transactionNumber}</span>
                                    <span className="font-semibold text-slate-500">Tanggal</span>
                                    <span className="font-semibold text-[#1a202c]">{formatDate(transaction.movement_date, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                    <span className="font-semibold text-slate-500">Referensi</span>
                                    <span className="font-mono font-semibold text-[#1a202c]">{referenceNumber}</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="space-y-7 px-6 py-6 sm:px-8">
                        <section className="document-section grid gap-4 md:grid-cols-3">
                            <div className={`rounded-xl border px-5 py-4 ${status.tone}`}>
                                <div className="mb-3 flex items-center gap-2">
                                    {status.icon}
                                    <p className="text-[12px] font-black uppercase tracking-[0.12em]">Jenis Transaksi</p>
                                </div>
                                <p className="text-2xl font-black tracking-tight">{status.label}</p>
                            </div>
                            <div className="rounded-xl border border-[#edf2f7] bg-white px-5 py-4">
                                <p className="mb-2 text-[12px] font-black uppercase tracking-[0.12em] text-slate-500">Jumlah Mutasi</p>
                                <p className="font-mono text-3xl font-black tracking-tight text-[#1a202c]">
                                    {status.sign}{formatNumber(transaction.quantity)} <span className="font-sans text-sm font-black text-slate-500">PCS</span>
                                </p>
                            </div>
                            <div className="rounded-xl border border-[#edf2f7] bg-white px-5 py-4">
                                <p className="mb-2 text-[12px] font-black uppercase tracking-[0.12em] text-slate-500">Estimasi Nilai</p>
                                <p className="text-2xl font-black tracking-tight text-[#1a202c]">{formatMoney(totalValue)}</p>
                            </div>
                        </section>

                        <section className="document-section">
                            <SectionTitle>Rincian Barang</SectionTitle>
                            <div className="overflow-hidden rounded-xl border border-[#edf2f7]">
                                <table className="w-full border-collapse text-left text-sm">
                                    <thead className="bg-[#f8f9fc] text-[12px] uppercase tracking-[0.1em] text-slate-500">
                                        <tr>
                                            <th className="border-b border-[#edf2f7] px-4 py-3 font-black">Nama Barang</th>
                                            <th className="border-b border-[#edf2f7] px-4 py-3 font-black">SKU</th>
                                            <th className="border-b border-[#edf2f7] px-4 py-3 text-right font-black">Harga Satuan</th>
                                            <th className="border-b border-[#edf2f7] px-4 py-3 text-right font-black">Total Nilai</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="align-top">
                                            <td className="px-4 py-4 font-bold text-[#1a202c]">{transaction.product?.name || 'Unidentified Item'}</td>
                                            <td className="px-4 py-4 font-mono font-semibold text-slate-700">{transaction.product?.sku || '-'}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-slate-700">{formatMoney(unitPrice)}</td>
                                            <td className="px-4 py-4 text-right font-black text-[#1a202c]">{formatMoney(totalValue)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="document-section">
                            <SectionTitle>Pergerakan Stok</SectionTitle>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded-xl border border-[#edf2f7] bg-[#f8f9fc] p-5">
                                    <p className="text-[12px] font-black uppercase tracking-[0.12em] text-slate-500">Stok Awal</p>
                                    <p className="mt-2 font-mono text-3xl font-black text-[#1a202c]">{formatNumber(transaction.stock_before)}</p>
                                </div>
                                <div className="rounded-xl border border-[#edf2f7] bg-white p-5">
                                    <p className="text-[12px] font-black uppercase tracking-[0.12em] text-slate-500">Mutasi</p>
                                    <p className="mt-2 font-mono text-3xl font-black text-[#4338ca]">{status.sign}{formatNumber(transaction.quantity)}</p>
                                </div>
                                <div className="rounded-xl border border-[#4338ca] bg-[#4338ca] p-5 text-white shadow-[0_10px_20px_rgba(67,56,202,0.18)]">
                                    <p className="text-[12px] font-black uppercase tracking-[0.12em] text-slate-300">Stok Akhir</p>
                                    <p className="mt-2 font-mono text-3xl font-black">{formatNumber(transaction.stock_after)}</p>
                                </div>
                            </div>
                        </section>

                        <section className="document-section grid gap-7 lg:grid-cols-2">
                            <div>
                                <SectionTitle>Data Operasional</SectionTitle>
                                <dl className="rounded-xl border border-[#edf2f7] px-5">
                                    <DetailRow label="Operator" value={transaction.user?.name || 'System Auto'} />
                                    <DetailRow label="Email Operator" value={transaction.user?.email || 'verified_system'} />
                                    <DetailRow label="Gudang" value={transaction.warehouse?.name || 'N/A'} />
                                    <DetailRow label="Lokasi Gudang" value={transaction.warehouse?.location || 'Belum ditentukan'} />
                                    {transaction.verification_status === 'verified' && (
                                        <>
                                            <DetailRow label="Diverifikasi Oleh" value={transaction.verified_by_name} />
                                            <DetailRow label="Waktu Verifikasi" value={formatDate(transaction.verified_at, { dateStyle: 'medium', timeStyle: 'short' })} />
                                        </>
                                    )}
                                </dl>
                            </div>

                            <div>
                                <SectionTitle>Referensi & Catatan</SectionTitle>
                                <dl className="rounded-xl border border-[#edf2f7] px-5">
                                    <DetailRow label="Tipe Referensi" value={transaction.reference_type || 'Manual Entry'} />
                                    <DetailRow label="Nomor Referensi" value={referenceNumber} mono />
                                    {transaction.source_document && (
                                        <div className="grid grid-cols-1 gap-1 border-b border-[#edf2f7] py-3 last:border-b-0 sm:grid-cols-[190px_1fr] sm:gap-5">
                                            <dt className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">Dokumen Sumber</dt>
                                            <dd>
                                                <Link href={transaction.source_document.url} className="text-[14px] font-black text-[#4338ca] hover:text-[#3730a3]">
                                                    {transaction.source_document.label} - {transaction.source_document.number}
                                                </Link>
                                            </dd>
                                        </div>
                                    )}
                                    <DetailRow label="Tanggal Transaksi" value={formatDate(transaction.movement_date, { dateStyle: 'full', timeStyle: 'short' })} />
                                    <DetailRow label="Catatan" value={transaction.notes || 'Tidak ada catatan tambahan.'} />
                                </dl>
                            </div>
                        </section>

                        <section className="document-section rounded-xl border border-[#edf2f7] bg-[#f8f9fc] p-5">
                            <p className="text-[12px] font-black uppercase tracking-[0.14em] text-slate-500">Pernyataan Dokumen</p>
                            <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                                Dokumen ini dibuat otomatis dari sistem dan digunakan sebagai bukti administrasi mutasi stok. Validasi akhir dapat dilakukan dengan mencocokkan nomor dokumen, referensi, operator, dan jumlah stok pada sistem.
                            </p>
                        </section>

                        <section className="document-section grid gap-5 pt-2 sm:grid-cols-3">
                            <div className="rounded-xl border border-[#edf2f7] p-5 text-center">
                                <p className="text-[12px] font-bold text-slate-500">Dibuat oleh</p>
                                <div className="h-16" />
                                <p className="border-t border-[#dbe4f0] pt-3 text-sm font-black text-[#1a202c]">{transaction.user?.name || 'System Auto'}</p>
                            </div>
                            <div className="rounded-xl border border-[#edf2f7] p-5 text-center">
                                <p className="text-[12px] font-bold text-slate-500">Diperiksa oleh</p>
                                <div className="h-16" />
                                <p className="border-t border-[#dbe4f0] pt-3 text-sm font-black text-[#1a202c]">Supervisor Gudang</p>
                            </div>
                            <div className="rounded-xl border border-[#edf2f7] p-5 text-center">
                                <p className="text-[12px] font-bold text-slate-500">Disetujui oleh</p>
                                <div className="h-16" />
                                <p className="border-t border-[#dbe4f0] pt-3 text-sm font-black text-[#1a202c]">Manager Gudang</p>
                            </div>
                        </section>
                    </main>

                    <footer className="flex flex-col gap-2 border-t border-[#edf2f7] bg-[#f8f9fc] px-6 py-4 text-[12px] font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                        <span>{transactionNumber} / {status.label} / {transaction.product?.sku || '-'}</span>
                        <span>Siap export pada {generatedAt}</span>
                    </footer>
                </article>
            </div>
        </DashboardLayout>
    );
}
