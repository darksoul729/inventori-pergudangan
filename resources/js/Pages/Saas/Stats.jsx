import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import React from 'react';
import { BarChart3, Building2, Users2, Activity, Wallet } from 'lucide-react';

export default function Stats({ stats, recentPayments = [] }) {
    return (
        <DashboardLayout headerTitle="Admin Sistem">
            <Head title="Statistik Platform" />
            <div className="w-full pt-3 pb-10 space-y-5">
                <div>
                    <h1 className="text-[24px] font-black text-[#4722B3] flex items-center gap-2"><BarChart3 className="w-6 h-6" />Statistik Platform</h1>
                    <p className="text-[13px] font-semibold text-gray-500 mt-1">Overview performa dan pendapatan platform Petayu.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-5">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-semibold">Total Tenant</div>
                            <Building2 className="w-4 h-4 text-[#4722B3]" />
                        </div>
                        <div className="text-3xl font-black text-[#4722B3] mt-2">{stats.total_tenants}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-5">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-semibold">Langganan Aktif</div>
                            <Activity className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-3xl font-black text-emerald-600 mt-2">{stats.active_subscriptions}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-5">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-semibold">Masa Trial</div>
                            <Users2 className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="text-3xl font-black text-amber-600 mt-2">{stats.trial_subscriptions}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-5">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-semibold">Total Pendapatan</div>
                            <Wallet className="w-4 h-4 text-slate-700" />
                        </div>
                        <div className="text-2xl font-black text-slate-800 mt-2">Rp {Number(stats.total_revenue || 0).toLocaleString('id-ID')}</div>
                    </div>
                </div>

                {/* Recent Payments */}
                <div className="bg-white rounded-xl border border-[#E5EAF3] p-5">
                    <h2 className="text-[16px] font-black text-slate-800 mb-4">Pembayaran Terakhir</h2>
                    {recentPayments.length > 0 ? (
                        <div className="space-y-2">
                            {recentPayments.map((p, i) => (
                                <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                                    <span className="text-[12px] font-mono font-bold text-gray-500">{p.order_id}</span>
                                    <span className="text-[13px] font-black text-slate-800">Rp {Number(p.amount || 0).toLocaleString('id-ID')}</span>
                                    <span className="text-[11px] text-gray-400">{new Date(p.created_at).toLocaleDateString('id-ID')}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[13px] text-gray-400 font-semibold">Belum ada pembayaran.</p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
