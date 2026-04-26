import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';

const AuditIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const SearchIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const HistoryIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const statusBadge = (status) => {
    const map = {
        pending: 'bg-amber-50 text-amber-700 border-amber-100',
        completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        rejected: 'bg-rose-50 text-rose-700 border-rose-100',
    };
    const labels = { pending: 'Menunggu', completed: 'Disetujui', rejected: 'Ditolak' };
    return (
        <span className={`text-[9px] font-black rounded-md px-2 py-1 uppercase border ${map[status] || map.pending}`}>
            {labels[status] || status}
        </span>
    );
};

export default function StockOpname({ warehouse, products = [], recentOpnames = [], can_create = false, can_approve = false, status }) {
    const { auth } = usePage().props;
    const currentUserId = Number(auth?.user?.id);
    const [search, setSearch] = useState('');

    const form = useForm({
        notes: '',
        items: products.map((product) => ({
            product_id: product.id,
            physical_stock: product.system_stock,
            note: '',
        })),
    });

    const rows = useMemo(() => {
        const lowered = search.trim().toLowerCase();

        return products
            .map((product, index) => ({
                ...product,
                index,
                physical_stock: Number(form.data.items[index]?.physical_stock ?? 0),
                note: form.data.items[index]?.note ?? '',
            }))
            .filter((product) => {
                if (!lowered) {
                    return true;
                }

                return product.name.toLowerCase().includes(lowered)
                    || product.sku.toLowerCase().includes(lowered)
                    || product.category.toLowerCase().includes(lowered);
            });
    }, [products, form.data.items, search]);

    const varianceSummary = useMemo(() => {
        return form.data.items.reduce((summary, item, index) => {
            const product = products[index];
            const difference = Number(item.physical_stock ?? 0) - Number(product?.system_stock ?? 0);

            if (difference > 0) {
                summary.plus += difference;
                summary.changed += 1;
            } else if (difference < 0) {
                summary.minus += Math.abs(difference);
                summary.changed += 1;
            }

            return summary;
        }, { plus: 0, minus: 0, changed: 0 });
    }, [form.data.items, products]);

    const updateItem = (index, key, value) => {
        const nextItems = [...form.data.items];
        nextItems[index] = {
            ...nextItems[index],
            [key]: value,
        };
        form.setData('items', nextItems);
    };

    const submit = (event) => {
        event.preventDefault();
        form.post(route('stock-opname.store'), {
            preserveScroll: true,
        });
    };

    return (
        <DashboardLayout
            headerSearchPlaceholder="Cari SKU, produk, kategori..."
            searchValue={search}
            onSearch={setSearch}
        >
            <Head title="Stock Opname" />

            <div className="pb-12">
                <div className="flex flex-col gap-2 mb-7">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/inventory" className="text-gray-400 hover:text-indigo-600 font-bold transition-colors">Inventaris</Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-600 font-bold">Stock Opname</span>
                    </div>
                    <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
                        <div>
                            <h1 className="text-[28px] font-black text-[#28106F] tracking-tight">Stock Opname</h1>
                            <p className="text-[13px] font-semibold text-gray-500 mt-1">
                                {warehouse?.name || 'Warehouse utama'}{warehouse?.location ? `, ${warehouse.location}` : ''} - hitung stok fisik, sistem akan membuat adjustment untuk selisih.
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
                    {can_create ? (
                    <form onSubmit={submit} className="col-span-12 xl:col-span-8 bg-white rounded-[22px] p-7 border border-[#EDE8FC] shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-[#eef2ff] text-[#5932C9] flex items-center justify-center">
                                    <AuditIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-[18px] font-black text-[#28106F]">Form Hitung Fisik</h2>
                                    <p className="text-[12px] font-semibold text-gray-400">Input stok fisik hasil hitung lapangan per SKU.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                            <div className="bg-[#f8f9fb] rounded-xl px-4 py-3 border border-gray-100">
                                <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">SKU dihitung</div>
                                <div className="text-[24px] font-black text-[#28106F] mt-1">{products.length}</div>
                            </div>
                            <div className="bg-[#f8f9fb] rounded-xl px-4 py-3 border border-gray-100">
                                <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Selisih masuk</div>
                                <div className="text-[24px] font-black text-emerald-600 mt-1">+{varianceSummary.plus}</div>
                            </div>
                            <div className="bg-[#f8f9fb] rounded-xl px-4 py-3 border border-gray-100">
                                <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Selisih keluar</div>
                                <div className="text-[24px] font-black text-rose-600 mt-1">-{varianceSummary.minus}</div>
                            </div>
                        </div>

                        {form.errors.items && <div className="mb-4 text-red-500 text-xs font-bold">{form.errors.items}</div>}

                        <div className="overflow-hidden rounded-2xl border border-gray-100">
                            <div className="grid grid-cols-[1.6fr_0.7fr_0.7fr_0.7fr_1fr] gap-3 bg-[#f8f9fb] px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                <div>Produk</div>
                                <div className="text-right">Sistem</div>
                                <div className="text-right">Fisik</div>
                                <div className="text-right">Selisih</div>
                                <div>Catatan</div>
                            </div>

                            <div className="max-h-[520px] overflow-auto divide-y divide-gray-100">
                                {rows.map((product) => {
                                    const difference = product.physical_stock - product.system_stock;
                                    const differenceClass = difference > 0
                                        ? 'text-emerald-600'
                                        : difference < 0
                                            ? 'text-rose-600'
                                            : 'text-gray-400';

                                    return (
                                        <div key={product.id} className="grid grid-cols-[1.6fr_0.7fr_0.7fr_0.7fr_1fr] gap-3 px-4 py-3 items-center">
                                            <div>
                                                <div className="text-[13px] font-black text-[#28106F]">{product.name}</div>
                                                <div className="text-[10px] font-bold text-gray-400 mt-0.5">{product.sku} - {product.category} - {product.rack_count} rack</div>
                                            </div>
                                            <div className="text-right text-[13px] font-black text-gray-600">{product.system_stock}</div>
                                            <input
                                                type="number"
                                                min="0"
                                                className="bg-[#f8f9fb] border border-transparent focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9] w-full px-3 py-2 rounded-lg text-right font-black text-[#28106F]"
                                                value={product.physical_stock}
                                                onChange={(event) => updateItem(product.index, 'physical_stock', event.target.value)}
                                                required
                                            />
                                            <div className={`text-right text-[13px] font-black ${differenceClass}`}>
                                                {difference > 0 ? '+' : ''}{difference}
                                            </div>
                                            <input
                                                type="text"
                                                className="bg-[#f8f9fb] border border-transparent focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9] w-full px-3 py-2 rounded-lg text-[12px] font-semibold text-gray-600"
                                                placeholder="Opsional"
                                                value={product.note}
                                                onChange={(event) => updateItem(product.index, 'note', event.target.value)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">Catatan Opname</label>
                            <textarea
                                rows="3"
                                className="bg-[#f8f9fb] border border-transparent focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9] block w-full px-4 py-3 rounded-xl font-medium text-gray-600 resize-none"
                                placeholder="Contoh: cycle count zona A, audit bulanan, atau koreksi hasil hitung fisik."
                                value={form.data.notes}
                                onChange={(event) => form.setData('notes', event.target.value)}
                            />
                        </div>

                        <div className="mt-7 pt-6 border-t border-gray-50 flex justify-end gap-3">
                            <Link href="/inventory" className="px-6 py-3 border border-gray-200 text-[#5932C9] bg-white font-bold rounded-xl text-[14px] hover:bg-gray-50 transition-colors">
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="px-7 py-3 bg-[#5932C9] text-white font-bold rounded-xl shadow-[0_4px_14px_rgba(89,50,201,0.3)] text-[14px] hover:bg-indigo-700 transition-all disabled:opacity-60"
                            >
                                {form.processing ? 'Menyimpan...' : 'Simpan Opname'}
                            </button>
                        </div>
                    </form>
                    ) : (
                    <div className="col-span-12 xl:col-span-8 bg-white rounded-[22px] p-7 border border-[#EDE8FC] shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center">
                                <AuditIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-[18px] font-black text-[#28106F]">Form Hitung Fisik</h2>
                                <p className="text-[12px] font-semibold text-gray-400">Anda tidak memiliki izin untuk membuat stock opname.</p>
                            </div>
                        </div>
                    </div>
                    )}

                    <aside className="col-span-12 xl:col-span-4 space-y-6">
                        <div className="bg-white rounded-[22px] p-6 border border-[#EDE8FC] shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[11px] font-extrabold text-gray-400 tracking-[0.15em] uppercase">Ringkasan Audit</h3>
                                <AuditIcon className="w-5 h-5 text-gray-300" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-[#f8f9fb] rounded-xl px-4 py-3">
                                    <span className="text-[12px] font-bold text-gray-500">SKU berubah</span>
                                    <span className="text-[16px] font-black text-[#28106F]">{varianceSummary.changed}</span>
                                </div>
                                <div className="flex justify-between items-center bg-[#f8f9fb] rounded-xl px-4 py-3">
                                    <span className="text-[12px] font-bold text-gray-500">Adjustment otomatis</span>
                                    <span className="text-[12px] font-black text-[#5932C9]">Aktif</span>
                                </div>
                                <div className="flex justify-between items-center bg-[#f8f9fb] rounded-xl px-4 py-3">
                                    <span className="text-[12px] font-bold text-gray-500">Ledger</span>
                                    <span className="text-[12px] font-black text-[#5932C9]">stock_adjustment</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[22px] p-6 border border-[#EDE8FC] shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[11px] font-extrabold text-gray-400 tracking-[0.15em] uppercase">Opname Terakhir</h3>
                                <HistoryIcon className="w-5 h-5 text-gray-300" />
                            </div>
                            <div className="space-y-3">
                                {recentOpnames.length === 0 && (
                                    <div className="text-[13px] font-semibold text-gray-400 bg-[#f8f9fb] rounded-xl p-4">Belum ada stock opname.</div>
                                )}
                                {recentOpnames.map((opname) => (
                                    <div key={opname.id} className="border border-gray-100 rounded-xl p-3 transition hover:border-[#c7d2fe] hover:bg-[#f8f9fb]">
                                        <Link href={route('stock-opname.show', opname.id)} className="block">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="text-[12px] font-black text-[#28106F]">{opname.number}</div>
                                                <div className="flex items-center gap-2">
                                                    {statusBadge(opname.status)}
                                                    <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 rounded-md px-2 py-1 uppercase">{opname.variance_count} variance</span>
                                                </div>
                                            </div>
                                            <div className="text-[11px] font-bold text-gray-400 mt-1">{opname.date} - {opname.operator}</div>
                                            <div className="text-[12px] font-semibold text-gray-600 mt-2">
                                                {opname.items_count} SKU, total selisih {opname.total_variance}
                                            </div>
                                        </Link>
                                        {opname.status === 'pending' && can_approve && Number(opname.created_by) !== currentUserId && (
                                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                                <button
                                                    onClick={() => router.post(route('stock-opname.approve', opname.id), {}, { preserveScroll: true })}
                                                    className="flex-1 px-3 py-2 bg-emerald-600 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                                                >
                                                    Setujui
                                                </button>
                                                <button
                                                    onClick={() => router.post(route('stock-opname.reject', opname.id), {}, { preserveScroll: true })}
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
