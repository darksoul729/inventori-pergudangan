import DashboardLayout from '@/Layouts/DashboardLayout';
import CustomDropdown from '@/Components/CustomDropdown';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';
import { ArrowRight, CircleAlert, Users, Package, Lock } from 'lucide-react';

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

// Lockable field wrapper
const LockableField = ({ locked, children }) => (
    locked ? (
        <div className="relative">
            <div className="pointer-events-none opacity-50">{children}</div>
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gray-100/60 backdrop-blur-[1px]">
                <span className="flex items-center gap-1 text-[11px] font-black text-gray-400"><Lock className="w-3 h-3" />Belum tersedia</span>
            </div>
        </div>
    ) : children
);

export default function Create({ customers = [], products = [], autoNumber, has_customers = true, has_products = true }) {
    const { data, setData, post, processing, errors } = useForm({
        invoice_number: autoNumber,
        customer_id: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        notes: '',
        send_email: true,
        items: [{ product_id: '', description: '', quantity: 1, unit_price: 0 }],
    });

    const addItem = () => setData('items', [...data.items, { product_id: '', description: '', quantity: 1, unit_price: 0 }]);
    const removeItem = (i) => setData('items', data.items.filter((_, idx) => idx !== i));
    const updateItem = (i, key, value) => {
        const items = [...data.items];
        items[i][key] = value;
        setData('items', items);
    };
    const selectProduct = (index, productId) => {
        const selected = products.find((p) => String(p.id) === String(productId));
        const items = [...data.items];
        items[index].product_id = productId;
        items[index].description = selected ? `${selected.name} (${selected.sku || '-'})` : '';
        items[index].unit_price = selected ? Number(selected.selling_price || 0) : 0;
        setData('items', items);
    };

    const total = data.items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)), 0);
    const formatRupiahInput = (value) => {
        if (value === '' || value === null || typeof value === 'undefined') return '';
        const numeric = Number(String(value).replace(/[^\d]/g, ''));
        if (Number.isNaN(numeric)) return '';
        return numeric.toLocaleString('id-ID');
    };
    const updateUnitPrice = (index, rawValue) => {
        const digitsOnly = String(rawValue).replace(/[^\d]/g, '');
        updateItem(index, 'unit_price', digitsOnly === '' ? '' : Number(digitsOnly));
    };
    const selectedCustomer = customers.find((c) => String(c.id) === String(data.customer_id));
    const [step, setStep] = React.useState(1);
    const [stepError, setStepError] = React.useState('');

    const submit = (e) => {
        e.preventDefault();
        post(route('invoices.store'));
    };

    const nextStep = () => {
        if (step === 1) {
            if (!data.invoice_number || !data.customer_id || !data.invoice_date) {
                setStepError('Lengkapi nomor tagihan, pelanggan, dan tanggal tagihan.');
                return;
            }
        }
        if (step === 2) {
            if (!data.items.length) {
                setStepError('Tambahkan minimal 1 item tagihan.');
                return;
            }
            const invalidItem = data.items.some((item) => !item.description || Number(item.quantity) <= 0 || Number(item.unit_price) < 0);
            if (invalidItem) {
                setStepError('Lengkapi deskripsi, jumlah, dan harga item dengan benar.');
                return;
            }
        }
        setStepError('');
        setStep((prev) => Math.min(prev + 1, 3));
    };

    return (
        <DashboardLayout>
            <Head title="Buat Tagihan" />
            <div className="space-y-6 pb-12">
                <div>
                    <h1 className="text-[28px] font-black text-[#4722B3]">Buat Tagihan</h1>
                    <p className="text-sm font-semibold text-gray-500 mt-1">Isi data sederhana lalu kirim tagihan ke pelanggan.</p>
                </div>

                {/* Setup gate warnings */}
                {(!has_customers || !has_products) && (
                    <div>
                        {!has_customers && (
                            <SetupGate
                                icon={Users}
                                color="#0EA5E9"
                                title="Belum ada pelanggan terdaftar"
                                description="Tagihan membutuhkan minimal satu pelanggan. Tambahkan pelanggan terlebih dahulu."
                                href="/customers"
                                linkLabel="Tambah Pelanggan Sekarang"
                            />
                        )}
                        {!has_products && (
                            <SetupGate
                                icon={Package}
                                color="#7C3AED"
                                title="Belum ada produk terdaftar"
                                description="Pilihan barang di item tagihan akan kosong. Tambahkan produk ke inventaris untuk memudahkan pengisian."
                                href="/inventory/create"
                                linkLabel="Tambah Produk Sekarang"
                            />
                        )}
                    </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                    <div className={`rounded-lg border px-3 py-2 text-center text-xs font-bold ${step >= 1 ? 'border-violet-500 text-violet-700 bg-violet-50' : 'border-slate-200 text-slate-500'}`}>1. Data Tagihan</div>
                    <div className={`rounded-lg border px-3 py-2 text-center text-xs font-bold ${step >= 2 ? 'border-violet-500 text-violet-700 bg-violet-50' : 'border-slate-200 text-slate-500'}`}>2. Item</div>
                    <div className={`rounded-lg border px-3 py-2 text-center text-xs font-bold ${step >= 3 ? 'border-violet-500 text-violet-700 bg-violet-50' : 'border-slate-200 text-slate-500'}`}>3. Review</div>
                </div>

                {stepError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                        {stepError}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    {step === 1 && (
                    <div className="bg-white border border-[#E5EAF3] rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500">Nomor Tagihan</label>
                            <input value={data.invoice_number} onChange={(e) => setData('invoice_number', e.target.value)} className="w-full mt-1 rounded-xl border-gray-200" />
                            {errors.invoice_number && <p className="text-xs text-rose-600 mt-1">{errors.invoice_number}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Pelanggan</label>
                            <LockableField locked={!has_customers}>
                                <CustomDropdown
                                    value={data.customer_id}
                                    onChange={(value) => setData('customer_id', value)}
                                    options={customers.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` }))}
                                    placeholder={has_customers ? 'Pilih Pelanggan' : 'Belum ada pelanggan'}
                                    disabled={!has_customers}
                                    className="mt-1"
                                />
                            </LockableField>
                            {errors.customer_id && <p className="text-xs text-rose-600 mt-1">{errors.customer_id}</p>}
                            {selectedCustomer && (
                                <p className="mt-1 text-xs font-semibold text-slate-500">
                                    Email pelanggan: {selectedCustomer.email || 'Belum diisi'}
                                </p>
                            )}
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
                        <div className="md:col-span-2">
                            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={data.send_email}
                                    onChange={(e) => setData('send_email', e.target.checked)}
                                    className="rounded border-gray-300 text-[#5B33CC] focus:ring-[#5B33CC]"
                                />
                                Kirim invoice ke email pelanggan (lampiran PDF)
                            </label>
                        </div>
                    </div>
                    )}

                    {step === 2 && (
                    <div className="bg-white border border-[#E5EAF3] rounded-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-black text-[#4722B3]">Item Tagihan</h2>
                            <button type="button" onClick={addItem} className="text-sm font-bold text-indigo-600">+ Tambah Item</button>
                        </div>

                        {data.items.map((item, i) => (
                            <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                <div className="md:col-span-5 space-y-2">
                                    <CustomDropdown
                                        value={item.product_id}
                                        onChange={(value) => selectProduct(i, value)}
                                        options={[
                                            { value: '', label: 'Pilih barang dari inventori' },
                                            ...products.map((p) => ({
                                                value: p.id,
                                                label: `${p.name} (${p.sku || '-'})`,
                                                image: p.image_url || (p.image ? `/storage/${p.image}` : null),
                                            })),
                                        ]}
                                    />
                                    <input
                                        className="w-full rounded-xl border-gray-200 bg-slate-50"
                                        placeholder="Deskripsi item"
                                        value={item.description}
                                        onChange={(e) => updateItem(i, 'description', e.target.value)}
                                    />
                                </div>
                                <input type="number" min="1" className="md:col-span-2 rounded-xl border-gray-200" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value) || 1)} />
                                <div className="md:col-span-3 relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-gray-400">Rp</span>
                                    <input type="text" inputMode="numeric" className="w-full rounded-xl border-gray-200 pl-10" value={formatRupiahInput(item.unit_price)} onChange={(e) => updateUnitPrice(i, e.target.value)} placeholder="0" />
                                </div>
                                <div className="md:col-span-1 text-sm font-bold flex items-center">Rp {((item.quantity || 0) * (item.unit_price || 0)).toLocaleString('id-ID')}</div>
                                <button type="button" onClick={() => removeItem(i)} className="md:col-span-1 text-sm text-rose-600 font-bold">Hapus</button>
                            </div>
                        ))}
                    </div>
                    )}

                    {step === 3 && (
                        <div className="bg-white border border-[#E5EAF3] rounded-2xl p-6 space-y-3">
                            <h2 className="text-lg font-black text-[#4722B3]">Review Tagihan</h2>
                            <div className="text-sm text-slate-700">Nomor: <span className="font-bold">{data.invoice_number || '-'}</span></div>
                            <div className="text-sm text-slate-700">Pelanggan: <span className="font-bold">{selectedCustomer?.name || '-'}</span></div>
                            <div className="text-sm text-slate-700">Tanggal: <span className="font-bold">{data.invoice_date || '-'}</span></div>
                            <div className="text-sm text-slate-700">Jatuh Tempo: <span className="font-bold">{data.due_date || '-'}</span></div>
                            <div className="text-sm text-slate-700">Jumlah Item: <span className="font-bold">{data.items.length}</span></div>
                            <div className="text-sm text-slate-700">Kirim Email: <span className="font-bold">{data.send_email ? 'Ya' : 'Tidak'}</span></div>
                            <div className="text-lg font-black text-[#1f2937] pt-2 border-t">Total: Rp {total.toLocaleString('id-ID')}</div>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="text-lg font-black">Total: Rp {total.toLocaleString('id-ID')}</div>
                        <div className="flex gap-3">
                            <Link href={route('invoices.index')} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold">Batal</Link>
                            {step > 1 && (
                                <button type="button" onClick={() => setStep((prev) => Math.max(prev - 1, 1))} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-slate-600">
                                    Kembali
                                </button>
                            )}
                            {step < 3 ? (
                                <button type="button" onClick={nextStep} disabled={!has_customers} className="px-4 py-2 rounded-xl bg-[#5B33CC] text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed">Lanjut</button>
                            ) : (
                                <button disabled={processing} className="px-4 py-2 rounded-xl bg-[#5B33CC] text-white text-sm font-bold">{processing ? 'Menyimpan...' : 'Simpan Tagihan'}</button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
