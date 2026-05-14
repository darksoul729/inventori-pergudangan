import DashboardLayout from '@/Layouts/DashboardLayout';
import CustomDropdown from '@/Components/CustomDropdown';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowRightLeft, PackagePlus, Package, ClipboardList, Boxes, Lock, CircleAlert, LayoutGrid } from 'lucide-react';

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

export default function RackAllocation({ warehouse, racks = [], unplacedProducts = [], recentTransfers = [], can_create = false, can_approve = false, status, has_racks = true, has_products = true }) {
    const { auth } = usePage().props;
    const currentUserId = Number(auth?.user?.id);

    const [activeTab, setActiveTab] = useState('transfer');
    const [transferStep, setTransferStep] = useState(1);
    const [putawayStep, setPutawayStep] = useState(1);
    const [confirmState, setConfirmState] = useState({ open: false, mode: 'transfer' });
    const [searchTerm, setSearchTerm] = useState('');
    const normalizedQuery = searchTerm.trim().toLowerCase();

    const transferForm = useForm({ from_rack_id: '', to_rack_id: '', product_id: '', quantity: 1, notes: '', type: 'transfer' });
    const putawayForm = useForm({ from_rack_id: '', to_rack_id: '', product_id: '', quantity: 1, notes: '', type: 'putaway' });

    const fromRack = useMemo(() => racks.find((r) => String(r.id) === String(transferForm.data.from_rack_id)), [racks, transferForm.data.from_rack_id]);
    const selectedStock = useMemo(() => fromRack?.stocks?.find((s) => String(s.product_id) === String(transferForm.data.product_id)), [fromRack, transferForm.data.product_id]);
    const toRack = useMemo(() => racks.find((r) => String(r.id) === String(transferForm.data.to_rack_id)), [racks, transferForm.data.to_rack_id]);
    const putawayProduct = useMemo(() => unplacedProducts.find((p) => String(p.id) === String(putawayForm.data.product_id)), [unplacedProducts, putawayForm.data.product_id]);
    const putawayToRack = useMemo(() => racks.find((r) => String(r.id) === String(putawayForm.data.to_rack_id)), [racks, putawayForm.data.to_rack_id]);

    const filteredRacks = useMemo(() => normalizedQuery ? racks.filter((r) => `${r.code} ${r.name} ${r.zone}`.toLowerCase().includes(normalizedQuery)) : racks, [normalizedQuery, racks]);
    const filteredUnplaced = useMemo(() => normalizedQuery ? unplacedProducts.filter((p) => `${p.sku} ${p.name}`.toLowerCase().includes(normalizedQuery)) : unplacedProducts, [normalizedQuery, unplacedProducts]);
    const filteredRecent = useMemo(() => normalizedQuery ? recentTransfers.filter((t) => `${t.number} ${t.status}`.toLowerCase().includes(normalizedQuery)) : recentTransfers, [normalizedQuery, recentTransfers]);

    const hasOnlyOneRack = racks.length === 1;
    const transferFromRackOptions = filteredRacks.map((r) => ({ value: r.id, label: `${r.code} - ${r.name} (${r.used}/${r.capacity})` }));
    const transferToRackOptions = filteredRacks
        .filter((r) => String(r.id) !== String(transferForm.data.from_rack_id))
        .map((r) => ({ value: r.id, label: `${r.code} - ${r.name} (${r.available_capacity} kosong)` }));
    const transferProductOptions = (fromRack?.stocks || []).map((s) => ({ value: s.product_id, label: `${s.sku} - ${s.name} (${s.available_quantity} tersedia)` }));
    const putawayProductOptions = filteredUnplaced.map((p) => ({ value: p.id, label: `${p.sku} - ${p.name} (${p.unplaced_stock} ${p.unit})` }));
    const putawayRackOptions = filteredRacks.map((r) => ({ value: r.id, label: `${r.code} - ${r.name} (${r.available_capacity} kosong)` }));

    const availableQty = selectedStock?.available_quantity ?? 0;
    const destCapacity = toRack?.available_capacity ?? 0;

    const canMoveToTransferReview = Boolean(transferForm.data.from_rack_id && transferForm.data.to_rack_id && transferForm.data.product_id && Number(transferForm.data.quantity) > 0);
    const canMoveToPutawayReview = Boolean(putawayForm.data.product_id && putawayForm.data.to_rack_id && Number(putawayForm.data.quantity) > 0);

    useEffect(() => {
        if (hasOnlyOneRack) {
            const onlyRackId = String(racks[0]?.id || '');
            if (onlyRackId && String(putawayForm.data.to_rack_id) !== onlyRackId) putawayForm.setData('to_rack_id', onlyRackId);
            if (onlyRackId && String(transferForm.data.from_rack_id) !== onlyRackId) transferForm.setData('from_rack_id', onlyRackId);
        }
    }, [hasOnlyOneRack, racks, putawayForm, transferForm]);

    const openConfirm = (mode) => setConfirmState({ open: true, mode });
    const closeConfirm = () => setConfirmState({ open: false, mode: 'transfer' });

    const confirmSubmit = () => {
        if (confirmState.mode === 'transfer') {
            transferForm.post(route('rack.allocation.transfers.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    transferForm.reset('product_id', 'quantity', 'notes');
                    setTransferStep(1);
                    closeConfirm();
                },
            });
            return;
        }

        putawayForm.post(route('rack.allocation.transfers.store'), {
            preserveScroll: true,
            onSuccess: () => {
                putawayForm.reset('product_id', 'quantity', 'notes');
                setPutawayStep(1);
                closeConfirm();
            },
        });
    };

    return (
        <DashboardLayout headerSearchPlaceholder="Cari rak atau produk..." searchValue={searchTerm} onSearch={setSearchTerm}>
            <Head title="Atur Rak & Pindah Stok" />

            <div className="pb-12 pt-2">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-[28px] font-black text-[#4722B3] tracking-tight">Atur Rak & Pindah Stok</h1>
                        <p className="text-[13px] font-semibold text-gray-500 mt-1">{warehouse?.name || 'Gudang Utama'}{warehouse?.location ? ` — ${warehouse.location}` : ''}</p>
                    </div>
                    <Link href="/warehouse" className="flex items-center gap-2 px-5 py-2.5 border border-[#E5EAF3] bg-white hover:bg-gray-50 text-[#5B33CC] font-bold rounded-xl text-[13px] transition-colors">
                        <ArrowLeft className="w-4 h-4" /><span>Kembali</span>
                    </Link>
                </div>

                {status && <div className="mb-6 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-5 py-3 text-[13px] font-bold">{status}</div>}

                {(!has_racks || !has_products) && (
                    <div className="mb-2">
                        {!has_racks && (
                            <SetupGate
                                icon={LayoutGrid}
                                color="#D97706"
                                title="Rak penyimpanan belum dibuat"
                                description="Transfer stok dan put-away tidak bisa dilakukan tanpa rak. Buat zona dan rak di menu Layout Gudang terlebih dahulu."
                                href="/warehouse"
                                linkLabel="Buat Zona & Rak Sekarang"
                            />
                        )}
                        {!has_products && (
                            <SetupGate
                                icon={Package}
                                color="#7C3AED"
                                title="Belum ada produk terdaftar"
                                description="Tambahkan produk ke inventaris terlebih dahulu sebelum melakukan pengaturan rak."
                                href="/inventory/create"
                                linkLabel="Tambah Produk Sekarang"
                            />
                        )}
                    </div>
                )}

                <div className="flex gap-3 mb-6">
                    <button type="button" onClick={() => { setActiveTab('transfer'); setPutawayStep(1); }} className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold transition ${activeTab === 'transfer' ? 'bg-[#5B33CC] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        <ArrowRightLeft className="w-4 h-4" />Pindah Antar Rak
                    </button>
                    <button type="button" onClick={() => { setActiveTab('putaway'); setTransferStep(1); }} className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold transition ${activeTab === 'putaway' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        <PackagePlus className="w-4 h-4" />Masukkan ke Rak
                        {filteredUnplaced.length > 0 && <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${activeTab === 'putaway' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>{filteredUnplaced.length}</span>}
                    </button>
                </div>

                {activeTab === 'transfer' ? (
                    !has_racks || !has_products ? (
                        <div className="bg-white rounded-[24px] p-8 border border-[#E5EAF3] mb-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center"><ArrowRightLeft className="w-5 h-5" /></div>
                                <div><h2 className="text-[16px] font-black text-[#4722B3]">Pindah Antar Rak</h2><p className="text-[12px] font-semibold text-gray-400">Selesaikan setup terlebih dahulu</p></div>
                            </div>
                            <LockedPanel icon={Lock} title={!has_racks ? 'Rak belum tersedia' : 'Produk belum ada'} description={!has_racks ? 'Buat zona & rak di menu Layout Gudang untuk mulai transfer.' : 'Tambahkan produk ke inventaris untuk mulai transfer.'} />
                        </div>
                    ) : can_create ? (
                        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3] mb-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5B33CC] flex items-center justify-center"><ArrowRightLeft className="w-5 h-5" /></div>
                                <div><h2 className="text-[16px] font-black text-[#4722B3]">Pindah Antar Rak</h2><p className="text-[12px] font-semibold text-gray-400">Pindahkan stok dari rak asal ke rak tujuan</p></div>
                            </div>

                            <div className="mb-6 flex items-center gap-2 text-[12px] font-bold">
                                <span className={`px-3 py-1 rounded-full border ${transferStep === 1 ? 'bg-indigo-50 text-[#4722B3] border-indigo-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>1. Isi Data</span>
                                <span className="text-gray-300">→</span>
                                <span className={`px-3 py-1 rounded-full border ${transferStep === 2 ? 'bg-indigo-50 text-[#4722B3] border-indigo-200' : 'bg-white text-gray-400 border-gray-200'}`}>2. Review</span>
                            </div>

                            {transferStep === 1 ? (
                                <>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                                        <div><label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Rak Asal</label>
                                            <CustomDropdown value={transferForm.data.from_rack_id} onChange={(nextValue) => transferForm.setData({ ...transferForm.data, from_rack_id: nextValue, product_id: '', to_rack_id: '', quantity: 1 })} options={transferFromRackOptions} placeholder="Pilih rak asal" disabled={hasOnlyOneRack} />
                                        </div>
                                        <div className="hidden lg:flex items-center justify-center"><div className="w-10 h-10 rounded-full bg-[#f8f9fb] border border-gray-100 flex items-center justify-center text-[#5B33CC]"><ArrowRight className="w-5 h-5" /></div></div>
                                        <div><label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Rak Tujuan</label>
                                            <CustomDropdown value={transferForm.data.to_rack_id} onChange={(nextValue) => transferForm.setData('to_rack_id', nextValue)} options={transferToRackOptions} placeholder="Pilih rak tujuan" disabled={hasOnlyOneRack} />
                                            {hasOnlyOneRack && <p className="mt-2 text-[11px] font-semibold text-amber-600">Transfer butuh minimal 2 rak.</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                                        <div className="lg:col-span-2"><label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Produk</label>
                                            <CustomDropdown value={transferForm.data.product_id} onChange={(nextValue) => transferForm.setData('product_id', nextValue)} options={transferProductOptions} placeholder={fromRack ? 'Pilih produk' : 'Pilih rak asal dulu'} disabled={!fromRack} />
                                        </div>
                                        <div><label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Jumlah</label>
                                            <input type="number" min="1" max={availableQty || undefined} className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC] px-4 py-3 rounded-xl font-black text-[#4722B3]" value={transferForm.data.quantity} onChange={(e) => transferForm.setData('quantity', e.target.value)} required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]"><div className="text-[11px] font-extrabold text-gray-500 mb-1">Stok Tersedia</div><div className="text-[22px] font-black text-[#4722B3]">{availableQty}</div></div>
                                        <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]"><div className="text-[11px] font-extrabold text-gray-500 mb-1">Kapasitas Tujuan</div><div className="text-[22px] font-black text-[#4722B3]">{destCapacity}</div></div>
                                        <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]"><div className="text-[11px] font-extrabold text-gray-500 mb-1">Total Stok</div><div className="text-[22px] font-black text-emerald-600">Tetap</div></div>
                                    </div>

                                    <div className="mb-6"><label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Catatan</label>
                                        <textarea rows="2" className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC] px-4 py-3 rounded-xl text-[13px] font-semibold text-gray-600 resize-none" placeholder="Opsional..." value={transferForm.data.notes} onChange={(e) => transferForm.setData('notes', e.target.value)} />
                                    </div>
                                </>
                            ) : (
                                <div className="rounded-2xl border border-[#E5EAF3] bg-[#fafbff] p-5 mb-6 space-y-3 text-[13px] font-semibold text-gray-600">
                                    <div><span className="text-gray-400">Rak Asal:</span> {fromRack ? `${fromRack.code} - ${fromRack.name}` : '-'}</div>
                                    <div><span className="text-gray-400">Rak Tujuan:</span> {toRack ? `${toRack.code} - ${toRack.name}` : '-'}</div>
                                    <div><span className="text-gray-400">Produk:</span> {selectedStock ? `${selectedStock.sku} - ${selectedStock.name}` : '-'}</div>
                                    <div><span className="text-gray-400">Jumlah:</span> {transferForm.data.quantity}</div>
                                    <div><span className="text-gray-400">Catatan:</span> {transferForm.data.notes || '-'}</div>
                                </div>
                            )}

                            <div className="pt-5 border-t border-gray-100 flex justify-end gap-3">
                                <Link href="/warehouse" className="px-5 py-2.5 border border-[#E5EAF3] bg-white text-[#5B33CC] font-bold rounded-xl text-[13px] hover:bg-gray-50">Batal</Link>
                                {transferStep === 1 ? (
                                    <button type="button" onClick={() => setTransferStep(2)} disabled={!canMoveToTransferReview || hasOnlyOneRack} className="px-6 py-2.5 bg-[#5B33CC] shadow-[0_4px_14px_rgba(89,50,201,0.3)] hover:bg-indigo-700 text-white font-bold rounded-xl text-[13px] disabled:opacity-60 disabled:cursor-not-allowed">Lanjut Review</button>
                                ) : (
                                    <>
                                        <button type="button" onClick={() => setTransferStep(1)} className="px-5 py-2.5 border border-[#E5EAF3] bg-white text-gray-600 font-bold rounded-xl text-[13px] hover:bg-gray-50">Kembali Edit</button>
                                        <button type="button" onClick={() => openConfirm('transfer')} disabled={transferForm.processing || hasOnlyOneRack} className="px-6 py-2.5 bg-[#5B33CC] shadow-[0_4px_14px_rgba(89,50,201,0.3)] hover:bg-indigo-700 text-white font-bold rounded-xl text-[13px] disabled:opacity-60 disabled:cursor-not-allowed">{transferForm.processing ? 'Menyimpan...' : 'Simpan'}</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3] mb-6">
                            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center"><ArrowRightLeft className="w-5 h-5" /></div>
                            <div><h2 className="text-[16px] font-black text-[#4722B3]">Pindah Antar Rak</h2><p className="text-[13px] font-semibold text-gray-500">Anda tidak punya izin untuk membuat perpindahan.</p></div></div>
                        </div>
                    )
                ) : (
                    !has_racks || !has_products ? (
                        <div className="bg-white rounded-[24px] p-8 border border-[#E5EAF3] mb-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 text-teal-400 flex items-center justify-center"><PackagePlus className="w-5 h-5" /></div>
                                <div><h2 className="text-[16px] font-black text-[#4722B3]">Masukkan ke Rak</h2><p className="text-[12px] font-semibold text-gray-400">Selesaikan setup terlebih dahulu</p></div>
                            </div>
                            <LockedPanel icon={Lock} title={!has_racks ? 'Rak belum tersedia' : 'Produk belum ada'} description={!has_racks ? 'Buat zona & rak di menu Layout Gudang untuk mulai put-away.' : 'Tambahkan produk ke inventaris untuk mulai put-away.'} />
                        </div>
                    ) : (
                        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3] mb-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center"><PackagePlus className="w-5 h-5" /></div>
                                <div><h2 className="text-[16px] font-black text-[#4722B3]">Masukkan ke Rak</h2><p className="text-[12px] font-semibold text-gray-400">Tempatkan barang yang belum punya rak</p></div>
                            </div>

                            <div className="mb-6 flex items-center gap-2 text-[12px] font-bold">
                                <span className={`px-3 py-1 rounded-full border ${putawayStep === 1 ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>1. Isi Data</span>
                                <span className="text-gray-300">→</span>
                                <span className={`px-3 py-1 rounded-full border ${putawayStep === 2 ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-white text-gray-400 border-gray-200'}`}>2. Review</span>
                            </div>

                            {filteredUnplaced.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-center"><p className="text-[14px] font-black text-emerald-700">Semua produk sudah ditempatkan</p></div>
                            ) : (
                                <>
                                    {putawayStep === 1 ? (
                                        <>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                                                <div><label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Barang Belum di Rak</label>
                                                    <CustomDropdown value={putawayForm.data.product_id} onChange={(nextValue) => putawayForm.setData({ ...putawayForm.data, product_id: nextValue, quantity: 1 })} options={putawayProductOptions} placeholder="Pilih produk" tone="teal" />
                                                </div>
                                                <div><label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Rak Tujuan</label>
                                                    <CustomDropdown value={putawayForm.data.to_rack_id} onChange={(nextValue) => putawayForm.setData('to_rack_id', nextValue)} options={putawayRackOptions} placeholder="Pilih rak" disabled={hasOnlyOneRack} tone="teal" />
                                                    {hasOnlyOneRack && <p className="mt-2 text-[11px] font-semibold text-gray-500">Rak otomatis dipilih karena hanya ada 1 rak.</p>}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mb-6">
                                                <div><label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Jumlah</label>
                                                    <input type="number" min="1" max={putawayProduct?.unplaced_stock || undefined} className="w-full bg-[#f8f9fb] border border-transparent focus:border-teal-600 focus:ring-1 focus:ring-teal-600 px-4 py-3 rounded-xl font-black text-[#4722B3]" value={putawayForm.data.quantity} onChange={(e) => putawayForm.setData('quantity', e.target.value)} required /></div>
                                                <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]"><div className="text-[11px] font-extrabold text-gray-500 mb-1">Belum di Rak</div><div className="text-[22px] font-black text-[#4722B3]">{putawayProduct?.unplaced_stock ?? 0}</div></div>
                                                <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]"><div className="text-[11px] font-extrabold text-gray-500 mb-1">Kapasitas</div><div className="text-[22px] font-black text-[#4722B3]">{putawayToRack?.available_capacity ?? 0}</div></div>
                                            </div>

                                            <div className="mb-6"><label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Catatan</label>
                                                <textarea rows="2" className="w-full bg-[#f8f9fb] border border-transparent focus:border-teal-600 focus:ring-1 focus:ring-teal-600 px-4 py-3 rounded-xl text-[13px] font-semibold text-gray-600 resize-none" placeholder="Opsional..." value={putawayForm.data.notes} onChange={(e) => putawayForm.setData('notes', e.target.value)} /></div>
                                        </>
                                    ) : (
                                        <div className="rounded-2xl border border-[#E5EAF3] bg-[#f7fcfb] p-5 mb-6 space-y-3 text-[13px] font-semibold text-gray-600">
                                            <div><span className="text-gray-400">Produk:</span> {putawayProduct ? `${putawayProduct.sku} - ${putawayProduct.name}` : '-'}</div>
                                            <div><span className="text-gray-400">Rak Tujuan:</span> {putawayToRack ? `${putawayToRack.code} - ${putawayToRack.name}` : '-'}</div>
                                            <div><span className="text-gray-400">Jumlah:</span> {putawayForm.data.quantity}</div>
                                            <div><span className="text-gray-400">Catatan:</span> {putawayForm.data.notes || '-'}</div>
                                        </div>
                                    )}

                                    <div className="pt-5 border-t border-gray-100 flex justify-end gap-3">
                                        <Link href="/warehouse" className="px-5 py-2.5 border border-[#E5EAF3] bg-white text-teal-600 font-bold rounded-xl text-[13px] hover:bg-gray-50">Batal</Link>
                                        {putawayStep === 1 ? (
                                            <button type="button" onClick={() => setPutawayStep(2)} disabled={!canMoveToPutawayReview} className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-[13px] disabled:opacity-60 disabled:cursor-not-allowed">Lanjut Review</button>
                                        ) : (
                                            <>
                                                <button type="button" onClick={() => setPutawayStep(1)} className="px-5 py-2.5 border border-[#E5EAF3] bg-white text-gray-600 font-bold rounded-xl text-[13px] hover:bg-gray-50">Kembali Edit</button>
                                                <button type="button" onClick={() => openConfirm('putaway')} disabled={putawayForm.processing} className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-[13px]">{putawayForm.processing ? 'Menyimpan...' : 'Simpan'}</button>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )
                )}

                <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3] mb-6">
                    <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5B33CC] flex items-center justify-center"><Boxes className="w-5 h-5" /></div>
                    <div><h2 className="text-[16px] font-black text-[#4722B3]">Rak Aktif</h2><p className="text-[12px] font-semibold text-gray-400">Daftar rak di gudang ini</p></div></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredRacks.map((rack) => {
                            const fill = rack.capacity > 0 ? Math.min(100, Math.round((rack.used / rack.capacity) * 100)) : 0;
                            return (
                                <div key={rack.id} className="border border-[#E5EAF3] rounded-xl p-4 hover:border-indigo-200 transition">
                                    <div className="flex justify-between">
                                        <div>
                                            <div className="text-[13px] font-black text-[#4722B3]">{rack.code}</div>
                                            <div className="text-[11px] font-bold text-gray-400">{rack.zone}</div>
                                        </div>
                                        <div className="text-[12px] font-black text-gray-600">{rack.used}/{rack.capacity}</div>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full mt-3">
                                        <div className="h-full bg-[#5B33CC] rounded-full" style={{ width: `${fill}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#E5EAF3]">
                    <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5B33CC] flex items-center justify-center"><ClipboardList className="w-5 h-5" /></div>
                    <div><h2 className="text-[16px] font-black text-[#4722B3]">Riwayat Pindah Rak</h2><p className="text-[12px] font-semibold text-gray-400">Daftar perpindahan yang pernah dilakukan</p></div></div>
                    {filteredRecent.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-6 text-center"><p className="text-[14px] font-black text-[#4722B3]">Belum ada riwayat</p></div>
                    ) : (
                        <div className="space-y-3">
                            {filteredRecent.map((t) => (
                                <div key={t.id} className="border border-[#E5EAF3] rounded-xl p-4 hover:border-indigo-200 transition">
                                    <Link href={route('rack.allocation.transfers.show', t.id)} className="block">
                                        <div className="flex items-center justify-between"><div className="text-[13px] font-black text-[#4722B3]">{t.number}</div>
                                        <span className={`text-[10px] font-black rounded-full px-2.5 py-1 uppercase border ${t.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : t.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{t.status}</span></div>
                                        <div className="text-[11px] font-bold text-gray-400 mt-1">{t.date} · {t.operator}</div>
                                        <div className="text-[12px] font-semibold text-gray-600 mt-1 line-clamp-1">{t.notes || '-'}</div>
                                    </Link>
                                    {t.status === 'pending' && can_approve && Number(t.created_by) !== currentUserId && (
                                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                                            <button onClick={() => router.post(route('rack.allocation.transfers.approve', t.id), {}, { preserveScroll: true })} className="flex-1 px-4 py-2 bg-emerald-600 text-white text-[11px] font-bold rounded-xl hover:bg-emerald-700">Setuju</button>
                                            <button onClick={() => router.post(route('rack.allocation.transfers.reject', t.id), {}, { preserveScroll: true })} className="flex-1 px-4 py-2 bg-rose-600 text-white text-[11px] font-bold rounded-xl hover:bg-rose-700">Tolak</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {confirmState.open && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    <button type="button" className="absolute inset-0 bg-black/35" onClick={closeConfirm} />
                    <div className="relative w-[min(92vw,520px)] rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_22px_70px_rgba(0,0,0,0.25)]">
                        <h3 className="text-[18px] font-black text-[#4722B3]">Konfirmasi Penyimpanan</h3>
                        <p className="mt-2 text-[13px] font-semibold text-gray-500">
                            {confirmState.mode === 'transfer'
                                ? 'Pastikan data perpindahan rak sudah benar. Lanjut simpan sekarang?'
                                : 'Pastikan data penempatan rak sudah benar. Lanjut simpan sekarang?'}
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={closeConfirm} className="px-5 py-2.5 rounded-xl border border-[#E5EAF3] bg-white text-gray-600 text-[13px] font-bold hover:bg-gray-50">Batal</button>
                            <button type="button" onClick={confirmSubmit} className={`px-6 py-2.5 rounded-xl text-white text-[13px] font-bold ${confirmState.mode === 'transfer' ? 'bg-[#5B33CC] hover:bg-indigo-700' : 'bg-teal-600 hover:bg-teal-700'}`}>
                                Ya, Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
