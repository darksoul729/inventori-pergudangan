import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';

const loadExportTools = async () => {
    const [{ default: ExcelJS }, { saveAs }] = await Promise.all([
        import('exceljs/dist/exceljs.min.js'),
        import('file-saver'),
    ]);

    return { ExcelJS, saveAs };
};

// Icons
const GaugeIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const TrendingUpIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l10-10m0 0H8m9 0v9" />
    </svg>
);

const ZapIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const HourglassIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const DownloadIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const CogIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const EfficiencyGaugeIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.5 15.5C3.56225 14.4442 3 13.0649 3 11.5584C3 6.83117 7.02944 3 12 3C16.9706 3 21 6.83117 21 11.5584C21 13.0649 20.4377 14.4442 19.5 15.5" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M12 12L16 8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
);

const BoxIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M21 8L12 13L3 8V16L12 21L21 16V8Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 8L12 3L3 8L12 13L21 8Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 13V21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const TruckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M14 8h-4v6h4V8zM7 14h10v2a2 2 0 01-2 2h-6a2 2 0 01-2-2v-2zM4 10h6M4 14h3M17 14h3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
    </svg>
);

const CreditCardIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 10h20M7 15h3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const BarChartIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M6 20V12M12 20V4M18 20V16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ActivityIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 7h4v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const PieChartIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12L12 3A9 9 0 0121 12L12 12Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ClockIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const DownloadIcon2 = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
        <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default function Reports({ data, reports }) {
    // Custom Animation Styles
    const animationStyles = `
        @keyframes growUp {
            from { transform: scaleY(0); opacity: 0; }
            to { transform: scaleY(1); opacity: 1; }
        }
        .animate-grow-up {
            transform-origin: bottom;
            animation: growUp 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
    `;

    const [selectedDataSource, setSelectedDataSource] = useState('inventory');
    const [selectedVisualization, setSelectedVisualization] = useState('bar');

    const handleGenerate = () => {
        router.post(route('reports.generate'));
    };

    const handleDownload = (id) => {
        window.location.href = route('reports.download', id);
    };

    const handleExportCurrentView = async () => {
        try {
            const { ExcelJS, saveAs } = await loadExportTools();
            const workbook = new ExcelJS.Workbook();
            const dateStr  = new Date().toISOString().slice(0, 10);

            const applyHeader = (cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } };
                cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            };
            const applyRow = (row, i, leftCol = 2) => {
                row.eachCell((cell, col) => {
                    cell.font = { name: 'Arial', size: 10 };
                    cell.alignment = { vertical: 'middle', horizontal: col === leftCol ? 'left' : 'center' };
                    cell.border = { top: { style: 'thin', color: { argb: 'FFE5E7EB' } }, left: { style: 'thin', color: { argb: 'FFE5E7EB' } }, bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } }, right: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
                    if (i % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                });
            };
            const applyTotalRow = (row) => {
                row.eachCell((cell) => {
                    cell.font = { name: 'Arial', size: 11, bold: true };
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
                    cell.border = { top: { style: 'thin', color: { argb: 'FFCBD5E1' } }, left: { style: 'thin', color: { argb: 'FFCBD5E1' } }, bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } }, right: { style: 'thin', color: { argb: 'FFCBD5E1' } } };
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                });
            };
            const addTitle = (ws, cols, title, colCount) => {
                ws.columns = cols;
                const tc = ws.getCell('A1');
                tc.value = title;
                tc.font = { name: 'Arial', size: 15, bold: true };
                tc.alignment = { vertical: 'middle', horizontal: 'center' };
                ws.mergeCells(`A1:${String.fromCharCode(64 + colCount)}1`);
                ws.getRow(1).height = 26;
                const ic = ws.getCell('A2');
                ic.value = `Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}`;
                ic.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF6B7280' } };
                ws.mergeCells(`A2:${String.fromCharCode(64 + colCount)}2`);
                const hr = ws.getRow(4);
                hr.values = cols.map(c => c.header);
                hr.height = 22;
                hr.eachCell(applyHeader);
                ws.views = [{ state: 'frozen', ySplit: 4 }];
            };

            if (selectedDataSource === 'inventory') {
                if (!inventoryDistribution.length) { alert('Tidak ada data level inventaris.'); return; }
                const ws = workbook.addWorksheet('Level Inventaris');
                addTitle(ws, [
                    { header: 'NO', key: 'no', width: 6 },
                    { header: 'KATEGORI', key: 'category', width: 32 },
                    { header: 'TOTAL UNIT', key: 'total_qty', width: 16 },
                    { header: 'PERSENTASE (%)', key: 'share', width: 16 },
                ], 'LAPORAN LEVEL INVENTARIS', 4);
                inventoryDistribution.forEach((item, i) => {
                    const share = inventoryDistributionSummary.totalUnits > 0 ? item.total_qty / inventoryDistributionSummary.totalUnits : 0;
                    const row = ws.addRow({ no: i + 1, category: item.name, total_qty: item.total_qty, share });
                    applyRow(row, i, 2);
                    row.getCell('C').numFmt = '#,##0';
                    row.getCell('D').numFmt = '0.0%';
                });
                const tot = ws.addRow({ no: '', category: 'TOTAL', total_qty: inventoryDistributionSummary.totalUnits, share: 1 });
                applyTotalRow(tot); tot.getCell('B').alignment = { vertical: 'middle', horizontal: 'left' };
                tot.getCell('C').numFmt = '#,##0'; tot.getCell('D').numFmt = '0.0%';
                const buf = await workbook.xlsx.writeBuffer();
                saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `level-inventaris-${dateStr}.xlsx`);

            } else if (selectedDataSource === 'fleet') {
                const ws = workbook.addWorksheet('Armada Pengiriman');
                addTitle(ws, [
                    { header: 'NO', key: 'no', width: 6 },
                    { header: 'TANGGAL', key: 'date', width: 16 },
                    { header: 'JUMLAH PENGIRIMAN', key: 'count', width: 22 },
                ], 'LAPORAN TREN ARMADA PENGIRIMAN (7 HARI TERAKHIR)', 3);
                const trend = (data?.shipment_stats?.trend || []).slice(-7);
                trend.forEach((day, i) => {
                    const row = ws.addRow({ no: i + 1, date: day.date, count: day.count });
                    applyRow(row, i);
                });
                ws.addRow({});
                const sh = ws.addRow({ no: 'RINGKASAN', date: '', count: '' });
                sh.getCell('A').font = { bold: true };
                [['Total Trip', data?.shipment_stats?.total || 0], ['Sedang Transit', data?.shipment_stats?.transit || 0], ['Terkirim', data?.shipment_stats?.delivered || 0]].forEach(([label, val]) => {
                    const row = ws.addRow({ no: label, date: '', count: val });
                    row.getCell('A').font = { bold: true }; row.getCell('C').numFmt = '#,##0';
                });
                const buf = await workbook.xlsx.writeBuffer();
                saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `armada-pengiriman-${dateStr}.xlsx`);

            } else if (selectedDataSource === 'cost') {
                if (!inventoryDistribution.length) { alert('Tidak ada data valuasi.'); return; }
                const ws = workbook.addWorksheet('Analisis Biaya');
                addTitle(ws, [
                    { header: 'NO', key: 'no', width: 6 },
                    { header: 'KATEGORI', key: 'category', width: 32 },
                    { header: 'TOTAL UNIT', key: 'total_qty', width: 16 },
                    { header: 'NILAI ASET (Rp)', key: 'total_value', width: 22 },
                    { header: 'PERSENTASE (%)', key: 'share', width: 16 },
                ], 'LAPORAN ANALISIS BIAYA & VALUASI ASET', 5);
                inventoryDistribution.forEach((item, i) => {
                    const share = costDistributionSummary.totalValue > 0 ? item.total_value / costDistributionSummary.totalValue : 0;
                    const row = ws.addRow({ no: i + 1, category: item.name, total_qty: item.total_qty, total_value: item.total_value, share });
                    applyRow(row, i, 2);
                    row.getCell('C').numFmt = '#,##0'; row.getCell('D').numFmt = '"Rp "#,##0'; row.getCell('E').numFmt = '0.0%';
                });
                const tot = ws.addRow({ no: '', category: 'TOTAL', total_qty: inventoryDistributionSummary.totalUnits, total_value: costDistributionSummary.totalValue, share: 1 });
                applyTotalRow(tot); tot.getCell('B').alignment = { vertical: 'middle', horizontal: 'left' };
                tot.getCell('C').numFmt = '#,##0'; tot.getCell('D').numFmt = '"Rp "#,##0'; tot.getCell('E').numFmt = '0.0%';
                const buf = await workbook.xlsx.writeBuffer();
                saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `analisis-biaya-${dateStr}.xlsx`);
            }
        } catch (error) {
            console.error('Export gagal:', error);
            alert('Gagal mengekspor file. Silakan coba lagi.');
        }
    };

    const escapeXml = (value) => String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const handleExportAnalysisImage = async () => {
        const hasInventory = inventoryDistribution.length > 0;
        const hasFleet = (data?.shipment_stats?.total || 0) > 0;
        if (selectedDataSource === 'inventory' && !hasInventory) { alert('Tidak ada data inventaris.'); return; }
        if (selectedDataSource === 'fleet' && !hasFleet) { alert('Tidak ada data armada.'); return; }
        if (selectedDataSource === 'cost' && !hasInventory) { alert('Tidak ada data biaya.'); return; }

        try {
            const { saveAs } = await loadExportTools();
            const W = 1600; const H = 980;
            const dateStr = new Date().toISOString().slice(0, 10);
            let svg = ''; let filename = 'analisis';

            if (selectedDataSource === 'inventory') {
                filename = `analisis-inventaris-${dateStr}`;
                const mL = 170; const cTop = 390; const cH = 260; const cBot = cTop + cH; const cW = 1120;
                const bW = 220; const gap = 40; const sX = 320;
                const ticks = inventoryDistributionSummary.axisTicks;
                const topCat = inventoryDistributionSummary.topCategory;
                const axisLines = ticks.map((tick, idx) => {
                    const y = idx === 0 ? cTop : idx === ticks.length - 1 ? cBot : cTop + cH / 2;
                    return `<line x1="${mL}" y1="${y}" x2="${mL + cW}" y2="${y}" stroke="#dbe5f3" stroke-dasharray="6 10"/><text x="${mL - 20}" y="${y + 5}" text-anchor="end" font-size="20" font-weight="700" fill="#94a3b8">${tick.toLocaleString('id-ID')}</text>`;
                }).join('');
                const bars = inventoryDistribution.map((item, idx) => {
                    const h = Math.max((item.total_qty / inventoryDistributionMax) * 210, 24);
                    const x = sX + idx * (bW + gap); const y = cBot - h;
                    const share = inventoryDistributionSummary.totalUnits > 0 ? (item.total_qty / inventoryDistributionSummary.totalUnits) * 100 : 0;
                    const fill = idx === 0 ? 'url(#gA)' : idx === 1 ? 'url(#gB)' : 'url(#gC)';
                    return `<text x="${x + bW / 2}" y="${y - 34}" text-anchor="middle" font-size="22" font-weight="800" fill="#1e293b">${item.total_qty.toLocaleString('id-ID')}</text><text x="${x + bW / 2}" y="${y - 8}" text-anchor="middle" font-size="18" font-weight="700" fill="#94a3b8">${share.toFixed(1)}%</text><rect x="${x}" y="${y}" width="${bW}" height="${h}" rx="26" fill="${fill}"/><text x="${x + bW / 2}" y="${cBot + 46}" text-anchor="middle" font-size="22" font-weight="800" fill="#475569" letter-spacing="2">${escapeXml(item.name.toUpperCase())}</text>`;
                }).join('');
                svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="gA" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#9b97ff"/><stop offset="100%" stop-color="#6c63ff"/></linearGradient><linearGradient id="gB" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#b0b1ff"/><stop offset="100%" stop-color="#7d83ff"/></linearGradient><linearGradient id="gC" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#c8cbff"/><stop offset="100%" stop-color="#98a2ff"/></linearGradient></defs><rect width="${W}" height="${H}" fill="#f8fbff"/><rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="48" fill="#ffffff" stroke="#e7eef7"/><circle cx="${W - 96}" cy="86" r="9" fill="#34d399"/><text x="170" y="170" font-size="52" font-weight="800" fill="#1e293b">Level Inventaris</text><text x="170" y="216" font-size="24" font-weight="700" fill="#94a3b8" letter-spacing="3">VOLUME PER KATEGORI</text><rect x="170" y="280" width="580" height="150" rx="32" fill="#fff" stroke="#dbe7f4"/><text x="210" y="330" font-size="22" font-weight="800" fill="#94a3b8" letter-spacing="4">TOTAL UNIT</text><text x="210" y="386" font-size="64" font-weight="800" fill="#1e293b">${inventoryDistributionSummary.totalUnits.toLocaleString('id-ID')}</text><rect x="790" y="280" width="580" height="150" rx="32" fill="#fff" stroke="#dbe7f4"/><text x="830" y="330" font-size="22" font-weight="800" fill="#94a3b8" letter-spacing="4">KATEGORI TERBESAR</text><text x="830" y="386" font-size="44" font-weight="800" fill="#1e293b">${escapeXml(topCat?.name || '-')}</text><text x="830" y="420" font-size="24" font-weight="700" fill="#6366f1">${topCat ? topCat.total_qty.toLocaleString('id-ID') + ' Unit' : '0 Unit'}</text>${axisLines}${bars}</svg>`;

            } else if (selectedDataSource === 'fleet') {
                filename = `tren-armada-${dateStr}`;
                const trend = (data?.shipment_stats?.trend || []).slice(-7);
                const maxVal = Math.max(...trend.map(d => d.count), 1);
                const cTop = 320; const cH = 340; const cBot = cTop + cH;
                const bW = 120; const sX = 200;
                const fBars = trend.map((day, idx) => {
                    const h = Math.max((day.count / maxVal) * cH, day.count > 0 ? 20 : 4);
                    const x = sX + idx * (bW + 40); const y = cBot - h;
                    return `<rect x="${x}" y="${y}" width="${bW}" height="${h}" rx="18" fill="url(#fG)"/><text x="${x + bW / 2}" y="${y - 12}" text-anchor="middle" font-size="28" font-weight="800" fill="#1e293b">${day.count}</text><text x="${x + bW / 2}" y="${cBot + 44}" text-anchor="middle" font-size="22" font-weight="700" fill="#64748b">${day.date.slice(5)}</text>`;
                }).join('');
                svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="fG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#818cf8"/><stop offset="100%" stop-color="#4f46e5"/></linearGradient></defs><rect width="${W}" height="${H}" fill="#f8fbff"/><rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="48" fill="#ffffff" stroke="#e7eef7"/><circle cx="${W - 96}" cy="86" r="9" fill="#34d399"/><text x="170" y="170" font-size="52" font-weight="800" fill="#1e293b">Tren Armada Pengiriman</text><text x="170" y="216" font-size="24" font-weight="700" fill="#94a3b8" letter-spacing="3">7 HARI TERAKHIR</text><rect x="170" y="258" width="320" height="130" rx="28" fill="#fff" stroke="#dbe7f4"/><text x="200" y="303" font-size="20" font-weight="800" fill="#94a3b8">TOTAL TRIP</text><text x="200" y="358" font-size="56" font-weight="800" fill="#1e293b">${data?.shipment_stats?.total || 0}</text><rect x="530" y="258" width="320" height="130" rx="28" fill="#fff" stroke="#dbe7f4"/><text x="560" y="303" font-size="20" font-weight="800" fill="#94a3b8">TERKIRIM</text><text x="560" y="358" font-size="56" font-weight="800" fill="#10b981">${data?.shipment_stats?.delivered || 0}</text>${fBars}</svg>`;

            } else if (selectedDataSource === 'cost') {
                filename = `analisis-biaya-${dateStr}`;
                const cx = 800; const cy = 520; const r = 220; const sw = 80;
                const circ = 2 * Math.PI * r;
                const totalVal = costDistributionSummary.totalValue || 1;
                const topCat   = costDistributionSummary.topCategory;
                const colors   = ['#10b981', '#34d399', '#6ee7b7', '#059669', '#a7f3d0'];
                let accumOffset = 0;
                const arcs = inventoryDistribution.slice(0, 5).map((item, idx) => {
                    const share = item.total_value / totalVal;
                    const dash  = share * circ;
                    const arc   = `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="${colors[idx % 5]}" stroke-width="${sw}" fill="none" stroke-dasharray="${dash} ${circ}" stroke-dashoffset="${-accumOffset}" stroke-linecap="butt" transform="rotate(-90 ${cx} ${cy})"/>`;
                    accumOffset += dash;
                    return arc;
                }).join('');
                svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#f8fbff"/><rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="48" fill="#ffffff" stroke="#e7eef7"/><circle cx="${W - 96}" cy="86" r="9" fill="#34d399"/><text x="170" y="170" font-size="52" font-weight="800" fill="#1e293b">Analisis Biaya &amp; Valuasi Aset</text><text x="170" y="216" font-size="24" font-weight="700" fill="#94a3b8" letter-spacing="3">DISTRIBUSI NILAI PER KATEGORI</text><circle cx="${cx}" cy="${cy}" r="${r}" stroke="#f1f5f9" stroke-width="${sw}" fill="none"/>${arcs}<text x="${cx}" y="${cy - 16}" text-anchor="middle" font-size="26" font-weight="900" fill="#64748b">Total Valuasi</text><text x="${cx}" y="${cy + 30}" text-anchor="middle" font-size="30" font-weight="900" fill="#059669">Rp ${costDistributionSummary.totalValue.toLocaleString('id-ID')}</text><rect x="170" y="800" width="520" height="120" rx="24" fill="#fff" stroke="#dbe7f4"/><text x="200" y="845" font-size="18" font-weight="800" fill="#94a3b8" letter-spacing="3">ASET TERTINGGI</text><text x="200" y="890" font-size="36" font-weight="900" fill="#1e293b">${escapeXml(topCat?.name || '-')}</text></svg>`;
            }

            if (!svg) { alert('Tidak ada tampilan untuk diekspor.'); return; }
            const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            const image = new Image();
            await new Promise((res, rej) => { image.onload = res; image.onerror = rej; image.src = svgUrl; });
            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d');
            if (!ctx) { URL.revokeObjectURL(svgUrl); throw new Error('Canvas tidak tersedia.'); }
            ctx.drawImage(image, 0, 0, W, H);
            URL.revokeObjectURL(svgUrl);
            const pngBlob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
            if (!pngBlob) throw new Error('Gagal membuat PNG.');
            saveAs(pngBlob, `${filename}.png`);
        } catch (error) {
            console.error('Export gambar gagal:', error);
            alert('Gagal mengekspor gambar analisis.');
        }
    };
    const throughputStats = Array.isArray(data?.throughput) ? data.throughput : [];
    const recentThroughput = useMemo(() => throughputStats.slice(-7), [throughputStats]);
    const maxThroughput = useMemo(() => {
        return Math.max(...recentThroughput.map((d) => Math.max(Number(d.inbound || 0), Number(d.outbound || 0))), 10);
    }, [recentThroughput]);
    const throughputScale = useMemo(() => {
        const top = Math.max(10, Math.ceil(maxThroughput / 10) * 10);
        return [top, Math.round(top / 2), 0];
    }, [maxThroughput]);
    const throughputSummary = useMemo(() => {
        return recentThroughput.reduce((acc, item) => {
            acc.inbound += Number(item.inbound || 0);
            acc.outbound += Number(item.outbound || 0);
            acc.total += Number(item.total || 0);
            return acc;
        }, { inbound: 0, outbound: 0, total: 0 });
    }, [recentThroughput]);
    const inventoryDistribution = useMemo(() => {
        return (Array.isArray(data?.distribution) ? data.distribution : [])
            .map((item) => ({
                name: item.name,
                total_qty: Number(item.total_qty || 0),
                total_value: Number(item.total_value || 0),
                inbound_count: Number(item.inbound_count || 0),
                outbound_count: Number(item.outbound_count || 0),
            }))
            .filter((item) => item.total_qty > 0 || item.total_value > 0);
    }, [data?.distribution]);

    const inventoryDistributionMax = useMemo(() => {
        return Math.max(...inventoryDistribution.map((item) => item.total_qty), 1);
    }, [inventoryDistribution]);

    const inventoryDistributionSummary = useMemo(() => {
        const totalUnits = inventoryDistribution.reduce((sum, item) => sum + item.total_qty, 0);
        const topCategory = inventoryDistribution.reduce((top, item) => {
            if (!top || item.total_qty > top.total_qty) {
                return item;
            }
            return top;
        }, null);
        const axisTop = Math.max(10, Math.ceil(inventoryDistributionMax / 10) * 10);

        return {
            totalUnits,
            topCategory,
            axisTicks: [axisTop, Math.round(axisTop / 2), 0],
        };
    }, [inventoryDistribution, inventoryDistributionMax]);

    const costDistributionMax = useMemo(() => {
        return Math.max(...inventoryDistribution.map((item) => item.total_value), 1000);
    }, [inventoryDistribution]);

    const costDistributionSummary = useMemo(() => {
        const totalValue = inventoryDistribution.reduce((sum, item) => sum + item.total_value, 0);
        const topCategory = inventoryDistribution.reduce((top, item) => {
            if (!top || item.total_value > top.total_value) {
                return item;
            }
            return top;
        }, null);
        
        let formatAxis = (maxVal) => {
            if (maxVal > 1000000) return Math.ceil(maxVal / 1000000) * 1000000;
            if (maxVal > 100000) return Math.ceil(maxVal / 100000) * 100000;
            return Math.ceil(maxVal / 10000) * 10000;
        };
        const axisTop = formatAxis(costDistributionMax);

        return {
            totalValue,
            topCategory,
            axisTicks: [axisTop, Math.round(axisTop / 2), 0],
        };
    }, [inventoryDistribution, costDistributionMax]);
    // Header kanan halaman laporan
    const headerRight = (
        <div className="flex items-center space-x-4">
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <CogIcon className="w-[22px] h-[22px]" />
            </button>
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
                <span className="text-[13px] font-extrabold text-[#1a202c]">Pusat Laporan</span>
            </div>
        </div>
    );

    return (
        <DashboardLayout headerTitle="" headerRight={headerRight} headerSearchPlaceholder="Cari laporan atau data gudang...">
            <Head title="Laporan Gudang" />
            <style dangerouslySetInnerHTML={{ __html: animationStyles }} />

            {/* Standard spacing from DashboardLayout handles padding, we just build the content */}
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Header Actions */}
                <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start">
                    <div>
                        <h1 className="text-[36px] font-black text-[#1a202c] tracking-tight leading-none">Laporan Gudang</h1>
                        <p className="text-[15px] font-bold text-slate-500 mt-2.5">Pantau kondisi gudang operasional, arus barang, dan ringkasan inventaris dalam satu halaman.</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                        <button 
                            onClick={handleGenerate}
                            className="px-6 py-3 bg-[#2563eb] text-white font-black rounded-xl text-[12px] uppercase tracking-wider hover:bg-blue-700 transition-all flex items-center shadow-lg shadow-blue-100"
                        >
                            <span className="mr-2 text-lg leading-none">+</span>
                            Buat Laporan Status Gudang (PDF)
                        </button>
                    </div>
                </div>

                {/* Top Row: Chart, Efficiency & Faults */}
                <div className="grid grid-cols-12 gap-8 items-stretch">
                    {/* Main Chart Card */}
                    <div className="col-span-8 bg-white rounded-[32px] p-10 border border-[#edf2f7] shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col">
                        <div className="flex justify-between items-start gap-6 mb-8">
                            <div>
                                <h3 className="text-[18px] font-black text-[#1a202c]">Tren Pergerakan Barang</h3>
                                <p className="text-[12px] font-bold text-slate-500 mt-2">Ringkasan barang masuk dan keluar selama 7 hari terakhir di gudang operasional.</p>
                            </div>
                            <span className="px-3.5 py-1.5 bg-[#eff6ff] text-[10px] font-black text-[#2563eb] rounded-full uppercase tracking-widest">7 Hari Terakhir</span>
                        </div>

                        <div className="flex items-center gap-6 mb-6">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#5d55fa]"></span>
                                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-500">Masuk</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#94a3b8]"></span>
                                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-500">Keluar</span>
                            </div>
                            <div className="ml-auto flex items-center gap-6 text-right">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Barang Masuk</p>
                                    <p className="text-[20px] font-black text-[#1a202c]">{throughputSummary.inbound.toLocaleString('id-ID')}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Barang Keluar</p>
                                    <p className="text-[20px] font-black text-[#1a202c]">{throughputSummary.outbound.toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 min-h-[280px]">
                            {recentThroughput.length > 0 ? (
                                <div className="flex h-full gap-5">
                                    <div className="w-12 shrink-0 relative h-[240px]">
                                        {throughputScale.map((tick, index) => (
                                            <div
                                                key={tick}
                                                className={`absolute left-0 right-0 ${index === throughputScale.length - 1 ? 'bottom-0' : index === 0 ? 'top-0' : 'top-1/2 -translate-y-1/2'}`}
                                            >
                                                <span className="text-[10px] font-black text-gray-300">{tick}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="relative flex-1">
                                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                            {throughputScale.map((tick) => (
                                                <div key={tick} className="border-t border-dashed border-[#e7edf5]"></div>
                                            ))}
                                        </div>

                                        <div className="relative h-[240px] flex items-end gap-3 overflow-x-auto pb-1">
                                            {recentThroughput.map((d, i) => {
                                                const inbound = Number(d.inbound || 0);
                                                const outbound = Number(d.outbound || 0);
                                                const total = Number(d.total || inbound + outbound);
                                                const inboundHeight = Math.max((inbound / maxThroughput) * 170, inbound > 0 ? 10 : 6);
                                                const outboundHeight = Math.max((outbound / maxThroughput) * 170, outbound > 0 ? 10 : 6);
                                                const date = new Date(`${d.date}T00:00:00`);

                                                return (
                                                    <div key={i} className="min-w-[76px] flex-1 flex flex-col items-center justify-end group">
                                                        <div className="mb-3 text-center">
                                                            <p className="text-[10px] font-black text-[#1a202c]">{total.toLocaleString('id-ID')}</p>
                                                            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-300">Total</p>
                                                        </div>

                                                        <div className="flex items-end justify-center gap-2 h-[170px] w-full rounded-[20px] bg-gradient-to-b from-[#f8fafc] to-[#eef2f7] px-3 py-3 border border-[#edf2f7]">
                                                            <div className="flex flex-col items-center justify-end h-full">
                                                                <span className="text-[9px] font-black text-[#5d55fa] mb-2">{inbound.toLocaleString('id-ID')}</span>
                                                                <div
                                                                    style={{ 
                                                                        height: `${inboundHeight}px`,
                                                                        animationDelay: `${i * 100}ms`
                                                                    }}
                                                                    className={`w-5 rounded-full animate-grow-up transition-all duration-700 ${i === recentThroughput.length - 1 ? 'bg-gradient-to-t from-[#3b35be] to-[#5d55fa] shadow-[0_8px_20px_rgba(79,70,229,0.22)]' : 'bg-[#7c74ff]'}`}
                                                                ></div>
                                                            </div>
                                                            <div className="flex flex-col items-center justify-end h-full">
                                                                <span className="text-[9px] font-black text-slate-500 mb-2">{outbound.toLocaleString('id-ID')}</span>
                                                                <div
                                                                    style={{ 
                                                                        height: `${outboundHeight}px`,
                                                                        animationDelay: `${i * 100 + 50}ms`
                                                                    }}
                                                                    className="w-5 rounded-full bg-[#cbd5e1] animate-grow-up transition-all duration-700 group-hover:bg-[#94a3b8]"
                                                                ></div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-3 text-center">
                                                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1a202c]">
                                                                {date.toLocaleDateString('id-ID', { weekday: 'short' })}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-gray-400">
                                                                {date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">
                                    Belum ada data pergerakan barang.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side Stats */}
                    <div className="col-span-4 flex flex-col gap-8">
                        {/* Overall Efficiency Card */}
                        <div className="rounded-[32px] border border-[#dbeafe] bg-white p-9 shadow-[0_10px_30px_rgba(37,99,235,0.08)] relative overflow-hidden flex-1 flex flex-col justify-between">
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#2563eb] via-[#60a5fa] to-[#bfdbfe]"></div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="w-[44px] h-[44px] bg-[#eff6ff] rounded-xl flex items-center justify-center border border-[#dbeafe]">
                                        <EfficiencyGaugeIcon className="w-6 h-6 text-[#2563eb]" />
                                    </div>
                                    <span className="px-3 py-1.5 bg-[#eff6ff] text-[10px] font-black rounded-xl uppercase tracking-[0.2em] border border-[#dbeafe] text-[#2563eb]">Ringkasan</span>
                                </div>
                                
                                <div className="mt-2">
                                    <p className="text-[14px] font-bold text-slate-500 tracking-tight">Efisiensi Penyimpanan</p>
                                    <h2 className="text-[56px] font-bold tracking-tighter leading-none mt-2 text-[#1a202c]">{data?.efficiency || 0}%</h2>
                                    <div className="mt-10 flex items-center space-x-2 bg-[#f8fafc] w-fit px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                                        <TrendingUpIcon className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[12px] font-bold text-slate-600 tracking-tight">Tingkat keterisian rak saat ini</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Faults Card */}
                        <div className="bg-white rounded-[32px] p-9 border border-[#edf2f7] shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between whitespace-nowrap">
                            <div>
                                <h3 className="text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase mb-6">Status Operasional Gudang</h3>
                                <div className="flex items-center space-x-5">
                                    <div className={`w-3.5 h-3.5 rounded-full ${data?.total_stock > 0 ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'bg-[#f43f5e] shadow-[0_0_12px_rgba(244,63,94,0.5)] animate-pulse'}`}></div>
                                    <span className="text-[32px] font-black text-[#1a202c]">{(data?.total_products || 0).toLocaleString('id-ID')} Barang</span>
                                </div>
                            </div>
                            <div className="text-[13px] font-bold text-gray-500">
                                Total unit tersimpan: {(data?.total_stock || 0).toLocaleString('id-ID')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Movement Analysis */}
                <div className="bg-white rounded-[40px] p-12 border border-[#edf2f7] shadow-[0_4px_30px_rgba(0,0,0,0.03)] pb-14">
                    <div className="flex justify-between items-start mb-16">
                        <div>
                            <h2 className="text-[22px] font-black text-[#1a202c]">Analisis Pergerakan Barang</h2>
                            <p className="text-[14px] font-bold text-gray-400 mt-1.5">Lihat barang yang cepat keluar dan stok yang bergerak lambat untuk evaluasi operasional.</p>
                        </div>
                        <div className="flex items-center space-x-8">
                            <div className="flex items-center space-x-2.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#4f46e5]"></div>
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Cepat Bergerak</span>
                            </div>
                            <div className="flex items-center space-x-2.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#e2e8f5]"></div>
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Lambat Bergerak</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-24">
                        {/* Top Fast-Moving */}
                        <div className="space-y-10">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                                <div className="flex items-center space-x-2.5">
                                    <ZapIcon className="w-4 h-4 text-[#4f46e5]" />
                                    <h4 className="text-[12px] font-black text-[#4f46e5] tracking-[0.15em] uppercase">Barang Paling Cepat Keluar</h4>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unit Keluar / Minggu</span>
                            </div>
                            <div className="space-y-10">
                                {data?.fast_moving?.length > 0 ? data.fast_moving.map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-[14px] font-black text-[#1a202c] mb-3">
                                            <span>{item.name}</span>
                                            <span className="text-[#4f46e5]">{item.val}</span>
                                        </div>
                                        <div className="h-2 bg-[#f1f4f9] rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] rounded-full shadow-[0_2px_8px_rgba(79,70,229,0.2)] transition-all duration-1000" style={{ width: `${item.pct}%` }}></div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-gray-400 font-bold italic">Belum ada data barang cepat keluar.</div>
                                )}
                            </div>
                        </div>

                        {/* Slow Moving */}
                        <div className="space-y-10">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                                <div className="flex items-center space-x-2.5">
                                    <HourglassIcon className="w-4 h-4 text-gray-400" />
                                    <h4 className="text-[12px] font-black text-gray-500 tracking-[0.15em] uppercase">Stok Lambat Bergerak</h4>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hari Tidak Bergerak</span>
                            </div>
                            <div className="space-y-10">
                                {data?.slow_moving?.length > 0 ? data.slow_moving.map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-[14px] font-black text-[#1a202c] mb-3">
                                            <span>{item.name}</span>
                                            <span className="text-gray-400">{item.val}</span>
                                        </div>
                                        <div className="h-2 bg-[#f1f4f9] rounded-full overflow-hidden">
                                            <div className="h-full bg-[#a0aec0] rounded-full transition-all duration-1000" style={{ width: `${item.pct}%` }}></div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-gray-400 font-bold italic">Belum ada stok lambat bergerak.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 flex justify-center">
                        <button className="text-[11px] font-black text-[#2563eb] uppercase tracking-[0.25em] flex items-center group bg-[#eff6ff] px-6 py-3 rounded-xl hover:bg-blue-100 transition-all">
                            LIHAT RINGKASAN INVENTARIS
                            <span className="ml-3 group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>
                </div>

                {/* Photo 2 Content: Architect */}
                <div className="bg-white rounded-[40px] p-12 border border-[#edf2f7] shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
                    <div className="mb-12">
                        <h2 className="text-[22px] font-black text-[#1a202c]">Panel Ringkasan Inventaris</h2>
                        <p className="text-[14px] font-bold text-gray-400 mt-1.5">Area ini menampilkan ringkasan level inventaris yang siap diekspor untuk kebutuhan operasional gudang.</p>
                    </div>

                    <div className="grid grid-cols-12 gap-12">
                        <div className="col-span-5 flex flex-col justify-between">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 tracking-[0.25em] uppercase ml-1">Sumber Data</h4>
                                    {[
                                        { id: 'inventory', icon: BoxIcon, label: 'Level Inventaris', hasData: inventoryDistribution.length > 0 },
                                        { id: 'fleet', icon: TruckIcon, label: 'Armada Pengiriman', hasData: (data?.shipment_stats?.total || 0) > 0 },
                                        { id: 'cost', icon: CreditCardIcon, label: 'Analisis Biaya', hasData: inventoryDistribution.some(i => i.total_value > 0) }
                                    ].map((item) => (
                                        <div 
                                            key={item.id} 
                                            onClick={() => item.hasData && setSelectedDataSource(item.id)}
                                            className={`flex items-center space-x-4 p-4 rounded-xl border transition-all cursor-pointer group relative ${!item.hasData ? 'opacity-40 grayscale cursor-not-allowed bg-gray-50 border-transparent' : selectedDataSource === item.id ? 'bg-white border-[#4f46e5] shadow-lg shadow-indigo-100/30 ring-2 ring-indigo-50' : 'bg-[#f8f9fb] border-transparent hover:bg-white hover:border-gray-100'}`}
                                        >
                                            <div className={`w-[42px] h-[42px] shadow-sm rounded-lg flex items-center justify-center transition-transform ${selectedDataSource === item.id ? 'bg-[#4f46e5] scale-110' : 'bg-white group-hover:scale-110'}`}>
                                                <item.icon className={`w-5 h-5 ${selectedDataSource === item.id ? 'text-white' : 'text-[#4f46e5]'}`} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-[14px] font-bold tracking-tight ${selectedDataSource === item.id ? 'text-[#4f46e5]' : 'text-[#1a202c]'}`}>{item.label}</span>
                                                {!item.hasData && <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Belum Aktif</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-gray-400 tracking-[0.25em] uppercase ml-1">Tampilan</h4>
                                    <div className="space-y-4">
                                        {[
                                            { id: 'bar', icon: BarChartIcon, label: 'Grafik Batang', isEnabled: true },
                                            { id: 'kinetic', icon: ActivityIcon, label: 'Alur Gerak', isEnabled: true },
                                            { id: 'distribution', icon: PieChartIcon, label: 'Distribusi', isEnabled: true }
                                        ].map((item) => (
                                            <div 
                                                key={item.id} 
                                                onClick={() => item.isEnabled && setSelectedVisualization(item.id)}
                                                className={`flex items-center space-x-4 p-4 rounded-xl border transition-all group ${!item.isEnabled ? 'opacity-40 grayscale cursor-not-allowed bg-gray-50 border-transparent' : selectedVisualization === item.id ? 'bg-white border-[#4f46e5] shadow-lg shadow-indigo-100/30 ring-2 ring-indigo-50 cursor-pointer' : 'bg-[#f8f9fb] border-transparent hover:bg-white hover:border-gray-100 cursor-pointer'}`}
                                            >
                                                <div className={`w-[42px] h-[42px] shadow-sm rounded-lg flex items-center justify-center transition-transform ${selectedVisualization === item.id ? 'bg-[#4f46e5] scale-110' : 'bg-white group-hover:scale-110'}`}>
                                                    <item.icon className={`w-5 h-5 ${selectedVisualization === item.id ? 'text-white' : 'text-[#4f46e5]'}`} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-[14px] font-bold tracking-tight ${selectedVisualization === item.id ? 'text-[#4f46e5]' : 'text-[#1a202c]'}`}>{item.label}</span>
                                                    {!item.isEnabled && <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Tidak Aktif</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleExportCurrentView}
                                className="mt-12 w-full py-4 bg-slate-900 text-white font-black rounded-xl text-[12px] tracking-widest uppercase hover:bg-blue-700 hover:scale-[1.02] transition-all shadow-xl active:scale-95"
                            >
                                Ekspor Tampilan Saat Ini
                            </button>
                        </div>

                        {/* Preview Area - Dynamic Logic */}
                        <div className="col-span-7 bg-[#fcfdfe] rounded-[40px] p-10 flex flex-col items-center justify-center relative min-h-[480px] border border-[#f1f5f9] shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
                            <div className="absolute top-10 right-10 flex space-x-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                            </div>
                            
                            <div className="w-full flex-1 flex flex-col items-center justify-center text-center p-6">
                                {selectedDataSource === 'inventory' && (
                                    <>
                                        <div className="w-full flex justify-between items-start mb-10 px-4 text-left">
                                            <div>
                                                <h3 className="text-[20px] font-black text-[#1e293b] tracking-tight">
                                                    Level Inventaris
                                                </h3>
                                                <p className="text-[12px] font-bold text-gray-400 mt-1 uppercase tracking-[0.1em]">
                                                    Volume per Kategori
                                                </p>
                                            </div>
                                            <div className="bg-white shadow-sm p-3 rounded-xl border border-gray-100 flex items-center justify-center">
                                                <BoxIcon className="w-5 h-5 text-indigo-500" />
                                            </div>
                                        </div>

                                        <div className="w-full h-full flex flex-col items-center justify-center min-h-[320px]">
                                            <div className="w-full px-4">
                                                <div className="grid grid-cols-2 gap-4 mb-8">
                                                    <div className="rounded-[24px] border border-[#e8eef8] bg-white/80 px-5 py-4 text-left shadow-[0_8px_24px_rgba(148,163,184,0.08)]">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Unit</p>
                                                        <p className="mt-2 text-[28px] font-black text-[#1e293b]">
                                                            {inventoryDistributionSummary.totalUnits.toLocaleString('id-ID')}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-[24px] border border-[#e8eef8] bg-white/80 px-5 py-4 text-left shadow-[0_8px_24px_rgba(148,163,184,0.08)]">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Kategori Terbesar</p>
                                                        <p className="mt-2 text-[18px] font-black text-[#1e293b] truncate">
                                                            {inventoryDistributionSummary.topCategory?.name || 'Tidak Ada Data'}
                                                        </p>
                                                        <p className="mt-1 text-[11px] font-bold text-indigo-500">
                                                            {inventoryDistributionSummary.topCategory ? `${inventoryDistributionSummary.topCategory.total_qty.toLocaleString('id-ID')} Unit` : '0 Unit'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="w-full min-h-[220px]">
                                                    {selectedVisualization === 'bar' && inventoryDistribution.length > 0 && (
                                                        <div className="flex gap-5">
                                                            {/* Existing Bar Chart Logic */}
                                                            <div className="w-10 shrink-0 relative h-[200px]">
                                                                {inventoryDistributionSummary.axisTicks.map((tick, index) => (
                                                                    <div
                                                                        key={tick}
                                                                        className={`absolute left-0 right-0 ${index === inventoryDistributionSummary.axisTicks.length - 1 ? 'bottom-0' : index === 0 ? 'top-0' : 'top-1/2 -translate-y-1/2'}`}
                                                                    >
                                                                        <span className="text-[10px] font-black text-gray-300">
                                                                            {tick >= 1000 ? `${(tick / 1000).toFixed(1).replace('.0', '')}K` : tick}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div className="relative flex-1">
                                                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                                                    {inventoryDistributionSummary.axisTicks.map((tick) => (
                                                                        <div key={tick} className="border-t border-dashed border-[#e5ebf5]"></div>
                                                                    ))}
                                                                </div>

                                                                <div className="relative h-[200px] flex items-end gap-3 z-10">
                                                                    {inventoryDistribution.map((item, i) => {
                                                                        const height = Math.max((item.total_qty / inventoryDistributionMax) * 150, 10);
                                                                        const share = inventoryDistributionSummary.totalUnits > 0
                                                                            ? (item.total_qty / inventoryDistributionSummary.totalUnits) * 100
                                                                            : 0;

                                                                        return (
                                                                            <div key={item.name} className="flex-1 flex flex-col items-center group h-full justify-end min-w-[40px]">
                                                                                <div className="relative w-full max-w-[32px] h-[150px] flex items-end">
                                                                                    <div
                                                                                        style={{ height: `${height}px`, animationDelay: `${i * 100}ms` }}
                                                                                        className={`w-full rounded-[18px] border border-white/70 bg-gradient-to-t shadow-[0_12px_30px_rgba(99,102,241,0.18)] animate-grow-up transition-all duration-700 hover:brightness-110 ${i % 3 === 0 ? 'from-[#4f46e5] to-[#7c74ff]' : i % 3 === 1 ? 'from-[#6366f1] to-[#9b9cfb]' : 'from-[#7c83ff] to-[#b2b6ff]'}`}
                                                                                    ></div>
                                                                                </div>
                                                                                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.12em] text-[#475569] truncate w-[50px]">{item.name}</p>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {selectedVisualization === 'kinetic' && (
                                                        <div className="w-full h-[240px] flex flex-col items-center justify-center">
                                                            <div className="w-full flex justify-between mb-4">
                                                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Alur Pergerakan Stok</span>
                                                                <span className="text-[10px] font-bold text-gray-400 italic">Total Arus Hari Ini</span>
                                                            </div>
                                                            <div className="w-full flex-1 flex items-center justify-around gap-4 bg-indigo-50/30 rounded-3xl p-6 border border-indigo-100/50">
                                                                <div className="flex flex-col items-center">
                                                                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                                                                        <TrendingUpIcon className="w-6 h-6 text-indigo-600 rotate-90" />
                                                                    </div>
                                                                    <p className="text-[18px] font-black text-indigo-600">{throughputSummary.inbound.toLocaleString('id-ID')}</p>
                                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Masuk (7 Hari)</p>
                                                                </div>
                                                                <div className="h-10 border-r border-indigo-100"></div>
                                                                <div className="flex flex-col items-center">
                                                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                                                                        <TrendingUpIcon className="w-6 h-6 text-slate-400 rotate-180" />
                                                                    </div>
                                                                    <p className="text-[18px] font-black text-slate-600">{throughputSummary.outbound.toLocaleString('id-ID')}</p>
                                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Keluar (7 Hari)</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {selectedVisualization === 'distribution' && (
                                                        <div className="w-full h-[240px] flex items-center justify-center">
                                                            <div className="relative w-[180px] h-[180px]">
                                                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                                    <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                                                                    {inventoryDistribution.slice(0, 3).map((item, i) => {
                                                                        const total = inventoryDistributionSummary.totalUnits || 1;
                                                                        const share = (item.total_qty / total) * 100;
                                                                        const offset = inventoryDistribution.slice(0, i).reduce((sum, prev) => sum + (prev.total_qty / total) * 100, 0);
                                                                        return (
                                                                            <circle
                                                                                key={item.name}
                                                                                cx="50"
                                                                                cy="50"
                                                                                r="40"
                                                                                stroke={i === 0 ? '#4f46e5' : i === 1 ? '#818cf8' : '#c7d2fe'}
                                                                                strokeWidth="12"
                                                                                strokeDasharray={`${share * 2.51} 251`}
                                                                                strokeDashoffset={-offset * 2.51}
                                                                                fill="none"
                                                                                strokeLinecap="round"
                                                                            />
                                                                        );
                                                                    })}
                                                                </svg>
                                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                                    <p className="text-[20px] font-black text-[#1e293b]">{inventoryDistribution.length}</p>
                                                                    <p className="text-[8px] font-black text-gray-400 uppercase">Kategori</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {selectedDataSource === 'cost' && (
                                    <>
                                        <div className="w-full flex justify-between items-start mb-10 px-4 text-left">
                                            <div>
                                                <h3 className="text-[20px] font-black text-[#1e293b] tracking-tight">
                                                    Analisis Biaya & Valuasi
                                                </h3>
                                                <p className="text-[12px] font-bold text-gray-400 mt-1 uppercase tracking-[0.1em]">
                                                    Nilai Aset per Kategori (Rupiah)
                                                </p>
                                            </div>
                                            <div className="bg-white shadow-sm p-3 rounded-xl border border-gray-100 flex items-center justify-center">
                                                <CreditCardIcon className="w-5 h-5 text-emerald-500" />
                                            </div>
                                        </div>
                                        <div className="w-full h-full flex flex-col items-center justify-center min-h-[320px]">
                                            <div className="w-full px-4">
                                                <div className="grid grid-cols-2 gap-4 mb-8">
                                                    <div className="rounded-[24px] border border-[#e8eef8] bg-white/80 px-5 py-4 text-left shadow-[0_8px_24px_rgba(16,185,129,0.08)]">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Valuasi</p>
                                                        <p className="mt-2 text-[22px] font-black text-[#1e293b]">
                                                            Rp {costDistributionSummary.totalValue.toLocaleString('id-ID')}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-[24px] border border-[#e8eef8] bg-white/80 px-5 py-4 text-left shadow-[0_8px_24px_rgba(16,185,129,0.08)]">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Aset Tertinggi</p>
                                                        <p className="mt-2 text-[14px] font-black text-[#1e293b] truncate">
                                                            {costDistributionSummary.topCategory?.name || 'Tidak Ada Data'}
                                                        </p>
                                                        <p className="mt-1 text-[11px] font-bold text-emerald-500">
                                                            Rp {costDistributionSummary.topCategory?.total_value.toLocaleString('id-ID') || 0}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="w-full min-h-[220px]">
                                                    {selectedVisualization === 'bar' && inventoryDistribution.length > 0 && (
                                                        <div className="flex gap-5">
                                                            <div className="w-10 shrink-0 relative h-[200px]">
                                                                {costDistributionSummary.axisTicks.map((tick, index) => (
                                                                    <div
                                                                        key={tick}
                                                                        className={`absolute left-0 right-0 ${index === costDistributionSummary.axisTicks.length - 1 ? 'bottom-0' : index === 0 ? 'top-0' : 'top-1/2 -translate-y-1/2'}`}
                                                                    >
                                                                        <span className="text-[10px] font-black text-gray-300">
                                                                            {tick >= 1000000 ? `${(tick / 1000000).toFixed(1)}M` : tick >= 1000 ? `${(tick / 1000).toFixed(0)}K` : tick}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div className="relative flex-1">
                                                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                                                    {costDistributionSummary.axisTicks.map((tick) => (
                                                                        <div key={tick} className="border-t border-dashed border-[#e5ebf5]"></div>
                                                                    ))}
                                                                </div>

                                                                <div className="relative h-[200px] flex items-end gap-3 z-10">
                                                                    {inventoryDistribution.map((item, i) => {
                                                                        const height = Math.max((item.total_value / costDistributionMax) * 150, 10);
                                                                        const share = costDistributionSummary.totalValue > 0
                                                                            ? (item.total_value / costDistributionSummary.totalValue) * 100
                                                                            : 0;

                                                                        return (
                                                                            <div key={item.name} className="flex-1 flex flex-col items-center group h-full justify-end min-w-[40px]">
                                                                                <div className="relative w-full max-w-[32px] h-[150px] flex items-end">
                                                                                    <div
                                                                                        style={{ height: `${height}px`, animationDelay: `${i * 100}ms` }}
                                                                                        className={`w-full rounded-[18px] border border-white/70 bg-gradient-to-t shadow-[0_12px_30px_rgba(16,185,129,0.18)] animate-grow-up transition-all duration-700 hover:brightness-110 ${i % 3 === 0 ? 'from-[#10b981] to-[#34d399]' : i % 3 === 1 ? 'from-[#059669] to-[#6ee7b7]' : 'from-[#34d399] to-[#a7f3d0]'}`}
                                                                                    ></div>
                                                                                </div>
                                                                                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.12em] text-[#475569] truncate w-[50px]">{item.name}</p>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {selectedVisualization === 'kinetic' && (
                                                        <div className="w-full h-[240px] flex flex-col items-center justify-center">
                                                            <div className="w-full flex justify-between mb-4">
                                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Arus Nilai Aset</span>
                                                                <span className="text-[10px] font-bold text-gray-400 italic">Total Arus Hari Ini</span>
                                                            </div>
                                                            <div className="w-full flex-1 flex items-center justify-around gap-4 bg-emerald-50/30 rounded-3xl p-6 border border-emerald-100/50">
                                                                <div className="flex flex-col items-center">
                                                                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                                                                        <TrendingUpIcon className="w-6 h-6 text-emerald-600 rotate-90" />
                                                                    </div>
                                                                    <p className="text-[16px] font-black text-emerald-600">Rp {inventoryDistribution.reduce((acc, curr) => acc + (curr.inbound_count * 150000), 0).toLocaleString('id-ID')}</p>
                                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Estimasi Masuk</p>
                                                                </div>
                                                                <div className="h-10 border-r border-emerald-100"></div>
                                                                <div className="flex flex-col items-center">
                                                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                                                                        <TrendingUpIcon className="w-6 h-6 text-slate-400 rotate-180" />
                                                                    </div>
                                                                    <p className="text-[16px] font-black text-slate-600">Rp {inventoryDistribution.reduce((acc, curr) => acc + (curr.outbound_count * 150000), 0).toLocaleString('id-ID')}</p>
                                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Estimasi Keluar</p>
                                                                </div>
                                                            </div>
                                                            <p className="mt-4 text-[9px] text-gray-400 font-bold italic">* Berdasarkan rata-rata nilai item</p>
                                                        </div>
                                                    )}

                                                    {selectedVisualization === 'distribution' && (
                                                        <div className="w-full h-[240px] flex items-center justify-center">
                                                            <div className="relative w-[180px] h-[180px]">
                                                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                                    <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                                                                    {inventoryDistribution.slice(0, 3).map((item, i) => {
                                                                        const share = costDistributionSummary.totalValue > 0 ? (item.total_value / costDistributionSummary.totalValue) * 100 : 0;
                                                                        const offset = inventoryDistribution.slice(0, i).reduce((sum, prev) => sum + (prev.total_value / costDistributionSummary.totalValue) * 100, 0);
                                                                        return (
                                                                            <circle
                                                                                key={item.name}
                                                                                cx="50"
                                                                                cy="50"
                                                                                r="40"
                                                                                stroke={i === 0 ? '#10b981' : i === 1 ? '#34d399' : '#a7f3d0'}
                                                                                strokeWidth="12"
                                                                                strokeDasharray={`${share * 2.51} 251`}
                                                                                strokeDashoffset={-offset * 2.51}
                                                                                fill="none"
                                                                                strokeLinecap="round"
                                                                            />
                                                                        );
                                                                    })}
                                                                </svg>
                                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                                    <p className="text-[14px] font-black text-[#1e293b]">Proporsi</p>
                                                                    <p className="text-[8px] font-black text-gray-400 uppercase">Valuasi</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {selectedDataSource === 'fleet' && (
                                    <>
                                        <div className="w-full flex justify-between items-start mb-10 px-4 text-left">
                                            <div>
                                                <h3 className="text-[20px] font-black text-[#1e293b] tracking-tight">
                                                    Armada & Pengiriman
                                                </h3>
                                                <p className="text-[12px] font-bold text-gray-400 mt-1 uppercase tracking-[0.1em]">
                                                    Status Pergerakan Logistik
                                                </p>
                                            </div>
                                            <div className="bg-white shadow-sm p-3 rounded-xl border border-gray-100 flex items-center justify-center">
                                                <TruckIcon className="w-5 h-5 text-indigo-500" />
                                            </div>
                                        </div>

                                        <div className="w-full h-full flex flex-col items-center justify-center min-h-[320px]">
                                            <div className="w-full px-4 flex flex-col h-full gap-5">
                                                {selectedVisualization === 'bar' && (
                                                    <div className="grid grid-cols-2 gap-4 h-[160px]">
                                                        <div className="rounded-[24px] border border-[#e8eef8] bg-white/80 px-5 py-6 text-center shadow-[0_8px_24px_rgba(245,158,11,0.08)] flex flex-col items-center justify-center h-full">
                                                            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-3">
                                                                <TruckIcon className="w-6 h-6 text-amber-500" />
                                                            </div>
                                                            <p className="text-[32px] font-black text-amber-600 leading-none">
                                                                {data?.shipment_stats?.transit || 0}
                                                            </p>
                                                            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Sedang Transit</p>
                                                        </div>
                                                        <div className="rounded-[24px] border border-[#e8eef8] bg-white/80 px-5 py-6 text-center shadow-[0_8px_24px_rgba(16,185,129,0.08)] flex flex-col items-center justify-center h-full">
                                                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                                                                <BoxIcon className="w-6 h-6 text-emerald-500" />
                                                            </div>
                                                            <p className="text-[32px] font-black text-emerald-600 leading-none">
                                                                {data?.shipment_stats?.delivered || 0}
                                                            </p>
                                                            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Telah Terkirim</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedVisualization === 'kinetic' && (
                                                    <div className="w-full h-[240px] flex flex-col items-center justify-center">
                                                        <div className="w-full flex justify-between mb-4">
                                                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Tren Harian Armada</span>
                                                            <span className="text-[10px] font-bold text-gray-400 italic">7 Hari Terakhir</span>
                                                        </div>
                                                        <div className="w-full flex-1 relative flex items-end gap-1 px-2 border-b border-indigo-100">
                                                            {(data?.shipment_stats?.trend || []).slice(-7).map((day, i) => {
                                                                const maxVal = Math.max(...(data?.shipment_stats?.trend || []).map(d => d.count), 1);
                                                                const h = (day.count / maxVal) * 160;
                                                                return (
                                                                    <div key={day.date} className="flex-1 flex flex-col items-center group">
                                                                        <div 
                                                                            style={{ height: `${h}px`, transitionDelay: `${i * 50}ms` }}
                                                                            className="w-full max-w-[24px] bg-indigo-500/20 rounded-t-lg group-hover:bg-indigo-500 transition-all duration-300 relative"
                                                                        >
                                                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                {day.count}
                                                                            </div>
                                                                        </div>
                                                                        <span className="text-[8px] font-bold text-gray-400 mt-2">{day.date.split('-').slice(2).join('/')}</span>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedVisualization === 'distribution' && (
                                                    <div className="w-full h-[240px] flex items-center justify-center">
                                                         <div className="relative w-[180px] h-[180px]">
                                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                                                                <circle 
                                                                    cx="50" cy="50" r="40" stroke="#f59e0b" strokeWidth="12" fill="none" 
                                                                    strokeDasharray={`${((data?.shipment_stats?.transit || 0) / Math.max(data?.shipment_stats?.total || 1, 1)) * 251} 251`}
                                                                    strokeLinecap="round"
                                                                />
                                                                <circle 
                                                                    cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="12" fill="none" 
                                                                    strokeDasharray={`${((data?.shipment_stats?.delivered || 0) / Math.max(data?.shipment_stats?.total || 1, 1)) * 251} 251`}
                                                                    strokeDashoffset={`-${((data?.shipment_stats?.transit || 0) / Math.max(data?.shipment_stats?.total || 1, 1)) * 251}`}
                                                                    strokeLinecap="round"
                                                                />
                                                            </svg>
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                                <p className="text-[20px] font-black text-[#1e293b]">{data?.shipment_stats?.total || 0}</p>
                                                                <p className="text-[8px] font-black text-gray-400 uppercase">Trip</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="relative w-full rounded-[24px] border border-[#e8eef8] bg-gray-50/50 p-6 flex items-center mt-auto">
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-end mb-2">
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Pengeluaran Logistik</p>
                                                                <p className="text-[18px] font-black text-[#1e293b]">{data?.shipment_stats?.total || 0} <span className="text-[12px] text-gray-400">Trip</span></p>
                                                            </div>
                                                            <p className="text-[14px] font-black text-emerald-500">
                                                                {((data?.shipment_stats?.delivered || 0) / Math.max(data?.shipment_stats?.total || 1, 1) * 100).toFixed(0)}% Selesai
                                                            </p>
                                                        </div>
                                                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-3">
                                                            <div 
                                                                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" 
                                                                style={{ width: `${((data?.shipment_stats?.delivered || 0) / Math.max(data?.shipment_stats?.total || 1, 1)) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                                
                                <button
                                    type="button"
                                    onClick={handleExportAnalysisImage}
                                    className="mt-12 w-full py-4 bg-[#fcfdfe] text-[#1e293b] font-black rounded-xl text-[12px] tracking-widest uppercase border border-gray-100 hover:bg-gray-50 hover:scale-[1.02] transition-all shadow-sm active:scale-95"
                                >
                                    Ekspor Gambar Analisis
                                </button>
                            </div>
                            
                            {/* Stylized background grid for light theme */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
                        </div>
                    </div>
                </div>

                {/* Recent Generated Reports Table */}
                <div className="bg-white rounded-[40px] p-12 border border-[#edf2f7] shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
                    <div className="flex justify-between items-center mb-12">
                        <h2 className="text-[22px] font-black text-[#1a202c]">Riwayat Laporan</h2>
                        <button className="flex items-center space-x-3 px-5 py-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                            <span className="text-[13px] font-black text-[#1a202c] tracking-tight">Filter</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-gray-100">
                                <tr>
                                    <th className="pb-6 pl-4 text-[10px] font-black text-gray-400 tracking-[0.25em] uppercase">Nama Laporan</th>
                                    <th className="pb-6 text-[10px] font-black text-gray-400 tracking-[0.25em] uppercase">Dibuat Oleh</th>
                                    <th className="pb-6 text-[10px] font-black text-gray-400 tracking-[0.25em] uppercase">Status</th>
                                    <th className="pb-6 text-[10px] font-black text-gray-400 tracking-[0.25em] uppercase">Tanggal</th>
                                    <th className="pb-6 text-right pr-4 text-[10px] font-black text-gray-400 tracking-[0.25em] uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {reports?.length > 0 ? reports.map((report, i) => (
                                    <tr key={i} className="group hover:bg-gray-50 transition-all cursor-pointer">
                                        <td className="py-8 pl-4 flex items-center space-x-5">
                                            <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:bg-[#4f46e5] group-hover:text-white group-hover:rotate-6 transition-all duration-300">
                                                <DocumentIcon2 className="w-5.5 h-5.5" />
                                            </div>
                                            <span className="text-[15px] font-black text-[#1a202c] tracking-tight">{report.name}</span>
                                        </td>
                                        <td className="py-8 text-[14px] font-bold text-gray-500 tracking-tight">{report.by}</td>
                                        <td className="py-8">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] ${report.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100/50' : 'bg-amber-50 text-amber-500 border border-amber-100/50'}`}>
                                                {report.status === 'COMPLETED' ? 'SELESAI' : report.status}
                                            </span>
                                        </td>
                                        <td className="py-8 text-[14px] font-bold text-gray-500 tracking-tight">{report.date}</td>
                                        <td className="py-8 text-right pr-12">
                                            <button 
                                                onClick={() => handleDownload(report.id)}
                                                className="text-indigo-600 hover:scale-125 transition-all"
                                            >
                                                {report.status === 'COMPLETED' ? <DownloadIcon2 className="w-6 h-6" /> : <ClockIcon className="w-6 h-6 text-gray-300" />}
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center text-gray-400 font-bold italic">
                                            Belum ada laporan yang dibuat.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}

const DocumentIcon2 = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
