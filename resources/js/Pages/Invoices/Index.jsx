import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { ArrowRight, CircleAlert, Users, Lock } from 'lucide-react';

// Inline gate banner (matches system-wide pattern)
const SetupGate = ({ icon: Icon, color, title, description, href, linkLabel }) => (
    <div className="flex items-start gap-4 rounded-2xl border px-5 py-4 mb-5" style={{ backgroundColor: `${color}0D`, borderColor: `${color}30` }}>
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black" style={{ color }}>{title}</p>
            <p className="mt-0.5 text-[12px] font-semibold text-gray-500">{description}</p>
            <Link href={href} className="inline-flex items-center gap-1.5 mt-2 text-[12px] font-bold hover:underline" style={{ color }}>
                {linkLabel} <ArrowRight className="w-3 h-3" />
            </Link>
        </div>
        <CircleAlert className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color }} />
    </div>
);

const statusLabel = {
    belum_dibayar: 'Belum Dibayar',
    sebagian: 'Sebagian',
    lunas: 'Lunas',
};

const statusClass = {
    belum_dibayar: 'bg-rose-100 text-rose-700',
    sebagian: 'bg-amber-100 text-amber-700',
    lunas: 'bg-emerald-100 text-emerald-700',
};

export default function Index({ invoices = [], has_customers = true }) {
    const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount || 0);
    const formatDate = (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalTagihan = invoices.length;
    const totalNominal = invoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
    const belumDibayar = invoices.filter((inv) => inv.payment_status === 'belum_dibayar').length;
    const sebagian = invoices.filter((inv) => inv.payment_status === 'sebagian').length;
    const lunas = invoices.filter((inv) => inv.payment_status === 'lunas').length;
    const jatuhTempo = invoices.filter((inv) => {
        if (!inv.due_date || inv.payment_status === 'lunas') return false;
        const due = new Date(inv.due_date);
        due.setHours(0, 0, 0, 0);
        return due < today;
    }).length;

    return (
        <DashboardLayout headerSearchPlaceholder="Cari nomor tagihan atau pelanggan...">
            <Head title="Tagihan" />
            <div className="space-y-5 pb-10 pt-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[30px] font-black tracking-tight text-[#1f2a3d]">Tagihan Pelanggan</h1>
                        <p className="mt-1 text-sm font-semibold text-slate-500">Pantau pembayaran pelanggan dalam satu halaman yang ringkas.</p>
                    </div>
                    {has_customers ? (
                        <Link href={route('invoices.create')} className="rounded-xl bg-[#5B33CC] px-5 py-3 text-sm font-bold text-white">
                            Buat Tagihan
                        </Link>
                    ) : (
                        <div className="flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-400 cursor-not-allowed select-none">
                            <Lock className="w-4 h-4" />
                            Buat Tagihan
                        </div>
                    )}
                </div>

                {/* Setup gate warning */}
                {!has_customers && (
                    <SetupGate
                        icon={Users}
                        color="#0EA5E9"
                        title="Belum ada pelanggan terdaftar"
                        description="Tagihan tidak bisa dibuat tanpa data pelanggan. Tambahkan pelanggan di menu Pelanggan terlebih dahulu."
                        href="/customers"
                        linkLabel="Tambah Pelanggan Sekarang"
                    />
                )}

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                    <div className="rounded-2xl border border-[#E5EAF3] bg-white p-4">
                        <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Total Tagihan</p>
                        <p className="mt-2 text-[28px] font-black text-[#4722B3]">{totalTagihan}</p>
                    </div>
                    <div className="rounded-2xl border border-[#E5EAF3] bg-white p-4">
                        <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Total Nominal</p>
                        <p className="mt-2 text-[18px] font-black text-[#1f2a3d]">{formatCurrency(totalNominal)}</p>
                    </div>
                    <div className="rounded-2xl border border-[#E5EAF3] bg-white p-4">
                        <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Belum Dibayar</p>
                        <p className="mt-2 text-[28px] font-black text-rose-600">{belumDibayar}</p>
                    </div>
                    <div className="rounded-2xl border border-[#E5EAF3] bg-white p-4">
                        <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Sebagian</p>
                        <p className="mt-2 text-[28px] font-black text-amber-600">{sebagian}</p>
                    </div>
                    <div className="rounded-2xl border border-[#E5EAF3] bg-white p-4">
                        <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Jatuh Tempo</p>
                        <p className="mt-2 text-[28px] font-black text-red-600">{jatuhTempo}</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-[#E5EAF3] bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-[20px] font-black text-[#1f2a3d]">Daftar Tagihan</h2>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">Lunas: {lunas}</span>
                    </div>

                    <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px]">
                        <thead>
                            <tr className="border-b border-slate-100 text-left text-[11px] font-black uppercase tracking-wide text-slate-400">
                                <th className="py-3">Nomor Tagihan</th>
                                <th className="py-3">Pelanggan</th>
                                <th className="py-3">Tanggal Tagihan</th>
                                <th className="py-3">Jatuh Tempo</th>
                                <th className="py-3 text-right">Total</th>
                                <th className="py-3">Status Bayar</th>
                                <th className="py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length > 0 ? invoices.map((invoice) => (
                                <tr key={invoice.id} className="border-b border-slate-50 text-sm hover:bg-slate-50/70">
                                    <td className="py-3 font-black text-[#4722B3]">{invoice.invoice_number}</td>
                                    <td className="py-3 font-semibold text-slate-700">{invoice.customer?.name || '-'}</td>
                                    <td className="py-3 font-semibold text-slate-600">{formatDate(invoice.invoice_date)}</td>
                                    <td className="py-3 font-semibold text-slate-600">{formatDate(invoice.due_date)}</td>
                                    <td className="py-3 text-right font-black text-[#1f2a3d]">{formatCurrency(invoice.total_amount)}</td>
                                    <td className="py-3">
                                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass[invoice.payment_status] || 'bg-gray-100 text-gray-700'}`}>
                                            {statusLabel[invoice.payment_status] || invoice.payment_status}
                                        </span>
                                    </td>
                                    <td className="py-3 text-right">
                                        <Link href={route('invoices.show', invoice.id)} className="text-sm font-bold text-indigo-600 hover:text-indigo-800">
                                            Lihat Detail
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center">
                                        <div className="mx-auto max-w-md">
                                            <p className="text-[16px] font-black text-slate-500">Belum ada tagihan</p>
                                            <p className="mt-1 text-[13px] font-semibold text-slate-400">Buat tagihan pertama dari transaksi pelanggan Anda.</p>
                                            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                                                <Link href={route('invoices.create')} className="inline-flex rounded-xl bg-[#5B33CC] px-4 py-2 text-sm font-bold text-white">
                                                    + Buat Tagihan
                                                </Link>
                                                <Link href={route('shipments.index')} className="inline-flex rounded-xl border border-[#E5EAF3] bg-white px-4 py-2 text-sm font-bold text-[#5B33CC] hover:bg-gray-50">
                                                    Lihat Pengiriman
                                                </Link>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
