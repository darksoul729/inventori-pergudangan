import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import React from 'react';

// === Icons ===
const DownloadIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const ClockIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ShieldCheckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const WarningIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const TrendUpIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const TrendRightIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
);

const TrendDownIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
    </svg>
);

const ExternalLinkIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

const IntelligenceIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
);

const NodeSyncIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const ChevronDownIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
);


export default function Supplier() {
    return (
        <DashboardLayout 
            headerSearchPlaceholder="Search supplier audit trail..."
        >
            <Head title="Supplier Performance" />

            <div className="flex flex-row gap-6 pb-12 w-full pt-2 min-w-[1000px] overflow-x-auto">
                <div className="flex-1 flex flex-col space-y-6">
                    
                    {/* Header Row */}
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <h1 className="text-[28px] font-black text-[#1a202c] tracking-tight">Supplier Performance</h1>
                            <p className="text-[14px] font-bold text-gray-500 mt-1">Holistic health overview and lead time variance across global tier partners.</p>
                        </div>
                        <button className="flex items-center space-x-2 px-6 py-3.5 bg-[#4f46e5] shadow-[#4f46e5]/30 shadow-lg hover:bg-indigo-700 text-white font-bold rounded-xl text-[14px] transition-colors">
                            <DownloadIcon className="w-4 h-4" />
                            <span>Export Audit</span>
                        </button>
                    </div>

                    {/* 3 Stat Cards */}
                    <div className="grid grid-cols-3 gap-6">
                        {/* 1. Avg Lead Time */}
                        <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7] flex items-center space-x-5">
                            <div className="w-12 h-12 rounded-[14px] bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                <ClockIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-[12px] font-bold text-gray-500 tracking-wide mb-0.5">Avg Lead Time</h3>
                                <div className="text-[22px] font-black text-[#1a202c] leading-tight mb-0.5">4.2 Days</div>
                                <div className="flex items-center space-x-1 text-emerald-500 font-bold text-[10px]">
                                    <TrendUpIcon className="w-3 h-3" />
                                    <span>0.5d vs last month</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. On-Time Delivery */}
                        <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7] flex items-center space-x-5">
                            <div className="w-12 h-12 rounded-[14px] bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                                <ShieldCheckIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-[12px] font-bold text-gray-500 tracking-wide mb-0.5">On-Time Delivery</h3>
                                <div className="text-[22px] font-black text-[#1a202c] leading-tight mb-0.5">94.8%</div>
                                <div className="flex items-center space-x-1 text-emerald-500 font-bold text-[10px]">
                                    <TrendUpIcon className="w-3 h-3" />
                                    <span>1.2% increase</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Late Deliveries */}
                        <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7] flex items-center space-x-5">
                            <div className="w-12 h-12 rounded-[14px] bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0">
                                <WarningIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-[12px] font-bold text-gray-500 tracking-wide mb-0.5">Late Deliveries</h3>
                                <div className="text-[22px] font-black text-[#1a202c] leading-tight mb-0.5">12 Units</div>
                                <div className="flex items-center space-x-1 text-red-500 font-bold text-[10px]">
                                    <TrendUpIcon className="w-3 h-3" />
                                    <span>2 units above target</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Correlation Chart */}
                    <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-[18px] font-black text-[#1a202c]">Performance Correlation</h2>
                            <div className="flex items-center space-x-6 text-[12px] font-bold text-gray-500">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                                    <span>Lead Time</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-600"></div>
                                    <span>Variance</span>
                                </div>
                            </div>
                        </div>

                        {/* Bubble Chart Area */}
                        <div className="relative w-full pl-12 pr-4 pb-8 mt-10 mb-2" style={{ height: '280px' }}>
                            {/* The Main Chart Bounding Box with Dots */}
                            <div className="relative w-full h-full border-[1.5px] border-dashed border-gray-200">
                                {/* Dot Grid Background */}
                                <div className="absolute inset-0 z-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1.5px, transparent 1.5px)', backgroundSize: '35px 35px', backgroundPosition: 'left bottom' }}></div>

                                {/* Y-Axis Label (Stacked, Rotated) */}
                                <div className="absolute top-1/2 flex items-center justify-center pointer-events-none" style={{ left: '-40px', transform: 'translateY(-50%) rotate(-90deg)', width: '200px', height: '40px' }}>
                                    <div className="flex flex-col items-center justify-center text-center space-y-1">
                                        <span className="text-[9px] font-black tracking-[0.15em] text-gray-400">SLOW DELIVERY</span>
                                        <span className="text-[9px] font-black tracking-[0.15em] text-gray-400">FAST DELIVERY</span>
                                    </div>
                                </div>

                                {/* X-Axis Labels */}
                                <div className="absolute text-[8px] font-black tracking-[0.15em] text-gray-400 uppercase" style={{ bottom: '-28px', left: '0' }}>
                                    - LOW VARIANCE
                                </div>
                                <div className="absolute text-[8px] font-black tracking-[0.15em] text-gray-400 uppercase" style={{ bottom: '-28px', right: '0' }}>
                                    HIGH VARIANCE -
                                </div>

                                {/* Bubbles */}
                                {/* LC: Fast delivery (bottom), low variance (left) */}
                                <div className="absolute z-20 w-10 h-10 rounded-full bg-indigo-50/80 border-[1px] border-indigo-400 flex items-center justify-center shadow-[0_4px_12px_rgba(99,102,241,0.2)] backdrop-blur-[2px]" style={{ bottom: '75%', left: '15%', transform: 'translate(-50%, 50%)' }}>
                                    <span className="font-extrabold text-[12px] text-indigo-700 tracking-tighter">LC</span>
                                </div>
                                {/* NX: Slightly slower, slightly higher variance */}
                                <div className="absolute z-20 w-10 h-10 rounded-full bg-indigo-50/80 border-[1px] border-indigo-400 flex items-center justify-center shadow-[0_4px_12px_rgba(99,102,241,0.2)] backdrop-blur-[2px]" style={{ bottom: '55%', left: '28%', transform: 'translate(-50%, 50%)' }}>
                                    <span className="font-extrabold text-[12px] text-indigo-700 tracking-tighter">NX</span>
                                </div>
                                {/* SM: Medium delivery, medium variance. Orange. */}
                                <div className="absolute z-20 w-9 h-9 rounded-full bg-amber-50/80 border-[1.5px] border-amber-500 flex items-center justify-center shadow-[0_4px_12px_rgba(217,119,6,0.2)] backdrop-blur-[2px]" style={{ bottom: '35%', left: '45%', transform: 'translate(-50%, 50%)' }}>
                                    <span className="font-extrabold text-[11px] text-amber-800 tracking-tighter">SM</span>
                                </div>
                                {/* GX: Slow delivery (top), High variance (right) */}
                                <div className="absolute z-20 w-11 h-11 rounded-full bg-indigo-50/80 border-[1px] border-indigo-400 flex items-center justify-center shadow-[0_4px_12px_rgba(99,102,241,0.2)] backdrop-blur-[2px]" style={{ bottom: '20%', right: '30%', transform: 'translate(50%, 50%)' }}>
                                    <span className="font-extrabold text-[13px] text-indigo-800 tracking-tighter">GX</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Partner Directory */}
                    <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                        
                        {/* Header Row */}
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-[18px] font-black text-[#1a202c]">Partner Directory</h2>
                            <div className="flex items-center space-x-3">
                                <button className="flex items-center space-x-2 bg-gray-50 border border-gray-100 shadow-sm px-4 py-2 rounded-xl text-[12px] font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                                    <span>All Tiers</span>
                                    <ChevronDownIcon className="w-3.5 h-3.5 text-gray-500" />
                                </button>
                                <button className="flex items-center space-x-2 bg-gray-50 border border-gray-100 shadow-sm px-4 py-2 rounded-xl text-[12px] font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                                    <span>Category</span>
                                    <ChevronDownIcon className="w-3.5 h-3.5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="w-full">
                            {/* Columns */}
                            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-100 text-[10px] font-black text-gray-400 tracking-[0.1em] uppercase">
                                <div className="col-span-4 pl-2">Supplier</div>
                                <div className="col-span-3">Score</div>
                                <div className="col-span-2">Lead Time</div>
                                <div className="col-span-2">Trend</div>
                                <div className="col-span-1 text-right pr-4">Actions</div>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-gray-50/80">
                                
                                {/* Item 1 */}
                                <div className="grid grid-cols-12 gap-4 py-5 items-center hover:bg-gray-50/50 transition-colors">
                                    <div className="col-span-4 flex items-center space-x-4 pl-2">
                                        <div className="w-[42px] h-[42px] rounded-xl bg-indigo-100 text-indigo-700 flex flex-col items-center justify-center font-black text-[14px] flex-shrink-0">
                                            LC
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-black text-[#1a202c] mb-0.5">LogiCorp Solutions</div>
                                            <div className="text-[10px] font-bold text-gray-400">Tier 1 Primary</div>
                                        </div>
                                    </div>
                                    <div className="col-span-3 flex items-center space-x-4">
                                        <div className="flex-1 h-[4px] bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full w-[96%]"></div>
                                        </div>
                                        <span className="text-[14px] font-black text-[#1a202c]">96</span>
                                    </div>
                                    <div className="col-span-2 flex flex-col justify-center">
                                        <span className="text-[14px] font-black text-[#1a202c]">2.1</span>
                                        <span className="text-[11px] font-bold text-gray-500">Days</span>
                                    </div>
                                    <div className="col-span-2 flex justify-start pl-2">
                                        <TrendUpIcon className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div className="col-span-1 flex justify-end pr-4">
                                        <button className="w-8 h-8 flex items-center justify-center text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors">
                                            <ExternalLinkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Item 2 */}
                                <div className="grid grid-cols-12 gap-4 py-5 items-center hover:bg-gray-50/50 transition-colors">
                                    <div className="col-span-4 flex items-center space-x-4 pl-2">
                                        <div className="w-[42px] h-[42px] rounded-xl bg-indigo-600 text-white flex flex-col items-center justify-center font-black text-[14px] flex-shrink-0">
                                            NX
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-black text-[#1a202c] mb-0.5">Nexus Logistics</div>
                                            <div className="text-[10px] font-bold text-gray-400">Global Distributor</div>
                                        </div>
                                    </div>
                                    <div className="col-span-3 flex items-center space-x-4">
                                        <div className="flex-1 h-[4px] bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500 rounded-full w-[78%]"></div>
                                        </div>
                                        <span className="text-[14px] font-black text-[#1a202c]">78</span>
                                    </div>
                                    <div className="col-span-2 flex flex-col justify-center">
                                        <span className="text-[14px] font-black text-[#1a202c]">3.4</span>
                                        <span className="text-[11px] font-bold text-gray-500">Days</span>
                                    </div>
                                    <div className="col-span-2 flex justify-start pl-2">
                                        <TrendRightIcon className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div className="col-span-1 flex justify-end pr-4">
                                        <button className="w-8 h-8 flex items-center justify-center text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors">
                                            <ExternalLinkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Item 3 */}
                                <div className="grid grid-cols-12 gap-4 py-5 items-center hover:bg-gray-50/50 transition-colors">
                                    <div className="col-span-4 flex items-center space-x-4 pl-2">
                                        <div className="w-[42px] h-[42px] rounded-xl bg-orange-100 text-orange-600 flex flex-col items-center justify-center font-black text-[14px] flex-shrink-0">
                                            SM
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-black text-[#1a202c] mb-0.5">SwiftMv Express</div>
                                            <div className="text-[10px] font-bold text-gray-400">Last Mile Specialist</div>
                                        </div>
                                    </div>
                                    <div className="col-span-3 flex items-center space-x-4">
                                        <div className="flex-1 h-[4px] bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 rounded-full w-[62%]"></div>
                                        </div>
                                        <span className="text-[14px] font-black text-[#1a202c]">62</span>
                                    </div>
                                    <div className="col-span-2 flex flex-col justify-center">
                                        <span className="text-[14px] font-black text-[#1a202c]">4.8</span>
                                        <span className="text-[11px] font-bold text-gray-500">Days</span>
                                    </div>
                                    <div className="col-span-2 flex justify-start pl-2">
                                        <TrendDownIcon className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div className="col-span-1 flex justify-end pr-4">
                                        <button className="w-8 h-8 flex items-center justify-center text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors">
                                            <ExternalLinkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

                {/* Right Column - Status & Context */}
                <div className="w-[340px] flex-shrink-0 flex flex-col space-y-6">
                    
                    {/* Intelligence Hub */}
                    <div className="bg-[#f8f9fb] rounded-[24px] p-6 border border-[#edf2f7]">
                        
                        {/* Header */}
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm flex-shrink-0">
                                <IntelligenceIcon className="w-4 h-4" />
                            </div>
                            <h2 className="text-[16px] font-black text-[#1a202c]">Intelligence Hub</h2>
                        </div>

                        {/* Red Risk Detected */}
                        <div className="mb-6">
                            <div className="flex items-center space-x-2 mb-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                <h4 className="text-[10px] font-black text-red-600 tracking-widest uppercase">Risk Detected</h4>
                            </div>
                            
                            <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 p-5 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-red-500 rounded-l-[16px]"></div>
                                <h5 className="text-[14px] font-black text-[#1a202c] mb-2 leading-tight">Lead Time Drift</h5>
                                <p className="text-[12px] font-semibold text-gray-500 leading-relaxed mb-4">
                                    SwiftMv has shown a <span className="font-extrabold text-red-500">+1.2d</span> lead time deviation over 5 consecutive shipments.
                                </p>
                                <div className="flex items-center space-x-3">
                                    <button className="px-4 py-2 bg-red-50 text-red-600 text-[11px] font-bold rounded-lg hover:bg-red-100 transition-colors">Raise Alert</button>
                                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-[11px] font-bold rounded-lg hover:bg-gray-50 shadow-sm transition-colors">View Shipments</button>
                                </div>
                            </div>
                        </div>

                        {/* Orange Optimization Hint */}
                        <div className="mb-6">
                            <div className="flex items-center space-x-2 mb-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
                                <h4 className="text-[10px] font-black text-amber-600 tracking-widest uppercase">Optimization Hint</h4>
                            </div>
                            
                            <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 p-5 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#92400e] rounded-l-[16px]"></div>
                                <h5 className="text-[14px] font-black text-[#1a202c] mb-2 leading-tight">Nexus Consolidation</h5>
                                <p className="text-[12px] font-semibold text-gray-500 leading-relaxed mb-4">
                                    Merging regional Nexus orders could reduce logistics overhead by <span className="font-extrabold text-[#92400e]">14.2%</span> annually.
                                </p>
                                <button className="w-full py-2.5 bg-[#92400e] text-white text-[12px] font-bold rounded-lg hover:bg-[#78350f] transition-colors shadow-sm">
                                    Review Opportunity
                                </button>
                            </div>
                        </div>

                        {/* API Sync Status */}
                        <div className="bg-white rounded-xl py-3.5 px-4 shadow-sm border border-gray-100 flex justify-between items-center mt-2">
                             <div className="flex items-center space-x-3">
                                 <NodeSyncIcon className="w-5 h-5 text-gray-400" />
                                 <span className="text-[12px] font-bold text-[#1a202c]">API Sync Status</span>
                             </div>
                             <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded shadow-sm tracking-widest uppercase">Live</span>
                        </div>
                    </div>

                    {/* Inventory Ribbon */}
                    <div className="bg-white rounded-[24px] p-6 border border-[#edf2f7] shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
                        <h4 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-4">Inventory Ribbon</h4>
                        
                        <div className="flex space-x-3">
                            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl py-3 flex flex-col items-center justify-center shadow-sm">
                                <span className="text-[10px] font-bold text-gray-400 mb-1">Inbound</span>
                                <span className="text-[16px] font-black text-[#1a202c]">1,240</span>
                            </div>
                            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl py-3 flex flex-col items-center justify-center shadow-sm">
                                <span className="text-[10px] font-bold text-gray-400 mb-1">Transit</span>
                                <span className="text-[16px] font-black text-[#1a202c]">842</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </DashboardLayout>
    );
}
