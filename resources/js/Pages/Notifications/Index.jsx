import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Inbox, MailOpen, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { filters, getNotificationMeta, typeStyle } from './notificationConfig';

export default function NotificationsIndex() {
    const { notifications = [] } = usePage().props;
    const [filter, setFilter] = useState('all');
    const [query, setQuery] = useState('');
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

    return (
        <DashboardLayout headerTitle="Notifikasi Sistem" hideSearch={true} contentClassName="max-w-[1180px] mx-auto">
            <Head title="Notifikasi Sistem" />

            <div className="pb-12">
                <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#3632c0]">Realtime Alert</p>
                        <h1 className="mt-3 text-[32px] font-black tracking-tight text-[#111827]">Kotak Masuk Notifikasi</h1>
                        <p className="mt-3 max-w-3xl text-[14px] font-semibold leading-7 text-gray-500">
                            Pilih notifikasi untuk membuka halaman detailnya. Daftar ini hanya menampilkan ringkasan operasional.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={markAllAsRead}
                        className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-gray-200 bg-white px-5 py-3 text-[12px] font-black uppercase tracking-wider text-gray-700 shadow-sm transition-all hover:border-indigo-100 hover:text-[#3632c0]"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Tandai Semua Dibaca
                    </button>
                </section>

                <section className="overflow-hidden rounded-[8px] border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 p-5">
                        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[#f4f3ff] text-[#3632c0]">
                                    <Inbox className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-[17px] font-black text-gray-900">Inbox Operasional</h2>
                                    <p className="text-[12px] font-bold text-gray-400">
                                        {notifications.length} total, {unreadCount} belum dibaca
                                    </p>
                                </div>
                            </div>

                            <div className="relative w-full lg:max-w-[420px]">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Cari notifikasi..."
                                    className="h-11 w-full rounded-[8px] border border-gray-200 bg-gray-50 pl-10 pr-3 text-[13px] font-bold text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-indigo-200 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {filters.map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => setFilter(item.key)}
                                    className={`h-10 rounded-[8px] text-[11px] font-black transition-all ${filter === item.key
                                        ? 'bg-[#3632c0] text-white shadow-sm'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
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
                                        className={`group flex border-l-4 border-b border-gray-100 px-5 py-5 text-left transition-all last:border-b-0 ${style.row} ${isRead ? 'bg-white hover:bg-gray-50' : 'bg-indigo-50/40 hover:bg-indigo-50/70'}`}
                                    >
                                        <div className={`mr-4 mt-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[8px] ${style.icon}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                                {!isRead && <span className={`h-2 w-2 flex-shrink-0 rounded-full ${style.dot}`} />}
                                                <h3 className={`truncate text-[15px] ${isRead ? 'font-bold text-gray-700' : 'font-black text-gray-950'}`}>
                                                    {notification.title}
                                                </h3>
                                            </div>
                                            <p className="line-clamp-2 text-[13px] font-semibold leading-6 text-gray-500">
                                                {notification.message}
                                            </p>
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${style.badge}`}>
                                                    {style.label}
                                                </span>
                                                <span className="rounded-full bg-white/80 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-gray-400 ring-1 ring-gray-100">
                                                    {meta.label}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4 hidden flex-shrink-0 items-center text-gray-300 transition-colors group-hover:text-[#3632c0] sm:flex">
                                            <ArrowRight className="h-5 w-5" />
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="flex min-h-[360px] flex-col items-center justify-center px-8 text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[8px] bg-gray-50 text-gray-400">
                                    <MailOpen className="h-7 w-7" />
                                </div>
                                <h3 className="text-[18px] font-black text-gray-900">Tidak ada notifikasi</h3>
                                <p className="mt-2 text-[13px] font-semibold leading-6 text-gray-500">
                                    Filter atau kata pencarian tidak menemukan notifikasi yang cocok.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
