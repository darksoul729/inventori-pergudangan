import re

with open("resources/js/Layouts/DashboardLayout.jsx", "r") as f:
    content = f.read()

# 1. Replace imports and icons (lines 1 to 78 essentially)
import_section = """import React, { useEffect, useRef, useState } from 'react';
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
    Package
} from 'lucide-react';

import Dropdown from '@/Components/Dropdown';
import FloatingBubble from '@/Components/FloatingBubble';

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
    const userRole = normalizeRoleKey(auth?.user?.role_name || auth?.user?.role);
    const isManager = userRole === 'manager';
    const isSupervisor = userRole === 'supervisor';
    const canViewReports = isManager || isSupervisor;
    const canManageWarehouseOps = isManager || isSupervisor;

    // Sidebar States
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [openGroups, setOpenGroups] = useState(['Utama', 'Operasional Gudang', 'Pembelian', 'Logistik', 'Transaksi & Dokumen', 'Sistem']);

    const toggleGroup = (heading) => {
        setOpenGroups(prev => 
            prev.includes(heading) ? prev.filter(h => h !== heading) : [...prev, heading]
        );
    };

    const menuGroups = [
        {
            heading: 'Utama',
            items: [
                { title: 'Dasbor', url: '/dashboard', icon: LayoutDashboard, show: true },
                { title: 'Inventaris', url: '/inventory', icon: Boxes, show: true },
            ]
        },
        {
            heading: 'Operasional Gudang',
            items: [
                { title: 'Manajemen Gudang', url: '/warehouse', icon: Home, show: true },
                { title: 'Transfer Rack', url: '/rack-allocation', icon: ArrowRightLeft, show: canManageWarehouseOps },
                { title: 'Stock Opname', url: '/stock-opname', icon: ClipboardCheck, show: canManageWarehouseOps },
            ]
        },
        {
            heading: 'Transaksi & Dokumen',
            items: [
                { title: 'Transaksi', url: '/transaction', icon: FileText, show: true },
                { title: 'Dokumen WMS', url: '/wms-documents', icon: FileText, show: canManageWarehouseOps },
            ]
        },
        {
            heading: 'Pembelian',
            items: [
                { title: 'Pesanan Pembelian', url: '/purchase-orders', icon: ShoppingCart, show: true },
                { title: 'Pemasok', url: '/supplier', icon: Users, show: true },
            ]
        },
        {
            heading: 'Logistik',
            items: [
                { title: 'Pengiriman', url: '/shipments', icon: Truck, show: true },
                { title: 'Manajemen Driver', url: '/drivers', icon: Users, show: isManager },
            ]
        },
        {
            heading: 'Sistem',
            items: [
                { title: 'Laporan', url: '/reports', icon: BarChart3, show: canViewReports },
                { title: 'Pengaturan', url: '/settings', icon: Settings, show: isManager },
            ]
        }
    ];
"""

content = re.sub(r'import React[\s\S]*?canManageWarehouseOps = isManager \|\| isSupervisor;', import_section, content, count=1)

# 2. Replace the HTML structure (sidebar render mostly)
sidebar_html = """return (
        <div className="flex h-screen bg-[#f8f9fc] font-sans antialiased text-gray-900">
            {/* Sidebar */}
            <div className={`bg-white flex flex-col justify-between flex-shrink-0 z-[110] shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative border-r border-[#edf2f7] transition-all duration-300 ${isSidebarCollapsed ? 'w-[96px]' : 'w-[270px]'}`}>
                {/* Collapse Toggle Button */}
                <button 
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute -right-3 top-9 bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 rounded-full p-1 shadow-sm transition-transform z-[120] hover:scale-110"
                >
                    <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                </button>

                <div className="flex flex-col h-full overflow-hidden">
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
                    <nav className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-4 pt-6 pb-4 space-y-1">
                        {menuGroups.map((group, gIdx) => {
                            const visibleItems = group.items.filter(i => i.show);
                            if (visibleItems.length === 0) return null;

                            const isOpen = openGroups.includes(group.heading) || isSidebarCollapsed;

                            return (
                                <div key={gIdx} className={`mb-6 ${isSidebarCollapsed ? 'mt-4' : ''}`}>
                                    {/* Header Group */}
                                    {!isSidebarCollapsed && (
                                        <button 
                                            onClick={() => toggleGroup(group.heading)}
                                            className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                                        >
                                            <span className="truncate">{group.heading}</span>
                                            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                        </button>
                                    )}

                                    {/* Items Container */}
                                    <div className={`space-y-1.5 ${!isSidebarCollapsed && isOpen ? 'mt-1.5' : ''} ${!isSidebarCollapsed && !isOpen ? 'hidden' : ''}`}>
                                        {visibleItems.map((item, iIdx) => {
                                            const active = isActive(item.url);
                                            return (
                                                <Link 
                                                    key={iIdx} 
                                                    href={item.url} 
                                                    className={`flex items-center space-x-3.5 ${isSidebarCollapsed ? 'justify-center w-[52px] h-[52px] mx-auto rounded-[18px]' : 'px-4 py-3.5 rounded-[14px]'} font-bold text-[13px] transition-all group relative ${active ? 'bg-[#f4f3ff] text-[#3632c0] shadow-[0_2px_12px_rgba(54,50,192,0.06)] ring-1 ring-indigo-50' : 'text-gray-500 hover:text-[#3632c0] hover:bg-gray-50'}`}
                                                >
                                                    <item.icon className={`${isSidebarCollapsed ? 'w-[22px] h-[22px]' : 'w-[18px] h-[18px]'} transition-transform group-hover:scale-110`} strokeWidth={active ? 2.5 : 2} />
                                                    {!isSidebarCollapsed && (
                                                        <span className="whitespace-nowrap">{item.title}</span>
                                                    )}
                                                    {/* Tooltip for collapsed mode */}
                                                    {isSidebarCollapsed && (
                                                        <div className="absolute left-[64px] opacity-0 invisible group-hover:opacity-100 group-hover:visible bg-[#1a202c] text-white text-[12px] font-bold py-1.5 px-3 rounded-xl whitespace-nowrap z-50 shadow-xl border border-gray-700/50 transition-all ml-1 pointer-events-none">
                                                            {item.title}
                                                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#1a202c] rotate-45 border-b border-l border-gray-700/50"></div>
                                                        </div>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                    {!isSidebarCollapsed && <div className="h-[1px] w-8 bg-gray-100 mx-3 mt-4"></div>}
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom Actions Panel */}
                <div className={`px-5 pb-8 pt-4 border-t border-gray-50 flex flex-col space-y-4 ${isSidebarCollapsed ? 'items-center' : ''}`}>
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3 px-2'} text-gray-500 hover:text-[#3632c0] transition-colors group relative`}>
                                <HelpCircle className={`w-[20px] h-[20px] transition-transform group-hover:scale-110 ${isActive('/help') ? 'text-[#3632c0]' : ''}`} />
                                {!isSidebarCollapsed && (
                                    <span className={`text-[12px] font-bold ${isActive('/help') ? 'text-[#3632c0]' : ''}`}>Pusat Bantuan</span>
                                )}
                                {isSidebarCollapsed && (
                                    <div className="absolute left-[64px] opacity-0 invisible group-hover:opacity-100 group-hover:visible bg-[#1a202c] text-white text-[12px] font-bold py-1.5 px-3 rounded-xl whitespace-nowrap z-50 shadow-xl border border-gray-700/50 transition-all ml-1 pointer-events-none">
                                        Pusat Bantuan
                                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#1a202c] rotate-45 border-b border-l border-gray-700/50"></div>
                                    </div>
                                )}
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content align={isSidebarCollapsed ? "left" : "left"} width="56" className="mb-2 bottom-full origin-bottom-left">
                            <Dropdown.Link href="#" className="font-bold text-[12px]">Bantuan Langsung</Dropdown.Link>
                            <Dropdown.Link href="#" className="font-bold text-[12px]">Dokumentasi Sistem</Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#f8f9fc]">"""

content = re.sub(r'return \([\s\S]*?{/\* Main Content Area \*/}\n            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-\[#f8f9fc\]">', sidebar_html, content)

# 3. Use Lucide Icons for header instead of custom SVG components
header_icons_replace = """<div className="flex-1 min-w-[380px] relative">
                            <Search className="w-[17px] h-[17px] absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />"""
content = re.sub(r'<div className="flex-1 min-w-\[380px\] relative">\s*<SearchIcon className="w-\[17px\] h-\[17px\] absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />', header_icons_replace, content)

bell_replace = """<Bell className="w-[22px] h-[22px]" />"""
content = re.sub(r'<BellIcon className="w-\[24px\] h-\[24px\]" />', bell_replace, content)

bell_2_replace = """<Bell className="w-10 h-10 text-gray-200" />"""
content = re.sub(r'<BellIcon className="w-10 h-10 text-gray-200" />', bell_2_replace, content)

help_replace = """<HelpCircle className="w-[22px] h-[22px]" />"""
content = re.sub(r'<HelpCircleIcon className="w-\[24px\] h-\[24px\]" />', help_replace, content)

with open("resources/js/Layouts/DashboardLayout.jsx", "w") as f:
    f.write(content)
