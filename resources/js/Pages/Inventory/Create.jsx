import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import React from 'react';

const ChevronDownIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const RegistryIcon2 = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
);

const GridIcon2 = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="4" y="4" width="6" height="6" rx="1.5" strokeWidth={2} />
        <rect x="14" y="4" width="6" height="6" rx="1.5" strokeWidth={2} />
        <rect x="4" y="14" width="6" height="6" rx="1.5" strokeWidth={2} />
        <rect x="14" y="14" width="6" height="6" rx="1.5" strokeWidth={2} />
    </svg>
);

export default function Create({ categories, units, suppliers, warehouses, operationalWarehouse }) {
    const addProductForm = useForm({
        sku: '',
        name: '',
        category_id: '',
        unit_id: '',
        default_supplier_id: '',
        initial_stock: 0,
        purchase_price: 0,
        minimum_stock: 10,
        warehouse_id: operationalWarehouse?.id ? String(operationalWarehouse.id) : '',
        rack_id: '',
        description: '',
        image: null,
    });

    const handleAddProduct = (e) => {
        e.preventDefault();
        addProductForm.post(route('inventory.store'));
    };

    return (
        <DashboardLayout>
            <Head title="Inventaris - Tambah Barang" />

            <div className="flex flex-row gap-6 pb-12 w-full pt-2 min-w-[900px] overflow-x-auto transition-all animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex-1 bg-white rounded-[24px] p-10 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7] max-w-4xl mx-auto">
                    <form onSubmit={handleAddProduct}>
                        <div className="mb-10">
                            <h2 className="text-[26px] font-black text-[#1a202c]">Tambah Item Inventaris Baru</h2>
                            <p className="text-[14px] font-bold text-gray-500 mt-1">Daftarkan produk baru ke dalam jaringan Aether Logistix.</p>
                        </div>

                        {Object.keys(addProductForm.errors).length > 0 && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                                <span className="text-red-600 font-bold text-sm">Harap perbaiki kesalahan yang disorot di bawah ini.</span>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Row 1: Name */}
                            <div className="grid grid-cols-1 gap-8">
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">NAMA PRODUK</label>
                                    <input 
                                        type="text" 
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-5 py-3.5 sm:text-[14px] rounded-xl font-bold text-[#1a202c] shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] placeholder-gray-400" 
                                        placeholder="misal: AX900 Sensor Module"
                                        value={addProductForm.data.name}
                                        onChange={e => addProductForm.setData('name', e.target.value)}
                                        required
                                    />
                                    {addProductForm.errors.name && <div className="text-red-500 text-xs mt-1">{addProductForm.errors.name}</div>}
                                </div>
                            </div>

                            {/* Row 2: SKU & Category */}
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">SKU / BARCODE</label>
                                    <input 
                                        type="text" 
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-5 py-3.5 sm:text-[14px] rounded-xl font-bold text-[#1a202c] shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] placeholder-gray-400" 
                                        placeholder="misal: AX-2045 Quantum Unit"
                                        value={addProductForm.data.sku}
                                        onChange={e => addProductForm.setData('sku', e.target.value)}
                                        required
                                    />
                                    {addProductForm.errors.sku && <div className="text-red-500 text-xs mt-1">{addProductForm.errors.sku}</div>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">KATEGORI</label>
                                    <div className="relative">
                                        <select 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-5 py-3.5 sm:text-[14px] rounded-xl font-bold text-gray-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] appearance-none cursor-pointer"
                                            value={addProductForm.data.category_id}
                                            onChange={e => addProductForm.setData('category_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Pilih Kategori</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <ChevronDownIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                    {addProductForm.errors.category_id && <div className="text-red-500 text-xs mt-1">{addProductForm.errors.category_id}</div>}
                                </div>
                            </div>

                            {/* Row 3: Unit & Supplier */}
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">SATUAN UNIT</label>
                                    <div className="relative">
                                        <select 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-5 py-3.5 sm:text-[14px] rounded-xl font-bold text-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] appearance-none cursor-pointer"
                                            value={addProductForm.data.unit_id}
                                            onChange={e => addProductForm.setData('unit_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Pilih Satuan</option>
                                            {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                        <ChevronDownIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                    {addProductForm.errors.unit_id && <div className="text-red-500 text-xs mt-1">{addProductForm.errors.unit_id}</div>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">PEMASOK</label>
                                    <div className="relative">
                                        <select 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-5 py-3.5 sm:text-[14px] rounded-xl font-bold text-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] appearance-none cursor-pointer"
                                            value={addProductForm.data.default_supplier_id}
                                            onChange={e => addProductForm.setData('default_supplier_id', e.target.value)}
                                        >
                                            <option value="">Pilih Pemasok</option>
                                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                        <ChevronDownIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Row 4: Stocks & Limits */}
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">STOK AWAL</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full pl-5 pr-12 py-3.5 sm:text-[14px] rounded-xl font-black text-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                            value={addProductForm.data.initial_stock}
                                            onChange={e => addProductForm.setData('initial_stock', e.target.value)}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                            <RegistryIcon2 className="w-5 h-5" />
                                        </div>
                                    </div>
                                    {addProductForm.errors.initial_stock && <div className="text-red-500 text-xs mt-1">{addProductForm.errors.initial_stock}</div>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">HARGA SATUAN</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full pl-5 pr-12 py-3.5 sm:text-[14px] rounded-xl font-black text-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                            value={addProductForm.data.purchase_price}
                                            onChange={e => addProductForm.setData('purchase_price', e.target.value)}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        </div>
                                    </div>
                                    {addProductForm.errors.purchase_price && <div className="text-red-500 text-xs mt-1">{addProductForm.errors.purchase_price}</div>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">STOK MINIMUM</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full pl-5 pr-12 py-3.5 sm:text-[14px] rounded-xl font-black text-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                            value={addProductForm.data.minimum_stock}
                                            onChange={e => addProductForm.setData('minimum_stock', e.target.value)}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Row 5: Warehouse & Rack */}
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">LOKASI GUDANG</label>
                                    <div className="bg-[#f8f9fb] border border-transparent block w-full pl-5 pr-12 py-3.5 sm:text-[14px] rounded-xl font-bold text-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
                                        {operationalWarehouse?.name || 'Warehouse Utama'}
                                    </div>
                                    {addProductForm.errors.warehouse_id && <div className="text-red-500 text-xs mt-1">{addProductForm.errors.warehouse_id}</div>}
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">LOKASI RAK</label>
                                    <div className="relative">
                                        <select 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full pl-5 pr-12 py-3.5 sm:text-[14px] rounded-xl font-bold text-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] appearance-none cursor-pointer"
                                            value={addProductForm.data.rack_id}
                                            onChange={e => addProductForm.setData('rack_id', e.target.value)}
                                            required={addProductForm.data.initial_stock > 0}
                                            disabled={!addProductForm.data.warehouse_id}
                                        >
                                            <option value="">Pilih Rak</option>
                                            {warehouses.find(w => w.id == addProductForm.data.warehouse_id)?.zones.flatMap(z => z.racks).map(r => (
                                                <option key={r.id} value={r.id}>{r.code} - {r.name}</option>
                                            ))}
                                        </select>
                                        <GridIcon2 className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                    {addProductForm.errors.rack_id && <div className="text-red-500 text-xs mt-1">{addProductForm.errors.rack_id}</div>}
                                </div>
                            </div>

                            {/* Row 6: Description */}
                            <div>
                                <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">DESKRIPSI ITEM (OPSIONAL)</label>
                                <textarea 
                                    rows="4"
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-5 py-4 sm:text-[14px] rounded-xl font-bold text-gray-600 placeholder-gray-400 resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                    placeholder="Jelaskan spesifikasi, instruksi penanganan, atau kebutuhan penyimpanan..."
                                    value={addProductForm.data.description}
                                    onChange={e => addProductForm.setData('description', e.target.value)}
                                ></textarea>
                            </div>

                            {/* Row 7: Image */}
                            <div>
                                <label className="block text-[11px] font-black text-gray-500 tracking-[0.1em] uppercase mb-2">GAMBAR PRODUK</label>
                                <div 
                                    onClick={() => document.getElementById('product-image-input').click()}
                                    className="border-[2px] border-dashed border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-colors p-10 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
                                >
                                    <input 
                                        id="product-image-input"
                                        type="file" 
                                        className="hidden" 
                                        onChange={e => addProductForm.setData('image', e.target.files[0])}
                                        accept="image/*"
                                    />
                                    {addProductForm.data.image ? (
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden mb-2 shadow-md">
                                                <img src={URL.createObjectURL(addProductForm.data.image)} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-[12px] font-bold text-indigo-600">{addProductForm.data.image.name}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-[46px] h-[46px] rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mb-3">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            </div>
                                            <span className="text-[13px] font-bold text-gray-500">Klik untuk mengunggah gambar produk</span>
                                        </>
                                    )}
                                </div>
                                {addProductForm.errors.image && <div className="text-red-500 text-xs mt-1">{addProductForm.errors.image}</div>}
                            </div>
                        </div>

                        {/* Footer buttons */}
                        <div className="mt-10 pt-6 flex justify-end gap-4 border-t border-gray-100">
                            <Link 
                                href={route('inventory')}
                                className="px-8 py-3 bg-white border border-[#edf2f7] hover:bg-gray-50 text-gray-500 font-bold rounded-xl text-[14px] transition-colors"
                            >
                                Batal
                            </Link>
                            <button 
                                type="submit"
                                disabled={addProductForm.processing}
                                className="px-8 py-3 bg-[#4f46e5] shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:bg-indigo-700 text-white font-bold rounded-xl text-[14px] transition-colors flex items-center space-x-2"
                            >
                                {addProductForm.processing ? 'Menyimpan...' : 'Tambah Item'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
