import DashboardLayout from '@/Layouts/DashboardLayout';
import CustomDropdown from '@/Components/CustomDropdown';
import { Head, useForm, Link } from '@inertiajs/react';
import React from 'react';
import BackToPanduan from '@/Components/BackToPanduan';
import { ChevronDown, ArrowLeft, Upload, Package, Tag, Scale, ShoppingCart, AlertTriangle, Box, MapPin, FileText, Hash, Lock, Tags, Ruler, LayoutGrid, ArrowRight, CircleAlert } from 'lucide-react';

// Inline setup-gate banner — shown when a prerequisite (category/unit/rack) is missing
const SetupGate = ({ icon: Icon, color, title, description, href, linkLabel }) => (
    <div
        className="flex items-start gap-4 rounded-2xl border px-5 py-4 mb-3"
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

// Wrapper that visually disables a field and shows a lock icon when locked=true
const LockableField = ({ locked, children }) => (
    <div className={`relative ${locked ? 'pointer-events-none select-none' : ''}`}>
        {children}
        {locked && (
            <div className="absolute inset-0 rounded-xl bg-gray-50/80 backdrop-blur-[1px] flex items-center justify-center gap-2 border border-dashed border-gray-300">
                <Lock className="w-4 h-4 text-gray-400" />
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Belum tersedia</span>
            </div>
        )}
    </div>
);

const Section = ({ title, description, children }) => (
    <section className="border-b border-[#E5EAF3] py-6 last:border-b-0">
        <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
            <div>
                <h2 className="text-[15px] font-black text-[#4722B3]">{title}</h2>
                <p className="mt-2 text-[12px] font-semibold text-gray-500">{description}</p>
            </div>
            <div>{children}</div>
        </div>
    </section>
);

const Field = ({ label, error, children, required = false, helper = null, className = '' }) => (
    <div className={className}>
        <label className="mb-2 block text-[11px] font-black text-gray-500 uppercase tracking-wider">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {helper && !error && <div className="mt-2 text-[11px] font-semibold text-gray-400">{helper}</div>}
        {error && <div className="mt-2 text-[11px] font-bold text-red-600">{error}</div>}
    </div>
);

export default function Create({ categories, units, suppliers, warehouses, operationalWarehouse, product = null, isEdit = false, has_racks = true, has_categories = true, has_units = true, has_suppliers = true }) {
    const pageTitle = isEdit ? 'Edit Produk' : 'Tambah Produk Baru';
    const backHref = isEdit && product?.id ? route('inventory.show', product.id) : route('inventory');
    const inputClass = 'block w-full bg-[#f8f9fb] border border-transparent focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC] px-4 py-3 rounded-xl font-bold text-[#4722B3]';
    const selectClass = `${inputClass} appearance-none pr-10 cursor-pointer`;
    const textareaClass = 'block w-full bg-[#f8f9fb] border border-transparent focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC] px-4 py-3 rounded-xl text-[14px] font-semibold text-gray-600 resize-none min-h-[100px]';
    const formatRupiahInput = (value) => {
        if (value === '' || value === null || typeof value === 'undefined') return '';
        const numeric = Number(String(value).replace(/[^\d]/g, ''));
        if (Number.isNaN(numeric)) return '';
        return numeric.toLocaleString('id-ID');
    };
    const handlePriceChange = (field, rawValue) => {
        const digitsOnly = String(rawValue).replace(/[^\d]/g, '');
        addProductForm.setData(field, digitsOnly);
    };

    const addProductForm = useForm({
        sku: product?.sku || '',
        name: product?.name || '',
        category_id: product?.category_id ? String(product.category_id) : '',
        unit_id: product?.unit_id ? String(product.unit_id) : '',
        default_supplier_id: product?.default_supplier_id ? String(product.default_supplier_id) : '',
        initial_stock: 0,
        purchase_price: product?.purchase_price || 0,
        selling_price: product?.selling_price || 0,
        minimum_stock: product?.minimum_stock || 10,
        volume_entry_mode: product?.volume_entry_mode || 'none',
        dimension_unit: product?.dimension_unit || 'mm',
        dimension_length: product?.dimension_length || '',
        dimension_width: product?.dimension_width || '',
        dimension_height: product?.dimension_height || '',
        volume_m3_per_unit: product?.volume_m3_per_unit || '',
        warehouse_id: operationalWarehouse?.id ? String(operationalWarehouse.id) : '',
        rack_id: '',
        description: product?.description || '',
        image: null,
    });

    const buildUpdatePayload = (data) => ({
        sku: data.sku,
        name: data.name,
        category_id: data.category_id,
        unit_id: data.unit_id,
        default_supplier_id: data.default_supplier_id || null,
        purchase_price: data.purchase_price,
        selling_price: data.selling_price,
        minimum_stock: data.minimum_stock,
        description: data.description,
        volume_entry_mode: data.volume_entry_mode,
        dimension_unit: data.dimension_unit,
        dimension_length: data.dimension_length,
        dimension_width: data.dimension_width,
        dimension_height: data.dimension_height,
        volume_m3_per_unit: data.volume_m3_per_unit,
        ...(data.image ? { image: data.image } : {}),
    });

    const buildStorePayload = (data) => ({ ...data, default_supplier_id: data.default_supplier_id || null });
    const [clientValidationMessage, setClientValidationMessage] = React.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setClientValidationMessage('');
        if (!e.currentTarget.checkValidity()) {
            e.currentTarget.reportValidity();
            setClientValidationMessage('Form belum lengkap. Isi semua field wajib.');
            return;
        }
        if (isEdit && product?.id) {
            addProductForm.transform((data) => ({ ...buildUpdatePayload(data), _method: 'put' }));
            addProductForm.post(route('inventory.update', product.id), { forceFormData: true, preserveScroll: true, onError: () => setClientValidationMessage('Periksa field yang ditandai merah.') });
            return;
        }
        addProductForm.transform(buildStorePayload);
        addProductForm.post(route('inventory.store'), { forceFormData: true, preserveScroll: true, onError: () => setClientValidationMessage('Periksa field yang ditandai merah.') });
    };

    const selectedWarehouse = warehouses.find((w) => String(w.id) === String(addProductForm.data.warehouse_id));
    const availableRacks = selectedWarehouse?.zones?.flatMap((z) => z.racks || []) || [];
    const selectedCategory = categories.find((c) => String(c.id) === String(addProductForm.data.category_id));
    const selectedUnit = units.find((u) => String(u.id) === String(addProductForm.data.unit_id));
    const hasErrors = Object.keys(addProductForm.errors).length > 0;
    const isAutoVolume = addProductForm.data.volume_entry_mode === 'auto';
    const isManualVolume = addProductForm.data.volume_entry_mode === 'manual';
    const lengthValue = Number(addProductForm.data.dimension_length || 0);
    const widthValue = Number(addProductForm.data.dimension_width || 0);
    const heightValue = Number(addProductForm.data.dimension_height || 0);
    const unitDivisor = addProductForm.data.dimension_unit === 'mm' ? 1000000000 : (addProductForm.data.dimension_unit === 'cm' ? 1000000 : 1);
    const autoVolumePreview = isAutoVolume && lengthValue > 0 && widthValue > 0 && heightValue > 0 ? ((lengthValue * widthValue * heightValue) / unitDivisor) : null;

    return (
        <DashboardLayout headerTitle={pageTitle} hideSearch contentClassName="w-full max-w-none">
            <Head title={`Inventaris - ${isEdit ? 'Edit' : 'Tambah'}`} />

            <BackToPanduan />

            <form onSubmit={handleSubmit} className="w-full pb-12">
                {/* Warning banners — only shown in create mode */}
                {!isEdit && (!has_categories || !has_units || !has_racks || !has_suppliers) && (
                    <div className="mb-5 space-y-0">
                        {!has_categories && (
                            <SetupGate
                                icon={Tags}
                                color="#7C3AED"
                                title="Kategori belum dibuat"
                                description="Produk wajib memiliki kategori. Buat minimal satu kategori terlebih dahulu di menu Pengaturan."
                                href="/settings?active=categories"
                                linkLabel="Buat Kategori Sekarang"
                            />
                        )}
                        {!has_units && (
                            <SetupGate
                                icon={Ruler}
                                color="#2563EB"
                                title="Satuan unit belum dibuat"
                                description="Produk wajib memiliki satuan. Buat minimal satu satuan terlebih dahulu di menu Pengaturan."
                                href="/settings?active=units"
                                linkLabel="Buat Satuan Sekarang"
                            />
                        )}
                        {!has_suppliers && (
                            <SetupGate
                                icon={ShoppingCart}
                                color="#059669"
                                title="Data pemasok belum ada"
                                description="Field Pemasok Default tidak bisa diisi. Tambahkan pemasok terlebih dahulu di menu Pemasok."
                                href="/supplier"
                                linkLabel="Tambah Pemasok Sekarang"
                            />
                        )}
                        {!has_racks && (
                            <SetupGate
                                icon={LayoutGrid}
                                color="#D97706"
                                title="Rak penyimpanan belum dibuat"
                                description="Stok awal tidak dapat ditempatkan tanpa rak. Buat zona dan rak terlebih dahulu di menu Gudang."
                                href="/warehouse"
                                linkLabel="Buat Zona & Rak Sekarang"
                            />
                        )}
                    </div>
                )}
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <Link href={backHref} className="mb-4 inline-flex items-center gap-2 px-4 py-2 border border-[#E5EAF3] bg-white hover:bg-gray-50 text-[#5B33CC] font-bold rounded-xl text-[12px]">
                            <ArrowLeft className="w-4 h-4" />Kembali
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-700">
                                {isEdit ? 'Edit' : 'Baru'}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">{operationalWarehouse?.name || 'Gudang'}</span>
                        </div>
                        <h1 className="mt-3 text-[28px] font-black text-[#4722B3]">{pageTitle}</h1>
                        <p className="mt-1 text-[13px] font-semibold text-gray-500">
                            {isEdit ? 'Perbarui data produk.' : 'Lengkapi data produk baru.'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href={backHref} className="px-5 py-2.5 border border-[#E5EAF3] bg-white text-gray-600 font-bold rounded-xl text-[13px] hover:bg-gray-50">Batal</Link>
                        <button type="submit" disabled={addProductForm.processing} className="px-6 py-2.5 bg-[#5B33CC] shadow-[0_4px_14px_rgba(89,50,201,0.3)] hover:bg-indigo-700 text-white font-bold rounded-xl text-[13px]">
                            {addProductForm.processing ? 'Menyimpan...' : (isEdit ? 'Simpan' : 'Tambah')}
                        </button>
                    </div>
                </div>

                {(hasErrors || clientValidationMessage) && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-[13px] font-bold text-red-700">
                        {clientValidationMessage || 'Periksa field yang ditandai merah.'}
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="rounded-[20px] border border-[#E5EAF3] bg-white px-6 shadow-sm">
                        <Section title="Informasi Produk" description="Identitas produk untuk pencarian dan pencatatan.">
                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                <Field label="Nama Produk" error={addProductForm.errors.name} required className="lg:col-span-2">
                                    <div className="relative">
                                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input type="text" className={`${inputClass} pl-11`} placeholder="Contoh: Sensor AX900" value={addProductForm.data.name} onChange={(e) => addProductForm.setData('name', e.target.value)} required />
                                    </div>
                                </Field>

                                <Field label="SKU / Kode" error={addProductForm.errors.sku} required>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input type="text" className={`${inputClass} pl-11`} placeholder="Contoh: HP-AX900" value={addProductForm.data.sku} onChange={(e) => addProductForm.setData('sku', e.target.value)} required />
                                    </div>
                                </Field>

                                <Field label="Kategori" error={addProductForm.errors.category_id} required>
                                    <LockableField locked={!has_categories}>
                                        <div className="relative">
                                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <CustomDropdown
                                                value={addProductForm.data.category_id}
                                                onChange={(value) => addProductForm.setData('category_id', value)}
                                                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                                                placeholder={has_categories ? 'Pilih kategori' : 'Belum ada kategori'}
                                                disabled={!has_categories}
                                                unstyled
                                                triggerClassName={`${selectClass} pl-11`}
                                            />
                                        </div>
                                    </LockableField>
                                </Field>

                                <Field label="Satuan Unit" error={addProductForm.errors.unit_id} required>
                                    <LockableField locked={!has_units}>
                                        <div className="relative">
                                            <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <CustomDropdown
                                                value={addProductForm.data.unit_id}
                                                onChange={(value) => addProductForm.setData('unit_id', value)}
                                                options={units.map((u) => ({ value: u.id, label: u.name }))}
                                                placeholder={has_units ? 'Pilih satuan' : 'Belum ada satuan'}
                                                disabled={!has_units}
                                                unstyled
                                                triggerClassName={`${selectClass} pl-11`}
                                            />
                                        </div>
                                    </LockableField>
                                </Field>

                                <Field label="Pemasok Default">
                                    <LockableField locked={!has_suppliers}>
                                        <div className="relative">
                                            <ShoppingCart className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <CustomDropdown
                                                value={addProductForm.data.default_supplier_id}
                                                onChange={(value) => addProductForm.setData('default_supplier_id', value)}
                                                options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
                                                placeholder={has_suppliers ? 'Tanpa pemasok' : 'Belum ada pemasok'}
                                                disabled={!has_suppliers}
                                                unstyled
                                                triggerClassName={`${selectClass} pl-11`}
                                            />
                                        </div>
                                    </LockableField>
                                </Field>
                            </div>
                        </Section>

                        <Section title="Harga dan Stok" description="Nilai komersial dan batas minimum.">
                            <div className={`grid grid-cols-1 gap-5 ${isEdit ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
                                {!isEdit && (
                                    <Field label="Stok Awal" error={addProductForm.errors.initial_stock}>
                                        <div className="relative">
                                            <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input type="number" min="0" className={`${inputClass} pl-11`} value={addProductForm.data.initial_stock} onChange={(e) => addProductForm.setData('initial_stock', e.target.value)} />
                                        </div>
                                    </Field>
                                )}

                                <Field label="Harga Beli" error={addProductForm.errors.purchase_price}>
                                    <div className="relative">
                                        <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <span className="absolute left-11 top-1/2 -translate-y-1/2 text-[12px] font-black text-gray-400">Rp</span>
                                        <input type="text" inputMode="numeric" className={`${inputClass} pl-[66px]`} value={formatRupiahInput(addProductForm.data.purchase_price)} onChange={(e) => handlePriceChange('purchase_price', e.target.value)} placeholder="0" />
                                    </div>
                                </Field>

                                <Field label="Harga Jual" error={addProductForm.errors.selling_price}>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <span className="absolute left-11 top-1/2 -translate-y-1/2 text-[12px] font-black text-gray-400">Rp</span>
                                        <input type="text" inputMode="numeric" className={`${inputClass} pl-[66px]`} value={formatRupiahInput(addProductForm.data.selling_price)} onChange={(e) => handlePriceChange('selling_price', e.target.value)} placeholder="0" />
                                    </div>
                                </Field>

                                <Field label="Stok Minimum" error={addProductForm.errors.minimum_stock} required>
                                    <div className="relative">
                                        <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input type="number" min="0" className={`${inputClass} pl-11`} value={addProductForm.data.minimum_stock} onChange={(e) => addProductForm.setData('minimum_stock', e.target.value)} required />
                                    </div>
                                </Field>
                            </div>
                        </Section>

                        <Section title="Volume (Opsional)" description="Untuk perhitungan kapasitas gudang.">
                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                <Field label="Mode Volume" error={addProductForm.errors.volume_entry_mode} className="lg:col-span-2">
                                    <div className="relative">
                                        <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <CustomDropdown
                                            value={addProductForm.data.volume_entry_mode}
                                            onChange={(value) => addProductForm.setData('volume_entry_mode', value)}
                                            options={[
                                                { value: 'none', label: 'Tidak dipakai' },
                                                { value: 'auto', label: 'Hitung dari dimensi' },
                                                { value: 'manual', label: 'Input manual' },
                                            ]}
                                            unstyled
                                            triggerClassName={`${selectClass} pl-11`}
                                        />
                                    </div>
                                </Field>

                                {isAutoVolume && (
                                    <>
                                        <Field label="Satuan Dimensi" error={addProductForm.errors.dimension_unit}>
                                            <div className="relative">
                                                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <CustomDropdown
                                                    value={addProductForm.data.dimension_unit}
                                                    onChange={(value) => addProductForm.setData('dimension_unit', value)}
                                                    options={[
                                                        { value: 'mm', label: 'Millimeter' },
                                                        { value: 'cm', label: 'Centimeter' },
                                                        { value: 'm', label: 'Meter' },
                                                    ]}
                                                    unstyled
                                                    triggerClassName={`${selectClass} pl-11`}
                                                />
                                            </div>
                                        </Field>
                                        <div></div>
                                        <Field label="Panjang"><input type="number" min="0" step="0.001" className={inputClass} value={addProductForm.data.dimension_length} onChange={(e) => addProductForm.setData('dimension_length', e.target.value)} /></Field>
                                        <Field label="Lebar"><input type="number" min="0" step="0.001" className={inputClass} value={addProductForm.data.dimension_width} onChange={(e) => addProductForm.setData('dimension_width', e.target.value)} /></Field>
                                        <Field label="Tinggi"><input type="number" min="0" step="0.001" className={inputClass} value={addProductForm.data.dimension_height} onChange={(e) => addProductForm.setData('dimension_height', e.target.value)} /></Field>
                                        <Field label="Preview Volume" className="lg:col-span-2">
                                            <div className="bg-[#f8f9fb] rounded-xl px-4 py-3 border border-gray-100">
                                                <span className="text-[14px] font-black text-[#4722B3]">{autoVolumePreview !== null ? `${autoVolumePreview.toFixed(6)} m3` : 'Isi dimensi dulu'}</span>
                                            </div>
                                        </Field>
                                    </>
                                )}

                                {isManualVolume && (
                                    <Field label="Volume m3/Unit" error={addProductForm.errors.volume_m3_per_unit} className="lg:col-span-2">
                                        <input type="number" min="0" step="0.000001" className={inputClass} value={addProductForm.data.volume_m3_per_unit} onChange={(e) => addProductForm.setData('volume_m3_per_unit', e.target.value)} />
                                    </Field>
                                )}
                            </div>
                        </Section>

                        {!isEdit && (
                            <Section title="Penempatan Awal" description="Rak untuk stok awal.">
                                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                    <Field label="Gudang">
                                        <div className="bg-[#f8f9fb] rounded-xl px-4 py-3 border border-gray-100 flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-gray-400" />
                                            <span className="font-bold text-gray-600">{operationalWarehouse?.name || 'Warehouse Utama'}</span>
                                        </div>
                                    </Field>
                                    <Field label="Rak" error={addProductForm.errors.rack_id} helper={!has_racks ? null : Number(addProductForm.data.initial_stock) > 0 ? 'Wajib diisi.' : 'Opsional.'}>
                                        <LockableField locked={!has_racks}>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <CustomDropdown
                                                    value={addProductForm.data.rack_id}
                                                    onChange={(value) => addProductForm.setData('rack_id', value)}
                                                    options={availableRacks.map((r) => ({ value: r.id, label: `${r.code} - ${r.name}` }))}
                                                    placeholder={has_racks ? 'Pilih rak' : 'Belum ada rak'}
                                                    disabled={!has_racks || !addProductForm.data.warehouse_id}
                                                    unstyled
                                                    triggerClassName={`${selectClass} pl-11`}
                                                />
                                            </div>
                                        </LockableField>
                                    </Field>
                                </div>
                            </Section>
                        )}

                        <Section title="Catatan" description="Informasi tambahan.">
                            <Field label="Deskripsi" error={addProductForm.errors.description}>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <textarea className={`${textareaClass} pl-11`} placeholder="Tambahkan catatan..." value={addProductForm.data.description} onChange={(e) => addProductForm.setData('description', e.target.value)} />
                                </div>
                            </Field>
                        </Section>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        <div className="rounded-[20px] border border-[#E5EAF3] bg-white p-6 shadow-sm">
                            <h2 className="text-[14px] font-black text-[#4722B3] flex items-center gap-2">
                                <Package className="w-5 h-5" />Gambar Produk
                            </h2>
                            <button type="button" onClick={() => document.getElementById('product-image-input').click()} className="mt-4 flex flex-col items-center justify-center w-full min-h-[160px] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-[#5B33CC] hover:bg-indigo-50 transition">
                                <input id="product-image-input" type="file" className="hidden" onChange={(e) => addProductForm.setData('image', e.target.files[0] || null)} accept="image/*" />
                                {addProductForm.data.image ? (
                                    <>
                                        <img src={URL.createObjectURL(addProductForm.data.image)} alt="Preview" className="h-24 w-24 object-cover rounded-lg" />
                                        <span className="mt-2 text-[11px] font-bold text-[#5B33CC]">Klik ganti</span>
                                    </>
                                ) : product?.image_url ? (
                                    <>
                                        <img src={product.image_url} alt="Current" className="h-24 w-24 object-cover rounded-lg" />
                                        <span className="mt-2 text-[11px] font-bold text-gray-500">Gambar saat ini</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <span className="text-[12px] font-bold text-gray-500">Upload gambar</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="rounded-[20px] border border-[#E5EAF3] bg-white p-6 shadow-sm">
                            <h2 className="text-[14px] font-black text-[#4722B3] mb-4">Ringkasan</h2>
                            <dl className="space-y-3 text-[12px]">
                                <div className="flex justify-between"><dt className="font-bold text-gray-500">SKU</dt><dd className="font-black text-gray-800">{addProductForm.data.sku || '-'}</dd></div>
                                <div className="flex justify-between"><dt className="font-bold text-gray-500">Kategori</dt><dd className="font-black text-gray-800">{selectedCategory?.name || '-'}</dd></div>
                                <div className="flex justify-between"><dt className="font-bold text-gray-500">Unit</dt><dd className="font-black text-gray-800">{selectedUnit?.name || '-'}</dd></div>
                                <div className="flex justify-between"><dt className="font-bold text-gray-500">Stok</dt><dd className="font-black text-gray-800">{isEdit ? 'Tidak berubah' : `${addProductForm.data.initial_stock || 0}`}</dd></div>
                            </dl>
                        </div>
                    </aside>
                </div>
            </form>
        </DashboardLayout>
    );
}
