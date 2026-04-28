import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import React from 'react';

const ChevronDownIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const ArrowLeftIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const UploadIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const SaveIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const Section = ({ title, description, children }) => (
    <section className="border-b border-slate-200 py-7 last:border-b-0">
        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
            <div>
                <h2 className="text-[15px] font-black text-slate-950">{title}</h2>
                <p className="mt-2 text-[13px] font-semibold leading-6 text-slate-500">{description}</p>
            </div>
            <div>{children}</div>
        </div>
    </section>
);

const Field = ({ label, error, children, required = false, helper = null, className = '' }) => (
    <div className={className}>
        <label className="mb-2 block text-[12px] font-black text-slate-700">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {children}
        {helper && !error && <div className="mt-2 text-[12px] font-semibold leading-5 text-slate-400">{helper}</div>}
        {error && <div className="mt-2 text-[12px] font-bold leading-5 text-red-600">{error}</div>}
    </div>
);

export default function Create({ categories, units, suppliers, warehouses, operationalWarehouse, product = null, isEdit = false }) {
    const pageTitle = isEdit ? 'Edit Item Inventaris' : 'Tambah Item Inventaris Baru';
    const backHref = isEdit && product?.id ? route('inventory.show', product.id) : route('inventory');
    const inputClass = 'block h-11 w-full rounded-[8px] border border-slate-300 bg-white px-3.5 text-[14px] font-semibold text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100';
    const selectClass = `${inputClass} appearance-none pr-10 cursor-pointer`;
    const textareaClass = 'block min-h-[132px] w-full rounded-[8px] border border-slate-300 bg-white px-3.5 py-3 text-[14px] font-semibold leading-7 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100';

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

    const buildStorePayload = (data) => ({
        ...data,
        default_supplier_id: data.default_supplier_id || null,
    });
    const [clientValidationMessage, setClientValidationMessage] = React.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setClientValidationMessage('');

        if (!e.currentTarget.checkValidity()) {
            e.currentTarget.reportValidity();
            setClientValidationMessage('Form masih kosong/belum lengkap. Isi semua field wajib terlebih dahulu.');
            return;
        }

        if (isEdit && product?.id) {
            addProductForm.transform((data) => ({
                ...buildUpdatePayload(data),
                _method: 'put',
            }));
            addProductForm.post(route('inventory.update', product.id), {
                forceFormData: true,
                preserveScroll: true,
                onError: () => setClientValidationMessage('Data belum valid. Periksa field yang ditandai merah.'),
            });
            return;
        }

        addProductForm.transform(buildStorePayload);
        addProductForm.post(route('inventory.store'), {
            forceFormData: true,
            preserveScroll: true,
            onError: () => setClientValidationMessage('Data belum valid. Periksa field yang ditandai merah.'),
        });
    };

    const selectedWarehouse = warehouses.find((warehouse) => String(warehouse.id) === String(addProductForm.data.warehouse_id));
    const availableRacks = selectedWarehouse?.zones?.flatMap((zone) => zone.racks || []) || [];
    const selectedCategory = categories.find((item) => String(item.id) === String(addProductForm.data.category_id));
    const selectedUnit = units.find((item) => String(item.id) === String(addProductForm.data.unit_id));
    const hasErrors = Object.keys(addProductForm.errors).length > 0;
    const isAutoVolume = addProductForm.data.volume_entry_mode === 'auto';
    const isManualVolume = addProductForm.data.volume_entry_mode === 'manual';
    const lengthValue = Number(addProductForm.data.dimension_length || 0);
    const widthValue = Number(addProductForm.data.dimension_width || 0);
    const heightValue = Number(addProductForm.data.dimension_height || 0);
    const unitDivisor = addProductForm.data.dimension_unit === 'mm' ? 1000000000 : (addProductForm.data.dimension_unit === 'cm' ? 1000000 : 1);
    const autoVolumePreview = isAutoVolume && lengthValue > 0 && widthValue > 0 && heightValue > 0
        ? ((lengthValue * widthValue * heightValue) / unitDivisor)
        : null;

    return (
        <DashboardLayout
            headerTitle={pageTitle}
            hideSearch
            contentClassName="w-full max-w-none"
        >
            <Head title={`Inventaris - ${isEdit ? 'Edit Barang' : 'Tambah Barang'}`} />

            <form onSubmit={handleSubmit} className="w-full pb-12">
                <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        <Link
                            href={backHref}
                            className="mb-4 inline-flex h-10 min-w-[112px] items-center justify-center gap-2 rounded-[8px] border border-slate-200 bg-white px-4 text-[12px] font-black uppercase tracking-wider text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            Kembali
                        </Link>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-[8px] border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-indigo-700">
                                {isEdit ? 'Edit Master Produk' : 'Registrasi Produk'}
                            </span>
                            <span className="rounded-[8px] border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                                {operationalWarehouse?.name || 'Gudang Operasional'}
                            </span>
                        </div>
                        <h1 className="mt-3 text-[28px] font-black leading-tight tracking-tight text-slate-950 sm:text-[34px]">{pageTitle}</h1>
                        <p className="mt-2 max-w-3xl text-[14px] font-semibold leading-7 text-slate-500">
                            {isEdit
                                ? 'Perbarui data master produk. Stok fisik tidak akan berubah dari halaman ini.'
                                : 'Lengkapi data master, harga, batas stok, dan penempatan awal produk.'}
                        </p>
                    </div>

                    <div />
                </div>

                {hasErrors && (
                    <div className="mb-6 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">
                        Ada data yang belum valid. Periksa field yang ditandai merah.
                    </div>
                )}
                {clientValidationMessage && (
                    <div className="mb-6 rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-bold text-amber-700">
                        {clientValidationMessage}
                    </div>
                )}

                <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="rounded-[8px] border border-slate-200 bg-white px-5 shadow-sm sm:px-7">
                        <Section
                            title="Informasi Produk"
                            description="Identitas utama untuk pencarian, pencatatan transaksi, dan relasi supplier."
                        >
                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                <Field label="Nama Produk" error={addProductForm.errors.name} required className="lg:col-span-2">
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder="misal: AX900 Sensor Module"
                                        value={addProductForm.data.name}
                                        onChange={(e) => addProductForm.setData('name', e.target.value)}
                                        required
                                    />
                                </Field>

                                <Field label="SKU / Barcode" error={addProductForm.errors.sku} required>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder="misal: HP-AX900"
                                        value={addProductForm.data.sku}
                                        onChange={(e) => addProductForm.setData('sku', e.target.value)}
                                        required
                                    />
                                </Field>

                                <Field label="Kategori" error={addProductForm.errors.category_id} required>
                                    <div className="relative">
                                        <select
                                            className={selectClass}
                                            value={addProductForm.data.category_id}
                                            onChange={(e) => addProductForm.setData('category_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Pilih kategori</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>{category.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </Field>

                                <Field label="Satuan Unit" error={addProductForm.errors.unit_id} required>
                                    <div className="relative">
                                        <select
                                            className={selectClass}
                                            value={addProductForm.data.unit_id}
                                            onChange={(e) => addProductForm.setData('unit_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Pilih satuan</option>
                                            {units.map((unit) => (
                                                <option key={unit.id} value={unit.id}>{unit.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </Field>

                                <Field label="Pemasok Default">
                                    <div className="relative">
                                        <select
                                            className={selectClass}
                                            value={addProductForm.data.default_supplier_id}
                                            onChange={(e) => addProductForm.setData('default_supplier_id', e.target.value)}
                                        >
                                            <option value="">Tanpa pemasok default</option>
                                            {suppliers.map((supplier) => (
                                                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </Field>
                            </div>
                        </Section>

                        <Section
                            title="Harga dan Stok"
                            description="Nilai komersial dan batas minimum yang dipakai untuk monitoring inventaris."
                        >
                            <div className={`grid grid-cols-1 gap-5 ${isEdit ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
                                {!isEdit && (
                                    <Field label="Stok Awal" error={addProductForm.errors.initial_stock}>
                                        <input
                                            type="number"
                                            min="0"
                                            className={inputClass}
                                            value={addProductForm.data.initial_stock}
                                            onChange={(e) => addProductForm.setData('initial_stock', e.target.value)}
                                        />
                                    </Field>
                                )}

                                <Field label="Harga Beli" error={addProductForm.errors.purchase_price}>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className={inputClass}
                                        value={addProductForm.data.purchase_price}
                                        onChange={(e) => addProductForm.setData('purchase_price', e.target.value)}
                                    />
                                </Field>

                                <Field label="Harga Jual" error={addProductForm.errors.selling_price}>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className={inputClass}
                                        value={addProductForm.data.selling_price}
                                        onChange={(e) => addProductForm.setData('selling_price', e.target.value)}
                                    />
                                </Field>

                                <Field label="Stok Minimum" error={addProductForm.errors.minimum_stock} required>
                                    <input
                                        type="number"
                                        min="0"
                                        className={inputClass}
                                        value={addProductForm.data.minimum_stock}
                                        onChange={(e) => addProductForm.setData('minimum_stock', e.target.value)}
                                        required
                                    />
                                </Field>

                            </div>
                        </Section>

                        <Section
                            title="Profil Volume (Opsional)"
                            description="Dipakai untuk perhitungan volume m3 per unit. Cocok untuk kayu, box, pallet, dan barang non-kayu yang butuh analitik ruang."
                        >
                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                <Field label="Mode Input Volume" error={addProductForm.errors.volume_entry_mode} className="lg:col-span-2">
                                    <div className="relative">
                                        <select
                                            className={selectClass}
                                            value={addProductForm.data.volume_entry_mode}
                                            onChange={(e) => addProductForm.setData('volume_entry_mode', e.target.value)}
                                        >
                                            <option value="none">Tidak dipakai</option>
                                            <option value="auto">Hitung otomatis dari dimensi</option>
                                            <option value="manual">Input manual (m3 per unit)</option>
                                        </select>
                                        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </Field>

                                {isAutoVolume && (
                                    <>
                                        <Field label="Satuan Dimensi" error={addProductForm.errors.dimension_unit}>
                                            <div className="relative">
                                                <select
                                                    className={selectClass}
                                                    value={addProductForm.data.dimension_unit}
                                                    onChange={(e) => addProductForm.setData('dimension_unit', e.target.value)}
                                                >
                                                    <option value="mm">Millimeter (mm)</option>
                                                    <option value="cm">Centimeter (cm)</option>
                                                    <option value="m">Meter (m)</option>
                                                </select>
                                                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                            </div>
                                        </Field>

                                        <Field label="Panjang" error={addProductForm.errors.dimension_length}>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.001"
                                                className={inputClass}
                                                value={addProductForm.data.dimension_length}
                                                onChange={(e) => addProductForm.setData('dimension_length', e.target.value)}
                                                placeholder={`contoh: ${addProductForm.data.dimension_unit === 'mm' ? '4000' : '4'}`}
                                            />
                                        </Field>

                                        <Field label="Lebar" error={addProductForm.errors.dimension_width}>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.001"
                                                className={inputClass}
                                                value={addProductForm.data.dimension_width}
                                                onChange={(e) => addProductForm.setData('dimension_width', e.target.value)}
                                                placeholder={`contoh: ${addProductForm.data.dimension_unit === 'mm' ? '50' : '0.05'}`}
                                            />
                                        </Field>

                                        <Field label="Tinggi / Tebal" error={addProductForm.errors.dimension_height}>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.001"
                                                className={inputClass}
                                                value={addProductForm.data.dimension_height}
                                                onChange={(e) => addProductForm.setData('dimension_height', e.target.value)}
                                                placeholder={`contoh: ${addProductForm.data.dimension_unit === 'mm' ? '25' : '0.025'}`}
                                            />
                                        </Field>

                                        <Field label="Preview Volume m3 / Unit" className="lg:col-span-2">
                                            <div className="flex h-11 items-center rounded-[8px] border border-slate-200 bg-slate-50 px-3.5 text-[14px] font-black text-slate-700">
                                                {autoVolumePreview !== null ? `${autoVolumePreview.toFixed(6)} m3` : 'Isi dimensi valid untuk melihat hasil'}
                                            </div>
                                        </Field>
                                    </>
                                )}

                                {isManualVolume && (
                                    <Field label="Volume m3 per Unit" error={addProductForm.errors.volume_m3_per_unit} className="lg:col-span-2">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.000001"
                                            className={inputClass}
                                            value={addProductForm.data.volume_m3_per_unit}
                                            onChange={(e) => addProductForm.setData('volume_m3_per_unit', e.target.value)}
                                            placeholder="contoh: 0.012500"
                                        />
                                    </Field>
                                )}
                            </div>
                        </Section>

                        {!isEdit && (
                            <Section
                                title="Penempatan Awal"
                                description="Pilih rak hanya saat produk memiliki stok awal."
                            >
                                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                    <Field label="Lokasi Gudang" error={addProductForm.errors.warehouse_id}>
                                        <div className="flex h-11 items-center rounded-[8px] border border-slate-200 bg-slate-50 px-3.5 text-[14px] font-bold text-slate-700">
                                            {operationalWarehouse?.name || 'Warehouse Utama'}
                                        </div>
                                    </Field>

                                    <Field
                                        label="Lokasi Rak"
                                        error={addProductForm.errors.rack_id}
                                        helper={Number(addProductForm.data.initial_stock) > 0 ? 'Wajib dipilih karena stok awal lebih dari nol.' : 'Opsional bila stok awal nol.'}
                                    >
                                        <div className="relative">
                                            <select
                                                className={selectClass}
                                                value={addProductForm.data.rack_id}
                                                onChange={(e) => addProductForm.setData('rack_id', e.target.value)}
                                                required={Number(addProductForm.data.initial_stock) > 0}
                                                disabled={!addProductForm.data.warehouse_id}
                                            >
                                                <option value="">Pilih rak</option>
                                                {availableRacks.map((rack) => (
                                                    <option key={rack.id} value={rack.id}>{rack.code} - {rack.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                        </div>
                                    </Field>
                                </div>
                            </Section>
                        )}

                        <Section
                            title="Catatan"
                            description="Tambahkan informasi teknis, instruksi penanganan, atau kebutuhan penyimpanan khusus."
                        >
                            <Field label="Deskripsi Item" error={addProductForm.errors.description}>
                                <textarea
                                    className={textareaClass}
                                    placeholder="Jelaskan spesifikasi, instruksi penanganan, atau kebutuhan penyimpanan..."
                                    value={addProductForm.data.description}
                                    onChange={(e) => addProductForm.setData('description', e.target.value)}
                                />
                            </Field>
                        </Section>
                    </div>

                    <aside className="space-y-6 xl:sticky xl:top-0 xl:self-start">
                        <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-[15px] font-black text-slate-950">Gambar Produk</h2>
                            <p className="mt-2 text-[13px] font-semibold leading-6 text-slate-500">
                                Gunakan gambar produk yang jelas agar mudah dikenali.
                            </p>

                            <button
                                type="button"
                                onClick={() => document.getElementById('product-image-input').click()}
                                className="mt-5 flex min-h-[240px] w-full flex-col items-center justify-center rounded-[8px] border border-dashed border-slate-300 bg-slate-50 p-4 text-center transition hover:border-indigo-300 hover:bg-indigo-50/40"
                            >
                                <input
                                    id="product-image-input"
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => addProductForm.setData('image', e.target.files[0] || null)}
                                    accept="image/*"
                                />

                                {addProductForm.data.image ? (
                                    <>
                                        <div className="h-36 w-36 overflow-hidden rounded-[8px] border border-slate-200 bg-white">
                                            <img src={URL.createObjectURL(addProductForm.data.image)} alt="Preview gambar produk" className="h-full w-full object-cover" />
                                        </div>
                                        <span className="mt-3 max-w-full truncate text-[13px] font-black text-indigo-700">{addProductForm.data.image.name}</span>
                                        <span className="mt-1 text-[12px] font-semibold text-slate-500">Klik untuk mengganti</span>
                                    </>
                                ) : product?.image_url ? (
                                    <>
                                        <div className="h-36 w-36 overflow-hidden rounded-[8px] border border-slate-200 bg-white">
                                            <img src={product.image_url} alt={addProductForm.data.name || 'Gambar produk'} className="h-full w-full object-cover" />
                                        </div>
                                        <span className="mt-3 text-[13px] font-black text-slate-700">Gambar saat ini</span>
                                        <span className="mt-1 text-[12px] font-semibold text-slate-500">Klik untuk mengganti</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-500">
                                            <UploadIcon className="h-6 w-6" />
                                        </div>
                                        <span className="mt-3 text-[13px] font-black text-slate-700">Unggah gambar produk</span>
                                        <span className="mt-1 text-[12px] font-semibold text-slate-500">PNG, JPG, JPEG, GIF maksimal 2 MB</span>
                                    </>
                                )}
                            </button>
                            {addProductForm.errors.image && <div className="mt-2 text-[12px] font-bold text-red-600">{addProductForm.errors.image}</div>}
                        </div>

                        <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-[15px] font-black text-slate-950">Ringkasan</h2>
                            <dl className="mt-4 space-y-3 text-[13px]">
                                <div className="flex justify-between gap-4">
                                    <dt className="font-bold text-slate-500">SKU</dt>
                                    <dd className="max-w-[190px] truncate text-right font-black text-slate-900">{addProductForm.data.sku || '-'}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="font-bold text-slate-500">Kategori</dt>
                                    <dd className="max-w-[190px] truncate text-right font-black text-slate-900">{selectedCategory?.name || '-'}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="font-bold text-slate-500">Unit</dt>
                                    <dd className="max-w-[190px] truncate text-right font-black text-slate-900">{selectedUnit?.name || '-'}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="font-bold text-slate-500">Stok Fisik</dt>
                                    <dd className="max-w-[190px] truncate text-right font-black text-slate-900">{isEdit ? 'Tidak berubah' : `${addProductForm.data.initial_stock || 0} unit`}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="font-bold text-slate-500">Volume m3/Unit</dt>
                                    <dd className="max-w-[190px] truncate text-right font-black text-slate-900">
                                        {addProductForm.data.volume_entry_mode === 'none'
                                            ? '-'
                                            : (isAutoVolume
                                                ? (autoVolumePreview !== null ? `${autoVolumePreview.toFixed(6)} m3` : '-')
                                                : (addProductForm.data.volume_m3_per_unit ? `${Number(addProductForm.data.volume_m3_per_unit).toFixed(6)} m3` : '-'))}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </aside>
                </div>

                <div className="mt-8 border-t border-slate-200 pt-5">
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Link
                            href={backHref}
                            className="inline-flex h-12 min-w-[112px] items-center justify-center rounded-[8px] border border-slate-200 bg-white px-6 text-[14px] font-black text-slate-600 shadow-sm transition hover:bg-slate-50"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={addProductForm.processing}
                            className="inline-flex h-12 min-w-[168px] items-center justify-center gap-2 rounded-[8px] bg-indigo-600 px-7 text-[14px] font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <SaveIcon className="h-4 w-4" />
                            {addProductForm.processing ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Tambah Item')}
                        </button>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
