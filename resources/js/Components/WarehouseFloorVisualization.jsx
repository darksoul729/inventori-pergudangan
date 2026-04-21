import { useState } from 'react';

export default function WarehouseFloorVisualization() {
    const [selectedFloor, setSelectedFloor] = useState('floor-02');

    const zones = [
        { id: 'zone-a', x: 25, y: 20, label: 'ZONE-A', status: 'normal', capacity: 75 },
        { id: 'zone-b', x: 70, y: 25, label: 'ZONE-B', status: 'normal', capacity: 90 },
        { id: 'zone-c', x: 25, y: 65, label: 'ZONE-C', status: 'normal', capacity: 88 },
        { id: 'zone-d', x: 75, y: 50, label: 'ZONE-D', status: 'overheat', capacity: 105 },
        { id: 'rack-a12', x: 50, y: 50, label: 'RACK A-12', status: 'normal', capacity: 84 },
    ];

    const getZoneColor = (status, capacity) => {
        if (status === 'overheat') return '#ef4444';
        if (capacity > 100) return '#fbbf24';
        return '#a5d6ff';
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        Warehouse Floor Visualization
                    </h2>
                    <p className="text-xs text-gray-600 mt-1">
                        Real-time heat-map & occupancy tracking
                    </p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setSelectedFloor('floor-01')}
                        className={`px-3 py-1 rounded-lg font-semibold text-sm transition ${selectedFloor === 'floor-01'
                                ? 'bg-gray-200 text-gray-900'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        FLOOR 01
                    </button>
                    <button
                        onClick={() => setSelectedFloor('floor-02')}
                        className={`px-3 py-1 rounded-lg font-semibold text-sm transition ${selectedFloor === 'floor-02'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        FLOOR 02 (MAIN)
                    </button>
                </div>
            </div>

            {/* Heat Map */}
            <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg p-6 mb-4 min-h-72">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                    {/* Background */}
                    <rect width="100" height="100" fill="#f9fafb" />

                    {/* Grid pattern */}
                    <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.2" />
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)" />

                    {/* Zone Circles */}
                    {zones.map((zone) => (
                        <g key={zone.id}>
                            {/* Zone Circle */}
                            <circle
                                cx={zone.x}
                                cy={zone.y}
                                r="10"
                                fill={getZoneColor(zone.status, zone.capacity)}
                                opacity="0.85"
                            />
                            {/* Zone Border */}
                            <circle
                                cx={zone.x}
                                cy={zone.y}
                                r="10"
                                fill="none"
                                stroke={getZoneColor(zone.status, zone.capacity)}
                                strokeWidth="0.5"
                                opacity="0.4"
                            />
                            {/* Zone Label */}
                            <text
                                x={zone.x}
                                y={zone.y + 0.5}
                                textAnchor="middle"
                                fontSize="3.5"
                                fontWeight="bold"
                                fill="#1f2937"
                            >
                                {zone.status === 'overheat' ? '⚠️' : '●'}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>

            {/* Zone Info Cards */}
            <div className="grid grid-cols-2 gap-2">
                {zones.map((zone) => (
                    <div key={zone.id} className="bg-gray-50 rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-sm text-gray-900">
                                {zone.label}
                            </span>
                            <span className="text-lg">
                                {zone.status === 'overheat' ? '🔴' : '🔵'}
                            </span>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-600">Capacity</span>
                                <span className="text-xs font-bold text-gray-900">
                                    {zone.capacity}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-300 rounded-full h-1.5">
                                <div
                                    className={`h-full rounded-full ${zone.capacity > 100
                                            ? 'bg-red-500'
                                            : zone.capacity > 85
                                                ? 'bg-yellow-500'
                                                : 'bg-green-500'
                                        }`}
                                    style={{ width: `${Math.min(zone.capacity, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {zone.status === 'overheat'
                                ? '🔴 TEMP OVERHEAT'
                                : '✓ NORMAL'}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
