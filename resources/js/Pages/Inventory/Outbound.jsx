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

const ScanIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
);

const CalendarIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const WarningIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const LocationPinIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const SparkleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

export default function Outbound({ products, operationalWarehouse }) {
    const outboundForm = useForm({
        product_id: '',
        warehouse_id: operationalWarehouse?.id ? String(operationalWarehouse.id) : '',
        quantity: 1,
        destination: '',
        notes: '',
    });

    const selectedProductOutbound = products.find(p => p.id == outboundForm.data.product_id);
    const availableStock = selectedProductOutbound 
        ? selectedProductOutbound.current_stock
        : 0;

    const handleOutbound = (e) => {
        e.preventDefault();
        outboundForm.post(route('inventory.outbound'));
    };

    return (
        <DashboardLayout>
            <Head title="Inventaris - Barang Keluar" />

            <div className="flex flex-row gap-6 pb-12 w-full pt-2 min-w-[900px] overflow-x-auto transition-all animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Left Column - Main Form */}
                <div className="flex-1 bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                    <form onSubmit={handleOutbound}>
                        <div className="flex items-start space-x-4 mb-8">
                            <div className="w-[42px] h-[42px] rounded-xl bg-[#eef2ff] flex items-center justify-center text-[#4f46e5] flex-shrink-0">
                                <RegistryIcon2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-[18px] font-black text-[#1a202c]">Registri Barang Keluar</h2>
                                <p className="text-[13px] font-semibold text-gray-400 mt-1">Lengkapi detail di bawah untuk mengotorisasi pengeluaran stok.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Row 1 */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between mb-2">
                                        <label className="text-[10px] font-extrabold text-gray-500 tracking-wider uppercase">PILIH PRODUK</label>
                                        <button type="button" className="text-[11px] font-extrabold text-[#4f46e5] flex items-center space-x-1 hover:text-indigo-700 uppercase tracking-wide">
                                            <ScanIcon className="w-3.5 h-3.5" />
                                            <span>PINDAI</span>
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <select 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-[#1a202c] shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] appearance-none"
                                            value={outboundForm.data.product_id}
                                            onChange={e => outboundForm.setData('product_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Pilih Produk</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}
                                        </select>
                                        <ChevronDownIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                    {outboundForm.errors.product_id && <div className="text-red-500 text-xs mt-1">{outboundForm.errors.product_id}</div>}
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">GUDANG ASAL</label>
                                    <div className="bg-[#f8f9fb] border border-transparent block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
                                        {operationalWarehouse?.name || 'Warehouse Utama'}
                                    </div>
                                    {outboundForm.errors.warehouse_id && <div className="text-red-500 text-xs mt-1">{outboundForm.errors.warehouse_id}</div>}
                                </div>
                                <div className="flex-[1.2]">
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">TUJUAN / ALASAN</label>
                                    <input 
                                        type="text" 
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                        placeholder="misal: Penjualan ke Pelanggan X"
                                        value={outboundForm.data.destination}
                                        onChange={e => outboundForm.setData('destination', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">MITRA EKSPEDISI</label>
                                    <input 
                                        type="text" 
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                        defaultValue="Aether Logistics Fl"
                                    />
                                </div>
                                <div className="flex-[0.8]">
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">NAMA PENGEMUDI</label>
                                    <input 
                                        type="text" 
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-semibold text-gray-500 placeholder-gray-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                        placeholder="Nama lengkap"
                                    />
                                </div>
                                <div className="flex-[0.8]">
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">TANGGAL KEBERANGKATAN</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full pl-4 pr-10 py-3 sm:text-[14px] rounded-xl font-semibold text-gray-500 placeholder-gray-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                            placeholder="dd/mm/yyyy"
                                        />
                                        <CalendarIcon className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Row 4: Quantity */}
                            <div className="bg-[#f8f9fb] rounded-xl p-4 flex items-center justify-between border border-gray-50">
                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-0.5">KUANTITAS DIPINDAHKAN</label>
                                    <span className="text-[12px] font-medium text-gray-400">
                                        {outboundForm.data.product_id && outboundForm.data.warehouse_id 
                                            ? `Tersedia: ${availableStock} unit` 
                                            : "Pilih produk"}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-6 bg-white shadow-sm border border-gray-100 rounded-[10px] px-4 py-2">
                                    <button 
                                        type="button"
                                        onClick={() => outboundForm.setData('quantity', Math.max(1, outboundForm.data.quantity - 1))}
                                        className="text-[#4f46e5] hover:bg-gray-50 p-1 rounded font-black text-lg leading-none transition-colors"
                                    >−</button>
                                    <span className="font-black text-[18px] text-[#1a202c] min-w-[3ch] text-center">{outboundForm.data.quantity}</span>
                                    <button 
                                        type="button"
                                        onClick={() => outboundForm.setData('quantity', Math.min(availableStock, outboundForm.data.quantity + 1))}
                                        className="text-[#4f46e5] hover:bg-gray-50 p-1 rounded font-black text-lg leading-none transition-colors"
                                        disabled={outboundForm.data.quantity >= availableStock && availableStock > 0}
                                    >+</button>
                                </div>
                            </div>
                            {outboundForm.errors.quantity && <div className="text-red-500 text-xs mt-1 font-bold">{outboundForm.errors.quantity}</div>}

                            {/* Row 5: Notes */}
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">CATATAN / DESKRIPSI</label>
                                <textarea 
                                    rows="3"
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-medium text-gray-600 placeholder-gray-400 resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                    placeholder="Instruksi pengiriman tambahan atau laporan kerusakan..."
                                    value={outboundForm.data.notes}
                                    onChange={e => outboundForm.setData('notes', e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        {/* Footer buttons with select UI artifacts */}
                        <div className="mt-8 pt-6 flex justify-end gap-3 relative border-t border-gray-50">
                            <div className="relative z-10 group cursor-pointer inline-block">
                                <Link 
                                    href={route('inventory')}
                                    className="px-6 py-3 border border-gray-200 text-[#4f46e5] bg-white font-bold rounded-xl text-[14px] hover:bg-gray-50 transition-colors flex items-center justify-center w-full sm:w-auto h-full m-[1px]"
                                >
                                    Batal
                                </Link>
                            </div>
                            <div className="relative z-10 group cursor-pointer inline-block">
                                <button 
                                    type="submit"
                                    disabled={outboundForm.processing}
                                    className="px-8 py-3 bg-[#4f46e5] text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.3)] text-[14px] hover:bg-indigo-700 transition-all flex items-center space-x-2 border-2 border-transparent"
                                >
                                    <span>{outboundForm.processing ? 'Menyimpan...' : 'Catat Pergerakan'}</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Right Column - Status & Context */}
                <div className="w-[340px] flex-shrink-0 flex flex-col space-y-6">
                    {/* Inventory Context Card */}
                    <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[11px] font-extrabold text-gray-400 tracking-[0.15em] uppercase">Konteks Inventaris</h3>
                            <RegistryIcon2 className="w-5 h-5 text-gray-300" />
                        </div>

                        {/* Total Stock */}
                        <div className="bg-[#f8f9fb] rounded-[16px] p-5 mb-4 relative overflow-hidden border border-gray-100">
                            <div className="absolute left-0 top-4 bottom-4 w-[4px] bg-[#4f46e5] rounded-r-md"></div>
                            <div className="pl-3">
                                <div className="text-[9px] font-extrabold text-[#4f46e5] tracking-widest uppercase mb-1">Total Stok Tersedia Gudang Ini</div>
                                <div className="flex items-baseline space-x-1">
                                    <span className="text-[34px] font-black text-[#1a202c] leading-none">{availableStock}</span>
                                    <span className="text-[13px] font-bold text-gray-500">unit</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-gray-50 pt-5">
                            <div className="flex justify-between items-center bg-white px-1">
                                <div className="flex items-center space-x-2">
                                    <WarningIcon className="w-4 h-4 text-amber-500" />
                                    <span className="text-[12px] font-bold text-[#1a202c]">Batas Pemesanan Ulang</span>
                                </div>
                                <span className="text-[12px] font-bold text-gray-500">{selectedProductOutbound?.minimum_stock || 0} unit</span>
                            </div>
                            <div className="flex justify-between items-center bg-white px-1">
                                <div className="flex items-center space-x-2">
                                    <LocationPinIcon className="w-4 h-4 text-indigo-400" />
                                    <span className="text-[12px] font-bold text-[#1a202c]">SKU Rak Aktif</span>
                                </div>
                                <span className="text-[12px] font-bold text-gray-500">{selectedProductOutbound?.sku || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* System Tip Card */}
                    <div className="bg-gradient-to-br from-[#4338ca] to-[#312e81] rounded-[20px] p-6 shadow-xl relative overflow-hidden text-white shadow-[0_10px_25px_rgba(67,56,202,0.3)]">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIvPjwvc3ZnPg==')] opacity-50"></div>
                        <div className="relative z-10">
                            <div className="flex items-center space-x-2 mb-3">
                                <SparkleIcon className="w-4 h-4 text-indigo-200" />
                                <span className="text-[10px] font-black text-indigo-200 tracking-widest uppercase shadow-sm">Kiat Sistem</span>
                            </div>
                            <p className="text-[13px] font-bold text-indigo-50 leading-relaxed mb-4">
                                Pastikan kendaraan logistik yang disiapkan memadai untuk menampung volume stok yang dikeluarkan hari ini.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
