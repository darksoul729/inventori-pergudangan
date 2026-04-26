import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CheckCircle2, MailOpen } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { getNotificationMeta, typeStyle } from './notificationConfig';

export default function NotificationsShow() {
    const { notifications = [], notificationId } = usePage().props;
    const notification = useMemo(
        () => notifications.find((item) => item.id === notificationId),
        [notificationId, notifications],
    );
    const [readIds, setReadIds] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('read_notifications') || '[]');
        } catch {
            return [];
        }
    });

    const markAsRead = (id) => {
        const next = Array.from(new Set([...readIds, id]));
        setReadIds(next);
        localStorage.setItem('read_notifications', JSON.stringify(next));
    };

    if (!notification) {
        return (
            <DashboardLayout headerTitle="Detail Notifikasi" hideSearch={true} contentClassName="w-full max-w-none">
                <Head title="Detail Notifikasi" />
                <div className="w-full px-5 py-8 md:px-8">
                    <div className="rounded-xl border border-gray-200 bg-white px-8 py-20 text-center shadow-sm">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[8px] bg-gray-50 text-gray-400">
                            <MailOpen className="h-8 w-8" />
                        </div>
                        <h1 className="text-[24px] font-black text-gray-900">Notifikasi Tidak Ditemukan</h1>
                        <p className="mt-3 text-[14px] font-semibold text-gray-500">
                            Notifikasi ini mungkin sudah tidak aktif atau datanya berubah.
                        </p>
                        <Link
                            href="/notifications"
                            className="mt-7 inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#28106F] px-5 py-3 text-[12px] font-black uppercase tracking-wider text-white transition-all hover:bg-[#28239d]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Inbox
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const meta = getNotificationMeta(notification);
    const style = typeStyle[notification.type] || typeStyle.info;
    const Icon = meta.icon;
    const isRead = readIds.includes(notification.id);

    return (
        <DashboardLayout headerTitle="Detail Notifikasi" hideSearch={true} contentClassName="w-full max-w-none">
            <Head title={notification.title} />

            <div className="w-full px-5 pb-10 pt-1 md:px-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        href="/notifications"
                        className="inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-wider text-gray-500 transition-colors hover:text-[#28106F]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Inbox
                    </Link>

                    {!isRead && (
                        <button
                            type="button"
                            onClick={() => markAsRead(notification.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-gray-200 bg-white px-4 py-3 text-[11px] font-black uppercase tracking-wider text-gray-700 shadow-sm transition-all hover:border-indigo-100 hover:text-[#28106F]"
                        >
                            <MailOpen className="h-4 w-4" />
                            Tandai Dibaca
                        </button>
                    )}
                </div>

                <article className="min-h-[calc(100vh-260px)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <header className="border-b border-gray-100 px-7 py-7">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                            <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[8px] ${style.icon}`}>
                                <Icon className="h-7 w-7" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${style.badge}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                                        {style.label}
                                    </span>
                                    <span className="rounded-full bg-gray-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-gray-400">
                                        {meta.label}
                                    </span>
                                    {!isRead && (
                                        <span className="rounded-full bg-[#f4f3ff] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#28106F]">
                                            Baru
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-[30px] font-black tracking-tight text-gray-950">{notification.title}</h1>
                                <p className="mt-4 text-[15px] font-bold leading-8 text-gray-600">{notification.message}</p>
                            </div>
                        </div>
                    </header>

                    <div className="grid gap-4 bg-[#fbfcff] p-7">
                        <section className="rounded-[8px] border border-gray-200 bg-white p-6 shadow-sm">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Detail Tindakan</p>
                            <p className="mt-3 text-[14px] font-semibold leading-7 text-gray-600">{meta.detail}</p>
                        </section>

                        <section className="rounded-[8px] border border-gray-200 bg-white p-6 shadow-sm">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Rekomendasi</p>
                            <p className="mt-3 text-[14px] font-semibold leading-7 text-gray-600">{meta.recommendation}</p>
                        </section>

                        <section className="flex flex-col gap-3 rounded-[8px] border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-[13px] font-black text-gray-900">Buka modul terkait</p>
                                <p className="mt-1 text-[12px] font-semibold text-gray-500">Aksi ini akan menandai notifikasi sebagai dibaca.</p>
                            </div>
                            <Link
                                href={notification.link}
                                onClick={() => markAsRead(notification.id)}
                                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#28106F] px-5 py-3 text-[12px] font-black uppercase tracking-wider text-white transition-all hover:bg-[#28239d]"
                            >
                                {meta.action}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </section>
                    </div>
                </article>

                <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-[13px] font-bold leading-6 text-emerald-700">
                    <CheckCircle2 className="mr-2 inline h-4 w-4" />
                    Status sistem saat ini tetap operational selama tidak ada notifikasi kritis baru.
                </div>
            </div>
        </DashboardLayout>
    );
}
