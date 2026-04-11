import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

// Icons
const ScanIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-1m-1-4v1m0 0a2 2 0 100 4 2 2 0 000-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
    </svg>
);

const SearchIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const RobotIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
);

const WifiIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
);

export default function RackAllocation({ rackId }) {
    return (
        <DashboardLayout>
            <Head title={`Rack Allocation - ${rackId}`} />

            <div className="flex justify-between items-start mb-6">
                <div>
                     <div className="flex items-center space-x-2 text-sm mb-2">
                         <Link href="/warehouse" className="text-gray-400 hover:text-indigo-600 font-bold transition-colors">Warehouse</Link>
                         <span className="text-gray-300">/</span>
                         <span className="text-gray-600 font-bold">Rack Configuration</span>
                     </div>
                     <h1 className="text-[26px] font-black text-[#1a202c] tracking-tight">{rackId || 'RACK A13-A24'} Setup</h1>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 pb-12">
                {/* Left Column - Forms */}
                <div className="col-span-12 lg:col-span-8 flex flex-col space-y-6">
                    
                    {/* Step 1: SKU Selection */}
                    <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-8 h-8 rounded-full bg-[#f3f4f6] text-[#4f46e5] flex items-center justify-center font-black text-sm">1</div>
                                <h2 className="text-[18px] font-black text-[#1a202c]">SKU Selection</h2>
                            </div>
                            <button className="flex items-center space-x-2 text-[#4f46e5] text-[13px] font-bold hover:text-indigo-700 transition-colors">
                                <ScanIcon className="w-4 h-4" />
                                <span>Quick Scan</span>
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">Search Inventory</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <SearchIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="text" 
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 block w-full pl-11 pr-4 py-3.5 sm:text-sm rounded-xl transition-all text-[#1a202c] font-semibold" 
                                    placeholder="AET-992-BX"
                                    defaultValue="AET-992-BX"
                                />
                            </div>
                        </div>

                        {/* Selected SKU Card */}
                        <div className="bg-[#f8f9fb] border-[2px] border-[#eff6ff] rounded-[20px] p-4 flex items-center space-x-6 relative shadow-sm">
                            <div className="w-[84px] h-[84px] bg-[#1a202c] rounded-[14px] flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#38bdf8]/20 to-transparent"></div>
                                {/* Mockup 3D Cylinder representation */}
                                <div className="w-8 h-12 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-sm shadow-[0_0_15px_rgba(45,212,191,0.5)] border-t border-teal-300"></div>
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-1">
                                    <span className="bg-[#e0e7ff] text-[#4f46e5] text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">SELECTED SKU</span>
                                    <span className="text-[12px] font-bold text-gray-500">AET-992-BX</span>
                                </div>
                                <h3 className="text-[18px] font-black text-[#1a202c] mb-3">Quantum Pulse Hub V2</h3>
                                
                                <div className="flex space-x-8">
                                    <div>
                                        <div className="text-[9px] font-extrabold text-gray-400 tracking-widest uppercase mb-0.5">Global Stock</div>
                                        <div className="text-[14px] font-black text-[#1a202c]">1,248 Units</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-extrabold text-gray-400 tracking-widest uppercase mb-0.5">Category</div>
                                        <div className="text-[14px] font-black text-[#1a202c]">Electronics</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Allocation Details */}
                    <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-8 h-8 rounded-full bg-[#f3f4f6] text-[#4f46e5] flex items-center justify-center font-black text-sm">2</div>
                            <h2 className="text-[18px] font-black text-[#1a202c]">Allocation Details</h2>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6">
                            <div className="relative">
                                <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">Quantity to Assign</label>
                                <div className="relative">
                                    {/* Select Badge Wireframe artifact */}
                                    <div className="absolute -top-3 left-2 bg-[#6366f1] text-white text-[9px] font-black px-2.5 py-0.5 rounded-[4px] uppercase tracking-widest z-10 shadow-sm pointer-events-none">Select</div>
                                    <input 
                                        type="number" 
                                        className="bg-[#f8f9fb] border-2 border-[#4f46e5] focus:ring-0 block w-full px-4 py-3 sm:text-base font-black text-right rounded-xl shadow-[0_4px_12px_rgba(79,70,229,0.1)] text-[#1a202c]" 
                                        defaultValue="150"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-gray-400 font-bold text-sm select-none">—</span>
                                    </div>
                                </div>
                                <div className="mt-1.5 text-center text-[10px] text-gray-400 italic">Units (pcs)</div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">Min Threshold</label>
                                <input 
                                    type="number" 
                                    className="bg-[#f8f9fb] border border-transparent focus:border-gray-300 block w-full px-4 py-3.5 sm:text-base font-bold rounded-xl text-[#1a202c]" 
                                    defaultValue="20"
                                />
                                <div className="mt-1.5 text-center text-[10px] text-gray-400 italic">Alert level for restock</div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">Max Capacity</label>
                                <input 
                                    type="number" 
                                    className="bg-[#f8f9fb] border border-transparent focus:border-gray-300 block w-full px-4 py-3.5 sm:text-base font-bold rounded-xl text-[#1a202c]" 
                                    defaultValue="300"
                                />
                                <div className="mt-1.5 text-center text-[10px] text-gray-400 italic">Physical limit for this slot</div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Handling Instructions */}
                    <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-8 h-8 rounded-full bg-[#f3f4f6] text-[#4f46e5] flex items-center justify-center font-black text-sm">3</div>
                            <h2 className="text-[18px] font-black text-[#1a202c]">Handling Instructions</h2>
                        </div>
                        
                        <div className="mb-5">
                             <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">Rack-Specific Notes</label>
                             <textarea 
                                 rows={3} 
                                 className="bg-[#f8f9fb] border border-transparent focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 block w-full p-4 sm:text-sm font-medium text-gray-600 rounded-xl resize-none"
                                 defaultValue="E.g. Handle with gloves, fragile sensors inside, do not stack more than 4 boxes high..."
                             ></textarea>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button className="flex items-center space-x-2 bg-white border border-gray-200 px-3.5 py-1.5 rounded-full text-[11.5px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                <span>Do not stack</span>
                            </button>
                            <button className="flex items-center space-x-2 bg-white border border-gray-200 px-3.5 py-1.5 rounded-full text-[11.5px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
                                <span>Keep dry</span>
                            </button>
                            <button className="flex items-center space-x-2 bg-white border border-gray-200 px-3.5 py-1.5 rounded-full text-[11.5px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                <svg className="w-3.5 h-3.5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                <span>Temperature Sensitive</span>
                            </button>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-center space-x-4 mt-6 relative pt-4">
                        <div className="relative group">
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#3b82f6] text-white text-[9px] font-black px-2 py-0.5 rounded-[4px] opacity-100 uppercase tracking-widest scale-90">Connected</div>
                            <button className="px-8 py-3.5 border border-gray-300 text-gray-600 font-bold rounded-xl text-[14px] hover:bg-gray-50 transition-colors border-dashed bg-white shadow-sm">
                                Cancel
                            </button>
                        </div>
                        <div className="relative group">
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#3b82f6] text-white text-[9px] font-black px-2 py-0.5 rounded-[4px] opacity-100 uppercase tracking-widest scale-90">Connected</div>
                            <button className="px-8 py-3.5 bg-[#4f46e5] text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.39)] text-[14px] hover:bg-indigo-700 transition-all flex items-center space-x-2 focus:ring-4 focus:ring-indigo-500/30">
                                <span>Confirm Assignment</span>
                                <svg className="w-4 h-4 text-indigo-200 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Status Sidebar */}
                <div className="col-span-12 lg:col-span-4 flex flex-col space-y-6">
                    
                    {/* Current Location HUD */}
                    <div className="bg-gradient-to-br from-[#2a2468] to-[#1e194a] rounded-[24px] p-6 shadow-xl relative overflow-hidden text-white border border-[#3b338b] shadow-[0_10px_40px_rgba(42,36,104,0.2)]">
                        {/* decorative glowing orb */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4f46e5] rounded-full filter blur-[50px] opacity-40 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <div className="text-[9px] font-black text-indigo-300 tracking-[0.2em] uppercase mb-1 drop-shadow-md">Current Location</div>
                                <h3 className="text-[24px] font-black text-white leading-tight drop-shadow-lg">Rack A1-A12</h3>
                            </div>
                            <div className="w-10 h-10 rounded-[10px] bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-indigo-200">
                                <RobotIcon className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="mb-6 relative z-10">
                            <div className="flex justify-between items-end mb-1.5">
                                <span className="text-[11px] font-bold text-indigo-200">Volumetric Load</span>
                                <span className="text-[14px] font-black text-white">74%</span>
                            </div>
                            <div className="w-full h-[5px] bg-[#1e1b4b] rounded-full overflow-hidden border border-white/5 shadow-inner">
                                <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full" style={{width: '74%'}}></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="bg-[#1e1b4b]/60 backdrop-blur-md rounded-xl p-3.5 border border-indigo-400/20 hover:bg-[#1e1b4b]/80 transition-colors">
                                <div className="text-[8px] font-black text-indigo-300 tracking-wider uppercase mb-1">Temp</div>
                                <div className="text-[18px] font-black text-white">21.4°C</div>
                            </div>
                            <div className="bg-[#1e1b4b]/60 backdrop-blur-md rounded-xl p-3.5 border border-indigo-400/20 hover:bg-[#1e1b4b]/80 transition-colors">
                                <div className="text-[8px] font-black text-indigo-300 tracking-wider uppercase mb-1">Humidity</div>
                                <div className="text-[18px] font-black text-white">42%</div>
                            </div>
                        </div>
                    </div>

                    {/* Occupying SKUs List */}
                    <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7] flex-1">
                        <h4 className="text-[10px] font-black text-gray-400 tracking-[0.15em] uppercase mb-4 pl-1">Occupying SKUs</h4>
                        
                        <div className="space-y-4 mb-6">
                            {[
                                { name: "Optic Glass G2", sku: "AET-501-LX", qty: 80, color: "from-gray-900 to-gray-700" },
                                { name: "Swift Runner X", sku: "AET-228-SR", qty: 22, color: "from-slate-800 to-indigo-900" },
                                { name: "Audio-Pure 900", sku: "AET-011-AP", qty: 45, color: "from-amber-500 to-orange-400" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center space-x-4 bg-white p-3 rounded-[16px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-gray-200 transition-all cursor-pointer">
                                    <div className={`w-10 h-10 rounded-[10px] bg-gradient-to-br ${item.color} flex items-center justify-center shadow-inner flex-shrink-0 relative overflow-hidden`}>
                                         <div className="absolute top-0 right-0 w-4 h-4 bg-white/20 rounded-bl-full"></div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[13px] font-black text-[#1a202c] leading-tight">{item.name}</div>
                                        <div className="text-[10px] font-bold text-gray-500 tracking-wide mt-0.5">SKU: {item.sku}</div>
                                    </div>
                                    <div className="text-right pr-2">
                                        <div className="text-[14px] font-black text-indigo-600">{item.qty}</div>
                                        <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">Qty</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Accordion mockup */}
                        <div className="bg-[#f8f9fb] border border-[#e2e8f0] rounded-[16px] p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <div className="flex flex-col space-y-1 w-5 justify-center">
                                     <div className="w-full h-1.5 bg-indigo-200 rounded-sm"></div>
                                     <div className="w-full h-1.5 bg-indigo-500 rounded-sm"></div>
                                     <div className="w-full h-1.5 bg-indigo-200 rounded-sm"></div>
                                </div>
                                <div>
                                    <div className="text-[12px] font-black text-indigo-700">Tier 2 of 4</div>
                                    <div className="text-[10px] font-semibold text-indigo-500/80 tracking-wide">Secondary Picking Zone</div>
                                </div>
                            </div>
                            <div className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center shadow-sm text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Health Status */}
                    <div className="bg-[#fbfcfd] border border-[#edf2f7] rounded-[20px] p-6 shadow-sm">
                        <h4 className="text-[10px] font-black text-gray-400 tracking-[0.15em] uppercase mb-4 pl-1">Health Status</h4>
                        <div className="space-y-4 pl-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="w-2 h-2 rounded-full bg-[#d97706] shadow-[0_0_8px_rgba(217,119,6,0.6)]"></span>
                                    <span className="text-[12px] font-bold text-gray-700">Structural integrity check due</span>
                                </div>
                                <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-widest">2D LEFT</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                                    <span className="text-[12px] font-bold text-gray-700">IoT Sensors Online</span>
                                </div>
                                <WifiIcon className="w-4 h-4 text-[#10b981]" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
