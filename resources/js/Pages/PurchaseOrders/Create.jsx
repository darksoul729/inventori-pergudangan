import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useEffect } from 'react';

const ArrowLeftIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const TrashIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export default function Create({ suppliers, warehouses, products, autoPoNumber }) {
    const { data, setData, post, processing, errors } = useForm({
        po_number: autoPoNumber,
        supplier_id: '',
        warehouse_id: '',
        order_date: new Date().toISOString().split('T')[0],
        expected_date: '',
        notes: '',
        items: [
            { product_id: '', quantity: 1, unit_price: 0 }
        ]
    });

    const addItem = () => {
        setData('items', [...data.items, { product_id: '', quantity: 1, unit_price: 0 }]);
    };

    const removeItem = (index) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        setData('items', newItems);
    };

    const calculateGrandTotal = () => {
        return data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('purchase-orders.store'));
    };

    return (
        <DashboardLayout headerSearchPlaceholder="Create purchase order...">
            <Head title="Create Purchase Order" />

            <div className="flex flex-col space-y-6 pb-12 w-full pt-2 min-w-[1000px]">
                <div className="flex items-center space-x-4 mb-4">
                    <Link href={route('purchase-orders.index')} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-[28px] font-black text-[#1a202c] tracking-tight">Create Purchase Order</h1>
                        <p className="text-[14px] font-bold text-gray-500 mt-1">Order stock from your trusted suppliers.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                        <div className="grid grid-cols-3 gap-8 mb-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-black tracking-wider text-gray-500 uppercase mb-2">PO Number</label>
                                    <input 
                                        type="text" 
                                        value={data.po_number} 
                                        onChange={e => setData('po_number', e.target.value)}
                                        className="w-full rounded-xl bg-gray-50 border-gray-200 text-[14px] font-bold focus:ring-[#4f46e5] focus:border-[#4f46e5]" 
                                    />
                                    {errors.po_number && <p className="text-red-500 text-xs mt-1">{errors.po_number}</p>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black tracking-wider text-gray-500 uppercase mb-2">Supplier</label>
                                    <select 
                                        value={data.supplier_id} 
                                        onChange={e => setData('supplier_id', e.target.value)}
                                        className="w-full rounded-xl bg-gray-50 border-gray-200 text-[14px] font-bold focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                                    >
                                        <option value="">Select Supplier</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                    </select>
                                    {errors.supplier_id && <p className="text-red-500 text-xs mt-1">{errors.supplier_id}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-black tracking-wider text-gray-500 uppercase mb-2">Target Warehouse</label>
                                    <select 
                                        value={data.warehouse_id} 
                                        onChange={e => setData('warehouse_id', e.target.value)}
                                        className="w-full rounded-xl bg-gray-50 border-gray-200 text-[14px] font-bold focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                                    >
                                        <option value="">Select Warehouse</option>
                                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                    {errors.warehouse_id && <p className="text-red-500 text-xs mt-1">{errors.warehouse_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black tracking-wider text-gray-500 uppercase mb-2">Order Date</label>
                                    <input 
                                        type="date" 
                                        value={data.order_date} 
                                        onChange={e => setData('order_date', e.target.value)}
                                        className="w-full rounded-xl bg-gray-50 border-gray-200 text-[14px] font-bold focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-black tracking-wider text-gray-500 uppercase mb-2">Expected Delivery Date</label>
                                    <input 
                                        type="date" 
                                        value={data.expected_date} 
                                        onChange={e => setData('expected_date', e.target.value)}
                                        className="w-full rounded-xl bg-gray-50 border-gray-200 text-[14px] font-bold focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                                    />
                                    {errors.expected_date && <p className="text-red-500 text-xs mt-1">{errors.expected_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black tracking-wider text-gray-500 uppercase mb-2">Notes (Optional)</label>
                                    <textarea 
                                        value={data.notes} 
                                        onChange={e => setData('notes', e.target.value)}
                                        className="w-full rounded-xl bg-gray-50 border-gray-200 text-[14px] font-bold focus:ring-[#4f46e5] focus:border-[#4f46e5] h-[42px]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-50 pt-8 mt-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[16px] font-black text-[#1a202c]">Order Items</h3>
                                <button 
                                    type="button" 
                                    onClick={addItem}
                                    className="text-[12px] font-black text-[#4f46e5] hover:text-indigo-700 underline"
                                >
                                    + Add Item Line
                                </button>
                            </div>

                            <div className="space-y-4">
                                {data.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-4 items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                        <div className="col-span-5">
                                            <label className="block text-[9px] font-black tracking-wider text-gray-400 uppercase mb-1">Product</label>
                                            <select 
                                                value={item.product_id} 
                                                onChange={e => updateItem(index, 'product_id', e.target.value)}
                                                className="w-full rounded-xl bg-white border-gray-200 text-[13px] font-bold focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                                            >
                                                <option value="">Select Product</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[9px] font-black tracking-wider text-gray-400 uppercase mb-1">Quantity</label>
                                            <input 
                                                type="number" 
                                                min="1"
                                                value={item.quantity} 
                                                onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                className="w-full rounded-xl bg-white border-gray-200 text-[13px] font-bold focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <label className="block text-[9px] font-black tracking-wider text-gray-400 uppercase mb-1">Unit Price</label>
                                            <input 
                                                type="number" 
                                                min="0"
                                                value={item.unit_price} 
                                                onChange={e => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                className="w-full rounded-xl bg-white border-gray-200 text-[13px] font-bold focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="block text-[9px] font-black tracking-wider text-gray-400 uppercase mb-1 text-center">Subtotal</label>
                                            <div className="text-[13px] font-black text-[#1a202c] pt-2 text-center">
                                                {(item.quantity * item.unit_price).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            {data.items.length > 1 && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeItem(index)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {errors.items && <p className="text-red-500 text-xs mt-1">{errors.items}</p>}
                                {errors['items.0.product_id'] && <p className="text-red-500 text-xs mt-1">Please ensure all items have a product selected.</p>}
                            </div>

                            <div className="flex justify-end mt-12 bg-gray-50 p-6 rounded-[20px]">
                                <div className="text-right">
                                    <div className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">Estimated Grand Total</div>
                                    <div className="text-[32px] font-black text-[#1a202c]">
                                        Rp {calculateGrandTotal().toLocaleString('id-ID')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Link href={route('purchase-orders.index')} className="px-8 py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold rounded-xl text-[14px] transition-colors">
                            Discard Order
                        </Link>
                        <button 
                            type="submit" 
                            disabled={processing}
                            className="px-8 py-3.5 bg-[#4f46e5] shadow-[#4f46e5]/30 shadow-lg hover:bg-indigo-700 text-white font-bold rounded-xl text-[14px] transition-colors disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Finalize & Send PO'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
