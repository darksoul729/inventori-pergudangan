import React, { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';

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

export default function Settings({ auth, categories, units, warehouse }) {
    const { flash = {} } = usePage().props;
    const queryParams = new URLSearchParams(window.location.search);
    const [activeTab, setActiveTab] = useState(queryParams.get('active') || 'warehouse');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    
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

    return (
        <DashboardLayout headerTitle="Pengaturan Sistem">
            <Head title="Pengaturan" />

            <div className="flex flex-row gap-8 pb-12 w-full pt-4 min-w-[1000px] overflow-x-auto bg-[#f8fafc] animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Sidebar Navigation for Settings */}
                <div className="w-[280px] flex-shrink-0 flex flex-col space-y-2">
                    <h3 className="text-[11px] font-extrabold text-gray-400 tracking-widest uppercase mb-4 px-2">Menu Konfigurasi</h3>
                    
                    <button 
                        onClick={() => setActiveTab('warehouse')}
                        className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl font-bold text-[14px] transition-all text-left ${activeTab === 'warehouse' ? 'bg-white text-[#4f46e5] shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-100' : 'text-gray-500 hover:bg-white/60 hover:text-gray-900 border border-transparent'}`}
                    >
                        <div className={`p-2 rounded-xl flex-shrink-0 ${activeTab === 'warehouse' ? 'bg-indigo-50 text-indigo-500' : 'bg-gray-100 text-gray-400'}`}>
                            <BuildingIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="mb-0.5">Profil Gudang</div>
                            <div className={`text-[11px] font-semibold ${activeTab === 'warehouse' ? 'text-indigo-400' : 'text-gray-400'}`}>Identitas & Lokasi Dasar</div>
                        </div>
                    </button>

                    <button 
                        onClick={() => setActiveTab('categories')}
                        className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl font-bold text-[14px] transition-all text-left ${activeTab === 'categories' ? 'bg-white text-[#4f46e5] shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-100' : 'text-gray-500 hover:bg-white/60 hover:text-gray-900 border border-transparent'}`}
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
                        className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl font-bold text-[14px] transition-all text-left ${activeTab === 'units' ? 'bg-white text-[#4f46e5] shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-100' : 'text-gray-500 hover:bg-white/60 hover:text-gray-900 border border-transparent'}`}
                    >
                        <div className={`p-2 rounded-xl flex-shrink-0 ${activeTab === 'units' ? 'bg-indigo-50 text-indigo-500' : 'bg-gray-100 text-gray-400'}`}>
                            <ScaleIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="mb-0.5">Satuan Metrik</div>
                            <div className={`text-[11px] font-semibold ${activeTab === 'units' ? 'text-indigo-400' : 'text-gray-400'}`}>Unit Perhitungan Barcode</div>
                        </div>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
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
                        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                            <h2 className="text-[20px] font-black text-[#1a202c] mb-2">Konfigurasi Gudang Aktif</h2>
                            <p className="text-[13px] font-semibold text-gray-400 mb-8">Atur identitas utama dari gudang yang dikelola pada sesi aktif ini.</p>

                            <form onSubmit={submitWarehouse} className="space-y-6 max-w-2xl">
                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">NAMA GUDANG</label>
                                    <input 
                                        type="text" 
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
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
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]" 
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
                                        className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-medium text-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] resize-none" 
                                        value={warehouseForm.data.description}
                                        onChange={e => warehouseForm.setData('description', e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={warehouseForm.processing}
                                        className="px-6 py-3 bg-[#4f46e5] hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all"
                                    >
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* CATEGORIES TAB */}
                    {activeTab === 'categories' && (
                        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-[20px] font-black text-[#1a202c] mb-1">Manajemen Kategori Barang</h2>
                                    <p className="text-[13px] font-semibold text-gray-400">Klasifikasi produk mempermudah perhitungan dan reporting.</p>
                                </div>
                                <button 
                                    onClick={() => setShowCategoryModal(true)}
                                    className="px-5 py-2.5 bg-[#1a202c] hover:bg-[#2d3748] text-white font-bold rounded-xl transition-colors flex items-center space-x-2 text-[13px]"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    <span>Tambah Kategori</span>
                                </button>
                            </div>

                            <div className="overflow-hidden border border-[#edf2f7] rounded-2xl relative bg-[#f8f9fb]">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f8f9fb] border-b border-[#edf2f7]">
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest w-16 text-center">ID</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Nama Kategori</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Deskripsi</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-center">Digunakan Oleh</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {categories.length > 0 ? categories.map((cat, i) => (
                                            <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-[11px] font-bold text-gray-400">#{cat.id}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[14px] font-bold text-[#1a202c]">{cat.name}</span>
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
                        <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#edf2f7]">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-[20px] font-black text-[#1a202c] mb-1">Satuan Metrik (Units)</h2>
                                    <p className="text-[13px] font-semibold text-gray-400">Kelola master data satuan pengukuran inventaris fisik.</p>
                                </div>
                                <button 
                                    onClick={() => setShowUnitModal(true)}
                                    className="px-5 py-2.5 bg-[#1a202c] hover:bg-[#2d3748] text-white font-bold rounded-xl transition-colors flex items-center space-x-2 text-[13px]"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    <span>Tambah Satuan</span>
                                </button>
                            </div>

                            <div className="overflow-hidden border border-[#edf2f7] rounded-2xl relative bg-[#f8f9fb]">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f8f9fb] border-b border-[#edf2f7]">
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest w-16 text-center">ID</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Nama Lengkap</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-center">Simbol</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-center">Digunakan Oleh</th>
                                            <th className="px-6 py-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {units.length > 0 ? units.map((u, i) => (
                                            <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-[11px] font-bold text-gray-400">#{u.id}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[14px] font-bold text-[#1a202c]">{u.name}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-3 py-1 bg-gray-100 text-[#1a202c] rounded-md text-[13px] font-black border border-gray-200">
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
                </div>
            </div>

            {/* MODALS */}
            {/* Add Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-[#f8f9fb]">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-indigo-100 rounded-xl">
                                    <TagIcon className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h3 className="text-[18px] font-black text-[#1a202c]">
                                    {editingCategory ? 'Edit Kategori' : 'Kategori Baru'}
                                </h3>
                            </div>
                            <button 
                                onClick={() => {
                                    setShowCategoryModal(false);
                                    setEditingCategory(null);
                                    categoryForm.reset();
                                }} 
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={submitCategory} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">NAMA KATEGORI</label>
                                <input 
                                    type="text" 
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-800" 
                                    value={categoryForm.data.name}
                                    onChange={e => categoryForm.setData('name', e.target.value)}
                                    placeholder="misal: Komponen Elektronik"
                                    required autoFocus
                                />
                                {categoryForm.errors.name && <div className="text-red-500 text-xs mt-1 font-bold">{categoryForm.errors.name}</div>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">DESKRIPSI (OPSIONAL)</label>
                                <input 
                                    type="text" 
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-semibold text-gray-600" 
                                    value={categoryForm.data.description}
                                    onChange={e => categoryForm.setData('description', e.target.value)}
                                    placeholder="Penjelasan ringkas kategori..."
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => { setShowCategoryModal(false); setEditingCategory(null); categoryForm.reset(); }} className="px-5 py-3 hover:bg-gray-50 border border-gray-100 text-gray-600 font-bold rounded-xl transition-colors">Batal</button>
                                <button type="submit" disabled={categoryForm.processing} className="px-6 py-3 bg-[#4f46e5] hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all">
                                    {editingCategory ? 'Perbarui Kategori' : 'Simpan Klasifikasi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Unit Modal */}
            {showUnitModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-[#f8f9fb]">
                            <h3 className="text-[18px] font-black text-[#1a202c]">
                                {editingUnit ? 'Edit Satuan / Unit' : 'Satuan / Unit Baru'}
                            </h3>
                            <button 
                                onClick={() => {
                                    setShowUnitModal(false);
                                    setEditingUnit(null);
                                    unitForm.reset();
                                }} 
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={submitUnit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">NAMA LENGKAP</label>
                                <input 
                                    type="text" 
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-bold text-gray-800" 
                                    value={unitForm.data.name}
                                    onChange={e => unitForm.setData('name', e.target.value)}
                                    placeholder="misal: Milimeter, Kilogram, Kotak"
                                    required autoFocus
                                />
                                {unitForm.errors.name && <div className="text-red-500 text-xs mt-1 font-bold">{unitForm.errors.name}</div>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 tracking-wider uppercase mb-2">SIMBOL</label>
                                <input 
                                    type="text" 
                                    className="bg-[#f8f9fb] border border-transparent focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] block w-full px-4 py-3 sm:text-[14px] rounded-xl font-black text-gray-800" 
                                    value={unitForm.data.symbol}
                                    onChange={e => unitForm.setData('symbol', e.target.value)}
                                    placeholder="misal: mm, kg, box"
                                    required
                                />
                                {unitForm.errors.symbol && <div className="text-red-500 text-xs mt-1 font-bold">{unitForm.errors.symbol}</div>}
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => { setShowUnitModal(false); setEditingUnit(null); unitForm.reset(); }} className="px-5 py-3 hover:bg-gray-50 border border-gray-100 text-gray-600 font-bold rounded-xl transition-colors">Batal</button>
                                <button type="submit" disabled={unitForm.processing} className="px-6 py-3 bg-[#4f46e5] hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all">
                                    {editingUnit ? 'Perbarui Satuan' : 'Simpan Satuan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
