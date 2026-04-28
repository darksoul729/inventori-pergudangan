import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCheck, MailOpen, Search, SlidersHorizontal } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { filters, getNotificationMeta, typeStyle } from './notificationConfig';

export default function NotificationsIndex() {
    const { notifications = [] } = usePage().props;
    const [filter, setFilter] = useState('all');
    const [query, setQuery] = useState('');
    const listSectionRef = useRef(null);
    const [readIds, setReadIds] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('read_notifications') || '[]');
        } catch {
            return [];
        }
    });

    const unreadCount = useMemo(
        () => notifications.filter((notification) => !readIds.includes(notification.id)).length,
        [notifications, readIds],
    );

    const priorityCount = useMemo(
        () => notifications.filter((item) => item.type === 'warning' || item.type === 'error').length,
        [notifications],
    );

    const visibleNotifications = useMemo(() => {
        return notifications.filter((notification) => {
            const isUnread = !readIds.includes(notification.id);
            const meta = getNotificationMeta(notification);
            const keyword = `${notification.title} ${notification.message} ${meta.label}`.toLowerCase();
            const matchesQuery = keyword.includes(query.trim().toLowerCase());

            if (!matchesQuery) return false;
            if (filter === 'unread') return isUnread;
            if (filter === 'priority') return notification.type === 'warning' || notification.type === 'error';

            return true;
        });
    }, [filter, notifications, query, readIds]);

    const markAsRead = (id) => {
        const next = Array.from(new Set([...readIds, id]));
        setReadIds(next);
        localStorage.setItem('read_notifications', JSON.stringify(next));
    };

    const markAllAsRead = () => {
        const next = notifications.map((notification) => notification.id);
        setReadIds(next);
        localStorage.setItem('read_notifications', JSON.stringify(next));
    };

    useEffect(() => {
        if (!query.trim()) return;
        if (visibleNotifications.length > 0) {
            listSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [query, visibleNotifications.length]);

    return (
        <DashboardLayout
            headerTitle="Notifikasi Sistem"
            contentClassName="w-full max-w-none"
            searchValue={query}
            onSearch={setQuery}
        >
            <Head title="Notifikasi Sistem" />

            <div className="w-full px-5 pb-10 pt-1 md:px-8">
                <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Pusat Notifikasi</p>
                            <h1 className="mt-2 text-[30px] font-black tracking-tight text-slate-900">Inbox Notifikasi</h1>
                            <p className="mt-2 max-w-3xl text-[14px] font-semibold text-slate-500">
                                Pantau alert operasional harian, tandai baca, dan buka modul terkait dari satu halaman.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-black uppercase tracking-[0.12em] text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
                        >
                            <CheckCheck className="h-4 w-4" />
                            Tandai Semua
                        </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Total</p>
                            <p className="mt-1 text-[24px] font-black tracking-tight text-slate-900">{notifications.length}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Belum Dibaca</p>
                            <p className="mt-1 text-[24px] font-black tracking-tight text-indigo-700">{unreadCount}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Prioritas</p>
                            <p className="mt-1 text-[24px] font-black tracking-tight text-amber-600">{priorityCount}</p>
                        </div>
                    </div>
                </section>

                <section ref={listSectionRef} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-4 md:px-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                                <SlidersHorizontal className="h-4 w-4" />
                                Filter & Pencarian
                            </div>
                            <div className="relative w-full lg:max-w-[440px]">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Cari judul, pesan, atau kategori..."
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-[13px] font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-200 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                                />
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2 md:max-w-[460px]">
                            {filters.map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => setFilter(item.key)}
                                    className={`h-10 rounded-lg border text-[11px] font-black uppercase tracking-[0.12em] transition ${filter === item.key
                                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {visibleNotifications.length > 0 ? (
                            visibleNotifications.map((notification) => {
                                const meta = getNotificationMeta(notification);
                                const style = typeStyle[notification.type] || typeStyle.info;
                                const Icon = meta.icon;
                                const isRead = readIds.includes(notification.id);

                                return (
                                    <Link
                                        key={notification.id}
                                        href={`/notifications/${notification.id}`}
                                        onClick={() => markAsRead(notification.id)}
                                        className={`group flex items-start gap-4 px-5 py-5 transition md:px-6 ${isRead ? 'bg-white hover:bg-slate-50' : 'bg-indigo-50/30 hover:bg-indigo-50/50'}`}
                                    >
                                        <div className={`mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${style.icon}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                {!isRead && <span className={`h-2 w-2 rounded-full ${style.dot}`} />}
                                                <h3 className={`truncate text-[15px] ${isRead ? 'font-bold text-slate-700' : 'font-black text-slate-900'}`}>
                                                    {notification.title}
                                                </h3>
                                                <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] ${style.badge}`}>
                                                    {style.label}
                                                </span>
                                                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">
                                                    {meta.label}
                                                </span>
                                            </div>
                                            <p className="line-clamp-2 text-[13px] font-semibold leading-6 text-slate-500">
                                                {notification.message}
                                            </p>
                                        </div>
                                        <div className="hidden flex-shrink-0 items-center text-slate-300 transition group-hover:text-indigo-600 sm:flex">
                                            <ArrowRight className="h-5 w-5" />
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="flex min-h-[340px] flex-col items-center justify-center px-8 text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                                    <MailOpen className="h-7 w-7" />
                                </div>
                                <h3 className="text-[18px] font-black text-slate-900">Tidak ada notifikasi</h3>
                                <p className="mt-2 text-[13px] font-semibold leading-6 text-slate-500">
                                    Tidak ada data yang cocok dengan filter atau kata pencarian saat ini.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
