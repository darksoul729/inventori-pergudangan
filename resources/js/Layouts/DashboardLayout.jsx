import React, { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Boxes,
    ArrowRightLeft,
    ArrowRight,
    ClipboardCheck,
    FileText,
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
    Lock,
    LogOut,
    ShieldAlert,
    Users2,
    Zap,
    ChevronRight as BreadcrumbSeparator
} from 'lucide-react';

import Dropdown from '@/Components/Dropdown';
import FloatingBubble from '@/Components/FloatingBubble';
import Modal from '@/Components/Modal';
import GlobalToast from '@/Components/GlobalToast';

// Breadcrumb mapping dari URL ke label
const BREADCRUMB_MAP = {
    '/dashboard': { label: 'Dasbor', parent: null },
    '/petayu-ai': { label: 'Asisten AI', parent: '/dashboard' },
    '/warehouse': { label: 'Layout Gudang', parent: '/dashboard' },
    '/warehouse/advanced': { label: 'Mode Lanjutan', parent: '/warehouse' },
    '/rack-allocation': { label: 'Atur Rak', parent: '/warehouse' },
    '/stock-opname': { label: 'Hitung Stok', parent: '/warehouse' },
    '/inventory': { label: 'Barang & Stok', parent: '/dashboard' },
    '/purchase-orders': { label: 'Pesanan Beli', parent: '/dashboard' },
    '/customers': { label: 'Pelanggan', parent: '/purchase-orders' },
    '/invoices': { label: 'Tagihan', parent: '/dashboard' },
    '/tagihan': { label: 'Tagihan', parent: '/dashboard' },
    '/invoice': { label: 'Tagihan', parent: '/dashboard' },
    '/supplier': { label: 'Pemasok', parent: '/purchase-orders' },
    '/transaction': { label: 'Riwayat Stok', parent: '/dashboard' },
    '/wms-documents': { label: 'Dokumen', parent: '/transaction' },
    '/shipments': { label: 'Pengiriman', parent: '/dashboard' },
    '/drivers': { label: 'Driver', parent: '/shipments' },
    '/drivers/create': { label: 'Buat Driver', parent: '/drivers' },
    '/reports': { label: 'Laporan', parent: '/dashboard' },
    '/mulai-di-sini': { label: 'Panduan Mulai', parent: '/dashboard' },
    '/settings': { label: 'Pengaturan', parent: '/dashboard' },
    '/settings/saas': { label: 'SaaS & Modul', parent: '/settings' },
    '/admin/users': { label: 'Kelola User', parent: '/settings/saas' },
    '/settings/billing': { label: 'Paket & Pembayaran', parent: '/settings' },
    '/notifications': { label: 'Notifikasi', parent: '/dashboard' },
    '/profile': { label: 'Profil', parent: '/dashboard' },
    '/help': { label: 'Bantuan', parent: '/dashboard' },
    '/help/live-support': { label: 'Bantuan Cepat', parent: '/help' },
    '/help/documentation': { label: 'Dokumentasi', parent: '/help' },
};

function buildBreadcrumbs(url) {
    const crumbs = [];
    let current = url.split('?')[0]; // Remove query params

    // Check exact match first
    if (BREADCRUMB_MAP[current]) {
        let item = BREADCRUMB_MAP[current];
        crumbs.unshift({ label: item.label, href: current, isActive: true });

        // Traverse up the parent chain
        while (item.parent) {
            const parentItem = BREADCRUMB_MAP[item.parent];
            if (parentItem) {
                crumbs.unshift({ label: parentItem.label, href: item.parent, isActive: false });
                item = parentItem;
                current = item.parent;
            } else {
                break;
            }
        }
    } else {
        // Fallback for dynamic routes (detail pages)
        const basePath = current.split('/').slice(0, 2).join('/');
        if (BREADCRUMB_MAP[basePath]) {
            const parent = BREADCRUMB_MAP[basePath];
            crumbs.push({ label: parent.label, href: basePath, isActive: false });

            // Extract ID from URL for detail page
            const idPart = current.split('/')[2];
            if (idPart && !isNaN(parseInt(idPart))) {
                crumbs.push({ label: `Detail #${idPart}`, href: current, isActive: true });
            } else if (idPart) {
                crumbs.push({ label: idPart.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), href: current, isActive: true });
            }
        }
    }

    return crumbs;
}

function Breadcrumb({ url }) {
    const crumbs = buildBreadcrumbs(url);

    if (crumbs.length <= 1) return null;

    return (
        <nav className="flex items-center space-x-2 px-8 py-2.5 text-[12px] font-semibold text-gray-500 bg-white border-b border-gray-100">
            <Link
                href="/dashboard"
                className="flex items-center space-x-1 text-gray-400 hover:text-[#5B33CC] transition-colors"
            >
                <LayoutDashboard className="w-4 h-4" />
                <span>Beranda</span>
            </Link>

            {crumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                    <BreadcrumbSeparator className="w-3.5 h-3.5 text-gray-300" />
                    {crumb.isActive ? (
                        <span className="text-[#5B33CC] font-bold">{crumb.label}</span>
                    ) : (
                        <Link
                            href={crumb.href}
                            className="text-gray-500 hover:text-[#5B33CC] transition-colors"
                        >
                            {crumb.label}
                        </Link>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}

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
    hideMainScrollbar = false,
}) {
    const { url, props } = usePage();
    const { auth, pendingApprovals, saas } = props;
    const forbiddenFlash = props?.flash?.forbidden_modal || null;
    const userRole = normalizeRoleKey(auth?.user?.role_name || auth?.user?.role);
    const isManager = userRole === 'manager';
    const isSupervisor = userRole === 'supervisor';
    const isStaff = userRole === 'staff';
    const isDriver = userRole === 'driver';
    const isSystemAdmin = userRole === 'system_admin';

    const canManageWarehouseOps = isManager || isSupervisor || isStaff;
    const canViewWarehouseDocs = isManager || isSupervisor;
    const canViewReports = isManager || isSupervisor;
    const canManageInventory = isManager || isSupervisor || isStaff;
    const canManageShipment = isManager || isSupervisor || isDriver;
    const canManageFinance = isManager;

    const moduleFlags = saas?.modules || {};
    const hasModule = (code) => moduleFlags[code] !== false;
    const aiEnabled = hasModule('ai_contextual');
    
    // Helper: If a module is locked, ONLY managers can see it (as an upsell). Otherwise, base permission applies.
    const canAccessOrUpsell = (basePermission, moduleCode) => {
        if (!moduleCode) return basePermission;
        if (hasModule(moduleCode)) return basePermission;
        return isManager;
    };

    // Pending approval counts for sidebar badges
    const pendingOpnameCount = pendingApprovals?.opnames || 0;
    const pendingTransferCount = pendingApprovals?.transfers || 0;

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
    const [headerAvatarError, setHeaderAvatarError] = useState(false);
    const [confirmingLogout, setConfirmingLogout] = useState(false);
    const [forbiddenModal, setForbiddenModal] = useState(forbiddenFlash);
    const [lockedModuleModal, setLockedModuleModal] = useState(null);
    const [fallbackSearch, setFallbackSearch] = useState('');

    useEffect(() => {
        if (forbiddenFlash) {
            setForbiddenModal(forbiddenFlash);
        }
    }, [forbiddenFlash]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setFallbackSearch(params.get('search') || '');
    }, [url]);

    useEffect(() => {
        setHeaderAvatarError(false);
    }, [auth?.user?.profile_photo_url]);

    const resolveSearchTarget = () => {
        const path = window.location.pathname;
        if (path.startsWith('/inventory')) return '/inventory';
        if (path.startsWith('/shipments')) return '/shipments';
        if (path.startsWith('/drivers')) return '/drivers';
        if (path.startsWith('/transaction')) return '/transaction';
        if (path.startsWith('/wms-documents')) return '/wms-documents';
        if (path.startsWith('/supplier')) return '/supplier';
        if (path.startsWith('/purchase-orders')) return '/purchase-orders';
        if (path.startsWith('/invoices') || path.startsWith('/tagihan') || path.startsWith('/invoice')) return '/invoices';
        if (path.startsWith('/rack-allocation')) return '/rack-allocation';
        if (path.startsWith('/warehouse')) return '/warehouse';
        if (path.startsWith('/stock-opname')) return '/stock-opname';
        if (path.startsWith('/reports')) return '/reports';
        if (path.startsWith('/settings')) return '/settings';
        if (path.startsWith('/help')) return '/help/documentation';
        if (path.startsWith('/notifications')) return '/notifications';
        return '/dashboard';
    };

    const handleSearchSubmit = (keyword) => {
        const term = String(keyword || '').trim();
        const target = resolveSearchTarget();

        if (onSearch) {
            onSearch(term);
            return;
        }

        const params = new URLSearchParams(window.location.search);
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        params.delete('page');

        router.get(target, Object.fromEntries(params.entries()), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const sidebarScrollRef = useRef(null);

    // Pemetaan modul → paket terendah yang mengaktifkannya
    const MODULE_PLAN = {
        warehouse_ops:          { label: 'Basic',      color: 'blue'   },
        invoicing:              { label: 'Basic',      color: 'blue'   },
        shipment:               { label: 'Pro',        color: 'violet' },
        reports_advanced:       { label: 'Pro',        color: 'violet' },
        ai_contextual:          { label: 'Pro',        color: 'violet' },
        warehouse_layout_editor:{ label: 'Enterprise', color: 'amber'  },
    };

    const navMenus = [
        { title: 'Beranda', url: '/dashboard', icon: LayoutDashboard, show: !isSystemAdmin },
        {
            title: 'Barang & Stok',
            icon: Boxes,
            show: (canManageInventory || isManager) && !isSystemAdmin,
            items: [
                { title: 'Semua Barang', url: '/inventory', show: canManageInventory },
                { title: 'Beli ke Pemasok', url: '/purchase-orders', show: canManageInventory || isManager || isSupervisor },
                { title: 'Pelanggan', url: '/customers', show: canAccessOrUpsell(canManageFinance || isSupervisor, 'invoicing'), locked: !hasModule('invoicing'), requiredModule: 'invoicing' },
                { title: 'Pemasok', url: '/supplier', show: canManageInventory || isManager || isSupervisor },
                { title: 'Zona & Rak', url: '/warehouse', show: canManageWarehouseOps || canManageInventory },
                { title: 'Desain Lanjutan', url: '/warehouse/advanced', show: canAccessOrUpsell(canManageWarehouseOps, 'warehouse_layout_editor'), locked: !hasModule('warehouse_layout_editor'), requiredModule: 'warehouse_layout_editor' },
                { title: 'Kelola Rak', url: '/rack-allocation', show: canAccessOrUpsell(canManageWarehouseOps, 'warehouse_ops'), badge: pendingTransferCount, locked: !hasModule('warehouse_ops'), requiredModule: 'warehouse_ops' },
                { title: 'Cek Stok', url: '/stock-opname', show: canAccessOrUpsell(canManageWarehouseOps, 'warehouse_ops'), badge: pendingOpnameCount, locked: !hasModule('warehouse_ops'), requiredModule: 'warehouse_ops' },
                { title: 'Riwayat Pergerakan', url: '/transaction', show: canManageInventory },
                { title: 'Dokumen', url: '/wms-documents', show: canAccessOrUpsell(canViewWarehouseDocs, 'warehouse_ops'), locked: !hasModule('warehouse_ops'), requiredModule: 'warehouse_ops' },
            ]
        },
        {
            title: 'Pengiriman',
            icon: Truck,
            show: canAccessOrUpsell(canManageShipment, 'shipment') && !isSystemAdmin,
            items: [
                { title: 'Semua Pengiriman', url: '/shipments', show: canAccessOrUpsell(canManageShipment, 'shipment'), locked: !hasModule('shipment'), requiredModule: 'shipment' },
                { title: 'Data Kurir', url: '/drivers', show: canAccessOrUpsell(isManager, 'shipment'), locked: !hasModule('shipment'), requiredModule: 'shipment' },
            ]
        },
        { title: 'Tagihan', url: '/tagihan', icon: FileText, show: canAccessOrUpsell(canManageFinance, 'invoicing') && !isSystemAdmin, locked: !hasModule('invoicing'), requiredModule: 'invoicing' },
        { title: 'Laporan', url: '/reports', icon: BarChart3, show: canAccessOrUpsell(canViewReports, 'reports_advanced') && !isSystemAdmin, locked: !hasModule('reports_advanced'), requiredModule: 'reports_advanced' },
        { title: 'Tanya AI', url: '/petayu-ai', icon: Sparkles, show: aiEnabled && !isSystemAdmin, locked: false },
        { title: 'Pengaturan', url: '/settings', icon: Settings, show: isManager },
        { title: 'Kelola Tenant', url: '/settings/saas', icon: Settings, show: isSystemAdmin },
        { title: 'Kelola User', url: '/admin/users', icon: Users2, show: isSystemAdmin },
        { title: 'Audit Log', url: '/admin/audit-log', icon: FileText, show: isSystemAdmin },
        { title: 'Statistik Platform', url: '/admin/stats', icon: BarChart3, show: isSystemAdmin },
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

    const openLockedFeatureModal = (featureName) => {
        setLockedModuleModal({
            featureName: featureName || 'fitur ini',
        });
    };

    return (
        <div className="flex h-screen petayu-bg-app font-sans antialiased text-gray-900">
            {/* Sidebar */}
            <div className={`h-screen overflow-visible bg-white flex flex-col justify-between flex-shrink-0 z-[250] shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative border-r petayu-border transition-all duration-300 ${isSidebarCollapsed ? 'w-[84px]' : 'w-[270px]'}`}>
                {/* Collapse Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-[16px] top-7 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-[#5B33CC] rounded-full shadow-sm hover:shadow-md transition-all z-[300] hover:scale-105"
                >
                    <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                </button>

                <div className="flex min-h-0 flex-col h-full">
                    {/* Logo Area */}
                    <div className={`h-[88px] flex items-center shrink-0 border-b border-gray-50/50 transition-all ${isSidebarCollapsed ? 'justify-center' : 'px-5 space-x-3.5'}`}>
                        <div className="w-[42px] h-[42px] rounded-[14px] bg-white border petayu-border flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#5B33CC]/10 overflow-hidden">
                            <img src="/images/brand-logo.png" alt="Logo PETAYU" className="w-[30px] h-[30px] object-contain" />
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="overflow-hidden transition-all whitespace-nowrap">
                                <h1 className="text-[17px] font-extrabold text-slate-900 tracking-tight leading-tight">PETAYU</h1>
                                <p className="text-[9px] font-bold text-gray-500 tracking-wider mt-0.5 uppercase">SMART STORAGE, SMOOTH FLOW</p>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav
                        ref={sidebarScrollRef}
                        onScroll={handleSidebarScroll}
                        className={`flex-1 min-h-0 overflow-y-auto overflow-x-visible scrollbar-none pt-6 pb-8 space-y-2 ${isSidebarCollapsed ? 'px-0' : 'px-4'}`}
                    >
                        {navMenus.filter(menu => menu.show).map((menu, mIdx) => {
                            // Render Single Item
                            if (!menu.items) {
                                const active = isActive(menu.url);
                                const href = menu.locked ? `/settings/billing?source=locked&module=${encodeURIComponent(menu.title)}` : menu.url;
                                return (
                                    <Link
                                        key={mIdx}
                                        href={href}
                                        title={isSidebarCollapsed ? menu.title : ''}
                                        onClick={(event) => {
                                            if (!menu.locked) return;
                                            event.preventDefault();
                                            openLockedFeatureModal(menu.title);
                                        }}
                                        className={`group relative flex items-center ${isSidebarCollapsed ? 'w-[48px] h-[48px] mx-auto justify-center rounded-[16px]' : 'w-full space-x-3 px-4 py-3 rounded-[12px]'} font-bold text-[13px] transition-all ${active ? 'petayu-brand-soft text-[#5B33CC]' : 'text-gray-500 hover:text-[#5B33CC] hover:bg-gray-50'} ${menu.locked ? 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}
                                    >
                                        <menu.icon className={`flex-shrink-0 transition-transform group-hover:scale-110 ${isSidebarCollapsed ? 'w-[22px] h-[22px]' : 'w-[18px] h-[18px]'}`} strokeWidth={active ? 2.5 : 2} />
                                        {!isSidebarCollapsed && (
                                            <div className="whitespace-nowrap flex-1 flex items-center justify-between min-w-0">
                                                <span className="truncate">{menu.title}</span>
                                                {menu.locked && menu.requiredModule && (() => {
                                                    const plan = MODULE_PLAN[menu.requiredModule];
                                                    if (!plan) return null;
                                                    const styles = {
                                                        amber:  'text-slate-500 bg-slate-50 border-slate-200',
                                                        violet: 'text-slate-500 bg-slate-50 border-slate-200',
                                                        blue:   'text-slate-500 bg-slate-50 border-slate-200',
                                                    };
                                                    const icons = {
                                                        amber:  <Zap className="w-2.5 h-2.5 opacity-70" />,
                                                        violet: <Sparkles className="w-2.5 h-2.5 opacity-70" />,
                                                        blue:   <ArrowRight className="w-2.5 h-2.5 opacity-70" />,
                                                    };
                                                    return (
                                                        <span className={`ml-2 flex-shrink-0 inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider border px-1.5 py-0.5 rounded-md ${styles[plan.color]}`}>
                                                            {icons[plan.color]}{plan.label}
                                                        </span>
                                                    );
                                                })()}
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
                                        title={isSidebarCollapsed ? menu.title : ''}
                                        className={`group relative flex items-center ${isSidebarCollapsed ? 'w-[48px] h-[48px] mx-auto justify-center rounded-[16px]' : 'w-full justify-between px-4 py-3 rounded-[12px]'} font-bold text-[13px] transition-all ${hasActiveChild && !isOpen && isSidebarCollapsed ? 'petayu-brand-soft text-[#5B33CC]' : 'text-gray-500 hover:text-[#5B33CC] hover:bg-gray-50'} ${(hasActiveChild || isOpen) && !isSidebarCollapsed ? 'text-[#5B33CC]' : ''}`}
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
                                                        href={item.locked ? `/settings/billing?source=locked&module=${encodeURIComponent(item.requiredModule ?? item.title)}` : item.url}
                                                        onClick={(event) => {
                                                            if (!item.locked) return;
                                                            event.preventDefault();
                                                            openLockedFeatureModal(item.title);
                                                        }}
                                                        className={`block w-full text-left px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${
                                                            active
                                                                ? 'text-[#5B33CC] bg-indigo-50/50'
                                                                : item.locked
                                                                    ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/60'
                                                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                                        } ${item.locked ? 'opacity-85 hover:opacity-100' : ''}`}
                                                    >
                                                        <span className="flex items-center justify-between">
                                                            <div className="flex-1 flex items-center justify-between min-w-0">
                                                                <span className="truncate">{item.title}</span>
                                                                {item.locked && item.requiredModule && (() => {
                                                                    const plan = MODULE_PLAN[item.requiredModule];
                                                                    if (!plan) return null;
                                                                    const styles = {
                                                                        amber:  'text-slate-500 bg-slate-50 border-slate-200',
                                                                        violet: 'text-slate-500 bg-slate-50 border-slate-200',
                                                                        blue:   'text-slate-500 bg-slate-50 border-slate-200',
                                                                    };
                                                                    const icons = {
                                                                        amber:  <Zap className="w-2.5 h-2.5 opacity-70" />,
                                                                        violet: <Sparkles className="w-2.5 h-2.5 opacity-70" />,
                                                                        blue:   <ArrowRight className="w-2.5 h-2.5 opacity-70" />,
                                                                    };
                                                                    return (
                                                                        <span className={`ml-2 flex-shrink-0 inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider border px-1.5 py-0.5 rounded-md ${styles[plan.color]}`}>
                                                                            {icons[plan.color]}{plan.label}
                                                                        </span>
                                                                    );
                                                                })()}
                                                            </div>
                                                            {!item.locked && item.badge > 0 && (
                                                                <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-amber-500 text-white text-[9px] font-black px-1">{item.badge}</span>
                                                            )}
                                                        </span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div className={`mt-5 pt-5 border-t border-gray-50 ${isSystemAdmin ? 'hidden' : ''}`}>
                            <button
                                type="button"
                                onClick={() => isSidebarCollapsed ? toggleSidebar() : setHelpMenuOpen((open) => !open)}
                                title={isSidebarCollapsed ? 'Bantuan' : ''}
                                className={`group relative flex items-center ${isSidebarCollapsed ? 'w-[48px] h-[48px] mx-auto justify-center rounded-[16px]' : 'w-full justify-between px-4 py-3 rounded-[12px]'} text-gray-500 hover:text-[#5B33CC] hover:bg-gray-50 transition-all`}
                            >
                                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                                    <HelpCircle className={`w-[20px] h-[20px] transition-transform group-hover:scale-110 ${isActive('/help') ? 'text-[#5B33CC]' : ''}`} />
                                    {!isSidebarCollapsed && (
                                        <span className={`text-[12px] font-bold ${isActive('/help') ? 'text-[#5B33CC]' : ''}`}>Bantuan</span>
                                    )}
                                </div>
                                {!isSidebarCollapsed && (
                                    <ChevronRight className={`w-4 h-4 opacity-60 transition-transform duration-300 ${helpMenuOpen ? 'rotate-90' : ''}`} />
                                )}
                            </button>

                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${helpMenuOpen && !isSidebarCollapsed ? 'max-h-32 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                <div className="ml-6 pl-4 border-l-2 border-gray-100 space-y-1.5 py-1">
                                    <Link href="/help/live-support" className={`block w-full text-left px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${isActive('/help/live-support') ? 'text-[#5B33CC] bg-indigo-50/50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
                                        Bantuan Cepat
                                    </Link>
                                    <Link href="/help/documentation" className={`block w-full text-left px-3 py-2 rounded-lg text-[13px] font-bold transition-all ${isActive('/help/documentation') ? 'text-[#5B33CC] bg-indigo-50/50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
                                        Dokumentasi
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </nav>

                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative petayu-bg-app">
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
                                        <div className="text-[14px] font-black text-slate-900 leading-tight">{notif.title}</div>
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
                <header className="h-[76px] flex items-center justify-between px-10 flex-shrink-0 z-[100] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.015)] border-b petayu-border">
                    <div className="flex items-center space-x-4">
                        {headerTitle && (
                            <h2 className="text-[18px] font-black text-slate-900 mr-4">{headerTitle}</h2>
                        )}
                        {!hideSearch ? (
                            <div className="flex-1 min-w-[380px] relative">
                                <Search className="w-[17px] h-[17px] absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={headerSearchPlaceholder || "Cari data..."}
                                    className="w-full bg-[#f4f5f9] text-[13px] text-gray-700 rounded-[12px] pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#5B33CC] border border-transparent transition-all font-bold placeholder-gray-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                                    value={onSearch ? (searchValue || '') : fallbackSearch}
                                    onChange={(e) => {
                                        if (onSearch) {
                                            onSearch(e.target.value);
                                        } else {
                                            setFallbackSearch(e.target.value);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSearchSubmit(e.currentTarget.value);
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="hidden" style={{ display: 'none' }}></div>
                        )}

                        {/* Status indicators moved to sidebar */}
                    </div>

                    <div className="flex items-center space-x-8">
                        {headerRight ? headerRight : (
                            <>
                                <div className="flex items-center space-x-6 text-gray-500">
                                    <Link href="/notifications" className="hover:text-gray-900 transition-all relative mt-1 group">
                                        <div className="p-2.5 rounded-xl bg-gray-50 group-hover:bg-indigo-50 group-hover:text-[#5B33CC] transition-colors">
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
                                        <div className="p-2.5 rounded-xl bg-gray-50 group-hover:bg-indigo-50 group-hover:text-[#5B33CC] transition-colors">
                                            <HelpCircle className="w-[22px] h-[22px]" />
                                        </div>
                                    </Link>
                                </div>

                                <div className="h-8 w-[1px] bg-gray-100"></div>

                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <div className="flex items-center space-x-3 pl-2 cursor-pointer group">
                                            <div className="flex flex-col text-right">
                                                <span className="text-[13px] font-extrabold text-slate-900 group-hover:text-[#5B33CC] transition-colors leading-tight">
                                                    {auth?.user?.name || 'Pengguna'}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    {formatRoleLabel(auth?.user?.role_name || auth?.user?.role)}
                                                </span>
                                            </div>
                                            <div className="w-[42px] h-[42px] rounded-full bg-[#f0f4f8] flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm overflow-hidden group-hover:border-indigo-100 transition-all text-slate-900 font-black text-xs uppercase">
                                                {auth?.user?.profile_photo_url && !headerAvatarError ? (
                                                    <img
                                                        src={auth.user.profile_photo_url}
                                                        alt={`Foto profil ${auth?.user?.name || 'Pengguna Sistem'}`}
                                                        className="h-full w-full object-cover"
                                                        onError={() => setHeaderAvatarError(true)}
                                                    />
                                                ) : (
                                                    <img
                                                        src="/images/image.png"
                                                        alt="Foto profil default"
                                                        className="h-full w-full object-cover opacity-85"
                                                    />
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

                {/* Breadcrumb Navigation */}
                {!fullPage && <Breadcrumb url={url} />}

                {/* Quick Actions Bar Removed */}

                {/* Dashboard Scrollable Area */}
                <main
                    scroll-region="true"
                    className={`flex-1 min-h-0 overflow-x-hidden scroll-smooth ${fullPage ? 'flex flex-col p-0 overflow-y-hidden bg-white' : 'px-10 pt-6 pb-32 overflow-y-auto petayu-bg-app'} ${hideMainScrollbar ? '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden' : ''}`}
                >
                    {fullPage ? (
                        children
                    ) : (
                        <div className={contentClassName}>
                            {children}
                        </div>
                    )}
                </main>
            </div>

            <Modal show={!!forbiddenModal} maxWidth="lg" onClose={() => setForbiddenModal(null)}>
                <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Error 403</p>
                            <h3 className="text-[22px] font-black text-slate-900">Akses Ditolak</h3>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-5">
                    <p className="text-[14px] font-semibold leading-7 text-slate-600">
                        {forbiddenModal?.message || 'Anda tidak memiliki akses ke fitur ini.'}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => setForbiddenModal(null)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50"
                        >
                            Tutup
                        </button>
                        <Link
                            href="/dashboard"
                            className="rounded-xl bg-[#5B33CC] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#4a26aa]"
                        >
                            Ke Dasbor
                        </Link>
                        {forbiddenModal?.module_locked && (
                            <Link
                                href="/settings/billing"
                                className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-[13px] font-bold text-violet-700 hover:bg-violet-100"
                            >
                                Lihat Paket
                            </Link>
                        )}
                    </div>
                </div>
            </Modal>

            <Modal show={!!lockedModuleModal} maxWidth="lg" onClose={() => setLockedModuleModal(null)}>
                <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                            <Lock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Fitur Terkunci</p>
                            <h3 className="text-[22px] font-black text-slate-900">Upgrade Paket Diperlukan</h3>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-5">
                    <p className="text-[14px] font-semibold leading-7 text-slate-600">
                        Fitur <span className="font-black text-slate-900">{lockedModuleModal?.featureName}</span> belum aktif di paket Anda saat ini.
                        Silakan upgrade paket agar fitur ini bisa digunakan.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => setLockedModuleModal(null)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50"
                        >
                            Nanti Saja
                        </button>
                        <Link
                            href={`/settings/billing?source=locked&module=${encodeURIComponent(lockedModuleModal?.featureName || 'fitur')}`}
                            className="rounded-xl bg-[#5B33CC] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#4a26aa]"
                        >
                            Lihat Paket & Upgrade
                        </Link>
                    </div>
                </div>
            </Modal>

            <Modal show={confirmingLogout} maxWidth="md" onClose={() => setConfirmingLogout(false)}>
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[8px] bg-red-50 text-red-600">
                            <LogOut className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-[20px] font-black text-slate-950">Keluar dari akun?</h2>
                            <p className="mt-2 text-[14px] font-semibold leading-7 text-slate-500">
                                Sesi akan ditutup. Pastikan data yang sedang dikerjakan sudah disimpan.
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
            <GlobalToast />
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

    if (value === 'system_admin') {
        return 'Admin Sistem';
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

    if (value.includes('admin sistem') || value.includes('admin system') || value.includes('super admin') || value.includes('system_admin')) {
        return 'system_admin';
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
