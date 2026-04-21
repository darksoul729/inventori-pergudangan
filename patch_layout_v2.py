import re

with open("resources/js/Layouts/DashboardLayout.jsx", "r") as f:
    content = f.read()

state_replace = """    // Sidebar States (Persisted)
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

    const sidebarScrollRef = useRef(null);

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

    const navMenus = [
        { title: 'Dasbor', url: '/dashboard', icon: LayoutDashboard, show: true },
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
    ];"""

content = re.sub(r'    // Sidebar States\n.*?(?=    const toastSeenIds)', state_replace, content, flags=re.DOTALL)

sidebar_html = """                    {/* Navigation */}
                    <nav 
                        ref={sidebarScrollRef}
                        onScroll={handleSidebarScroll}
                        className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-4 pt-6 pb-4 space-y-2"
                    >
                        {navMenus.filter(menu => menu.show).map((menu, mIdx) => {
                            // Render Single Item
                            if (!menu.items) {
                                const active = isActive(menu.url);
                                return (
                                    <Link 
                                        key={mIdx} 
                                        href={menu.url} 
                                        className={`flex items-center space-x-3 ${isSidebarCollapsed ? 'justify-center w-[44px] h-[44px] mx-auto rounded-[14px]' : 'px-4 py-3 rounded-[12px]'} font-bold text-[13px] transition-all group relative ${active ? 'bg-[#f4f3ff] text-[#3632c0]' : 'text-gray-500 hover:text-[#3632c0] hover:bg-gray-50'}`}
                                    >
                                        <menu.icon className={`${isSidebarCollapsed ? 'w-[22px] h-[22px]' : 'w-[18px] h-[18px]'} transition-transform group-hover:scale-110`} strokeWidth={active ? 2.5 : 2} />
                                        {!isSidebarCollapsed && (
                                            <span className="whitespace-nowrap">{menu.title}</span>
                                        )}
                                        {/* Tooltip for collapsed mode */}
                                        {isSidebarCollapsed && (
                                            <div className="absolute left-[56px] opacity-0 invisible group-hover:opacity-100 group-hover:visible bg-[#1a202c] text-white text-[12px] font-bold py-1.5 px-3 rounded-xl whitespace-nowrap z-[150] shadow-xl border border-gray-700/50 transition-all ml-1 pointer-events-none">
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
                                        className={`w-full flex items-center justify-between ${isSidebarCollapsed ? 'p-0 w-[44px] h-[44px] mx-auto rounded-[14px] justify-center' : 'px-4 py-3 rounded-[12px]'} font-bold text-[13px] transition-all group relative ${hasActiveChild && !isOpen && isSidebarCollapsed ? 'bg-[#f4f3ff] text-[#3632c0]' : 'text-gray-500 hover:text-[#3632c0] hover:bg-gray-50'} ${(hasActiveChild || isOpen) && !isSidebarCollapsed ? 'text-[#3632c0]' : ''}`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <menu.icon className={`${isSidebarCollapsed ? 'w-[22px] h-[22px]' : 'w-[18px] h-[18px]'} transition-transform group-hover:scale-110`} strokeWidth={hasActiveChild ? 2.5 : 2} />
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
                                            <div className="absolute left-[56px] opacity-0 invisible group-hover:opacity-100 group-hover:visible bg-[#1a202c] text-white text-[12px] font-bold py-1.5 px-3 rounded-xl whitespace-nowrap z-[150] shadow-xl border border-gray-700/50 transition-all ml-1 pointer-events-none">
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
                    </nav>"""

content = re.sub(r'                    {/\* Navigation \*/}\n.*?(?=                </div>\n\n                {/\* Bottom Actions Panel \*/})', sidebar_html, content, flags=re.DOTALL)

# Let's fix the toggle button action function
toggle_btn_fix = """onClick={toggleSidebar}"""
content = re.sub(r'onClick={\(\) => setIsSidebarCollapsed\(!isSidebarCollapsed\)}', toggle_btn_fix, content)

with open("resources/js/Layouts/DashboardLayout.jsx", "w") as f:
    f.write(content)
