import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';

const loadExportTools = async () => {
    const [{ default: ExcelJS }, { saveAs }] = await Promise.all([
        import('exceljs/dist/exceljs.min.js'),
        import('file-saver'),
    ]);

    return { ExcelJS, saveAs };
};

const DownloadIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M12 4v10m0 0l4-4m-4 4l-4-4M4 19h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const FileIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M14 3v4a1 1 0 001 1h4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 3h8l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 13h8M8 17h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ClockIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default function Reports({ data, reports, filters }) {
    const [selectedDataSource, setSelectedDataSource] = useState('inventory');
    const [selectedVisualization, setSelectedVisualization] = useState('bar');
    const reportFilter = filters?.status || 'all';

    const throughputStats = Array.isArray(data?.throughput) ? data.throughput : [];
    const recentThroughput = useMemo(() => throughputStats.slice(-7), [throughputStats]);

    const throughputSummary = useMemo(() => {
        return recentThroughput.reduce((acc, item) => {
            acc.inbound += Number(item.inbound || 0);
            acc.outbound += Number(item.outbound || 0);
            acc.total += Number(item.total || 0);
            return acc;
        }, { inbound: 0, outbound: 0, total: 0 });
    }, [recentThroughput]);

    const maxThroughput = useMemo(() => {
        return Math.max(...recentThroughput.map((d) => Math.max(Number(d.inbound || 0), Number(d.outbound || 0))), 1);
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
            if (!top || item.total_qty > top.total_qty) return item;
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
            if (!top || item.total_value > top.total_value) return item;
            return top;
        }, null);

        const formatAxis = (maxVal) => {
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

    const sourceOptions = [
        { id: 'inventory', label: 'Level Inventaris', enabled: inventoryDistribution.length > 0 },
        { id: 'fleet', label: 'Armada Pengiriman', enabled: (data?.shipment_stats?.total || 0) > 0 },
        { id: 'cost', label: 'Analisis Biaya', enabled: inventoryDistribution.some((i) => i.total_value > 0) },
    ];

    const visualizationOptions = [
        { id: 'bar', label: 'Batang' },
        { id: 'kinetic', label: 'Arus' },
        { id: 'distribution', label: 'Distribusi' },
    ];

    const currentDataset = useMemo(() => {
        if (selectedDataSource === 'inventory') {
            return inventoryDistribution
                .map((item) => ({ label: item.name, value: item.total_qty }))
                .filter((item) => item.value > 0)
                .sort((a, b) => b.value - a.value)
                .slice(0, 6);
        }

        if (selectedDataSource === 'fleet') {
            return (data?.shipment_stats?.trend || [])
                .slice(-7)
                .map((item) => ({ label: item.date, value: Number(item.count || 0) }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 6);
        }

        return inventoryDistribution
            .map((item) => ({ label: item.name, value: item.total_value }))
            .filter((item) => item.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }, [selectedDataSource, inventoryDistribution, data?.shipment_stats?.trend]);

    const paginatedReports = Array.isArray(reports?.data) ? reports.data : [];
    const currentReportPage = Number(reports?.current_page || 1);
    const totalReportPages = Number(reports?.last_page || 1);
    const reportRangeStart = Number(reports?.from || 0);
    const reportRangeEnd = Number(reports?.to || 0);
    const reportTotal = Number(reports?.total || 0);

    const paginationButtons = useMemo(() => {
        const pages = [];
        const start = Math.max(1, currentReportPage - 2);
        const end = Math.min(totalReportPages, currentReportPage + 2);
        for (let page = start; page <= end; page += 1) pages.push(page);
        return pages;
    }, [currentReportPage, totalReportPages]);

    const handleGenerate = () => {
        router.post(route('reports.generate'));
    };

    const handleDownload = (report) => {
        if (report?.status !== 'COMPLETED') return;
        window.location.href = route('reports.download', report.id);
    };

    const handleGoToInventory = () => {
        window.location.href = '/inventory';
    };

    const handleReportFilterChange = (status) => {
        router.get(route('reports'), {
            status,
            page: 1,
        }, {
            preserveScroll: true,
            replace: true,
        });
    };

    const handleReportPageChange = (page) => {
        if (page < 1 || page > totalReportPages || page === currentReportPage) return;

        router.get(route('reports'), {
            status: reportFilter,
            page,
        }, {
            preserveScroll: true,
            replace: true,
        });
    };

    const handleExportCurrentView = async () => {
        try {
            const { ExcelJS, saveAs } = await loadExportTools();
            const workbook = new ExcelJS.Workbook();
            const dateStr = new Date().toISOString().slice(0, 10);

            const applyHeader = (cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } };
                cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            };

            const applyRow = (row, i, leftCol = 2) => {
                row.eachCell((cell, col) => {
                    cell.font = { name: 'Arial', size: 10 };
                    cell.alignment = { vertical: 'middle', horizontal: col === leftCol ? 'left' : 'center' };
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                        right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
                    };

                    if (i % 2 === 0) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                    }
                });
            };

            const applyTotalRow = (row) => {
                row.eachCell((cell) => {
                    cell.font = { name: 'Arial', size: 11, bold: true };
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                        right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                    };
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                });
            };

            const addTitle = (ws, cols, title, colCount) => {
                ws.columns = cols;
                const titleCell = ws.getCell('A1');
                titleCell.value = title;
                titleCell.font = { name: 'Arial', size: 15, bold: true };
                titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
                ws.mergeCells(`A1:${String.fromCharCode(64 + colCount)}1`);
                ws.getRow(1).height = 26;

                const infoCell = ws.getCell('A2');
                infoCell.value = `Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}`;
                infoCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF6B7280' } };
                ws.mergeCells(`A2:${String.fromCharCode(64 + colCount)}2`);

                const headerRow = ws.getRow(4);
                headerRow.values = cols.map((c) => c.header);
                headerRow.height = 22;
                headerRow.eachCell(applyHeader);
                ws.views = [{ state: 'frozen', ySplit: 4 }];
            };

            if (selectedDataSource === 'inventory') {
                if (!inventoryDistribution.length) {
                    alert('Tidak ada data level inventaris.');
                    return;
                }

                const ws = workbook.addWorksheet('Level Inventaris');
                addTitle(ws, [
                    { header: 'NO', key: 'no', width: 6 },
                    { header: 'KATEGORI', key: 'category', width: 32 },
                    { header: 'TOTAL UNIT', key: 'total_qty', width: 16 },
                    { header: 'PERSENTASE (%)', key: 'share', width: 16 },
                ], 'LAPORAN LEVEL INVENTARIS', 4);

                inventoryDistribution.forEach((item, i) => {
                    const share = inventoryDistributionSummary.totalUnits > 0
                        ? item.total_qty / inventoryDistributionSummary.totalUnits
                        : 0;

                    const row = ws.addRow({
                        no: i + 1,
                        category: item.name,
                        total_qty: item.total_qty,
                        share,
                    });

                    applyRow(row, i, 2);
                    row.getCell('C').numFmt = '#,##0';
                    row.getCell('D').numFmt = '0.0%';
                });

                const totalRow = ws.addRow({
                    no: '',
                    category: 'TOTAL',
                    total_qty: inventoryDistributionSummary.totalUnits,
                    share: 1,
                });

                applyTotalRow(totalRow);
                totalRow.getCell('B').alignment = { vertical: 'middle', horizontal: 'left' };
                totalRow.getCell('C').numFmt = '#,##0';
                totalRow.getCell('D').numFmt = '0.0%';

                const buf = await workbook.xlsx.writeBuffer();
                saveAs(new Blob([buf], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                }), `level-inventaris-${dateStr}.xlsx`);
            }

            if (selectedDataSource === 'fleet') {
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
                ws.addRow({ no: 'RINGKASAN', date: '', count: '' });

                [
                    ['Total Trip', data?.shipment_stats?.total || 0],
                    ['Sedang Transit', data?.shipment_stats?.transit || 0],
                    ['Terkirim', data?.shipment_stats?.delivered || 0],
                ].forEach(([label, val]) => {
                    const row = ws.addRow({ no: label, date: '', count: val });
                    row.getCell('A').font = { bold: true };
                    row.getCell('C').numFmt = '#,##0';
                });

                const buf = await workbook.xlsx.writeBuffer();
                saveAs(new Blob([buf], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                }), `armada-pengiriman-${dateStr}.xlsx`);
            }

            if (selectedDataSource === 'cost') {
                if (!inventoryDistribution.length) {
                    alert('Tidak ada data valuasi.');
                    return;
                }

                const ws = workbook.addWorksheet('Analisis Biaya');
                addTitle(ws, [
                    { header: 'NO', key: 'no', width: 6 },
                    { header: 'KATEGORI', key: 'category', width: 32 },
                    { header: 'TOTAL UNIT', key: 'total_qty', width: 16 },
                    { header: 'NILAI ASET (Rp)', key: 'total_value', width: 22 },
                    { header: 'PERSENTASE (%)', key: 'share', width: 16 },
                ], 'LAPORAN ANALISIS BIAYA & VALUASI ASET', 5);

                inventoryDistribution.forEach((item, i) => {
                    const share = costDistributionSummary.totalValue > 0
                        ? item.total_value / costDistributionSummary.totalValue
                        : 0;

                    const row = ws.addRow({
                        no: i + 1,
                        category: item.name,
                        total_qty: item.total_qty,
                        total_value: item.total_value,
                        share,
                    });

                    applyRow(row, i, 2);
                    row.getCell('C').numFmt = '#,##0';
                    row.getCell('D').numFmt = '"Rp "#,##0';
                    row.getCell('E').numFmt = '0.0%';
                });

                const totalRow = ws.addRow({
                    no: '',
                    category: 'TOTAL',
                    total_qty: inventoryDistributionSummary.totalUnits,
                    total_value: costDistributionSummary.totalValue,
                    share: 1,
                });

                applyTotalRow(totalRow);
                totalRow.getCell('B').alignment = { vertical: 'middle', horizontal: 'left' };
                totalRow.getCell('C').numFmt = '#,##0';
                totalRow.getCell('D').numFmt = '"Rp "#,##0';
                totalRow.getCell('E').numFmt = '0.0%';

                const buf = await workbook.xlsx.writeBuffer();
                saveAs(new Blob([buf], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                }), `analisis-biaya-${dateStr}.xlsx`);
            }
        } catch (error) {
            console.error('Export gagal:', error);
            alert('Gagal mengekspor file. Silakan coba lagi.');
        }
    };

    const handleExportAnalysisImage = async () => {
        try {
            const hasInventory = inventoryDistribution.length > 0;
            const hasFleet = (data?.shipment_stats?.total || 0) > 0;

            if (selectedDataSource === 'inventory' && !hasInventory) {
                alert('Tidak ada data inventaris.');
                return;
            }

            if (selectedDataSource === 'fleet' && !hasFleet) {
                alert('Tidak ada data armada.');
                return;
            }

            if (selectedDataSource === 'cost' && !hasInventory) {
                alert('Tidak ada data biaya.');
                return;
            }

            const { saveAs } = await loadExportTools();
            const canvas = document.createElement('canvas');
            canvas.width = 1400;
            canvas.height = 900;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas tidak tersedia.');

            ctx.fillStyle = '#F8F7FF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(40, 40, 1320, 820);

            ctx.fillStyle = '#28106F';
            ctx.font = '700 42px Arial';
            ctx.fillText('Laporan Analisis Gudang', 90, 120);

            ctx.fillStyle = '#475569';
            ctx.font = '600 24px Arial';
            const subtitle = selectedDataSource === 'inventory'
                ? 'Sumber: Level Inventaris'
                : selectedDataSource === 'fleet'
                    ? 'Sumber: Armada Pengiriman'
                    : 'Sumber: Analisis Biaya';
            ctx.fillText(subtitle, 90, 165);

            const maxValue = Math.max(...currentDataset.map((d) => d.value), 1);
            const startY = 250;
            const lineHeight = 90;

            currentDataset.forEach((item, idx) => {
                const y = startY + idx * lineHeight;
                const width = Math.max(40, (item.value / maxValue) * 760);

                ctx.fillStyle = '#72CBEA';
                ctx.fillRect(90, y, width, 30);

                ctx.fillStyle = '#28106F';
                ctx.font = '600 20px Arial';
                ctx.fillText(item.label, 90, y - 10);

                ctx.fillStyle = '#28106F';
                ctx.font = '700 18px Arial';
                ctx.fillText(item.value.toLocaleString('id-ID'), 870, y + 22);
            });

            ctx.fillStyle = '#64748b';
            ctx.font = '500 16px Arial';
            ctx.fillText(`Diekspor: ${new Date().toLocaleString('id-ID')}`, 90, 820);

            const dateStr = new Date().toISOString().slice(0, 10);
            const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
            if (!blob) throw new Error('Gagal membuat PNG.');

            saveAs(blob, `laporan-analisis-${selectedDataSource}-${dateStr}.png`);
        } catch (error) {
            console.error('Export gambar gagal:', error);
            alert('Gagal mengekspor gambar analisis.');
        }
    };

    const headerRight = (
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <span className="text-[13px] font-bold text-slate-700">Pusat Laporan</span>
        </div>
    );

    return (
        <DashboardLayout
            headerTitle=""
            headerRight={headerRight}
            headerSearchPlaceholder="Cari laporan atau data gudang..."
        >
            <Head title="Laporan Gudang" />

            <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Laporan Gudang</h1>
                            <p className="mt-2 text-sm text-slate-500">
                                Tampilan laporan dibuat ringkas untuk monitoring operasional harian dan ekspor dokumen.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={handleGenerate}
                                className="inline-flex items-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
                            >
                                Buat PDF Status Gudang
                            </button>
                            <button
                                onClick={handleExportCurrentView}
                                className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Ekspor Excel
                            </button>
                            <button
                                onClick={handleExportAnalysisImage}
                                className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Ekspor Gambar
                            </button>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Produk</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{(data?.total_products || 0).toLocaleString('id-ID')}</p>
                    </article>
                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Unit Stok</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{(data?.total_stock || 0).toLocaleString('id-ID')}</p>
                    </article>
                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Efisiensi Rak</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{Number(data?.efficiency || 0).toLocaleString('id-ID')}%</p>
                    </article>
                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Trip Pengiriman</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{(data?.shipment_stats?.total || 0).toLocaleString('id-ID')}</p>
                    </article>
                </section>

                <section className="grid gap-6 xl:grid-cols-3">
                    <article className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Tren Barang Masuk vs Keluar (7 Hari)</h2>
                                <p className="mt-1 text-sm text-slate-500">Perbandingan unit inbound dan outbound.</p>
                            </div>
                            <div className="text-right text-sm text-slate-500">
                                <p>Masuk: <span className="font-semibold text-slate-800">{throughputSummary.inbound.toLocaleString('id-ID')}</span></p>
                                <p>Keluar: <span className="font-semibold text-slate-800">{throughputSummary.outbound.toLocaleString('id-ID')}</span></p>
                            </div>
                        </div>

                        {recentThroughput.length > 0 ? (
                            <div className="grid grid-cols-7 gap-3">
                                {recentThroughput.map((row) => {
                                    const inHeight = Math.max(8, (Number(row.inbound || 0) / maxThroughput) * 120);
                                    const outHeight = Math.max(8, (Number(row.outbound || 0) / maxThroughput) * 120);
                                    return (
                                        <div key={row.date} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                            <div className="mb-2 flex h-[140px] items-end justify-center gap-1.5">
                                                <div className="w-3 rounded bg-indigo-500" style={{ height: `${inHeight}px` }}></div>
                                                <div className="w-3 rounded bg-slate-400" style={{ height: `${outHeight}px` }}></div>
                                            </div>
                                            <p className="text-center text-[11px] font-medium text-slate-500">
                                                {new Date(`${row.date}T00:00:00`).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
                                Belum ada data throughput.
                            </div>
                        )}
                    </article>

                    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900">Pergerakan Produk</h2>
                        <p className="mt-1 text-sm text-slate-500">Daftar cepat dan lambat bergerak.</p>

                        <div className="mt-5 space-y-4">
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">Paling Cepat Keluar</p>
                                <ul className="space-y-2">
                                    {(data?.fast_moving || []).slice(0, 5).map((item) => (
                                        <li key={item.name} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                            <span className="font-semibold text-slate-900">{item.name}</span>
                                            <span className="ml-2 text-slate-500">{item.val}</span>
                                        </li>
                                    ))}
                                    {(data?.fast_moving || []).length === 0 && (
                                        <li className="text-sm text-slate-500">Belum ada data.</li>
                                    )}
                                </ul>
                            </div>

                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Lambat Bergerak</p>
                                <ul className="space-y-2">
                                    {(data?.slow_moving || []).slice(0, 5).map((item) => (
                                        <li key={item.name} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                            <span className="font-semibold text-slate-900">{item.name}</span>
                                            <span className="ml-2 text-slate-500">{item.val}</span>
                                        </li>
                                    ))}
                                    {(data?.slow_moving || []).length === 0 && (
                                        <li className="text-sm text-slate-500">Belum ada data.</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        <button
                            onClick={handleGoToInventory}
                            className="mt-6 inline-flex items-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                        >
                            Buka Halaman Inventaris
                        </button>
                    </article>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Panel Ringkasan Inventaris</h2>
                            <p className="mt-1 text-sm text-slate-500">Pilih sumber data dan mode visualisasi analisis.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {sourceOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => opt.enabled && setSelectedDataSource(opt.id)}
                                    disabled={!opt.enabled}
                                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${selectedDataSource === opt.id
                                        ? 'bg-indigo-500 text-white'
                                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'} ${!opt.enabled ? 'cursor-not-allowed opacity-50' : ''}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {visualizationOptions.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setSelectedVisualization(opt.id)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${selectedVisualization === opt.id
                                    ? 'bg-indigo-700 text-white'
                                    : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 grid gap-5 lg:grid-cols-12">
                        <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
                            {selectedVisualization === 'bar' && (
                                <div className="space-y-3">
                                    {currentDataset.length > 0 ? currentDataset.map((item) => {
                                        const maxValue = Math.max(...currentDataset.map((v) => v.value), 1);
                                        const width = Math.max(3, (item.value / maxValue) * 100);
                                        return (
                                            <div key={item.label}>
                                                <div className="mb-1 flex items-center justify-between text-sm">
                                                    <span className="truncate font-medium text-slate-700">{item.label}</span>
                                                    <span className="font-semibold text-slate-900">{item.value.toLocaleString('id-ID')}</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-slate-200">
                                                    <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${width}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <p className="text-sm text-slate-500">Belum ada data untuk sumber ini.</p>
                                    )}
                                </div>
                            )}

                            {selectedVisualization === 'kinetic' && (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                                        <p className="text-xs uppercase tracking-wider text-slate-400">Nilai Masuk</p>
                                        <p className="mt-2 text-2xl font-bold text-slate-900">
                                            {selectedDataSource === 'fleet'
                                                ? (data?.shipment_stats?.transit || 0).toLocaleString('id-ID')
                                                : throughputSummary.inbound.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                                        <p className="text-xs uppercase tracking-wider text-slate-400">Nilai Keluar</p>
                                        <p className="mt-2 text-2xl font-bold text-slate-900">
                                            {selectedDataSource === 'fleet'
                                                ? (data?.shipment_stats?.delivered || 0).toLocaleString('id-ID')
                                                : throughputSummary.outbound.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {selectedVisualization === 'distribution' && (
                                <div className="space-y-3">
                                    {currentDataset.length > 0 ? currentDataset.map((item) => {
                                        const total = currentDataset.reduce((sum, row) => sum + row.value, 0);
                                        const pct = total > 0 ? (item.value / total) * 100 : 0;
                                        return (
                                            <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium text-slate-700">{item.label}</span>
                                                    <span className="font-semibold text-slate-900">{pct.toFixed(1)}%</span>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <p className="text-sm text-slate-500">Belum ada data distribusi.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-4 space-y-3">
                            <article className="rounded-xl border border-slate-200 bg-white p-4">
                                <p className="text-xs uppercase tracking-wider text-slate-400">Sumber Dipilih</p>
                                <p className="mt-2 text-lg font-bold text-slate-900">
                                    {sourceOptions.find((s) => s.id === selectedDataSource)?.label || '-'}
                                </p>
                            </article>
                            <article className="rounded-xl border border-slate-200 bg-white p-4">
                                <p className="text-xs uppercase tracking-wider text-slate-400">Kategori Teratas</p>
                                <p className="mt-2 text-lg font-bold text-slate-900">
                                    {selectedDataSource === 'cost'
                                        ? costDistributionSummary.topCategory?.name || '-'
                                        : inventoryDistributionSummary.topCategory?.name || '-'}
                                </p>
                            </article>
                            <article className="rounded-xl border border-slate-200 bg-white p-4">
                                <p className="text-xs uppercase tracking-wider text-slate-400">Ringkasan</p>
                                <p className="mt-2 text-sm text-slate-600">
                                    {selectedDataSource === 'fleet'
                                        ? `${(data?.shipment_stats?.total || 0).toLocaleString('id-ID')} total trip, ${(data?.shipment_stats?.delivered || 0).toLocaleString('id-ID')} selesai`
                                        : selectedDataSource === 'cost'
                                            ? `Total valuasi Rp ${costDistributionSummary.totalValue.toLocaleString('id-ID')}`
                                            : `Total unit ${inventoryDistributionSummary.totalUnits.toLocaleString('id-ID')}`}
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Riwayat Laporan</h2>
                            <p className="mt-1 text-sm text-slate-500">Daftar laporan yang sudah dibuat dari sistem.</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleReportFilterChange('all')}
                                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${reportFilter === 'all' ? 'bg-indigo-700 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
                            >
                                Semua
                            </button>
                            <button
                                onClick={() => handleReportFilterChange('completed')}
                                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${reportFilter === 'completed' ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
                            >
                                Selesai
                            </button>
                            <button
                                onClick={() => handleReportFilterChange('pending')}
                                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${reportFilter === 'pending' ? 'bg-amber-500 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
                            >
                                Selain Selesai
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left">
                            <thead>
                                <tr className="text-xs uppercase tracking-wider text-slate-400">
                                    <th className="py-3 pr-3 font-semibold">Nama Laporan</th>
                                    <th className="py-3 pr-3 font-semibold">Dibuat Oleh</th>
                                    <th className="py-3 pr-3 font-semibold">Status</th>
                                    <th className="py-3 pr-3 font-semibold">Tanggal</th>
                                    <th className="py-3 text-right font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedReports.length > 0 ? paginatedReports.map((report) => {
                                    const completed = report.status === 'COMPLETED';
                                    return (
                                        <tr key={report.id} className="hover:bg-slate-50">
                                            <td className="py-4 pr-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                                        <FileIcon className="h-4 w-4" />
                                                    </span>
                                                    <span className="text-sm font-semibold text-slate-800">{report.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 pr-3 text-sm text-slate-600">{report.by}</td>
                                            <td className="py-4 pr-3">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {completed ? 'SELESAI' : report.status}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-3 text-sm text-slate-600">{report.date}</td>
                                            <td className="py-4 text-right">
                                                <button
                                                    onClick={() => handleDownload(report)}
                                                    disabled={!completed}
                                                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${completed
                                                        ? 'border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                                        : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'}`}
                                                >
                                                    {completed ? <DownloadIcon className="h-4 w-4" /> : <ClockIcon className="h-4 w-4" />}
                                                    {completed ? 'Unduh' : 'Menunggu'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center text-sm text-slate-500">
                                            Tidak ada laporan untuk filter ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {reportTotal > 0 && (
                        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Menampilkan {reportRangeStart}-{reportRangeEnd} dari {reportTotal} laporan
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleReportPageChange(currentReportPage - 1)}
                                    disabled={currentReportPage === 1}
                                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${currentReportPage === 1
                                        ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
                                >
                                    Prev
                                </button>
                                {paginationButtons.map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handleReportPageChange(page)}
                                        className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${page === currentReportPage
                                            ? 'bg-indigo-700 text-white'
                                            : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handleReportPageChange(currentReportPage + 1)}
                                    disabled={currentReportPage === totalReportPages}
                                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${currentReportPage === totalReportPages
                                        ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
}
