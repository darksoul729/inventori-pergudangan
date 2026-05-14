import DashboardLayout from '@/Layouts/DashboardLayout';
import { isOperationalRole } from '@/Utils/roleCapabilities';
import { Head, Link, router, usePage } from '@inertiajs/react';
import React from 'react';
import { Plus, Eye, Download, ClipboardList, FileText, Clock3, BadgeCheck, PackageCheck, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';

const statusColors = {
    pending: 'bg-amber-50 text-amber-700',
    approved: 'bg-indigo-50 text-indigo-700',
    received: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-rose-50 text-rose-700',
    rejected: 'bg-rose-50 text-rose-700',
};

const statusLabels = { pending: 'Menunggu', approved: 'Disetujui', received: 'Diterima', cancelled: 'Batal', rejected: 'Tolak' };

export default function Index({ purchaseOrders, stats, filters = {} }) {
    const { props } = usePage();
    const roleName = props.auth?.user?.role_name || props.auth?.user?.role || '';
    const canCreate = isOperationalRole(roleName);

    const items = purchaseOrders?.data || purchaseOrders || [];
    const pagination = purchaseOrders?.data ? purchaseOrders : null;

    const [search, setSearch] = React.useState(filters.search || '');
    const [statusFilter, setStatusFilter] = React.useState(filters.status || 'all');

    const applyFilters = (newFilters) => {
        const params = { ...filters, ...newFilters };
        if (params.status === 'all') delete params.status;
        if (!params.search) delete params.search;
        router.get(route('purchase-orders.index'), params, { preserveState: true, replace: true });
    };

    const handleSearch = (val) => {
        setSearch(val);
        applyFilters({ search: val, page: 1 });
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        applyFilters({ status, page: 1 });
    };

    return (
        <DashboardLayout headerSearchPlaceholder="Cari..." searchValue={search} onSearch={handleSearch}>
            <Head title="Pesanan" />

            <div className="pb-12 pt-2 space-y-5">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-[24px] font-black text-[#4722B3]">Pesanan Pembelian</h1>
                        <p className="text-sm text-gray-500 mt-1">Pantau status pesanan dan total belanja pembelian.</p>
                    </div>
                    {canCreate && (
                        <Link href={route('purchase-orders.create')} className="flex items-center gap-2 px-4 py-2 bg-[#5B33CC] text-white font-bold rounded-lg text-sm">
                            <Plus className="w-4 h-4" />Buat Pesanan
                        </Link>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-semibold">Total Pesanan</div>
                            <FileText className="w-4 h-4 text-[#4722B3]" />
                        </div>
                        <div className="text-2xl font-black text-[#4722B3] mt-1">{stats?.total || 0}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-semibold">Menunggu</div>
                            <Clock3 className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="text-2xl font-black text-amber-600 mt-1">{stats?.pending || 0}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-semibold">Disetujui</div>
                            <BadgeCheck className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="text-2xl font-black text-indigo-600 mt-1">{stats?.approved || 0}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-semibold">Diterima</div>
                            <PackageCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-2xl font-black text-emerald-600 mt-1">{stats?.received || 0}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-4 sm:col-span-2 xl:col-span-1">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-semibold">Nilai Pesanan</div>
                            <Wallet className="w-4 h-4 text-slate-700" />
                        </div>
                        <div className="text-xl font-black text-[#1f2937] mt-1">Rp {(stats?.totalAmount || 0).toLocaleString('id-ID')}</div>
                    </div>
                </div>

                {/* Status Filter */}
                <div className="flex gap-2 flex-wrap">
                    {[{key:'all',label:'Semua'},{key:'pending',label:'Menunggu'},{key:'approved',label:'Disetujui'},{key:'received',label:'Diterima'},{key:'cancelled',label:'Batal'},{key:'rejected',label:'Ditolak'}].map(f => (
                        <button key={f.key} onClick={() => handleStatusFilter(f.key)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${statusFilter === f.key ? 'bg-[#5B33CC] text-white border-[#5B33CC]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#5B33CC]'}`}>{f.label}</button>
                    ))}
                </div>

                {/* List */}
                <div className="bg-white rounded-xl border border-[#E5EAF3] overflow-hidden">
                    {items.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {items.map((po) => (
                                <div key={po.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-[#4722B3]">{po.po_number}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[po.status] || 'bg-gray-50 text-gray-600'}`}>
                                                {statusLabels[po.status] || po.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500">{po.supplier?.name} · {new Date(po.order_date).toLocaleDateString('id-ID')}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-gray-800">Rp {Number(po.total_amount || 0).toLocaleString()}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        {po.pdf_url && <a href={route('purchase-orders.pdf', po.id)} className="p-2 border rounded-lg text-gray-500 hover:border-[#5B33CC]"><Download className="w-4 h-4" /></a>}
                                        <Link href={route('purchase-orders.show', po.id)} className="p-2 bg-[#5B33CC] rounded-lg text-white hover:bg-indigo-700"><Eye className="w-4 h-4" /></Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="font-black text-[#4722B3]">Belum ada pesanan</p>
                            <p className="mt-1 text-[13px] font-semibold text-gray-500">Mulai buat pesanan beli pertama untuk pemasok Anda.</p>
                            {canCreate && (
                                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                                    <Link href={route('purchase-orders.create')} className="inline-block px-4 py-2 bg-[#5B33CC] text-white font-bold rounded-lg text-sm">+ Buat Pesanan</Link>
                                    <Link href={route('supplier')} className="inline-block px-4 py-2 border border-[#E5EAF3] bg-white text-[#5B33CC] font-bold rounded-lg text-sm hover:bg-gray-50">Kelola Pemasok</Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500 font-semibold">
                            Menampilkan {pagination.from}–{pagination.to} dari {pagination.total}
                        </div>
                        <div className="flex gap-1">
                            {pagination.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url || link.active}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${link.active ? 'bg-[#5B33CC] text-white border-[#5B33CC]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#5B33CC] disabled:opacity-40'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
