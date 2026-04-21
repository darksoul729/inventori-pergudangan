export default function IntelligenceHub() {
    const ArrowRightIcon = () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
    );
    return (
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-sm">
            <div className="mb-4">
                <h3 className="text-sm font-semibold flex items-center space-x-2 mb-1">
                    <span className="w-1.5 h-1.5 bg-blue-300 rounded-full"></span>
                    <span>Intelligence Hub</span>
                </h3>
                <p className="text-xs text-blue-100 font-semibold">AI FORECAST</p>
            </div>

            <div className="mb-6">
                <p className="text-base font-bold mb-2 leading-tight">
                    Inventory shortage predicted for <span className="text-yellow-300">Region-A</span> within 48 hours.
                </p>
                <p className="text-xs text-blue-100 mb-3">
                    Recommend rerouting 500 units from Warehouse 04.
                </p>
                <button className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition text-xs font-semibold">
                    <span>EXECUTE RECOMMENDATION</span>
                    <ArrowRightIcon />
                </button>
            </div>

            <div>
                <p className="text-xs text-blue-100 font-semibold mb-2">EFFICIENCY SCORE</p>
                <div className="flex items-end space-x-2">
                    <div className="text-3xl font-bold">94.2%</div>
                    <div className="flex-1 ml-2 space-y-1">
                        <div className="w-full bg-blue-900/50 rounded-full h-1"></div>
                        <div className="flex space-x-0.5">
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 h-3 rounded-sm ${i < 6 ? 'bg-blue-300' : 'bg-blue-900/30'
                                        }`}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
