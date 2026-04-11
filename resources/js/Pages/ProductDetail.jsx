import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';

// Icons
const TrendUpIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const VelocityIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const DownloadIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const PhotoPlaceholder = () => (
    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-900 to-[#1e1b4b] shadow-[0_8px_20px_rgba(49,46,129,0.3)] flex items-center justify-center p-0.5 overflow-hidden flex-shrink-0 relative">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-blue-500/20 blur-md focus:outline-none"></div>
        {/* Abstract 3D shape for Lithium Core */}
        <div className="relative w-12 h-14 bg-[#312e81] border-2 border-indigo-400 rounded-sm flex items-center justify-center shadow-inner">
            <div className="w-8 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
            <div className="absolute -top-1 w-6 h-1.5 bg-indigo-300 rounded-sm"></div>
            <div className="absolute -bottom-1 w-6 h-1.5 bg-indigo-300 rounded-sm"></div>
            {/* Dots */}
            <div className="absolute left-2 top-2 w-1.5 h-1.5 rounded-full bg-cyan-300"></div>
            <div className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
            <div className="absolute left-2 bottom-2 w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
            <div className="absolute right-2 bottom-2 w-1.5 h-1.5 rounded-full bg-cyan-300"></div>
        </div>
    </div>
);

export default function ProductDetail() {
    return (
        <DashboardLayout>
            <Head title="Lithium Core S9 - Product Detail" />

            <div className="pt-2 pb-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                
                {/* Header Section */}
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center space-x-6">
                        <PhotoPlaceholder />
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="px-3 py-1 bg-[#f1f5f9] text-gray-600 text-[10px] font-black tracking-widest rounded-lg uppercase">SKU: ATH-L-992</span>
                                <span className="px-3 py-1 bg-[#eef2ff] text-[#4f46e5] text-[10px] font-black tracking-widest rounded-lg uppercase">ELECTRONICS</span>
                            </div>
                            <h1 className="text-[32px] font-black text-[#1a202c] leading-none mb-2 tracking-tight">Lithium Core S9</h1>
                            <div className="flex items-center space-x-1.5">
                                <div className="w-2 h-2 rounded-full bg-[#4f46e5] shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
                                <span className="text-[13px] font-bold text-[#4f46e5]">Optimal Stock Level</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 mt-4">
                        <button className="px-6 py-2.5 bg-white border border-[#edf2f7] hover:bg-gray-50 text-gray-600 font-bold rounded-xl text-[13px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors">
                            Edit Details
                        </button>
                        <button className="px-6 py-2.5 bg-[#4f46e5] shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:bg-indigo-700 text-white font-bold rounded-xl text-[13px] transition-colors">
                            Reorder SKU
                        </button>
                    </div>
                </div>

                {/* 3 Top Stat Cards */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-[24px] p-7 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                        <div className="text-[11px] font-extrabold text-gray-400 tracking-widest uppercase mb-3">TOTAL INVENTORY</div>
                        <div className="flex items-baseline space-x-1.5 mb-4">
                            <span className="text-[36px] font-black text-[#1a202c] leading-none">1,248</span>
                            <span className="text-[14px] font-bold text-gray-400">Units</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[#4f46e5]">
                            <TrendUpIcon className="w-4 h-4" />
                            <span className="text-[12px] font-bold">+12% from last month</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-[24px] p-7 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                        <div className="text-[11px] font-extrabold text-gray-400 tracking-widest uppercase mb-3">UNIT PRICE</div>
                        <div className="flex items-baseline space-x-1.5 mb-4">
                            <span className="text-[36px] font-black text-[#1a202c] leading-none">$1,240</span>
                            <span className="text-[14px] font-bold text-gray-400">USD</span>
                        </div>
                        <div className="text-[12px] font-bold text-gray-500 italic">
                            Fixed contractual pricing
                        </div>
                    </div>
                    <div className="bg-white rounded-[24px] p-7 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                        <div className="text-[11px] font-extrabold text-gray-400 tracking-widest uppercase mb-3">AVERAGE STAY</div>
                        <div className="flex items-baseline space-x-1.5 mb-4">
                            <span className="text-[36px] font-black text-[#1a202c] leading-none">14.2</span>
                            <span className="text-[14px] font-bold text-gray-400">Days</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-500">
                            <VelocityIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-[12px] font-bold">Velocity: High</span>
                        </div>
                    </div>
                </div>

                {/* 2 Middle Cards */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Warehouse Distribution Mapping Visual */}
                    <div className="bg-white rounded-[24px] p-7 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[16px] font-black text-[#1a202c]">Warehouse Distribution</h3>
                            <span className="px-3 py-1 bg-[#f8f9fb] text-gray-600 border border-gray-100 text-[10px] font-bold rounded-lg tracking-wide">Node Alpha</span>
                        </div>
                        <div className="w-full bg-[#f8f9fb] h-[280px] rounded-2xl relative overflow-hidden flex items-center justify-center border border-gray-100">
                            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#1a202c_1px,transparent_1px)] [background-size:16px_16px]"></div>
                            
                            {/* Watermark */}
                            <div className="absolute bottom-6 text-[32px] font-black text-gray-200/40 select-none">300x300</div>
                            
                            {/* Visual Boxes overlapping */}
                            <div className="relative w-full max-w-[320px] h-full flex items-center justify-center -ml-12">
                                {/* Zone A Box */}
                                <div className="absolute z-10 w-[160px] h-[160px] bg-[#eef2ff]/80 backdrop-blur-sm border-2 border-[#818cf8] rounded-[10px] shadow-[0_8px_30px_rgba(99,102,241,0.15)] flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-black text-[#4f46e5] tracking-widest uppercase mb-1">ZONE A</span>
                                    <span className="text-[24px] font-black text-[#1a202c]">582</span>
                                </div>
                                {/* Zone C Box */}
                                <div className="absolute z-20 w-[120px] h-[140px] bg-[#fff7ed]/80 backdrop-blur-sm border-2 border-[#fdba74] rounded-[10px] shadow-[0_8px_30px_rgba(249,115,22,0.1)] flex flex-col items-center justify-center translate-x-[90px] translate-y-[30px]">
                                    <span className="text-[10px] font-black text-[#ea580c] tracking-widest uppercase mb-1">ZONE C</span>
                                    <span className="text-[22px] font-black text-[#1a202c]">352</span>
                                </div>
                                {/* A faded box behind to match visual */}
                                <div className="absolute z-0 w-[100px] h-[60px] bg-[#f8fafc]/80 border-2 border-[#cbd5e1] rounded-[8px] translate-x-[20px] translate-y-[90px]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Stock Velocity 30d Bar Chart */}
                    <div className="bg-white rounded-[24px] p-7 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7] flex flex-col">
                        <div className="mb-8">
                            <h3 className="text-[16px] font-black text-[#1a202c]">Stock Velocity (30d)</h3>
                        </div>
                        
                        {/* Bar Chart Area */}
                        <div className="flex-1 flex items-end justify-between px-4 pb-6 border-b border-gray-100">
                            {/* WK 1 */}
                            <div className="flex flex-col items-center space-y-4 w-12">
                                <div className="w-full h-[180px] flex flex-col justify-end space-y-1">
                                    <div className="w-full bg-[#818cf8] opacity-60 rounded-t-sm transition-all" style={{height: '35%'}}></div>
                                    <div className="w-full bg-[#4338ca] rounded-b-sm transition-all" style={{height: '25%'}}></div>
                                </div>
                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">WK 1</span>
                            </div>
                            
                            {/* WK 2 */}
                            <div className="flex flex-col items-center space-y-4 w-12">
                                <div className="w-full h-[180px] flex flex-col justify-end space-y-1">
                                    <div className="w-full bg-[#818cf8] opacity-60 rounded-t-sm transition-all" style={{height: '20%'}}></div>
                                    <div className="w-full bg-[#4338ca] rounded-b-sm transition-all" style={{height: '45%'}}></div>
                                </div>
                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">WK 2</span>
                            </div>
                            
                            {/* WK 3 */}
                            <div className="flex flex-col items-center space-y-4 w-12">
                                <div className="w-full h-[180px] flex flex-col justify-end space-y-1">
                                    <div className="w-full bg-[#818cf8] opacity-60 rounded-t-sm transition-all" style={{height: '40%'}}></div>
                                    <div className="w-full bg-[#4338ca] rounded-b-sm transition-all" style={{height: '30%'}}></div>
                                </div>
                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">WK 3</span>
                            </div>
                            
                            {/* WK 4 */}
                            <div className="flex flex-col items-center space-y-4 w-12">
                                <div className="w-full h-[180px] flex flex-col justify-end space-y-1">
                                    <div className="w-full bg-[#f8fafc]/50 rounded-t-sm mb-1" style={{height: '15%'}}></div>
                                    <div className="w-full bg-[#818cf8] opacity-60 rounded-t-sm transition-all" style={{height: '35%'}}></div>
                                    <div className="w-full bg-[#4338ca] rounded-b-sm transition-all" style={{height: '50%'}}></div>
                                </div>
                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">WK 4</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center mt-6 space-x-16 px-4 pb-2">
                            <div>
                                <div className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-[#818cf8] mr-2"></div>
                                    INBOUND
                                </div>
                                <div className="text-[16px] font-black text-[#1a202c]">428 Units</div>
                            </div>
                            <div>
                                <div className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-[#4338ca] mr-2"></div>
                                    OUTBOUND
                                </div>
                                <div className="text-[16px] font-black text-[#1a202c]">392 Units</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Bottom Section */}
                <div className="bg-white rounded-[24px] overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                    <div className="flex justify-between items-center p-8 border-b border-gray-100">
                        <h3 className="text-[16px] font-black text-[#1a202c]">Recent Movement Log</h3>
                        <button className="flex items-center space-x-2 text-[12px] font-black text-[#4f46e5] hover:text-indigo-700 transition-colors">
                            <span>Export Full Log</span>
                            <DownloadIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.1em] uppercase">DATE & TIME</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.1em] uppercase">TRANSACTION TYPE</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.1em] uppercase">QUANTITY</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.1em] uppercase">WAREHOUSE ZONE</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.1em] uppercase">OPERATOR</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.1em] uppercase text-right">STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="text-[13px] font-black text-[#1a202c]">Oct 24, 2023</div>
                                        <div className="text-[11px] font-bold text-gray-400 mt-1">14:32:01 UTC</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-[13px] font-bold text-[#1a202c]">Inbound Restock</div>
                                        <div className="text-[11px] font-semibold text-gray-400 mt-1">PO-88219-L</div>
                                    </td>
                                    <td className="px-8 py-6 text-[14px] font-black text-[#10b981]">+ 400</td>
                                    <td className="px-8 py-6 text-[13px] font-bold text-gray-600">Zone A-12</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-black">AS</div>
                                            <span className="text-[13px] font-bold text-gray-600">Automated Sys</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">Completed</span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="text-[13px] font-black text-[#1a202c]">Oct 21, 2023</div>
                                        <div className="text-[11px] font-bold text-gray-400 mt-1">08:15:44 UTC</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-[13px] font-bold text-[#1a202c]">Outbound Delivery</div>
                                        <div className="text-[11px] font-semibold text-gray-400 mt-1">INV-9921-X</div>
                                    </td>
                                    <td className="px-8 py-6 text-[14px] font-black text-[#ef4444]">- 150</td>
                                    <td className="px-8 py-6 text-[13px] font-bold text-gray-600">Zone C-04</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-[10px] font-black">MR</div>
                                            <span className="text-[13px] font-bold text-gray-600">M. Rostova</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">Completed</span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="text-[13px] font-black text-[#1a202c]">Oct 18, 2023</div>
                                        <div className="text-[11px] font-bold text-gray-400 mt-1">11:05:22 UTC</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-[13px] font-bold text-[#1a202c]">Zone Transfer</div>
                                        <div className="text-[11px] font-semibold text-gray-400 mt-1">INTERNAL</div>
                                    </td>
                                    <td className="px-8 py-6 text-[14px] font-black text-gray-500">0</td>
                                    <td className="px-8 py-6 text-[13px] font-bold text-gray-600">Zone C &rarr; Zone A</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-[10px] font-black">JL</div>
                                            <span className="text-[13px] font-bold text-gray-600">J. Lin</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">Verified</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
