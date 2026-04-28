import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import Modal from '@/Components/Modal';

// Icons
const BuildingIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

const TagIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
);

const ScaleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
);

const UsersIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m0-4a4 4 0 100-8 4 4 0 000 8zm8 0a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
);

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

export default function Settings({ auth, categories, units, warehouse, staffUsers = [] }) {
    const { flash = {} } = usePage().props;
    const queryParams = new URLSearchParams(window.location.search);
    const [activeTab, setActiveTab] = useState(queryParams.get('active') || 'warehouse');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
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

    const submitWarehouse = (e) => {
        e.preventDefault();
        // Fallback to updating warehouse ID 1 or a specific route if warehouse is null.
        // Assuming warehouse ID 1 is the default if not set.
        const id = warehouse?.id || 1;
        warehouseForm.put(route('settings.warehouse.update', id));
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
        if(confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            router.delete(route('settings.categories.destroy', id));
        }
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
        if(confirm('Apakah Anda yakin ingin menghapus satuan ini?')) {
            router.delete(route('settings.units.destroy', id));
        }
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
        staffForm.post(route('settings.staff.store'), {
            onSuccess: () => {
                staffForm.reset();
                setShowStaffModal(false);
                setActiveTab('staff');
            },
        });
    };

    const closeStaffModal = () => {
        setShowStaffModal(false);
        staffForm.reset();
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

    return (
        <DashboardLayout
            headerTitle="Pengaturan Sistem"
            hideMainScrollbar
            searchValue={searchTerm}
            onSearch={setSearchTerm}
        >
            <Head title="Pengaturan" />

            <div className="w-full pt-3 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Sidebar Navigation for Settings */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[248px_minmax(0,1fr)]">
                    <div className="xl:sticky xl:top-4 h-fit rounded-2xl border border-[#EDE8FC] bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
                        <h3 className="text-[11px] font-extrabold text-gray-400 tracking-widest uppercase mb-4 px-2">Menu Konfigurasi</h3>
                        <div className="flex flex-col space-y-2">
                            <button 
                                onClick={() => setActiveTab('warehouse')}
                                className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl font-bold text-[14px] transition-all text-left ${activeTab === 'warehouse' ? 'bg-white text-[#5932C9] shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-100' : 'text-gray-500 hover:bg-[#F8F7FF] hover:text-gray-900 border border-transparent'}`}
                            >
                                <div className={`p-2 rounded-xl flex-shrink-0 ${activeTab === 'warehouse' ? 'bg-indigo-50 text-indigo-500' : 'bg-gray-100 text-gray-400'}`}>
                                    <BuildingIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="mb-0.5">Gudang Utama</div>
                                    <div className={`text-[11px] font-semibold ${activeTab === 'warehouse' ? 'text-indigo-400' : 'text-gray-400'}`}>Profil & Lokasi Samarinda</div>
                                </div>
                            </button>

                            <button 
                                onClick={() => setActiveTab('categories')}
                                className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl font-bold text-[14px] transition-all text-left ${activeTab === 'categories' ? 'bg-white text-[#5932C9] shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-100' : 'text-gray-500 hover:bg-[#F8F7FF] hover:text-gray-900 border border-transparent'}`}
                            >
                                <div className={`p-2 rounded-xl flex-shrink-0 ${activeTab === 'categories' ? 'bg-indigo-50 text-indigo-500' : 'bg-gray-100 text-gray-400'}`}>
                                    <TagIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="mb-0.5">Daftar Kategori</div>
                                    <div className={`text-[11px] font-semibold ${activeTab === 'categories' ? 'text-indigo-400' : 'text-gray-400'}`}>Klasifikasi Inventaris</div>
                                </div>
                            </button>

                            <button 
                                onClick={() => setActiveTab('units')}
                                className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl font-bold text-[14px] transition-all text-left ${activeTab === 'units' ? 'bg-white text-[#5932C9] shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-100' : 'text-gray-500 hover:bg-[#F8F7FF] hover:text-gray-900 border border-transparent'}`}
                            >
                                <div className={`p-2 rounded-xl flex-shrink-0 ${activeTab === 'units' ? 'bg-indigo-50 text-indigo-500' : 'bg-gray-100 text-gray-400'}`}>
                                    <ScaleIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="mb-0.5">Satuan Metrik</div>
                                    <div className={`text-[11px] font-semibold ${activeTab === 'units' ? 'text-indigo-400' : 'text-gray-400'}`}>Unit Perhitungan Barcode</div>
                                </div>
                            </button>

                            <button 
                                onClick={() => setActiveTab('staff')}
                                className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl font-bold text-[14px] transition-all text-left ${activeTab === 'staff' ? 'bg-white text-[#5932C9] shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-100' : 'text-gray-500 hover:bg-[#F8F7FF] hover:text-gray-900 border border-transparent'}`}
                            >
                                <div className={`p-2 rounded-xl flex-shrink-0 ${activeTab === 'staff' ? 'bg-indigo-50 text-indigo-500' : 'bg-gray-100 text-gray-400'}`}>
                                    <UsersIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="mb-0.5">Akun Operasional</div>
                                    <div className={`text-[11px] font-semibold ${activeTab === 'staff' ? 'text-indigo-400' : 'text-gray-400'}`}>Login Operasional Terbatas</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="min-w-0 min-h-[calc(100vh-220px)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {/* Flash Messages */}
                    {flash.success && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
                            <span>{flash.success}</span>
                        </div>
                    )}
                    {flash.error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
                            <span>{flash.error}</span>
                        </div>
                    )}

                    {/* WAREHOUSE TAB */}
                    {activeTab === 'warehouse' && (
                        <div ref={warehouseSectionRef} className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC] min-h-[calc(100vh-240px)]">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-[20px] font-black text-[#28106F]">Gudang Utama</h2>
                                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-black text-emerald-700 uppercase tracking-wider">Gudang Tunggal</span>
                            </div>
                            <p className="text-[13px] font-semibold text-gray-400 mb-8">Sistem ini beroperasi dengan 1 gudang utama di Samarinda, Kalimantan Timur. Semua pengiriman berasal dari gudang ini.</p>

                            <form onSubmit={submitWarehouse} className="space-y-6 max-w-2xl">
                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">NAMA GUDANG</label>
                                    <input 
                                        type="text" 
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                        value={warehouseForm.data.name}
                                        onChange={e => warehouseForm.setData('name', e.target.value)}
                                        required
                                    />
                                    {warehouseForm.errors.name && <div className="text-red-500 text-xs mt-1 font-bold">{warehouseForm.errors.name}</div>}
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">LOKASI / ALAMAT</label>
                                    <input 
                                        type="text" 
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
                                        value={warehouseForm.data.location}
                                        onChange={e => warehouseForm.setData('location', e.target.value)}
                                        required
                                    />
                                    {warehouseForm.errors.location && <div className="text-red-500 text-xs mt-1 font-bold">{warehouseForm.errors.location}</div>}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">DESKRIPSI (ОPSIONAL)</label>
                                    <textarea 
                                        rows="3"
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-medium text-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] resize-none" 
                                        value={warehouseForm.data.description}
                                        onChange={e => warehouseForm.setData('description', e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={warehouseForm.processing}
                                        className="px-6 py-3 bg-[#5932C9] hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all"
                                    >
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* CATEGORIES TAB */}
                    {activeTab === 'categories' && (
                        <div ref={categoriesSectionRef} className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC] min-h-[calc(100vh-240px)]">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-[20px] font-black text-[#28106F] mb-1">Manajemen Kategori Barang</h2>
                                    <p className="text-[13px] font-semibold text-gray-400">Klasifikasi produk mempermudah perhitungan dan reporting.</p>
                                </div>
                                <button 
                                    onClick={() => setShowCategoryModal(true)}
                                    className="px-5 py-2.5 bg-[#28106F] hover:bg-[#2d3748] text-white font-bold rounded-xl transition-colors flex items-center space-x-2 text-[13px]"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    <span>Tambah Kategori</span>
                                </button>
                            </div>

                            <div className="overflow-hidden border border-[#EDE8FC] rounded-2xl relative bg-[#f8f9fb]">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f8f9fb] border-b border-[#EDE8FC]">
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
                                                    <span className="text-[14px] font-bold text-[#28106F]">{cat.name}</span>
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
                        <div ref={unitsSectionRef} className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC] min-h-[calc(100vh-240px)]">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-[20px] font-black text-[#28106F] mb-1">Satuan Metrik (Units)</h2>
                                    <p className="text-[13px] font-semibold text-gray-400">Kelola master data satuan pengukuran inventaris fisik.</p>
                                </div>
                                <button 
                                    onClick={() => setShowUnitModal(true)}
                                    className="px-5 py-2.5 bg-[#28106F] hover:bg-[#2d3748] text-white font-bold rounded-xl transition-colors flex items-center space-x-2 text-[13px]"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    <span>Tambah Satuan</span>
                                </button>
                            </div>

                            <div className="overflow-hidden border border-[#EDE8FC] rounded-2xl relative bg-[#f8f9fb]">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f8f9fb] border-b border-[#EDE8FC]">
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
                                                    <span className="text-[14px] font-bold text-[#28106F]">{u.name}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-3 py-1 bg-gray-100 text-[#28106F] rounded-md text-[13px] font-black border border-gray-200">
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
                        <div ref={staffSectionRef} className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC] min-h-[calc(100vh-240px)]">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                <div>
                                    <h2 className="text-[20px] font-black text-[#28106F] mb-1">Manajemen Akun Operasional</h2>
                                    <p className="text-[13px] font-semibold text-gray-400">Manager Gudang dapat membuat akun Supervisor Gudang untuk approval harian dan Staff Operasional untuk input operasional.</p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
                                            {filteredStaffUsers.filter((u) => u.status === 'active').length} Aktif
                                        </span>
                                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-black text-slate-600">
                                            {filteredStaffUsers.length} Total Akun
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowStaffModal(true)}
                                    className="px-5 py-2.5 bg-[#28106F] hover:bg-[#2d3748] text-white font-bold rounded-xl transition-colors flex items-center space-x-2 text-[13px]"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    <span>Buat Akun</span>
                                </button>
                            </div>

                            <div className="overflow-hidden border border-[#EDE8FC] rounded-2xl relative bg-[#f8f9fb]">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f8f9fb] border-b border-[#EDE8FC]">
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Nama</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Role</th>
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
                                                    <div className="text-[14px] font-bold text-[#28106F]">{user.name}</div>
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
                                                    {user.status === 'active' ? (
                                                        <button
                                                            onClick={() => updateStaffStatus(user, 'inactive')}
                                                            className="px-4 py-2 text-[12px] font-bold rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                        >
                                                            Nonaktifkan
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => updateStaffStatus(user, 'active')}
                                                            className="px-4 py-2 text-[12px] font-bold rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                        >
                                                            Aktifkan
                                                        </button>
                                                    )}
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
                </div>
            </div>

            {/* MODALS */}
            <Modal show={showCategoryModal} onClose={closeCategoryModal} maxWidth="xl">
                <div className="overflow-hidden rounded-[24px] bg-white">
                    <div className="flex items-center justify-between border-b border-gray-100 bg-slate-50/70 px-7 py-5">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-xl bg-indigo-100 p-2">
                                <TagIcon className="h-5 w-5 text-indigo-600" />
                            </div>
                            <h3 className="text-[18px] font-black text-[#28106F]">
                                {editingCategory ? 'Edit Kategori' : 'Kategori Baru'}
                            </h3>
                        </div>
                        <button onClick={closeCategoryModal} className="rounded-lg p-1 text-gray-400 transition hover:bg-white hover:text-gray-600">
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <form onSubmit={submitCategory} className="space-y-5 px-7 py-6">
                        <div>
                            <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-gray-500">NAMA KATEGORI</label>
                            <input
                                type="text"
                                className="block w-full rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-[14px] font-bold text-gray-800 focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9]"
                                value={categoryForm.data.name}
                                onChange={e => categoryForm.setData('name', e.target.value)}
                                placeholder="misal: Komponen Elektronik"
                                required
                                autoFocus
                            />
                            {categoryForm.errors.name && <div className="mt-1 text-xs font-bold text-red-500">{categoryForm.errors.name}</div>}
                        </div>
                        <div>
                            <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-gray-500">DESKRIPSI (OPSIONAL)</label>
                            <input
                                type="text"
                                className="block w-full rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-[14px] font-semibold text-gray-700 focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9]"
                                value={categoryForm.data.description}
                                onChange={e => categoryForm.setData('description', e.target.value)}
                                placeholder="Penjelasan ringkas kategori..."
                            />
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                            <button type="button" onClick={closeCategoryModal} className="rounded-xl border border-gray-200 px-5 py-3 font-bold text-gray-600 transition-colors hover:bg-gray-50">Batal</button>
                            <button type="submit" disabled={categoryForm.processing} className="rounded-xl bg-[#5932C9] px-6 py-3 font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-50">
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
                            <h3 className="text-[18px] font-black text-[#28106F]">
                                {editingUnit ? 'Edit Satuan / Unit' : 'Satuan / Unit Baru'}
                            </h3>
                        </div>
                        <button onClick={closeUnitModal} className="rounded-lg p-1 text-gray-400 transition hover:bg-white hover:text-gray-600">
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <form onSubmit={submitUnit} className="space-y-5 px-7 py-6">
                        <div>
                            <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-gray-500">NAMA LENGKAP</label>
                            <input
                                type="text"
                                className="block w-full rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-[14px] font-bold text-gray-800 focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9]"
                                value={unitForm.data.name}
                                onChange={e => unitForm.setData('name', e.target.value)}
                                placeholder="misal: Milimeter, Kilogram, Kotak"
                                required
                                autoFocus
                            />
                            {unitForm.errors.name && <div className="mt-1 text-xs font-bold text-red-500">{unitForm.errors.name}</div>}
                        </div>
                        <div>
                            <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-gray-500">SIMBOL</label>
                            <input
                                type="text"
                                className="block w-full rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-[14px] font-black text-gray-800 focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9]"
                                value={unitForm.data.symbol}
                                onChange={e => unitForm.setData('symbol', e.target.value)}
                                placeholder="misal: mm, kg, box"
                                required
                            />
                            {unitForm.errors.symbol && <div className="mt-1 text-xs font-bold text-red-500">{unitForm.errors.symbol}</div>}
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                            <button type="button" onClick={closeUnitModal} className="rounded-xl border border-gray-200 px-5 py-3 font-bold text-gray-600 transition-colors hover:bg-gray-50">Batal</button>
                            <button type="submit" disabled={unitForm.processing} className="rounded-xl bg-[#5932C9] px-6 py-3 font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-50">
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
                            <h3 className="text-[18px] font-black text-[#28106F]">Akun Operasional Baru</h3>
                        </div>
                        <button onClick={closeStaffModal} className="rounded-lg p-1 text-gray-400 transition hover:bg-white hover:text-gray-600">
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <form onSubmit={submitStaff} className="space-y-5 px-7 py-6">
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">NAMA PENGGUNA OPERASIONAL</label>
                                <input
                                    type="text"
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-800"
                                    value={staffForm.data.name}
                                    onChange={e => staffForm.setData('name', e.target.value)}
                                    required
                                    autoFocus
                                />
                                {staffForm.errors.name && <div className="text-red-500 text-xs mt-1 font-bold">{staffForm.errors.name}</div>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">ROLE AKUN</label>
                                <select
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-800"
                                    value={staffForm.data.role}
                                    onChange={e => staffForm.setData('role', e.target.value)}
                                    required
                                >
                                    <option value="Staff">Staff Operasional - input outbound dan lihat data operasional</option>
                                    <option value="Supervisor">Supervisor Gudang - approval harian, laporan, export, dan koordinasi shift</option>
                                </select>
                                {staffForm.errors.role && <div className="text-red-500 text-xs mt-1 font-bold">{staffForm.errors.role}</div>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">EMAIL LOGIN</label>
                                <input
                                    type="email"
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-800"
                                    value={staffForm.data.email}
                                    onChange={e => staffForm.setData('email', e.target.value)}
                                    required
                                />
                                {staffForm.errors.email && <div className="text-red-500 text-xs mt-1 font-bold">{staffForm.errors.email}</div>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">TELEPON</label>
                                <input
                                    type="text"
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-semibold text-gray-600"
                                    value={staffForm.data.phone}
                                    onChange={e => staffForm.setData('phone', e.target.value)}
                                />
                                {staffForm.errors.phone && <div className="text-red-500 text-xs mt-1 font-bold">{staffForm.errors.phone}</div>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">PASSWORD</label>
                                    <input
                                        type="password"
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-800"
                                        value={staffForm.data.password}
                                        onChange={e => staffForm.setData('password', e.target.value)}
                                        required
                                    />
                                    {staffForm.errors.password && <div className="text-red-500 text-xs mt-1 font-bold">{staffForm.errors.password}</div>}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">KONFIRMASI</label>
                                    <input
                                        type="password"
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#5932C9] focus:ring-1 focus:ring-[#5932C9] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-800"
                                        value={staffForm.data.password_confirmation}
                                        onChange={e => staffForm.setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                                <button type="button" onClick={closeStaffModal} className="rounded-xl border border-gray-200 px-5 py-3 font-bold text-gray-600 transition-colors hover:bg-gray-50">Batal</button>
                                <button type="submit" disabled={staffForm.processing} className="rounded-xl bg-[#5932C9] px-6 py-3 font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-50">
                                    Buat Akun
                                </button>
                            </div>
                        </form>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
