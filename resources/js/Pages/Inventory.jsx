import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage, useForm, router } from '@inertiajs/react';
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
        <path d="M11 15.5l-5.5 5.5c-1 1-2.5 1.5-4 1.5 0-1.5.5-3 1.5-4l5.5-5.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
        <path d="M17.5 4a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" fill="currentColor"/>
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

export default function Inventory({ products, stats, categories, units, suppliers, warehouses }) {
    const { url, flash } = usePage();
    const [view, setView] = useState('inventory'); // 'inventory', 'outbound', or 'add_new'
    
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
    const addProductForm = useForm({
        sku: '',
        name: '',
        category_id: '',
        unit_id: '',
        default_supplier_id: '',
        initial_stock: 0,
        purchase_price: 0,
        minimum_stock: 10,
        warehouse_id: '',
        rack_id: '',
        description: '',
        image: null,
    });

    // Form for Outbound
    const outboundForm = useForm({
        product_id: '',
        warehouse_id: '',
        quantity: 1,
        destination: '',
        notes: '',
    });

    // Derived state for outbound stock availability
    const selectedProductOutbound = products.data.find(p => p.id == outboundForm.data.product_id);
    const availableStock = selectedProductOutbound 
        ? (selectedProductOutbound.warehouse_stocks?.[outboundForm.data.warehouse_id] || 0)
        : 0;

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const viewParam = params.get('view');
        if (viewParam === 'outbound') {
            setView('outbound');
        } else if (viewParam === 'add_new') {
            setView('add_new');
        } else {
            setView('inventory');
        }
    }, [url]);

    const handleAddProduct = (e) => {
        e.preventDefault();
        addProductForm.post(route('inventory.store'), {
            onSuccess: () => {
                setView('inventory');
                addProductForm.reset();
            },
        });
    };

    const handleOutbound = (e) => {
        e.preventDefault();
        outboundForm.post(route('inventory.outbound'), {
            onSuccess: () => {
                setView('inventory');
                outboundForm.reset();
            },
        });
    };

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
            headerTitle={view === 'outbound' ? "Record Outbound Movement" : view === 'add_new' ? "Add New Inventory Item" : null}
            headerSearchPlaceholder={view === 'outbound' ? "Search transactions..." : "Search inventory..."}
            searchValue={searchTerm}
            onSearch={setSearchTerm}
        >
            <Head title={view === 'outbound' ? "Transaction - Outbound Movement" : view === 'add_new' ? "Add New Inventory Item" : "Inventory Management"} />

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

            {view === 'inventory' && (
                <div className="flex flex-row gap-6 pb-12 w-full pt-2 min-w-[1000px] overflow-x-auto transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Left Column - Main Content */}
                    <div className="flex-1 flex flex-col space-y-6">
                        
                        {/* Header Row */}
                        <div className="flex justify-between items-center mb-2">
                            <h1 className="text-[28px] font-black text-[#1a202c] tracking-tight">Inventory Management</h1>
                            
                            <div className="flex items-center space-x-4">
                                <button 
                                    onClick={() => setView('add_new')}
                                    className="flex items-center space-x-2 px-6 py-3 bg-[#4f46e5] shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:bg-indigo-700 text-white font-bold rounded-xl text-[14px] transition-colors"
                                >
                                    <span className="text-lg leading-none font-medium">+</span>
                                    <span>Add New Entry</span>
                                </button>
                            </div>
                        </div>

                        {/* 4 Stat Cards */}
                        <div className="grid grid-cols-4 gap-4">
                            {/* 1. Total SKUs */}
                            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                                <div className="flex items-center space-x-2 mb-3">
                                    <BoxIcon2 className="w-4 h-4 text-indigo-500" />
                                    <span className="text-[12px] font-extrabold text-gray-500 tracking-wide">Total SKUs</span>
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
                                    <span className="text-[12px] font-extrabold text-gray-500 tracking-wide">Out of Stock</span>
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
                                    <span className="text-[12px] font-extrabold text-gray-500 tracking-wide">Low Stock Alerts</span>
                                </div>
                                <div className="flex items-baseline space-x-3 mt-1">
                                    <span className="text-[26px] font-black text-[#1a202c] leading-none">{stats.low_stock}</span>
                                    <span className="text-[9px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded uppercase tracking-wider">Critical</span>
                                </div>
                            </div>

                            {/* 4. Storage Efficiency */}
                            <div className="bg-gradient-to-br from-[#6366f1] to-[#4338ca] rounded-[20px] p-5 shadow-[0_8px_20px_rgba(79,70,229,0.25)] relative overflow-hidden text-white flex flex-col justify-between">
                                <RocketIcon className="w-24 h-24 absolute -right-4 -bottom-4 text-white opacity-10" />
                                <div className="relative z-10 text-[12px] font-bold text-indigo-100/90 tracking-wide mb-2">Storage Efficiency</div>
                                <div className="relative z-10">
                                    <div className="text-[26px] font-black leading-none mb-1.5">{stats.storage_efficiency}%</div>
                                    <div className="flex items-center space-x-1">
                                        <div className="w-[5px] h-[5px] bg-white rounded-full"></div>
                                        <span className="text-[10px] font-bold text-indigo-200">AI Optimized</span>
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
                                            <option value="all">Categories: All</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>

                                    {/* Location Filter */}
                                    <div className="relative">
                                        <select 
                                            className="flex items-center space-x-2 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors appearance-none pr-8 cursor-pointer min-w-[140px]"
                                            value={queryParams.get('warehouse_id') || 'all'}
                                            onChange={(e) => handleFilterChange('warehouse_id', e.target.value)}
                                        >
                                            <option value="all">Location: All</option>
                                            {warehouses.map(w => (
                                                <option key={w.id} value={w.id}>{w.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>

                                    {/* Status Filter */}
                                    <div className="relative">
                                        <select 
                                            className="flex items-center space-x-2 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors appearance-none pr-8 cursor-pointer min-w-[140px]"
                                            value={queryParams.get('status') || 'all'}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                        >
                                            <option value="all">Status: All</option>
                                            <option value="Healthy">Healthy</option>
                                            <option value="LowStock">Low Stock</option>
                                            <option value="OutOfStock">Out of Stock</option>
                                        </select>
                                        <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>
                                <button className="flex items-center space-x-1.5 text-[12px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
                                    <FilterIcon className="w-3.5 h-3.5" />
                                    <span>Advanced Filters</span>
                                </button>
                            </div>

                            {/* Product List Table */}
                            <div className="w-full">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-100 text-[10px] font-black text-gray-400 tracking-[0.1em] uppercase">
                                    <div className="col-span-5 pl-2">Product Details</div>
                                    <div className="col-span-4">Stock Level</div>
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
                                                    <div className="h-full bg-[#4f46e5] rounded-full" style={{width: `${item.percentage}%`}}></div>
                                                </div>
                                            </div>
                                            <div className="col-span-3 flex justify-between items-center pr-2">
                                                <span className={`${item.status_color} text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider`}>
                                                    {item.status}
                                                </span>
                                                <div className="w-5 h-5 rounded-[4px] border-2 border-indigo-200 border-dashed opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                        </div>
                                    ))}
                                    {products.data.length === 0 && (
                                        <div className="py-12 text-center text-gray-400 font-bold">
                                            No products found in inventory.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pagination Footer */}
                            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
                                <span className="text-[13px] font-bold text-gray-500">
                                    Showing {products.from || 0} to {products.to || 0} of {products.total} products
                                </span>
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => products.prev_page_url && (window.location.href = products.prev_page_url)}
                                        disabled={!products.prev_page_url}
                                        className={`px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-xl text-[12px] font-bold ${!products.prev_page_url ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                                    >
                                        Prev
                                    </button>
                                    <button 
                                        onClick={() => products.next_page_url && (window.location.href = products.next_page_url)}
                                        disabled={!products.next_page_url}
                                        className={`px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-xl text-[12px] font-bold ${!products.next_page_url ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Right Column - Status & Context */}
                    <div className="w-[320px] flex-shrink-0 flex flex-col space-y-6">
                        
                        {/* AI Batch Insights Card */}
                        <div className="bg-[#f4f5f9] rounded-[24px] p-6 border border-[#edf2f7] relative">
                             <div className="flex items-center space-x-2 mb-6">
                                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm flex-shrink-0">
                                    <InsightIcon className="w-4 h-4" />
                                </div>
                                <h3 className="text-[15px] font-black text-[#1a202c] leading-tight">AI Batch<br/>Insights</h3>
                                <span className="ml-auto bg-white border border-indigo-100 text-indigo-600 text-[8px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-widest leading-loose">Active<br/>Scan</span>
                             </div>

                             {/* Focus Batch */}
                             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                                <div className="text-[9px] font-black text-indigo-500 tracking-widest uppercase mb-1">Current Focus Batch</div>
                                <div className="text-[16px] font-black text-[#1a202c] mb-1">Batch #WH-0092-B</div>
                                <div className="text-[11px] font-bold text-gray-400">Arrival: Oct 12, 2023</div>
                             </div>

                             {/* Prediction Chart Area */}
                             <div className="mb-4">
                                 <div className="flex items-center space-x-1.5 mb-4">
                                     <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                     <span className="text-[12px] font-bold text-[#1a202c]">Demand Surge Prediction</span>
                                 </div>

                                 <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-[100px] flex items-end justify-between px-6 pt-6 relative">
                                      {/* Tooltip mockup */}
                                      <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-[#1a202c] text-white text-[10px] font-black py-0.5 px-2 rounded-md z-10 before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-[#1a202c]">
                                          +22%
                                      </div>

                                      <div className="w-3.5 bg-indigo-100 rounded-t-sm" style={{height: '40%'}}></div>
                                      <div className="w-3.5 bg-indigo-200 rounded-t-sm" style={{height: '30%'}}></div>
                                      <div className="w-3.5 bg-indigo-300 rounded-t-sm" style={{height: '70%'}}></div>
                                      <div className="w-3.5 bg-[#4f46e5] rounded-t-sm shadow-[0_0_10px_rgba(79,70,229,0.4)]" style={{height: '90%'}}></div>
                                      <div className="w-3.5 bg-indigo-300 rounded-t-sm" style={{height: '80%'}}></div>
                                      <div className="w-3.5 bg-indigo-200 rounded-t-sm" style={{height: '45%'}}></div>
                                 </div>
                             </div>

                             <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                                 AI predicts a <span className="font-extrabold text-[#1a202c]">22% surge</span> in Logic Array Controller demand by next week based on regional assembly plant schedules.
                             </p>
                        </div>

                        {/* Expiry Alerts Card */}
                        <div className="bg-white rounded-[24px] p-6 border border-[#edf2f7] shadow-sm">
                             <div className="flex items-center space-x-2 mb-6 text-red-500">
                                  <CalendarIcon className="w-4 h-4" />
                                  <h3 className="text-[13px] font-black tracking-wide">Expiry Alerts</h3>
                             </div>

                             <div className="space-y-5">
                                 <div className="flex justify-between items-center relative pl-4">
                                      <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                      <span className="text-[12px] font-bold text-[#1a202c]">Lithium Polymer Cells</span>
                                      <span className="text-[8px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded uppercase tracking-widest">3 Days Left</span>
                                 </div>
                                 <div className="flex justify-between items-center relative pl-4">
                                      <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                      <span className="text-[12px] font-bold text-[#1a202c]">Sealant Compound C-4</span>
                                      <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase tracking-widest">14 Days Left</span>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {view === 'outbound' && (
                <div className="flex flex-row gap-6 pb-12 w-full pt-2 min-w-[900px] overflow-x-auto transition-all animate-in fade-in slide-in-from-right-4 duration-300">
                    {/* Left Column - Main Form */}
                    <div className="flex-1 bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                        <form onSubmit={handleOutbound}>
                        <div className="flex items-start space-x-4 mb-8">
                            <div className="w-[42px] h-[42px] rounded-xl bg-[#eef2ff] flex items-center justify-center text-[#4f46e5] flex-shrink-0">
                                <RegistryIcon2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-[18px] font-black text-[#1a202c]">Outbound Registry</h2>
                                <p className="text-[13px] font-semibold text-gray-400 mt-1">Complete the details below to authorize stock exit.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Row 1 */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between mb-2">
                                        <label className="text-[10px] font-extrabold text-gray-500 tracking-wider uppercase">SELECT PRODUCT</label>
                                        <button type="button" className="text-[11px] font-extrabold text-[#4f46e5] flex items-center space-x-1 hover:text-indigo-700 uppercase tracking-wide">
                                            <ScanIcon className="w-3.5 h-3.5" />
                                            <span>SCAN</span>
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <select 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-[#1a202c] shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] appearance-none"
                                            value={outboundForm.data.product_id}
                                            onChange={e => outboundForm.setData('product_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Product</option>
                                            {products.data.map(p => <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}
                                        </select>
                                        <ChevronDownIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                    {outboundForm.errors.product_id && <div className="text-red-500 text-xs mt-1">{outboundForm.errors.product_id}</div>}
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">SOURCE WAREHOUSE</label>
                                    <div className="relative">
                                        <select 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] appearance-none"
                                            value={outboundForm.data.warehouse_id}
                                            onChange={e => outboundForm.setData('warehouse_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Warehouse</option>
                                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                        </select>
                                        <ChevronDownIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                    {outboundForm.errors.warehouse_id && <div className="text-red-500 text-xs mt-1">{outboundForm.errors.warehouse_id}</div>}
                                </div>
                                <div className="flex-[1.2]">
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">DESTINATION / REASON</label>
                                    <input 
                                        type="text" 
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                        placeholder="e.g. Sale to Customer X"
                                        value={outboundForm.data.destination}
                                        onChange={e => outboundForm.setData('destination', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">EXPEDITION PARTNER</label>
                                    <input 
                                        type="text" 
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                        defaultValue="Aether Logistics Fl"
                                    />
                                </div>
                                <div className="flex-[0.8]">
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">DRIVER NAME</label>
                                    <input 
                                        type="text" 
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-semibold text-gray-500 placeholder-gray-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                        placeholder="Full name"
                                    />
                                </div>
                                <div className="flex-[0.8]">
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">DEPARTURE DATE</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full pl-4 pr-10 py-3 sm:text-[14px] rounded-xl font-semibold text-gray-500 placeholder-gray-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                            placeholder="dd/mm/yyyy"
                                        />
                                        <CalendarIcon className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Row 4: Quantity */}
                            <div className="bg-[#f8f9fb] rounded-xl p-4 flex items-center justify-between border border-gray-50">
                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-0.5">QUANTITY TO MOVE</label>
                                    <span className="text-[12px] font-medium text-gray-400">
                                        {outboundForm.data.product_id && outboundForm.data.warehouse_id 
                                            ? `Available: ${availableStock} units` 
                                            : "Select product & warehouse"}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-6 bg-white shadow-sm border border-gray-100 rounded-[10px] px-4 py-2">
                                    <button 
                                        type="button"
                                        onClick={() => outboundForm.setData('quantity', Math.max(1, outboundForm.data.quantity - 1))}
                                        className="text-[#4f46e5] hover:bg-gray-50 p-1 rounded font-black text-lg leading-none transition-colors"
                                    >−</button>
                                    <span className="font-black text-[18px] text-[#1a202c] min-w-[3ch] text-center">{outboundForm.data.quantity}</span>
                                    <button 
                                        type="button"
                                        onClick={() => outboundForm.setData('quantity', Math.min(availableStock, outboundForm.data.quantity + 1))}
                                        className="text-[#4f46e5] hover:bg-gray-50 p-1 rounded font-black text-lg leading-none transition-colors"
                                        disabled={outboundForm.data.quantity >= availableStock && availableStock > 0}
                                    >+</button>
                                </div>
                            </div>
                            {outboundForm.errors.quantity && <div className="text-red-500 text-xs mt-1 font-bold">{outboundForm.errors.quantity}</div>}

                            {/* Row 5: Notes */}
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">NOTES / DESCRIPTION</label>
                                <textarea 
                                    rows="3"
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-medium text-gray-600 placeholder-gray-400 resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                    placeholder="Additional shipping instructions or damage reports..."
                                    value={outboundForm.data.notes}
                                    onChange={e => outboundForm.setData('notes', e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        {/* Footer buttons with select UI artifacts */}
                        <div className="mt-8 pt-6 flex justify-end gap-3 relative border-t border-gray-50">
                            <div className="relative z-10 group cursor-pointer inline-block">
                                <button 
                                    type="button"
                                    onClick={() => setView('inventory')}
                                    className="px-6 py-3 border border-gray-200 text-[#4f46e5] bg-white font-bold rounded-xl text-[14px] hover:bg-gray-50 transition-colors w-full sm:w-auto h-full m-[1px]"
                                >
                                    Cancel
                                </button>
                            </div>
                            <div className="relative z-10 group cursor-pointer inline-block">
                                <button 
                                    type="submit"
                                    disabled={outboundForm.processing}
                                    className="px-8 py-3 bg-[#4f46e5] text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.3)] text-[14px] hover:bg-indigo-700 transition-all flex items-center space-x-2 border-2 border-transparent"
                                >
                                    <span>{outboundForm.processing ? 'Recording...' : 'Record Movement'}</span>
                                </button>
                            </div>
                        </div>
                        </form>

                    </div>

                    {/* Right Column - Status & Context */}
                    <div className="w-[340px] flex-shrink-0 flex flex-col space-y-6">
                        
                        {/* Inventory Context Card */}
                        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                             <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[11px] font-extrabold text-gray-400 tracking-[0.15em] uppercase">Inventory Context</h3>
                                <RegistryIcon2 className="w-5 h-5 text-gray-300" />
                             </div>

                             {/* Total Stock */}
                             <div className="bg-[#f8f9fb] rounded-[16px] p-5 mb-4 relative overflow-hidden border border-gray-100">
                                 <div className="absolute left-0 top-4 bottom-4 w-[4px] bg-[#4f46e5] rounded-r-md"></div>
                                 <div className="pl-3">
                                     <div className="text-[9px] font-extrabold text-[#4f46e5] tracking-widest uppercase mb-1">Total Current Stock</div>
                                     <div className="flex items-baseline space-x-1">
                                         <span className="text-[34px] font-black text-[#1a202c] leading-none">4,820</span>
                                         <span className="text-[13px] font-bold text-gray-500">units</span>
                                     </div>
                                 </div>
                             </div>

                             {/* Reserved vs Available */}
                             <div className="grid grid-cols-2 gap-4 mb-6">
                                 <div className="bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-[14px] p-4 flex flex-col items-center justify-center text-center">
                                     <span className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase mb-0.5">Reserved</span>
                                     <span className="text-[18px] font-black text-[#1a202c] mb-2">1,140</span>
                                     <div className="w-6 h-[3px] bg-gray-200 rounded-full"></div>
                                 </div>
                                 <div className="bg-[#f8f9fb] border border-[#eff6ff] shadow-sm rounded-[14px] p-4 flex flex-col items-center justify-center text-center">
                                     <span className="text-[10px] font-extrabold text-[#4f46e5] tracking-widest uppercase mb-0.5">Available</span>
                                     <span className="text-[18px] font-black text-[#4f46e5] mb-2">3,680</span>
                                     <div className="w-6 h-[3px] bg-[#4f46e5] rounded-full"></div>
                                 </div>
                             </div>

                             <div className="space-y-4 border-t border-gray-50 pt-5">
                                  <div className="flex justify-between items-center bg-white px-1">
                                      <div className="flex items-center space-x-2">
                                          <WarningIcon className="w-4 h-4 text-amber-500" />
                                          <span className="text-[12px] font-bold text-[#1a202c]">Reorder Point</span>
                                      </div>
                                      <span className="text-[12px] font-bold text-gray-500">1,200 units</span>
                                  </div>
                                  <div className="flex justify-between items-center bg-white px-1">
                                      <div className="flex items-center space-x-2">
                                          <LocationPinIcon className="w-4 h-4 text-indigo-400" />
                                          <span className="text-[12px] font-bold text-[#1a202c]">Primary Zone</span>
                                      </div>
                                      <span className="text-[12px] font-bold text-gray-500">Aisle 04-B</span>
                                  </div>
                             </div>
                        </div>

                        {/* System Tip Card */}
                        <div className="bg-gradient-to-br from-[#4338ca] to-[#312e81] rounded-[20px] p-6 shadow-xl relative overflow-hidden text-white shadow-[0_10px_25px_rgba(67,56,202,0.3)]">
                            {/* Decorative bg element cursor */}
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIvPjwvc3ZnPg==')] opacity-50"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center space-x-2 mb-3">
                                    <SparkleIcon className="w-4 h-4 text-indigo-200" />
                                    <span className="text-[10px] font-black text-indigo-200 tracking-widest uppercase shadow-sm">System Tip</span>
                                </div>
                                <p className="text-[13px] font-bold text-indigo-50 leading-relaxed mb-4">
                                    "Optimal routing suggests using Terminal 4 for all Gen 4 bearings to reduce dispatch latency by 12%."
                                </p>
                                <a href="#" className="inline-block text-[12px] font-black text-white underline underline-offset-4 decoration-indigo-400 hover:text-indigo-200 transition-colors">
                                    Optimize Route
                                </a>
                            </div>
                        </div>

                        {/* Recent SKU Activity */}
                        <div className="pt-2 px-2">
                            <h4 className="text-[10px] font-black text-gray-400 tracking-[0.15em] uppercase mb-4">Recent SKU Activity</h4>
                            
                            <div className="space-y-4">
                                {/* Timeline item 1 */}
                                <div className="flex relative pl-5">
                                    <div className="absolute left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                    <div className="absolute left-[5px] top-4 bottom-0 w-[1px] bg-gray-200"></div>
                                    <div>
                                        <div className="text-[12px] font-bold text-[#1a202c]">Stock In: <span className="font-extrabold text-[#1a202c]">500 units</span></div>
                                        <div className="text-[10px] font-semibold text-gray-400 mt-0.5 tracking-wide">Today, 09:15 AM - WH-Alpha</div>
                                    </div>
                                </div>
                                
                                {/* Timeline item 2 */}
                                <div className="flex relative pl-5">
                                    <div className="absolute left-[1.5px] top-1.5 w-[5px] h-[5px] rounded-full border-[1.5px] border-gray-300 bg-white"></div>
                                    <div>
                                        <div className="text-[12px] font-bold text-gray-500">Internal Move: <span className="font-extrabold text-gray-500">20 units</span></div>
                                        <div className="text-[10px] font-semibold text-gray-400 mt-0.5 tracking-wide">Yesterday, 04:30 PM - Zone B to C</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {view === 'add_new' && (
                <div className="flex flex-row gap-6 pb-12 w-full pt-2 min-w-[900px] overflow-x-auto transition-all animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex-1 bg-white rounded-[24px] p-10 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7] max-w-4xl mx-auto">
                        <form onSubmit={handleAddProduct}>
                        <div className="mb-10">
                            <h2 className="text-[26px] font-black text-[#1a202c]">Add New Inventory Item</h2>
                            <p className="text-[14px] font-bold text-gray-500 mt-1">Register a new product into the Aether Logistix network.</p>
                        </div>

                        {Object.keys(addProductForm.errors).length > 0 && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                                <span className="text-red-600 font-bold text-sm">Please correct the highlighted errors below.</span>
                            </div>
                        )}

                             <div className="space-y-6">
                            {/* Row 1: Name & SKU */}
                            <div className="grid grid-cols-1 gap-8">
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">PRODUCT NAME</label>
                                    <input 
                                        type="text" 
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-5 py-3.5 sm:text-[14px] rounded-xl font-bold text-[#1a202c] shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] placeholder-gray-400" 
                                        placeholder="e.g. AX900 Sensor Module"
                                        value={addProductForm.data.name}
                                        onChange={e => addProductForm.setData('name', e.target.value)}
                                        required
                                    />
                                    {addProductForm.errors.name && <div className="text-red-500 text-xs mt-1">{addProductForm.errors.name}</div>}
                                </div>
                            </div>

                            {/* Row 2: SKU & Category */}
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">SKU / BARCODE</label>
                                    <input 
                                        type="text" 
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-5 py-3.5 sm:text-[14px] rounded-xl font-bold text-[#1a202c] shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] placeholder-gray-400" 
                                        placeholder="e.g. AX-2045 Quantum Unit"
                                        value={addProductForm.data.sku}
                                        onChange={e => addProductForm.setData('sku', e.target.value)}
                                        required
                                    />
                                    {addProductForm.errors.sku && <div className="text-red-500 text-xs mt-1">{addProductForm.errors.sku}</div>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">CATEGORY</label>
                                    <div className="relative">
                                        <select 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-5 py-3.5 sm:text-[14px] rounded-xl font-bold text-gray-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] appearance-none cursor-pointer"
                                            value={addProductForm.data.category_id}
                                            onChange={e => addProductForm.setData('category_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <ChevronDownIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                    {addProductForm.errors.category_id && <div className="text-red-500 text-xs mt-1">{addProductForm.errors.category_id}</div>}
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">UNIT</label>
                                    <div className="relative">
                                        <select 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-5 py-3.5 sm:text-[14px] rounded-xl font-bold text-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] appearance-none cursor-pointer"
                                            value={addProductForm.data.unit_id}
                                            onChange={e => addProductForm.setData('unit_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Unit</option>
                                            {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                        <ChevronDownIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                    {addProductForm.errors.unit_id && <div className="text-red-500 text-xs mt-1">{addProductForm.errors.unit_id}</div>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">SUPPLIER</label>
                                    <div className="relative">
                                        <select 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-5 py-3.5 sm:text-[14px] rounded-xl font-bold text-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] appearance-none cursor-pointer"
                                            value={addProductForm.data.default_supplier_id}
                                            onChange={e => addProductForm.setData('default_supplier_id', e.target.value)}
                                        >
                                            <option value="">Select Supplier</option>
                                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                        <ChevronDownIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">INITIAL STOCK</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full pl-5 pr-12 py-3.5 sm:text-[14px] rounded-xl font-black text-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                            value={addProductForm.data.initial_stock}
                                            onChange={e => addProductForm.setData('initial_stock', e.target.value)}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                            <RegistryIcon2 className="w-5 h-5" />
                                        </div>
                                    </div>
                                    {addProductForm.errors.initial_stock && <div className="text-red-500 text-xs mt-1">{addProductForm.errors.initial_stock}</div>}
                                    {addProductForm.errors.quantity && <div className="text-red-500 text-xs mt-1">{addProductForm.errors.quantity}</div>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">UNIT PRICE</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full pl-5 pr-12 py-3.5 sm:text-[14px] rounded-xl font-black text-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                            value={addProductForm.data.purchase_price}
                                            onChange={e => addProductForm.setData('purchase_price', e.target.value)}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        </div>
                                    </div>
                                    {addProductForm.errors.purchase_price && <div className="text-red-500 text-xs mt-1">{addProductForm.errors.purchase_price}</div>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">MINIMUM STOCK</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full pl-5 pr-12 py-3.5 sm:text-[14px] rounded-xl font-black text-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                            value={addProductForm.data.minimum_stock}
                                            onChange={e => addProductForm.setData('minimum_stock', e.target.value)}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Row 4 */}
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">WAREHOUSE LOCATION</label>
                                    <div className="relative">
                                        <select 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full pl-5 pr-12 py-3.5 sm:text-[14px] rounded-xl font-bold text-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] appearance-none cursor-pointer"
                                            value={addProductForm.data.warehouse_id}
                                            onChange={e => {
                                                addProductForm.setData('warehouse_id', e.target.value);
                                                addProductForm.setData('rack_id', ''); // Reset rack when warehouse changes
                                            }}
                                            required={addProductForm.data.initial_stock > 0}
                                        >
                                            <option value="">Choose Warehouse</option>
                                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                        </select>
                                        <LocationPinIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                    {addProductForm.errors.warehouse_id && <div className="text-red-500 text-xs mt-1">{addProductForm.errors.warehouse_id}</div>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">RACK LOCATION</label>
                                    <div className="relative">
                                        <select 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full pl-5 pr-12 py-3.5 sm:text-[14px] rounded-xl font-bold text-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] appearance-none cursor-pointer"
                                            value={addProductForm.data.rack_id}
                                            onChange={e => addProductForm.setData('rack_id', e.target.value)}
                                            required={addProductForm.data.initial_stock > 0}
                                            disabled={!addProductForm.data.warehouse_id}
                                        >
                                            <option value="">Select Rack</option>
                                            {warehouses.find(w => w.id == addProductForm.data.warehouse_id)?.zones.flatMap(z => z.racks).map(r => (
                                                <option key={r.id} value={r.id}>{r.code} - {r.name}</option>
                                            ))}
                                        </select>
                                        <GridIcon2 className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                    {addProductForm.errors.rack_id && <div className="text-red-500 text-xs mt-1">{addProductForm.errors.rack_id}</div>}
                                </div>
                            </div>

                            {/* Row 5 */}
                            <div>
                                <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">ITEM DESCRIPTION (OPTIONAL)</label>
                                <textarea 
                                    rows="4"
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-5 py-4 sm:text-[14px] rounded-xl font-bold text-gray-600 placeholder-gray-400 resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                    placeholder="Describe specifications, handling instructions, or storage requirements..."
                                    value={addProductForm.data.description}
                                    onChange={e => addProductForm.setData('description', e.target.value)}
                                ></textarea>
                            </div>

                            {/* Row 6 */}
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">PRODUCT IMAGE</label>
                                    <div 
                                        onClick={() => document.getElementById('product-image-input').click()}
                                        className="border-[2px] border-dashed border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-colors p-10 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
                                    >
                                        <input 
                                            id="product-image-input"
                                            type="file" 
                                            className="hidden" 
                                            onChange={e => addProductForm.setData('image', e.target.files[0])}
                                            accept="image/*"
                                        />
                                        {addProductForm.data.image ? (
                                            <div className="flex flex-col items-center">
                                                <div className="w-20 h-20 rounded-xl overflow-hidden mb-2 shadow-md">
                                                    <img src={URL.createObjectURL(addProductForm.data.image)} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-[12px] font-bold text-indigo-600">{addProductForm.data.image.name}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-[46px] h-[46px] rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mb-3">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                                </div>
                                                <span className="text-[13px] font-bold text-gray-500">Click to upload product image</span>
                                            </>
                                        )}
                                    </div>
                                    {addProductForm.errors.image && <div className="text-red-500 text-xs mt-1">{addProductForm.errors.image}</div>}
                                </div>

                        </div>

                        {/* Footer buttons */}
                        <div className="mt-10 pt-6 flex justify-end gap-4 border-t border-gray-100">
                            <button 
                                type="button"
                                onClick={() => setView('inventory')}
                                className="px-8 py-3 bg-white border border-[#edf2f7] hover:bg-gray-50 text-gray-500 font-bold rounded-xl text-[14px] transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={addProductForm.processing}
                                className="px-8 py-3 bg-[#4f46e5] shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:bg-indigo-700 text-white font-bold rounded-xl text-[14px] transition-colors flex items-center space-x-2"
                            >
                                {addProductForm.processing ? 'Saving...' : 'Add Item'}
                            </button>
                        </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
