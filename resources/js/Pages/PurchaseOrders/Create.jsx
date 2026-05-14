import DashboardLayout from '@/Layouts/DashboardLayout';
import CustomDropdown from '@/Components/CustomDropdown';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';
import { ArrowLeft, Trash2, Plus, FileText, Building2, CalendarClock, Wallet, Package, Lock, ArrowRight, CircleAlert } from 'lucide-react';

// Inline gate banner — shown when a prerequisite is missing
const SetupGate = ({ icon: Icon, color, title, description, href, linkLabel }) => (
    <div
        className="flex items-start gap-4 rounded-2xl border px-5 py-4 mb-4"
        style={{ backgroundColor: `${color}0D`, borderColor: `${color}30` }}
    >
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black" style={{ color }}>{title}</p>
            <p className="mt-0.5 text-[12px] font-semibold text-gray-500">{description}</p>
            <Link
                href={href}
                className="inline-flex items-center gap-1.5 mt-2 text-[12px] font-bold hover:underline"
                style={{ color }}
            >
                {linkLabel} <ArrowRight className="w-3 h-3" />
            </Link>
        </div>
        <CircleAlert className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color }} />
    </div>
);

// Field overlay that locks interaction when locked=true
const LockableField = ({ locked, children, label = "Belum ada pemasok" }) => (
    <div className={`relative ${locked ? 'pointer-events-none select-none' : ''}`}>
        {children}
        {locked && (
            <div className="absolute inset-0 rounded-lg bg-gray-50/80 backdrop-blur-[1px] flex items-center justify-center gap-2 border border-dashed border-gray-300">
                <Lock className="w-4 h-4 text-gray-400" />
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{label}</span>
            </div>
        )}
    </div>
);

function ProductSelect({ value, onChange, products, className }) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef(null);
    const selected = products.find(p => String(p.id) === String(value));

    React.useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button type="button" onClick={() => setOpen(!open)} className={`${className} text-left flex items-center gap-2`}>
                {selected ? (
                    <>
                        <img src={selected.image ? `/storage/${selected.image}` : '/images/placeholder-product.png'} className="w-6 h-6 rounded object-cover flex-shrink-0" alt="" />
                        <span className="truncate">{selected.name}</span>
                    </>
                ) : <span className="text-gray-400">Pilih produk</span>}
            </button>
            {open && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {products.map(p => (
                        <div key={p.id} onClick={() => { onChange(String(p.id)); setOpen(false); }} className="flex items-center gap-2 px-3 py-2 hover:bg-violet-50 cursor-pointer">
                            <img src={p.image ? `/storage/${p.image}` : '/images/placeholder-product.png'} className="w-8 h-8 rounded object-cover flex-shrink-0" alt="" />
                            <div className="min-w-0">
                                <div className="text-sm font-semibold text-gray-700 truncate">{p.name}</div>
                                <div className="text-[10px] text-gray-400">{p.sku}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Create({ suppliers, products, autoPoNumber, operationalWarehouse, has_suppliers = true }) {
    const { data, setData, post, processing } = useForm({
        po_number: autoPoNumber,
        supplier_id: '',
        warehouse_id: operationalWarehouse?.id ? String(operationalWarehouse.id) : '',
        order_date: new Date().toISOString().split('T')[0],
        expected_date: '',
        notes: '',
        items: []
    });

    const addItem = () => setData('items', [...data.items, { product_id: '', quantity: 1, unit_price: 0, batch_number: '', expired_date: '' }]);
    const removeItem = (idx) => setData('items', data.items.filter((_, i) => i !== idx));
    const upd = (i, f, v) => { const n = [...data.items]; n[i][f] = v; setData('items', n); };
    const formatRupiahInput = (value) => {
        if (value === '' || value === null || typeof value === 'undefined') return '';
        const numeric = Number(String(value).replace(/[^\d]/g, ''));
        if (Number.isNaN(numeric)) return '';
        return numeric.toLocaleString('id-ID');
    };
    const updateUnitPrice = (index, rawValue) => {
        const digitsOnly = String(rawValue).replace(/[^\d]/g, '');
        upd(index, 'unit_price', digitsOnly === '' ? '' : Number(digitsOnly));
    };
    const total = () => data.items.reduce((s, i) => s + (i.quantity * i.unit_price), 0);
    const submit = () => post(route('purchase-orders.store'));
    const [step, setStep] = React.useState(1);
    const [stepError, setStepError] = React.useState('');

    const inp = 'w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 focus:border-indigo-500';

    return (
        <DashboardLayout>
            <Head title="Buat Pesanan" />
            <div className="pb-12 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={route('purchase-orders.index')} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 text-sm">
                            <ArrowLeft className="w-4 h-4" />Kembali
                        </Link>
                        <h1 className="text-[22px] font-black text-[#4722B3]">Buat Pesanan Pembelian</h1>
                    </div>
                    <div className="text-xs font-bold text-slate-500">Langkah {step} dari 3</div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div className={`rounded-lg border px-3 py-2 text-center text-xs font-bold ${step >= 1 ? 'border-violet-500 text-violet-700 bg-violet-50' : 'border-slate-200 text-slate-500'}`}>1. Info PO</div>
                    <div className={`rounded-lg border px-3 py-2 text-center text-xs font-bold ${step >= 2 ? 'border-violet-500 text-violet-700 bg-violet-50' : 'border-slate-200 text-slate-500'}`}>2. Item Barang</div>
                    <div className={`rounded-lg border px-3 py-2 text-center text-xs font-bold ${step >= 3 ? 'border-violet-500 text-violet-700 bg-violet-50' : 'border-slate-200 text-slate-500'}`}>3. Review</div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-semibold">No. Pesanan</div>
                            <FileText className="w-4 h-4 text-[#4722B3]" />
                        </div>
                        <div className="text-sm font-black text-[#4722B3] mt-1">{data.po_number || '-'}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-semibold">Pemasok</div>
                            <Building2 className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="text-sm font-black text-slate-700 mt-1">
                            {suppliers.find((s) => String(s.id) === String(data.supplier_id))?.name || 'Belum dipilih'}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-semibold">Tanggal Pesanan</div>
                            <CalendarClock className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="text-sm font-black text-slate-700 mt-1">{data.order_date || '-'}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-semibold">Item</div>
                            <Package className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-2xl font-black text-emerald-600 mt-1">{data.items.length}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-4 sm:col-span-2 xl:col-span-1">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-semibold">Total Pesanan</div>
                            <Wallet className="w-4 h-4 text-slate-700" />
                        </div>
                        <div className="text-xl font-black text-[#1f2937] mt-1">Rp {total().toLocaleString('id-ID')}</div>
                    </div>
                </div>

                {/* Setup Gates */}
                <div className="space-y-3">
                    {!has_suppliers && (
                        <SetupGate
                            icon={Building2}
                            color="#7C3AED"
                            title="Data pemasok belum ada"
                            description="Purchase Order wajib memiliki pemasok aktif. Tambahkan minimal satu pemasok terlebih dahulu sebelum membuat PO."
                            href="/supplier"
                            linkLabel="Tambah Pemasok Sekarang"
                        />
                    )}
                    {products.length === 0 && (
                        <SetupGate
                            icon={Package}
                            color="#3B82F6"
                            title="Data produk belum tersedia"
                            description="Anda belum memiliki produk untuk dipesan. Silakan buat produk terlebih dahulu di menu Inventaris agar bisa dimasukkan ke dalam PO."
                            href="/inventory"
                            linkLabel="Tambah Produk Sekarang"
                        />
                    )}
                </div>

                {stepError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                        {stepError}
                    </div>
                )}

                {step === 1 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                            <div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Nomor Pesanan</div>
                                <input value={data.po_number} readOnly disabled className={`${inp} bg-gray-100 text-gray-500 cursor-not-allowed`} />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase">Pemasok</div>
                                <LockableField locked={!has_suppliers}>
                                    <CustomDropdown
                                        value={data.supplier_id}
                                        onChange={(nextValue) => setData('supplier_id', nextValue)}
                                        options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
                                        placeholder={has_suppliers ? 'Pilih' : 'Belum ada pemasok'}
                                        disabled={!has_suppliers}
                                        unstyled
                                        triggerClassName="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </LockableField>
                            </div>
                            <div><div className="text-[10px] font-bold text-gray-400 uppercase">Tanggal</div><input type="date" value={data.order_date} onChange={e => setData('order_date', e.target.value)} className={inp} /></div>
                            <div><div className="text-[10px] font-bold text-gray-400 uppercase">Perkiraan</div><input type="date" value={data.expected_date} onChange={e => setData('expected_date', e.target.value)} className={inp} /></div>
                            <div><div className="text-[10px] font-bold text-gray-400 uppercase">Catatan</div><input value={data.notes} onChange={e => setData('notes', e.target.value)} placeholder="Opsional" className={inp} /></div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-black text-[#4722B3]">Item Pesanan</h3>
                            <button onClick={addItem} disabled={products.length === 0} className={`flex items-center gap-1 px-3 py-1.5 font-bold rounded-lg text-xs ${products.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#5B33CC] text-white hover:bg-indigo-700'}`}>
                                <Plus className="w-3.5 h-3.5" />Tambah Item
                            </button>
                        </div>

                        <LockableField locked={products.length === 0} label="Data produk kosong">
                            <div className="space-y-2">
                                {data.items.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-400 uppercase px-2">
                                            <div className="col-span-5">Produk</div>
                                            <div className="col-span-2">Jumlah</div>
                                            <div className="col-span-2">Harga</div>
                                            <div className="col-span-2">Subtotal</div>
                                            <div className="col-span-1"></div>
                                        </div>
                                        {data.items.map((item, i) => (
                                            <div key={i} className="grid grid-cols-12 gap-2 items-center">
                                                <div className="col-span-5"><ProductSelect value={item.product_id} onChange={v => upd(i, 'product_id', v)} products={products} className={inp} /></div>
                                                <div className="col-span-2"><input type="number" min="1" value={item.quantity} onChange={e => upd(i, 'quantity', parseInt(e.target.value) || 1)} className={inp} /></div>
                                                <div className="col-span-2">
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-gray-400">Rp</span>
                                                        <input type="text" inputMode="numeric" value={formatRupiahInput(item.unit_price)} onChange={e => updateUnitPrice(i, e.target.value)} className={`${inp} pl-10`} placeholder="0" />
                                                    </div>
                                                </div>
                                                <div className="col-span-2 py-2 font-black text-gray-700">{(item.quantity * item.unit_price).toLocaleString()}</div>
                                                <div className="col-span-1"><button onClick={() => removeItem(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button></div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/30">
                                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
                                            <Package className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-400">Belum ada item pesanan.</p>
                                        <p className="text-[11px] text-gray-400 mt-1">Klik tombol <span className="text-[#5B33CC]">Tambah Item</span> untuk mulai memasukkan produk.</p>
                                    </div>
                                )}
                            </div>
                        </LockableField>

                        <div className="mt-3 pt-3 border-t flex justify-end">
                            <div className="text-right"><div className="text-[10px] font-bold text-gray-400">TOTAL</div><div className="text-lg font-black text-[#4722B3]">Rp {total().toLocaleString()}</div></div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                        <h3 className="font-black text-[#4722B3]">Review Pesanan</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div><span className="text-gray-400 text-[10px] font-bold uppercase block">Pemasok</span><span className="font-bold text-slate-700">{suppliers.find((s) => String(s.id) === String(data.supplier_id))?.name || '-'}</span></div>
                            <div><span className="text-gray-400 text-[10px] font-bold uppercase block">Tanggal</span><span className="font-bold text-slate-700">{data.order_date || '-'}</span></div>
                            <div><span className="text-gray-400 text-[10px] font-bold uppercase block">Perkiraan Tiba</span><span className="font-bold text-slate-700">{data.expected_date || '-'}</span></div>
                            <div><span className="text-gray-400 text-[10px] font-bold uppercase block">Catatan</span><span className="font-bold text-slate-700">{data.notes || '-'}</span></div>
                        </div>
                        <div className="border-t pt-3">
                            <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Daftar Item ({data.items.length})</div>
                            <div className="space-y-2">
                                {data.items.map((item, i) => {
                                    const prod = products.find(p => String(p.id) === String(item.product_id));
                                    return (
                                        <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                            <img src={prod?.image ? `/storage/${prod.image}` : '/images/placeholder-product.png'} className="w-9 h-9 rounded object-cover flex-shrink-0" alt="" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-slate-800 truncate">{prod?.name || '-'}</div>
                                                <div className="text-[11px] text-gray-400">{prod?.sku || ''}</div>
                                            </div>
                                            <div className="text-xs text-slate-600 text-right whitespace-nowrap">{item.quantity} × Rp {Number(item.unit_price).toLocaleString('id-ID')}</div>
                                            <div className="text-sm font-black text-[#4722B3] text-right whitespace-nowrap w-28">Rp {(item.quantity * item.unit_price).toLocaleString('id-ID')}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="border-t pt-3 flex justify-end">
                            <div className="text-right"><div className="text-[10px] font-bold text-gray-400">TOTAL</div><div className="text-xl font-black text-[#4722B3]">Rp {total().toLocaleString('id-ID')}</div></div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pt-2">
                    <Link href={route('purchase-orders.index')} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-bold text-sm hover:bg-gray-50">Batal</Link>
                    <div className="flex gap-2">
                        {step > 1 && (
                            <button type="button" onClick={() => setStep(step - 1)} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-bold text-sm hover:bg-gray-50">Kembali</button>
                        )}
                        {step < 3 ? (
                            (() => {
                                let isStepInvalid = false;
                                if (step === 1) isStepInvalid = !has_suppliers || !data.supplier_id || !data.order_date;
                                if (step === 2) {
                                    isStepInvalid = !data.items.length || data.items.some(item => !item.product_id || Number(item.quantity) <= 0 || Number(item.unit_price) < 0);
                                }

                                return (
                                    <div className="flex items-center">
                                        {isStepInvalid && (
                                            <div className="mr-3 flex items-center gap-1.5 text-red-500 animate-pulse">
                                                <CircleAlert className="w-3.5 h-3.5" />
                                                <span className="text-[11px] font-black uppercase tracking-tight">Data belum lengkap</span>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            disabled={isStepInvalid}
                                            onClick={() => {
                                                setStepError('');
                                                setStep(step + 1);
                                            }}
                                            className={`px-5 py-2 font-bold rounded-lg text-sm transition-all ${
                                                isStepInvalid
                                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200'
                                                    : 'bg-[#5B33CC] text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                                        }`}
                                        >
                                            Lanjut
                                        </button>
                                    </div>
                                );
                            })()
                        ) : (
                            <button type="button" onClick={submit} disabled={processing} className="px-5 py-2 bg-[#5B33CC] text-white font-bold rounded-lg text-sm hover:bg-indigo-700">{processing ? 'Menyimpan...' : 'Simpan Pesanan'}</button>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
