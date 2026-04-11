export default function StockMovementTrend() {
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const inboundData = [45, 52, 48, 65, 58, 42, 35];
    const outboundData = [30, 35, 42, 38, 55, 48, 40];

    const maxValue = Math.max(...inboundData, ...outboundData);

    const shipments = [
        { id: '#9821-XP', status: 'DISPATCHED', color: 'bg-blue-100 text-blue-800' },
        { id: '#4412-LQ', status: 'PICKING', color: 'bg-yellow-100 text-yellow-800' },
        { id: '#2210-ST', status: 'ARRIVING (10m)', color: 'bg-green-100 text-green-800' },
        { id: '#10-JK', status: 'STOWED', color: 'bg-gray-100 text-gray-800' },
    ];

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                    Stock Movement Trend
                </h2>
                <p className="text-xs text-gray-600">
                    Daily velocity analytics across all hubs
                </p>
            </div>

            {/* Chart */}
            <div className="mb-8">
                <div className="flex justify-between items-end h-48">
                    {days.map((day, index) => (
                        <div
                            key={day}
                            className="flex-1 flex flex-col items-center justify-end space-y-1.5"
                        >
                            {/* Bars */}
                            <div className="flex items-end justify-center gap-1 h-32 w-full px-1">
                                {/* Inbound Bar */}
                                <div className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition cursor-pointer"
                                    style={{
                                        height: `${(inboundData[index] / maxValue) * 128}px`,
                                    }}
                                    title={`Inbound: ${inboundData[index]}`}
                                ></div>
                                {/* Outbound Bar */}
                                <div className="flex-1 bg-purple-400 rounded-t hover:bg-purple-500 transition cursor-pointer"
                                    style={{
                                        height: `${(outboundData[index] / maxValue) * 128}px`,
                                    }}
                                    title={`Outbound: ${outboundData[index]}`}
                                ></div>
                            </div>
                            {/* Day Label */}
                            <p className="text-xs font-semibold text-gray-700">{day}</p>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex justify-center space-x-6 mt-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Inbound</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-xs text-gray-600">Outbound</span>
                    </div>
                </div>
            </div>

            {/* Live Shipment Status */}
            <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">
                    Live Shipment Status
                </h3>
                <div className="flex flex-wrap gap-2">
                    {shipments.map((shipment) => (
                        <div
                            key={shipment.id}
                            className={`px-3 py-1 rounded font-semibold text-xs ${shipment.color}`}
                        >
                            <span className="font-bold">{shipment.id}</span>
                            {' — '}
                            <span>{shipment.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
