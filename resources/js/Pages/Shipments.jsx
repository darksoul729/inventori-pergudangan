import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import React, { useState } from 'react';

// Icons
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

const CheckCircleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const TruckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001-1v-4a1 1 0 011-1h4m0 0a1 1 0 011-1h2m-2 1V5" />
    </svg>
);

const MapPinIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const SearchIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const FilterIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
);

const ChevronRightIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

export default function Shipments({ shipments = [], stats = {} }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('id');

    // Default stats if not provided
    const defaultStats = {
        in_transit: 1284,
        in_transit_trend: '+12%',
        delayed: 14,
        delayed_trend: '-3%',
        delivered_today: 342,
        delivered_trend: 'Optimal',
        sea_freight: 642,
        air_cargo: 128,
        ground: 514
    };

    const currentStats = { ...defaultStats, ...stats };

    // Default shipments data if not provided
    const defaultShipments = [
        {
            id: 'TRK-10293',
            origin: 'LHR',
            origin_name: 'London, UK',
            destination: 'JFK',
            destination_name: 'New York, USA',
            status: 'on-time',
            estimated_arrival: 'Oct 24, 14:30',
            load_type: 'air'
        },
        {
            id: 'TRK-10294',
            origin: 'SIN',
            origin_name: 'Singapore',
            destination: 'DXB',
            destination_name: 'Dubai, UAE',
            status: 'delayed',
            estimated_arrival: 'Oct 24, 18:45',
            load_type: 'sea'
        },
        {
            id: 'TRK-10295',
            origin: 'HAM',
            origin_name: 'Hamburg, GER',
            destination: 'PVG',
            destination_name: 'Shanghai, CN',
            status: 'on-time',
            estimated_arrival: 'Oct 25, 09:15',
            load_type: 'sea'
        }
    ];

    const currentShipments = shipments.length > 0 ? shipments : defaultShipments;

    // Filter and search logic
    const filteredShipments = currentShipments.filter(shipment => {
        const matchesSearch = shipment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            shipment.origin_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            shipment.destination_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || shipment.status === filterStatus;
        return matchesSearch && matchesFilter;
    }).sort((a, b) => {
        if (sortBy === 'date') {
            return new Date(b.estimated_arrival) - new Date(a.estimated_arrival);
        }
        return a.id.localeCompare(b.id);
    });

    const getStatusBadge = (status) => {
        const statusMap = {
            'on-time': { label: 'ON TIME', color: 'bg-blue-100 text-blue-700', icon: CheckCircleIcon },
            'delayed': { label: 'DELAYED', color: 'bg-red-100 text-red-700', icon: AlertCircleIcon },
            'in-transit': { label: 'IN TRANSIT', color: 'bg-yellow-100 text-yellow-700', icon: TruckIcon }
        };
        return statusMap[status] || statusMap['in-transit'];
    };

    const getLoadTypeIcon = (loadType) => {
        const icons = {
            'sea': '⛵',
            'air': '✈️',
            'ground': '🚚'
        };
        return icons[loadType] || '📦';
    };

    return (
        <DashboardLayout>
            <Head title="Shipments" />

            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-[26px] font-black text-[#1a202c] tracking-tight">Active Shipments Tracking</h1>
                    <p className="text-[14px] font-semibold text-gray-500 mt-1">Real-time global logistics oversight and AI optimization engine</p>
                </div>
                <button className="px-6 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold rounded-lg transition-colors flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Run Optimization</span>
                </button>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                    <div className="flex justify-between items-start mb-5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
                            <TruckIcon className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-blue-50 text-blue-600 tracking-wide">+12%</span>
                    </div>
                    <div className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-1.5 uppercase">In Transit</div>
                    <div className="text-[24px] font-black text-[#1a202c]">{currentStats.in_transit.toLocaleString()}</div>
                </div>

                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                    <div className="flex justify-between items-start mb-5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 text-red-600">
                            <AlertCircleIcon className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-red-50 text-red-600 tracking-wide">-3%</span>
                    </div>
                    <div className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-1.5 uppercase">Delayed</div>
                    <div className="text-[24px] font-black text-[#1a202c]">{currentStats.delayed}</div>
                </div>

                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                    <div className="flex justify-between items-start mb-5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-50 text-yellow-600">
                            <CheckCircleIcon className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-yellow-50 text-yellow-600 tracking-wide">Optimal</span>
                    </div>
                    <div className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-1.5 uppercase">Delivered Today</div>
                    <div className="text-[24px] font-black text-[#1a202c]">{currentStats.delivered_today}</div>
                </div>

                <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                    <div className="text-[10px] font-extrabold text-gray-400 tracking-wider mb-4 uppercase">Global Network</div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[12px] font-semibold text-gray-600">Sea Freight</span>
                            <span className="text-[14px] font-black text-blue-600">{currentStats.sea_freight}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[12px] font-semibold text-gray-600">Air Cargo</span>
                            <span className="text-[14px] font-black text-purple-600">{currentStats.air_cargo}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[12px] font-semibold text-gray-600">Ground</span>
                            <span className="text-[14px] font-black text-gray-600">{currentStats.ground}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Network Map */}
            <div className="bg-white rounded-[24px] p-6 mb-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[16px] font-black text-[#1a202c]">LIVE GLOBAL NETWORK</h2>
                    <div className="flex space-x-2">
                        <button className="w-10 h-10 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center border border-gray-200 transition-colors">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                        </button>
                        <button className="w-10 h-10 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center border border-gray-200 transition-colors">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                {/* Map Placeholder - showing network routes */}
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-[20px] h-[350px] overflow-hidden">
                    {/* Network visualization background */}
                    <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
                        <defs>
                            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5" opacity="0.1"/>
                            </pattern>
                        </defs>
                        <rect width="1000" height="500" fill="url(#grid)" />
                    </svg>

                    {/* Connection lines */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
                        {/* Atlantic Route */}
                        <path d="M 150 200 Q 400 150 650 180" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.6"/>
                        {/* Pacific Route */}
                        <path d="M 200 250 Q 450 280 750 240" stroke="#8b5cf6" strokeWidth="2" fill="none" opacity="0.6"/>
                        {/* Asia Route */}
                        <path d="M 650 180 Q 700 220 800 200" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.6"/>
                        
                        {/* Hub nodes */}
                        <circle cx="150" cy="200" r="8" fill="#3b82f6"/>
                        <circle cx="650" cy="180" r="8" fill="#3b82f6"/>
                        <circle cx="200" cy="250" r="6" fill="#8b5cf6"/>
                        <circle cx="750" cy="240" r="6" fill="#8b5cf6"/>
                        <circle cx="800" cy="200" r="6" fill="#10b981"/>
                    </svg>

                    {/* Network info */}
                    <div className="absolute top-4 left-4 bg-white bg-opacity-90 backdrop-blur rounded-lg p-3 z-10">
                        <div className="text-[12px] font-black text-gray-700 tracking-wide uppercase mb-2">LIVE GLOBAL NETWORK</div>
                        <div className="flex space-x-4 text-[12px]">
                            <div className="flex items-center space-x-1">
                                <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
                                <span className="font-semibold text-gray-600">Atlantic Route A-4</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
                                <span className="font-semibold text-gray-600">Pacific Hub 12</span>
                                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 font-bold rounded text-[10px]">Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Transport modes legend */}
                    <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 backdrop-blur rounded-lg p-3 z-10">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-[14px] font-black text-blue-600 mb-1">642</div>
                                <div className="text-[11px] font-semibold text-gray-600">SEA FREIGHT</div>
                            </div>
                            <div>
                                <div className="text-[14px] font-black text-purple-600 mb-1">128</div>
                                <div className="text-[11px] font-semibold text-gray-600">AIR CARGO</div>
                            </div>
                            <div>
                                <div className="text-[14px] font-black text-gray-600 mb-1">514</div>
                                <div className="text-[11px] font-semibold text-gray-600">GROUND</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shipment Pipeline Table */}
            <div className="bg-white rounded-[24px] p-7 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[16px] font-black text-[#1a202c]">SHIPMENT PIPELINE</h2>
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Shipment ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 text-[13px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button className="px-4 py-2 text-[13px] font-semibold text-gray-600 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-1.5">
                            <FilterIcon className="w-4 h-4" />
                            <span>Filter</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="px-4 py-3.5 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Shipment ID</th>
                                <th className="px-4 py-3.5 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Origin / Destination</th>
                                <th className="px-4 py-3.5 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Status</th>
                                <th className="px-4 py-3.5 text-left text-[11px] font-black text-gray-500 uppercase tracking-wide">Estimated Arrival</th>
                                <th className="px-4 py-3.5 text-center text-[11px] font-black text-gray-500 uppercase tracking-wide">Load Type</th>
                                <th className="px-4 py-3.5 text-center text-[11px] font-black text-gray-500 uppercase tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredShipments.map((shipment, index) => {
                                const statusInfo = getStatusBadge(shipment.status);
                                return (
                                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 text-[13px] font-bold text-blue-600">#{shipment.id}</td>
                                        <td className="px-4 py-4">
                                            <div className="text-[13px] font-semibold text-gray-800">{shipment.origin} → {shipment.destination}</div>
                                            <div className="text-[12px] text-gray-500 mt-0.5">{shipment.origin_name} — {shipment.destination_name}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-3 py-1 text-[10px] font-black rounded-lg ${statusInfo.color}`}>
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-[13px] font-semibold text-gray-800">{shipment.estimated_arrival}</div>
                                        </td>
                                        <td className="px-4 py-4 text-center text-[18px]">
                                            {getLoadTypeIcon(shipment.load_type)}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button className="w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center">
                                                <ChevronRightIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Show more link */}
                <div className="flex justify-center mt-6 pt-4 border-t border-gray-100">
                    <button className="text-[12px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
                        View All Active Pipeline Manifests
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
