import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState, useMemo, useEffect } from 'react';

// Icons
const GaugeIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const TrendingUpIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l10-10m0 0H8m9 0v9" />
    </svg>
);

const ZapIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const HourglassIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const DownloadIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const CogIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const EfficiencyGaugeIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.5 15.5C3.56225 14.4442 3 13.0649 3 11.5584C3 6.83117 7.02944 3 12 3C16.9706 3 21 6.83117 21 11.5584C21 13.0649 20.4377 14.4442 19.5 15.5" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M12 12L16 8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
);

const BoxIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M21 8L12 13L3 8V16L12 21L21 16V8Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 8L12 3L3 8L12 13L21 8Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 13V21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const TruckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M14 8h-4v6h4V8zM7 14h10v2a2 2 0 01-2 2h-6a2 2 0 01-2-2v-2zM4 10h6M4 14h3M17 14h3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
    </svg>
);

const CreditCardIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 10h20M7 15h3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const BarChartIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M6 20V12M12 20V4M18 20V16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ActivityIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 7h4v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const PieChartIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12L12 3A9 9 0 0121 12L12 12Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ClockIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const DownloadIcon2 = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default function Reports({ data, reports }) {
    const [selectedDataSource, setSelectedDataSource] = useState('inventory'); // 'inventory', 'fleet', 'cost'
    const [selectedVisualization, setSelectedVisualization] = useState('bar'); // 'bar', 'kinetic', 'distribution'
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    const handleGenerate = () => {
        router.post(route('reports.generate'));
    };

    const handleDownload = (id) => {
        window.location.href = route('reports.download', id);
    };

    // Simulate loading when changing selection
    useEffect(() => {
        setIsPreviewLoading(true);
        const timer = setTimeout(() => setIsPreviewLoading(false), 400);
        return () => clearTimeout(timer);
    }, [selectedDataSource, selectedVisualization]);

    // Calculate max value for throughput bars normalization
    const throughputStats = data?.throughput || [];
    const maxThroughput = Math.max(...throughputStats.map(d => Math.max(d.inbound, d.outbound)), 100);
    
    // Last 7 days for the chart display (or use all 30)
    const recentThroughput = throughputStats.slice(-7);
    // Custom Header Right Segment for "Reports Hub"
    const headerRight = (
        <div className="flex items-center space-x-6">
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <CogIcon className="w-[22px] h-[22px]" />
            </button>
            <div className="flex items-center space-x-3 cursor-pointer group">
                <span className="text-[13px] font-extrabold text-[#1a202c]">Reports Hub</span>
                <div className="w-[36px] h-[36px] rounded-full border-2 border-white shadow-sm overflow-hidden bg-[#e2e8f0]">
                    <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150" 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    );

    return (
        <DashboardLayout headerTitle="" headerRight={headerRight} headerSearchPlaceholder="Search engine...">
            <Head title="Reports & Analytics" />

            {/* Standard spacing from DashboardLayout handles padding, we just build the content */}
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Header Actions */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-[36px] font-black text-[#1a202c] tracking-tight leading-none">Reports & Analytics</h1>
                        <p className="text-[15px] font-bold text-gray-400 mt-2.5">Real-time data visualization of warehouse kinetic efficiency</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                        <button 
                            onClick={handleGenerate}
                            className="px-6 py-3 bg-[#4f46e5] text-white font-black rounded-xl text-[12px] uppercase tracking-wider hover:bg-indigo-700 transition-all flex items-center shadow-xl shadow-indigo-100/50"
                        >
                            <span className="mr-2 text-lg leading-none">+</span>
                            Generate Warehouse Status Report (PDF)
                        </button>
                    </div>
                </div>

                {/* Top Row: Chart, Efficiency & Faults */}
                <div className="grid grid-cols-12 gap-8 items-stretch">
                    {/* Main Chart Card */}
                    <div className="col-span-8 bg-white rounded-[32px] p-10 border border-[#edf2f7] shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col">
                        <div className="flex justify-between items-center mb-12">
                            <h3 className="text-[18px] font-black text-[#1a202c]">Warehouse Throughput Trend</h3>
                            <span className="px-3.5 py-1.5 bg-[#eef2ff] text-[10px] font-black text-[#4f46e5] rounded-full uppercase tracking-widest">Last 30 Days</span>
                        </div>
                        
                        <div className="flex-1 flex items-end justify-between h-[220px] px-2 mb-4">
                            {recentThroughput.length > 0 ? recentThroughput.map((d, i) => {
                                const h = (Math.max(d.inbound, d.outbound) / maxThroughput) * 200;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center mx-2 group">
                                        <div 
                                            style={{ height: `${Math.max(h, 20)}px` }} 
                                            className={`w-full rounded-[14px] transition-all duration-700 ${i === recentThroughput.length - 1 ? 'bg-gradient-to-t from-[#3b35be] to-[#5d55fa] shadow-[0_8px_20px_rgba(79,70,229,0.3)]' : 'bg-[#e1e9f4] group-hover:bg-[#d4def1]'}`}
                                        ></div>
                                        <span className="text-[10px] font-bold text-gray-400 mt-3 uppercase tracking-tighter">
                                            {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                        </span>
                                    </div>
                                );
                            }) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">
                                    No movement data available yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side Stats */}
                    <div className="col-span-4 flex flex-col gap-8">
                        {/* Overall Efficiency Card */}
                        <div className="bg-gradient-to-br from-[#4f46e5] to-[#3b35be] rounded-[32px] p-9 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden flex-1 flex flex-col justify-between">
                            <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-10 rotate-12">
                                <EfficiencyGaugeIcon className="w-64 h-64" />
                            </div>
                            
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="w-[44px] h-[44px] bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-xl border border-white/10">
                                        <EfficiencyGaugeIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="px-3 py-1.5 bg-white/15 text-[10px] font-black rounded-xl uppercase tracking-[0.2em] backdrop-blur-md border border-white/10">Real-time</span>
                                </div>
                                
                                <div className="mt-2">
                                    <p className="text-[14px] font-bold text-indigo-100/70 tracking-tight">Overall Efficiency</p>
                                    <h2 className="text-[56px] font-bold tracking-tighter leading-none mt-2">{data?.efficiency || 0}%</h2>
                                    <div className="mt-10 flex items-center space-x-2 bg-white/10 w-fit px-4 py-2 rounded-2xl backdrop-blur-md border border-white/5 shadow-sm">
                                        <TrendingUpIcon className="w-4 h-4 text-emerald-300" />
                                        <span className="text-[12px] font-bold text-indigo-50 tracking-tight">Real-time rack occupancy</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Faults Card */}
                        <div className="bg-white rounded-[32px] p-9 border border-[#edf2f7] shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between whitespace-nowrap">
                            <div>
                                <h3 className="text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase mb-6">Active Warehouse Faults</h3>
                                <div className="flex items-center space-x-5">
                                    <div className={`w-3.5 h-3.5 rounded-full ${data?.total_stock > 0 ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'bg-[#f43f5e] shadow-[0_0_12px_rgba(244,63,94,0.5)] animate-pulse'}`}></div>
                                    <span className="text-[32px] font-black text-[#1a202c]">{data?.total_products || 0} Products</span>
                                </div>
                            </div>
                            <div className="text-[13px] font-bold text-gray-500">
                                Total stock units: {data?.total_stock || 0}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Movement Analysis */}
                <div className="bg-white rounded-[40px] p-12 border border-[#edf2f7] shadow-[0_4px_30px_rgba(0,0,0,0.03)] pb-14">
                    <div className="flex justify-between items-start mb-16">
                        <div>
                            <h2 className="text-[22px] font-black text-[#1a202c]">Product Movement Analysis</h2>
                            <p className="text-[14px] font-bold text-gray-400 mt-1.5">Classification by exit frequency and dwell time</p>
                        </div>
                        <div className="flex items-center space-x-8">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#4f46e5]"></div>
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Fast Moving</span>
                            </div>
                            <div className="flex items-center space-x-2.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#e2e8f5]"></div>
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Slow Moving</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-24">
                        {/* Top Fast-Moving */}
                        <div className="space-y-10">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                                <div className="flex items-center space-x-2.5">
                                    <ZapIcon className="w-4 h-4 text-[#4f46e5]" />
                                    <h4 className="text-[12px] font-black text-[#4f46e5] tracking-[0.15em] uppercase">Top Fast-Moving Items</h4>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Exit Vol / Week</span>
                            </div>
                            <div className="space-y-10">
                                {data?.fast_moving?.length > 0 ? data.fast_moving.map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-[14px] font-black text-[#1a202c] mb-3">
                                            <span>{item.name}</span>
                                            <span className="text-[#4f46e5]">{item.val}</span>
                                        </div>
                                        <div className="h-2 bg-[#f1f4f9] rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] rounded-full shadow-[0_2px_8px_rgba(79,70,229,0.2)] transition-all duration-1000" style={{ width: `${item.pct}%` }}></div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-gray-400 font-bold italic">No fast moving items found</div>
                                )}
                            </div>
                        </div>

                        {/* Slow Moving */}
                        <div className="space-y-10">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                                <div className="flex items-center space-x-2.5">
                                    <HourglassIcon className="w-4 h-4 text-gray-400" />
                                    <h4 className="text-[12px] font-black text-gray-500 tracking-[0.15em] uppercase">Slow-Moving (Dead Stock)</h4>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dwell Time (Days)</span>
                            </div>
                            <div className="space-y-10">
                                {data?.slow_moving?.length > 0 ? data.slow_moving.map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-[14px] font-black text-[#1a202c] mb-3">
                                            <span>{item.name}</span>
                                            <span className="text-gray-400">{item.val}</span>
                                        </div>
                                        <div className="h-2 bg-[#f1f4f9] rounded-full overflow-hidden">
                                            <div className="h-full bg-[#a0aec0] rounded-full transition-all duration-1000" style={{ width: `${item.pct}%` }}></div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-gray-400 font-bold italic">No dead stock detected</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 flex justify-center">
                        <button className="text-[11px] font-black text-[#4f46e5] uppercase tracking-[0.25em] flex items-center group bg-[#f0f2ff] px-6 py-3 rounded-xl hover:bg-indigo-100 transition-all">
                            DEEP DIVE INVENTORY KINETICS
                            <span className="ml-3 group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>
                </div>

                {/* Photo 2 Content: Architect */}
                <div className="bg-white rounded-[40px] p-12 border border-[#edf2f7] shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
                    <div className="mb-12">
                        <h2 className="text-[22px] font-black text-[#1a202c]">Custom Report Architect</h2>
                        <p className="text-[14px] font-bold text-gray-400 mt-1.5">Drag and drop metrics to build dynamic intelligence views</p>
                    </div>

                    <div className="grid grid-cols-12 gap-12">
                        <div className="col-span-5 flex flex-col justify-between">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 tracking-[0.25em] uppercase ml-1">Data Source</h4>
                                    {[
                                        { id: 'inventory', icon: BoxIcon, label: 'Inventory Levels', hasData: true },
                                        { id: 'fleet', icon: TruckIcon, label: 'Vehicle Fleet', hasData: false },
                                        { id: 'cost', icon: CreditCardIcon, label: 'Cost Analysis', hasData: false }
                                    ].map((item) => (
                                        <div 
                                            key={item.id} 
                                            onClick={() => item.hasData && setSelectedDataSource(item.id)}
                                            className={`flex items-center space-x-4 p-4 rounded-xl border transition-all cursor-pointer group relative ${!item.hasData ? 'opacity-40 grayscale cursor-not-allowed bg-gray-50 border-transparent' : selectedDataSource === item.id ? 'bg-white border-[#4f46e5] shadow-lg shadow-indigo-100/30 ring-2 ring-indigo-50' : 'bg-[#f8f9fb] border-transparent hover:bg-white hover:border-gray-100'}`}
                                        >
                                            <div className={`w-[42px] h-[42px] shadow-sm rounded-lg flex items-center justify-center transition-transform ${selectedDataSource === item.id ? 'bg-[#4f46e5] scale-110' : 'bg-white group-hover:scale-110'}`}>
                                                <item.icon className={`w-5 h-5 ${selectedDataSource === item.id ? 'text-white' : 'text-[#4f46e5]'}`} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-[14px] font-bold tracking-tight ${selectedDataSource === item.id ? 'text-[#4f46e5]' : 'text-[#1a202c]'}`}>{item.label}</span>
                                                {!item.hasData && <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">No Data</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-gray-400 tracking-[0.25em] uppercase ml-1">Visualization</h4>
                                    <div className="space-y-4">
                                        {[
                                            { id: 'bar', icon: BarChartIcon, label: 'Bar Chart' },
                                            { id: 'kinetic', icon: ActivityIcon, label: 'Kinetic Path' },
                                            { id: 'distribution', icon: PieChartIcon, label: 'Distribution' }
                                        ].map((item) => (
                                            <div 
                                                key={item.id} 
                                                onClick={() => setSelectedVisualization(item.id)}
                                                className={`flex items-center space-x-4 p-4 rounded-xl border transition-all cursor-pointer group ${selectedVisualization === item.id ? 'bg-white border-[#4f46e5] shadow-lg shadow-indigo-100/30 ring-2 ring-indigo-50' : 'bg-[#f8f9fb] border-transparent hover:bg-white hover:border-gray-100'}`}
                                            >
                                                <div className={`w-[42px] h-[42px] shadow-sm rounded-lg flex items-center justify-center transition-transform ${selectedVisualization === item.id ? 'bg-[#4f46e5] scale-110' : 'bg-white group-hover:scale-110'}`}>
                                                    <item.icon className={`w-5 h-5 ${selectedVisualization === item.id ? 'text-white' : 'text-[#4f46e5]'}`} />
                                                </div>
                                                <span className={`text-[14px] font-bold tracking-tight ${selectedVisualization === item.id ? 'text-[#4f46e5]' : 'text-[#1a202c]'}`}>{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button className="mt-12 w-full py-4 bg-gray-900 text-white font-black rounded-xl text-[12px] tracking-widest uppercase hover:bg-indigo-600 hover:scale-[1.02] transition-all shadow-xl active:scale-95">
                                Export Current View
                            </button>
                        </div>

                        {/* Preview Area - Dynamic Logic */}
                        <div className="col-span-7 bg-[#fcfdfe] rounded-[40px] p-10 flex flex-col items-center justify-center relative min-h-[480px] border border-[#f1f5f9] shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
                            <div className="absolute top-10 right-10 flex space-x-2">
                                <div className={`w-2 h-2 rounded-full ${isPreviewLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'}`}></div>
                            </div>
                            
                            <div className={`w-full flex-1 flex flex-col items-center justify-center text-center p-6 transition-all duration-500 ${isPreviewLoading ? 'opacity-20 blur-sm scale-95' : 'opacity-100 blur-0 scale-100'}`}>
                                <div className="w-full flex justify-between items-start mb-10 px-4 text-left">
                                    <div>
                                        <h3 className="text-[20px] font-black text-[#1e293b] tracking-tight">
                                            {selectedDataSource === 'inventory' ? 'Inventory Levels' : selectedDataSource === 'fleet' ? 'Fleet / Shipment Activity' : 'Cost Analysis'}
                                        </h3>
                                        <p className="text-[12px] font-bold text-gray-400 mt-1 uppercase tracking-[0.1em]">
                                            {selectedVisualization === 'bar' ? 'Categorical Volume' : selectedVisualization === 'kinetic' ? 'Active Kinetic Path' : 'Structural Distribution'}
                                        </p>
                                    </div>
                                    <div className="bg-white shadow-sm p-3 rounded-xl border border-gray-100">
                                        <ClockIcon className="w-5 h-5 text-indigo-500" />
                                    </div>
                                </div>

                                <div className="w-full h-full flex flex-col items-center justify-center min-h-[220px]">
                                    {/* Inline styles for custom animations */}
                                    <style dangerouslySetInnerHTML={{ __html: `
                                        @keyframes kinetic-dash {
                                            to { stroke-dashoffset: 0; }
                                        }
                                        @keyframes pulse-ring {
                                            0% { transform: scale(0.95); opacity: 0.5; }
                                            50% { transform: scale(1.05); opacity: 0.8; }
                                            100% { transform: scale(0.95); opacity: 0.5; }
                                        }
                                    `}} />

                                    {selectedVisualization === 'bar' && (
                                        <div className="w-full flex items-end justify-between space-x-3 px-4 h-[180px]">
                                            {(selectedDataSource === 'inventory' ? (data.distribution || []) : 
                                              selectedDataSource === 'fleet' ? [{name: 'Transit', total_qty: data.shipment_stats?.transit || 5}, {name: 'Delivered', total_qty: data.shipment_stats?.delivered || 12}, {name: 'Total', total_qty: data.shipment_stats?.total || 17}] : 
                                              (data.distribution || [])).map((d, i) => {
                                                const val = selectedDataSource === 'cost' ? d.total_value : d.total_qty;
                                                const max = selectedDataSource === 'cost' ? Math.max(...(data.distribution || []).map(x => x.total_value), 1) : Math.max(...(data.distribution || []).map(x => x.total_qty), i === 0 ? 100 : 1);
                                                const h = (val / max) * 100;
                                                return (
                                                    <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end">
                                                        <div className="relative w-full h-full flex items-end">
                                                            <div 
                                                                style={{ 
                                                                    height: `${Math.max(h, 8)}%`, 
                                                                    transitionDelay: `${i * 50}ms`,
                                                                    animation: 'pulse-ring 3s ease-in-out infinite'
                                                                }} 
                                                                className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-lg group-hover:from-indigo-600 group-hover:to-indigo-500 transition-all duration-700 shadow-[0_4px_12px_rgba(79,70,229,0.1)]"
                                                            ></div>
                                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-gray-900 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-50 transform translate-y-2 group-hover:translate-y-0">
                                                                {selectedDataSource === 'cost' ? `Rp ${Math.round(val/1000000)}M` : `${Math.round(val)} Units`}
                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-placeholder border-4 border-transparent border-t-gray-900 border-x-transparent border-b-transparent"></div>
                                                            </div>
                                                        </div>
                                                        <span className="mt-4 text-[9px] font-black text-gray-400 uppercase tracking-tighter truncate w-full text-center group-hover:text-indigo-600 transition-colors">{d.name || d.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {selectedVisualization === 'kinetic' && (
                                        <div className="w-full h-[180px] px-4 flex items-center justify-center relative">
                                            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100">
                                                <defs>
                                                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="rgba(79, 70, 229, 0)" />
                                                        <stop offset="50%" stopColor="rgba(79, 70, 229, 1)" />
                                                        <stop offset="100%" stopColor="rgba(124, 58, 237, 1)" />
                                                    </linearGradient>
                                                </defs>
                                                <path 
                                                    d="M0,50 Q100,20 200,80 T400,30" 
                                                    fill="none" 
                                                    stroke="url(#grad)" 
                                                    strokeWidth="4" 
                                                    strokeLinecap="round"
                                                    style={{ strokeDasharray: '800', strokeDashoffset: '800', animation: 'kinetic-dash 3s linear infinite' }}
                                                />
                                                <circle cx="200" cy="80" r="4" fill="#4f46e5" className="animate-pulse shadow-[0_0_15px_#4f46e5]" />
                                            </svg>
                                            <div className="absolute bottom-0 text-[11px] font-black text-gray-300 tracking-[0.2em] uppercase">
                                                Active Kinetic Movement Tracking ...
                                            </div>
                                        </div>
                                    )}

                                    {selectedVisualization === 'distribution' && (
                                        <div className="w-full flex items-center justify-center space-x-12 h-[200px]">
                                            <div className="relative w-36 h-36">
                                                <svg className="w-full h-full -rotate-90 hover:scale-105 transition-transform" viewBox="0 0 36 36">
                                                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#f1f5f9" strokeWidth="2.5" />
                                                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#4f46e5" strokeWidth="3" strokeDasharray="70 100" strokeLinecap="round" />
                                                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#818cf8" strokeWidth="3" strokeDasharray="20 100" strokeDashoffset="-70" strokeLinecap="round" />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center flex-col text-center">
                                                    <span className="text-[22px] font-black text-[#1e293b]">{data.total_stock > 1000 ? (data.total_stock/1000).toFixed(1) + 'k' : data.total_stock}</span>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Storage Cap</span>
                                                </div>
                                            </div>
                                            <div className="space-y-4 text-left">
                                                {(data.distribution || []).slice(0, 3).map((d, i) => (
                                                    <div key={i} className="flex items-center space-x-3 group cursor-default">
                                                        <div className={`w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125 ${i === 0 ? 'bg-indigo-500' : i === 1 ? 'bg-indigo-300' : 'bg-gray-200'}`}></div>
                                                        <div>
                                                            <div className="text-[12px] font-black text-[#1e293b] group-hover:text-indigo-600 transition-colors">{d.name}</div>
                                                            <div className="text-[10px] font-bold text-gray-400 uppercase">{Math.round(d.total_qty)} Units</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <button className="mt-12 w-full py-4 bg-[#fcfdfe] text-[#1e293b] font-black rounded-xl text-[12px] tracking-widest uppercase border border-gray-100 hover:bg-gray-50 hover:scale-[1.02] transition-all shadow-sm active:scale-95">
                                    Export Analysis Image
                                </button>
                            </div>
                            
                            {/* Stylized background grid for light theme */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
                        </div>
                    </div>
                </div>

                {/* Recent Generated Reports Table */}
                <div className="bg-white rounded-[40px] p-12 border border-[#edf2f7] shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
                    <div className="flex justify-between items-center mb-12">
                        <h2 className="text-[22px] font-black text-[#1a202c]">Recent Generated Reports</h2>
                        <button className="flex items-center space-x-3 px-5 py-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                            <span className="text-[13px] font-black text-[#1a202c] tracking-tight">Filter</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-gray-100">
                                <tr>
                                    <th className="pb-6 pl-4 text-[10px] font-black text-gray-400 tracking-[0.25em] uppercase">Report Name</th>
                                    <th className="pb-6 text-[10px] font-black text-gray-400 tracking-[0.25em] uppercase">Created By</th>
                                    <th className="pb-6 text-[10px] font-black text-gray-400 tracking-[0.25em] uppercase">Status</th>
                                    <th className="pb-6 text-[10px] font-black text-gray-400 tracking-[0.25em] uppercase">Date</th>
                                    <th className="pb-6 text-right pr-4 text-[10px] font-black text-gray-400 tracking-[0.25em] uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {reports?.length > 0 ? reports.map((report, i) => (
                                    <tr key={i} className="group hover:bg-gray-50 transition-all cursor-pointer">
                                        <td className="py-8 pl-4 flex items-center space-x-5">
                                            <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:bg-[#4f46e5] group-hover:text-white group-hover:rotate-6 transition-all duration-300">
                                                <DocumentIcon2 className="w-5.5 h-5.5" />
                                            </div>
                                            <span className="text-[15px] font-black text-[#1a202c] tracking-tight">{report.name}</span>
                                        </td>
                                        <td className="py-8 text-[14px] font-bold text-gray-500 tracking-tight">{report.by}</td>
                                        <td className="py-8">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] ${report.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100/50' : 'bg-amber-50 text-amber-500 border border-amber-100/50'}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="py-8 text-[14px] font-bold text-gray-500 tracking-tight">{report.date}</td>
                                        <td className="py-8 text-right pr-12">
                                            <button 
                                                onClick={() => handleDownload(report.id)}
                                                className="text-indigo-600 hover:scale-125 transition-all"
                                            >
                                                {report.status === 'COMPLETED' ? <DownloadIcon2 className="w-6 h-6" /> : <ClockIcon className="w-6 h-6 text-gray-300" />}
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center text-gray-400 font-bold italic">
                                            No reports generated yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}

const DocumentIcon2 = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
