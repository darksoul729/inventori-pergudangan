import re

with open("resources/js/Layouts/DashboardLayout.jsx", "r") as f:
    content = f.read()

# 1. Fix the toggle button
old_button = r'<button \n                    onClick={toggleSidebar}\n                    className="absolute -right-3 top-9 bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 rounded-full p-1 shadow-sm transition-transform z-\[120\] hover:scale-110"\n                >\n                    <ChevronLeft className={`w-4 h-4 transition-transform duration-300 \${isSidebarCollapsed \? \'rotate-180\' : \'\'}`} />\n                </button>'
new_button = """<button 
                    onClick={toggleSidebar}
                    className="absolute -right-[16px] top-9 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-[#3632c0] rounded-full shadow-sm hover:shadow-md transition-all z-[120] hover:scale-105"
                >
                    <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} strokeWidth={2.5} />
                </button>"""
content = re.sub(old_button, new_button, content)

# 2. Fix the Logo Area
old_logo = r'<div className={`px-5 py-7 border-b border-gray-50/50 flex \${isSidebarCollapsed \? \'justify-center items-center\' : \'items-center space-x-3\.5 mx-3\'} transition-all`}>'
new_logo = """<div className={`border-b border-gray-50/50 flex transition-all ${isSidebarCollapsed ? 'justify-center items-center h-[96px] w-full' : 'items-center space-x-3.5 px-5 h-[96px]'}`}>"""
content = content.replace(old_logo, new_logo)

# 3. Fix the Navigation Single Item Link
old_link = r'<Link \n                                        key={mIdx} \n                                        href={menu\.url} \n                                        className={`flex items-center space-x-3 \${isSidebarCollapsed \? \'justify-center w-\[44px\] h-\[44px\] mx-auto rounded-\[14px\]\' : \'px-4 py-3 rounded-\[12px\]\'} font-bold text-\[13px\] transition-all group relative \${active \? \'bg-\[#f4f3ff\] text-\[#3632c0\]\' : \'text-gray-500 hover:text-\[#3632c0\] hover:bg-gray-50\'}`}\n                                    >\n                                        <menu\.icon className={`\${isSidebarCollapsed \? \'w-\[22px\] h-\[22px\]\' : \'w-\[18px\] h-\[18px\]\'} transition-transform group-hover:scale-110`} strokeWidth={active \? 2\.5 : 2} />'
new_link = """<Link 
                                        key={mIdx} 
                                        href={menu.url} 
                                        className={`group relative flex items-center ${isSidebarCollapsed ? 'w-[44px] h-[44px] mx-auto justify-center rounded-[14px]' : 'w-full space-x-3 px-4 py-3 rounded-[12px]'} font-bold text-[13px] transition-all ${active ? 'bg-[#f4f3ff] text-[#3632c0]' : 'text-gray-500 hover:text-[#3632c0] hover:bg-gray-50'}`}
                                    >
                                        <menu.icon className={`flex-shrink-0 transition-transform group-hover:scale-110 ${isSidebarCollapsed ? 'w-[22px] h-[22px]' : 'w-[18px] h-[18px]'}`} strokeWidth={active ? 2.5 : 2} />"""
content = re.sub(old_link, new_link, content)

# 4. Fix the Navigation Dropdown Button
old_dropdown_button = r'<button \n                                        onClick={\(\) => isSidebarCollapsed \? toggleSidebar\(\) : toggleMenu\(menu\.title\)}\n                                        className={`w-full flex items-center justify-between \${isSidebarCollapsed \? \'p-0 w-\[44px\] h-\[44px\] mx-auto rounded-\[14px\] justify-center\' : \'px-4 py-3 rounded-\[12px\]\'} font-bold text-\[13px\] transition-all group relative \${hasActiveChild && !isOpen && isSidebarCollapsed \? \'bg-\[#f4f3ff\] text-\[#3632c0\]\' : \'text-gray-500 hover:text-\[#3632c0\] hover:bg-gray-50\'} \${\(hasActiveChild \|\| isOpen\) && !isSidebarCollapsed \? \'text-\[#3632c0\]\' : \'\'}`}\n                                    >\n                                        <div className="flex items-center space-x-3">\n                                            <menu\.icon className={`\${isSidebarCollapsed \? \'w-\[22px\] h-\[22px\]\' : \'w-\[18px\] h-\[18px\]\'} transition-transform group-hover:scale-110`} strokeWidth={hasActiveChild \? 2\.5 : 2} />'

new_dropdown_button = """<button 
                                        onClick={() => isSidebarCollapsed ? toggleSidebar() : toggleMenu(menu.title)}
                                        className={`group relative flex items-center ${isSidebarCollapsed ? 'w-[44px] h-[44px] mx-auto justify-center rounded-[14px]' : 'w-full justify-between px-4 py-3 rounded-[12px]'} font-bold text-[13px] transition-all ${hasActiveChild && !isOpen && isSidebarCollapsed ? 'bg-[#f4f3ff] text-[#3632c0]' : 'text-gray-500 hover:text-[#3632c0] hover:bg-gray-50'} ${(hasActiveChild || isOpen) && !isSidebarCollapsed ? 'text-[#3632c0]' : ''}`}
                                    >
                                        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                                            <menu.icon className={`flex-shrink-0 transition-transform group-hover:scale-110 ${isSidebarCollapsed ? 'w-[22px] h-[22px]' : 'w-[18px] h-[18px]'}`} strokeWidth={hasActiveChild ? 2.5 : 2} />"""
content = re.sub(old_dropdown_button, new_dropdown_button, content)

with open("resources/js/Layouts/DashboardLayout.jsx", "w") as f:
    f.write(content)
