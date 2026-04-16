import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

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

const BackIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

export default function TransactionDetail({ transaction }) {
    
    // Status Helper
    const getStatusInfo = (tx) => {
        switch(tx.movement_type) {
            case 'in': return { label: 'Barang Masuk', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: <InboundIcon className="w-5 h-5" /> };
            case 'out': return { label: 'Keluar', color: 'text-slate-600 bg-slate-100 border-slate-200', icon: <OutboundIcon className="w-5 h-5" /> };
            case 'transfer': return { label: 'Transfer', color: 'text-blue-600 bg-blue-50 border-blue-100', icon: <TransferIcon className="w-5 h-5" /> };
            case 'adjustment': return { label: 'Penyesuaian', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: <AdjustmentIcon className="w-5 h-5" /> };
            case 'opname': return { label: 'Opname', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: <AdjustmentIcon className="w-5 h-5" /> };
            default: return { label: 'Selesai', color: 'text-gray-600 bg-gray-50 border-gray-200', icon: <InboundIcon className="w-5 h-5" /> };
        }
    };

    const statusObj = getStatusInfo(transaction);

    // Generate deterministic barcode pattern based on transaction ID
    const barcodePattern = Array.from({ length: 32 }, (_, i) => {
        const hash = (transaction.id * 7 + i * 13) % 10;
        return hash > 6 ? 'w-2' : (hash > 3 ? 'w-1' : 'w-[2px]');
    });

    return (
        <DashboardLayout headerSearchPlaceholder="Cari transaksi lain...">
            <Head title={`Detail Transaksi #${transaction.id.toString().padStart(6, '0')}`} />
            
            <div className="w-full pb-12 pt-4">
                
                {/* Header Section */}
                <div className="flex items-center space-x-4 mb-8">
                    <Link 
                        href={route('transaction')}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 border border-[#edf2f7] shadow-sm hover:shadow-md hover:text-[#4f46e5] transition-all"
                    >
                        <BackIcon className="w-4 h-4" />
                    </Link>
                    <div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-[24px] font-black text-[#0f172a] tracking-tight">Detail Transaksi</h1>
                            <span className="text-[12px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">
                                #{transaction.id.toString().padStart(6, '0')}
                            </span>
                        </div>
                        <p className="text-[13px] font-semibold text-slate-500 mt-1">Dicatat pada {new Date(transaction.movement_date).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#edf2f7] overflow-hidden flex flex-col">
                    
                    {/* Top Hero Section */}
                    <div className="relative overflow-hidden bg-[#f8fafc] border-b border-[#edf2f7] p-8 flex justify-between items-center isolate">
                        {/* Background Effect */}
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-3xl -z-10"></div>
                        
                        <div className="flex items-center space-x-4 z-10">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white text-indigo-600 border border-slate-200 shadow-sm backdrop-blur-md">
                                {statusObj.icon}
                            </div>
                            <div>
                                <h3 className="text-[11px] font-bold text-slate-500 tracking-widest uppercase mb-1">Tipe Pergerakan</h3>
                                <p className="text-[20px] font-black text-gray-900 leading-tight capitalize">{statusObj.label}</p>
                            </div>
                        </div>

                        <div className="text-right z-10">
                            <h3 className="text-[11px] font-bold text-slate-500 tracking-widest uppercase mb-1">Total Kuantitas Fisik</h3>
                            <div className="flex items-baseline space-x-2 text-gray-900">
                                <span className="text-[36px] font-black tracking-tight">{transaction.quantity.toLocaleString()}</span>
                                <span className="text-[14px] font-bold text-slate-500 uppercase">Unit</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 space-y-8">
                        
                        {/* Stock Audit Journey */}
                        {transaction.stock_before !== undefined && transaction.stock_after !== undefined && (
                            <div className="bg-slate-50 border border-slate-100 rounded-[20px] p-6 relative overflow-hidden">
                                <h4 className="text-[11px] font-black text-slate-400 tracking-widest uppercase mb-6 flex items-center">
                                    <svg className="w-3.5 h-3.5 text-slate-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                    Jejak Audit Stok
                                </h4>
                                <div className="flex items-center justify-between relative z-10 px-4">
                                    <div className="text-center w-[120px]">
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Stok Awal</p>
                                        <p className="text-[28px] font-black text-slate-700 font-mono tracking-tight">{transaction.stock_before.toLocaleString()}</p>
                                    </div>
                                    <div className="flex-1 px-8 flex items-center justify-center">
                                        <div className="h-[2px] w-full bg-slate-200 relative rounded-full">
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-1.5 rounded-full border-2 border-[#edf2f7] shadow-sm flex items-center space-x-2">
                                                <span className={`text-[13px] font-black ${transaction.movement_type === 'in' || transaction.movement_type === 'opname' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {transaction.movement_type === 'in' || transaction.movement_type === 'opname' ? '+' : '-'} {transaction.quantity.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center w-[120px]">
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Stok Akhir</p>
                                        <p className="text-[28px] font-black text-indigo-600 font-mono tracking-tight">{transaction.stock_after.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Grid: Context & Location */}
                        <div className="grid grid-cols-2 gap-8">
                            
                            {/* Product Segment */}
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-slate-400 tracking-widest uppercase flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span> Informasi Produk
                                </h4>
                                <div className="p-5 rounded-[16px] bg-slate-50 border border-slate-100 flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-bold text-[#1a202c] leading-snug">{transaction.product?.name || 'Barang Tidak Dikenal'}</p>
                                        <div className="flex items-center mt-2 space-x-2">
                                            <span className="bg-white border border-slate-200 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">SKU: {transaction.product?.sku || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Warehouse Segment */}
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-slate-400 tracking-widest uppercase flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span> Lokasi Operasional
                                </h4>
                                <div className="p-5 rounded-[16px] bg-slate-50 border border-slate-100">
                                    <p className="text-[14px] font-bold text-[#1a202c] leading-snug mb-1">{transaction.warehouse?.name || '-'}</p>
                                    <p className="text-[12px] font-semibold text-slate-500">{transaction.warehouse?.location || 'Lokasi tidak spesifik'}</p>
                                </div>
                            </div>

                        </div>

                        {/* References & Finance Metadata */}
                        <div className="pt-2 border-t border-transparent grid grid-cols-2 gap-8">
                            
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-slate-400 tracking-widest uppercase flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mr-2"></span> Referensi Sistem
                                </h4>
                                <div className="p-5 rounded-[16px] bg-white border border-[#edf2f7] shadow-sm flex flex-col justify-center h-[100px] relative overflow-hidden">
                                    {/* Fake Barcode Graphic */}
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex h-8 gap-[2px] opacity-20 hover:opacity-40 transition-opacity">
                                        {barcodePattern.map((widthClass, i) => (
                                            <div key={i} className={`bg-slate-900 ${widthClass} rounded-sm`}></div>
                                        ))}
                                    </div>

                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1 z-10">
                                        {transaction.reference_type ? transaction.reference_type.replace('_', ' ') : 'Manual Log'}
                                    </p>
                                    <p className="text-[18px] font-black text-slate-800 font-mono tracking-widest z-10">
                                        {transaction.reference_id ? `REF-${transaction.reference_id.toString().padStart(5, '0')}` : `TRX-${transaction.id.toString().padStart(5, '0')}`}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-slate-400 tracking-widest uppercase flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span> Valuasi Pergerakan Aset
                                </h4>
                                <div className="p-5 rounded-[16px] bg-emerald-50/50 border border-emerald-100 flex items-center justify-between h-[100px]">
                                    <div>
                                        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Estimasi Nilai Mutasi</p>
                                        <p className="text-[20px] font-black text-emerald-700">
                                            Rp {(transaction.quantity * (transaction.product?.purchase_price || 0)).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200/50">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Additional Metadata */}
                        <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-8">
                            
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-slate-400 tracking-widest uppercase flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span> Otorisasi Oleh
                                </h4>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-white border border-indigo-200 flex items-center justify-center text-indigo-700 font-black shadow-sm">
                                        {transaction.user?.name ? transaction.user.name.charAt(0) : '?'}
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-bold text-[#1a202c]">{transaction.user?.name || 'Sistem Otomatis'}</p>
                                        <p className="text-[11px] font-semibold text-slate-500 leading-none mt-1">{transaction.user?.email || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[11px] font-black text-slate-400 tracking-widest uppercase flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span> Catatan & Instruksi Tambahan
                                </h4>
                                {transaction.notes ? (
                                    <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-[13px] font-medium text-slate-700 italic shadow-inner">
                                        "{transaction.notes}"
                                    </div>
                                ) : (
                                    <p className="text-[13px] font-medium text-slate-400 italic">Tidak ada catatan ekstra pada transaksi ini.</p>
                                )}
                            </div>

                        </div>

                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
