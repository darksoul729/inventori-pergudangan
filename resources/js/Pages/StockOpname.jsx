import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';
import { CheckCircle2, Clock, ArrowLeft, Lock, ArrowRight, CircleAlert, Package, LayoutGrid } from 'lucide-react';

// Inline gate banner
const SetupGate = ({ icon: Icon, color, title, description, href, linkLabel }) => (
    <div className="flex items-start gap-4 rounded-2xl border px-5 py-4 mb-4" style={{ backgroundColor: `${color}0D`, borderColor: `${color}30` }}>
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black" style={{ color }}>{title}</p>
            <p className="mt-0.5 text-[12px] font-semibold text-gray-500">{description}</p>
            <Link href={href} className="inline-flex items-center gap-1.5 mt-2 text-[12px] font-bold hover:underline" style={{ color }}>
                {linkLabel} <ArrowRight className="w-3 h-3" />
            </Link>
        </div>
        <CircleAlert className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color }} />
    </div>
);

// Locked panel replacing form when prerequisites missing
const LockedPanel = ({ icon: Icon, title, description }) => (
    <div className="flex flex-col items-center justify-center gap-3 py-14 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/60">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Icon className="w-7 h-7 text-gray-400" />
        </div>
        <div className="text-center">
            <p className="text-[14px] font-black text-gray-500">{title}</p>
            <p className="text-[12px] font-semibold text-gray-400 mt-1">{description}</p>
        </div>
        <Lock className="w-4 h-4 text-gray-300" />
    </div>
);

const statusBadge = (status) => {
    const map = {
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    const labels = { pending: 'Menunggu', completed: 'Disetujui', rejected: 'Ditolak' };
    return (
        <span className={`text-[10px] font-black rounded-full px-2.5 py-1 uppercase border ${map[status] || map.pending}`}>
            {labels[status] || status}
        </span>
    );
};

export default function StockOpname({ warehouse, products = [], recentOpnames = [], can_create = false, can_approve = false, status, filters = {}, has_products = true, has_racks = true }) {
    const { auth } = usePage().props;
    const currentUserId = Number(auth?.user?.id);
    const [search, setSearch] = useState('');
    const [step, setStep] = useState(1);
    const [stepError, setStepError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [opnameFilter, setOpnameFilter] = useState(filters.opname_status || 'all');

    const opnameItems = recentOpnames?.data || recentOpnames || [];
    const opnamePagination = recentOpnames?.data ? recentOpnames : null;

    const applyOpnameFilter = (status) => {
        setOpnameFilter(status);
        const params = status === 'all' ? {} : { opname_status: status };
        router.get(route('stock-opname.index'), params, { preserveState: true, replace: true, preserveScroll: true });
    };

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
                if (!lowered) return true;
                return product.name.toLowerCase().includes(lowered)
                    || product.sku.toLowerCase().includes(lowered)
                    || product.category.toLowerCase().includes(lowered);
            });
    }, [products, form.data.items, search]);

    const varianceSummary = useMemo(() => {
        return form.data.items.reduce((summary, item, index) => {
            const product = products[index];
            const difference = Number(item.physical_stock ?? 0) - Number(product?.system_stock ?? 0);
            if (difference > 0) { summary.plus += difference; summary.changed += 1; }
            else if (difference < 0) { summary.minus += Math.abs(difference); summary.changed += 1; }
            return summary;
        }, { plus: 0, minus: 0, changed: 0 });
    }, [form.data.items, products]);

    const hasEmptyPhysicalStock = useMemo(() => (
        form.data.items.some((item) => item.physical_stock === '' || item.physical_stock === null || typeof item.physical_stock === 'undefined')
    ), [form.data.items]);
    const hasInvalidPhysicalStock = useMemo(() => (
        form.data.items.some((item) => {
            const raw = item.physical_stock;
            if (raw === '' || raw === null || typeof raw === 'undefined') return true;
            const value = Number(raw);
            return Number.isNaN(value) || value < 0;
        })
    ), [form.data.items]);
    const canProceedReview = !hasEmptyPhysicalStock && !hasInvalidPhysicalStock && form.data.items.length > 0;

    const updateItem = (index, key, value) => {
        const nextItems = [...form.data.items];
        nextItems[index] = { ...nextItems[index], [key]: value };
        form.setData('items', nextItems);
    };

    const submit = () => {
        if (form.processing || isSubmitting) return;
        if (!canProceedReview) {
            setStepError('Lengkapi stok fisik dengan angka valid (tidak boleh kosong atau negatif).');
            return;
        }
        if (!hasAnyDifference) {
            setStepError('Belum ada selisih stok. Ubah minimal satu stok fisik sebelum menyimpan dokumen.');
            return;
        }

        setIsSubmitting(true);
        form.post(route('stock-opname.store'), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.setData('items', products.map((product) => ({
                    product_id: product.id,
                    physical_stock: product.system_stock,
                    note: '',
                })));
                setStep(1);
                setStepError('');
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const changedRows = useMemo(() => {
        return products
            .map((product, index) => {
                const physical = Number(form.data.items[index]?.physical_stock ?? 0);
                const system = Number(product?.system_stock ?? 0);
                const difference = physical - system;
                const note = form.data.items[index]?.note ?? '';
                return { product, physical, system, difference, note };
            })
            .filter((row) => row.difference !== 0);
    }, [products, form.data.items]);
    const hasAnyDifference = changedRows.length > 0;

    return (
        <DashboardLayout headerSearchPlaceholder="Cari barang..." searchValue={search} onSearch={setSearch}>
            <Head title="Cek Stok Fisik" />

            <div className="pb-12 pt-2">
                {/* Judul Halaman */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-[28px] font-black text-[#4722B3] tracking-tight">Cek Stok Fisik</h1>
                        <p className="text-[13px] font-semibold text-gray-500 mt-1">
                            {warehouse?.name || 'Gudang Utama'}{warehouse?.location ? ` — ${warehouse.location}` : ''}
                        </p>
                    </div>
                    <Link href="/inventory" className="flex items-center gap-2 px-5 py-2.5 border border-[#E5EAF3] bg-white hover:bg-gray-50 text-[#5B33CC] font-bold rounded-xl text-[13px] transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali</span>
                    </Link>
                </div>

                {/* Pesan Status */}
                {status && (
                    <div className="mb-6 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-5 py-3 text-[13px] font-bold">
                        {status}
                    </div>
                )}

                {/* Setup gate warnings */}
                {(!has_products || !has_racks) && (
                    <div className="mb-2">
                        {!has_products && (
                            <SetupGate
                                icon={Package}
                                color="#7C3AED"
                                title="Belum ada produk terdaftar"
                                description="Cek stok fisik membutuhkan minimal satu produk di inventaris. Tambahkan produk terlebih dahulu."
                                href="/inventory/create"
                                linkLabel="Tambah Produk Sekarang"
                            />
                        )}
                        {!has_racks && (
                            <SetupGate
                                icon={LayoutGrid}
                                color="#D97706"
                                title="Rak penyimpanan belum dibuat"
                                description="Persetujuan opname dengan selisih positif membutuhkan rak aktif. Buat zona dan rak terlebih dahulu."
                                href="/warehouse"
                                linkLabel="Buat Zona & Rak Sekarang"
                            />
                        )}
                    </div>
                )}

                {/* Stat Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]">
                        <div className="text-[11px] font-extrabold text-gray-500 tracking-wide mb-2">Total Barang Dihitung</div>
                        <div className="text-[26px] font-black text-[#4722B3]">{products.length}</div>
                    </div>
                    <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]">
                        <div className="text-[11px] font-extrabold text-gray-500 tracking-wide mb-2">Selisih Lebih</div>
                        <div className="text-[26px] font-black text-emerald-600">+{varianceSummary.plus}</div>
                    </div>
                    <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]">
                        <div className="text-[11px] font-extrabold text-gray-500 tracking-wide mb-2">Selisih Kurang</div>
                        <div className="text-[26px] font-black text-rose-600">-{varianceSummary.minus}</div>
                    </div>
                </div>

                {can_create && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className={`rounded-lg border px-3 py-2 text-center text-xs font-bold ${step >= 1 ? 'border-violet-500 text-violet-700 bg-violet-50' : 'border-slate-200 text-slate-500'}`}>1. Input Cek Stok</div>
                        <div className={`rounded-lg border px-3 py-2 text-center text-xs font-bold ${step >= 2 ? 'border-violet-500 text-violet-700 bg-violet-50' : 'border-slate-200 text-slate-500'}`}>2. Review & Simpan</div>
                    </div>
                )}

                {stepError && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                        {stepError}
                    </div>
                )}

                {/* Form Utama */}
                {!has_products ? (
                    <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3] mb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div>
                            <div>
                                <h2 className="text-[16px] font-black text-[#4722B3]">Catat Stok Fisik</h2>
                                <p className="text-[12px] font-semibold text-gray-400">Selesaikan setup terlebih dahulu</p>
                            </div>
                        </div>
                        <LockedPanel
                            icon={Package}
                            title="Belum ada produk"
                            description="Tambahkan produk ke inventaris untuk mulai cek stok fisik."
                        />
                    </div>
                ) : can_create ? (
                    <form onSubmit={(event) => event.preventDefault()} className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3] mb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5B33CC] flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-[16px] font-black text-[#4722B3]">Catat Stok Fisik</h2>
                                <p className="text-[12px] font-semibold text-gray-400">Masukkan jumlah stok aktual hasil hitung lapangan</p>
                            </div>
                        </div>

                        {form.errors.items && <div className="mb-4 text-red-500 text-[12px] font-bold">{form.errors.items}</div>}

                        {step === 1 && (
                        <>
                        {/* Tabel */}
                        <div className="overflow-hidden rounded-2xl border border-[#E5EAF3]">
                            <div className="grid grid-cols-12 gap-3 bg-[#f8f9fb] px-5 py-3 text-[10px] font-black text-gray-400 tracking-[0.08em] uppercase">
                                <div className="col-span-4">Nama Barang</div>
                                <div className="col-span-2 text-right">Stok Sistem</div>
                                <div className="col-span-2 text-right">Stok Fisik</div>
                                <div className="col-span-1 text-right">Selisih</div>
                                <div className="col-span-3">Catatan</div>
                            </div>

                            <div className="max-h-[480px] overflow-auto divide-y divide-gray-50">
                                {rows.map((product) => {
                                    const difference = product.physical_stock - product.system_stock;
                                    const diffColor = difference > 0 ? 'text-emerald-600' : difference < 0 ? 'text-rose-600' : 'text-gray-300';
                                    return (
                                        <div key={product.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-gray-50/50 transition-colors">
                                            <div className="col-span-4 flex items-center gap-2">
                                                <img src={product.image ? `/storage/${product.image}` : '/images/placeholder-product.png'} className="w-8 h-8 rounded object-cover flex-shrink-0" alt="" />
                                                <div className="min-w-0">
                                                    <div className="text-[13px] font-black text-[#4722B3] truncate">{product.name}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 mt-0.5">{product.sku} · {product.category}</div>
                                                </div>
                                            </div>
                                            <div className="col-span-2 text-right text-[13px] font-bold text-gray-600">{product.system_stock}</div>
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC] px-3 py-2 rounded-xl text-right text-[13px] font-black text-[#4722B3]"
                                                    value={product.physical_stock}
                                                    onChange={(e) => updateItem(product.index, 'physical_stock', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className={`col-span-1 text-right text-[13px] font-black ${diffColor}`}>
                                                {difference > 0 ? '+' : ''}{difference}
                                            </div>
                                            <div className="col-span-3">
                                                <input
                                                    type="text"
                                                    className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC] px-3 py-2 rounded-xl text-[12px] font-semibold text-gray-600"
                                                    placeholder="Opsional..."
                                                    value={product.note}
                                                    onChange={(e) => updateItem(product.index, 'note', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Catatan Umum */}
                        <div className="mt-6">
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Catatan Umum (opsional)</label>
                            <textarea
                                rows="2"
                                className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC] px-4 py-3 rounded-xl text-[13px] font-semibold text-gray-600 resize-none"
                                placeholder="Contoh: audit bulanan zona A, koreksi hasil hitung fisik..."
                                value={form.data.notes}
                                onChange={(e) => form.setData('notes', e.target.value)}
                            />
                        </div>
                        </>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-[#E5EAF3] bg-[#f8f9fb] p-4">
                                    <div className="text-[12px] font-black text-[#4722B3] mb-2">Ringkasan Review</div>
                                    <div className="grid grid-cols-3 gap-3 text-[12px] font-semibold text-gray-600">
                                        <div>Total Barang Dihitung: <span className="font-black text-gray-900">{products.length}</span></div>
                                        <div>Item Berselisih: <span className="font-black text-gray-900">{changedRows.length}</span></div>
                                        <div>Catatan Umum: <span className="font-black text-gray-900">{form.data.notes ? 'Ada' : 'Tidak ada'}</span></div>
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-[#E5EAF3]">
                                    <div className="grid grid-cols-12 gap-3 bg-[#f8f9fb] px-5 py-3 text-[10px] font-black text-gray-400 tracking-[0.08em] uppercase">
                                        <div className="col-span-4">Nama Barang</div>
                                        <div className="col-span-2 text-right">Sistem</div>
                                        <div className="col-span-2 text-right">Fisik</div>
                                        <div className="col-span-1 text-right">Selisih</div>
                                        <div className="col-span-3">Catatan</div>
                                    </div>
                                    <div className="max-h-[360px] overflow-auto divide-y divide-gray-50">
                                        {changedRows.length === 0 ? (
                                            <div className="px-5 py-6 text-center text-[12px] font-semibold text-gray-500">Belum ada selisih. Anda tetap bisa simpan dokumen cek stok.</div>
                                        ) : (
                                            changedRows.map((row) => (
                                                <div key={row.product.id} className="grid grid-cols-12 gap-3 px-5 py-3 items-center">
                                                    <div className="col-span-4 flex items-center gap-2">
                                                        <img src={row.product.image ? `/storage/${row.product.image}` : '/images/placeholder-product.png'} className="w-7 h-7 rounded object-cover flex-shrink-0" alt="" />
                                                        <div className="min-w-0">
                                                            <div className="text-[12px] font-black text-[#4722B3] truncate">{row.product.name}</div>
                                                            <div className="text-[10px] text-gray-400">{row.product.sku}</div>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2 text-right text-[12px] font-bold text-gray-600">{row.system}</div>
                                                    <div className="col-span-2 text-right text-[12px] font-bold text-gray-600">{row.physical}</div>
                                                    <div className={`col-span-1 text-right text-[12px] font-black ${row.difference > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{row.difference > 0 ? '+' : ''}{row.difference}</div>
                                                    <div className="col-span-3 text-[11px] font-semibold text-gray-500 truncate">{row.note || '-'}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tombol Aksi */}
                        <div className="mt-6 pt-5 border-t border-gray-100 flex justify-end gap-3">
                            <Link href="/inventory" className="px-5 py-2.5 border border-[#E5EAF3] bg-white text-[#5B33CC] font-bold rounded-xl text-[13px] hover:bg-gray-50 transition-colors">
                                Batal
                            </Link>
                            {step > 1 && (
                                <button type="button" onClick={() => setStep(1)} className="px-5 py-2.5 border border-[#E5EAF3] bg-white text-[#5B33CC] font-bold rounded-xl text-[13px] hover:bg-gray-50 transition-colors">
                                    Kembali
                                </button>
                            )}
                            {step < 2 ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!form.data.items.length) {
                                            setStepError('Data barang untuk cek stok belum tersedia.');
                                            return;
                                        }
                                        if (!canProceedReview) {
                                            setStepError('Stok fisik wajib diisi dengan angka valid untuk semua barang sebelum lanjut review.');
                                            return;
                                        }
                                        setStepError('');
                                        setStep(2);
                                    }}
                                    disabled={!canProceedReview}
                                    className="px-6 py-2.5 bg-[#5B33CC] shadow-[0_4px_14px_rgba(89,50,201,0.3)] hover:bg-indigo-700 text-white font-bold rounded-xl text-[13px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    Lanjut Review
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={submit}
                                    disabled={form.processing || isSubmitting || !canProceedReview || !hasAnyDifference}
                                    className="px-6 py-2.5 bg-[#5B33CC] shadow-[0_4px_14px_rgba(89,50,201,0.3)] hover:bg-indigo-700 text-white font-bold rounded-xl text-[13px] transition-colors disabled:opacity-60"
                                >
                                    {(form.processing || isSubmitting) ? 'Menyimpan...' : 'Simpan Hasil Cek Stok'}
                                </button>
                            )}
                        </div>
                    </form>
                ) : (
                    <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3] mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-[16px] font-black text-[#4722B3]">Catat Stok Fisik</h2>
                                <p className="text-[13px] font-semibold text-gray-500">Anda tidak memiliki izin untuk membuat dokumen cek stok.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Riwayat Cek Stok */}
                <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5B33CC] flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-black text-[#4722B3]">Riwayat Cek Stok</h2>
                            <p className="text-[12px] font-semibold text-gray-400">Daftar dokumen cek stok yang pernah dibuat</p>
                        </div>
                    </div>

                    {/* Filter Status */}
                    <div className="flex gap-2 flex-wrap mb-4">
                        {[{key:'all',label:'Semua'},{key:'pending',label:'Menunggu'},{key:'completed',label:'Disetujui'},{key:'rejected',label:'Ditolak'}].map(f => (
                            <button key={f.key} onClick={() => applyOpnameFilter(f.key)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${opnameFilter === f.key ? 'bg-[#5B33CC] text-white border-[#5B33CC]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#5B33CC]'}`}>{f.label}</button>
                        ))}
                    </div>

                    {opnameItems.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-6 text-center">
                            <p className="text-[14px] font-black text-[#4722B3]">Belum ada riwayat</p>
                            <p className="text-[12px] font-semibold text-gray-500 mt-1">Dokumen cek stok akan muncul setelah Anda menyimpan opname pertama.</p>
                            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                                {can_create ? (
                                    <Link
                                        href={route('stock-opname.index')}
                                        className="rounded-xl bg-[#5B33CC] px-4 py-2 text-[12px] font-bold text-white hover:bg-indigo-700"
                                    >
                                        + Buat Opname
                                    </Link>
                                ) : null}
                                <Link
                                    href={route('inventory')}
                                    className="rounded-xl border border-[#E5EAF3] bg-white px-4 py-2 text-[12px] font-bold text-[#5B33CC] hover:bg-gray-50"
                                >
                                    Lihat Stok Barang
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {opnameItems.map((opname) => (
                                <div key={opname.id} className="border border-[#E5EAF3] rounded-xl p-4 hover:border-indigo-200 hover:bg-[#f8f9fb] transition-all">
                                    <Link href={route('stock-opname.show', opname.id)} className="block">
                                        <div className="flex items-center justify-between">
                                            <div className="text-[13px] font-black text-[#4722B3]">{opname.number}</div>
                                            <div className="flex items-center gap-2">
                                                {statusBadge(opname.status)}
                                                <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-2.5 py-1 uppercase">{opname.variance_count} selisih</span>
                                            </div>
                                        </div>
                                        <div className="text-[11px] font-bold text-gray-400 mt-1.5">{opname.date} · {opname.operator}</div>
                                        <div className="text-[12px] font-semibold text-gray-600 mt-1">{opname.items_count} barang, total selisih {opname.total_variance}</div>
                                    </Link>
                                    {opname.status === 'pending' && can_approve && Number(opname.created_by) !== currentUserId && (
                                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                            <button
                                                onClick={() => router.post(route('stock-opname.approve', opname.id), {}, { preserveScroll: true })}
                                                className="flex-1 px-4 py-2 bg-emerald-600 text-white text-[11px] font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                                            >
                                                Setujui
                                            </button>
                                            <button
                                                onClick={() => router.post(route('stock-opname.reject', opname.id), {}, { preserveScroll: true })}
                                                className="flex-1 px-4 py-2 bg-rose-600 text-white text-[11px] font-bold rounded-xl hover:bg-rose-700 transition-colors"
                                            >
                                                Tolak
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {opnamePagination && opnamePagination.last_page > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                            <div className="text-xs text-gray-500 font-semibold">
                                {opnamePagination.from}–{opnamePagination.to} dari {opnamePagination.total}
                            </div>
                            <div className="flex gap-1">
                                {opnamePagination.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url || link.active}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${link.active ? 'bg-[#5B33CC] text-white border-[#5B33CC]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#5B33CC] disabled:opacity-40'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
