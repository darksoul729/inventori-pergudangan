import React, { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Boxes,
    Home,
    ArrowRightLeft,
    ClipboardCheck,
    FileText,
    ShoppingCart,
    Users,
    BarChart3,
    Truck,
    Settings,
    HelpCircle,
    Bell,
    Search,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    Package,
    Sparkles,
    LogOut
} from 'lucide-react';

import Dropdown from '@/Components/Dropdown';
import FloatingBubble from '@/Components/FloatingBubble';
import Modal from '@/Components/Modal';

export default function DashboardLayout({
    children,
    headerTitle,
    headerSearchPlaceholder,
    searchValue,
    onSearch,
    headerRight,
    contentClassName = 'max-w-[1400px] mx-auto',
    fullPage = false,
    hideSearch = false,
}) {
    const { url, props } = usePage();
    const { auth } = props;
    const userRole = normalizeRoleKey(auth?.user?.role_name || auth?.user?.role);
    const isManager = userRole === 'manager';
    const isSupervisor = userRole === 'supervisor';
    const canViewReports = isManager || isSupervisor;
    const canManageWarehouseOps = isManager || isSupervisor;

    // Sidebar States (Persisted)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebar_collapsed') === 'true';
        }
        return false;
    });

    const [openMenus, setOpenMenus] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('sidebar_open_menus');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });
    const [helpMenuOpen, setHelpMenuOpen] = useState(() => url.startsWith('/help'));
    const [confirmingLogout, setConfirmingLogout] = useState(false);

    const sidebarScrollRef = useRef(null);

    const navMenus = [
        { title: 'Dasbor', url: '/dashboard', icon: LayoutDashboard, show: true },
        { title: 'Aether AI', url: '/aether', icon: Sparkles, show: true },
        {
            title: 'Gudang & Operasional',
            icon: Home,
            show: true,
            items: [
                { title: 'Manajemen Gudang', url: '/warehouse', show: true },
                { title: 'Transfer Rack', url: '/rack-allocation', show: canManageWarehouseOps },
                { title: 'Stock Opname', url: '/stock-opname', show: canManageWarehouseOps },
            ]
        },
        { title: 'Inventaris', url: '/inventory', icon: Boxes, show: true },
        {
            title: 'Pembelian & Retur',
            icon: ShoppingCart,
            show: true,
            items: [
                { title: 'Pesanan Pembelian', url: '/purchase-orders', show: true },
                { title: 'Pemasok', url: '/supplier', show: true },
            ]
        },
        {
            title: 'Dokumen Transaksi',
            icon: FileText,
            show: true,
            items: [
                { title: 'Transaksi', url: '/transaction', show: true },
                { title: 'Dokumen WMS', url: '/wms-documents', show: canManageWarehouseOps },
            ]
        },
        {
            title: 'Logistik Area',
            icon: Truck,
            show: true,
            items: [
                { title: 'Pengiriman', url: '/shipments', show: true },
                { title: 'Manajemen Driver', url: '/drivers', show: isManager },
            ]
        },
        {
            title: 'Sistem',
            icon: Settings,
            show: true,
            items: [
                { title: 'Laporan', url: '/reports', show: canViewReports },
                { title: 'Pengaturan', url: '/settings', show: isManager },
            ]
        }
    ];

    // Initial check to ensure active menu is open
    useEffect(() => {
        navMenus.forEach(menu => {
            if (menu.items) {
                const isActiveMenu = menu.items.some(item => isActive(item.url));
                if (isActiveMenu && !openMenus.includes(menu.title)) {
                    setOpenMenus(prev => {
                        const newOpen = [...prev, menu.title];
                        sessionStorage.setItem('sidebar_open_menus', JSON.stringify(newOpen));
                        return newOpen;
                    });
                }
            }
        });

        if (url.startsWith('/help')) {
            setHelpMenuOpen(true);
        }
    }, [url]);

    // Restore scroll position
    useEffect(() => {
        if (sidebarScrollRef.current) {
            const savedScroll = sessionStorage.getItem('sidebar_scroll_pos');
            if (savedScroll) {
                sidebarScrollRef.current.scrollTop = parseInt(savedScroll, 10);
            }
        }
    }, [url]);

    const handleSidebarScroll = (e) => {
        sessionStorage.setItem('sidebar_scroll_pos', e.target.scrollTop);
    };

    const toggleSidebar = () => {
        const newVal = !isSidebarCollapsed;
        setIsSidebarCollapsed(newVal);
        localStorage.setItem('sidebar_collapsed', newVal);
    };

    const toggleMenu = (title) => {
        setOpenMenus(prev => {
            const newOpen = prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title];
            sessionStorage.setItem('sidebar_open_menus', JSON.stringify(newOpen));
            return newOpen;
        });
    };

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
            <div className={`h-screen overflow-visible bg-white flex flex-col justify-between flex-shrink-0 z-[250] shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative border-r border-[#edf2f7] transition-all duration-300 ${isSidebarCollapsed ? 'w-[96px]' : 'w-[270px]'}`}>
                {/* Collapse Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-[16px] top-9 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-[#3632c0] rounded-full shadow-sm hover:shadow-md transition-all z-[300] hover:scale-105"
                >
                    <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                </button>

                <div className="flex min-h-0 flex-col h-full">
                    {/* Logo Area */}
                    <div className={`px-5 py-7 border-b border-gray-50/50 flex ${isSidebarCollapsed ? 'justify-center items-center' : 'items-center space-x-3.5 mx-3'} transition-all`}>
                        <div className="w-[42px] h-[42px] bg-[#3632c0] rounded-[14px] flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200/50">
                            <Package className="w-[20px] h-[20px] text-white" />
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="overflow-hidden transition-all whitespace-nowrap">
                                <h1 className="text-[17px] font-extrabold text-[#1a202c] tracking-tight leading-tight">Aether Logistix</h1>
                                <p className="text-[9px] font-bold text-gray-500 tracking-wider mt-0.5 uppercase">Kinetic Architect V1.0</p>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav
                        ref={sidebarScrollRef}
                        onScroll={handleSidebarScroll}
                        className="flex-1 min-h-0 overflow-y-auto overflow-x-visible scrollbar-none px-4 pt-6 pb-8 space-y-2"
                    >
                        {navMenus.filter(menu => menu.show).map((menu, mIdx) => {
                            // Render Single Item
                            if (!menu.items) {
                                const active = isActive(menu.url);
                                return (
                                    <Link
                                        key={mIdx}
                                        href={menu.url}
                                        className={`group relative flex items-center ${isSidebarCollapsed ? 'w-[44px] h-[44px] mx-auto justify-center rounded-[14px]' : 'w-full space-x-3 px-4 py-3 rounded-[12px]'} font-bold text-[13px] transition-all ${active ? 'bg-[#f4f3ff] text-[#3632c0]' : 'text-gray-500 hover:text-[#3632c0] hover:bg-gray-50'}`}
                                    >
                                        <menu.icon className={`flex-shrink-0 transition-transform group-hover:scale-110 ${isSidebarCollapsed ? 'w-[22px] h-[22px]' : 'w-[18px] h-[18px]'}`} strokeWidth={active ? 2.5 : 2} />
                                        {!isSidebarCollapsed && (
                                            <span className="whitespace-nowrap">{menu.title}</span>
                                        )}
                                        {/* Tooltip for collapsed mode */}
                                        {isSidebarCollapsed && (
                                            <div className="absolute left-[56px] opacity-0 invisible group-hover:opacity-100 group-hover:visible bg-[#1a202c] text-white text-[12px] font-bold py-1.5 px-3 rounded-xl whitespace-nowrap z-[200] shadow-xl border border-gray-700/50 transition-all ml-1 pointer-events-none">
                                                {menu.title}
                                                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#1a202c] rotate-45 border-b border-l border-gray-700/50"></div>
                                            </div>
                                        )}
                                    </Link>
                                );
                            }

                            // Render Dropdown Parent Item
                            const visibleItems = menu.items.filter(i => i.show);
                            if (visibleItems.length === 0) return null;

                            const isOpen = openMenus.includes(menu.title);
                            const hasActiveChild = visibleItems.some(i => isActive(i.url));

                            return (
                                <div key={mIdx} className="w-full relative">
                                    <button
                                        onClick={() => isSidebarCollapsed ? toggleSidebar() : toggleMenu(menu.title)}
                                        className={`group relative flex items-center ${isSidebarCollapsed ? 'w-[44px] h-[44px] mx-auto justify-center rounded-[14px]' : 'w-full justify-between px-4 py-3 rounded-[12px]'} font-bold text-[13px] transition-all ${hasActiveChild && !isOpen && isSidebarCollapsed ? 'bg-[#f4f3ff] text-[#3632c0]' : 'text-gray-500 hover:text-[#3632c0] hover:bg-gray-50'} ${(hasActiveChild || isOpen) && !isSidebarCollapsed ? 'text-[#3632c0]' : ''}`}
                                    >
                                        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                                            <menu.icon className={`flex-shrink-0 transition-transform group-hover:scale-110 ${isSidebarCollapsed ? 'w-[22px] h-[22px]' : 'w-[18px] h-[18px]'}`} strokeWidth={hasActiveChild ? 2.5 : 2} />
                                            {!isSidebarCollapsed && (
                                                <span className="whitespace-nowrap">{menu.title}</span>
                                            )}
                                        </div>
                                        {!isSidebarCollapsed && (
                                            <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                                                <ChevronDown className="w-4 h-4 opacity-70" />
                                            </div>
                                        )}

                                        {isSidebarCollapsed && (
                                            <div className="absolute left-[56px] opacity-0 invisible group-hover:opacity-100 group-hover:visible bg-[#1a202c] text-white text-[12px] font-bold py-1.5 px-3 rounded-xl whitespace-nowrap z-[200] shadow-xl border border-gray-700/50 transition-all ml-1 pointer-events-none">
                                                {menu.title}
                                                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#1a202c] rotate-45 border-b border-l border-gray-700/50"></div>
                                            </div>
                                        )}
                                    </button>

                                    {/* Children Container with indicator line */}
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen && !isSidebarCollapsed ? 'max-h-[500px] opacity-100 mt-1 mb-2' : 'max-h-0 opacity-0'}`}
                                    >
                                        <div className="ml-6 pl-4 border-l-2 border-gray-100 space-y-1.5 py-1">
                                            {visibleItems.map((item, iIdx) => {
                                                const active = isActive(item.url);
                                                return (
                                                    <Link
                                                        key={iIdx}
                                                        href={item.url}
                                                        className={`block w-full text-left px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${active ? 'text-[#3632c0] bg-indigo-50/50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
                                                    >
                                                        {item.title}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className={`mt-5 pt-5 border-t border-gray-50 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
                            <button
                                type="button"
                                onClick={() => isSidebarCollapsed ? toggleSidebar() : setHelpMenuOpen((open) => !open)}
                                className={`flex items-center ${isSidebarCollapsed ? 'w-[44px] h-[44px] justify-center rounded-[14px]' : 'w-full justify-between px-4 py-3 rounded-[12px]'} text-gray-500 hover:text-[#3632c0] hover:bg-gray-50 transition-all group relative`}
                            >
                                <span className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                                    <HelpCircle className={`w-[20px] h-[20px] transition-transform group-hover:scale-110 ${isActive('/help') ? 'text-[#3632c0]' : ''}`} />
                                    {!isSidebarCollapsed && (
                                        <span className={`text-[12px] font-bold ${isActive('/help') ? 'text-[#3632c0]' : ''}`}>Pusat Bantuan</span>
                                    )}
                                </span>
                                {!isSidebarCollapsed && (
                                    <ChevronRight className={`w-4 h-4 opacity-60 transition-transform duration-300 ${helpMenuOpen ? 'rotate-90' : ''}`} />
                                )}
                                {isSidebarCollapsed && (
                                    <div className="absolute left-[56px] opacity-0 invisible group-hover:opacity-100 group-hover:visible bg-[#1a202c] text-white text-[12px] font-bold py-1.5 px-3 rounded-xl whitespace-nowrap z-[200] shadow-xl border border-gray-700/50 transition-all ml-1 pointer-events-none">
                                        Pusat Bantuan
                                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#1a202c] rotate-45 border-b border-l border-gray-700/50"></div>
                                    </div>
                                )}
                            </button>

                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${helpMenuOpen && !isSidebarCollapsed ? 'max-h-32 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                <div className="ml-6 pl-4 border-l-2 border-gray-100 space-y-1.5 py-1">
                                    <Link href="/help/live-support" className={`block w-full text-left px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${isActive('/help/live-support') ? 'text-[#3632c0] bg-indigo-50/50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
                                        Bantuan Langsung
                                    </Link>
                                    <Link href="/help/documentation" className={`block w-full text-left px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${isActive('/help/documentation') ? 'text-[#3632c0] bg-indigo-50/50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
                                        Dokumentasi Sistem
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative bg-[#f8f9fc]">
                {toastNotifications.length > 0 && (
                    <div className="fixed top-24 right-8 z-[400] flex flex-col gap-3 pointer-events-none">
                        {toastNotifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`w-[360px] rounded-[24px] border shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-sm px-5 py-4 pointer-events-auto animate-in slide-in-from-right duration-300 ${notif.type === 'error'
                                    ? 'bg-red-50/95 border-red-100'
                                    : notif.type === 'warning'
                                        ? 'bg-amber-50/95 border-amber-100'
                                        : notif.type === 'success'
                                            ? 'bg-emerald-50/95 border-emerald-100'
                                            : 'bg-white/95 border-indigo-100'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 h-3 w-3 rounded-full ${notif.type === 'error'
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
                {!fullPage && (
                <header className="h-[76px] flex items-center justify-between px-10 flex-shrink-0 z-[100] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.015)] border-b border-[#edf2f7]">
                    <div className="flex items-center space-x-4">
                        {headerTitle && (
                            <h2 className="text-[18px] font-black text-[#1a202c] mr-4">{headerTitle}</h2>
                        )}
                        {(!hideSearch && !url.includes('/settings') && !url.includes('/rack-allocation')) ? (
                            <div className="flex-1 min-w-[380px] relative">
                                <Search className="w-[17px] h-[17px] absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={headerSearchPlaceholder || "Cari..."}
                                    className="w-full bg-[#f4f5f9] text-[13px] text-gray-700 rounded-[12px] pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#3632c0] border border-transparent transition-all font-bold placeholder-gray-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                                    value={searchValue || ''}
                                    onChange={(e) => onSearch && onSearch(e.target.value)}
                                />
                            </div>
                        ) : (
                            <div className="hidden" style={{ display: 'none' }}></div>
                        )}

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
                                    <Link href="/notifications" className="hover:text-gray-900 transition-all relative mt-1 group">
                                        <div className="p-2.5 rounded-xl bg-gray-50 group-hover:bg-indigo-50 group-hover:text-[#3632c0] transition-colors">
                                            <Bell className="w-[22px] h-[22px]" />
                                        </div>
                                        {activeNotifications.length > 0 && (
                                            <span className="absolute top-1 right-1 flex h-4 w-4">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-black">
                                                    {activeNotifications.length}
                                                </span>
                                            </span>
                                        )}
                                    </Link>

                                    <Link href="/help/live-support" className="hover:text-gray-900 transition-all mt-1 group">
                                        <div className="p-2.5 rounded-xl bg-gray-50 group-hover:bg-indigo-50 group-hover:text-[#3632c0] transition-colors">
                                            <HelpCircle className="w-[22px] h-[22px]" />
                                        </div>
                                    </Link>
                                </div>

                                <div className="h-8 w-[1px] bg-gray-100"></div>

                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <div className="flex items-center space-x-3 pl-2 cursor-pointer group">
                                            <div className="flex flex-col text-right">
                                                <span className="text-[13px] font-extrabold text-[#1a202c] group-hover:text-[#4f46e5] transition-colors leading-tight">
                                                    {auth?.user?.name || 'Pengguna Sistem'}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    {formatRoleLabel(auth?.user?.role_name || auth?.user?.role)}
                                                </span>
                                            </div>
                                            <div className="w-[42px] h-[42px] rounded-full bg-[#f0f4f8] flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm overflow-hidden group-hover:border-indigo-100 transition-all text-[#1a202c] font-black text-xs uppercase">
                                                {auth?.user?.profile_photo_url ? (
                                                    <img
                                                        src={auth.user.profile_photo_url}
                                                        alt={`Foto profil ${auth?.user?.name || 'Pengguna Sistem'}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    auth?.user?.name ? auth.user.name.charAt(0) : 'A'
                                                )}
                                            </div>
                                        </div>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content align="right">
                                        <Dropdown.Link href={route('profile.edit')}>Profil Saya</Dropdown.Link>
                                        <button
                                            type="button"
                                            onClick={() => setConfirmingLogout(true)}
                                            className="block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                        >
                                            Logout
                                        </button>
                                    </Dropdown.Content>
                                </Dropdown>
                            </>
                        )}
                    </div>
                </header>
                )}

                {/* Dashboard Scrollable Area */}
                <main className={`flex-1 min-h-0 overflow-x-hidden scroll-smooth ${fullPage ? 'p-0 overflow-y-hidden bg-white' : 'px-10 pt-8 pb-32 overflow-y-auto bg-[#f8f9fc]'}`}>
                    {fullPage ? (
                        children
                    ) : (
                        <div className={contentClassName}>
                            {children}
                        </div>
                    )}
                </main>
            </div>
            {url !== '/aether' && <FloatingBubble />}

            <Modal show={confirmingLogout} maxWidth="md" onClose={() => setConfirmingLogout(false)}>
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[8px] bg-red-50 text-red-600">
                            <LogOut className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-[20px] font-black text-slate-950">Keluar dari akun?</h2>
                            <p className="mt-2 text-[14px] font-semibold leading-7 text-slate-500">
                                Sesi kerja WMS akan ditutup. Pastikan perubahan data yang sedang dikerjakan sudah disimpan.
                            </p>
                        </div>
                    </div>

                    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => setConfirmingLogout(false)}
                            className="inline-flex items-center justify-center rounded-[10px] border border-slate-200 bg-white px-5 py-3 text-[12px] font-black uppercase tracking-wider text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                        >
                            Batal
                        </button>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-red-600 px-5 py-3 text-[12px] font-black uppercase tracking-wider text-white transition-all hover:bg-red-700"
                        >
                            <LogOut className="h-4 w-4" />
                            Ya, Logout
                        </Link>
                    </div>
                </div>
            </Modal>
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
        context.resume().catch(() => { });
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

function formatRoleLabel(role) {
    const value = normalizeRoleKey(role);

    if (!value) {
        return 'Pengguna Sistem';
    }

    if (value === 'manager') {
        return 'Manager Gudang';
    }

    if (value === 'supervisor') {
        return 'Supervisor Gudang';
    }

    if (value === 'staff') {
        return 'Staff Operasional';
    }

    if (value === 'driver') {
        return 'Driver';
    }

    return role;
}

function normalizeRoleKey(role) {
    const value = (role || '').toString().toLowerCase();

    if (!value) {
        return '';
    }

    if (value.includes('admin gudang') || value.includes('manager') || value.includes('manajer')) {
        return 'manager';
    }

    if (value.includes('supervisor') || value.includes('spv')) {
        return 'supervisor';
    }

    if (value.includes('staff') || value.includes('staf')) {
        return 'staff';
    }

    if (value.includes('driver')) {
        return 'driver';
    }

    return value;
}
