import DashboardLayout from '@/Layouts/DashboardLayout';
import { isManagerRole, isSupervisorRole, isStaffRole } from '@/Utils/roleCapabilities';
import CustomDropdown from '@/Components/CustomDropdown';
import { Head, usePage, router, Link } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { Package, AlertCircle, Filter, ChevronDown, FileText, Tag, CheckCircle, Plus, TrendingUp } from 'lucide-react';
import BackToPanduan from '@/Components/BackToPanduan';

export default function Inventory({ products, stats, categories, units, suppliers, warehouses, operationalWarehouse }) {
    const { props } = usePage();
    const roleName = props.auth?.user?.role_name || props.auth?.user?.role || '';
    const isManager = isManagerRole(roleName);
    const isSupervisor = isSupervisorRole(roleName);
    const isStaff = isStaffRole(roleName);
    const canAuditStock = isManager || isSupervisor || isStaff;
    const canCreateInboundOrder = isManager || isSupervisor || isStaff;
    const hasProducts = Array.isArray(products?.data) && products.data.length > 0;

    const queryParams = new URLSearchParams(window.location.search);
    const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
    const [categoryFilter, setCategoryFilter] = useState(queryParams.get('category_id') || 'all');
    const [statusFilter, setStatusFilter] = useState(queryParams.get('status') || 'all');

    useEffect(() => {
        if (searchTerm === (queryParams.get('search') || '')) return;
        const delayDebounceFn = setTimeout(() => handleFilterChange('search', searchTerm), 400);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleFilterChange = (key, value) => {
        const newParams = new URLSearchParams(window.location.search);
        if (value === 'all') newParams.delete(key);
        else newParams.set(key, value);
        newParams.delete('page');
        router.get(route('inventory'), Object.fromEntries(newParams.entries()), { preserveState: true, replace: true, only: ['products', 'stats', 'filters'], preserveScroll: true });
    };

    return (
        <DashboardLayout headerTitle="Barang & Stok" headerSearchPlaceholder="Cari barang..." searchValue={searchTerm} onSearch={setSearchTerm}>
            <Head title="Barang & Stok" />

            <div className="pb-12 pt-2">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-[28px] font-black text-[#4722B3] tracking-tight">Barang & Stok</h1>
                        <p className="text-[13px] font-semibold text-gray-500 mt-1">Kelola semua produk di gudang.</p>
                    </div>
                    <div className="flex gap-3">
                        {isManager && <Link href={route('settings', { active: 'categories' })} className="flex items-center gap-2 px-5 py-2.5 border border-[#E5EAF3] bg-white hover:bg-gray-50 text-[#5B33CC] font-bold rounded-xl text-[13px]"><Tag className="w-4 h-4" />Kategori</Link>}
                        {canAuditStock && <Link href={route('stock-opname.index')} className="flex items-center gap-2 px-5 py-2.5 border border-[#E5EAF3] bg-white hover:bg-gray-50 text-[#5B33CC] font-bold rounded-xl text-[13px]"><CheckCircle className="w-4 h-4" />Cek Stok</Link>}
                        {isManager && <Link href={route('inventory.create')} className="flex items-center gap-2 px-5 py-2.5 bg-[#5B33CC] hover:bg-indigo-700 text-white font-bold rounded-xl text-[13px] shadow-[0_4px_14px_rgba(89,50,201,0.3)]"><Plus className="w-4 h-4" />Tambah Produk</Link>}
                    </div>
                </div>

                {/* Stats Cards - Simple 4 cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]">
                        <div className="flex items-center gap-2 mb-2">
                            <Package className="w-4 h-4 text-indigo-500" />
                            <span className="text-[11px] font-extrabold text-gray-500">Total Produk</span>
                        </div>
                        <div className="text-[28px] font-black text-[#4722B3]">{stats.total_skus?.toLocaleString() || 0}</div>
                    </div>
                    <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span className="text-[11px] font-extrabold text-gray-500">Stok Habis</span>
                        </div>
                        <div className="text-[28px] font-black text-red-600">{stats.out_of_stock || 0}</div>
                    </div>
                    <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <span className="text-[11px] font-extrabold text-gray-500">Stok Menipis</span>
                        </div>
                        <div className="text-[28px] font-black text-amber-600">{stats.low_stock || 0}</div>
                    </div>
                    <div className="bg-gradient-to-br from-[#5B33CC] to-[#4722B3] rounded-[20px] p-5 shadow-[0_8px_20px_rgba(89,50,201,0.25)] text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-white/70" />
                            <span className="text-[11px] font-extrabold text-white/70">Kapasitas Rak</span>
                        </div>
                        <div className="text-[28px] font-black">{stats.storage_efficiency || 0}%</div>
                        <div className="text-[10px] font-bold text-white/60 mt-1">{stats.occupied_storage || 0} / {stats.total_storage_capacity || 0} rak terpakai</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3] mb-6">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-2 text-[12px] font-bold text-gray-500"><Filter className="w-4 h-4" />Filter:</div>
                        <CustomDropdown
                            value={categoryFilter}
                            onChange={(value) => { setCategoryFilter(value); handleFilterChange('category_id', value); }}
                            options={[{ value: 'all', label: 'Semua Kategori' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
                            placeholder="Semua Kategori"
                            className="min-w-[220px]"
                        />
                        <CustomDropdown
                            value={statusFilter}
                            onChange={(value) => { setStatusFilter(value); handleFilterChange('status', value); }}
                            options={[
                                { value: 'all', label: 'Semua Status' },
                                { value: 'Healthy', label: 'Aman' },
                                { value: 'LowStock', label: 'Stok Menipis' },
                                { value: 'OutOfStock', label: 'Stok Habis' },
                            ]}
                            placeholder="Semua Status"
                            className="min-w-[220px]"
                        />
                        {(categoryFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
                            <button onClick={() => { setCategoryFilter('all'); setStatusFilter('all'); setSearchTerm(''); router.get(route('inventory'), {}, { preserveState: true, replace: true }); }}
                                className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-[12px] font-bold text-gray-500 hover:border-gray-300">Reset</button>
                        )}
                        <div className="ml-auto text-[12px] font-bold text-gray-500">
                            Gudang: <span className="text-[#4722B3]">{operationalWarehouse?.name || 'Utama'}</span>
                        </div>
                    </div>
                </div>

                {/* Product List - Simple Card Layout */}
                <div className="bg-white rounded-[20px] shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3] overflow-hidden">
                    {hasProducts ? (
                        <div className="divide-y divide-gray-50">
                            {products.data.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
                                    {/* Product Image */}
                                    <div className="w-14 h-14 rounded-xl bg-[#f8f9fb] border border-gray-100 flex-shrink-0 overflow-hidden">
                                        {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /> :
                                            <div className="w-full h-full bg-gradient-to-tr from-cyan-600 to-sky-400 p-0.5">
                                                <div className="w-full h-full bg-[#4722B3] rounded-[10px] flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-white/30" />
                                                </div>
                                            </div>
                                        }
                                    </div>
                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[14px] font-black text-[#4722B3]">{item.name}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.status_color}`}>{item.status}</span>
                                        </div>
                                        <div className="text-[12px] font-bold text-gray-400 mt-0.5">SKU: {item.sku}</div>
                                    </div>
                                    {/* Stock Level */}
                                    <div className="w-32 flex-shrink-0">
                                        <div className="flex justify-between text-[11px] font-bold mb-1">
                                            <span className="text-gray-600">{item.current_stock}</span>
                                            <span className="text-gray-400">/ {item.max_stock}</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#5B33CC] rounded-full" style={{ width: `${item.percentage}%` }} />
                                        </div>
                                    </div>
                                    {/* Actions */}
                                    <div className="flex gap-2 flex-shrink-0">
                                        <Link href={route('inventory.show', item.id)} className="w-10 h-10 rounded-xl bg-[#f8f9fb] flex items-center justify-center text-[#5B33CC] hover:bg-[#5B33CC] hover:text-white transition">
                                            <FileText className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-[#f8f9fb] flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-[16px] font-black text-[#4722B3]">Belum ada produk</p>
                            <p className="text-[13px] font-semibold text-gray-500 mt-1">Mulai isi produk agar stok bisa dipantau harian.</p>
                            <div className="mt-5 flex justify-center gap-3">
                                {isManager && <Link href={route('inventory.create')} className="px-5 py-2.5 rounded-xl bg-[#5B33CC] text-white text-[13px] font-bold hover:bg-indigo-700">+ Tambah Produk</Link>}
                                {canCreateInboundOrder && <Link href={route('purchase-orders.create')} className="px-5 py-2.5 rounded-xl border border-[#E5EAF3] bg-white text-[#5B33CC] text-[13px] font-bold hover:bg-gray-50">+ Buat Pesanan Masuk</Link>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {hasProducts && products.total > products.per_page && (
                    <div className="flex justify-between items-center mt-6">
                        <span className="text-[13px] font-bold text-gray-500">Menampilkan {products.from || 0}-{products.to || 0} dari {products.total} produk</span>
                        <div className="flex gap-2">
                            <button onClick={() => products.prev_page_url && (window.location.href = products.prev_page_url)} disabled={!products.prev_page_url}
                                className={`px-4 py-2 rounded-xl text-[12px] font-bold ${!products.prev_page_url ? 'text-gray-300' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>Sebelumnya</button>
                            <button onClick={() => products.next_page_url && (window.location.href = products.next_page_url)} disabled={!products.next_page_url}
                                className={`px-4 py-2 rounded-xl text-[12px] font-bold ${!products.next_page_url ? 'text-gray-300' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>Selanjutnya</button>
                        </div>
                    </div>
                )}
            </div>
            <BackToPanduan />
        </DashboardLayout>
    );
}
