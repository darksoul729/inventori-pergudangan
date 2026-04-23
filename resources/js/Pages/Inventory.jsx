import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage, router, Link } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';

// =======================
//  Inventory Icons
// =======================
const BoxIcon2 = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
);
const OutOfStockIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const RocketIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 2a8.995 8.995 0 00-6.172 2.628A8.995 8.995 0 005.2 10.8c0 2.482.998 4.73 2.628 6.372L22 3.028A8.995 8.995 0 0015.628.4" />
        <path d="M11 15.5l-5.5 5.5c-1 1-2.5 1.5-4 1.5 0-1.5.5-3 1.5-4l5.5-5.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        <path d="M17.5 4a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" fill="currentColor" />
    </svg>
);
const FilterIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
);
const ChevronDownIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);
const InsightIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

// =======================
//  Transaction Icons
// =======================
const RegistryIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const ScanIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-1m-1-4v1m0 0a2 2 0 100 4 2 2 0 000-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
    </svg>
);
const SearchMagnifyIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);
const CalendarIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const RegistryIcon2 = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
);
const WarningIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);
const LocationPinIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const GridIcon2 = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="4" y="4" width="6" height="6" rx="1.5" strokeWidth={2} />
        <rect x="14" y="4" width="6" height="6" rx="1.5" strokeWidth={2} />
        <rect x="4" y="14" width="6" height="6" rx="1.5" strokeWidth={2} />
        <rect x="14" y="14" width="6" height="6" rx="1.5" strokeWidth={2} />
    </svg>
);
const SparkleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);
const TagIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
);
const AuditIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function Inventory({ products, stats, categories, units, suppliers, warehouses, operationalWarehouse }) {
    const { props } = usePage();
    const flash = props.flash || {};
    const roleName = String(props.auth?.user?.role_name || props.auth?.user?.role || '').toLowerCase();
    const isManager = roleName.includes('manager') || roleName.includes('manajer') || roleName.includes('admin gudang');
    const isSupervisor = roleName.includes('supervisor') || roleName.includes('spv');
    const isStaff = roleName.includes('staff');
    const canAuditStock = isManager || isSupervisor || isStaff;

    // Search state
    const queryParams = new URLSearchParams(window.location.search);
    const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');

    // Debounced search effect
    useEffect(() => {
        if (searchTerm === (queryParams.get('search') || '')) return;

        const delayDebounceFn = setTimeout(() => {
            handleFilterChange('search', searchTerm);
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Filter handling

    const handleFilterChange = (key, value) => {
        const newParams = new URLSearchParams(window.location.search);
        if (value === 'all') {
            newParams.delete(key);
        } else {
            newParams.set(key, value);
        }
        // Reset to page 1 when filtering
        newParams.delete('page');

        router.get(route('inventory'), Object.fromEntries(newParams.entries()), {
            preserveState: true,
            replace: true,
            only: ['products', 'stats', 'filters'],
            preserveScroll: true
        });
    };

    return (
        <DashboardLayout
            headerTitle="Manajemen Inventaris"
            headerSearchPlaceholder="Cari di inventaris..."
            searchValue={searchTerm}
            onSearch={setSearchTerm}
        >
            <Head title="Manajemen Inventaris" />

            {/* Flash Messages */}
            {flash.success && (
                <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-bold animate-in fade-in slide-in-from-top-4">
                    {flash.success}
                </div>
            )}
            {flash.error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold animate-in fade-in slide-in-from-top-4">
                    {flash.error}
                </div>
            )}

            <div className="flex flex-row gap-6 pb-12 w-full pt-2 min-w-[1000px] overflow-x-auto transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Left Column - Main Content */}
                <div className="flex-1 flex flex-col space-y-6">

                    {/* Header Row */}
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-[28px] font-black text-[#1a202c] tracking-tight">Manajemen Inventaris</h1>

                        <div className="flex items-center space-x-4">
                            {isManager && (
                                <Link
                                    href={route('settings', { active: 'categories' })}
                                    className="flex items-center space-x-2 px-6 py-3 border border-[#edf2f7] bg-white hover:bg-indigo-50 text-[#4f46e5] font-bold rounded-xl text-[14px] transition-all"
                                >
                                    <TagIcon className="w-4 h-4" />
                                    <span>Kelola Kategori</span>
                                </Link>
                            )}
                            <Link
                                href={route('inventory.outbound.view')}
                                className="flex items-center space-x-2 px-6 py-3 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-[14px] transition-colors"
                            >
                                <RegistryIcon2 className="w-4 h-4 text-gray-400" />
                                <span>Barang Keluar</span>
                            </Link>
                            {canAuditStock && (
                                <Link
                                    href={route('stock-opname.index')}
                                    className="flex items-center space-x-2 px-6 py-3 border border-[#edf2f7] bg-white hover:bg-indigo-50 text-[#4f46e5] font-bold rounded-xl text-[14px] transition-all"
                                >
                                    <AuditIcon className="w-4 h-4" />
                                    <span>Stock Opname</span>
                                </Link>
                            )}
                            {isManager && (
                                <Link
                                    href={route('inventory.create')}
                                    className="flex items-center space-x-2 px-6 py-3 bg-[#4f46e5] shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:bg-indigo-700 text-white font-bold rounded-xl text-[14px] transition-colors"
                                >
                                    <span className="text-lg leading-none font-medium">+</span>
                                    <span>Tambah Entri Baru</span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* 4 Stat Cards */}
                    <div className="grid grid-cols-4 gap-4">
                        {/* 1. Total SKUs */}
                        <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                            <div className="flex items-center space-x-2 mb-3">
                                <BoxIcon2 className="w-4 h-4 text-indigo-500" />
                                <span className="text-[12px] font-extrabold text-gray-500 tracking-wide">Total SKU</span>
                            </div>
                            <div className="flex items-baseline space-x-3">
                                <span className="text-[26px] font-black text-[#1a202c]">{stats.total_skus.toLocaleString()}</span>
                                <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded tracking-wide">+0%</span>
                            </div>
                        </div>

                        {/* 2. Out of Stock */}
                        <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                            <div className="flex items-center space-x-2 mb-3">
                                <OutOfStockIcon className="w-4 h-4 text-red-400" />
                                <span className="text-[12px] font-extrabold text-gray-500 tracking-wide">Stok Habis</span>
                            </div>
                            <div className="flex items-baseline space-x-3">
                                <span className="text-[26px] font-black text-[#1a202c]">{stats.out_of_stock}</span>
                                <span className="text-[10px] font-extrabold text-red-500 bg-red-50 px-1.5 py-0.5 rounded tracking-wide">-0%</span>
                            </div>
                        </div>

                        {/* 3. Low Stock Alerts */}
                        <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                            <div className="flex items-center space-x-2 mb-3">
                                <WarningIcon className="w-4 h-4 text-amber-500" />
                                <span className="text-[12px] font-extrabold text-gray-500 tracking-wide">Peringatan Stok Menipis</span>
                            </div>
                            <div className="flex items-baseline space-x-3 mt-1">
                                <span className="text-[26px] font-black text-[#1a202c] leading-none">{stats.low_stock}</span>
                                <span className="text-[9px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded uppercase tracking-wider">Kritis</span>
                            </div>
                        </div>

                        {/* 4. Storage Efficiency */}
                        <div className="bg-gradient-to-br from-[#6366f1] to-[#4338ca] rounded-[20px] p-5 shadow-[0_8px_20px_rgba(79,70,229,0.25)] relative overflow-hidden text-white flex flex-col justify-between">
                            <RocketIcon className="w-24 h-24 absolute -right-4 -bottom-4 text-white opacity-10" />
                            <div className="relative z-10 text-[12px] font-bold text-indigo-100/90 tracking-wide mb-2">Efisiensi Penyimpanan</div>
                            <div className="relative z-10">
                                <div className="text-[26px] font-black leading-none mb-1.5">{stats.storage_efficiency}%</div>
                                <div className="flex items-center space-x-1">
                                    <div className="w-[5px] h-[5px] bg-white rounded-full"></div>
                                    <span className="text-[10px] font-bold text-indigo-200">Dioptimalkan AI</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters & Product List Container */}
                    <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7] flex-1">

                        {/* Filters Row */}
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center space-x-4">
                                {/* Categories Filter */}
                                <div className="relative">
                                    <select
                                        className="flex items-center space-x-2 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors appearance-none pr-8 cursor-pointer min-w-[140px]"
                                        value={queryParams.get('category_id') || 'all'}
                                        onChange={(e) => handleFilterChange('category_id', e.target.value)}
                                    >
                                        <option value="all">Kategori: Semua</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>

                                <div className="flex items-center rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2 text-[13px] font-bold text-indigo-700">
                                    Gudang Operasional: {operationalWarehouse?.name || 'Warehouse Utama'}
                                </div>

                                {/* Status Filter */}
                                <div className="relative">
                                    <select
                                        className="flex items-center space-x-2 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors appearance-none pr-8 cursor-pointer min-w-[140px]"
                                        value={queryParams.get('status') || 'all'}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                    >
                                        <option value="all">Status: Semua</option>
                                        <option value="Healthy">Aman</option>
                                        <option value="LowStock">Stok Menipis</option>
                                        <option value="OutOfStock">Stok Habis</option>
                                    </select>
                                    <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                            <button className="flex items-center space-x-1.5 text-[12px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
                                <FilterIcon className="w-3.5 h-3.5" />
                                <span>Filter Lanjutan</span>
                            </button>
                        </div>

                        {/* Product List Table */}
                        <div className="w-full">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-100 text-[10px] font-black text-gray-400 tracking-[0.1em] uppercase">
                                <div className="col-span-5 pl-2">Detail Produk</div>
                                <div className="col-span-4">Level Stok</div>
                                <div className="col-span-3">Status</div>
                            </div>

                            {/* List Items */}
                            <div className="divide-y divide-gray-50">
                                {products.data.map((item) => (
                                    <div key={item.id} className="grid grid-cols-12 gap-4 py-6 items-center hover:bg-gray-50/50 transition-colors group">
                                        <div className="col-span-5 flex items-center space-x-5 pl-2">
                                            <div className="w-14 h-14 rounded-xl bg-[#f8f9fb] border border-gray-100 shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-tr from-cyan-600 to-sky-400 p-0.5">
                                                        <div className="w-full h-full bg-[#1a202c] rounded-[10px] flex items-center justify-center relative">
                                                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-blue-500/20 blur-md"></div>
                                                            <div className="w-8 h-6 bg-cyan-400 rounded-sm shadow-[0_0_10px_rgba(34,211,238,0.4)] border border-cyan-200 z-10"></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-[14px] font-black text-[#1a202c] mb-1">{item.name}</div>
                                                <div className="text-[11px] font-bold text-gray-400 tracking-wide">SKU: {item.sku}</div>
                                            </div>
                                        </div>
                                        <div className="col-span-4 flex flex-col justify-center pr-8">
                                            <div className="flex justify-between items-end mb-1.5">
                                                <span className="text-[11px] font-bold text-[#1a202c]">{item.current_stock} <span className="text-gray-400 font-semibold">/ {item.max_stock}</span></span>
                                                <span className="text-[11px] font-black text-gray-700">{item.percentage}%</span>
                                            </div>
                                            <div className="w-full h-[5px] bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#4f46e5] rounded-full" style={{ width: `${item.percentage}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="col-span-3 flex justify-between items-center pr-2">
                                            <span className={`${item.status_color} text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider`}>
                                                {item.status}
                                            </span>
                                            <Link
                                                href={route('inventory.show', item.id)}
                                                className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all group/btn shadow-sm"
                                                title="Lihat Detail Transaksi"
                                            >
                                                <RegistryIcon className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                                {products.data.length === 0 && (
                                    <div className="py-12 text-center text-gray-400 font-bold">
                                        Tidak ada produk yang ditemukan di inventaris.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pagination Footer */}
                        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
                            <span className="text-[13px] font-bold text-gray-500">
                                Menampilkan {products.from || 0} hingga {products.to || 0} dari {products.total} produk
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => products.prev_page_url && (window.location.href = products.prev_page_url)}
                                    disabled={!products.prev_page_url}
                                    className={`px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-xl text-[12px] font-bold ${!products.prev_page_url ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                                >
                                    Sblm
                                </button>
                                <button
                                    onClick={() => products.next_page_url && (window.location.href = products.next_page_url)}
                                    disabled={!products.next_page_url}
                                    className={`px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-xl text-[12px] font-bold ${!products.next_page_url ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                                >
                                    Lanjut
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
