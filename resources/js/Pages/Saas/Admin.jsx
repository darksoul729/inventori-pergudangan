import DashboardLayout from '@/Layouts/DashboardLayout';
import CustomDropdown from '@/Components/CustomDropdown';
import { Head, router, usePage } from '@inertiajs/react';
import React from 'react';
import FloatingNotice from '@/Components/FloatingNotice';
import { ShieldCheck, Building2, Layers3, Users2, Activity, LayoutGrid, CheckCircle2, Clock3, AlertTriangle } from 'lucide-react';

const STATUS_OPTIONS = ['trialing', 'active', 'past_due', 'canceled'];
const statusColor = (s) => s === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : s === 'trialing' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200';
const statusLabel = (s) => s === 'trialing' ? 'Trial' : s === 'past_due' ? 'Past Due' : s === 'canceled' ? 'Canceled' : 'Active';

export default function SaasAdmin({ tenants = [], modules = [] }) {
    const { props } = usePage();
    const flash = props?.flash || {};
    const [floatingNotices, setFloatingNotices] = React.useState([]);
    const [search, setSearch] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('all');

    React.useEffect(() => {
        const notices = [];
        if (flash?.success) notices.push({ key: `ok-${Date.now()}`, type: 'success', text: flash.success });
        if (flash?.error) notices.push({ key: `err-${Date.now()}`, type: 'error', text: flash.error });
        if (!notices.length) return;
        setFloatingNotices((prev) => [...notices, ...prev].slice(0, 3));
    }, [flash?.success, flash?.error]);

    const handleToggle = (tenant, moduleCode, checked) => {
        const current = new Set(Object.keys(tenant.enabled_modules || {}));
        if (checked) current.add(moduleCode);
        else current.delete(moduleCode);
        router.put(route('settings.saas.modules.update', tenant.id), { modules: Array.from(current) }, { preserveScroll: true });
    };

    const handleStatus = (tenant, status) => {
        router.put(route('settings.saas.subscription.update', tenant.id), { status }, { preserveScroll: true });
    };

    const filtered = React.useMemo(() => {
        const s = search.toLowerCase();
        const base = tenants.filter((t) => {
            const bySearch = !search || t.name.toLowerCase().includes(s) || t.code.toLowerCase().includes(s);
            const byStatus = statusFilter === 'all' ? true : t.subscription_status === statusFilter;
            return bySearch && byStatus;
        });
        const rank = { past_due: 0, canceled: 1, trialing: 2, active: 3 };
        return base.sort((a, b) => (rank[a.subscription_status] ?? 9) - (rank[b.subscription_status] ?? 9));
    }, [tenants, search, statusFilter]);

    const stats = React.useMemo(() => ({
        total: tenants.length,
        active: tenants.filter(t => t.subscription_status === 'active').length,
        trialing: tenants.filter(t => t.subscription_status === 'trialing').length,
        pastDue: tenants.filter(t => t.subscription_status === 'past_due').length,
    }), [tenants]);
    const moduleCoverage = React.useMemo(() => {
        const summary = {};
        modules.forEach((m) => { summary[m.code] = 0; });
        tenants.forEach((tenant) => {
            modules.forEach((m) => {
                if (tenant.enabled_modules?.[m.code] || m.is_core) summary[m.code] += 1;
            });
        });
        return modules.map((m) => ({
            code: m.code,
            name: m.name,
            enabledCount: summary[m.code] || 0,
            pct: tenants.length ? Math.round(((summary[m.code] || 0) / tenants.length) * 100) : 0,
        }));
    }, [modules, tenants]);

    return (
        <DashboardLayout headerTitle="Admin Sistem" searchValue={search} onSearch={setSearch}>
            <Head title="Admin Sistem" />

            <div className="w-full pt-3 pb-10 space-y-5">
                <FloatingNotice notices={floatingNotices} onClose={(key) => setFloatingNotices((prev) => prev.filter((n) => n.key !== key))} />

                {/* Header */}
                <div className="rounded-2xl border border-[#E5EAF3] bg-white px-6 py-5 shadow-[0_10px_28px_rgba(17,24,39,0.05)]">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h1 className="text-[28px] leading-tight font-black text-[#4722B3] flex items-center gap-2"><ShieldCheck className="w-6 h-6" />Admin Sistem</h1>
                            <p className="text-[13px] font-semibold text-gray-500 mt-1">Kelola tenant, modul, dan status langganan secara terpusat.</p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50/70 px-3 py-2">
                            <span className="text-[10px] uppercase tracking-wider font-black text-violet-500">System Scope</span>
                            <span className="text-[12px] font-black text-[#4722B3]">{filtered.length} Tenant</span>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-[#E5EAF3] bg-white px-3 py-2 shadow-[0_8px_22px_rgba(17,24,39,0.06)]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quick Filter Status</div>
                        <div className="flex flex-wrap items-center gap-2">
                            {[
                                { key: 'all', label: `Semua (${tenants.length})` },
                                { key: 'past_due', label: `Past Due (${stats.pastDue})` },
                                { key: 'trialing', label: `Trial (${stats.trialing})` },
                                { key: 'active', label: `Active (${stats.active})` },
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => setStatusFilter(item.key)}
                                    className={`px-3 py-1.5 rounded-lg border text-[11px] font-black transition ${statusFilter === item.key ? 'bg-[#5B33CC] border-[#5B33CC] text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-[#5B33CC]'}`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Dashboard Top */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                    <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-4 shadow-[0_6px_20px_rgba(17,24,39,0.04)]">
                        <div className="flex items-center justify-between">
                            <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Total Tenant</div>
                            <Building2 className="w-4 h-4 text-[#4722B3]" />
                        </div>
                        <div className="text-2xl font-black text-[#4722B3] mt-1">{stats.total}</div>
                        <div className="text-[11px] font-semibold text-slate-400 mt-1">Tenant terdaftar di platform</div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-4 shadow-[0_6px_20px_rgba(17,24,39,0.04)]">
                        <div className="flex items-center justify-between">
                            <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Aktif</div>
                            <Activity className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-2xl font-black text-emerald-600 mt-1">{stats.active}</div>
                        <div className="text-[11px] font-semibold text-slate-400 mt-1">Status subscription aktif</div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-4 shadow-[0_6px_20px_rgba(17,24,39,0.04)]">
                        <div className="flex items-center justify-between">
                            <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Trial</div>
                            <Users2 className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="text-2xl font-black text-amber-600 mt-1">{stats.trialing}</div>
                        <div className="text-[11px] font-semibold text-slate-400 mt-1">Tenant dalam masa percobaan</div>
                    </div>
                </div>
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-4 shadow-[0_6px_20px_rgba(17,24,39,0.04)]">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Distribusi Status</div>
                            <LayoutGrid className="w-4 h-4 text-[#4722B3]" />
                        </div>
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between text-[12px] font-bold text-slate-700"><span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />Active</span><span>{stats.active}</span></div>
                            <div className="flex items-center justify-between text-[12px] font-bold text-slate-700"><span className="inline-flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5 text-amber-600" />Trial</span><span>{stats.trialing}</span></div>
                            <div className="flex items-center justify-between text-[12px] font-bold text-slate-700"><span className="inline-flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-rose-600" />Past Due</span><span>{stats.pastDue}</span></div>
                        </div>
                    </div>
                </div>

                {/* Module Coverage */}
                <div className="bg-white rounded-2xl border border-[#E5EAF3] p-5 shadow-[0_10px_28px_rgba(17,24,39,0.04)]">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[14px] font-black text-slate-800 flex items-center gap-2"><Layers3 className="w-4 h-4 text-[#4722B3]" />Ringkasan Modul Tenant</h2>
                        <span className="text-[11px] font-bold text-slate-400">Coverage seluruh tenant</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {moduleCoverage.map((item) => (
                            <div key={item.code} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="text-[12px] font-bold text-slate-700">{item.name}</div>
                                    <div className="text-[11px] font-black text-[#4722B3]">{item.pct}%</div>
                                </div>
                                <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                    <div className="h-full bg-[#5B33CC] rounded-full" style={{ width: `${item.pct}%` }} />
                                </div>
                                <div className="mt-1 text-[10px] text-slate-500 font-semibold">{item.enabledCount}/{tenants.length || 0} tenant aktif</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tenant List */}
                {filtered.map((tenant) => (
                    <div key={tenant.id} className="bg-white rounded-2xl border border-[#E5EAF3] overflow-hidden shadow-[0_10px_30px_rgba(17,24,39,0.04)]">
                        {/* Tenant Header */}
                        <div className="px-5 py-4 border-b border-[#E5EAF3] bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                                    <Building2 className="w-4 h-4 text-[#4722B3]" />
                                </div>
                                <div>
                                    <h2 className="text-[15px] font-black text-slate-800">{tenant.name}</h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[11px] font-mono font-bold text-gray-400">{tenant.code}</span>
                                        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{tenant.plan}</span>
                                        <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded border ${statusColor(tenant.subscription_status)}`}>{statusLabel(tenant.subscription_status)}</span>
                                    </div>
                                </div>
                            </div>
                            <CustomDropdown
                                value={tenant.subscription_status}
                                onChange={(value) => handleStatus(tenant, value)}
                                options={STATUS_OPTIONS.map((s) => ({ value: s, label: statusLabel(s) }))}
                                className="min-w-[180px] bg-white"
                            />
                        </div>

                        {/* Modules Grid */}
                        <div className="px-5 py-4">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                                <Layers3 className="w-3.5 h-3.5" />Modul Akses
                            </div>
                            <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {modules.map((module) => {
                                    const checked = !!tenant.enabled_modules?.[module.code] || module.is_core;
                                    return (
                                        <label key={module.code} className={`flex items-center justify-between rounded-lg border px-3 py-2 cursor-pointer text-[12px] transition ${checked ? 'border-[#5B33CC] bg-violet-50 shadow-[inset_0_0_0_1px_rgba(91,51,204,0.08)]' : 'border-gray-200 bg-slate-50 hover:border-gray-300'}`}>
                                            <div>
                                                <span className={`font-bold ${checked ? 'text-[#4722B3]' : 'text-gray-600'}`}>{module.name}</span>
                                                {module.is_core && <span className="ml-1 text-[9px] font-bold text-gray-400">(core)</span>}
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                disabled={module.is_core}
                                                onChange={(e) => handleToggle(tenant, module.code, e.target.checked)}
                                                className="rounded border-gray-300 text-[#5B33CC] focus:ring-[#5B33CC] disabled:opacity-50"
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-12 text-center">
                        <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="font-black text-[#4722B3]">Tidak ada tenant ditemukan</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
