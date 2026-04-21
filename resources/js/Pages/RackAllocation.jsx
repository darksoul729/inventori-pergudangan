import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useMemo } from 'react';

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

export default function RackAllocation({ warehouse, racks = [], recentTransfers = [], status }) {
    const form = useForm({
        from_rack_id: '',
        to_rack_id: '',
        product_id: '',
        quantity: 1,
        notes: '',
    });

    const fromRack = useMemo(
        () => racks.find((rack) => String(rack.id) === String(form.data.from_rack_id)),
        [racks, form.data.from_rack_id],
    );

    const selectedStock = useMemo(
        () => fromRack?.stocks?.find((stock) => String(stock.product_id) === String(form.data.product_id)),
        [fromRack, form.data.product_id],
    );

    const toRack = useMemo(
        () => racks.find((rack) => String(rack.id) === String(form.data.to_rack_id)),
        [racks, form.data.to_rack_id],
    );

    const availableQuantity = selectedStock?.available_quantity ?? 0;
    const destinationCapacity = toRack?.available_capacity ?? 0;

    const submit = (event) => {
        event.preventDefault();
        form.post(route('rack.allocation.transfers.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset('product_id', 'quantity', 'notes'),
        });
    };

    return (
        <DashboardLayout>
            <Head title="Transfer Rack" />

            <div className="pb-12">
                <div className="flex flex-col gap-2 mb-7">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/warehouse" className="text-gray-400 hover:text-indigo-600 font-bold transition-colors">Gudang</Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-600 font-bold">Transfer Rack</span>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                        <div>
                            <h1 className="text-[28px] font-black text-[#1a202c] tracking-tight">Transfer Internal Rack</h1>
                            <p className="text-[13px] font-semibold text-gray-500 mt-1">
                                {warehouse?.name || 'Warehouse utama'}{warehouse?.location ? `, ${warehouse.location}` : ''} - pindahkan stok antar rack tanpa mengubah total stok warehouse.
                            </p>
                        </div>
                        {status && (
                            <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl px-4 py-3 text-[13px] font-bold">
                                {status}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    <form onSubmit={submit} className="col-span-12 xl:col-span-8 bg-white rounded-[22px] p-7 border border-[#edf2f7] shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-3 mb-7">
                            <div className="w-11 h-11 rounded-xl bg-[#eef2ff] text-[#4f46e5] flex items-center justify-center">
                                <BoxIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-[18px] font-black text-[#1a202c]">Dokumen Transfer</h2>
                                <p className="text-[12px] font-semibold text-gray-400">Sistem akan membuat stock transfer, memindahkan rack stock, dan menulis ledger.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start">
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">Rack Asal</label>
                                <select
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 rounded-xl font-bold text-[#1a202c]"
                                    value={form.data.from_rack_id}
                                    onChange={(event) => form.setData({
                                        ...form.data,
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
                                {form.errors.from_rack_id && <div className="text-red-500 text-xs font-bold mt-2">{form.errors.from_rack_id}</div>}
                            </div>

                            <div className="hidden lg:flex items-center justify-center pt-9">
                                <div className="w-10 h-10 rounded-full bg-[#f8f9fb] border border-gray-100 flex items-center justify-center text-[#4f46e5]">
                                    <ArrowRightIcon className="w-5 h-5" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">Rack Tujuan</label>
                                <select
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 rounded-xl font-bold text-[#1a202c]"
                                    value={form.data.to_rack_id}
                                    onChange={(event) => form.setData('to_rack_id', event.target.value)}
                                    required
                                >
                                    <option value="">Pilih rack tujuan</option>
                                    {racks
                                        .filter((rack) => String(rack.id) !== String(form.data.from_rack_id))
                                        .map((rack) => (
                                            <option key={rack.id} value={rack.id}>
                                                {rack.code} - {rack.name} ({rack.available_capacity} kosong)
                                            </option>
                                        ))}
                                </select>
                                {form.errors.to_rack_id && <div className="text-red-500 text-xs font-bold mt-2">{form.errors.to_rack_id}</div>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                            <div className="lg:col-span-2">
                                <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">Produk di Rack Asal</label>
                                <select
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 rounded-xl font-bold text-[#1a202c]"
                                    value={form.data.product_id}
                                    onChange={(event) => form.setData('product_id', event.target.value)}
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
                                {form.errors.product_id && <div className="text-red-500 text-xs font-bold mt-2">{form.errors.product_id}</div>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">Kuantitas</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={availableQuantity || undefined}
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 rounded-xl font-black text-[#1a202c]"
                                    value={form.data.quantity}
                                    onChange={(event) => form.setData('quantity', event.target.value)}
                                    required
                                />
                                {form.errors.quantity && <div className="text-red-500 text-xs font-bold mt-2">{form.errors.quantity}</div>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                            <div className="bg-[#f8f9fb] rounded-xl px-4 py-3 border border-gray-100">
                                <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Stok tersedia</div>
                                <div className="text-[24px] font-black text-[#1a202c] mt-1">{availableQuantity}</div>
                            </div>
                            <div className="bg-[#f8f9fb] rounded-xl px-4 py-3 border border-gray-100">
                                <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Kapasitas tujuan</div>
                                <div className="text-[24px] font-black text-[#1a202c] mt-1">{destinationCapacity}</div>
                            </div>
                            <div className="bg-[#f8f9fb] rounded-xl px-4 py-3 border border-gray-100">
                                <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Total warehouse</div>
                                <div className="text-[24px] font-black text-[#1a202c] mt-1">Tetap</div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">Catatan Transfer</label>
                            <textarea
                                rows="3"
                                className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 rounded-xl font-medium text-gray-600 resize-none"
                                placeholder="Contoh: redistribusi stok high-pick, relokasi karena kapasitas rack, atau balancing zona."
                                value={form.data.notes}
                                onChange={(event) => form.setData('notes', event.target.value)}
                            />
                        </div>

                        <div className="mt-7 pt-6 border-t border-gray-50 flex justify-end gap-3">
                            <Link href="/warehouse" className="px-6 py-3 border border-gray-200 text-[#4f46e5] bg-white font-bold rounded-xl text-[14px] hover:bg-gray-50 transition-colors">
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="px-7 py-3 bg-[#4f46e5] text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.3)] text-[14px] hover:bg-indigo-700 transition-all disabled:opacity-60"
                            >
                                {form.processing ? 'Memproses...' : 'Konfirmasi Transfer'}
                            </button>
                        </div>
                    </form>

                    <aside className="col-span-12 xl:col-span-4 space-y-6">
                        <div className="bg-white rounded-[22px] p-6 border border-[#edf2f7] shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
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
                                                    <div className="text-[13px] font-black text-[#1a202c]">{rack.code}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 mt-0.5">{rack.zone}</div>
                                                </div>
                                                <div className="text-right text-[12px] font-black text-gray-600">{rack.used}/{rack.capacity}</div>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3">
                                                <div className="h-full bg-[#4f46e5] rounded-full" style={{ width: `${fill}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white rounded-[22px] p-6 border border-[#edf2f7] shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[11px] font-extrabold text-gray-400 tracking-[0.15em] uppercase">Transfer Terakhir</h3>
                                <ClipboardIcon className="w-5 h-5 text-gray-300" />
                            </div>
                            <div className="space-y-3">
                                {recentTransfers.length === 0 && (
                                    <div className="text-[13px] font-semibold text-gray-400 bg-[#f8f9fb] rounded-xl p-4">Belum ada transfer rack.</div>
                                )}
                                {recentTransfers.map((transfer) => (
                                    <Link key={transfer.id} href={route('rack.allocation.transfers.show', transfer.id)} className="block border border-gray-100 rounded-xl p-3 transition hover:border-[#c7d2fe] hover:bg-[#f8f9fb]">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-[12px] font-black text-[#1a202c]">{transfer.number}</div>
                                            <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 rounded-md px-2 py-1 uppercase">{transfer.status}</span>
                                        </div>
                                        <div className="text-[11px] font-bold text-gray-400 mt-1">{transfer.date} - {transfer.operator}</div>
                                        <div className="text-[12px] font-semibold text-gray-600 mt-2 line-clamp-2">{transfer.notes}</div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </DashboardLayout>
    );
}
