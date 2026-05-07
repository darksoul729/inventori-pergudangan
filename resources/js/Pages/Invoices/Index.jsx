import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

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

export default function Index({ invoices = [] }) {
    const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount || 0);

    return (
        <DashboardLayout>
            <Head title="Tagihan" />
            <div className="space-y-6 pb-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[28px] font-black text-[#28106F]">Tagihan</h1>
                        <p className="text-sm font-semibold text-gray-500 mt-1">Buat dan pantau status pembayaran pelanggan.</p>
                    </div>
                    <Link href={route('invoices.create')} className="px-5 py-3 rounded-xl bg-[#5932C9] text-white font-bold text-sm">
                        Buat Tagihan
                    </Link>
                </div>

                <div className="bg-white border border-[#EDE8FC] rounded-2xl p-5 overflow-x-auto">
                    <table className="w-full min-w-[760px]">
                        <thead>
                            <tr className="text-left text-[11px] uppercase text-gray-400 border-b">
                                <th className="py-3">Nomor</th>
                                <th className="py-3">Pelanggan</th>
                                <th className="py-3">Tanggal</th>
                                <th className="py-3">Jatuh Tempo</th>
                                <th className="py-3">Total</th>
                                <th className="py-3">Status</th>
                                <th className="py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length > 0 ? invoices.map((invoice) => (
                                <tr key={invoice.id} className="border-b border-gray-50">
                                    <td className="py-3 text-sm font-bold text-[#28106F]">{invoice.invoice_number}</td>
                                    <td className="py-3 text-sm">{invoice.customer?.name || '-'}</td>
                                    <td className="py-3 text-sm">{new Date(invoice.invoice_date).toLocaleDateString('id-ID')}</td>
                                    <td className="py-3 text-sm">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('id-ID') : '-'}</td>
                                    <td className="py-3 text-sm font-bold">{formatCurrency(invoice.total_amount)}</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-1 rounded-lg text-[11px] font-bold ${statusClass[invoice.payment_status] || 'bg-gray-100 text-gray-700'}`}>
                                            {statusLabel[invoice.payment_status] || invoice.payment_status}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <Link href={route('invoices.show', invoice.id)} className="text-indigo-600 text-sm font-bold">
                                            Lihat
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="py-10 text-center text-gray-400 font-semibold">Belum ada tagihan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
