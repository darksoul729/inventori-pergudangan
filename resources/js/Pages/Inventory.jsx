import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage } from '@inertiajs/react';
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
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
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
const ClipboardCheckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);
const WarningIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);
const LocationPinIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const SparkleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

export default function Inventory() {
    const { url } = usePage();
    const [view, setView] = useState('inventory'); // 'inventory', 'outbound', or 'add_new'

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

    return (
        <DashboardLayout 
            headerTitle={view === 'outbound' ? "Record Outbound Movement" : view === 'add_new' ? "Add New Inventory Item" : null}
            headerSearchPlaceholder={view === 'outbound' ? "Search transactions..." : "Search inventory..."}
        >
            <Head title={view === 'outbound' ? "Transaction - Outbound Movement" : view === 'add_new' ? "Add New Inventory Item" : "Inventory Management"} />

            {view === 'inventory' && (
                <div className="flex flex-row gap-6 pb-12 w-full pt-2 min-w-[1000px] overflow-x-auto transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Left Column - Main Content */}
                    <div className="flex-1 flex flex-col space-y-6">
                        
                        {/* Header Row */}
                        <div className="flex justify-between items-center mb-2">
                            <h1 className="text-[28px] font-black text-[#1a202c] tracking-tight">Inventory Management</h1>
                            
                            <div className="flex items-center space-x-4">
                                <button 
                                    onClick={() => setView('outbound')}
                                    className="flex items-center space-x-2 px-6 py-3 border border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-[14px] transition-colors"
                                >
                                    <RegistryIcon className="w-4 h-4 text-gray-400" />
                                    <span>Record Outbound</span>
                                </button>
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
                                    <span className="text-[26px] font-black text-[#1a202c]">12,842</span>
                                    <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded tracking-wide">+4.2%</span>
                                </div>
                            </div>

                            {/* 2. Out of Stock */}
                            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                                <div className="flex items-center space-x-2 mb-3">
                                    <OutOfStockIcon className="w-4 h-4 text-red-400" />
                                    <span className="text-[12px] font-extrabold text-gray-500 tracking-wide">Out of Stock</span>
                                </div>
                                <div className="flex items-baseline space-x-3">
                                    <span className="text-[26px] font-black text-[#1a202c]">14</span>
                                    <span className="text-[10px] font-extrabold text-red-500 bg-red-50 px-1.5 py-0.5 rounded tracking-wide">-12%</span>
                                </div>
                            </div>

                            {/* 3. Low Stock Alerts */}
                            <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                                <div className="flex items-center space-x-2 mb-3">
                                    <WarningIcon className="w-4 h-4 text-amber-500" />
                                    <span className="text-[12px] font-extrabold text-gray-500 tracking-wide">Low Stock Alerts</span>
                                </div>
                                <div className="flex items-baseline space-x-3 mt-1">
                                    <span className="text-[26px] font-black text-[#1a202c] leading-none">86</span>
                                    <span className="text-[9px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded uppercase tracking-wider">Critical</span>
                                </div>
                            </div>

                            {/* 4. Storage Efficiency */}
                            <div className="bg-gradient-to-br from-[#6366f1] to-[#4338ca] rounded-[20px] p-5 shadow-[0_8px_20px_rgba(79,70,229,0.25)] relative overflow-hidden text-white flex flex-col justify-between">
                                <RocketIcon className="w-24 h-24 absolute -right-4 -bottom-4 text-white opacity-10" />
                                <div className="relative z-10 text-[12px] font-bold text-indigo-100/90 tracking-wide mb-2">Storage Efficiency</div>
                                <div className="relative z-10">
                                    <div className="text-[26px] font-black leading-none mb-1.5">94.8%</div>
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
                                    <button className="flex items-center space-x-2 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                        <span>Categories: All</span>
                                        <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
                                    </button>
                                    <button className="flex items-center space-x-2 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                        <span>Location: WH-A1</span>
                                        <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
                                    </button>
                                    <button className="flex items-center space-x-2 bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                        <span>Status: Stocked</span>
                                        <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
                                    </button>
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
                                    {/* Item 1 */}
                                    <div className="grid grid-cols-12 gap-4 py-6 items-center hover:bg-gray-50/50 transition-colors group">
                                        <div className="col-span-5 flex items-center space-x-5 pl-2">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 p-0.5 shadow-sm overflow-hidden flex-shrink-0">
                                                <div className="w-full h-full bg-[#1a202c] rounded-[10px] flex items-center justify-center relative">
                                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-blue-500/20 blur-md"></div>
                                                    <div className="w-8 h-6 bg-cyan-400 rounded-sm shadow-[0_0_10px_rgba(34,211,238,0.4)] border border-cyan-200 z-10"></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[14px] font-black text-[#1a202c] mb-1">Neo-X Compressor v2</div>
                                                <div className="text-[11px] font-bold text-gray-400 tracking-wide">SKU: AX-90021-B</div>
                                            </div>
                                        </div>
                                        <div className="col-span-4 flex flex-col justify-center pr-8">
                                            <div className="flex justify-between items-end mb-1.5">
                                                <span className="text-[11px] font-bold text-[#1a202c]">850 <span className="text-gray-400 font-semibold">/ 1000</span></span>
                                                <span className="text-[11px] font-black text-gray-700">85%</span>
                                            </div>
                                            <div className="w-full h-[5px] bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#4f46e5] rounded-full" style={{width: '85%'}}></div>
                                            </div>
                                        </div>
                                        <div className="col-span-3 flex justify-between items-center pr-2">
                                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">Healthy</span>
                                            <div className="w-5 h-5 rounded-[4px] border-2 border-indigo-200 border-dashed opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                    </div>

                                    {/* Item 2 */}
                                    <div className="grid grid-cols-12 gap-4 py-6 items-center hover:bg-gray-50/50 transition-colors group">
                                        <div className="col-span-5 flex items-center space-x-5 pl-2">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-gray-800 to-gray-600 p-0.5 shadow-sm overflow-hidden flex-shrink-0">
                                                <div className="w-full h-full bg-[#111827] rounded-[10px] flex items-center justify-center">
                                                    <div className="w-8 h-[3px] bg-gray-300 rounded-full rotate-45 border border-gray-400 shadow-sm"></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[14px] font-black text-[#1a202c] mb-1">Titanium Rods (10pk)</div>
                                                <div className="text-[11px] font-bold text-gray-400 tracking-wide">SKU: TR-1102-M</div>
                                            </div>
                                        </div>
                                        <div className="col-span-4 flex flex-col justify-center pr-8">
                                            <div className="flex justify-between items-end mb-1.5">
                                                <span className="text-[11px] font-bold text-[#1a202c]">42 <span className="text-gray-400 font-semibold">/ 500</span></span>
                                                <span className="text-[11px] font-black text-red-500">8%</span>
                                            </div>
                                            <div className="w-full h-[5px] bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-red-500 rounded-full" style={{width: '8%'}}></div>
                                            </div>
                                        </div>
                                        <div className="col-span-3 flex justify-between items-center pr-2">
                                            <span className="bg-red-50 text-red-500 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">Critical</span>
                                            <div className="w-5 h-5 rounded-[4px] border-2 border-indigo-200 border-dashed opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                    </div>

                                    {/* Item 3 */}
                                    <div className="grid grid-cols-12 gap-4 py-6 items-center hover:bg-gray-50/50 transition-colors group">
                                        <div className="col-span-5 flex items-center space-x-5 pl-2">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-sm overflow-hidden flex-shrink-0">
                                                <div className="w-full h-full bg-[#064e3b] rounded-[10px] flex items-center justify-center">
                                                    <div className="w-6 h-6 border-[2px] border-emerald-400 rounded-sm">
                                                        <div className="w-2 h-2 mx-auto mt-[6px] bg-emerald-300 rounded-sm"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[14px] font-black text-[#1a202c] mb-1">Logic Array Controller</div>
                                                <div className="text-[11px] font-bold text-gray-400 tracking-wide">SKU: LA-882-PCB</div>
                                            </div>
                                        </div>
                                        <div className="col-span-4 flex flex-col justify-center pr-8">
                                            <div className="flex justify-between items-end mb-1.5">
                                                <span className="text-[11px] font-bold text-[#1a202c]">120 <span className="text-gray-400 font-semibold">/ 400</span></span>
                                                <span className="text-[11px] font-black text-amber-600">30%</span>
                                            </div>
                                            <div className="w-full h-[5px] bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-amber-600 rounded-full" style={{width: '30%'}}></div>
                                            </div>
                                        </div>
                                        <div className="col-span-3 flex justify-between items-center pr-2">
                                            <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">Low Stock</span>
                                            <div className="w-5 h-5 rounded-[4px] border-2 border-indigo-200 border-dashed opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pagination Footer */}
                            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
                                <span className="text-[13px] font-bold text-gray-500">Showing 3 of 12,842 products</span>
                                <div className="flex space-x-2">
                                    <button className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-xl text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">Prev</button>
                                    <button className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-xl text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">Next</button>
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
                        
                        <div className="flex items-start space-x-4 mb-8">
                            <div className="w-[42px] h-[42px] rounded-xl bg-[#eef2ff] flex items-center justify-center text-[#4f46e5] flex-shrink-0">
                                <RegistryIcon className="w-6 h-6" />
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
                                        <label className="text-[10px] font-extrabold text-gray-500 tracking-wider uppercase">SKU / BARCODE</label>
                                        <button className="text-[11px] font-extrabold text-[#4f46e5] flex items-center space-x-1 hover:text-indigo-700 uppercase tracking-wide">
                                            <ScanIcon className="w-3.5 h-3.5" />
                                            <span>SCAN</span>
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-[#1a202c] shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                            defaultValue="SKU-ETH-7729-LX"
                                        />
                                        <SearchMagnifyIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-[#4f46e5]" />
                                    </div>
                                </div>
                                <div className="flex-[1.2]">
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">PRODUCT NAME</label>
                                    <input 
                                        type="text" 
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                        defaultValue="Industrial Kinetic Bearings - Ge"
                                    />
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">DESTINATION WAREHOUSE</label>
                                    <select className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] appearance-none">
                                        <option>Central Hub - North Port</option>
                                        <option>East Wing - Logistics Bay</option>
                                    </select>
                                </div>
                                <div className="flex-[1.2]">
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">OUTBOUND REASON</label>
                                    <select className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] appearance-none">
                                        <option>Sale</option>
                                        <option>Internal Transfer</option>
                                    </select>
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
                                    <span className="text-[12px] font-medium text-gray-400">Units for transfer</span>
                                </div>
                                <div className="flex items-center space-x-6 bg-white shadow-sm border border-gray-100 rounded-[10px] px-4 py-2">
                                    <button className="text-[#4f46e5] hover:bg-gray-50 p-1 rounded font-black text-lg leading-none transition-colors">−</button>
                                    <span className="font-black text-[18px] text-[#1a202c]">125</span>
                                    <button className="text-[#4f46e5] hover:bg-gray-50 p-1 rounded font-black text-lg leading-none transition-colors">+</button>
                                </div>
                            </div>

                            {/* Row 5: Notes */}
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">NOTES / DESCRIPTION</label>
                                <textarea 
                                    rows="3"
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-medium text-gray-600 placeholder-gray-400 resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                    placeholder="Additional shipping instructions or damage reports..."
                                ></textarea>
                            </div>
                        </div>

                        {/* Footer buttons with select UI artifacts */}
                        <div className="mt-8 pt-6 flex justify-end gap-3 relative border-t border-gray-50">
                            <div className="relative z-10 group cursor-pointer inline-block">
                                <button 
                                    onClick={() => setView('inventory')}
                                    className="px-6 py-3 border border-gray-200 text-[#4f46e5] bg-white font-bold rounded-xl text-[14px] hover:bg-gray-50 transition-colors w-full sm:w-auto h-full m-[1px]"
                                >
                                    Cancel
                                </button>
                            </div>
                            <div className="relative z-10 group cursor-pointer inline-block">
                                <button className="px-8 py-3 bg-[#4f46e5] text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.3)] text-[14px] hover:bg-indigo-700 transition-all flex items-center space-x-2 border-2 border-transparent">
                                    <span>Record Movement</span>
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right Column - Status & Context */}
                    <div className="w-[340px] flex-shrink-0 flex flex-col space-y-6">
                        
                        {/* Inventory Context Card */}
                        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                             <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[11px] font-extrabold text-gray-400 tracking-[0.15em] uppercase">Inventory Context</h3>
                                <ClipboardCheckIcon className="w-5 h-5 text-gray-300" />
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
                        
                        <div className="mb-10">
                            <h2 className="text-[26px] font-black text-[#1a202c]">Add New Inventory Item</h2>
                            <p className="text-[14px] font-bold text-gray-500 mt-1">Register a new product into the Aether Logistix network.</p>
                        </div>

                        <div className="space-y-6">
                            {/* Row 1 */}
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">SKU / BARCODE</label>
                                    <input 
                                        type="text" 
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-5 py-3.5 sm:text-[14px] rounded-xl font-bold text-[#1a202c] shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] placeholder-gray-400" 
                                        placeholder="e.g. AX-2045 Quantum Unit"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">CATEGORY</label>
                                    <div className="relative">
                                        <select className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-5 py-3.5 sm:text-[14px] rounded-xl font-bold text-gray-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] appearance-none cursor-pointer">
                                            <option>Select Category</option>
                                        </select>
                                        <ChevronDownIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">UNIT</label>
                                    <div className="relative">
                                        <select className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-5 py-3.5 sm:text-[14px] rounded-xl font-bold text-gray-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] appearance-none cursor-pointer">
                                            <option>Select Unit</option>
                                        </select>
                                        <ChevronDownIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">SUPPLIER</label>
                                    <div className="relative">
                                        <select className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-5 py-3.5 sm:text-[14px] rounded-xl font-bold text-gray-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] appearance-none cursor-pointer">
                                            <option>Select Supplier</option>
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
                                            type="text" 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full pl-5 pr-12 py-3.5 sm:text-[14px] rounded-xl font-black text-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                            defaultValue="0"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                            <ClipboardCheckIcon className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">UNIT PRICE</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full pl-5 pr-12 py-3.5 sm:text-[14px] rounded-xl font-black text-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                            defaultValue="0.00"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">MINIMUM STOCK</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full pl-5 pr-12 py-3.5 sm:text-[14px] rounded-xl font-black text-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                            defaultValue="10"
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
                                        <select className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full pl-5 pr-12 py-3.5 sm:text-[14px] rounded-xl font-bold text-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] appearance-none cursor-pointer">
                                            <option>Choose Warehouse</option>
                                        </select>
                                        <LocationPinIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">RACK LOCATION</label>
                                    <div className="relative">
                                        <select className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full pl-5 pr-12 py-3.5 sm:text-[14px] rounded-xl font-bold text-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] appearance-none cursor-pointer">
                                            <option>Select Rack</option>
                                        </select>
                                        <svg className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Row 5 */}
                            <div>
                                <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">ITEM DESCRIPTION (OPTIONAL)</label>
                                <textarea 
                                    rows="4"
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-5 py-4 sm:text-[14px] rounded-xl font-bold text-gray-600 placeholder-gray-400 resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                    placeholder="Describe specifications, handling instructions, or storage requirements..."
                                ></textarea>
                            </div>

                            {/* Row 6 */}
                            <div>
                                <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">IMAGE UPLOAD</label>
                                <div className="border-[2px] border-dashed border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-colors p-10 flex flex-col items-center justify-center cursor-pointer">
                                    <div className="w-[46px] h-[46px] rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mb-3">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    </div>
                                    <span className="text-[13px] font-bold text-gray-500">Click to upload or drag and drop</span>
                                </div>
                            </div>

                        </div>

                        {/* Footer buttons */}
                        <div className="mt-10 pt-6 flex justify-end gap-4 border-t border-gray-100">
                            <button 
                                onClick={() => setView('inventory')}
                                className="px-8 py-3 bg-white border border-[#edf2f7] hover:bg-gray-50 text-gray-500 font-bold rounded-xl text-[14px] transition-colors"
                            >
                                Cancel
                            </button>
                            <button className="px-8 py-3 bg-[#4f46e5] shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:bg-indigo-700 text-white font-bold rounded-xl text-[14px] transition-colors">
                                Add Item
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
