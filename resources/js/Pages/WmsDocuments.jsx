import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';

const SearchIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

const DocumentIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.5L19 8.5V19a2 2 0 01-2 2z" />
    </svg>
);

const ArrowIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

const DownloadIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    </svg>
);

const typeStyles = {
    goods_receipt: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    stock_out: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    stock_transfer: 'bg-blue-50 text-blue-700 border-blue-100',
    stock_opname: 'bg-amber-50 text-amber-700 border-amber-100',
    stock_adjustment: 'bg-rose-50 text-rose-700 border-rose-100',
};

const filters = [
    { value: 'all', label: 'Semua' },
    { value: 'goods_receipt', label: 'Goods Receipt' },
    { value: 'stock_out', label: 'Stock Out' },
    { value: 'stock_transfer', label: 'Transfer' },
    { value: 'stock_opname', label: 'Opname' },
    { value: 'stock_adjustment', label: 'Adjustment' },
];

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID');

export default function WmsDocuments({ documents = [], stats = {} }) {
    const [activeType, setActiveType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const filteredDocuments = useMemo(() => {
        const needle = searchTerm.trim().toLowerCase();

        return documents.filter((document) => {
            const matchesType = activeType === 'all' || document.type === activeType;
            const matchesDateFrom = !dateFrom || document.date >= dateFrom;
            const matchesDateTo = !dateTo || document.date <= dateTo;
            const searchable = [
                document.number,
                document.type_label,
                document.party,
                document.warehouse,
                document.operator,
                document.summary,
                document.status,
            ].filter(Boolean).join(' ').toLowerCase();

            return matchesType && matchesDateFrom && matchesDateTo && (!needle || searchable.includes(needle));
        });
    }, [activeType, dateFrom, dateTo, documents, searchTerm]);

    const statCards = [
        { label: 'Total Dokumen', value: stats.total || documents.length, color: 'text-gray-900' },
        { label: 'Goods Receipt', value: stats.goods_receipt || 0, color: 'text-emerald-600' },
        { label: 'Stock Out', value: stats.stock_out || 0, color: 'text-indigo-600' },
        { label: 'Transfer', value: stats.stock_transfer || 0, color: 'text-blue-600' },
        { label: 'Opname', value: stats.stock_opname || 0, color: 'text-amber-600' },
        { label: 'Adjustment', value: stats.stock_adjustment || 0, color: 'text-rose-600' },
    ];

    const exportParams = new URLSearchParams({
        type: activeType,
        search: searchTerm.trim(),
        date_from: dateFrom,
        date_to: dateTo,
    }).toString();
    const exportCsvUrl = `${route('wms-documents.export')}?${exportParams}`;
    const exportPdfUrl = `${route('wms-documents.pdf')}?${exportParams}`;

    return (
        <DashboardLayout
            headerTitle="Dokumen WMS"
            headerSearchPlaceholder="Cari dokumen WMS..."
            contentClassName="max-w-[1500px] mx-auto"
        >
            <Head title="Dokumen WMS" />

            <div className="space-y-6">
                <section className="bg-white border border-gray-100 rounded-[8px] shadow-sm">
                    <div className="px-6 py-5 border-b border-gray-100 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-[11px] font-extrabold text-indigo-500 tracking-[0.18em] uppercase">Warehouse Document Center</p>
                            <h2 className="mt-1 text-2xl font-black text-gray-900 tracking-tight">Audit trail dokumen operasional</h2>
                            <p className="mt-1 text-sm text-gray-500">Ringkasan dokumen penerimaan, pengeluaran, transfer rack, opname, dan adjustment untuk gudang utama.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                            <div className="relative w-full lg:w-[360px]">
                                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    className="w-full h-11 pl-11 pr-4 rounded-[8px] border border-gray-200 text-sm font-semibold text-gray-700 focus:border-indigo-400 focus:ring-indigo-100"
                                    placeholder="Nomor, pihak, operator, gudang..."
                                />
                            </div>
                            <a
                                href={exportCsvUrl}
                                className="h-11 px-4 rounded-[8px] border border-gray-200 bg-white text-gray-700 text-xs font-black inline-flex items-center justify-center gap-2 hover:border-gray-300 transition-colors"
                            >
                                <DownloadIcon className="w-4 h-4" />
                                CSV
                            </a>
                            <a
                                href={exportPdfUrl}
                                className="h-11 px-4 rounded-[8px] bg-gray-900 text-white text-xs font-black inline-flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                            >
                                <DownloadIcon className="w-4 h-4" />
                                PDF
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 border-b border-gray-100">
                        {statCards.map((card) => (
                            <div key={card.label} className="px-6 py-4 border-r border-gray-100 last:border-r-0">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
                                <p className={`mt-1 text-2xl font-black ${card.color}`}>{formatNumber(card.value)}</p>
                            </div>
                        ))}
                    </div>

                    <div className="px-6 py-4 flex flex-wrap gap-2 border-b border-gray-100">
                        {filters.map((filter) => (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() => setActiveType(filter.value)}
                                className={`h-9 px-4 rounded-[8px] text-xs font-extrabold border transition-colors ${
                                    activeType === filter.value
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    <div className="px-6 py-4 flex flex-col gap-3 border-b border-gray-100 md:flex-row md:items-end md:justify-between">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <label className="block">
                                <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Dari Tanggal</span>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(event) => setDateFrom(event.target.value)}
                                    className="mt-1 h-10 w-full rounded-[8px] border border-gray-200 px-3 text-sm font-bold text-gray-700 focus:border-indigo-400 focus:ring-indigo-100"
                                />
                            </label>
                            <label className="block">
                                <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Sampai Tanggal</span>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(event) => setDateTo(event.target.value)}
                                    className="mt-1 h-10 w-full rounded-[8px] border border-gray-200 px-3 text-sm font-bold text-gray-700 focus:border-indigo-400 focus:ring-indigo-100"
                                />
                            </label>
                        </div>
                        {(dateFrom || dateTo || searchTerm || activeType !== 'all') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveType('all');
                                    setSearchTerm('');
                                    setDateFrom('');
                                    setDateTo('');
                                }}
                                className="h-10 w-full rounded-[8px] border border-gray-200 bg-white px-4 text-xs font-black text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 md:w-auto"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1080px] text-left">
                            <thead>
                                <tr className="bg-gray-50/70 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-3">Dokumen</th>
                                    <th className="px-4 py-3">Tanggal</th>
                                    <th className="px-4 py-3">Pihak / Sumber</th>
                                    <th className="px-4 py-3">Gudang</th>
                                    <th className="px-4 py-3 text-right">Item</th>
                                    <th className="px-4 py-3 text-right">Qty</th>
                                    <th className="px-4 py-3">Operator</th>
                                    <th className="px-6 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredDocuments.map((document) => (
                                    <tr key={document.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-[8px] bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                    <DocumentIcon className="w-5 h-5 text-gray-500" />
                                                </div>
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-black text-sm text-gray-900">{document.number}</p>
                                                        <span className={`px-2 py-1 rounded-[6px] border text-[10px] font-black ${typeStyles[document.type] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                                                            {document.type_label}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-xs font-semibold text-gray-500">{document.summary}</p>
                                                    <p className="mt-1 text-[11px] font-bold text-gray-400">{document.status}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm font-bold text-gray-600">{document.date_label || document.date}</td>
                                        <td className="px-4 py-4 text-sm font-bold text-gray-700">{document.party}</td>
                                        <td className="px-4 py-4 text-sm font-semibold text-gray-500">{document.warehouse}</td>
                                        <td className="px-4 py-4 text-right text-sm font-black text-gray-800">{formatNumber(document.item_count)}</td>
                                        <td className="px-4 py-4 text-right text-sm font-black text-gray-800">{formatNumber(document.total_quantity)}</td>
                                        <td className="px-4 py-4 text-sm font-semibold text-gray-500">{document.operator}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {document.pdf_url && (
                                                    <a
                                                        href={document.pdf_url}
                                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-[8px] border border-gray-200 bg-white px-3 text-xs font-black text-gray-600 transition-colors hover:border-gray-300"
                                                    >
                                                        PDF
                                                    </a>
                                                )}
                                                {document.url ? (
                                                    <Link
                                                        href={document.url}
                                                        className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-[8px] bg-gray-900 text-white text-xs font-black hover:bg-gray-800 transition-colors"
                                                    >
                                                        Detail
                                                        <ArrowIcon className="w-3.5 h-3.5" />
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs font-bold text-gray-400">Tidak ada detail</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredDocuments.length === 0 && (
                        <div className="px-6 py-16 text-center">
                            <div className="mx-auto w-12 h-12 rounded-[8px] bg-gray-100 flex items-center justify-center">
                                <DocumentIcon className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="mt-4 text-sm font-black text-gray-800">Dokumen tidak ditemukan</p>
                            <p className="mt-1 text-sm text-gray-500">Coba ubah kata kunci pencarian atau filter jenis dokumen.</p>
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
}
