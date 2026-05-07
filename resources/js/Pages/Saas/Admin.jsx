import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import React from 'react';

const STATUS_OPTIONS = ['trialing', 'active', 'past_due', 'canceled'];

export default function SaasAdmin({ tenants = [], modules = [] }) {
    const handleToggle = (tenant, moduleCode, checked) => {
        const current = new Set(Object.keys(tenant.enabled_modules || {}));
        if (checked) current.add(moduleCode);
        else current.delete(moduleCode);

        router.put(route('settings.saas.modules.update', tenant.id), {
            modules: Array.from(current),
        }, { preserveScroll: true });
    };

    const handleStatus = (tenant, status) => {
        router.put(route('settings.saas.subscription.update', tenant.id), { status }, { preserveScroll: true });
    };

    return (
        <DashboardLayout headerTitle="SaaS Admin" contentClassName="max-w-[1280px] mx-auto">
            <Head title="SaaS Admin" />
            <div className="space-y-6 py-4">
                {tenants.map((tenant) => (
                    <section key={tenant.id} className="rounded-2xl border border-[#EDE8FC] bg-white p-5">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-black text-[#28106F]">{tenant.name}</h2>
                                <p className="text-xs font-semibold text-gray-500">
                                    {tenant.code} • Plan: {tenant.plan} • Status: {tenant.subscription_status}
                                </p>
                            </div>
                            <select
                                value={tenant.subscription_status}
                                onChange={(e) => handleStatus(tenant, e.target.value)}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold"
                            >
                                {STATUS_OPTIONS.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {modules.map((module) => {
                                const checked = !!tenant.enabled_modules?.[module.code] || module.is_core;
                                return (
                                    <label key={module.code} className="flex items-center justify-between rounded-xl border border-[#EDE8FC] px-3 py-2">
                                        <div>
                                            <div className="text-sm font-bold text-[#28106F]">{module.name}</div>
                                            <div className="text-[11px] font-semibold text-gray-500">{module.code}</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            disabled={module.is_core}
                                            onChange={(e) => handleToggle(tenant, module.code, e.target.checked)}
                                        />
                                    </label>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>
        </DashboardLayout>
    );
}

