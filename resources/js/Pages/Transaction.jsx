import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';

const loadExportTools = async () => {
    const [{ default: ExcelJS }, { saveAs }] = await Promise.all([
        import('exceljs/dist/exceljs.min.js'),
        import('file-saver'),
    ]);

    return { ExcelJS, saveAs };
};

// Icons
const InboundIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
);

const OutboundIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const ShieldCheckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const FilterIcon2 = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
);

const CheckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);

const ArrowUpRightIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
    </svg>
);

const AIAuditIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const AdjustmentIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
);

const TransferIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
);

export default function Transaction({ movements, stats, filters }) {
    const { props } = usePage();
    const roleName = String(props.auth?.user?.role_name || props.auth?.user?.role || '').toLowerCase();
    const canExportTransactions = roleName.includes('manager') || roleName.includes('manajer') || roleName.includes('admin gudang') || roleName.includes('supervisor') || roleName.includes('spv');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [dismissedAlerts, setDismissedAlerts] = useState([]);

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                handleFilterChange();
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleFilterChange = (newType = typeFilter) => {
        router.get(route('transaction'), {
            search: searchTerm,
            type: newType
        }, {
            preserveState: true,
            replace: true,
            only: ['movements', 'stats', 'filters'],
            preserveScroll: true
        });
    };

    const handleExportXlsx = async () => {
        try {
            const response = await fetch(route('transaction.export', { ...filters, format: 'json' }));
            const data = await response.json();

            if (!data.movements || data.movements.length === 0) {
                alert('Tidak ada data untuk diekspor.');
                return;
            }

            const { ExcelJS, saveAs } = await loadExportTools();
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Riwayat Transaksi');

            // 1. Set Title Row
            const titleCell = worksheet.getCell('A1');
            titleCell.value = 'LAPORAN RIWAYAT TRANSAKSI GUDANG';
            titleCell.font = { name: 'Arial', family: 4, size: 16, bold: true };
            titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
            worksheet.mergeCells('A1:J1');
            worksheet.getRow(1).height = 40;

            // 2. Define Headers
            const headers = [
                { header: 'NO', key: 'no', width: 8 },
                { header: 'DOKUMEN SUMBER', key: 'source_document', width: 28 },
                { header: 'NAMA BARANG', key: 'product', width: 35 },
                { header: 'SKU', key: 'sku', width: 15 },
                { header: 'JENIS', key: 'type', width: 15 },
                { header: 'JUMLAH', key: 'qty', width: 15 },
                { header: 'GUDANG', key: 'warehouse', width: 25 },
                { header: 'OPERATOR', key: 'operator', width: 20 },
                { header: 'WAKTU', key: 'timestamp', width: 25 },
                { header: 'CATATAN', key: 'notes', width: 40 }
            ];

            worksheet.columns = headers;

            // 3. Style Header Row (Row 2)
            const headerRow = worksheet.getRow(2);
            headerRow.values = headers.map(h => h.header);
            headerRow.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF333F50' } // Dark bluish-purple
                };
                cell.font = {
                    color: { argb: 'FFFFFFFF' },
                    bold: true,
                    size: 11
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
            headerRow.height = 25;

            // 4. Add Data Rows
            data.movements.forEach((m, index) => {
                const row = worksheet.addRow({
                    no: index + 1,
                    source_document: m['Source Document'] || '-',
                    product: m['Product Name'],
                    sku: m['SKU'],
                    type: m['Type'],
                    qty: m['Quantity'],
                    warehouse: m['Warehouse'],
                    operator: m['Operator'],
                    timestamp: m['Timestamp'],
                    notes: m['Notes']
                });

                row.eachCell((cell, colNumber) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    cell.font = { size: 10 };

                    // Center all except Product and Notes which might be long
                    if ([1, 3, 4, 7, 8].includes(colNumber)) {
                        cell.alignment = { horizontal: 'center' };
                    }
                    if (colNumber === 5) { // Quantity
                        cell.alignment = { horizontal: 'right' };
                        cell.numFmt = '#,##0';
                    }
                });
            });

            // 5. Add Footer Notes
            const lastRow = worksheet.rowCount;
            worksheet.addRow([]); // Gap
            const noteRow1 = worksheet.addRow(['', 'Catatan: Laporan ini berisi riwayat mutasi stok yang tercatat pada sistem gudang.']);
            const noteRow2 = worksheet.addRow(['', 'Sistem: Operasional Gudang']);

            noteRow1.font = { italic: true, size: 9, color: { argb: 'FF555555' } };
            noteRow2.font = { italic: true, size: 9, color: { argb: 'FF555555' } };

            // 6. Write to Buffer and Save
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), `riwayat-transaksi-${new Date().toISOString().slice(0, 10)}.xlsx`);

        } catch (error) {
            console.error('Export failed:', error);
            alert('Gagal mengekspor data. Silakan coba lagi.');
        }
    };

    const getMovementIcon = (type) => {
        switch (type) {
            case 'in': return <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />;
            case 'out': return <ArrowUpRightIcon className="w-4 h-4 text-indigo-500" />;
            case 'transfer': return <TransferIcon className="w-4 h-4 text-blue-500" />;
            case 'adjustment':
            case 'opname': return <AdjustmentIcon className="w-4 h-4 text-amber-500" />;
            default: return <CheckIcon className="w-3.5 h-3.5 text-gray-400" />;
        }
    };

    const getStatusInfo = (movement) => {
        if (movement.verification_status === 'pending') {
            return { label: 'Perlu Verifikasi', color: 'bg-amber-50 text-amber-600 border border-amber-100' };
        }
        
        if (movement.movement_type === 'transfer') {
            return { label: 'Transfer', color: 'bg-blue-50 text-blue-600 border border-blue-100' };
        }
        if (movement.movement_type === 'in') {
            return { label: 'Barang Masuk', color: 'bg-emerald-50 text-emerald-600 border border-emerald-100' };
        }
        if (movement.quantity > 1000) {
            return { label: 'Volume Tinggi', color: 'bg-indigo-50 text-indigo-600 border border-indigo-100' };
        }
        return { label: 'Selesai', color: 'bg-gray-50 text-gray-500 border border-gray-100' };
    };

    return (
        <DashboardLayout
            headerSearchPlaceholder="Cari transaksi, barang, atau operator..."
            searchValue={searchTerm}
            onSearch={setSearchTerm}
        >
            <Head title="Riwayat Transaksi" />

            <div className="flex flex-row gap-8 pb-12 w-full pt-4 min-w-[1000px] overflow-x-auto bg-[#f8fafc]">
                {/* Left Column - Main Content */}
                <div className="flex-1 flex flex-col space-y-8">

                    {/* Header */}
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-[28px] font-black text-[#0f172a] tracking-tight mb-1">Riwayat Transaksi Gudang</h1>
                            <p className="text-[14px] font-semibold text-slate-500">Pantau mutasi barang masuk, keluar, transfer, dan penyesuaian dari gudang operasional.</p>
                        </div>
                        {/* Action Buttons Removed */}
                    </div>

                    {/* 3 Metric Cards */}
                    <div className="grid grid-cols-3 gap-6">
                        {/* 1. Inbound Units */}
                        <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#edf2f7] relative overflow-hidden">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-600"></div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <InboundIcon className="w-5 h-5" />
                                </div>
                                <span className={`text-[10px] font-black h-fit px-2 py-1 rounded-md tracking-wider ${stats.inbound_trend >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                                    {stats.inbound_trend >= 0 ? '+' : ''}{stats.inbound_trend}%
                                </span>
                            </div>
                            <div>
                                <h3 className="text-[12px] font-extrabold text-gray-500 mb-1">Barang Masuk 24 Jam</h3>
                                <div className="text-[28px] font-black text-[#1a202c]">{stats.inbound_24h.toLocaleString()}</div>
                            </div>
                        </div>

                        {/* 2. Outbound Units */}
                        <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#edf2f7] relative overflow-hidden">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500"></div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                    <OutboundIcon className="w-5 h-5" />
                                </div>
                                <span className={`text-[10px] font-black h-fit px-2 py-1 rounded-md tracking-wider ${stats.outbound_trend >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                                    {stats.outbound_trend >= 0 ? '+' : ''}{stats.outbound_trend}%
                                </span>
                            </div>
                            <div>
                                <h3 className="text-[12px] font-extrabold text-gray-500 mb-1">Barang Keluar 24 Jam</h3>
                                <div className="text-[28px] font-black text-[#1a202c]">{stats.outbound_24h.toLocaleString()}</div>
                            </div>
                        </div>

                        {/* 3. Pending Audits */}
                        <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#edf2f7] relative overflow-hidden">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-500"></div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                                        <ShieldCheckIcon className="w-5 h-5" />
                                    </div>
                                    {stats.pending_audits > 0 && (
                                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white"></div>
                                    )}
                                </div>
                                <span className="text-[10px] font-black text-amber-600 tracking-wider">
                                    {stats.pending_audits > 5 ? 'Prioritas Tinggi' : 'Rutin'}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-[12px] font-extrabold text-gray-500 mb-1">Perlu Verifikasi</h3>
                                <div className="text-[28px] font-black text-[#1a202c]">{stats.pending_audits}</div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#edf2f7] flex-1 flex flex-col">

                        {/* Table Header Row */}
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-[20px] font-black text-[#0f172a]">Daftar Mutasi Terbaru</h2>
                            <div className="flex items-center space-x-3">
                                {canExportTransactions && (
                                    <button
                                        onClick={handleExportXlsx}
                                        className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl text-[13px] hover:bg-gray-50 shadow-sm transition-colors flex items-center space-x-2"
                                    >
                                        <span>Ekspor Excel</span>
                                    </button>
                                )}
                                <div className="relative group">
                                    <select
                                        className="flex items-center space-x-2 px-8 py-2.5 bg-indigo-50 text-indigo-600 font-black rounded-xl text-[13px] hover:bg-indigo-100 transition-colors border-none appearance-none cursor-pointer"
                                        value={typeFilter}
                                        onChange={(e) => {
                                            setTypeFilter(e.target.value);
                                            handleFilterChange(e.target.value);
                                        }}
                                    >
                                        <option value="all">Filter: Semua Jenis</option>
                                        <option value="in">Barang Masuk</option>
                                        <option value="out">Barang Keluar</option>
                                        <option value="transfer">Transfer Stok</option>
                                        <option value="adjustment">Penyesuaian Stok</option>
                                        <option value="opname">Stok Opname</option>
                                    </select>
                                    <FilterIcon2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
                                </div>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="w-full flex-1">
                            {/* Columns */}
                            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-100 text-[9px] font-black text-gray-400 tracking-widest uppercase">
                                <div className="col-span-1">ID Log</div>
                                <div className="col-span-3">Barang / Operator</div>
                                <div className="col-span-2">Jenis</div>
                                <div className="col-span-2 text-center">Waktu</div>
                                <div className="col-span-2 text-right">Jumlah</div>
                                <div className="col-span-2 text-right">Status</div>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-gray-50">
                                {movements.data.map((m) => {
                                    const status = getStatusInfo(m);
                                    return (
                                        <div
                                            key={m.id}
                                            onClick={() => router.visit(route('transaction.show', m.id))}
                                            className="grid grid-cols-12 gap-4 py-5 items-center hover:bg-indigo-50/50 transition-colors group cursor-pointer"
                                        >
                                            <div className="col-span-1">
                                                <span className="text-[12px] font-black text-[#4f46e5]">#{m.id.toString().padStart(6, '0')}</span>
                                            </div>
                                            <div className="col-span-3 flex flex-col">
                                                <span className="text-[13px] font-black text-[#1a202c] leading-tight truncate">
                                                    {m.product?.name || 'Barang Tidak Dikenal'}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 mt-0.5">
                                                    Operator: {m.user?.name || 'Sistem'}
                                                </span>
                                                {m.source_document_number && (
                                                    <span className="mt-1 w-fit rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-600">
                                                        {m.source_document_label}: {m.source_document_number}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="col-span-2 flex items-center space-x-2">
                                                {getMovementIcon(m.movement_type)}
                                                <span className="text-[12px] font-bold text-[#1a202c] capitalize">{m.movement_type === 'in' ? 'Masuk' : m.movement_type === 'out' ? 'Keluar' : m.movement_type === 'transfer' ? 'Transfer' : m.movement_type === 'adjustment' ? 'Penyesuaian' : 'Opname'}</span>
                                            </div>
                                            <div className="col-span-2 flex flex-col justify-center text-center">
                                                <span className="text-[11px] font-bold text-gray-500">
                                                    {new Date(m.movement_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400">
                                                    {new Date(m.movement_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                            <div className="col-span-2 text-right pr-4">
                                                <span className="text-[14px] font-black text-[#1a202c]">{m.quantity.toLocaleString()}</span>
                                            </div>
                                            <div className="col-span-2 text-right flex justify-end">
                                                <span className={`${status.color} text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest text-center whitespace-nowrap`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {movements.data.length === 0 && (
                                    <div className="py-20 text-center flex flex-col items-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                            <ShieldCheckIcon className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <h3 className="text-[16px] font-black text-gray-400">Tidak ada transaksi ditemukan</h3>
                                        <p className="text-[12px] font-bold text-gray-300">Coba ubah filter atau kata kunci pencarian.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                            <span className="text-[12px] font-bold text-gray-400">
                                Menampilkan {movements.from || 0} - {movements.to || 0} dari {movements.total} transaksi
                            </span>
                            <div className="flex space-x-2">
                                {movements.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-1.5 rounded-lg text-[12px] font-black transition-all ${link.active
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : link.url
                                                    ? 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'
                                                    : 'bg-white border border-gray-100 text-gray-200 cursor-default'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column - Status & Context */}
                <div className="w-[360px] flex-shrink-0 flex flex-col space-y-6">

                    {/* Ringkasan Operasional */}
                    <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#edf2f7] overflow-hidden flex flex-col">

                        {/* Card Header */}
                        <div className="p-6 pb-4 flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(79,70,229,0.4)]">
                                <AIAuditIcon className="w-4 h-4" />
                            </div>
                            <h2 className="text-[16px] font-black text-[#1a202c]">Ringkasan Operasional</h2>
                        </div>

                        {/* List of Alerts */}
                        <div className="px-6 pb-6 space-y-4">

                            {stats.pending_audits > 0 && !dismissedAlerts.includes('pending_audits') && (
                                <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 p-4 border-l-4 border-l-amber-500 relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-[13px] font-bold text-[#1a202c] max-w-[70%] leading-tight">Verifikasi Diperlukan</h4>
                                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Tertunda</span>
                                    </div>
                                    <p className="text-[11.5px] font-semibold text-gray-500 leading-relaxed mb-3">
                                        {stats.pending_audits} penyesuaian stok terbaru perlu diperiksa ulang oleh petugas.
                                    </p>
                                    <div className="flex space-x-4">
                                        <button 
                                            onClick={() => handleFilterChange('adjustment,opname')}
                                            className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 transition-colors"
                                        >
                                            Mulai Pemeriksaan
                                        </button>
                                        <button 
                                            onClick={() => setDismissedAlerts(prev => [...prev, 'pending_audits'])}
                                            className="text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            Tutup
                                        </button>
                                    </div>
                                </div>
                            )}

                            {stats.outbound_trend > 20 && (
                                <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 p-4 border-l-4 border-l-red-500 relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-[13px] font-bold text-[#1a202c] max-w-[70%] leading-tight">Volume Keluar Meningkat</h4>
                                        <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Aktif</span>
                                    </div>
                                    <p className="text-[11.5px] font-semibold text-gray-500 leading-relaxed">
                                        Aktivitas barang keluar naik {stats.outbound_trend}% dibanding periode sebelumnya. Perlu pemantauan beban kerja gudang.
                                    </p>
                                </div>
                            )}

                            <div className="bg-slate-50 rounded-xl shadow-sm border border-slate-200 p-4 border-l-4 border-l-slate-500 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-[13px] font-bold text-[#1a202c] max-w-[70%] leading-tight">Kondisi Pencatatan</h4>
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Normal</span>
                                </div>
                                <p className="text-[11.5px] font-semibold text-gray-500 leading-relaxed">
                                    Pencatatan mutasi berjalan normal dan seluruh riwayat transaksi tersimpan pada sistem gudang.
                                </p>
                            </div>

                        </div>

                        {/* Card Footer Button */}
                        <div className="px-6 pb-6 mt-auto">
                            <button className="w-full py-3.5 bg-white border border-gray-200 rounded-xl text-[13px] font-black text-gray-600 hover:bg-gray-50 hover:text-[#1a202c] shadow-sm transition-all focus:outline-none">
                                Lihat Riwayat Lengkap
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#edf2f7] relative overflow-hidden h-[130px]">

                        <div className="relative z-10 flex items-center space-x-2 mb-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                            <span className="text-[13px] font-black text-gray-700">Status Perangkat Gudang</span>
                        </div>

                        <div className="relative z-10 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 flex justify-between items-center shadow-sm">
                            <span className="text-[11.5px] font-black text-gray-600">Perangkat Aktif</span>
                            <span className="text-[16px] font-black text-[#2563eb] tracking-wide">1.204 / 1.205</span>
                        </div>
                    </div>

                </div>

            </div>
        </DashboardLayout>
    );
}
