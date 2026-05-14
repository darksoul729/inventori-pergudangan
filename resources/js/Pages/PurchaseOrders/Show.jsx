import DashboardLayout from '@/Layouts/DashboardLayout';
import { isManagerRole, isSupervisorRole, isStaffRole } from '@/Utils/roleCapabilities';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, FileText, Building2, CalendarClock, Package, Wallet } from 'lucide-react';
import React, { useState } from 'react';

const ArrowLeftIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const CheckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const XIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const DownloadIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14" />
    </svg>
);

export default function Show({ purchaseOrder }) {
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [activeItemIndex, setActiveItemIndex] = useState(0);
    const { data, setData, put, processing, errors } = useForm({
        status: 'received',
        auto_putaway: true,
        received_items: purchaseOrder.items.map((item) => ({
            purchase_order_item_id: item.id,
            quantity_received: item.quantity,
            batch_number: item.batch_number || '',
            expired_date: item.expired_date || '',
        })),
    });
    const { auth } = usePage().props;
    const roleName = auth?.user?.role_name || auth?.user?.role || '';
    const isManager = isManagerRole(roleName);
    const isSupervisor = isSupervisorRole(roleName);
    const isStaff = isStaffRole(roleName);
    const canReceivePurchaseOrder = isManager || isSupervisor || isStaff;

    const handleStatusUpdate = (status) => {
        router.put(route('purchase-orders.update-status', purchaseOrder.id), { status }, {
            onSuccess: () => setConfirmAction(null),
        });
    };

    const updateReceivedItem = (index, field, value) => {
        const nextItems = [...data.received_items];
        nextItems[index][field] = value;
        setData('received_items', nextItems);
    };

    const handleSubmitReceive = (event) => {
        event.preventDefault();
        put(route('purchase-orders.update-status', purchaseOrder.id), {
            preserveScroll: true,
            onSuccess: () => setShowReceiveModal(false),
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'approved': return 'bg-indigo-100 text-indigo-700';
            case 'received': return 'bg-emerald-100 text-emerald-700';
            case 'cancelled':
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    const totalItems = purchaseOrder.items?.length || 0;
    const activeItem = totalItems > 0 ? purchaseOrder.items[activeItemIndex] : null;
    const canPrevItem = activeItemIndex > 0;
    const canNextItem = activeItemIndex < totalItems - 1;
    const emailLogs = purchaseOrder.email_logs || [];

    return (
        <DashboardLayout headerSearchPlaceholder="Lihat pesanan pembelian...">
            <Head title={`Detail Pesanan - ${purchaseOrder.po_number}`} />

            <div className="flex w-full flex-col space-y-6 pb-12 pt-2">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                        <Link href={route('purchase-orders.index')} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors">
                            <ArrowLeftIcon className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-[28px] font-black text-[#4722B3] tracking-tight">{purchaseOrder.po_number}</h1>
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getStatusColor(purchaseOrder.status)}`}>
                                    {purchaseOrder.status === 'pending' ? 'Menunggu' : purchaseOrder.status === 'approved' ? 'Disetujui' : purchaseOrder.status === 'received' ? 'Diterima' : purchaseOrder.status === 'cancelled' ? 'Dibatalkan' : purchaseOrder.status === 'rejected' ? 'Ditolak' : purchaseOrder.status}
                                </span>
                            </div>
                            <p className="text-[14px] font-bold text-gray-500 mt-1">Dibuat pada {new Date(purchaseOrder.order_date).toLocaleDateString('id-ID')} oleh {purchaseOrder.creator?.name}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-3">
                        <a
                            href={route('purchase-orders.pdf', purchaseOrder.id)}
                            download
                            className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-bold text-slate-700 transition-colors hover:bg-slate-50"
                        >
                            <DownloadIcon className="h-4 w-4" />
                            <span>Unduh PDF</span>
                        </a>
                        {(isManager || isSupervisor) && purchaseOrder.status === 'pending' && (
                            <>
                                <button
                                    onClick={() => setConfirmAction('rejected')}
                                    disabled={processing}
                                    className="flex items-center space-x-2 px-6 py-3.5 bg-white border border-red-200 text-red-600 font-bold rounded-xl text-[14px] hover:bg-red-50 transition-colors shadow-sm"
                                >
                                    <XIcon className="w-4 h-4" />
                                    <span>Tolak Pesanan</span>
                                </button>
                                <button
                                    onClick={() => setConfirmAction('approved')}
                                    disabled={processing}
                                    className="flex items-center space-x-2 px-6 py-3.5 bg-[#5B33CC] shadow-[#5B33CC]/30 shadow-lg hover:bg-indigo-700 text-white font-bold rounded-xl text-[14px] transition-colors"
                                >
                                    <CheckIcon className="w-4 h-4" />
                                    <span>Setujui</span>
                                </button>
                            </>
                        )}
                        {canReceivePurchaseOrder && purchaseOrder.status === 'approved' && (
                            <button
                                onClick={() => setShowReceiveModal(true)}
                                disabled={processing}
                                className="flex items-center space-x-2 px-6 py-3.5 bg-emerald-600 shadow-emerald-200 shadow-lg hover:bg-emerald-700 text-white font-bold rounded-xl text-[14px] transition-colors"
                            >
                                <CheckIcon className="w-4 h-4" />
                                <span>Konfirmasi Diterima</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-semibold">No. Pesanan</div>
                            <FileText className="w-4 h-4 text-[#4722B3]" />
                        </div>
                        <div className="text-sm font-black text-[#4722B3] mt-1">{purchaseOrder.po_number}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-semibold">Pemasok</div>
                            <Building2 className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="text-sm font-black text-slate-700 mt-1">{purchaseOrder.supplier?.name || '-'}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-semibold">Tanggal Pesanan</div>
                            <CalendarClock className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="text-sm font-black text-slate-700 mt-1">{new Date(purchaseOrder.order_date).toLocaleDateString('id-ID')}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-semibold">Total Item</div>
                            <Package className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-2xl font-black text-emerald-600 mt-1">{purchaseOrder.items?.length || 0}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-4 sm:col-span-2 xl:col-span-1">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-semibold">Nilai Pesanan</div>
                            <Wallet className="w-4 h-4 text-slate-700" />
                        </div>
                        <div className="text-xl font-black text-[#1f2937] mt-1">{formatCurrency(purchaseOrder.total_amount)}</div>
                    </div>
                </div>

                <div className="rounded-xl border border-[#E5EAF3] bg-white p-4">
                    <div className="mb-2 text-sm font-black text-[#4722B3]">Riwayat Kirim Email Pesanan</div>
                    {emailLogs.length > 0 ? (
                        <div className="space-y-2">
                            {emailLogs.slice(0, 5).map((log) => (
                                <div key={log.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
                                    <div className="font-bold text-slate-700">{log.recipient_email}</div>
                                    <div className="text-slate-500">{new Date(log.sent_at).toLocaleString('id-ID')}</div>
                                    <div className="text-slate-500">oleh {log.sender?.name || '-'}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500">Belum ada riwayat kirim email pesanan.</p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="col-span-2 space-y-6">
                        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]">
                            <div className="mb-6 flex items-center justify-between gap-4">
                                <h2 className="text-[18px] font-black text-[#4722B3]">Daftar Item</h2>
                                {totalItems > 0 && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => canPrevItem && setActiveItemIndex((idx) => idx - 1)}
                                            disabled={!canPrevItem}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <ChevronLeft className="h-4 w-4" strokeWidth={2.4} />
                                        </button>
                                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                                            {activeItemIndex + 1} / {totalItems}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => canNextItem && setActiveItemIndex((idx) => idx + 1)}
                                            disabled={!canNextItem}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {activeItem ? (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                    <div className="text-[16px] font-black text-slate-900">{activeItem.product?.name}</div>
                                    <div className="mt-1 text-[12px] font-bold text-slate-500">SKU: {activeItem.product?.sku || '-'}</div>

                                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Jumlah</div>
                                            <div className="mt-1 text-[14px] font-black text-slate-900">{activeItem.quantity} Unit</div>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Harga Satuan</div>
                                            <div className="mt-1 text-[14px] font-black text-slate-900">{formatCurrency(activeItem.unit_price)}</div>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Batch</div>
                                            <div className="mt-1 text-[14px] font-black text-indigo-600">{activeItem.batch_number || '-'}</div>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tanggal Kedaluwarsa</div>
                                            <div className="mt-1 text-[14px] font-black text-rose-600">{activeItem.expired_date || '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-[13px] font-bold text-slate-400">
                                    Tidak ada item pada pesanan ini.
                                </div>
                            )}

                            <div className="flex justify-end mt-8 pt-8 border-t border-gray-100">
                                <div className="text-right">
                                    <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest block mb-1">Total Keseluruhan</span>
                                    <span className="text-[28px] font-black text-[#4722B3]">{formatCurrency(purchaseOrder.total_amount)}</span>
                                </div>
                            </div>
                        </div>

                        {purchaseOrder.notes && (
                            <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]">
                                <h2 className="text-[14px] font-black text-[#4722B3] mb-4 uppercase tracking-wider">Catatan Internal</h2>
                                <p className="text-[14px] font-bold text-gray-500 leading-relaxed">{purchaseOrder.notes}</p>
                            </div>
                        )}

                        {purchaseOrder.goods_receipts?.length > 0 && (
                            <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]">
                                <h2 className="text-[14px] font-black text-[#4722B3] mb-4 uppercase tracking-wider">Dokumen Penerimaan</h2>
                                <div className="space-y-3">
                                    {purchaseOrder.goods_receipts.map((receipt) => (
                                        <Link
                                            key={receipt.id}
                                            href={route('goods-receipts.show', receipt.id)}
                                            className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 transition hover:border-indigo-200 hover:bg-indigo-50"
                                        >
                                            <div>
                                                <div className="text-[13px] font-black text-[#4722B3]">{receipt.receipt_number}</div>
                                                <div className="text-[11px] font-bold text-gray-400">{receipt.status} - {receipt.items?.length || 0} item</div>
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-wider text-[#5B33CC]">Lihat</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]">
                            <h2 className="text-[14px] font-black text-[#4722B3] mb-6 uppercase tracking-wider">Detail Pemasok</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Nama Perusahaan</label>
                                    <div className="text-[14px] font-black text-[#4722B3]">{purchaseOrder.supplier?.name}</div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Kategori</label>
                                    <div className="text-[14px] font-bold text-gray-600">{purchaseOrder.supplier?.category}</div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Kontak</label>
                                    <div className="text-[13px] font-bold text-gray-600">{purchaseOrder.supplier?.contact_person}</div>
                                    <div className="text-[12px] font-bold text-indigo-500">{purchaseOrder.supplier?.email}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]">
                            <h2 className="text-[14px] font-black text-[#4722B3] mb-6 uppercase tracking-wider">Info Pengiriman</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Tujuan</label>
                                    <div className="text-[14px] font-black text-[#4722B3]">{purchaseOrder.warehouse?.name}</div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Perkiraan Tiba</label>
                                    <div className="text-[14px] font-black text-amber-600">
                                        {purchaseOrder.expected_date ? new Date(purchaseOrder.expected_date).toLocaleDateString('id-ID') : 'Belum ditentukan'}
                                    </div>
                                </div>
                                {purchaseOrder.approved_by && (
                                    <div className="pt-4 border-t border-gray-50">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Disetujui Oleh</label>
                                        <div className="text-[13px] font-black text-indigo-600">{purchaseOrder.approver?.name}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {confirmAction && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmAction(null)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-xl p-6 shadow-2xl mx-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${confirmAction === 'approved' ? 'bg-indigo-50' : 'bg-red-50'}`}>
                            {confirmAction === 'approved' ? <CheckIcon className="w-6 h-6 text-[#5B33CC]" /> : <XIcon className="w-6 h-6 text-red-600" />}
                        </div>
                        <h3 className="text-center text-lg font-black text-slate-800 mb-2">
                            {confirmAction === 'approved' ? 'Setujui Pesanan?' : 'Tolak Pesanan?'}
                        </h3>
                        <p className="text-center text-[13px] text-gray-500 mb-6">
                            {confirmAction === 'approved'
                                ? `Pesanan ${purchaseOrder.po_number} akan disetujui dan siap untuk proses penerimaan barang.`
                                : `Pesanan ${purchaseOrder.po_number} akan ditolak. Tindakan ini tidak dapat dibatalkan.`}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmAction(null)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-lg text-sm hover:bg-gray-50">Batal</button>
                            <button
                                onClick={() => handleStatusUpdate(confirmAction)}
                                disabled={processing}
                                className={`flex-1 px-4 py-2.5 font-bold rounded-lg text-sm text-white disabled:opacity-60 ${confirmAction === 'approved' ? 'bg-[#5B33CC] hover:bg-indigo-700' : 'bg-red-600 hover:bg-red-700'}`}
                            >
                                {processing ? 'Memproses...' : confirmAction === 'approved' ? 'Ya, Setujui' : 'Ya, Tolak'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showReceiveModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setShowReceiveModal(false)}></div>
                    <div className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-2xl mx-4">
                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 bg-white border-b border-[#E5EAF3] px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <div>
                                <h2 className="text-[18px] font-black text-[#4722B3]">Konfirmasi Penerimaan Barang</h2>
                                <p className="text-[12px] font-semibold text-gray-400 mt-0.5">{purchaseOrder.po_number} &mdash; {purchaseOrder.supplier?.name}</p>
                            </div>
                            <button type="button" onClick={() => setShowReceiveModal(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitReceive} className="p-6 space-y-5">
                            {/* Summary */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                                    <div className="text-[10px] font-bold uppercase text-gray-400">Total Item</div>
                                    <div className="text-lg font-black text-[#4722B3] mt-1">{purchaseOrder.items.length}</div>
                                </div>
                                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                                    <div className="text-[10px] font-bold uppercase text-gray-400">Total Qty Diterima</div>
                                    <div className="text-lg font-black text-emerald-600 mt-1">{data.received_items.reduce((s, i) => s + Number(i.quantity_received || 0), 0)}</div>
                                </div>
                                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                                    <div className="text-[10px] font-bold uppercase text-gray-400">Nilai Pesanan</div>
                                    <div className="text-lg font-black text-slate-800 mt-1">{formatCurrency(purchaseOrder.total_amount)}</div>
                                </div>
                            </div>

                            {/* Auto Putaway */}
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="mt-0.5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                                        checked={Boolean(data.auto_putaway)}
                                        onChange={(event) => setData('auto_putaway', event.target.checked)}
                                    />
                                    <span>
                                        <span className="block text-[13px] font-black text-emerald-800">Simpan otomatis ke rak</span>
                                        <span className="block text-[11px] font-semibold text-emerald-600 mt-0.5">Jika dinonaktifkan, stok masuk sebagai floating dan perlu ditempatkan manual.</span>
                                    </span>
                                </label>
                            </div>

                            {/* Items Table */}
                            <div>
                                <div className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Detail Penerimaan Per Item</div>
                                <div className="overflow-hidden rounded-xl border border-[#E5EAF3]">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[#f8f9fb]">
                                            <tr className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                                <th className="px-4 py-3">Produk</th>
                                                <th className="px-4 py-3 w-28">Qty Terima</th>
                                                <th className="px-4 py-3">No. Batch</th>
                                                <th className="px-4 py-3 w-40">Kedaluwarsa</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E5EAF3]">
                                            {purchaseOrder.items.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-slate-50/50">
                                                    <td className="px-4 py-3">
                                                        <div className="text-[13px] font-bold text-slate-800">{item.product?.name}</div>
                                                        <div className="text-[10px] font-semibold text-gray-400 mt-0.5">{item.product?.sku} &middot; Dipesan: {item.quantity}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={item.quantity}
                                                            value={data.received_items[index]?.quantity_received ?? item.quantity}
                                                            onChange={(event) => updateReceivedItem(index, 'quantity_received', Number(event.target.value) || 0)}
                                                            className="w-full rounded-lg border-gray-200 text-[13px] font-bold text-center focus:border-[#5B33CC] focus:ring-[#5B33CC]"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="text"
                                                            value={data.received_items[index]?.batch_number ?? ''}
                                                            onChange={(event) => updateReceivedItem(index, 'batch_number', event.target.value)}
                                                            placeholder="Otomatis"
                                                            className="w-full rounded-lg border-gray-200 text-[12px] font-semibold focus:border-[#5B33CC] focus:ring-[#5B33CC]"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="date"
                                                            value={data.received_items[index]?.expired_date ?? ''}
                                                            onChange={(event) => updateReceivedItem(index, 'expired_date', event.target.value)}
                                                            className="w-full rounded-lg border-gray-200 text-[12px] font-semibold focus:border-[#5B33CC] focus:ring-[#5B33CC]"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Errors */}
                            {(errors.received_items || errors.status) && (
                                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-bold text-rose-700">
                                    {errors.received_items || errors.status}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-2 border-t border-[#E5EAF3]">
                                <button type="button" onClick={() => setShowReceiveModal(false)} className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-50">
                                    Batal
                                </button>
                                <button type="submit" disabled={processing} className="flex-1 px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 disabled:opacity-60 shadow-lg shadow-emerald-200">
                                    {processing ? 'Menyimpan...' : 'Konfirmasi Diterima'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
