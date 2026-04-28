import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';

const PlusIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const EyeIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const DownloadIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14" />
    </svg>
);

export default function Index({ purchaseOrders = [] }) {
    const { props } = usePage();
    const roleName = String(props.auth?.user?.role_name || props.auth?.user?.role || '').toLowerCase();
    const isManager = roleName.includes('manager') || roleName.includes('manajer') || roleName.includes('admin gudang');
    const isSupervisor = roleName.includes('supervisor') || roleName.includes('spv');
    const canCreatePurchaseOrder = isManager || isSupervisor;

    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredPurchaseOrders = React.useMemo(() => {
        if (!searchTerm) return purchaseOrders;
        const lowerTerm = searchTerm.toLowerCase();
        return purchaseOrders.filter(po => 
            (po.po_number || '').toLowerCase().includes(lowerTerm) ||
            (po.supplier?.name || '').toLowerCase().includes(lowerTerm) ||
            (po.status || '').toLowerCase().includes(lowerTerm)
        );
    }, [purchaseOrders, searchTerm]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'approved': return 'bg-indigo-100 text-indigo-700';
            case 'received': return 'bg-emerald-100 text-emerald-700';
            case 'cancelled':
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    return (
        <DashboardLayout
            headerSearchPlaceholder="Cari pesanan (PO, Pemasok, Status)..."
            searchValue={searchTerm}
            onSearch={setSearchTerm}
        >
            <Head title="Pesanan Pembelian" />

            <div className="flex w-full flex-col space-y-6 pb-12 pt-2">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-[28px] font-black text-[#28106F] tracking-tight">Pesanan Pembelian</h1>
                        <p className="text-[14px] font-bold text-gray-500 mt-1">Kelola pemesanan stok dari pemasok untuk gudang operasional.</p>
                    </div>
                    {canCreatePurchaseOrder && (
                        <Link href={route('purchase-orders.create')} className="flex items-center space-x-2 px-6 py-3.5 bg-[#5932C9] shadow-[#5932C9]/30 shadow-lg hover:bg-indigo-700 text-white font-bold rounded-xl text-[14px] transition-colors">
                            <PlusIcon className="w-4 h-4" />
                            <span>Buat PO Baru</span>
                        </Link>
                    )}
                </div>

                <div className="rounded-[24px] border border-[#EDE8FC] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] md:p-8">
                    <div className="w-full overflow-x-auto">
                        <table className="min-w-[920px] w-full">
                            <thead>
                                <tr className="border-b border-gray-100 text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">
                                    <th className="px-2 pb-4 text-left">Nomor PO</th>
                                    <th className="px-2 pb-4 text-left">Pemasok</th>
                                    <th className="px-2 pb-4 text-left">Tanggal</th>
                                    <th className="px-2 pb-4 text-left">Nilai</th>
                                    <th className="px-2 pb-4 text-left">Status</th>
                                    <th className="px-2 pb-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50/80">
                                {filteredPurchaseOrders.length > 0 ? (
                                    filteredPurchaseOrders.map((po) => (
                                        <tr key={po.id} className="transition-colors hover:bg-gray-50/50">
                                            <td className="px-2 py-4 text-[13px] font-black text-[#28106F]">{po.po_number}</td>
                                            <td className="px-2 py-4">
                                                <div className="text-[14px] font-black text-[#28106F]">{po.supplier?.name}</div>
                                                <div className="text-[11px] font-bold capitalize text-gray-400">{po.supplier?.category}</div>
                                            </td>
                                            <td className="px-2 py-4 text-[13px] font-bold text-gray-500">{new Date(po.order_date).toLocaleDateString('id-ID')}</td>
                                            <td className="px-2 py-4 text-[14px] font-black text-[#28106F]">{formatCurrency(po.total_amount)}</td>
                                            <td className="px-2 py-4">
                                                <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${getStatusColor(po.status)}`}>
                                                    {po.status === 'pending' ? 'Menunggu' : po.status === 'approved' ? 'Disetujui' : po.status === 'received' ? 'Diterima' : po.status === 'cancelled' ? 'Dibatalkan' : po.status === 'rejected' ? 'Ditolak' : po.status}
                                                </span>
                                            </td>
                                            <td className="px-2 py-4 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <a href={route('purchase-orders.pdf', po.id)} download className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100" title="Unduh PDF">
                                                        <DownloadIcon className="w-4 h-4" />
                                                    </a>
                                                    <Link href={route('purchase-orders.show', po.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-indigo-500 transition-colors hover:bg-indigo-50" title="Lihat Detail">
                                                        <EyeIcon className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-[14px] font-bold text-gray-400">
                                            Belum ada pesanan pembelian. Mulai dengan membuat PO pertama.
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
