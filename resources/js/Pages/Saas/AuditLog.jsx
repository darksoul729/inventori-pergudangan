import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import React from 'react';
import { FileText } from 'lucide-react';

const eventLabels = {
    tenant_modules_updated: 'Modul Diperbarui',
    subscription_status_updated: 'Status Langganan Diubah',
    user_global_updated: 'User Global Diperbarui',
};

export default function AuditLog({ logs }) {
    const items = logs?.data || [];
    const pagination = logs?.data ? logs : null;

    return (
        <DashboardLayout headerTitle="Admin Sistem">
            <Head title="Audit Log" />
            <div className="w-full pt-3 pb-10 space-y-5">
                <div>
                    <h1 className="text-[24px] font-black text-[#4722B3] flex items-center gap-2"><FileText className="w-6 h-6" />Audit Log</h1>
                    <p className="text-[13px] font-semibold text-gray-500 mt-1">Riwayat semua perubahan yang dilakukan pada sistem.</p>
                </div>

                <div className="bg-white rounded-xl border border-[#E5EAF3] overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            <tr>
                                <th className="px-4 py-3">Waktu</th>
                                <th className="px-4 py-3">Event</th>
                                <th className="px-4 py-3">Tenant</th>
                                <th className="px-4 py-3">Aktor</th>
                                <th className="px-4 py-3">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 text-[12px] text-gray-500 whitespace-nowrap">{log.created_at}</td>
                                    <td className="px-4 py-3"><span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{eventLabels[log.event_type] || log.event_type}</span></td>
                                    <td className="px-4 py-3 text-[13px] font-bold text-slate-700">{log.tenant_name}</td>
                                    <td className="px-4 py-3 text-[13px] text-gray-600">{log.actor_name}</td>
                                    <td className="px-4 py-3 text-[11px] font-mono text-gray-400 max-w-[200px] truncate">{JSON.stringify(log.payload)}</td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 font-semibold">Belum ada log.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500 font-semibold">{pagination.from}–{pagination.to} dari {pagination.total}</div>
                        <div className="flex gap-1">
                            {pagination.links.map((link, i) => (
                                <button key={i} disabled={!link.url || link.active} onClick={() => link.url && router.get(link.url, {}, { preserveState: true })} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${link.active ? 'bg-[#5B33CC] text-white border-[#5B33CC]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#5B33CC] disabled:opacity-40'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
