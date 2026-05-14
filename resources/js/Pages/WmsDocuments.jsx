import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';
import { Search, FileText, ChevronRight, Download, Package, ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, ClipboardCheck, PenTool, Layers } from 'lucide-react';

const typeStyles = {
    goods_receipt: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    stock_out: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    stock_transfer: 'bg-blue-50 text-blue-700 border-blue-200',
    stock_opname: 'bg-amber-50 text-amber-700 border-amber-200',
    stock_adjustment: 'bg-rose-50 text-rose-700 border-rose-200',
};

const filters = [
    { value: 'all', label: 'Semua' },
    { value: 'goods_receipt', label: 'Penerimaan', icon: ArrowDownToLine },
    { value: 'stock_out', label: 'Keluar', icon: ArrowUpFromLine },
    { value: 'stock_transfer', label: 'Transfer', icon: ArrowRightLeft },
    { value: 'stock_opname', label: 'Opname', icon: ClipboardCheck },
    { value: 'stock_adjustment', label: 'Koreksi', icon: PenTool },
];

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID');

export default function WmsDocuments({ documents = [], stats = {} }) {
    const [activeType, setActiveType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const filteredDocuments = useMemo(() => {
        const needle = searchTerm.trim().toLowerCase();
        return documents.filter((doc) => {
            const matchesType = activeType === 'all' || doc.type === activeType || (activeType === 'manual_rack_stock' && doc.type === 'stock_adjustment' && doc.adjustment_mode === 'manual_rack_stock');
            const matchesDateFrom = !dateFrom || doc.date >= dateFrom;
            const matchesDateTo = !dateTo || doc.date <= dateTo;
            const searchable = [doc.number, doc.type_label, doc.party, doc.warehouse, doc.operator, doc.summary, doc.status].filter(Boolean).join(' ').toLowerCase();
            return matchesType && matchesDateFrom && matchesDateTo && (!needle || searchable.includes(needle));
        });
    }, [activeType, dateFrom, dateTo, documents, searchTerm]);

    const statCards = [
        { label: 'Total', value: stats.total || documents.length, color: 'text-[#4722B3]', icon: Layers },
        { label: 'Penerimaan', value: stats.goods_receipt || 0, color: 'text-emerald-600', icon: ArrowDownToLine },
        { label: 'Keluar', value: stats.stock_out || 0, color: 'text-indigo-600', icon: ArrowUpFromLine },
        { label: 'Transfer', value: stats.stock_transfer || 0, color: 'text-blue-600', icon: ArrowRightLeft },
        { label: 'Opname', value: stats.stock_opname || 0, color: 'text-amber-600', icon: ClipboardCheck },
        { label: 'Koreksi', value: stats.stock_adjustment || 0, color: 'text-rose-600', icon: PenTool },
    ];

    const exportParams = new URLSearchParams({ type: activeType, search: searchTerm.trim(), date_from: dateFrom, date_to: dateTo }).toString();

    return (
        <DashboardLayout headerTitle="Dokumen Gudang" headerSearchPlaceholder="Cari dokumen..." searchValue={searchTerm} onSearch={setSearchTerm} contentClassName="w-full max-w-none">
            <Head title="Dokumen Gudang" />

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-[28px] font-black text-[#4722B3] tracking-tight">Dokumen Gudang</h1>
                <p className="text-[13px] font-semibold text-gray-500 mt-1">Pantau semua dokumen operasional gudang di satu tempat.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                    <div key={card.label} className="bg-white rounded-[20px] p-4 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]">
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-[11px] font-extrabold text-gray-400 tracking-wide">{card.label}</p>
                            <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                                <Icon className={`w-4 h-4 ${card.color}`} />
                            </div>
                        </div>
                        <p className={`text-[24px] font-black ${card.color} mt-1`}>{formatNumber(card.value)}</p>
                    </div>
                )})}
            </div>

            {/* Filter Buttons */}
            <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3] mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                    {filters.map((filter) => {
                        const Icon = filter.icon || Package;
                        return (
                            <button key={filter.value} type="button" onClick={() => setActiveType(filter.value)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold border transition-all ${
                                    activeType === filter.value ? 'bg-[#5B33CC] text-white border-[#5B33CC]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#5B33CC]'
                                }`}>
                                {Icon && <Icon className="w-4 h-4" />}
                                {filter.label}
                            </button>
                        );
                    })}
                </div>

                {/* Date Filters */}
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Dari</label>
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                            className="h-10 px-3 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Sampai</label>
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                            className="h-10 px-3 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600" />
                    </div>
                    {(dateFrom || dateTo || searchTerm || activeType !== 'all') && (
                        <button type="button" onClick={() => { setActiveType('all'); setSearchTerm(''); setDateFrom(''); setDateTo(''); }}
                            className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-[12px] font-bold text-gray-500 hover:border-gray-300">Reset</button>
                    )}
                    <div className="flex gap-2 ml-auto">
                        <a href={`${route('wms-documents.export')}?${exportParams}`} className="flex items-center gap-2 h-10 px-4 rounded-xl border border-[#E5EAF3] bg-white text-[12px] font-bold text-gray-600 hover:bg-gray-50">
                            <Download className="w-4 h-4" />CSV
                        </a>
                        <a href={`${route('wms-documents.pdf')}?${exportParams}`} className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#5B33CC] text-white text-[12px] font-bold hover:bg-indigo-700">
                            <Download className="w-4 h-4" />PDF
                        </a>
                    </div>
                </div>
            </div>

            {/* Document List */}
            <div className="bg-white rounded-[20px] shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3] overflow-hidden">
                {filteredDocuments.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {filteredDocuments.map((doc) => (
                            <div key={doc.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
                                <div className="w-12 h-12 rounded-xl bg-[#f8f9fb] flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-6 h-6 text-[#5B33CC]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[14px] font-black text-[#4722B3]">{doc.number}</span>
                                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${typeStyles[doc.type] || 'bg-gray-50 text-gray-600'}`}>
                                            {doc.type_label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-[12px] font-semibold text-gray-500">
                                        <span>{doc.date_label || doc.date}</span>
                                        <span>·</span>
                                        <span>{doc.party || '-'}</span>
                                        <span>·</span>
                                        <span>{doc.warehouse}</span>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="text-[14px] font-black text-gray-800">{formatNumber(doc.item_count)} item</div>
                                    <div className="text-[12px] font-bold text-gray-400">{formatNumber(doc.total_quantity)} total</div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    {doc.pdf_url && (
                                        <a href={doc.pdf_url} className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-[#5B33CC]">
                                            <Download className="w-4 h-4" />
                                        </a>
                                    )}
                                    {doc.url ? (
                                        <Link href={doc.url} className="flex items-center gap-1 h-9 px-4 rounded-lg bg-[#5B33CC] text-white text-[12px] font-bold hover:bg-indigo-700">
                                            Buka <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    ) : <span className="text-[11px] font-bold text-gray-400">-</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-[#f8f9fb] flex items-center justify-center mx-auto mb-4">
                            <Layers className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-[16px] font-black text-[#4722B3]">Belum ada dokumen</p>
                        <p className="text-[13px] font-semibold text-gray-500 mt-1">Mulai catat transaksi operasional agar dokumen otomatis muncul di sini.</p>
                        <div className="mt-5 flex justify-center gap-3">
                            <Link href={route('purchase-orders.create')} className="px-4 py-2 rounded-xl bg-[#5B33CC] text-white text-[12px] font-bold hover:bg-indigo-700">
                                + Buat Pesanan Beli
                            </Link>
                            <Link href={route('inventory.outbound.view')} className="px-4 py-2 rounded-xl border border-[#E5EAF3] bg-white text-[#5B33CC] text-[12px] font-bold hover:bg-gray-50">
                                + Catat Barang Keluar
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
