import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm, Link, usePage } from '@inertiajs/react';
import React, { useState, useMemo, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const loadExportTools = async () => {
    const [{ default: ExcelJS }, { saveAs }] = await Promise.all([
        import('exceljs/dist/exceljs.min.js'),
        import('file-saver'),
    ]);

    return { ExcelJS, saveAs };
};

// === Icons ===
const DownloadIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const ClockIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ShieldCheckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const WarningIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const TrendUpIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const TrendRightIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
);

const TrendDownIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
    </svg>
);

const ExternalLinkIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

const IntelligenceIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
);

const NodeSyncIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const ChevronDownIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
);

// Color palette for dynamic lines
const supplierColors = [
    '#5932C9', // Indigo
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#10b981', // Emerald
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
];


export default function Supplier({ suppliers = [], stats = {}, chartData = [], availableYears = [], selectedYear = null, categories = [], filters = {} }) {
    const { props } = usePage();
    const roleName = String(props.auth?.user?.role_name || props.auth?.user?.role || '').toLowerCase();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSuppliers = useMemo(() => {
        let list = suppliers;
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            list = list.filter(sup => 
                (sup.name || '').toLowerCase().includes(lowerSearch) || 
                (sup.code || '').toLowerCase().includes(lowerSearch) ||
                (sup.contact_person || '').toLowerCase().includes(lowerSearch)
            );
        }
        return list;
    }, [suppliers, searchTerm]);

    const isManager = roleName.includes('manager') || roleName.includes('manajer') || roleName.includes('admin gudang');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        name: '',
        category: '',
        contact_person: '',
        phone: '',
        email: ''
    });

    const handleYearChange = (e) => {
        router.get(route('supplier'), { year: e.target.value }, { preserveState: true, preserveScroll: true });
    };

    const submitAdd = (e) => {
        e.preventDefault();
        post(route('supplier.store'), {
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
            }
        });
    };

    const handleExportAudit = async () => {
        console.log('Export audit button clicked');
        try {
            const { ExcelJS, saveAs } = await loadExportTools();
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Audit Snapshot');

            // Styles based on User Image
            const headerStyle = {
                font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } },
                alignment: { horizontal: 'left', vertical: 'middle' },
            };

            const blueTextColor = { color: { argb: 'FF31869B' }, bold: true };

            // Define Columns (Matching Image 2 Data & Image 1 Style)
            worksheet.columns = [
                { header: 'Partner Code', key: 'code', width: 15 },
                { header: 'Company Name', key: 'name', width: 25 },
                { header: 'Category', key: 'category', width: 20 },
                { header: 'Status', key: 'status', width: 12 },
                { header: 'Performance Score (%)', key: 'score', width: 20 },
                { header: 'Avg Lead Time (Days)', key: 'leadTime', width: 20 },
                { header: 'Total Orders', key: 'orders', width: 15 },
                { header: 'On-Time Deliveries', key: 'onTime', width: 18 },
                { header: 'Late Deliveries', key: 'late', width: 15 },
                { header: 'Email', key: 'email', width: 25 },
                { header: 'Contact Person', key: 'contact', width: 20 },
            ];

            // Style the Header Row
            const headerRow = worksheet.getRow(1);
            headerRow.height = 30;
            headerRow.eachCell((cell) => {
                cell.style = headerStyle;
                cell.border = {
                    bottom: { style: 'medium', color: { argb: 'FF366092' } }
                };
            });

            // Add Data Rows
            suppliers.forEach((s) => {
                const perf = s.latest_performance || {};
                const row = worksheet.addRow({
                    code: s.code,
                    name: s.name,
                    category: s.category || '-',
                    status: s.status,
                    score: Number(perf.performance_score || 0).toFixed(2),
                    leadTime: Number(perf.avg_lead_time_days || 0).toFixed(2),
                    orders: perf.total_orders || 0,
                    onTime: perf.on_time_deliveries || 0,
                    late: perf.late_deliveries || 0,
                    email: s.email || '-',
                    contact: s.contact_person || '-'
                });

                row.height = 25;

                // Highlight Column 1 (Code) and Column 11 (Contact) with Blue Text
                row.getCell(1).font = blueTextColor;
                row.getCell(11).font = blueTextColor;

                // Horizontal grid lines
                row.eachCell((cell) => {
                    cell.border = {
                        bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } }
                    };
                    cell.alignment = { vertical: 'middle', horizontal: 'left' };
                });
            });

            console.log('Generating buffer...');
            // Generate & Download
            const buffer = await workbook.xlsx.writeBuffer();
            const dateStr = new Date().toISOString().split('T')[0];
            console.log('Initiating download...');
            saveAs(new Blob([buffer]), `audit-supplier-${dateStr}.xlsx`);
        } catch (err) {
            console.error('Excel export error:', err);
            alert('Gagal mengekspor file: ' + err.message);
        }
    };

    return (
        <DashboardLayout
            headerSearchPlaceholder="Cari pemasok (nama, kode, atau kontak)..."
            searchValue={searchTerm}
            onSearch={setSearchTerm}
        >
            <Head title="Performa Pemasok" />

            <div className="flex flex-row gap-6 pb-12 w-full pt-2 min-w-[1000px] overflow-x-auto">
                <div className="flex-1 flex flex-col space-y-6">

                    {/* Header Row */}
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <h1 className="text-[28px] font-black text-[#28106F] tracking-tight">Performa Pemasok</h1>
                            <p className="text-[14px] font-bold text-gray-500 mt-1">Pantau ketepatan pengiriman, lead time, dan kualitas pemasok untuk gudang operasional.</p>
                        </div>
                        <div className="flex space-x-3">
                            {isManager && (
                                <button onClick={() => setIsAddOpen(true)} className="flex items-center space-x-2 px-6 py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-[14px] transition-colors shadow-sm">
                                    <span>+ Tambah Pemasok</span>
                                </button>
                            )}
                            <button
                                onClick={handleExportAudit}
                                className="flex items-center space-x-2 px-6 py-3.5 bg-[#5932C9] shadow-[#5932C9]/30 shadow-lg hover:bg-indigo-700 text-white font-bold rounded-xl text-[14px] transition-colors"
                            >
                                <DownloadIcon className="w-4 h-4" />
                                <span>Ekspor Audit</span>
                            </button>
                        </div>
                    </div>

                    {/* 3 Stat Cards */}
                    <div className="grid grid-cols-3 gap-6">
                        {/* 1. Avg Lead Time */}
                        <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC] flex items-center space-x-5">
                            <div className="w-12 h-12 rounded-[14px] bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                <ClockIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-[12px] font-bold text-gray-500 tracking-wide mb-0.5">Rata-rata Lead Time</h3>
                                <div className="text-[22px] font-black text-[#28106F] leading-tight mb-0.5">{stats?.avgLeadTime?.value || '0.0'} Hari</div>
                                <div className={`flex items-center space-x-1 font-bold text-[10px] ${stats?.avgLeadTime?.direction === 'up' ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {stats?.avgLeadTime?.direction === 'up' ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
                                    <span>{stats?.avgLeadTime?.text || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. On-Time Delivery */}
                        <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC] flex items-center space-x-5">
                            <div className="w-12 h-12 rounded-[14px] bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                                <ShieldCheckIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-[12px] font-bold text-gray-500 tracking-wide mb-0.5">Pengiriman Tepat Waktu</h3>
                                <div className="text-[22px] font-black text-[#28106F] leading-tight mb-0.5">{stats?.onTimeDelivery?.value || '0.0'}%</div>
                                <div className={`flex items-center space-x-1 font-bold text-[10px] ${stats?.onTimeDelivery?.direction === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {stats?.onTimeDelivery?.direction === 'up' ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
                                    <span>{stats?.onTimeDelivery?.text || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Late Deliveries */}
                        <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC] flex items-center space-x-5">
                            <div className="w-12 h-12 rounded-[14px] bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0">
                                <WarningIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-[12px] font-bold text-gray-500 tracking-wide mb-0.5">Pengiriman Terlambat</h3>
                                <div className="text-[22px] font-black text-[#28106F] leading-tight mb-0.5">{stats?.lateDeliveries?.value || 0} Unit</div>
                                <div className={`flex items-center space-x-1 font-bold text-[10px] ${stats?.lateDeliveries?.direction === 'up' ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {stats?.lateDeliveries?.direction === 'up' ? <TrendUpIcon className="w-3 h-3" /> : <TrendDownIcon className="w-3 h-3" />}
                                    <span>{stats?.lateDeliveries?.text || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Correlation Chart */}
                    <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC]">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-[18px] font-black text-[#28106F]">Korelasi Performa</h2>
                            <div className="flex items-center space-x-6 text-[12px] font-bold text-gray-500">

                                {/* Year Filter Dropdown */}
                                {availableYears.length > 0 && (
                                    <div className="relative">
                                        <select
                                            value={selectedYear}
                                            onChange={handleYearChange}
                                            className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-1.5 pl-4 pr-8 rounded-lg outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500 text-[11px] font-black"
                                        >
                                            {availableYears.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                        <ChevronDownIcon className="w-3 h-3 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bubble Chart Area */}
                        <div className="relative w-full pl-4 pr-12 pb-8 mt-10 mb-2" style={{ height: '320px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} dx={-10} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontWeight: 'bold', fontSize: '12px' }}
                                        labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }} />
                                    {filteredSuppliers.map((sup, index) => (
                                        <Line
                                            key={sup.id}
                                            type="monotone"
                                            dataKey={sup.code}
                                            stroke={supplierColors[index % supplierColors.length]}
                                            strokeWidth={3}
                                            dot={{ r: 4, strokeWidth: 2 }}
                                            activeDot={{ r: 6 }}
                                            name={`${sup.name} (${sup.code})`}
                                            connectNulls={true}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Partner Directory */}
                    <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC]">

                        {/* Header Row */}
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-[18px] font-black text-[#28106F]">Direktori Mitra</h2>
                            <div className="flex items-center space-x-3">
                                {/* Status Filter */}
                                <div className="relative">
                                    <select
                                        value={filters?.status || ''}
                                        onChange={(e) => router.get(route('supplier'), { ...filters, status: e.target.value, year: selectedYear }, { preserveState: true, preserveScroll: true })}
                                        className="appearance-none bg-gray-50 border border-gray-100 shadow-sm pl-4 pr-10 py-2 rounded-xl text-[12px] font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Semua Tingkatan</option>
                                        <option value="active">Hanya Aktif</option>
                                        <option value="inactive">Tidak Aktif</option>
                                    </select>
                                    <ChevronDownIcon className="w-3 h-3 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                                </div>

                                {/* Category Filter */}
                                <div className="relative">
                                    <select
                                        value={filters?.category || ''}
                                        onChange={(e) => router.get(route('supplier'), { ...filters, category: e.target.value, year: selectedYear }, { preserveState: true, preserveScroll: true })}
                                        className="appearance-none bg-gray-50 border border-gray-100 shadow-sm pl-4 pr-10 py-2 rounded-xl text-[12px] font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Semua Kategori</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <ChevronDownIcon className="w-3 h-3 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="w-full">
                            {/* Columns */}
                            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-100 text-[10px] font-black text-gray-400 tracking-[0.1em] uppercase">
                                <div className="col-span-4 pl-2">Pemasok</div>
                                <div className="col-span-3">Skor</div>
                                <div className="col-span-2">Waktu Tunggu</div>
                                <div className="col-span-2">Tren</div>
                                <div className="col-span-1 text-right pr-4">Aksi</div>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-gray-50/80">

                                {/* Dynamic Rows */}
                                {filteredSuppliers.map((supplier) => {
                                    const perf = supplier.latest_performance || {};
                                    const score = perf.performance_score || 0;
                                    const leadTime = perf.avg_lead_time_days || 0;

                                    // Determine styling based on score
                                    let iconBg = "bg-indigo-100 text-indigo-700";
                                    let barColor = "bg-emerald-500";
                                    let TrendIcon = TrendUpIcon;
                                    let trendColor = "text-emerald-500";

                                    if (score < 80 && score >= 70) {
                                        iconBg = "bg-indigo-600 text-white";
                                        barColor = "bg-amber-500";
                                        TrendIcon = TrendRightIcon;
                                        trendColor = "text-amber-500";
                                    } else if (score < 70) {
                                        iconBg = "bg-orange-100 text-orange-600";
                                        barColor = "bg-red-500";
                                        TrendIcon = TrendDownIcon;
                                        trendColor = "text-red-500";
                                    }

                                    return (
                                        <div key={supplier.id} className="grid grid-cols-12 gap-4 py-5 items-center hover:bg-gray-50/50 transition-colors">
                                            <div className="col-span-4 flex items-center space-x-4 pl-2">
                                                <div className={`w-[42px] h-[42px] rounded-xl flex flex-col items-center justify-center font-black text-[14px] flex-shrink-0 ${iconBg}`}>
                                                    {supplier.code}
                                                </div>
                                                <div>
                                                    <div className="text-[13px] font-black text-[#28106F] mb-0.5">{supplier.name}</div>
                                                    <div className="text-[10px] font-bold text-gray-400">{supplier.category}</div>
                                                </div>
                                            </div>
                                            <div className="col-span-3 flex items-center space-x-4">
                                                <div className="flex-1 h-[4px] bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${score}%` }}></div>
                                                </div>
                                                <span className="text-[14px] font-black text-[#28106F]">{score}</span>
                                            </div>
                                            <div className="col-span-2 flex flex-col justify-center">
                                                <span className="text-[14px] font-black text-[#28106F]">{leadTime}</span>
                                                <span className="text-[11px] font-bold text-gray-500">Days</span>
                                            </div>
                                            <div className="col-span-2 flex justify-start pl-2">
                                                <TrendIcon className={`w-5 h-5 ${trendColor}`} />
                                            </div>
                                            <div className="col-span-1 flex justify-end pr-4">
                                                <Link href={route('supplier.show', supplier.id)} className="w-8 h-8 flex items-center justify-center text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors">
                                                    <ExternalLinkIcon className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}

                            </div>
                        </div>

                </div>
            </div>
        </div>

        {/* Modal Add Partner */}
        <Transition appear show={isManager && isAddOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[12000]" onClose={() => setIsAddOpen(false)}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-xl font-black text-gray-900 mb-2">
                                    Tambah Pemasok Baru
                                </Dialog.Title>
                                <p className="text-[13px] text-gray-500 mb-6 font-semibold">
                                    Masukkan profil mitra dengan teliti. Data performa akan dibuat secara otomatis pada pesanan pembelian awal.
                                </p>

                                <form onSubmit={submitAdd} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-black tracking-wider text-gray-500 uppercase mb-1">Kode Perusahaan</label>
                                            <input required type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="w-full rounded-xl bg-gray-50 border-gray-200 text-[14px] font-bold focus:ring-indigo-500 focus:border-indigo-500" placeholder="misal: AMZ" />
                                            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-black tracking-wider text-gray-500 uppercase mb-1">Kategori / Tingkat</label>
                                            <input type="text" value={data.category} onChange={e => setData('category', e.target.value)} className="w-full rounded-xl bg-gray-50 border-gray-200 text-[14px] font-bold focus:ring-indigo-500 focus:border-indigo-500" placeholder="misal: Tingkat 1 Utama" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black tracking-wider text-gray-500 uppercase mb-1">Nama Perusahaan</label>
                                        <input required type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full rounded-xl bg-gray-50 border-gray-200 text-[14px] font-bold focus:ring-indigo-500 focus:border-indigo-500" placeholder="misal: Amazon Logistics" />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-black tracking-wider text-gray-500 uppercase mb-1">Kontak Personal</label>
                                            <input type="text" value={data.contact_person} onChange={e => setData('contact_person', e.target.value)} className="w-full rounded-xl bg-gray-50 border-gray-200 text-[14px] font-bold focus:ring-indigo-500 focus:border-indigo-500" placeholder="John Doe" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-black tracking-wider text-gray-500 uppercase mb-1">Nomor Telepon</label>
                                            <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full rounded-xl bg-gray-50 border-gray-200 text-[14px] font-bold focus:ring-indigo-500 focus:border-indigo-500" placeholder="+1 234 567 89" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black tracking-wider text-gray-500 uppercase mb-1">Alamat Email</label>
                                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full rounded-xl bg-gray-50 border-gray-200 text-[14px] font-bold focus:ring-indigo-500 focus:border-indigo-500" placeholder="john.doe@example.com" />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>

                                    <div className="mt-8 flex justify-end space-x-3">
                                        <button type="button" onClick={() => setIsAddOpen(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-[13px] hover:bg-gray-50">Batal</button>
                                        <button type="submit" disabled={processing} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-[13px] hover:bg-indigo-700 disabled:opacity-50 flex items-center shadow-lg shadow-indigo-200">
                                            {processing ? 'Menyimpan...' : 'Simpan Pemasok'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>

    </DashboardLayout>
    );
}
