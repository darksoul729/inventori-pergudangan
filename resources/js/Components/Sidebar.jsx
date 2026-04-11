import { Link } from '@inertiajs/react';
import { useState } from 'react';

const IconDashboard = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h2m14-11v10a1 1 0 01-1 1h-2m0-14l7 4v10a1 1 0 01-1 1H3a1 1 0 01-1-1V9l7-4z" />
    </svg>
);

const IconPackage = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.325 15.582l-6.332-6.332m0 0L18.49 3.091A1.5 1.5 0 0018 2h-4.5a1.5 1.5 0 00-1.5 1.5v6M12 21h-9a1.5 1.5 0 01-1.5-1.5v-15A1.5 1.5 0 013 3h9m0 0V1.5a1.5 1.5 0 011.5-1.5H18a1.5 1.5 0 011.5 1.5V9" />
    </svg>
);

const IconBoxes = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
);

const IconTrendingUp = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const IconUsers = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 19H9a6 6 0 0112 0v1H3v-1a6 6 0 0112 0z" />
    </svg>
);

const IconFileText = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const IconTruck = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001-1v-4a1 1 0 011-1h4m0 0a1 1 0 011-1h2m-2 1V5" />
    </svg>
);

const IconMenu = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const IconX = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const IconLogOut = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

export default function Sidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const currentRoute = typeof route !== 'undefined' ? route().current() : 'dashboard';

    const navigationItems = [
        {
            name: 'Dashboard',
            href: typeof route !== 'undefined' ? route('dashboard') : '#',
            icon: IconDashboard,
            active: currentRoute === 'dashboard'
        },
        {
            name: 'Warehouse Management',
            href: '#',
            icon: IconPackage,
            active: false
        },
        {
            name: 'Inventory',
            href: '#',
            icon: IconBoxes,
            active: false
        },
        {
            name: 'Transaction',
            href: '#',
            icon: IconTrendingUp,
            active: false
        },
        {
            name: 'Suppliers',
            href: '#',
            icon: IconUsers,
            active: false
        },
        {
            name: 'Reports',
            href: '#',
            icon: IconFileText,
            active: false
        },
        {
            name: 'Shipments',
            href: '#',
            icon: IconTruck,
            active: false
        },
    ];

    return (
        <div
            className={`${
                sidebarOpen ? 'w-64' : 'w-20'
            } bg-white text-gray-900 transition-all duration-300 flex flex-col fixed h-screen border-r border-gray-200`}
        >
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    {sidebarOpen && (
                        <div>
                            <div className="flex items-center space-x-2 mb-1">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">⚡</span>
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-900">Aether</h1>
                                    <p className="text-xs text-gray-500">Logistix</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
                    >
                        {sidebarOpen ? <IconX /> : <IconMenu />}
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
                {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                                item.active
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            title={!sidebarOpen ? item.name : ''}
                        >
                            <Icon />
                            {sidebarOpen && (
                                <span className="text-sm font-medium">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Menu Bottom */}
            <div className="border-t border-gray-200 p-3 space-y-2">
                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.172l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {sidebarOpen && <span className="text-sm">Support</span>}
                </button>
                <Link href={typeof route !== 'undefined' ? route('logout') : '#'} method="post" as="button" className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition">
                    <IconLogOut />
                    {sidebarOpen && <span className="text-sm">Sign Out</span>}
                </Link>
            </div>
        </div>
    );
}
