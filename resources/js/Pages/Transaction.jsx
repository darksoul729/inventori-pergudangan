import DashboardLayout from '@/Layouts/DashboardLayout';
import CustomDropdown from '@/Components/CustomDropdown';
import { Head, Link, router, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { isManagerRole, isSupervisorRole } from '@/Utils/roleCapabilities';

const loadExportTools = async () => {
    const [{ default: ExcelJS }, { saveAs }] = await Promise.all([
        import('exceljs/dist/exceljs.min.js'),
        import('file-saver'),
    ]);

    return { ExcelJS, saveAs };
};

const paginationLabel = (label) => String(label || '')
    .replace(/&laquo;/g, '<')
    .replace(/&raquo;/g, '>');

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
    const roleName = props.auth?.user?.role_name || props.auth?.user?.role || '';
    const canExportTransactions = isManagerRole(roleName) || isSupervisorRole(roleName);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
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
            const worksheet = workbook.addWorksheet('Riwayat Stok');

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
            console.error('Ekspor gagal:', error);
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

            <div className="space-y-5 pb-10 pt-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-[30px] font-black tracking-tight text-[#1f2a3d]">Riwayat Transaksi Gudang</h1>
                    <p className="text-[14px] font-semibold text-slate-500">Semua barang masuk, keluar, transfer, dan penyesuaian dicatat di sini.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-[#E5EAF3] bg-white p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <InboundIcon className="h-5 w-5" />
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${stats.inbound_trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {stats.inbound_trend >= 0 ? '+' : ''}{stats.inbound_trend}%
                            </span>
                        </div>
                        <p className="text-[12px] font-bold text-slate-500">Barang Masuk (24 jam)</p>
                        <p className="mt-1 text-[30px] font-black text-[#4722B3]">{(stats.inbound_24h || 0).toLocaleString('id-ID')}</p>
                    </div>

                    <div className="rounded-2xl border border-[#E5EAF3] bg-white p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <OutboundIcon className="h-5 w-5" />
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${stats.outbound_trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {stats.outbound_trend >= 0 ? '+' : ''}{stats.outbound_trend}%
                            </span>
                        </div>
                        <p className="text-[12px] font-bold text-slate-500">Barang Keluar (24 jam)</p>
                        <p className="mt-1 text-[30px] font-black text-[#1f2a3d]">{(stats.outbound_24h || 0).toLocaleString('id-ID')}</p>
                    </div>

                    <div className="rounded-2xl border border-[#E5EAF3] bg-white p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                <ShieldCheckIcon className="h-5 w-5" />
                            </div>
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700">
                                {stats.pending_audits > 5 ? 'Perlu Tindakan' : 'Normal'}
                            </span>
                        </div>
                        <p className="text-[12px] font-bold text-slate-500">Menunggu Verifikasi</p>
                        <p className="mt-1 text-[30px] font-black text-amber-700">{(stats.pending_audits || 0).toLocaleString('id-ID')}</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-[#E5EAF3] bg-white p-5">
                    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <h2 className="text-[20px] font-black text-[#1f2a3d]">Daftar Mutasi Terbaru</h2>
                        <div className="flex flex-wrap items-center gap-2">
                            {canExportTransactions && (
                                <button
                                    onClick={handleExportXlsx}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    Ekspor Excel
                                </button>
                            )}
                            <div className="relative min-w-[190px]">
                                <FilterIcon2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500" />
                                <CustomDropdown
                                    value={typeFilter}
                                    onChange={(value) => {
                                        setTypeFilter(value);
                                        handleFilterChange(value);
                                    }}
                                    options={[
                                        { value: 'all', label: 'Semua Jenis' },
                                        { value: 'in', label: 'Barang Masuk' },
                                        { value: 'out', label: 'Barang Keluar' },
                                        { value: 'transfer', label: 'Transfer Stok' },
                                        { value: 'adjustment', label: 'Penyesuaian Stok' },
                                        { value: 'opname', label: 'Stok Opname' },
                                    ]}
                                    className="pl-6"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-slate-100 text-left text-[11px] font-black uppercase tracking-wide text-slate-400">
                                    <th className="px-2 py-3">ID</th>
                                    <th className="px-2 py-3">Barang</th>
                                    <th className="px-2 py-3">Jenis</th>
                                    <th className="px-2 py-3">Operator</th>
                                    <th className="px-2 py-3">Waktu</th>
                                    <th className="px-2 py-3 text-right">Jumlah</th>
                                    <th className="px-2 py-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {movements.data.map((m) => {
                                    const status = getStatusInfo(m);
                                    return (
                                        <tr
                                            key={m.id}
                                            onClick={() => router.visit(route('transaction.show', m.id))}
                                            className="cursor-pointer hover:bg-indigo-50/50"
                                        >
                                            <td className="px-2 py-4 text-[12px] font-black text-[#5B33CC]">#{String(m.id).padStart(6, '0')}</td>
                                            <td className="px-2 py-4">
                                                <div className="max-w-[280px]">
                                                    <p className="truncate text-[13px] font-black text-[#1f2a3d]">{m.product?.name || 'Barang tidak dikenal'}</p>
                                                    {m.source_document_number && (
                                                        <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">{m.source_document_label}: {m.source_document_number}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-2 py-4">
                                                <div className="inline-flex items-center gap-2 text-[12px] font-bold text-[#4722B3]">
                                                    {getMovementIcon(m.movement_type)}
                                                    <span>{m.movement_type === 'in' ? 'Masuk' : m.movement_type === 'out' ? 'Keluar' : m.movement_type === 'transfer' ? 'Transfer' : m.movement_type === 'adjustment' ? 'Penyesuaian' : 'Opname'}</span>
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 text-[12px] font-semibold text-slate-600">{m.user?.name || 'Sistem'}</td>
                                            <td className="px-2 py-4 text-[12px] font-semibold text-slate-600">
                                                {new Date(m.movement_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}{' '}
                                                {new Date(m.movement_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-2 py-4 text-right text-[13px] font-black text-[#1f2a3d]">{(m.quantity || 0).toLocaleString('id-ID')}</td>
                                            <td className="px-2 py-4 text-right">
                                                <span className={`${status.color} rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {movements.data.length === 0 && (
                        <div className="py-16 text-center">
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                                <ShieldCheckIcon className="h-7 w-7 text-slate-300" />
                            </div>
                            <p className="text-[16px] font-black text-slate-500">Belum ada transaksi sesuai filter</p>
                            <p className="text-[13px] font-semibold text-slate-400">Coba ubah filter, atau mulai catat barang masuk/keluar terlebih dulu.</p>
                            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                                <Link
                                    href={route('purchase-orders.create')}
                                    className="rounded-xl bg-[#5B33CC] px-4 py-2 text-[12px] font-bold text-white hover:bg-indigo-700"
                                >
                                    + Catat Barang Masuk
                                </Link>
                                <Link
                                    href={route('inventory.outbound.view')}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-bold text-[#5B33CC] hover:bg-slate-50"
                                >
                                    + Catat Barang Keluar
                                </Link>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
                        <span className="text-[12px] font-semibold text-slate-500">
                            Menampilkan {movements.from || 0} - {movements.to || 0} dari {movements.total || 0} transaksi
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {movements.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`rounded-lg px-3 py-1.5 text-[12px] font-black transition ${
                                        link.active
                                            ? 'bg-[#5B33CC] text-white'
                                            : link.url
                                                ? 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                                : 'cursor-default border border-slate-100 bg-white text-slate-300'
                                    }`}
                                >
                                    {paginationLabel(link.label)}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
