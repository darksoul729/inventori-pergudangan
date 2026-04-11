import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

// Icons
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

const ShieldCheckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const FilterIcon2 = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
);

const CheckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);

const ArrowUpRightIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
    </svg>
);

const AIAuditIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);


export default function Transaction() {
    return (
        <DashboardLayout 
            headerSearchPlaceholder="Search transactions, assets, or logs..."
        >
            <Head title="Transaction Ledger" />

            <div className="flex flex-row gap-8 pb-12 w-full pt-4 min-w-[1000px] overflow-x-auto">
                {/* Left Column - Main Content */}
                <div className="flex-1 flex flex-col space-y-8">
                    
                    {/* Header */}
                    <div>
                        <h1 className="text-[26px] font-black text-[#1a202c] tracking-tight mb-1">Transaction Ledger</h1>
                        <p className="text-[14px] font-bold text-gray-400">Real-time immutable movement log across global nodes.</p>
                    </div>

                    {/* 3 Metric Cards */}
                    <div className="grid grid-cols-3 gap-6">
                        {/* 1. Inbound Units */}
                        <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#edf2f7] relative overflow-hidden">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-600"></div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <InboundIcon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md tracking-wider">+12.4%</span>
                            </div>
                            <div>
                                <h3 className="text-[12px] font-extrabold text-gray-500 mb-1">Inbound Units (24h)</h3>
                                <div className="text-[28px] font-black text-[#1a202c]">42,890</div>
                            </div>
                        </div>

                        {/* 2. Outbound Units */}
                        <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#edf2f7] relative overflow-hidden">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500"></div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                    <OutboundIcon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md tracking-wider">+4.1%</span>
                            </div>
                            <div>
                                <h3 className="text-[12px] font-extrabold text-gray-500 mb-1">Outbound Units (24h)</h3>
                                <div className="text-[28px] font-black text-[#1a202c]">38,122</div>
                            </div>
                        </div>

                        {/* 3. Pending Audits */}
                        <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#edf2f7] relative overflow-hidden">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-500"></div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                                        <ShieldCheckIcon className="w-5 h-5" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white"></div>
                                </div>
                                <span className="text-[10px] font-black text-amber-600 tracking-wider">High Priority</span>
                            </div>
                            <div>
                                <h3 className="text-[12px] font-extrabold text-gray-500 mb-1">Pending Audits</h3>
                                <div className="text-[28px] font-black text-[#1a202c]">14</div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#edf2f7] flex-1">
                        
                        {/* Table Header Row */}
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-[18px] font-black text-[#1a202c]">Recent Movements</h2>
                            <div className="flex items-center space-x-3">
                                <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl text-[13px] hover:bg-gray-50 shadow-sm transition-colors">
                                    Export CSV
                                </button>
                                <button className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 font-black rounded-xl text-[13px] hover:bg-indigo-100 transition-colors">
                                    <FilterIcon2 className="w-4 h-4" />
                                    <span>Filter</span>
                                </button>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="w-full">
                            {/* Columns */}
                            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-100 text-[9px] font-black text-gray-400 tracking-widest uppercase">
                                <div className="col-span-3">Transaction ID</div>
                                <div className="col-span-2">Type</div>
                                <div className="col-span-3">Timestamp</div>
                                <div className="col-span-1 text-center">Location</div>
                                <div className="col-span-1 text-right">Qty</div>
                                <div className="col-span-2 text-right">Status</div>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-gray-50">
                                
                                {/* Row 1 */}
                                <div className="grid grid-cols-12 gap-4 py-5 items-center hover:bg-gray-50/50 transition-colors">
                                    <div className="col-span-3">
                                        <span className="text-[13px] font-black text-[#4f46e5]">TX-882910-B</span>
                                    </div>
                                    <div className="col-span-2 flex items-center space-x-2">
                                        <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-[13px] font-bold text-[#1a202c]">Inbound</span>
                                    </div>
                                    <div className="col-span-3 flex flex-col justify-center">
                                        <span className="text-[12px] font-bold text-gray-500">14:22:05 - Oct 24</span>
                                    </div>
                                    <div className="col-span-1 flex items-center justify-center">
                                        <span className="text-[9px] font-black text-gray-500 bg-gray-100 px-2 py-1 rounded tracking-wider uppercase">DOCK-04A</span>
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <span className="text-[14px] font-black text-[#1a202c]">1,250</span>
                                    </div>
                                    <div className="col-span-2 text-right flex justify-end">
                                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">Verified</span>
                                    </div>
                                </div>

                                {/* Row 2 */}
                                <div className="grid grid-cols-12 gap-4 py-5 items-center hover:bg-gray-50/50 transition-colors">
                                    <div className="col-span-3">
                                        <span className="text-[13px] font-black text-[#4f46e5]">TX-882911-S</span>
                                    </div>
                                    <div className="col-span-2 flex items-center space-x-2">
                                        <ArrowUpRightIcon className="w-4 h-4 text-indigo-500" />
                                        <span className="text-[13px] font-bold text-[#1a202c]">Outbound</span>
                                    </div>
                                    <div className="col-span-3 flex flex-col justify-center">
                                        <span className="text-[12px] font-bold text-gray-500">14:18:12 - Oct 24</span>
                                    </div>
                                    <div className="col-span-1 flex items-center justify-center">
                                        <span className="text-[9px] font-black text-gray-500 bg-gray-100 px-2 py-1 rounded tracking-wider uppercase">RACK-B12</span>
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <span className="text-[14px] font-black text-[#1a202c]">450</span>
                                    </div>
                                    <div className="col-span-2 text-right flex justify-end">
                                        <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">Pending</span>
                                    </div>
                                </div>

                                {/* Row 3 */}
                                <div className="grid grid-cols-12 gap-4 py-5 items-center hover:bg-gray-50/50 transition-colors">
                                    <div className="col-span-3">
                                        <span className="text-[13px] font-black text-[#4f46e5]">TX-882912-X</span>
                                    </div>
                                    <div className="col-span-2 flex items-center space-x-2">
                                        <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-[13px] font-bold text-[#1a202c]">Inbound</span>
                                    </div>
                                    <div className="col-span-3 flex flex-col justify-center">
                                        <span className="text-[12px] font-bold text-gray-500">14:05:33 - Oct 24</span>
                                    </div>
                                    <div className="col-span-1 flex items-center justify-center">
                                        <span className="text-[9px] font-black text-gray-500 bg-gray-100 px-2 py-1 rounded tracking-wider uppercase">DOCK-02C</span>
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <span className="text-[14px] font-black text-[#1a202c]">89</span>
                                    </div>
                                    <div className="col-span-2 text-right flex justify-end">
                                        <span className="bg-red-50 text-red-500 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">Flagged</span>
                                    </div>
                                </div>

                                {/* Row 4 */}
                                <div className="grid grid-cols-12 gap-4 py-5 items-center hover:bg-gray-50/50 transition-colors">
                                    <div className="col-span-3">
                                        <span className="text-[13px] font-black text-[#4f46e5]">TX-882913-B</span>
                                    </div>
                                    <div className="col-span-2 flex items-center space-x-2">
                                        <ArrowUpRightIcon className="w-4 h-4 text-indigo-500" />
                                        <span className="text-[13px] font-bold text-[#1a202c]">Outbound</span>
                                    </div>
                                    <div className="col-span-3 flex flex-col justify-center">
                                        <span className="text-[12px] font-bold text-gray-500">13:58:10 - Oct 24</span>
                                    </div>
                                    <div className="col-span-1 flex items-center justify-center">
                                        <span className="text-[9px] font-black text-gray-500 bg-gray-100 px-2 py-1 rounded tracking-wider uppercase">ZONE-ALPHA</span>
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <span className="text-[14px] font-black text-[#1a202c]">2,100</span>
                                    </div>
                                    <div className="col-span-2 text-right flex justify-end">
                                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">Verified</span>
                                    </div>
                                </div>

                                {/* Row 5 */}
                                <div className="grid grid-cols-12 gap-4 py-5 items-center hover:bg-gray-50/50 transition-colors">
                                    <div className="col-span-3">
                                        <span className="text-[13px] font-black text-[#4f46e5]">TX-882914-A</span>
                                    </div>
                                    <div className="col-span-2 flex items-center space-x-2">
                                        <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-[13px] font-bold text-[#1a202c]">Inbound</span>
                                    </div>
                                    <div className="col-span-3 flex flex-col justify-center">
                                        <span className="text-[12px] font-bold text-gray-500">13:42:22 - Oct 24</span>
                                    </div>
                                    <div className="col-span-1 flex items-center justify-center">
                                        <span className="text-[9px] font-black text-gray-500 bg-gray-100 px-2 py-1 rounded tracking-wider uppercase">DOCK-04A</span>
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <span className="text-[14px] font-black text-[#1a202c]">620</span>
                                    </div>
                                    <div className="col-span-2 text-right flex justify-end">
                                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">Verified</span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column - Status & Context */}
                <div className="w-[360px] flex-shrink-0 flex flex-col space-y-6">
                    
                    {/* AI Audit Pulse Card */}
                    <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#edf2f7] overflow-hidden flex flex-col">
                        
                        {/* Card Header */}
                        <div className="p-6 pb-4 flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(79,70,229,0.4)]">
                                <AIAuditIcon className="w-4 h-4" />
                            </div>
                            <h2 className="text-[16px] font-black text-[#1a202c]">AI Audit Pulse</h2>
                        </div>

                        {/* List of Alerts */}
                        <div className="px-6 pb-6 space-y-4">
                            
                            {/* Alert 1 */}
                            <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 p-4 border-l-4 border-l-red-500 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-[13px] font-bold text-[#1a202c] max-w-[70%] leading-tight">Weight Variance Detected</h4>
                                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Critical</span>
                                </div>
                                <p className="text-[11.5px] font-semibold text-gray-500 leading-relaxed mb-3">
                                    Unit ID #CN-772 at Dock 04 shows 3.2% deviation from manifest.
                                </p>
                                <div className="flex space-x-4">
                                    <button className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 transition-colors">Verify Weight</button>
                                    <button className="text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors">Ignore</button>
                                </div>
                            </div>

                            {/* Alert 2 */}
                            <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 p-4 border-l-4 border-l-amber-500 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-[13px] font-bold text-[#1a202c] max-w-[70%] leading-tight">Identity Match Failed</h4>
                                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Warning</span>
                                </div>
                                <p className="text-[11.5px] font-semibold text-gray-500 leading-relaxed">
                                    Carrier facial biometric mismatch at Entry Gate 2. Driver re-auth required.
                                </p>
                            </div>

                            {/* Alert 3 */}
                            <div className="bg-indigo-50 rounded-xl shadow-sm border border-indigo-100 p-4 border-l-4 border-l-indigo-500 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-[13px] font-bold text-[#1a202c] max-w-[70%] leading-tight">Throughput Optimization</h4>
                                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">AI Tip</span>
                                </div>
                                <p className="text-[11.5px] font-semibold text-gray-500 leading-relaxed">
                                    Diverting TX-882 to Rack-C will reduce travel time by 14%.
                                </p>
                            </div>

                            {/* Alert 4 */}
                            <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 p-4 border-l-4 border-l-emerald-500 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-[13px] font-bold text-[#1a202c] max-w-[70%] leading-tight">Audit Completion</h4>
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Success</span>
                                </div>
                                <p className="text-[11.5px] font-semibold text-gray-500 leading-relaxed">
                                    Daily immutable hash generated for Node 44-X. Ledger synchronized.
                                </p>
                            </div>

                        </div>

                        {/* Card Footer Button */}
                        <div className="px-6 pb-6 mt-auto">
                            <button className="w-full py-3.5 bg-white border border-gray-200 rounded-xl text-[13px] font-black text-gray-600 hover:bg-gray-50 hover:text-[#1a202c] shadow-sm transition-all focus:outline-none">
                                View Full History Log
                            </button>
                        </div>
                    </div>

                    {/* Live Node Connectivity */}
                    <div className="bg-gradient-to-br from-gray-200 via-gray-100 to-gray-50 rounded-[24px] p-6 shadow-md border border-white/50 relative overflow-hidden h-[130px]">
                        {/* Decorative dark gradient glow at the bottom */}
                        <div className="absolute inset-x-0 bottom-0 h-[60px] bg-gradient-to-t from-gray-300 to-transparent opacity-50"></div>
                        
                        <div className="relative z-10 flex items-center space-x-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                            <span className="text-[13px] font-black text-gray-700">Live Node Connectivity</span>
                        </div>

                        <div className="relative z-10 bg-white/70 backdrop-blur-md border border-white/80 rounded-xl px-5 py-3 flex justify-between items-center shadow-sm">
                            <span className="text-[11.5px] font-black text-gray-600">Active Sensors</span>
                            <span className="text-[16px] font-black text-indigo-500 tracking-wide">1,204 / 1,205</span>
                        </div>
                    </div>

                </div>

            </div>
        </DashboardLayout>
    );
}
