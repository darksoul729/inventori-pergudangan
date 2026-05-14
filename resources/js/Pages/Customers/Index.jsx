import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { Plus, Users, User, X, UserPlus, Phone, Mail, MapPin, Building2 } from 'lucide-react';

export default function CustomerIndex({ customers, filters = {} }) {
    const { props } = usePage();
    const roleName = String(props.auth?.user?.role_name || props.auth?.user?.role || '').toLowerCase();
    const canManage = roleName.includes('manager') || roleName.includes('manajer') || roleName.includes('supervisor') || roleName.includes('spv');
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        name: '', contact_person: '', phone: '', email: '', address: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('customers.store'), { preserveScroll: true, onSuccess: () => { reset(); setShowModal(false); } });
    };

    const list = customers?.data || [];
    const total = list.length;

    return (
        <DashboardLayout headerTitle="Pelanggan" headerSearchPlaceholder="Cari...">
            <Head title="Pelanggan" />
            <div className="pb-12 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-[24px] font-black text-[#4722B3]">Pelanggan</h1>
                    {canManage && (
                        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#5B33CC] text-white font-bold rounded-lg text-sm">
                            <Plus className="w-4 h-4" />Tambah
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-[#E5EAF3]">
                        <div className="flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-indigo-500" /><span className="text-[11px] font-bold text-gray-500">Total</span></div>
                        <div className="text-[24px] font-black text-[#4722B3]">{total}</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#E5EAF3]">
                        <div className="flex items-center gap-2 mb-1"><Phone className="w-4 h-4 text-green-500" /><span className="text-[11px] font-bold text-gray-500">Ada HP</span></div>
                        <div className="text-[24px] font-black text-green-600">{list.filter(c => c.phone).length}</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#E5EAF3]">
                        <div className="flex items-center gap-2 mb-1"><Mail className="w-4 h-4 text-blue-500" /><span className="text-[11px] font-bold text-gray-500">Ada Email</span></div>
                        <div className="text-[24px] font-black text-blue-600">{list.filter(c => c.email).length}</div>
                    </div>
                </div>

                {/* List */}
                <div className="bg-white rounded-xl border border-[#E5EAF3] overflow-hidden">
                    {list.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {list.map((c) => (
                                <div key={c.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                                        <User className="w-5 h-5 text-[#5B33CC]" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-[#4722B3]">{c.name}</span>
                                            <span className="text-[10px] text-gray-400">{c.code}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">{c.contact_person || '-'} · {c.phone || c.email || '-'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="font-black text-[#4722B3]">Belum ada pelanggan</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal - full overlay */}
            {showModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl mx-4">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="font-black text-[#4722B3] text-lg">Pelanggan Baru</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Nama" className="w-full pl-10 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-semibold" required />
                            </div>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input value={data.contact_person} onChange={e => setData('contact_person', e.target.value)} placeholder="Penanggung Jawab" className="w-full pl-10 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-semibold" />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="HP" className="w-full pl-10 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-semibold" />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input value={data.email} onChange={e => setData('email', e.target.value)} placeholder="Email" className="w-full pl-10 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-semibold" />
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                <input value={data.address} onChange={e => setData('address', e.target.value)} placeholder="Alamat" className="w-full pl-10 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-semibold" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-lg text-sm">Batal</button>
                                <button type="submit" disabled={processing} className="flex-1 px-4 py-2.5 bg-[#5B33CC] text-white font-bold rounded-lg text-sm">{processing ? 'Simpan...' : 'Simpan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}