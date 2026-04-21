const AlertIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

export default function KPIStats() {
    const stats = [
        {
            label: 'TOTAL SKU',
            value: '14,282',
            icon: '📦',
            trend: '↑ 12.4% MONTHLY',
            trendColor: 'text-green-500',
        },
        {
            label: 'STOK AKTIF',
            value: '89.4%',
            icon: '✓',
            trend: 'OPTIMIZED FLOW',
            trendColor: 'text-blue-600',
            badge: true,
        },
        {
            label: 'ALERTS',
            value: '12',
            icon: AlertIcon,
            trend: '↓ 4 CRITICAL',
            trendColor: 'text-red-500',
        },
        {
            label: 'PERGERAKAN HARI INI',
            value: '2,104',
            icon: '📊',
            trend: 'LAST UPDATED 2M AGO',
            trendColor: 'text-gray-500',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {stat.label}
                        </span>
                        <div className="text-xl opacity-30">
                            {typeof stat.icon === 'string' ? stat.icon : <stat.icon />}
                        </div>
                    </div>

                    <div className="mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">
                            {stat.value}
                        </h3>
                    </div>

                    <div
                        className={`text-xs font-bold ${stat.trendColor} ${stat.badge ? 'bg-blue-50 text-blue-600 inline-block px-2 py-0.5 rounded text-xs' : ''
                            }`}
                    >
                        {stat.trend}
                    </div>
                </div>
            ))}
        </div>
    );
}
