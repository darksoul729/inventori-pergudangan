import React from 'react';
import { Link, usePage } from '@inertiajs/react';

// Sidebar Icons
const CubeIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
);
const GridIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);
const HomeIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h2m14-11v10a1 1 0 01-1 1h-2m0-14l7 4v10a1 1 0 01-1 1H3a1 1 0 01-1-1V9l7-4z" />
    </svg>
);
const BoxIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.325 15.582l-6.332-6.332m0 0L18.49 3.091A1.5 1.5 0 0018 2h-4.5a1.5 1.5 0 00-1.5 1.5v6M12 21h-9a1.5 1.5 0 01-1.5-1.5v-15A1.5 1.5 0 013 3h9m0 0V1.5a1.5 1.5 0 011.5-1.5H18a1.5 1.5 0 011.5 1.5V9" />
    </svg>
);
const DocumentIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const UsersIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 19H9a6 6 0 0112 0v1H3v-1a6 6 0 0112 0z" />
    </svg>
);
const ChartIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const TruckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001-1v-4a1 1 0 011-1h4m0 0a1 1 0 011-1h2m-2 1V5" />
    </svg>
);
const ShoppingCartIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

// Header Icons
const SearchIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);
const BellIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);
const HelpCircleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function DashboardLayout({ children, headerTitle, headerSearchPlaceholder, searchValue, onSearch, headerRight }) {
    const { url } = usePage();
    const isActive = (path) => url.startsWith(path);

    return (
        <div className="flex h-screen bg-[#f8f9fc] font-sans antialiased text-gray-900">
            {/* Sidebar */}
            <div className="w-[270px] bg-white flex flex-col justify-between flex-shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative border-r border-[#edf2f7]">
                <div>
                     {/* Logo Area */}
                     <div className="px-8 py-9 border-b border-gray-50/50">
                         <div className="flex items-center space-x-3.5">
                             <div className="w-[42px] h-[42px] bg-[#3632c0] rounded-[14px] flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200/50">
                                 <CubeIcon className="w-[20px] h-[20px] text-white" />
                             </div>
                             <div>
                                 <h1 className="text-[18px] font-extrabold text-[#1a202c] tracking-tight leading-tight">Aether Logistix</h1>
                                 <p className="text-[10px] font-bold text-gray-500 tracking-wider mt-0.5">KINETIC ARCHITECT V1.0</p>
                             </div>
                         </div>
                     </div>

                     {/* Navigation */}
                     <nav className="px-5 space-y-2 mt-4">
                          <Link href="/dashboard" className={`flex items-center space-x-3.5 px-5 py-3.5 rounded-2xl font-bold text-[13px] transition-colors ${isActive('/dashboard') ? 'bg-white text-[#3632c0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                             <GridIcon className="w-5 h-5" />
                             <span>Dashboard</span>
                          </Link>
                          <Link href="/warehouse" className={`flex items-center space-x-3.5 px-5 py-3.5 rounded-2xl font-bold text-[13px] transition-colors ${isActive('/warehouse') ? 'bg-white text-[#3632c0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                             <HomeIcon className="w-5 h-5" />
                             <span className={isActive('/warehouse') ? '' : 'text-gray-500'}>Warehouse Management</span>
                          </Link>
                          <Link href="/inventory" className={`flex items-center space-x-3.5 px-5 py-3.5 rounded-2xl font-bold text-[13px] transition-colors ${isActive('/inventory') ? 'bg-white text-[#3632c0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                             <BoxIcon className="w-5 h-5" />
                             <span className={isActive('/inventory') ? '' : 'text-gray-500'}>Inventory</span>
                          </Link>
                          <Link href="/transaction" className={`flex items-center space-x-3.5 px-5 py-3.5 rounded-2xl font-bold text-[13px] transition-colors ${isActive('/transaction') ? 'bg-white text-[#3632c0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                             <DocumentIcon className="w-5 h-5" />
                             <span className={isActive('/transaction') ? '' : 'text-gray-500'}>Transaction</span>
                          </Link>
                          <Link href="/purchase-orders" className={`flex items-center space-x-3.5 px-5 py-3.5 rounded-2xl font-bold text-[13px] transition-colors ${isActive('/purchase-orders') ? 'bg-white text-[#3632c0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                             <ShoppingCartIcon className="w-5 h-5" />
                             <span className={isActive('/purchase-orders') ? '' : 'text-gray-500'}>Purchase Orders</span>
                          </Link>
                          <Link href="/supplier" className={`flex items-center space-x-3.5 px-5 py-3.5 rounded-2xl font-bold text-[13px] transition-colors ${isActive('/supplier') ? 'bg-white text-[#3632c0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                             <UsersIcon className="w-5 h-5" />
                             <span className={isActive('/supplier') ? '' : 'text-gray-500'}>Suppliers</span>
                          </Link>
                          <Link href="/reports" className={`flex items-center space-x-3.5 px-5 py-3.5 rounded-2xl font-bold text-[13px] transition-colors ${isActive('/reports') ? 'bg-white text-[#3632c0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                             <ChartIcon className="w-5 h-5" />
                             <span className={isActive('/reports') ? '' : 'text-gray-500'}>Reports</span>
                          </Link>
                          <a href="#" className="flex items-center space-x-3.5 px-5 py-3.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-2xl font-bold text-[13px] transition-colors">
                             <TruckIcon className="w-5 h-5" />
                             <span className="text-gray-500">Shipments</span>
                          </a>
                     </nav>
                </div>
                
                {/* Bottom Actions Panel */}
                <div className="px-5 pb-8 flex flex-col space-y-4">
                    <Link href="/purchase-orders/create" className="flex items-center justify-center space-x-2 w-full py-3.5 bg-white border border-gray-200 text-[#1a202c] font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all">
                        <span className="text-lg leading-none font-medium text-indigo-600">+</span>
                        <span className="text-[13px]">New Buy Order</span>
                    </Link>
                    <Link href="/inventory?view=outbound" className="flex items-center justify-center space-x-2 w-full py-3.5 bg-[#4f46e5] text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:bg-indigo-700 transition-all">
                        <span className="text-lg leading-none font-medium">+</span>
                        <span className="text-[13px]">New Shipment</span>
                    </Link>
                    
                    <a href="#" className="flex items-center space-x-3 px-2 text-gray-500 hover:text-gray-700 transition-colors">
                        <HelpCircleIcon className="w-[18px] h-[18px]" />
                        <span className="text-[12px] font-bold">Help Center</span>
                    </a>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#f8f9fc]">
                {/* Header */}
                <header className="h-[76px] flex items-center justify-between px-10 flex-shrink-0 z-10 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.015)] border-b border-[#edf2f7]">
                    <div className="flex items-center space-x-4">
                        {headerTitle && (
                            <h2 className="text-[18px] font-black text-[#1a202c] mr-4">{headerTitle}</h2>
                        )}
                        <div className="flex-1 min-w-[380px] relative">
                            <SearchIcon className="w-[17px] h-[17px] absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder={headerSearchPlaceholder || "Search engine..."}
                                className="w-full bg-[#f4f5f9] text-[13px] text-gray-700 rounded-[10px] pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3632c0] border border-transparent transition-all font-bold placeholder-gray-400 transition-all duration-200"
                                value={searchValue || ''}
                                onChange={(e) => onSearch && onSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-8">
                        {headerRight ? headerRight : (
                            <>
                                <div className="flex items-center space-x-5 text-gray-500">
                                    <button className="hover:text-gray-900 transition-colors relative">
                                        <BellIcon className="w-[22px] h-[22px]" />
                                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#ef4444] rounded-full border-[2px] border-white"></span>
                                    </button>
                                    <button className="hover:text-gray-900 transition-colors">
                                        <HelpCircleIcon className="w-[22px] h-[22px]" />
                                    </button>
                                </div>

                                <div className="h-8 w-[1px] bg-gray-100"></div>

                                <div className="flex items-center space-x-3 pl-2 cursor-pointer group">
                                     <div className="flex flex-col text-right">
                                         <span className="text-[13px] font-extrabold text-[#1a202c] group-hover:text-[#4f46e5] transition-colors leading-tight">Adrian Thorne</span>
                                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Operations Lead</span>
                                     </div>
                                     <div className="w-[42px] h-[42px] rounded-full bg-[#f0f4f8] flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm overflow-hidden group-hover:border-indigo-100 transition-all">
                                         <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                             <path fillRule="evenodd" clipRule="evenodd" d="M18 20.5C13.5 20.5 10 23.5 9 28C11 31.5 14 34 18 34C22 34 25 31.5 27 28C26 23.5 22.5 20.5 18 20.5Z" fill="#187296" />
                                             <path d="M15 20.5L18 25.5L21 20.5H15Z" fill="#ffffff" />
                                             <circle cx="18" cy="14.5" r="4.5" fill="#fbd29e" />
                                             <path d="M13.5 14.5C13.5 10.5 15.5 9.5 18 9.5C20.5 9.5 22.5 10.5 22.5 14.5C22.5 14.5 23.5 14.5 23 12.5C22.5 10.5 21 8.5 18 8.5C15 8.5 13.5 10.5 13 12.5C12.5 14.5 13.5 14.5 13.5 14.5Z" fill="#111827" />
                                         </svg>
                                     </div>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                {/* Dashboard Scrollable Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto px-10 pt-8 pb-32 scroll-smooth">
                    <div className="max-w-[1400px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}