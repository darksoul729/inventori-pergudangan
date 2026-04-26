import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';

const ArrowRightIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
);

const BoxIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

const ClipboardIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
);

const PutawayIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
);

const TransferIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
);

export default function RackAllocation({ warehouse, racks = [], unplacedProducts = [], recentTransfers = [], can_create = false, can_approve = false, status }) {
    const { auth } = usePage().props;
    const currentUserId = Number(auth?.user?.id);
    const [activeTab, setActiveTab] = useState('transfer');

    const transferForm = useForm({
        from_rack_id: '',
        to_rack_id: '',
        product_id: '',
        quantity: 1,
        notes: '',
        type: 'transfer',
    });

    const putawayForm = useForm({
        from_rack_id: '',
        to_rack_id: '',
        product_id: '',
        quantity: 1,
        notes: '',
        type: 'putaway',
    });

    const fromRack = useMemo(
        () => racks.find((rack) => String(rack.id) === String(transferForm.data.from_rack_id)),
        [racks, transferForm.data.from_rack_id],
    );

    const selectedStock = useMemo(
        () => fromRack?.stocks?.find((stock) => String(stock.product_id) === String(transferForm.data.product_id)),
        [fromRack, transferForm.data.product_id],
    );

    const toRack = useMemo(
        () => racks.find((rack) => String(rack.id) === String(transferForm.data.to_rack_id)),
        [racks, transferForm.data.to_rack_id],
    );

    const putawayProduct = useMemo(
        () => unplacedProducts.find((p) => String(p.id) === String(putawayForm.data.product_id)),
        [unplacedProducts, putawayForm.data.product_id],
    );

    const putawayToRack = useMemo(
        () => racks.find((rack) => String(rack.id) === String(putawayForm.data.to_rack_id)),
        [racks, putawayForm.data.to_rack_id],
    );

    const availableQuantity = selectedStock?.available_quantity ?? 0;
    const destinationCapacity = toRack?.available_capacity ?? 0;

    const submitTransfer = (event) => {
        event.preventDefault();
        transferForm.post(route('rack.allocation.transfers.store'), {
            preserveScroll: true,
            onSuccess: () => transferForm.reset('product_id', 'quantity', 'notes'),
        });
    };

    const submitPutaway = (event) => {
        event.preventDefault();
        putawayForm.post(route('rack.allocation.transfers.store'), {
            preserveScroll: true,
            onSuccess: () => putawayForm.reset('product_id', 'quantity', 'notes'),
        });
    };

    return (
        <DashboardLayout hideSearch={true}>
            <Head title="Rack Allocation" />

            <div className="pb-12">
                <div className="flex flex-col gap-2 mb-7">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/warehouse" className="text-gray-400 hover:text-indigo-600 font-bold transition-colors">Gudang</Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-600 font-bold">Rack Allocation</span>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                        <div>
                            <h1 className="text-[28px] font-black text-[#28106F] tracking-tight">Rack Allocation</h1>
                            <p className="text-[13px] font-semibold text-gray-500 mt-1">
                                {warehouse?.name || 'Warehouse utama'}{warehouse?.location ? `, ${warehouse.location}` : ''} — tempatkan produk ke rack atau pindahkan antar rack.
                            </p>
                        </div>
                        {status && (
                            <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl px-4 py-3 text-[13px] font-bold">
                                {status}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab('transfer')}
                        className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[12px] font-black uppercase tracking-[0.12em] transition ${activeTab === 'transfer' ? 'bg-[#5932C9] text-white shadow-[0_4px_14px_rgba(89,50,201,0.3)]' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        <TransferIcon className="w-4 h-4" />
                        Transfer Rack
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('putaway')}
                        className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[12px] font-black uppercase tracking-[0.12em] transition ${activeTab === 'putaway' ? 'bg-[#0f766e] text-white shadow-[0_4px_14px_rgba(15,118,110,0.3)]' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        <PutawayIcon className="w-4 h-4" />
                        Put-away
                        {unplacedProducts.length > 0 && (
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${activeTab === 'putaway' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>
                                {unplacedProducts.length}
                            </span>
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Main Form Area */}
                    <div className="col-span-12 xl:col-span-8">
                        {/* Transfer Tab */}
                        {activeTab === 'transfer' && (
                        can_create ? (
                        <form onSubmit={submitTransfer} className="bg-white rounded-[22px] p-7 border border-[#EDE8FC] shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center gap-3 mb-7">
                                <div className="w-11 h-11 rounded-xl bg-[#eef2ff] text-[#5932C9] flex items-center justify-center">
                                    <TransferIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-[18px] font-black text-[#28106F]">Transfer Antar Rack</h2>
                                    <p className="text-[12px] font-semibold text-gray-400">Pindahkan stok dari rack asal ke rack tujuan. Total stok warehouse tetap.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start">
                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">Rack Asal</label>
                                    <select
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9] block w-full px-4 py-3 rounded-xl font-bold text-[#28106F]"
                                        value={transferForm.data.from_rack_id}
                                        onChange={(event) => transferForm.setData({
                                            ...transferForm.data,
                                            from_rack_id: event.target.value,
                                            product_id: '',
                                            quantity: 1,
                                        })}
                                        required
                                    >
                                        <option value="">Pilih rack asal</option>
                                        {racks.map((rack) => (
                                            <option key={rack.id} value={rack.id}>
                                                {rack.code} - {rack.name} ({rack.used}/{rack.capacity})
                                            </option>
                                        ))}
                                    </select>
                                    {transferForm.errors.from_rack_id && <div className="text-red-500 text-xs font-bold mt-2">{transferForm.errors.from_rack_id}</div>}
                                </div>

                                <div className="hidden lg:flex items-center justify-center pt-9">
                                    <div className="w-10 h-10 rounded-full bg-[#f8f9fb] border border-gray-100 flex items-center justify-center text-[#5932C9]">
                                        <ArrowRightIcon className="w-5 h-5" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">Rack Tujuan</label>
                                    <select
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9] block w-full px-4 py-3 rounded-xl font-bold text-[#28106F]"
                                        value={transferForm.data.to_rack_id}
                                        onChange={(event) => transferForm.setData('to_rack_id', event.target.value)}
                                        required
                                    >
                                        <option value="">Pilih rack tujuan</option>
                                        {racks
                                            .filter((rack) => String(rack.id) !== String(transferForm.data.from_rack_id))
                                            .map((rack) => (
                                                <option key={rack.id} value={rack.id}>
                                                    {rack.code} - {rack.name} ({rack.available_capacity} kosong)
                                                </option>
                                            ))}
                                    </select>
                                    {transferForm.errors.to_rack_id && <div className="text-red-500 text-xs font-bold mt-2">{transferForm.errors.to_rack_id}</div>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                                <div className="lg:col-span-2">
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">Produk di Rack Asal</label>
                                    <select
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9] block w-full px-4 py-3 rounded-xl font-bold text-[#28106F]"
                                        value={transferForm.data.product_id}
                                        onChange={(event) => transferForm.setData('product_id', event.target.value)}
                                        required
                                        disabled={!fromRack}
                                    >
                                        <option value="">{fromRack ? 'Pilih produk' : 'Pilih rack asal dulu'}</option>
                                        {fromRack?.stocks?.map((stock) => (
                                            <option key={stock.product_id} value={stock.product_id}>
                                                {stock.sku} - {stock.name} ({stock.available_quantity} tersedia)
                                            </option>
                                        ))}
                                    </select>
                                    {transferForm.errors.product_id && <div className="text-red-500 text-xs font-bold mt-2">{transferForm.errors.product_id}</div>}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">Kuantitas</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={availableQuantity || undefined}
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9] block w-full px-4 py-3 rounded-xl font-black text-[#28106F]"
                                        value={transferForm.data.quantity}
                                        onChange={(event) => transferForm.setData('quantity', event.target.value)}
                                        required
                                    />
                                    {transferForm.errors.quantity && <div className="text-red-500 text-xs font-bold mt-2">{transferForm.errors.quantity}</div>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                                <div className="bg-[#f8f9fb] rounded-xl px-4 py-3 border border-gray-100">
                                    <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Stok tersedia</div>
                                    <div className="text-[24px] font-black text-[#28106F] mt-1">{availableQuantity}</div>
                                </div>
                                <div className="bg-[#f8f9fb] rounded-xl px-4 py-3 border border-gray-100">
                                    <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Kapasitas tujuan</div>
                                    <div className="text-[24px] font-black text-[#28106F] mt-1">{destinationCapacity}</div>
                                </div>
                                <div className="bg-[#f8f9fb] rounded-xl px-4 py-3 border border-gray-100">
                                    <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Total warehouse</div>
                                    <div className="text-[24px] font-black text-[#28106F] mt-1">Tetap</div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">Catatan Transfer</label>
                                <textarea
                                    rows="3"
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9] block w-full px-4 py-3 rounded-xl font-medium text-gray-600 resize-none"
                                    placeholder="Contoh: redistribusi stok high-pick, relokasi karena kapasitas rack, atau balancing zona."
                                    value={transferForm.data.notes}
                                    onChange={(event) => transferForm.setData('notes', event.target.value)}
                                />
                            </div>

                            <div className="mt-7 pt-6 border-t border-gray-50 flex justify-end gap-3">
                                <Link href="/warehouse" className="px-6 py-3 border border-gray-200 text-[#5932C9] bg-white font-bold rounded-xl text-[14px] hover:bg-gray-50 transition-colors">
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={transferForm.processing}
                                    className="px-7 py-3 bg-[#5932C9] text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(89,50,201,0.3)] text-[14px] hover:bg-indigo-700 transition-all disabled:opacity-60"
                                >
                                    {transferForm.processing ? 'Memproses...' : 'Konfirmasi Transfer'}
                                </button>
                            </div>
                        </form>
                        ) : (
                        <div className="bg-white rounded-[22px] p-7 border border-[#EDE8FC] shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-11 h-11 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center">
                                    <TransferIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-[18px] font-black text-[#28106F]">Transfer Antar Rack</h2>
                                    <p className="text-[12px] font-semibold text-gray-400">Anda tidak memiliki izin untuk membuat transfer rack.</p>
                                </div>
                            </div>
                        </div>
                        )
                        )}

                        {/* Put-away Tab */}
                        {activeTab === 'putaway' && (
                        <form onSubmit={submitPutaway} className="bg-white rounded-[22px] p-7 border border-[#EDE8FC] shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center gap-3 mb-7">
                                <div className="w-11 h-11 rounded-xl bg-teal-50 text-[#0f766e] flex items-center justify-center">
                                    <PutawayIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-[18px] font-black text-[#28106F]">Put-away ke Rack</h2>
                                    <p className="text-[12px] font-semibold text-gray-400">Tempatkan produk yang belum masuk rack ke rack tujuan. Stok warehouse tidak berubah.</p>
                                </div>
                            </div>

                            {unplacedProducts.length === 0 ? (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-8 text-center">
                                    <div className="text-[14px] font-black text-emerald-700">Semua produk sudah ditempatkan di rack</div>
                                    <div className="text-[12px] font-semibold text-emerald-600 mt-1">Tidak ada produk yang perlu di-put-away.</div>
                                </div>
                            ) : (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">Produk Belum Di-rack</label>
                                        <select
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] block w-full px-4 py-3 rounded-xl font-bold text-[#28106F]"
                                            value={putawayForm.data.product_id}
                                            onChange={(event) => putawayForm.setData({ ...putawayForm.data, product_id: event.target.value, quantity: 1 })}
                                            required
                                        >
                                            <option value="">Pilih produk</option>
                                            {unplacedProducts.map((product) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.sku} - {product.name} ({product.unplaced_stock} {product.unit} belum di-rack)
                                                </option>
                                            ))}
                                        </select>
                                        {putawayForm.errors.product_id && <div className="text-red-500 text-xs font-bold mt-2">{putawayForm.errors.product_id}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">Rack Tujuan</label>
                                        <select
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] block w-full px-4 py-3 rounded-xl font-bold text-[#28106F]"
                                            value={putawayForm.data.to_rack_id}
                                            onChange={(event) => putawayForm.setData('to_rack_id', event.target.value)}
                                            required
                                        >
                                            <option value="">Pilih rack tujuan</option>
                                            {racks.map((rack) => (
                                                <option key={rack.id} value={rack.id}>
                                                    {rack.code} - {rack.name} ({rack.available_capacity} kosong)
                                                </option>
                                            ))}
                                        </select>
                                        {putawayForm.errors.to_rack_id && <div className="text-red-500 text-xs font-bold mt-2">{putawayForm.errors.to_rack_id}</div>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                                    <div>
                                        <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">Kuantitas</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={putawayProduct?.unplaced_stock || undefined}
                                            className="bg-[#f8f9fb] border border-transparent focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] block w-full px-4 py-3 rounded-xl font-black text-[#28106F]"
                                            value={putawayForm.data.quantity}
                                            onChange={(event) => putawayForm.setData('quantity', event.target.value)}
                                            required
                                        />
                                        {putawayForm.errors.quantity && <div className="text-red-500 text-xs font-bold mt-2">{putawayForm.errors.quantity}</div>}
                                    </div>
                                    <div className="bg-[#f8f9fb] rounded-xl px-4 py-3 border border-gray-100">
                                        <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Stok belum di-rack</div>
                                        <div className="text-[24px] font-black text-[#28106F] mt-1">{putawayProduct?.unplaced_stock ?? 0}</div>
                                    </div>
                                    <div className="bg-[#f8f9fb] rounded-xl px-4 py-3 border border-gray-100">
                                        <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Kapasitas tujuan</div>
                                        <div className="text-[24px] font-black text-[#28106F] mt-1">{putawayToRack?.available_capacity ?? 0}</div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">Catatan Put-away</label>
                                    <textarea
                                        rows="3"
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] block w-full px-4 py-3 rounded-xl font-medium text-gray-600 resize-none"
                                        placeholder="Contoh: penerimaan PO-2026-0426, penempatan barang masuk zona A."
                                        value={putawayForm.data.notes}
                                        onChange={(event) => putawayForm.setData('notes', event.target.value)}
                                    />
                                </div>

                                <div className="mt-7 pt-6 border-t border-gray-50 flex justify-end gap-3">
                                    <Link href="/warehouse" className="px-6 py-3 border border-gray-200 text-[#0f766e] bg-white font-bold rounded-xl text-[14px] hover:bg-gray-50 transition-colors">
                                        Batal
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={putawayForm.processing}
                                        className="px-7 py-3 bg-[#0f766e] text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(15,118,110,0.3)] text-[14px] hover:bg-teal-700 transition-all disabled:opacity-60"
                                    >
                                        {putawayForm.processing ? 'Memproses...' : 'Tempatkan ke Rack'}
                                    </button>
                                </div>
                            </>
                            )}
                        </form>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="col-span-12 xl:col-span-4 space-y-6">
                        {/* Unplaced Products Summary */}
                        {unplacedProducts.length > 0 && (
                        <div className="bg-white rounded-[22px] p-6 border border-amber-200 shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[11px] font-extrabold text-amber-600 tracking-[0.15em] uppercase">Belum Di-rack</h3>
                                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black text-amber-700">{unplacedProducts.length} produk</span>
                            </div>
                            <div className="space-y-2 max-h-[240px] overflow-auto pr-1">
                                {unplacedProducts.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2">
                                        <div>
                                            <div className="text-[12px] font-black text-[#28106F]">{product.name}</div>
                                            <div className="text-[10px] font-bold text-gray-400">{product.sku} - {product.category}</div>
                                        </div>
                                        <div className="text-[12px] font-black text-amber-700">{product.unplaced_stock} {product.unit}</div>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveTab('putaway')}
                                className="mt-3 w-full rounded-xl bg-[#0f766e] px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-teal-700"
                            >
                                Put-away Sekarang
                            </button>
                        </div>
                        )}

                        <div className="bg-white rounded-[22px] p-6 border border-[#EDE8FC] shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[11px] font-extrabold text-gray-400 tracking-[0.15em] uppercase">Rack Aktif</h3>
                                <BoxIcon className="w-5 h-5 text-gray-300" />
                            </div>
                            <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
                                {racks.map((rack) => {
                                    const fill = rack.capacity > 0 ? Math.min(100, Math.round((rack.used / rack.capacity) * 100)) : 0;
                                    return (
                                        <div key={rack.id} className="border border-gray-100 rounded-xl p-3">
                                            <div className="flex justify-between gap-3">
                                                <div>
                                                    <div className="text-[13px] font-black text-[#28106F]">{rack.code}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 mt-0.5">{rack.zone}</div>
                                                </div>
                                                <div className="text-right text-[12px] font-black text-gray-600">{rack.used}/{rack.capacity}</div>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3">
                                                <div className="h-full bg-[#5932C9] rounded-full" style={{ width: `${fill}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white rounded-[22px] p-6 border border-[#EDE8FC] shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[11px] font-extrabold text-gray-400 tracking-[0.15em] uppercase">Transfer Terakhir</h3>
                                <ClipboardIcon className="w-5 h-5 text-gray-300" />
                            </div>
                            <div className="space-y-3">
                                {recentTransfers.length === 0 && (
                                    <div className="text-[13px] font-semibold text-gray-400 bg-[#f8f9fb] rounded-xl p-4">Belum ada transfer rack.</div>
                                )}
                                {recentTransfers.map((transfer) => (
                                    <div key={transfer.id} className="border border-gray-100 rounded-xl p-3 transition hover:border-[#c7d2fe] hover:bg-[#f8f9fb]">
                                        <Link href={route('rack.allocation.transfers.show', transfer.id)} className="block">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="text-[12px] font-black text-[#28106F]">{transfer.number}</div>
                                                <span className={`text-[9px] font-black rounded-md px-2 py-1 uppercase ${
                                                    transfer.status === 'pending' ? 'text-amber-700 bg-amber-50' :
                                                    transfer.status === 'rejected' ? 'text-rose-700 bg-rose-50' :
                                                    'text-emerald-700 bg-emerald-50'
                                                }`}>{transfer.status}</span>
                                            </div>
                                            <div className="text-[11px] font-bold text-gray-400 mt-1">{transfer.date} - {transfer.operator}</div>
                                            <div className="text-[12px] font-semibold text-gray-600 mt-2 line-clamp-2">{transfer.notes}</div>
                                        </Link>
                                        {transfer.status === 'pending' && can_approve && Number(transfer.created_by) !== currentUserId && (
                                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                                <button
                                                    onClick={() => router.post(route('rack.allocation.transfers.approve', transfer.id), {}, { preserveScroll: true })}
                                                    className="flex-1 px-3 py-2 bg-emerald-600 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                                                >
                                                    Setujui
                                                </button>
                                                <button
                                                    onClick={() => router.post(route('rack.allocation.transfers.reject', transfer.id), {}, { preserveScroll: true })}
                                                    className="flex-1 px-3 py-2 bg-rose-600 text-white text-[11px] font-bold rounded-lg hover:bg-rose-700 transition-colors"
                                                >
                                                    Tolak
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </DashboardLayout>
    );
}
