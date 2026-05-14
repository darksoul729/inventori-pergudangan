import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import CustomDropdown from '@/Components/CustomDropdown';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import BackToPanduan from '@/Components/BackToPanduan';
import { BuildingIcon, TagIcon, ScaleIcon, UsersIcon } from '@/Components/SettingsSidebar';
import FloatingNotice from '@/Components/FloatingNotice';
import { CreditCard, ShieldCheck, Warehouse, MapPin, FileText, BellRing, MailCheck, CircleDollarSign, Tag, Ruler, Hash, User, Mail, Phone, KeyRound } from 'lucide-react';

const PlusIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const TrashIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);
const EditIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const XIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const formatOperationalRole = (role) => {
    if (role === 'Supervisor') return 'Supervisor Gudang';
    if (role === 'Staff') return 'Staff Operasional';

    return role || 'Staff Operasional';
};

const topMenuBase = 'group flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-[12px] font-bold transition whitespace-nowrap';
const topMenuIdle = 'border-slate-200/70 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900';
const topMenuActive = 'border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 text-[#4B2BB7] shadow-[0_8px_20px_rgba(91,51,204,0.12)]';

export default function Settings({ auth, categories, units, warehouse, staffUsers = [], invoiceNotificationSettings = {} }) {
    const { flash = {} } = usePage().props;
    const [floatingNotices, setFloatingNotices] = useState([]);
    const queryParams = new URLSearchParams(window.location.search);
    const [activeTab, setActiveTab] = useState(queryParams.get('active') || 'warehouse');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const roleName = (auth?.user?.role_name || auth?.user?.role || '').toString().toLowerCase();
    const isSystemAdmin = roleName.includes('admin sistem') || roleName.includes('admin system') || roleName.includes('super admin') || roleName.includes('system_admin');
    const normalizedQuery = searchTerm.trim().toLowerCase();
    const warehouseSectionRef = React.useRef(null);
    const categoriesSectionRef = React.useRef(null);
    const unitsSectionRef = React.useRef(null);
    const staffSectionRef = React.useRef(null);
    
    // Warehouse Form
    const warehouseForm = useForm({
        name: warehouse?.name || '',
        location: warehouse?.location || '',
        description: warehouse?.description || '',
    });
    const invoiceNotifyForm = useForm({
        notify_partial: Boolean(invoiceNotificationSettings.notify_partial ?? true),
        notify_paid: Boolean(invoiceNotificationSettings.notify_paid ?? true),
    });

    const submitWarehouse = (e) => {
        e.preventDefault();
        // Fallback to updating warehouse ID 1 or a specific route if warehouse is null.
        // Assuming warehouse ID 1 is the default if not set.
        const id = warehouse?.id || 1;
        warehouseForm.put(route('settings.warehouse.update', id));
    };

    const submitInvoiceNotifySettings = (e) => {
        e.preventDefault();
        invoiceNotifyForm.put(route('settings.invoice-notifications.update'));
    };

    // Category Form
    const categoryForm = useForm({
        name: '',
        description: '',
    });

    const submitCategory = (e) => {
        e.preventDefault();
        if (editingCategory) {
            categoryForm.put(route('settings.categories.update', editingCategory.id), {
                onSuccess: () => {
                    categoryForm.reset();
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                }
            });
        } else {
            categoryForm.post(route('settings.categories.store'), {
                onSuccess: () => {
                    categoryForm.reset();
                    setShowCategoryModal(false);
                }
            });
        }
    };

    const openEditCategory = (cat) => {
        setEditingCategory(cat);
        categoryForm.setData({
            name: cat.name,
            description: cat.description || '',
        });
        setShowCategoryModal(true);
    };

    const deleteCategory = (id) => {
        setConfirmDelete({ type: 'category', id, message: 'Apakah Anda yakin ingin menghapus kategori ini?' });
    };

    const closeCategoryModal = () => {
        setShowCategoryModal(false);
        setEditingCategory(null);
        categoryForm.reset();
    };

    // Unit Form
    const unitForm = useForm({
        name: '',
        symbol: '',
    });

    const submitUnit = (e) => {
        e.preventDefault();
        if (editingUnit) {
            unitForm.put(route('settings.units.update', editingUnit.id), {
                onSuccess: () => {
                    unitForm.reset();
                    setShowUnitModal(false);
                    setEditingUnit(null);
                }
            });
        } else {
            unitForm.post(route('settings.units.store'), {
                onSuccess: () => {
                    unitForm.reset();
                    setShowUnitModal(false);
                }
            });
        }
    };

    const openEditUnit = (u) => {
        setEditingUnit(u);
        unitForm.setData({
            name: u.name,
            symbol: u.symbol,
        });
        setShowUnitModal(true);
    };

    const deleteUnit = (id) => {
        setConfirmDelete({ type: 'unit', id, message: 'Apakah Anda yakin ingin menghapus satuan ini?' });
    };

    const closeUnitModal = () => {
        setShowUnitModal(false);
        setEditingUnit(null);
        unitForm.reset();
    };

    const staffForm = useForm({
        name: '',
        email: '',
        phone: '',
        role: 'Staff',
        password: '',
        password_confirmation: '',
    });

    const submitStaff = (e) => {
        e.preventDefault();
        if (editingStaff) {
            staffForm.put(route('settings.staff.update', editingStaff.id), {
                onSuccess: () => {
                    staffForm.reset();
                    setShowStaffModal(false);
                    setEditingStaff(null);
                    setActiveTab('staff');
                },
            });
        } else {
            staffForm.post(route('settings.staff.store'), {
                onSuccess: () => {
                    staffForm.reset();
                    setShowStaffModal(false);
                    setActiveTab('staff');
                },
            });
        }
    };

    const closeStaffModal = () => {
        setShowStaffModal(false);
        setEditingStaff(null);
        staffForm.reset();
    };

    const openEditStaff = (user) => {
        setEditingStaff(user);
        staffForm.setData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role || 'Staff',
            password: '',
            password_confirmation: '',
        });
        setShowStaffModal(true);
    };

    const deleteStaff = (id) => {
        setConfirmDelete({ type: 'staff', id, message: 'Apakah Anda yakin ingin menghapus akun ini?' });
    };

    const executeDelete = () => {
        if (!confirmDelete) return;
        const { type, id } = confirmDelete;
        if (type === 'category') router.delete(route('settings.categories.destroy', id));
        else if (type === 'unit') router.delete(route('settings.units.destroy', id));
        else if (type === 'staff') router.delete(route('settings.staff.destroy', id));
        setConfirmDelete(null);
    };

    const updateStaffStatus = (user, status) => {
        router.put(route('settings.staff.status', user.id), { status }, {
            preserveScroll: true,
            onSuccess: () => setActiveTab('staff'),
        });
    };

    const filteredCategories = useMemo(() => {
        if (!normalizedQuery) return categories;
        return categories.filter((cat) => `${cat.name} ${cat.description || ''}`.toLowerCase().includes(normalizedQuery));
    }, [categories, normalizedQuery]);

    const filteredUnits = useMemo(() => {
        if (!normalizedQuery) return units;
        return units.filter((unit) => `${unit.name} ${unit.symbol}`.toLowerCase().includes(normalizedQuery));
    }, [normalizedQuery, units]);

    const filteredStaffUsers = useMemo(() => {
        if (!normalizedQuery) return staffUsers;
        return staffUsers.filter((user) => `${user.name} ${user.email} ${user.phone || ''} ${formatOperationalRole(user.role)}`.toLowerCase().includes(normalizedQuery));
    }, [normalizedQuery, staffUsers]);

    useEffect(() => {
        if (!normalizedQuery) return;
        if (`${warehouse?.name || ''} ${warehouse?.location || ''} ${warehouse?.description || ''}`.toLowerCase().includes(normalizedQuery)) {
            setActiveTab('warehouse');
            return;
        }
        if (filteredCategories.length > 0) {
            setActiveTab('categories');
            return;
        }
        if (filteredUnits.length > 0) {
            setActiveTab('units');
            return;
        }
        if (filteredStaffUsers.length > 0) {
            setActiveTab('staff');
        }
    }, [filteredCategories.length, filteredStaffUsers.length, filteredUnits.length, normalizedQuery, warehouse?.description, warehouse?.location, warehouse?.name]);

    useEffect(() => {
        if (!normalizedQuery) return;
        if (activeTab === 'warehouse') {
            warehouseSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        if (activeTab === 'categories') {
            categoriesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        if (activeTab === 'units') {
            unitsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        if (activeTab === 'staff') {
            staffSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [activeTab, normalizedQuery]);

    useEffect(() => {
        const notices = [];
        if (flash?.success) notices.push({ key: `ok-${Date.now()}`, type: 'success', text: flash.success });
        if (flash?.error) notices.push({ key: `err-${Date.now()}`, type: 'error', text: flash.error });
        if (!notices.length) return;
        setFloatingNotices((prev) => [...notices, ...prev].slice(0, 3));
    }, [flash?.success, flash?.error]);

    return (
        <DashboardLayout
            headerTitle="Pengaturan"
            hideMainScrollbar
            searchValue={searchTerm}
            onSearch={setSearchTerm}
        >
            <Head title="Pengaturan" />

            <div className="w-full pt-3 pb-10">
                <FloatingNotice notices={floatingNotices} onClose={(key) => setFloatingNotices((prev) => prev.filter((n) => n.key !== key))} />

                {/* Page Header */}
                <div className="mb-5 rounded-2xl border border-violet-100 bg-gradient-to-r from-white via-violet-50/60 to-indigo-50/70 px-5 py-4">
                    <h1 className="text-[24px] font-black text-[#4722B3]">Pengaturan</h1>
                    <p className="text-[13px] font-semibold text-slate-500 mt-1">Kelola data master gudang, kategori, satuan, dan akun tim.</p>
                </div>

                {/* Tabs */}
                <div className="mb-6 rounded-2xl border border-[#E5EAF3] bg-white p-2 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
                <div className="flex items-center gap-2 overflow-x-auto">
                    <button onClick={() => setActiveTab('warehouse')} className={`${topMenuBase} ${activeTab === 'warehouse' ? topMenuActive : topMenuIdle}`}>
                        <BuildingIcon className="h-4 w-4" />Gudang
                    </button>
                    <button onClick={() => setActiveTab('categories')} className={`${topMenuBase} ${activeTab === 'categories' ? topMenuActive : topMenuIdle}`}>
                        <TagIcon className="h-4 w-4" />Kategori
                    </button>
                    <button onClick={() => setActiveTab('units')} className={`${topMenuBase} ${activeTab === 'units' ? topMenuActive : topMenuIdle}`}>
                        <ScaleIcon className="h-4 w-4" />Satuan
                    </button>
                    <button onClick={() => setActiveTab('staff')} className={`${topMenuBase} ${activeTab === 'staff' ? topMenuActive : topMenuIdle}`}>
                        <UsersIcon className="h-4 w-4" />Akun Tim
                    </button>
                    <Link href={route('settings.billing')} className={`${topMenuBase} ${topMenuIdle}`}>
                        <CreditCard className="h-4 w-4" />Billing
                    </Link>
                    {isSystemAdmin && (
                        <Link href={route('settings.saas')} className={`${topMenuBase} ${topMenuIdle}`}>
                            <ShieldCheck className="h-4 w-4" />Admin SaaS
                        </Link>
                    )}
                </div>
                </div>

                <BackToPanduan />

                    {/* WAREHOUSE TAB */}
                    {activeTab === 'warehouse' && (
                        <div ref={warehouseSectionRef} className="space-y-5">
                            <div className="overflow-hidden rounded-2xl border border-[#E5EAF3] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
                                <div className="border-b border-[#EEF2F8] bg-gradient-to-r from-violet-50/80 via-indigo-50/40 to-white px-6 py-5">
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h2 className="text-[18px] font-black text-[#4722B3]">Informasi Gudang</h2>
                                        <p className="text-[12px] font-semibold text-gray-400 mt-0.5">Data gudang utama operasional.</p>
                                    </div>
                                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-black text-emerald-700 uppercase">Aktif</span>
                                </div>
                                </div>
                                <div className="p-6">
                                <form onSubmit={submitWarehouse} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                                                <Warehouse className="h-3.5 w-3.5" /> Nama Gudang
                                            </label>
                                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-bold text-gray-800 focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC]" value={warehouseForm.data.name} onChange={e => warehouseForm.setData('name', e.target.value)} required />
                                            {warehouseForm.errors.name && <div className="text-red-500 text-[11px] mt-1 font-bold">{warehouseForm.errors.name}</div>}
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                                                <MapPin className="h-3.5 w-3.5" /> Lokasi / Alamat
                                            </label>
                                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-bold text-gray-800 focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC]" value={warehouseForm.data.location} onChange={e => warehouseForm.setData('location', e.target.value)} required />
                                            {warehouseForm.errors.location && <div className="text-red-500 text-[11px] mt-1 font-bold">{warehouseForm.errors.location}</div>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                                            <FileText className="h-3.5 w-3.5" /> Deskripsi
                                        </label>
                                        <textarea rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-gray-600 focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC] resize-none" value={warehouseForm.data.description} onChange={e => warehouseForm.setData('description', e.target.value)} placeholder="Opsional"></textarea>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button type="submit" disabled={warehouseForm.processing} className="px-5 py-2.5 bg-[#5B33CC] hover:bg-indigo-700 text-white font-bold rounded-xl text-[13px] shadow-[0_8px_18px_rgba(91,51,204,0.28)]">{warehouseForm.processing ? 'Menyimpan...' : 'Simpan'}</button>
                                    </div>
                                </form>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-[#E5EAF3] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
                                <div className="border-b border-[#EEF2F8] bg-gradient-to-r from-white to-emerald-50/60 px-6 py-5">
                                <h2 className="flex items-center gap-2 text-[16px] font-black text-slate-800 mb-1">
                                    <BellRing className="h-4 w-4 text-emerald-600" /> Notifikasi Email Invoice
                                </h2>
                                <p className="text-[12px] font-semibold text-gray-500">Atur pengiriman email otomatis saat status invoice berubah.</p>
                                </div>
                                <div className="p-6">
                                <form onSubmit={submitInvoiceNotifySettings} className="space-y-3">
                                    <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] font-semibold text-slate-700 cursor-pointer">
                                        <input type="checkbox" checked={invoiceNotifyForm.data.notify_partial} onChange={(e) => invoiceNotifyForm.setData('notify_partial', e.target.checked)} className="rounded border-gray-300 text-[#5B33CC] focus:ring-[#5B33CC]" />
                                        <CircleDollarSign className="h-4 w-4 text-amber-600" /> Kirim email saat status Dibayar Sebagian
                                    </label>
                                    <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] font-semibold text-slate-700 cursor-pointer">
                                        <input type="checkbox" checked={invoiceNotifyForm.data.notify_paid} onChange={(e) => invoiceNotifyForm.setData('notify_paid', e.target.checked)} className="rounded border-gray-300 text-[#5B33CC] focus:ring-[#5B33CC]" />
                                        <MailCheck className="h-4 w-4 text-emerald-600" /> Kirim email saat status Lunas
                                    </label>
                                    <div className="flex justify-end pt-2">
                                        <button type="submit" disabled={invoiceNotifyForm.processing} className="px-5 py-2.5 bg-[#5B33CC] hover:bg-indigo-700 text-white font-bold rounded-xl text-[13px] shadow-[0_8px_18px_rgba(91,51,204,0.28)]">{invoiceNotifyForm.processing ? 'Menyimpan...' : 'Simpan'}</button>
                                    </div>
                                </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CATEGORIES TAB */}
                    {activeTab === 'categories' && (
                        <div ref={categoriesSectionRef} className="bg-white rounded-xl p-6 border border-[#E5EAF3]">
                            <div className="flex justify-between items-center mb-5">
                                <div>
                                    <h2 className="text-[18px] font-black text-[#4722B3]">Kategori Barang</h2>
                                    <p className="text-[12px] font-semibold text-gray-400 mt-0.5">Klasifikasi produk untuk reporting dan organisasi.</p>
                                </div>
                                <button 
                                    onClick={() => setShowCategoryModal(true)}
                                    className="px-4 py-2 bg-[#5B33CC] hover:bg-indigo-700 text-white font-bold rounded-lg text-[12px] flex items-center gap-1.5"
                                >
                                    <PlusIcon className="w-3.5 h-3.5" />Tambah
                                </button>
                            </div>

                            <div className="overflow-hidden border border-[#E5EAF3] rounded-2xl relative bg-[#f8f9fb]">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f8f9fb] border-b border-[#E5EAF3]">
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest w-16 text-center">ID</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Nama Kategori</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Deskripsi</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-center">Digunakan Oleh</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {filteredCategories.length > 0 ? filteredCategories.map((cat, i) => (
                                            <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-[11px] font-bold text-gray-400">#{cat.id}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[14px] font-bold text-[#4722B3]">{cat.name}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[13px] font-medium text-gray-500 line-clamp-1">{cat.description || '-'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[12px] font-bold tracking-wide">
                                                        {cat.products_count} Produk
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end items-center space-x-2">
                                                        <button 
                                                            onClick={() => openEditCategory(cat)}
                                                            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors"
                                                            title="Edit Kategori"
                                                        >
                                                            <EditIcon className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => deleteCategory(cat.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                            title="Hapus Kategori"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <TagIcon className="w-10 h-10 text-gray-200 mb-3" />
                                                        <span className="text-[14px] font-bold text-gray-400">Belum ada kategori terdaftar</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* UNITS TAB */}
                    {activeTab === 'units' && (
                        <div ref={unitsSectionRef} className="bg-white rounded-xl p-6 border border-[#E5EAF3]">
                            <div className="flex justify-between items-center mb-5">
                                <div>
                                    <h2 className="text-[18px] font-black text-[#4722B3]">Satuan Barang</h2>
                                    <p className="text-[12px] font-semibold text-gray-400 mt-0.5">Daftar satuan untuk konsistensi input produk.</p>
                                </div>
                                <button 
                                    onClick={() => setShowUnitModal(true)}
                                    className="px-4 py-2 bg-[#5B33CC] hover:bg-indigo-700 text-white font-bold rounded-lg text-[12px] flex items-center gap-1.5"
                                >
                                    <PlusIcon className="w-3.5 h-3.5" />Tambah
                                </button>
                            </div>

                            <div className="overflow-hidden border border-[#E5EAF3] rounded-2xl relative bg-[#f8f9fb]">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f8f9fb] border-b border-[#E5EAF3]">
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest w-16 text-center">ID</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Nama Lengkap</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-center">Simbol</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-center">Digunakan Oleh</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {filteredUnits.length > 0 ? filteredUnits.map((u, i) => (
                                            <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-[11px] font-bold text-gray-400">#{u.id}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[14px] font-bold text-[#4722B3]">{u.name}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-3 py-1 bg-gray-100 text-[#4722B3] rounded-md text-[13px] font-black border border-gray-200">
                                                        {u.symbol}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[12px] font-bold tracking-wide">
                                                        {u.products_count} Produk
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end items-center space-x-2">
                                                        <button 
                                                            onClick={() => openEditUnit(u)}
                                                            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors"
                                                            title="Edit Satuan"
                                                        >
                                                            <EditIcon className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => deleteUnit(u.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                            title="Hapus Satuan"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <ScaleIcon className="w-10 h-10 text-gray-200 mb-3" />
                                                        <span className="text-[14px] font-bold text-gray-400">Belum ada satuan terdaftar</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'staff' && (
                        <div ref={staffSectionRef} className="bg-white rounded-xl p-6 border border-[#E5EAF3]">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
                                <div>
                                    <h2 className="flex items-center gap-2 text-[18px] font-black text-[#4722B3]">
                                        <User className="h-4 w-4 text-indigo-600" /> Akun Tim Operasional
                                    </h2>
                                    <p className="text-[12px] font-semibold text-gray-400 mt-0.5">Kelola akun Supervisor dan Staff gudang.</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-700">
                                            {filteredStaffUsers.filter((u) => u.status === 'active').length} Aktif
                                        </span>
                                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-black text-slate-600">
                                            {filteredStaffUsers.length} Total
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowStaffModal(true)}
                                    className="px-4 py-2 bg-[#5B33CC] hover:bg-indigo-700 text-white font-bold rounded-lg text-[12px] flex items-center gap-1.5"
                                >
                                    <PlusIcon className="w-3.5 h-3.5" />Buat Akun
                                </button>
                            </div>

                            <div className="overflow-hidden border border-[#E5EAF3] rounded-2xl relative bg-[#f8f9fb]">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f8f9fb] border-b border-[#E5EAF3]">
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Nama</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Peran</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Email</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Telepon</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {filteredStaffUsers.length > 0 ? filteredStaffUsers.map((user) => (
                                            <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-[14px] font-bold text-[#4722B3]">{user.name}</div>
                                                    <div className="text-[11px] font-bold text-gray-400">Dibuat {user.created_at || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-[12px] font-bold tracking-wide ${user.role === 'Supervisor' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'}`}>
                                                        {formatOperationalRole(user.role)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-[13px] font-semibold text-gray-500">{user.email}</td>
                                                <td className="px-6 py-4 text-[13px] font-semibold text-gray-500">{user.phone || '-'}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-[12px] font-bold tracking-wide ${user.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                                        {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditStaff(user)}
                                                            className="px-3 py-2 text-[12px] font-bold rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                                        >
                                                            <EditIcon className="w-3.5 h-3.5" />
                                                        </button>
                                                        {user.status === 'active' ? (
                                                            <button
                                                                onClick={() => updateStaffStatus(user, 'inactive')}
                                                                className="px-3 py-2 text-[12px] font-bold rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                                                            >
                                                                Nonaktifkan
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => updateStaffStatus(user, 'active')}
                                                                className="px-3 py-2 text-[12px] font-bold rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                            >
                                                                Aktifkan
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteStaff(user.id)}
                                                            className="px-3 py-2 text-[12px] font-bold rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                        >
                                                            <TrashIcon className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <UsersIcon className="w-10 h-10 text-gray-200 mb-3" />
                                                        <span className="text-[14px] font-bold text-gray-400">Belum ada akun operasional</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
            </div>

            {/* MODALS */}
            <Modal show={showCategoryModal} onClose={closeCategoryModal} maxWidth="xl">
                <div className="overflow-hidden rounded-[24px] bg-white">
                    <div className="flex items-center justify-between border-b border-gray-100 bg-slate-50/70 px-7 py-5">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-xl bg-indigo-100 p-2">
                                <TagIcon className="h-5 w-5 text-indigo-600" />
                            </div>
                            <h3 className="text-[18px] font-black text-[#4722B3]">
                                {editingCategory ? 'Edit Kategori' : 'Kategori Baru'}
                            </h3>
                        </div>
                        <button onClick={closeCategoryModal} className="rounded-lg p-1 text-gray-400 transition hover:bg-white hover:text-gray-600">
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <form onSubmit={submitCategory} className="space-y-5 px-7 py-6">
                        <div>
                            <label className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                                <Tag className="h-3.5 w-3.5" /> NAMA KATEGORI
                            </label>
                            <input
                                type="text"
                                className="block w-full rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-[14px] font-bold text-gray-800 focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC]"
                                value={categoryForm.data.name}
                                onChange={e => categoryForm.setData('name', e.target.value)}
                                placeholder="misal: Komponen Elektronik"
                                required
                                autoFocus
                            />
                            {categoryForm.errors.name && <div className="mt-1 text-xs font-bold text-red-500">{categoryForm.errors.name}</div>}
                        </div>
                        <div>
                            <label className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                                <FileText className="h-3.5 w-3.5" /> DESKRIPSI (OPSIONAL)
                            </label>
                            <input
                                type="text"
                                className="block w-full rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-[14px] font-semibold text-gray-700 focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC]"
                                value={categoryForm.data.description}
                                onChange={e => categoryForm.setData('description', e.target.value)}
                                placeholder="Penjelasan ringkas kategori..."
                            />
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                            <button type="button" onClick={closeCategoryModal} className="rounded-xl border border-gray-200 px-5 py-3 font-bold text-gray-600 transition-colors hover:bg-gray-50">Batal</button>
                            <button type="submit" disabled={categoryForm.processing} className="rounded-xl bg-[#5B33CC] px-6 py-3 font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-50">
                                {editingCategory ? 'Perbarui Kategori' : 'Simpan Klasifikasi'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal show={showUnitModal} onClose={closeUnitModal} maxWidth="xl">
                <div className="overflow-hidden rounded-[24px] bg-white">
                    <div className="flex items-center justify-between border-b border-gray-100 bg-slate-50/70 px-7 py-5">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-xl bg-indigo-100 p-2">
                                <ScaleIcon className="h-5 w-5 text-indigo-600" />
                            </div>
                            <h3 className="text-[18px] font-black text-[#4722B3]">
                                {editingUnit ? 'Edit Satuan / Unit' : 'Satuan / Unit Baru'}
                            </h3>
                        </div>
                        <button onClick={closeUnitModal} className="rounded-lg p-1 text-gray-400 transition hover:bg-white hover:text-gray-600">
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <form onSubmit={submitUnit} className="space-y-5 px-7 py-6">
                        <div>
                            <label className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                                <Ruler className="h-3.5 w-3.5" /> NAMA LENGKAP
                            </label>
                            <input
                                type="text"
                                className="block w-full rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-[14px] font-bold text-gray-800 focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC]"
                                value={unitForm.data.name}
                                onChange={e => unitForm.setData('name', e.target.value)}
                                placeholder="misal: Milimeter, Kilogram, Kotak"
                                required
                                autoFocus
                            />
                            {unitForm.errors.name && <div className="mt-1 text-xs font-bold text-red-500">{unitForm.errors.name}</div>}
                        </div>
                        <div>
                            <label className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                                <Hash className="h-3.5 w-3.5" /> SIMBOL
                            </label>
                            <input
                                type="text"
                                className="block w-full rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-[14px] font-black text-gray-800 focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC]"
                                value={unitForm.data.symbol}
                                onChange={e => unitForm.setData('symbol', e.target.value)}
                                placeholder="misal: mm, kg, box"
                                required
                            />
                            {unitForm.errors.symbol && <div className="mt-1 text-xs font-bold text-red-500">{unitForm.errors.symbol}</div>}
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                            <button type="button" onClick={closeUnitModal} className="rounded-xl border border-gray-200 px-5 py-3 font-bold text-gray-600 transition-colors hover:bg-gray-50">Batal</button>
                            <button type="submit" disabled={unitForm.processing} className="rounded-xl bg-[#5B33CC] px-6 py-3 font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-50">
                                {editingUnit ? 'Perbarui Satuan' : 'Simpan Satuan'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal show={showStaffModal} onClose={closeStaffModal} maxWidth="xl">
                <div className="overflow-hidden rounded-[24px] bg-white">
                    <div className="flex items-center justify-between border-b border-gray-100 bg-slate-50/70 px-7 py-5">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-xl bg-indigo-100 p-2">
                                <UsersIcon className="h-5 w-5 text-indigo-600" />
                            </div>
                            <h3 className="text-[18px] font-black text-[#4722B3]">{editingStaff ? 'Edit Akun Operasional' : 'Akun Operasional Baru'}</h3>
                        </div>
                        <button onClick={closeStaffModal} className="rounded-lg p-1 text-gray-400 transition hover:bg-white hover:text-gray-600">
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <form onSubmit={submitStaff} className="space-y-5 px-7 py-6">
                            <div>
                                <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">
                                    <User className="h-3.5 w-3.5" /> NAMA PENGGUNA OPERASIONAL
                                </label>
                                <input
                                    type="text"
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-800"
                                    value={staffForm.data.name}
                                    onChange={e => staffForm.setData('name', e.target.value)}
                                    required
                                    autoFocus
                                />
                                {staffForm.errors.name && <div className="text-red-500 text-xs mt-1 font-bold">{staffForm.errors.name}</div>}
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">
                                    <ShieldCheck className="h-3.5 w-3.5" /> ROLE AKUN
                                </label>
                                <CustomDropdown
                                    value={staffForm.data.role}
                                    onChange={(value) => staffForm.setData('role', value)}
                                    options={[
                                        { value: 'Staff', label: 'Staff Operasional - input outbound dan lihat data operasional' },
                                        { value: 'Supervisor', label: 'Supervisor Gudang - approval harian, laporan, export, dan koordinasi shift' },
                                    ]}
                                />
                                {staffForm.errors.role && <div className="text-red-500 text-xs mt-1 font-bold">{staffForm.errors.role}</div>}
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">
                                    <Mail className="h-3.5 w-3.5" /> EMAIL LOGIN
                                </label>
                                <input
                                    type="email"
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-800"
                                    value={staffForm.data.email}
                                    onChange={e => staffForm.setData('email', e.target.value)}
                                    required
                                />
                                {staffForm.errors.email && <div className="text-red-500 text-xs mt-1 font-bold">{staffForm.errors.email}</div>}
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">
                                    <Phone className="h-3.5 w-3.5" /> TELEPON
                                </label>
                                <input
                                    type="text"
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-semibold text-gray-600"
                                    value={staffForm.data.phone}
                                    onChange={e => staffForm.setData('phone', e.target.value)}
                                />
                                {staffForm.errors.phone && <div className="text-red-500 text-xs mt-1 font-bold">{staffForm.errors.phone}</div>}
                            </div>
                            {!editingStaff && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">
                                        <KeyRound className="h-3.5 w-3.5" /> PASSWORD
                                    </label>
                                    <input
                                        type="password"
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-800"
                                        value={staffForm.data.password}
                                        onChange={e => staffForm.setData('password', e.target.value)}
                                        required
                                    />
                                    {staffForm.errors.password && <div className="text-red-500 text-xs mt-1 font-bold">{staffForm.errors.password}</div>}
                                </div>
                                <div>
                                    <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">
                                        <KeyRound className="h-3.5 w-3.5" /> KONFIRMASI
                                    </label>
                                    <input
                                        type="password"
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-800"
                                        value={staffForm.data.password_confirmation}
                                        onChange={e => staffForm.setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            )}
                            <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                                <button type="button" onClick={closeStaffModal} className="rounded-xl border border-gray-200 px-5 py-3 font-bold text-gray-600 transition-colors hover:bg-gray-50">Batal</button>
                                <button type="submit" disabled={staffForm.processing} className="rounded-xl bg-[#5B33CC] px-6 py-3 font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-50">
                                    {editingStaff ? 'Perbarui Akun' : 'Buat Akun'}
                                </button>
                            </div>
                        </form>
                </div>
            </Modal>

            <Modal show={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-[16px] font-black text-gray-900">Konfirmasi Hapus</h2>
                    <p className="mt-2 text-[13px] font-semibold text-gray-500">{confirmDelete?.message}</p>
                    <div className="mt-6 flex justify-end gap-3">
                        <button onClick={() => setConfirmDelete(null)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-[13px] font-bold text-gray-600 hover:bg-gray-50">Batal</button>
                        <button onClick={executeDelete} className="rounded-xl bg-red-600 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-red-700">Hapus</button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
