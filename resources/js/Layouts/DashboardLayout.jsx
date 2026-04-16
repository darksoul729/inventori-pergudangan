import React, { useEffect, useRef, useState } from 'react';
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

import Dropdown from '@/Components/Dropdown';

export default function DashboardLayout({
    children,
    headerTitle,
    headerSearchPlaceholder,
    searchValue,
    onSearch,
    headerRight,
    contentClassName = 'max-w-[1400px] mx-auto',
}) {
    const { url, props } = usePage();
    const { auth } = props;
    
    // Notification Read State
    const [readIds, setReadIds] = useState([]);
    const [toastNotifications, setToastNotifications] = useState([]);
    const toastSeenIds = useRef(new Set());
    const audioContextRef = useRef(null);

    useEffect(() => {
        const saved = localStorage.getItem('read_notifications');
        if (saved) setReadIds(JSON.parse(saved));

        const savedToastSeen = sessionStorage.getItem('toast_seen_notifications');
        if (savedToastSeen) {
            toastSeenIds.current = new Set(JSON.parse(savedToastSeen));
        }
    }, []);

    const markAsRead = (id) => {
        const newReadIds = [...readIds, id];
        setReadIds(newReadIds);
        localStorage.setItem('read_notifications', JSON.stringify(newReadIds));
    };

    const activeNotifications = props.notifications?.filter(n => !readIds.includes(n.id)) || [];

    useEffect(() => {
        if (!props.notifications?.length) return;

        const freshNotifications = props.notifications.filter((notification) => {
            if (toastSeenIds.current.has(notification.id)) {
                return false;
            }

            toastSeenIds.current.add(notification.id);
            return true;
        });

        if (freshNotifications.length > 0) {
            sessionStorage.setItem(
                'toast_seen_notifications',
                JSON.stringify(Array.from(toastSeenIds.current))
            );

            setToastNotifications((current) => {
                const merged = [...current, ...freshNotifications].slice(-4);
                return merged;
            });

            const shouldPlayAlert = freshNotifications.some(
                (notification) => notification.type === 'warning' || notification.type === 'error'
            );

            if (shouldPlayAlert) {
                playAlertTone(audioContextRef);
            }
        }
    }, [props.notifications]);

    useEffect(() => {
        if (toastNotifications.length === 0) return undefined;

        const timers = toastNotifications.map((notification) =>
            window.setTimeout(() => {
                setToastNotifications((current) => current.filter((item) => item.id !== notification.id));
            }, 5000)
        );

        return () => timers.forEach((timer) => window.clearTimeout(timer));
    }, [toastNotifications]);

    const isActive = (path) => {
        if (url.includes('view=outbound')) {
            if (path === '/transaction') return true;
            if (path === '/inventory') return false;
        }
        return url === path || url.startsWith(path + '?') || url.startsWith(path + '/');
    };

    return (
        <div className="flex h-screen bg-[#f8f9fc] font-sans antialiased text-gray-900">
            {/* Sidebar */}
            <div className="w-[270px] bg-white flex flex-col justify-between flex-shrink-0 z-[110] shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative border-r border-[#edf2f7]">
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
                             <span>Dasbor</span>
                          </Link>
                          <Link href="/warehouse" className={`flex items-center space-x-3.5 px-5 py-3.5 rounded-2xl font-bold text-[13px] transition-colors ${isActive('/warehouse') ? 'bg-white text-[#3632c0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                             <HomeIcon className="w-5 h-5" />
                             <span className={isActive('/warehouse') ? '' : 'text-gray-500'}>Manajemen Gudang</span>
                          </Link>
                          <Link href="/inventory" className={`flex items-center space-x-3.5 px-5 py-3.5 rounded-2xl font-bold text-[13px] transition-colors ${isActive('/inventory') ? 'bg-white text-[#3632c0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                             <BoxIcon className="w-5 h-5" />
                             <span className={isActive('/inventory') ? '' : 'text-gray-500'}>Inventaris</span>
                          </Link>
                          <Link href="/transaction" className={`flex items-center space-x-3.5 px-5 py-3.5 rounded-2xl font-bold text-[13px] transition-colors ${isActive('/transaction') ? 'bg-white text-[#3632c0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                             <DocumentIcon className="w-5 h-5" />
                             <span className={isActive('/transaction') ? '' : 'text-gray-500'}>Transaksi</span>
                          </Link>
                          <Link href="/purchase-orders" className={`flex items-center space-x-3.5 px-5 py-3.5 rounded-2xl font-bold text-[13px] transition-colors ${isActive('/purchase-orders') ? 'bg-white text-[#3632c0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                             <ShoppingCartIcon className="w-5 h-5" />
                             <span className={isActive('/purchase-orders') ? '' : 'text-gray-500'}>Pesanan Pembelian</span>
                          </Link>
                          <Link href="/supplier" className={`flex items-center space-x-3.5 px-5 py-3.5 rounded-2xl font-bold text-[13px] transition-colors ${isActive('/supplier') ? 'bg-white text-[#3632c0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                             <UsersIcon className="w-5 h-5" />
                             <span className={isActive('/supplier') ? '' : 'text-gray-500'}>Pemasok</span>
                          </Link>
                          <Link href="/reports" className={`flex items-center space-x-3.5 px-5 py-3.5 rounded-2xl font-bold text-[13px] transition-colors ${isActive('/reports') ? 'bg-white text-[#3632c0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                             <ChartIcon className="w-5 h-5" />
                             <span className={isActive('/reports') ? '' : 'text-gray-500'}>Laporan</span>
                          </Link>
                          <Link href="/shipments" className={`flex items-center space-x-3.5 px-5 py-3.5 rounded-2xl font-bold text-[13px] transition-colors ${isActive('/shipments') ? 'bg-white text-[#3632c0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                             <TruckIcon className="w-5 h-5" />
                             <span className={isActive('/shipments') ? '' : 'text-gray-500'}>Pengiriman</span>
                          </Link>
                          <Link href="/drivers" className={`flex items-center space-x-3.5 px-5 py-3.5 rounded-2xl font-bold text-[13px] transition-colors ${isActive('/drivers') ? 'bg-white text-[#3632c0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                             <UsersIcon className="w-5 h-5" />
                             <span className={isActive('/drivers') ? '' : 'text-gray-500'}>Manajemen Driver</span>
                          </Link>
                          <Link href="/settings" className={`flex items-center space-x-3.5 px-5 py-3.5 rounded-2xl font-bold text-[13px] transition-colors ${isActive('/settings') ? 'bg-white text-[#3632c0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                             </svg>
                             <span className={isActive('/settings') ? '' : 'text-gray-500'}>Pengaturan</span>
                          </Link>
                     </nav>
                </div>
                
                {/* Bottom Actions Panel */}
                <div className="px-5 pb-8 flex flex-col space-y-4">

                     <Dropdown>
                        <Dropdown.Trigger>
                            <button className="w-full flex items-center space-x-3 px-2 text-gray-500 hover:text-gray-700 transition-colors group">
                                <HelpCircleIcon className={`w-[18px] h-[18px] transition-colors ${isActive('/help') ? 'text-[#3632c0]' : 'group-hover:text-gray-700'}`} />
                                <span className={`text-[12px] font-bold ${isActive('/help') ? 'text-[#3632c0]' : ''}`}>Pusat Bantuan</span>
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content align="left" width="56" className="mb-2 bottom-full origin-bottom-left">
                            <Dropdown.Link href="#" className="font-bold text-[12px]">Bantuan Langsung</Dropdown.Link>
                            <Dropdown.Link href="#" className="font-bold text-[12px]">Dokumentasi Sistem</Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#f8f9fc]">
                {toastNotifications.length > 0 && (
                    <div className="fixed top-24 right-8 z-[400] flex flex-col gap-3 pointer-events-none">
                        {toastNotifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`w-[360px] rounded-[24px] border shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-sm px-5 py-4 pointer-events-auto animate-in slide-in-from-right duration-300 ${
                                    notif.type === 'error'
                                        ? 'bg-red-50/95 border-red-100'
                                        : notif.type === 'warning'
                                            ? 'bg-amber-50/95 border-amber-100'
                                            : notif.type === 'success'
                                                ? 'bg-emerald-50/95 border-emerald-100'
                                                : 'bg-white/95 border-indigo-100'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 h-3 w-3 rounded-full ${
                                        notif.type === 'error'
                                            ? 'bg-red-500'
                                            : notif.type === 'warning'
                                                ? 'bg-amber-500'
                                                : notif.type === 'success'
                                                    ? 'bg-emerald-500'
                                                    : 'bg-indigo-500'
                                    }`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Realtime Alert</div>
                                        <div className="text-[14px] font-black text-[#1a202c] leading-tight">{notif.title}</div>
                                        <div className="text-[12px] font-semibold text-gray-600 mt-1 leading-relaxed">{notif.message}</div>
                                    </div>
                                    <button
                                        onClick={() => setToastNotifications((current) => current.filter((item) => item.id !== notif.id))}
                                        className="text-gray-300 hover:text-gray-500 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Header */}
                <header className="h-[76px] flex items-center justify-between px-10 flex-shrink-0 z-[100] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.015)] border-b border-[#edf2f7]">
                    <div className="flex items-center space-x-4">
                        {headerTitle && (
                            <h2 className="text-[18px] font-black text-[#1a202c] mr-4">{headerTitle}</h2>
                        )}
                        <div className="flex-1 min-w-[380px] relative">
                            <SearchIcon className="w-[17px] h-[17px] absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder={headerSearchPlaceholder || "Cari..."}
                                className="w-full bg-[#f4f5f9] text-[13px] text-gray-700 rounded-[12px] pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#3632c0] border border-transparent transition-all font-bold placeholder-gray-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                                value={searchValue || ''}
                                onChange={(e) => onSearch && onSearch(e.target.value)}
                            />
                        </div>
                        
                        {/* Real-time System Status Indicator */}
                        <div className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100/50 shadow-sm shadow-emerald-100/20">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                            </span>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.1em]">Core System: Operational</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-8">
                        {headerRight ? headerRight : (
                            <>
                                <div className="flex items-center space-x-6 text-gray-500">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button className="hover:text-gray-900 transition-all relative mt-1 group">
                                                <div className="p-2.5 rounded-xl bg-gray-50 group-hover:bg-indigo-50 group-hover:text-[#3632c0] transition-colors">
                                                    <BellIcon className="w-[24px] h-[24px]" />
                                                </div>
                                                {activeNotifications.length > 0 && (
                                                    <span className="absolute top-1 right-1 flex h-4 w-4">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-black">
                                                            {activeNotifications.length}
                                                        </span>
                                                    </span>
                                                )}
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="right" width="96" className="p-0 overflow-hidden rounded-[32px] shadow-[0_30px_90px_rgba(0,0,0,0.35)] border border-gray-100 z-[500] animate-in fade-in zoom-in-95 duration-200">
                                            <div className="bg-white px-7 py-6 border-b border-gray-100 flex justify-between items-center">
                                                <div>
                                                    <h3 className="text-[16px] font-black text-[#1a202c]">Notifikasi Sistem</h3>
                                                    <p className="text-[11px] font-bold text-gray-400">Pembaruan keadaan operasional riil</p>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        const allIds = props.notifications?.map(n => n.id) || [];
                                                        setReadIds(allIds);
                                                        localStorage.setItem('read_notifications', JSON.stringify(allIds));
                                                    }}
                                                    className="px-3 py-1.5 hover:bg-gray-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors border border-transparent hover:border-indigo-100"
                                                >
                                                    Tandai Semua Selesai
                                                </button>
                                            </div>
                                            <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
                                                {activeNotifications.length > 0 ? (
                                                    activeNotifications.map((notif) => (
                                                        <Link 
                                                            key={notif.id} 
                                                            href={notif.link}
                                                            onClick={() => markAsRead(notif.id)}
                                                            className="flex items-start space-x-5 px-7 py-6 hover:bg-gray-50 transition-all border-b border-gray-50 last:border-0 group"
                                                        >
                                                            <div className={`mt-1.5 w-3 h-3 rounded-full flex-shrink-0 shadow-sm border-2 border-white translate-y-0.5 ${
                                                                notif.type === 'error' ? 'bg-red-500 shadow-red-100' : 
                                                                notif.type === 'warning' ? 'bg-amber-500 shadow-amber-100' : 
                                                                notif.type === 'success' ? 'bg-emerald-500 shadow-emerald-100' : 'bg-indigo-500 shadow-indigo-100'
                                                            }`} />
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <div className="text-[14px] font-black text-[#1a202c] group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{notif.title}</div>
                                                                    <span className="text-[10px] font-bold text-gray-300">BARU</span>
                                                                </div>
                                                                <div className="text-[13px] font-semibold text-gray-500 leading-[1.6] line-clamp-3 italic">"{notif.message}"</div>
                                                            </div>
                                                        </Link>
                                                    ))
                                                ) : (
                                                    <div className="px-10 py-20 text-center">
                                                        <div className="bg-[#f8f9fb] w-20 h-20 rounded-[32px] flex items-center justify-center mx-auto mb-6 transform -rotate-12">
                                                            <BellIcon className="w-10 h-10 text-gray-200" />
                                                        </div>
                                                        <p className="text-[15px] font-black text-gray-400">Keadan Normal</p>
                                                        <p className="text-[12px] font-bold text-gray-300 mt-2 italic">Belum ada pembaruan status sistem saat ini.</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="px-7 py-4 bg-[#f8f9fb] text-center">
                                                <Link href="/reports" className="text-[12px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest transition-all flex items-center justify-center space-x-2">
                                                    <span>Monitoring Seluruh Laporan</span>
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                                </Link>
                                            </div>
                                        </Dropdown.Content>
                                    </Dropdown>

                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button className="hover:text-gray-900 transition-all mt-1 group">
                                                <div className="p-2.5 rounded-xl bg-gray-50 group-hover:bg-indigo-50 group-hover:text-[#3632c0] transition-colors">
                                                    <HelpCircleIcon className="w-[24px] h-[24px]" />
                                                </div>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content align="right" width="80" className="p-0 overflow-hidden rounded-[24px] shadow-[0_20px_70px_rgba(0,0,0,0.15)] bg-white">
                                            <div className="px-7 py-6 border-b border-gray-50 bg-gray-900">
                                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[2px] mb-1">Operational Support</p>
                                                <h4 className="text-[16px] font-black text-white">Pusat Bantuan SOP</h4>
                                            </div>
                                            <div className="py-2">
                                                <Dropdown.Link href="#" className="font-extrabold text-[14px] px-7 py-4 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex items-center justify-between group">
                                                    <span>Panduan Pengguna (PDF)</span>
                                                    <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth={2} /></svg>
                                                </Dropdown.Link>
                                                <Dropdown.Link href="#" className="font-extrabold text-[14px] px-7 py-4 hover:bg-gray-50 border-b border-gray-50 last:border-0">Alur Kerja Gudang</Dropdown.Link>
                                                <Dropdown.Link href="#" className="font-extrabold text-[14px] px-7 py-4 hover:bg-gray-50">Lapor Bug / Kendala Data</Dropdown.Link>
                                            </div>
                                            <div className="px-7 py-4 bg-indigo-600 text-white text-center cursor-pointer hover:bg-indigo-700 transition-colors">
                                                <span className="text-[12px] font-black uppercase tracking-widest">Kontak Admin Pusat</span>
                                            </div>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>

                                <div className="h-8 w-[1px] bg-gray-100"></div>

                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <div className="flex items-center space-x-3 pl-2 cursor-pointer group">
                                            <div className="flex flex-col text-right">
                                                <span className="text-[13px] font-extrabold text-[#1a202c] group-hover:text-[#4f46e5] transition-colors leading-tight">
                                                    {auth?.user?.name || 'Administrator'}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    {auth?.user?.role || 'Kepala Operasional'}
                                                </span>
                                            </div>
                                            <div className="w-[42px] h-[42px] rounded-full bg-[#f0f4f8] flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm overflow-hidden group-hover:border-indigo-100 transition-all text-[#1a202c] font-black text-xs uppercase">
                                                {auth?.user?.name ? auth.user.name.charAt(0) : 'A'}
                                            </div>
                                        </div>
                                    </Dropdown.Trigger>
                                    
                                    <Dropdown.Content align="right">
                                        <Dropdown.Link href={route('profile.edit')}>Profil Saya</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Logout
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </>
                        )}
                    </div>
                </header>

                {/* Dashboard Scrollable Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto px-10 pt-8 pb-32 scroll-smooth">
                    <div className={contentClassName}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

function playAlertTone(audioContextRef) {
    if (typeof window === 'undefined') return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
    }

    const context = audioContextRef.current;
    if (context.state === 'suspended') {
        context.resume().catch(() => {});
    }

    try {
        const now = context.currentTime;
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, now);
        oscillator.frequency.exponentialRampToValueAtTime(660, now + 0.18);

        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start(now);
        oscillator.stop(now + 0.24);
    } catch (_) {
        // Ignore audio failures silently; visual toast still works.
    }
}
