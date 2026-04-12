import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

const PlusIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const EyeIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

export default function Index({ purchaseOrders = [] }) {
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
        <DashboardLayout headerSearchPlaceholder="Search purchase orders...">
            <Head title="Purchase Orders" />

            <div className="flex flex-col space-y-6 pb-12 w-full pt-2 min-w-[1000px] overflow-x-auto">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-[28px] font-black text-[#1a202c] tracking-tight">Purchase Orders</h1>
                        <p className="text-[14px] font-bold text-gray-500 mt-1">Manage stock procurement from multiple suppliers.</p>
                    </div>
                    <Link href={route('purchase-orders.create')} className="flex items-center space-x-2 px-6 py-3.5 bg-[#4f46e5] shadow-[#4f46e5]/30 shadow-lg hover:bg-indigo-700 text-white font-bold rounded-xl text-[14px] transition-colors">
                        <PlusIcon className="w-4 h-4" />
                        <span>Create New PO</span>
                    </Link>
                </div>

                <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                    <div className="w-full">
                        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-100 text-[10px] font-black text-gray-400 tracking-[0.1em] uppercase">
                            <div className="col-span-2 pl-2">PO Number</div>
                            <div className="col-span-3">Supplier</div>
                            <div className="col-span-2">Date</div>
                            <div className="col-span-2">Amount</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-1 text-right pr-4">Action</div>
                        </div>

                        <div className="divide-y divide-gray-50/80">
                            {purchaseOrders.length > 0 ? (
                                purchaseOrders.map((po) => (
                                    <div key={po.id} className="grid grid-cols-12 gap-4 py-5 items-center hover:bg-gray-50/50 transition-colors">
                                        <div className="col-span-2 flex items-center space-x-4 pl-2">
                                            <div className="text-[13px] font-black text-[#1a202c]">{po.po_number}</div>
                                        </div>
                                        <div className="col-span-3">
                                            <div className="text-[14px] font-black text-[#1a202c]">{po.supplier?.name}</div>
                                            <div className="text-[11px] font-bold text-gray-400 capitalize">{po.supplier?.category}</div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="text-[13px] font-bold text-gray-500">{new Date(po.order_date).toLocaleDateString()}</div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="text-[14px] font-black text-[#1a202c]">{formatCurrency(po.total_amount)}</div>
                                        </div>
                                        <div className="col-span-2 flex items-center">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getStatusColor(po.status)}`}>
                                                {po.status}
                                            </span>
                                        </div>
                                        <div className="col-span-1 flex justify-end pr-4">
                                            <Link href={route('purchase-orders.show', po.id)} className="w-8 h-8 flex items-center justify-center text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors">
                                                <EyeIcon className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-[14px] font-bold text-gray-400">
                                    No purchase orders found. Start by creating the first one!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
