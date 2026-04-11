import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';

// Icons
const ActivityIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const FilterIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
);

const ConveyorIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="10" width="20" height="4" rx="2" strokeWidth={2} />
        <circle cx="6" cy="12" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <circle cx="18" cy="12" r="1" fill="currentColor" />
        <path strokeLinecap="round" strokeWidth={2} d="M4 14v4M20 14v4" />
    </svg>
);

const SortIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={2} />
    </svg>
);

const ForkliftIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 14v4h16m-8-8v8m-4-6h-4" />
        <circle cx="8" cy="18" r="2.5" />
        <circle cx="16" cy="18" r="2.5" />
    </svg>
);

const ThermometerIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19c-1.1 0-2-.9-2-2a2 2 0 01.5-1.32l1.5-2.08V6a2 2 0 114 0v7.6l1.5 2.08a2 2 0 01.5 1.32c0 1.1-.9 2-2 2H9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2" />
    </svg>
);

const HumidityIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg> // Actually water drop is better for humidity
);

const WaterDropIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c-1.5 2-4 5.5-4 9a4 4 0 108 0c0-3.5-2.5-7-4-9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
);

export default function Warehouse() {
    return (
        <DashboardLayout>
            <Head title="Warehouse Operational Detail" />
            
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-[26px] font-black text-[#1a202c] tracking-tight">Warehouse Operational Detail</h1>
                    <p className="text-[14px] font-semibold text-gray-500 mt-1">Physical assets and zoning status for Central Hub A</p>
                </div>
                <div className="flex space-x-3.5">
                    <button className="px-5 py-2.5 bg-white border border-[#edf2f7] text-[#1a202c] text-[12px] font-bold rounded-[10px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:bg-gray-50 transition-colors">Physical Audit</button>
                    <button className="px-5 py-2.5 bg-[#4338ca] text-white text-[12px] font-bold rounded-[10px] shadow-[0_4px_12px_rgba(67,56,202,0.2)] hover:bg-[#3730a3] transition-colors flex items-center space-x-2">
                        <ActivityIcon className="w-4 h-4" />
                        <span>Real-time Sensors</span>
                    </button>
                </div>
            </div>

            {/* Top Stat Zones */}
            <div className="grid grid-cols-5 gap-5 mb-8">
                {/* Zone A */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7] flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[13px] font-black text-[#4338ca] uppercase tracking-wide">ZONE A</span>
                        <span className="px-2.5 py-1 bg-[#eef2ff] text-[#4338ca] text-[9.5px] font-black rounded-lg tracking-wide uppercase">High-Pick</span>
                    </div>
                    <div>
                        <div className="text-[32px] font-black text-[#1a202c] leading-none mb-2">92%</div>
                        <div className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-4 uppercase">2,480 / 2,700 PALLETS</div>
                        <div className="w-full h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                            <div className="h-full bg-[#4338ca] rounded-full" style={{ width: '92%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Zone B */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7] flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[13px] font-black text-[#1a202c] uppercase tracking-wide">ZONE B</span>
                        <span className="px-2.5 py-1 bg-[#f1f5f9] text-gray-500 text-[9.5px] font-black rounded-lg tracking-wide uppercase">Bulk Storage</span>
                    </div>
                    <div>
                        <div className="text-[32px] font-black text-[#1a202c] leading-none mb-2">45%</div>
                        <div className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-4 uppercase">1,125 / 2,500 PALLETS</div>
                        <div className="w-full h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                            <div className="h-full bg-[#93c5fd] rounded-full" style={{ width: '45%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Zone C */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7] flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[13px] font-black text-[#1a202c] uppercase tracking-wide">ZONE C</span>
                        <span className="px-2.5 py-1 bg-[#f1f5f9] text-gray-500 text-[9.5px] font-black rounded-lg tracking-wide uppercase">Electronics</span>
                    </div>
                    <div>
                        <div className="text-[32px] font-black text-[#1a202c] leading-none mb-2">68%</div>
                        <div className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-4 uppercase">1,360 / 2,000 PALLETS</div>
                        <div className="w-full h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                            <div className="h-full bg-[#4338ca] rounded-full" style={{ width: '68%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Zone D */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7] flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[13px] font-black text-[#1a202c] uppercase tracking-wide">ZONE D</span>
                        <span className="px-2.5 py-1 bg-[#f1f5f9] text-gray-500 text-[9.5px] font-black rounded-lg tracking-wide uppercase">Cross-Dock</span>
                    </div>
                    <div>
                        <div className="text-[32px] font-black text-[#1a202c] leading-none mb-2">15%</div>
                        <div className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-4 uppercase">225 / 1,500 PALLETS</div>
                        <div className="w-full h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                            <div className="h-full bg-[#cbd5e1] rounded-full" style={{ width: '15%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Zone E */}
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7] flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[13px] font-black text-[#ef4444] uppercase tracking-wide">ZONE E</span>
                        <span className="px-2.5 py-1 bg-[#fef2f2] text-[#ef4444] text-[9.5px] font-black rounded-lg tracking-wide uppercase">Hazmat</span>
                    </div>
                    <div>
                        <div className="text-[32px] font-black text-[#1a202c] leading-none mb-2">82%</div>
                        <div className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-4 uppercase">820 / 1,000 PALLETS</div>
                        <div className="w-full h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                            <div className="h-full bg-[#ef4444] rounded-full" style={{ width: '82%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section */}
            <div className="grid grid-cols-12 gap-8 mb-8">
                {/* Stock Per Rack Details */}
                <div className="col-span-12 lg:col-span-8 bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7] flex flex-col min-h-[460px]">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-[18px] font-black text-[#1a202c]">Stock Per Rack Details</h3>
                            <p className="text-[13px] font-semibold text-gray-500 mt-1">Detailed inventory metrics for individual storage units</p>
                        </div>
                        <div className="flex bg-[#f8f9fb] border border-[#edf2f7] rounded-[10px] overflow-hidden p-0.5">
                            <button className="px-3.5 py-1.5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-[8px] text-gray-600">
                                <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                            </button>
                            <button className="px-3.5 py-1.5 text-gray-400 hover:text-gray-600 rounded-[8px] transition-colors">
                                <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 flex-1">
                        {/* Box 1 */}
                        <div className="bg-[#f8f9fb] border-2 border-transparent hover:border-[#e2e8f0] rounded-[20px] p-7 flex flex-col justify-between transition-all cursor-pointer">
                            <div className="flex items-start space-x-4 mb-6">
                                <div className="w-[42px] h-[42px] rounded-[10px] bg-[#eef2ff] flex items-center justify-center text-[#4338ca] flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                </div>
                                <div>
                                    <h4 className="text-[14.5px] font-black text-[#1a202c] mb-1">RACK A1-A12</h4>
                                    <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">High-Pick Area</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-center pb-5 mb-5 border-b border-[#e2e8f0]/60">
                                <div>
                                    <div className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase mb-1.5">Items</div>
                                    <div className="text-[16px] font-black text-[#1a202c]">1,240</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase mb-1.5">SKUs</div>
                                    <div className="text-[16px] font-black text-[#1a202c]">84</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase mb-1.5">Cap %</div>
                                    <div className="text-[16px] font-black text-[#ef4444]">92%</div>
                                </div>
                            </div>
                            <div className="w-full h-[5px] bg-[#e2e8f0] rounded-full overflow-hidden">
                                <div className="h-full bg-[#4338ca] rounded-full" style={{width: '92%'}}></div>
                            </div>
                        </div>

                        {/* Box 2 (Selected State) */}
                        <div className="bg-[#f8f9fb] border-[2.5px] border-[#6366f1] rounded-[20px] p-7 flex flex-col justify-between transition-all relative shadow-[0_8px_32px_rgba(99,102,241,0.12)]">
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#6366f1] text-white text-[10px] font-black px-4 py-1 rounded-[6px] uppercase tracking-widest shadow-sm pointer-events-none">Select</div>
                            <button className="absolute top-6 right-6 text-[#818cf8] hover:text-[#4f46e5] bg-[#eef2ff] p-1.5 rounded-md transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <div className="flex items-start space-x-4 mb-6">
                                <div className="w-[42px] h-[42px] rounded-[10px] bg-[#eef2ff] flex items-center justify-center text-[#4338ca] flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                </div>
                                <div className="pr-8">
                                    <h4 className="text-[14.5px] font-black text-[#1a202c] mb-1">RACK A13-A24</h4>
                                    <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">High-Pick Area</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-center pb-5 mb-5 border-b border-[#e2e8f0]/60">
                                <div>
                                    <div className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase mb-1.5">Items</div>
                                    <div className="text-[16px] font-black text-[#1a202c]">1,180</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase mb-1.5">SKUs</div>
                                    <div className="text-[16px] font-black text-[#1a202c]">112</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase mb-1.5">Cap %</div>
                                    <div className="text-[16px] font-black text-[#ef4444]">95%</div>
                                </div>
                            </div>
                            <div className="w-full h-[5px] bg-[#e2e8f0] rounded-full overflow-hidden">
                                <div className="h-full bg-[#6366f1] rounded-full" style={{width: '95%'}}></div>
                            </div>
                        </div>

                         {/* Box 3 */}
                        <div className="bg-[#f8f9fb] border-2 border-transparent hover:border-[#e2e8f0] rounded-[20px] p-7 flex flex-col justify-between transition-all cursor-pointer">
                            <div className="flex items-start space-x-4 mb-6">
                                <div className="w-[42px] h-[42px] rounded-[10px] bg-[#eef2ff] flex items-center justify-center text-[#4338ca] flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                </div>
                                <div>
                                    <h4 className="text-[14.5px] font-black text-[#1a202c] mb-1">ZONE B BULK</h4>
                                    <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Large Pallets</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-center pb-5 mb-5 border-b border-[#e2e8f0]/60">
                                <div>
                                    <div className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase mb-1.5">Items</div>
                                    <div className="text-[16px] font-black text-[#1a202c]">1,125</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase mb-1.5">SKUs</div>
                                    <div className="text-[16px] font-black text-[#1a202c]">22</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase mb-1.5">Cap %</div>
                                    <div className="text-[16px] font-black text-[#1a202c]">45%</div>
                                </div>
                            </div>
                            <div className="w-full h-[5px] bg-[#e2e8f0] rounded-full overflow-hidden">
                                <div className="h-full bg-[#93c5fd] rounded-full" style={{width: '45%'}}></div>
                            </div>
                        </div>

                        {/* Box 4 */}
                        <div className="bg-[#f8f9fb] border-2 border-transparent hover:border-[#e2e8f0] rounded-[20px] p-7 flex flex-col justify-between transition-all cursor-pointer">
                            <div className="flex items-start space-x-4 mb-6">
                                <div className="w-[42px] h-[42px] rounded-[10px] bg-[#eef2ff] flex items-center justify-center text-[#4338ca] flex-shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </div>
                                <div>
                                    <h4 className="text-[14.5px] font-black text-[#1a202c] mb-1">ZONE C SHELVING</h4>
                                    <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Electronics Bin</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-center pb-5 mb-5 border-b border-[#e2e8f0]/60">
                                <div>
                                    <div className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase mb-1.5">Items</div>
                                    <div className="text-[16px] font-black text-[#1a202c]">1,360</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase mb-1.5">SKUs</div>
                                    <div className="text-[16px] font-black text-[#1a202c]">410</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase mb-1.5">Cap %</div>
                                    <div className="text-[16px] font-black text-[#1a202c]">68%</div>
                                </div>
                            </div>
                            <div className="w-full h-[5px] bg-[#e2e8f0] rounded-full overflow-hidden">
                                <div className="h-full bg-[#6366f1] rounded-full" style={{width: '68%'}}></div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Crew Activity Log */}
                <div className="col-span-12 lg:col-span-4 bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7] flex flex-col min-h-[460px]">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-[18px] font-black text-[#1a202c]">Crew Activity Log</h3>
                        <button className="text-[#3632c0] text-[12px] font-bold hover:underline tracking-wide bg-transparent">Filter</button>
                    </div>

                    <div className="flex-1 space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#edf2f7] before:to-transparent">
                        
                        {/* Log Item 1 */}
                        <div className="relative flex items-start space-x-5 pl-2 mb-8">
                            <div className="absolute left-0 top-1.5 w-[7px] h-[7px] bg-[#4338ca] rounded-full shadow-[0_0_8px_rgba(67,56,202,0.6)] z-10 border-[1.5px] border-white"></div>
                            <div className="flex-1">
                                <h4 className="text-[14px] font-black text-[#1a202c] mb-1">Loading - Truck #AF22</h4>
                                <div className="text-[10px] font-extrabold text-gray-400 tracking-wider uppercase mb-1.5">
                                    DOCK 04 <span className="mx-1">•</span> 09:42 AM
                                </div>
                                <p className="text-[12px] text-gray-500 font-semibold">Operator: J. Miller • 24 pallets total</p>
                            </div>
                        </div>

                        {/* Log Item 2 */}
                        <div className="relative flex items-start space-x-5 pl-2 mb-8">
                            <div className="absolute left-[1px] top-1.5 w-[5px] h-[5px] bg-[#cbd5e1] rounded-full z-10"></div>
                            <div className="flex-1">
                                <h4 className="text-[14px] font-bold text-gray-600 mb-1">Stowing - L-Series Units</h4>
                                <div className="text-[10px] font-extrabold text-gray-400 tracking-wider uppercase mb-1.5">
                                    ZONE A-12 <span className="mx-1">•</span> 09:30 AM
                                </div>
                                <p className="text-[12px] text-gray-500 font-medium">Operator: S. Chen • Inventory update complete</p>
                            </div>
                        </div>

                        {/* Log Item 3 */}
                        <div className="relative flex items-start space-x-5 pl-2 mb-8">
                            <div className="absolute left-[1px] top-1.5 w-[5px] h-[5px] bg-[#cbd5e1] rounded-full z-10"></div>
                            <div className="flex-1">
                                <h4 className="text-[14px] font-bold text-gray-600 mb-1">Picking - Order #9841</h4>
                                <div className="text-[10px] font-extrabold text-gray-400 tracking-wider uppercase mb-1.5">
                                    ZONE C-04 <span className="mx-1">•</span> 09:15 AM
                                </div>
                                <p className="text-[12px] text-gray-500 font-medium">Operator: Automated Picker-02</p>
                            </div>
                        </div>

                        {/* Log Item 4 */}
                        <div className="relative flex items-start space-x-5 pl-2">
                            <div className="absolute left-[1px] top-1.5 w-[5px] h-[5px] bg-[#cbd5e1] rounded-full z-10"></div>
                            <div className="flex-1">
                                <h4 className="text-[14px] font-bold text-gray-600 mb-1">Safety Check Complete</h4>
                                <div className="text-[10px] font-extrabold text-gray-400 tracking-wider uppercase mb-1.5">
                                    ALL AREAS <span className="mx-1">•</span> 08:00 AM
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button className="w-full py-3.5 bg-white border border-[#edf2f7] rounded-[12px] text-[12px] font-extrabold text-[#475569] shadow-sm hover:bg-gray-50 transition-colors">
                            View Full History
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-12 gap-8">
                {/* Facility & Equipment Status */}
                <div className="col-span-12 lg:col-span-8 bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                    <h3 className="text-[18px] font-black text-[#1a202c] mb-6">Facility & Equipment Status</h3>
                    
                    <div className="grid grid-cols-3 gap-5">
                        <div className="bg-[#f8f9fb] rounded-[16px] p-6 border border-[#edf2f7] flex relative overflow-hidden group">
                           <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#10b981]"></div>
                           <div className="space-y-4">
                               <div className="w-[42px] h-[42px] rounded-[12px] bg-white shadow-sm flex items-center justify-center text-[#10b981]">
                                   <ConveyorIcon className="w-6 h-6" />
                               </div>
                               <div>
                                   <div className="text-[11px] font-extrabold text-gray-500 tracking-wider mb-1">CONVEYOR BELT 01</div>
                                   <div className="flex items-center space-x-1.5 mb-2.5">
                                       <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                                       <span className="text-[15px] font-black text-[#1a202c]">Healthy</span>
                                   </div>
                                   <div className="text-[10px] font-bold text-gray-400 tracking-wide">Uptime: 99.8%</div>
                               </div>
                           </div>
                        </div>

                        <div className="bg-[#f8f9fb] rounded-[16px] p-6 border border-[#edf2f7] flex relative overflow-hidden group">
                           <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#10b981]"></div>
                           <div className="space-y-4">
                               <div className="w-[42px] h-[42px] rounded-[12px] bg-white shadow-sm flex items-center justify-center text-[#10b981]">
                                   <SortIcon className="w-5 h-5" />
                               </div>
                               <div>
                                   <div className="text-[11px] font-extrabold text-gray-500 tracking-wider mb-1">SORTING MACHINE</div>
                                   <div className="flex items-center space-x-1.5 mb-2.5">
                                       <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                                       <span className="text-[15px] font-black text-[#1a202c]">Healthy</span>
                                   </div>
                                   <div className="text-[10px] font-bold text-gray-400 tracking-wide">Next Service: 12d</div>
                               </div>
                           </div>
                        </div>

                        <div className="bg-[#f8f9fb] rounded-[16px] p-6 border border-[#edf2f7] flex relative overflow-hidden group">
                           <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#f97316]"></div>
                           <div className="space-y-4">
                               <div className="w-[42px] h-[42px] rounded-[12px] bg-white shadow-sm flex items-center justify-center text-[#f97316]">
                                   <ForkliftIcon className="w-6 h-6" />
                               </div>
                               <div>
                                   <div className="text-[11px] font-extrabold text-gray-500 tracking-wider mb-1">FORKLIFT FLEET</div>
                                   <div className="flex items-center space-x-1.5 mb-2.5">
                                       <span className="w-2 h-2 rounded-full bg-[#f97316]"></span>
                                       <span className="text-[15px] font-black text-[#1a202c]">Maintenance</span>
                                   </div>
                                   <div className="text-[10px] font-bold text-[#f97316] tracking-wide">2/12 Units Idle</div>
                               </div>
                           </div>
                        </div>
                    </div>
                </div>

                {/* Safety & Environment */}
                <div className="col-span-12 lg:col-span-4 bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#10b981]/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/5 rounded-bl-full pointer-events-none"></div>
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-[18px] font-black text-[#1a202c] max-w-[120px] leading-tight">Safety & Environment</h3>
                        <div className="flex flex-col items-center">
                            <ActivityIcon className="w-5 h-5 text-[#10b981] mb-1" />
                            <span className="text-[10px] font-black text-[#10b981] tracking-widest uppercase">ALL SECURE</span>
                        </div>
                    </div>

                    <div className="space-y-4 mt-8 pt-2">
                        <div className="bg-[#fbfcfd] p-4 rounded-[14px] flex items-center justify-between border border-[#edf2f7]">
                            <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-lg bg-[#eef2ff] flex items-center justify-center text-[#4338ca]">
                                    <ThermometerIcon className="w-5 h-5" />
                                </div>
                                <span className="text-[13px] font-bold text-gray-600">Temperature</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-[16px] font-black text-[#1a202c]">22.4°C</span>
                                <span className="text-[9px] font-black text-[#10b981] bg-[#ecfdf5] px-2 py-0.5 rounded uppercase tracking-wide">Normal</span>
                            </div>
                        </div>

                        <div className="bg-[#fbfcfd] p-4 rounded-[14px] flex items-center justify-between border border-[#edf2f7]">
                            <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#3b82f6]">
                                    <WaterDropIcon className="w-5 h-5" />
                                </div>
                                <span className="text-[13px] font-bold text-gray-600">Humidity</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-[16px] font-black text-[#1a202c]">45%</span>
                                <span className="text-[9px] font-black text-[#10b981] bg-[#ecfdf5] px-2 py-0.5 rounded uppercase tracking-wide">Optimal</span>
                            </div>
                        </div>

                        <div className="bg-[#fbfcfd] p-4 rounded-[14px] flex items-center justify-between border border-[#edf2f7]">
                            <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-lg bg-[#fef2f2] flex items-center justify-center text-[#ef4444]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" /></svg>
                                </div>
                                <span className="text-[13px] font-bold text-gray-600">Fire Safety</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-[16px] font-black text-[#1a202c]">Ready</span>
                                <span className="text-[9px] font-black text-[#10b981] bg-[#ecfdf5] px-2 py-0.5 rounded uppercase tracking-wide">Certified</span>
                            </div>
                        </div>
                    </div>

                    {/* Alert Protocol Box */}
                    <div className="bg-[#f5f3ff] p-5 rounded-[16px] border border-[#ede9fe] mt-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <svg className="w-4 h-4 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-widest">SAFETY PROTOCOL</span>
                        </div>
                        <p className="text-[11px] text-gray-600 font-semibold leading-[1.6]">
                            Next fire safety drill scheduled for May 24th, 10:00 AM. All automated sorting lines will pause for 15 minutes.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
