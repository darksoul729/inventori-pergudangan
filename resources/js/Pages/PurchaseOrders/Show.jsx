import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import React from 'react';

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

export default function Show({ purchaseOrder }) {
    const { processing } = useForm({});

    const handleStatusUpdate = (status) => {
        if (confirm(`Are you sure you want to mark this PO as ${status}?`)) {
            router.put(route('purchase-orders.update-status', purchaseOrder.id), { status });
        }
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

    return (
        <DashboardLayout headerSearchPlaceholder="View purchase order...">
            <Head title={`PO Details - ${purchaseOrder.po_number}`} />

            <div className="flex flex-col space-y-6 pb-12 w-full pt-2 min-w-[1000px]">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                        <Link href={route('purchase-orders.index')} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors">
                            <ArrowLeftIcon className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-[28px] font-black text-[#1a202c] tracking-tight">{purchaseOrder.po_number}</h1>
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getStatusColor(purchaseOrder.status)}`}>
                                    {purchaseOrder.status}
                                </span>
                            </div>
                            <p className="text-[14px] font-bold text-gray-500 mt-1">Ordered on {new Date(purchaseOrder.order_date).toLocaleDateString()} by {purchaseOrder.creator?.name}</p>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        {purchaseOrder.status === 'pending' && (
                            <>
                                <button 
                                    onClick={() => handleStatusUpdate('rejected')}
                                    disabled={processing}
                                    className="flex items-center space-x-2 px-6 py-3.5 bg-white border border-red-200 text-red-600 font-bold rounded-xl text-[14px] hover:bg-red-50 transition-colors shadow-sm"
                                >
                                    <XIcon className="w-4 h-4" />
                                    <span>Reject PO</span>
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate('approved')}
                                    disabled={processing}
                                    className="flex items-center space-x-2 px-6 py-3.5 bg-[#4f46e5] shadow-[#4f46e5]/30 shadow-lg hover:bg-indigo-700 text-white font-bold rounded-xl text-[14px] transition-colors"
                                >
                                    <CheckIcon className="w-4 h-4" />
                                    <span>Approve & Send</span>
                                </button>
                            </>
                        )}
                        {purchaseOrder.status === 'approved' && (
                            <button 
                                onClick={() => handleStatusUpdate('received')}
                                disabled={processing}
                                className="flex items-center space-x-2 px-6 py-3.5 bg-emerald-600 shadow-emerald-200 shadow-lg hover:bg-emerald-700 text-white font-bold rounded-xl text-[14px] transition-colors"
                            >
                                <CheckIcon className="w-4 h-4" />
                                <span>Confirm Received</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-6">
                        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                            <h2 className="text-[18px] font-black text-[#1a202c] mb-6">Ordered Items</h2>
                            <div className="w-full">
                                <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-100 text-[10px] font-black text-gray-400 tracking-[0.1em] uppercase">
                                    <div className="col-span-5 pl-2">Product</div>
                                    <div className="col-span-2">Quantity</div>
                                    <div className="col-span-2">Unit Price</div>
                                    <div className="col-span-3 text-right pr-4">Subtotal</div>
                                </div>
                                <div className="divide-y divide-gray-50/80">
                                    {purchaseOrder.items.map((item) => (
                                        <div key={item.id} className="grid grid-cols-12 gap-4 py-5 items-center">
                                            <div className="col-span-5 flex flex-col pl-2">
                                                <span className="text-[14px] font-black text-[#1a202c]">{item.product?.name}</span>
                                                <span className="text-[11px] font-bold text-gray-400">SKU: {item.product?.sku}</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-[14px] font-black text-[#1a202c]">{item.quantity} Units</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-[14px] font-bold text-gray-500">{formatCurrency(item.unit_price)}</span>
                                            </div>
                                            <div className="col-span-3 text-right pr-4">
                                                <span className="text-[14px] font-black text-[#1a202c]">{formatCurrency(item.subtotal)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end mt-8 pt-8 border-t border-gray-100">
                                    <div className="text-right">
                                        <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest block mb-1">Grand Total</span>
                                        <span className="text-[28px] font-black text-[#1a202c]">{formatCurrency(purchaseOrder.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {purchaseOrder.notes && (
                            <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                                <h2 className="text-[14px] font-black text-[#1a202c] mb-4 uppercase tracking-wider">Internal Notes</h2>
                                <p className="text-[14px] font-bold text-gray-500 leading-relaxed">{purchaseOrder.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                            <h2 className="text-[14px] font-black text-[#1a202c] mb-6 uppercase tracking-wider">Supplier Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Company Name</label>
                                    <div className="text-[14px] font-black text-[#1a202c]">{purchaseOrder.supplier?.name}</div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Category</label>
                                    <div className="text-[14px] font-bold text-gray-600">{purchaseOrder.supplier?.category}</div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Contact</label>
                                    <div className="text-[13px] font-bold text-gray-600">{purchaseOrder.supplier?.contact_person}</div>
                                    <div className="text-[12px] font-bold text-indigo-500">{purchaseOrder.supplier?.email}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                            <h2 className="text-[14px] font-black text-[#1a202c] mb-6 uppercase tracking-wider">Logistics Info</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Destination</label>
                                    <div className="text-[14px] font-black text-[#1a202c]">{purchaseOrder.warehouse?.name}</div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Expected Delivery</label>
                                    <div className="text-[14px] font-black text-amber-600">
                                        {purchaseOrder.expected_date ? new Date(purchaseOrder.expected_date).toLocaleDateString() : 'No date set'}
                                    </div>
                                </div>
                                {purchaseOrder.approved_by && (
                                    <div className="pt-4 border-t border-gray-50">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Approved By</label>
                                        <div className="text-[13px] font-black text-indigo-600">{purchaseOrder.approver?.name}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
