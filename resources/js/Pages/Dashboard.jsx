import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import React from 'react';

// Icons
const ArrowRightIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
);

const BoxIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

const ActivityIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const TrendingUpIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const AlertCircleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function Dashboard() {
    return (
        <DashboardLayout>
            <Head title="Dashboard" />

            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-[26px] font-black text-[#1a202c] tracking-tight">Intelligence Dashboard</h1>
                    <p className="text-[14px] font-semibold text-gray-500 mt-1">AI-driven predictive analytics and global inventory view</p>
                </div>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-4 gap-6 mb-7">
                {[
                    { title: "TOTAL INVENTORY", value: "2.4M", trend: "+12.5%", color: "text-[#3632c0]", bg: "bg-[#eef2ff]", icon: BoxIcon },
                    { title: "OUTBOUND RATE", value: "845/hr", trend: "+5.2%", color: "text-[#10b981]", bg: "bg-[#ecfdf5]", icon: TrendingUpIcon },
                    { title: "SYSTEM ALERTS", value: "3", trend: "Review", color: "text-[#ef4444]", bg: "bg-[#fef2f2]", icon: AlertCircleIcon },
                    { title: "ACTIVE NODES", value: "42", trend: "All online", color: "text-[#f97316]", bg: "bg-[#fff7ed]", icon: ActivityIcon },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7] flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-5">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg tracking-wide ${stat.bg} ${stat.color}`}>{stat.trend}</span>
                        </div>
                        <div className="mt-1">
                            <div className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-1.5 uppercase">{stat.title}</div>
                            <div className="text-[24px] font-black text-[#1a202c] leading-none">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-7">
                {/* Intelligence Hub */}
                <div className="col-span-12 lg:col-span-5 bg-[#2d2a7f] rounded-[24px] p-8 text-white shadow-[0_10px_40px_rgba(45,42,127,0.15)] flex flex-col justify-between min-h-[400px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#4a46c8] rounded-full filter blur-[80px] opacity-60 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                    
                    <div className="relative z-10 w-full mb-8">
                        <div className="flex items-center space-x-2.5 mb-2">
                            <div className="w-[8px] h-[8px] bg-[#60a5fa] rounded-full shadow-[0_0_12px_rgba(96,165,250,0.9)] animate-pulse"></div>
                            <span className="text-[11px] font-black text-[#93c5fd] tracking-[0.2em] uppercase">Intelligence Hub</span>
                        </div>
                        <div className="text-[10px] font-bold text-[#93c5fd]/70 tracking-widest uppercase">AI Forecast Active</div>
                    </div>

                    <div className="relative z-10 mb-8 max-w-[90%]">
                        <p className="text-[22px] font-extrabold leading-[1.3] text-white">
                            Inventory shortage predicted for <strong className="text-white font-black border-b-2 border-white/30 pb-0.5">Region-A</strong> within 48 hours. Recommend rerouting 500 units from Warehouse 04.
                        </p>
                    </div>

                    <div className="relative z-10 mt-auto flex items-center justify-between">
                        <button className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 px-5 py-3 rounded-[12px] transition-all backdrop-blur-md border border-white/5 group">
                            <span className="text-[12px] font-black tracking-wide text-white">EXECUTE RECOMMENDATION</span>
                            <ArrowRightIcon className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="relative z-10 mt-8 pt-6 border-t border-white/10 w-full">
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-[10px] font-extrabold text-[#93c5fd]/70 uppercase tracking-widest mb-1.5 block">Efficiency Score</span>
                                <div className="text-[32px] font-black text-white leading-none">94.2%</div>
                            </div>
                            <div className="flex space-x-1">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className={`w-2.5 rounded-full ${i < 6 ? 'h-6 bg-[#60a5fa]' : 'h-4 bg-white/20'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Warehouse Floor Visualization */}
                <div className="col-span-12 lg:col-span-7 bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7] min-h-[400px] flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <div>
                            <h2 className="text-[18px] font-black text-[#1a202c]">Warehouse Floor Visualization</h2>
                            <p className="text-[12px] font-semibold text-gray-500 mt-1">Real-time heat-map & zone occupancy</p>
                        </div>
                        <div className="flex items-center space-x-2 bg-[#f4f5f9] px-3 py-1.5 rounded-[10px] border border-gray-100">
                            <span className="w-2.5 h-2.5 bg-[#4338ca] rounded-full"></span>
                            <span className="text-[11px] font-bold text-gray-600">High Density</span>
                        </div>
                    </div>

                    <div className="flex-1 bg-[#fbfcfd] rounded-[20px] border-2 border-dashed border-[#edf2f7] p-8 relative flex flex-col justify-center">
                        <div className="grid grid-cols-12 gap-3 opacity-80">
                            {/* Grid of dots simulating racks */}
                            {[...Array(60)].map((_, i) => {
                                const isBusy = [14, 15, 26, 27, 38, 39].includes(i);
                                const isAlert = [45].includes(i);
                                
                                return (
                                    <div 
                                        key={i} 
                                        className={`h-4 rounded-full transition-all duration-300 ${isAlert ? 'bg-[#ef4444] animate-pulse' : isBusy ? 'bg-[#4338ca]' : 'bg-[#e2e8f0]'}`}
                                    ></div>
                                );
                            })}
                        </div>

                        {/* Overlays / Pins */}
                        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2">
                            <div className="bg-[#1a202c] text-white text-[10px] font-bold px-3 py-1.5 rounded-[8px] mb-2 shadow-lg relative">
                                Rack B-12
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a202c] rotate-45"></div>
                            </div>
                            <div className="w-4 h-4 bg-[#4338ca] border-2 border-white rounded-full mx-auto shadow-[0_0_0_4px_rgba(67,56,202,0.2)]"></div>
                        </div>

                        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2">
                            <div className="bg-[#ef4444] text-white text-[10px] font-bold px-3 py-1.5 rounded-[8px] mb-2 shadow-lg relative">
                                Attention
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#ef4444] rotate-45"></div>
                            </div>
                            <div className="w-4 h-4 bg-[#ef4444] border-2 border-white rounded-full mx-auto shadow-[0_0_0_4px_rgba(239,68,68,0.2)] animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stock Movement Trend */}
            <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7] min-h-[300px] flex flex-col mt-7">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-[18px] font-black text-[#1a202c]">Stock Movement Trend</h2>
                        <p className="text-[12px] font-semibold text-gray-500 mt-1">Inbound vs Outbound velocity</p>
                    </div>
                    <div className="flex space-x-6 text-[12px] font-bold text-gray-600">
                         <div className="flex items-center space-x-2">
                             <span className="w-3 h-3 rounded-md bg-[#2563eb]"></span>
                             <span>Inbound</span>
                         </div>
                         <div className="flex items-center space-x-2">
                             <span className="w-3 h-3 rounded-md bg-[#94a3b8]"></span>
                             <span>Outbound</span>
                         </div>
                    </div>
                </div>

                <div className="flex-1 w-full relative">
                    {/* Simulated SVG Graph */}
                    <div className="absolute inset-0">
                         <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
                             <path d="M0,80 Q20,20 40,50 T70,30 T100,60" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" strokeLinecap="round" />
                             <path d="M0,90 Q20,40 40,70 T70,10 T100,50" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
                             <path d="M0,90 Q20,40 40,70 T70,10 T100,50 L100,100 L0,100 Z" fill="url(#blue-gradient)" opacity="0.1" />
                             <defs>
                                <linearGradient id="blue-gradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#2563eb" />
                                    <stop offset="100%" stopColor="transparent" />
                                </linearGradient>
                            </defs>
                         </svg>
                    </div>
                </div>
            </div>

            {/* Live Flux Footer */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-[800px] w-full px-6 z-50">
                <div className="bg-[#1a202c]/95 backdrop-blur-xl rounded-full p-3.5 shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-white/10 flex items-center justify-between text-white text-[11px] font-bold px-8">
                    <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                            <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-ping"></span>
                        </div>
                        <span className="tracking-widest uppercase text-gray-300">Live Flux • Core Sync Active</span>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                             <span className="text-gray-400">NODE ALPHA</span>
                             <span className="text-[#10b981]">99.9%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                             <span className="text-gray-400">LATENCY</span>
                             <span className="text-white">12ms</span>
                        </div>
                    </div>
                </div>
            </div>

        </DashboardLayout>
    );
}
