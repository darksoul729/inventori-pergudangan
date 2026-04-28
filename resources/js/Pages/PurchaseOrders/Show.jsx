import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    const roleName = (auth?.user?.role_name || auth?.user?.role || '').toString().toLowerCase();
    const isManager = roleName.includes('manager') || roleName.includes('manajer') || roleName.includes('admin gudang');
    const canReceivePurchaseOrder = isManager || roleName.includes('supervisor') || roleName.includes('spv');

    const handleStatusUpdate = (status) => {
        if (confirm(`Yakin ingin mengubah status PO ini menjadi ${status}?`)) {
            router.put(route('purchase-orders.update-status', purchaseOrder.id), { status });
        }
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

    return (
        <DashboardLayout headerSearchPlaceholder="Lihat pesanan pembelian...">
            <Head title={`Detail PO - ${purchaseOrder.po_number}`} />

            <div className="flex w-full flex-col space-y-6 pb-12 pt-2">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                        <Link href={route('purchase-orders.index')} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors">
                            <ArrowLeftIcon className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-[28px] font-black text-[#28106F] tracking-tight">{purchaseOrder.po_number}</h1>
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
                        {isManager && purchaseOrder.status === 'pending' && (
                            <>
                                <button
                                    onClick={() => handleStatusUpdate('rejected')}
                                    disabled={processing}
                                    className="flex items-center space-x-2 px-6 py-3.5 bg-white border border-red-200 text-red-600 font-bold rounded-xl text-[14px] hover:bg-red-50 transition-colors shadow-sm"
                                >
                                    <XIcon className="w-4 h-4" />
                                    <span>Tolak PO</span>
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('approved')}
                                    disabled={processing}
                                    className="flex items-center space-x-2 px-6 py-3.5 bg-[#5932C9] shadow-[#5932C9]/30 shadow-lg hover:bg-indigo-700 text-white font-bold rounded-xl text-[14px] transition-colors"
                                >
                                    <CheckIcon className="w-4 h-4" />
                                    <span>Setujui & Kirim</span>
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

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="col-span-2 space-y-6">
                        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC]">
                            <div className="mb-6 flex items-center justify-between gap-4">
                                <h2 className="text-[18px] font-black text-[#28106F]">Daftar Item</h2>
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
                                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Exp. Date</div>
                                            <div className="mt-1 text-[14px] font-black text-rose-600">{activeItem.expired_date || '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-[13px] font-bold text-slate-400">
                                    Tidak ada item pada PO ini.
                                </div>
                            )}

                            <div className="flex justify-end mt-8 pt-8 border-t border-gray-100">
                                <div className="text-right">
                                    <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest block mb-1">Total Keseluruhan</span>
                                    <span className="text-[28px] font-black text-[#28106F]">{formatCurrency(purchaseOrder.total_amount)}</span>
                                </div>
                            </div>
                        </div>

                        {purchaseOrder.notes && (
                            <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC]">
                                <h2 className="text-[14px] font-black text-[#28106F] mb-4 uppercase tracking-wider">Catatan Internal</h2>
                                <p className="text-[14px] font-bold text-gray-500 leading-relaxed">{purchaseOrder.notes}</p>
                            </div>
                        )}

                        {purchaseOrder.goods_receipts?.length > 0 && (
                            <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC]">
                                <h2 className="text-[14px] font-black text-[#28106F] mb-4 uppercase tracking-wider">Dokumen Penerimaan</h2>
                                <div className="space-y-3">
                                    {purchaseOrder.goods_receipts.map((receipt) => (
                                        <Link
                                            key={receipt.id}
                                            href={route('goods-receipts.show', receipt.id)}
                                            className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 transition hover:border-indigo-200 hover:bg-indigo-50"
                                        >
                                            <div>
                                                <div className="text-[13px] font-black text-[#28106F]">{receipt.receipt_number}</div>
                                                <div className="text-[11px] font-bold text-gray-400">{receipt.status} - {receipt.items?.length || 0} item</div>
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-wider text-[#5932C9]">Lihat</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC]">
                            <h2 className="text-[14px] font-black text-[#28106F] mb-6 uppercase tracking-wider">Detail Pemasok</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Nama Perusahaan</label>
                                    <div className="text-[14px] font-black text-[#28106F]">{purchaseOrder.supplier?.name}</div>
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

                        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC]">
                            <h2 className="text-[14px] font-black text-[#28106F] mb-6 uppercase tracking-wider">Info Pengiriman</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Tujuan</label>
                                    <div className="text-[14px] font-black text-[#28106F]">{purchaseOrder.warehouse?.name}</div>
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

            {showReceiveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-[18px] font-black text-[#28106F]">Konfirmasi Penerimaan Barang</h2>
                            <button
                                type="button"
                                onClick={() => setShowReceiveModal(false)}
                                className="rounded-lg border border-gray-200 px-3 py-1.5 text-[12px] font-bold text-gray-500 hover:bg-gray-50"
                            >
                                Tutup
                            </button>
                        </div>

                        <form onSubmit={handleSubmitReceive} className="space-y-4">
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                                <label className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        className="mt-0.5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                                        checked={Boolean(data.auto_putaway)}
                                        onChange={(event) => setData('auto_putaway', event.target.checked)}
                                    />
                                    <span>
                                        <span className="block text-[13px] font-black text-emerald-800">Auto put-away ke rack</span>
                                        <span className="block text-[12px] font-semibold text-emerald-700">
                                            Jika nonaktif, stok penerimaan akan masuk ke floating/unplaced dan dipindahkan manual dari menu Rack Allocation.
                                        </span>
                                    </span>
                                </label>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-[#EDE8FC]">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#f8f9fb] text-[11px] uppercase tracking-[0.12em] text-gray-400">
                                        <tr>
                                            <th className="px-4 py-3 font-black">Produk</th>
                                            <th className="px-4 py-3 font-black">Qty Terima</th>
                                            <th className="px-4 py-3 font-black">Batch</th>
                                            <th className="px-4 py-3 font-black">Exp. Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#EDE8FC]">
                                        {purchaseOrder.items.map((item, index) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-[#28106F]">{item.product?.name}</div>
                                                    <div className="font-mono text-[11px] font-semibold text-gray-400">{item.product?.sku}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={item.quantity}
                                                        value={data.received_items[index]?.quantity_received ?? item.quantity}
                                                        onChange={(event) => updateReceivedItem(index, 'quantity_received', Number(event.target.value) || 0)}
                                                        className="w-28 rounded-lg border-gray-200 text-[13px] font-bold focus:border-[#5932C9] focus:ring-[#5932C9]"
                                                    />
                                                    <div className="mt-1 text-[11px] font-semibold text-gray-400">Maks: {item.quantity}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={data.received_items[index]?.batch_number ?? ''}
                                                        onChange={(event) => updateReceivedItem(index, 'batch_number', event.target.value)}
                                                        placeholder="Kosongkan untuk auto-generate"
                                                        className="w-full rounded-lg border-gray-200 text-[13px] font-semibold focus:border-[#5932C9] focus:ring-[#5932C9]"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="date"
                                                        value={data.received_items[index]?.expired_date ?? ''}
                                                        onChange={(event) => updateReceivedItem(index, 'expired_date', event.target.value)}
                                                        className="w-full rounded-lg border-gray-200 text-[13px] font-semibold focus:border-[#5932C9] focus:ring-[#5932C9]"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {(errors.received_items || errors.status) && (
                                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-bold text-rose-700">
                                    {errors.received_items || errors.status}
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowReceiveModal(false)}
                                    className="rounded-xl border border-gray-200 px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-emerald-600 px-4 py-2 text-[13px] font-black text-white hover:bg-emerald-700 disabled:opacity-60"
                                >
                                    {processing ? 'Menyimpan...' : 'Konfirmasi Receive'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
