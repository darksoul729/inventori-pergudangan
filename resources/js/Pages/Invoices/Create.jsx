import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ customers = [], autoNumber }) {
    const { data, setData, post, processing, errors } = useForm({
        invoice_number: autoNumber,
        customer_id: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        notes: '',
        items: [{ description: '', quantity: 1, unit_price: 0 }],
    });

    const addItem = () => setData('items', [...data.items, { description: '', quantity: 1, unit_price: 0 }]);
    const removeItem = (i) => setData('items', data.items.filter((_, idx) => idx !== i));
    const updateItem = (i, key, value) => {
        const items = [...data.items];
        items[i][key] = value;
        setData('items', items);
    };

    const total = data.items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)), 0);

    return (
        <DashboardLayout>
            <Head title="Buat Tagihan" />
            <div className="space-y-6 pb-12">
                <div>
                    <h1 className="text-[28px] font-black text-[#28106F]">Buat Tagihan</h1>
                    <p className="text-sm font-semibold text-gray-500 mt-1">Isi data sederhana lalu kirim tagihan ke pelanggan.</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); post(route('invoices.store')); }} className="space-y-5">
                    <div className="bg-white border border-[#EDE8FC] rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500">Nomor Tagihan</label>
                            <input value={data.invoice_number} onChange={(e) => setData('invoice_number', e.target.value)} className="w-full mt-1 rounded-xl border-gray-200" />
                            {errors.invoice_number && <p className="text-xs text-rose-600 mt-1">{errors.invoice_number}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Pelanggan</label>
                            <select value={data.customer_id} onChange={(e) => setData('customer_id', e.target.value)} className="w-full mt-1 rounded-xl border-gray-200">
                                <option value="">Pilih Pelanggan</option>
                                {customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                            </select>
                            {errors.customer_id && <p className="text-xs text-rose-600 mt-1">{errors.customer_id}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Tanggal Tagihan</label>
                            <input type="date" value={data.invoice_date} onChange={(e) => setData('invoice_date', e.target.value)} className="w-full mt-1 rounded-xl border-gray-200" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Jatuh Tempo</label>
                            <input type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} className="w-full mt-1 rounded-xl border-gray-200" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-gray-500">Catatan</label>
                            <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} className="w-full mt-1 rounded-xl border-gray-200" />
                        </div>
                    </div>

                    <div className="bg-white border border-[#EDE8FC] rounded-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-black text-[#28106F]">Item Tagihan</h2>
                            <button type="button" onClick={addItem} className="text-sm font-bold text-indigo-600">+ Tambah Item</button>
                        </div>

                        {data.items.map((item, i) => (
                            <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                <input className="md:col-span-5 rounded-xl border-gray-200" placeholder="Nama barang/jasa" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} />
                                <input type="number" min="1" className="md:col-span-2 rounded-xl border-gray-200" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value) || 1)} />
                                <input type="number" min="0" className="md:col-span-3 rounded-xl border-gray-200" value={item.unit_price} onChange={(e) => updateItem(i, 'unit_price', Number(e.target.value) || 0)} />
                                <div className="md:col-span-1 text-sm font-bold flex items-center">Rp {((item.quantity || 0) * (item.unit_price || 0)).toLocaleString('id-ID')}</div>
                                <button type="button" onClick={() => removeItem(i)} className="md:col-span-1 text-sm text-rose-600 font-bold">Hapus</button>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-lg font-black">Total: Rp {total.toLocaleString('id-ID')}</div>
                        <div className="flex gap-3">
                            <Link href={route('invoices.index')} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold">Batal</Link>
                            <button disabled={processing} className="px-4 py-2 rounded-xl bg-[#5932C9] text-white text-sm font-bold">{processing ? 'Menyimpan...' : 'Simpan Tagihan'}</button>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
