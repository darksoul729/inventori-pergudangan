import DashboardLayout from '@/Layouts/DashboardLayout';
import CustomDropdown from '@/Components/CustomDropdown';
import FloatingNotice from '@/Components/FloatingNotice';
import { Head, router, usePage } from '@inertiajs/react';
import React from 'react';
import { ShieldCheck, Users2, Search } from 'lucide-react';

export default function SaasUsers({ users, roles = [], tenants = [], filters = {} }) {
    const { props } = usePage();
    const flash = props?.flash || {};
    const [floatingNotices, setFloatingNotices] = React.useState([]);
    const [search, setSearch] = React.useState(filters.search || '');
    const [status, setStatus] = React.useState(filters.status || 'all');
    const [role, setRole] = React.useState(filters.role || 'all');
    const [tenant, setTenant] = React.useState(filters.tenant || '');

    React.useEffect(() => {
        const notices = [];
        if (flash?.success) notices.push({ key: `ok-${Date.now()}`, type: 'success', text: flash.success });
        if (flash?.error) notices.push({ key: `err-${Date.now()}`, type: 'error', text: flash.error });
        if (!notices.length) return;
        setFloatingNotices((prev) => [...notices, ...prev].slice(0, 3));
    }, [flash?.success, flash?.error]);

    const applyFilter = () => {
        router.get(route('admin.users'), {
            search,
            status,
            role,
            tenant: tenant || undefined,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const updateUser = (user, payload) => {
        router.put(route('admin.users.update', user.id), payload, { preserveScroll: true });
    };

    return (
        <DashboardLayout headerTitle="Admin Sistem">
            <Head title="Kelola User Global" />
            <div className="w-full pt-3 pb-10 space-y-5">
                <FloatingNotice notices={floatingNotices} onClose={(key) => setFloatingNotices((prev) => prev.filter((n) => n.key !== key))} />

                <div className="rounded-2xl border border-[#E5EAF3] bg-white px-6 py-5">
                    <h1 className="text-[24px] font-black text-[#4722B3] flex items-center gap-2"><ShieldCheck className="w-6 h-6" />Kelola User Global</h1>
                    <p className="text-[13px] font-semibold text-gray-500 mt-1">Kelola akun lintas tenant untuk role dan status operasional.</p>
                </div>

                <div className="rounded-2xl border border-[#E5EAF3] bg-white p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Cari User</label>
                        <div className="mt-1 flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nama / email / telepon" className="w-full bg-transparent text-[13px] font-semibold outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-gray-400">Status</label>
                        <div className="mt-1">
                            <CustomDropdown value={status} onChange={setStatus} options={[{ value: 'all', label: 'Semua' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-gray-400">Role</label>
                        <div className="mt-1">
                            <CustomDropdown value={role} onChange={setRole} options={[{ value: 'all', label: 'Semua Role' }, ...roles.map((r) => ({ value: r.name, label: r.name }))]} />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase text-gray-400">Tenant</label>
                        <div className="mt-1">
                            <CustomDropdown value={String(tenant || '')} onChange={(v) => setTenant(v)} options={[{ value: '', label: 'Semua Tenant' }, ...tenants.map((t) => ({ value: String(t.id), label: `${t.name} (${t.code})` }))]} />
                        </div>
                    </div>
                    <div className="md:col-span-5 flex justify-end">
                        <button onClick={applyFilter} className="h-10 px-4 rounded-xl bg-[#5B33CC] text-white text-[12px] font-black">Terapkan Filter</button>
                    </div>
                </div>

                <div className="rounded-2xl border border-[#E5EAF3] bg-white overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E5EAF3] text-[12px] font-bold text-slate-500 flex items-center gap-2"><Users2 className="w-4 h-4 text-[#4722B3]" />Daftar User</div>
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400">
                            <tr>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Tenant</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Dibuat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(users?.data || []).map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3">
                                        <div className="text-[13px] font-bold text-slate-800">{u.name}</div>
                                        <div className="text-[11px] text-slate-500">{u.email}</div>
                                    </td>
                                    <td className="px-4 py-3 text-[12px] font-semibold text-slate-700">{u.tenant_name} <span className="text-slate-400">({u.tenant_code})</span></td>
                                    <td className="px-4 py-3">
                                        <CustomDropdown value={u.role} onChange={(value) => updateUser(u, { role: value })} options={roles.map((r) => ({ value: r.name, label: r.name }))} className="min-w-[160px]" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <CustomDropdown value={u.status || 'active'} onChange={(value) => updateUser(u, { status: value })} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} className="min-w-[130px]" />
                                    </td>
                                    <td className="px-4 py-3 text-[12px] text-slate-500">{u.created_at}</td>
                                </tr>
                            ))}
                            {(users?.data || []).length === 0 && (
                                <tr><td colSpan={5} className="px-4 py-10 text-center text-[12px] font-semibold text-slate-400">Tidak ada user ditemukan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
