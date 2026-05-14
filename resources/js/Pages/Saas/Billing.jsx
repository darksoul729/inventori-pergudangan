import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import React from 'react';
import FloatingNotice from '@/Components/FloatingNotice';
import { CreditCard, ShieldCheck, ReceiptText, Sparkles, Building2, Tags, Ruler, Users2 } from 'lucide-react';

const topMenuBase = 'group flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[12px] font-bold transition';
const topMenuIdle = 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900';
const topMenuActive = 'border-violet-200 bg-violet-50 text-[#4B2BB7] shadow-[0_6px_16px_rgba(91,51,204,0.08)]';

export default function Billing({ subscription, payments = [], plans = [], midtrans, subscription_center = null }) {
    const { props } = usePage();
    const flash = props?.flash || {};
    const [lockedInfo, setLockedInfo] = React.useState(null);
    const [loadingPlanCode, setLoadingPlanCode] = React.useState(null);
    const [localError, setLocalError] = React.useState('');
    const [floatingNotices, setFloatingNotices] = React.useState([]);
    const [nowTick, setNowTick] = React.useState(Date.now());

    React.useEffect(() => {
        const id = window.setInterval(() => setNowTick(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);

    // Auto-redirect to payment gateway if coming from verify-email flow
    React.useEffect(() => {
        if (flash?.midtrans_redirect_url) {
            window.location.href = flash.midtrans_redirect_url;
        }
    }, [flash?.midtrans_redirect_url]);

    // Polling otomatis jika ada pembayaran pending
    React.useEffect(() => {
        const hasPending = payments.some(p => p.status === 'pending');
        if (!hasPending) return;

        // Cek status setiap 5 detik jika ada yang pending
        const interval = setInterval(() => {
            router.reload({
                only: ['payments', 'subscription', 'subscription_center'],
                preserveScroll: true,
                onSuccess: (page) => {
                    const stillPending = page.props.payments.some(p => p.status === 'pending');
                    // Jika sudah tidak pending lagi (sudah terbayar atau expired)
                    if (!stillPending) {
                        clearInterval(interval);
                        // Lakukan kunjungan ulang penuh agar seluruh status langganan sinkron 100%
                        router.visit(route('settings.billing'), { 
                            preserveScroll: true,
                            replace: true 
                        });
                    }
                }
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [payments]);

    const formatCountdown = (isoValue) => {
        if (!isoValue) return null;
        const endMs = new Date(isoValue).getTime();
        if (Number.isNaN(endMs)) return null;
        const diff = endMs - nowTick;
        if (diff <= 0) return 'Kedaluwarsa';
        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours}j ${minutes}m ${seconds}dtk`;
    };

    const subscriptionStatusLabel = (value) => {
        const normalized = String(value || '').toLowerCase();
        if (normalized === 'active') return 'Aktif';
        if (normalized === 'trialing') return 'Masa Coba';
        if (normalized === 'past_due') return 'Perlu Pembayaran';
        if (normalized === 'canceled') return 'Nonaktif';
        return String(value || '-');
    };

    const statusView = (value) => {
        const normalized = String(value || '').toLowerCase();
        if (normalized === 'paid') return { label: 'Terbayar', cls: 'bg-emerald-100 text-emerald-700' };
        if (normalized === 'expired') return { label: 'Kedaluwarsa', cls: 'bg-slate-200 text-slate-700' };
        if (normalized === 'failed' || normalized === 'canceled') return { label: 'Gagal / Dibatalkan', cls: 'bg-rose-100 text-rose-700' };
        return { label: 'Menunggu Bayar', cls: 'bg-amber-100 text-amber-700' };
    };

    React.useEffect(() => {
        if (typeof window === 'undefined') return;
        const query = new URLSearchParams(window.location.search);
        if (query.get('source') === 'locked') {
            const feature = query.get('feature') || query.get('module') || 'fitur ini';
            setLockedInfo(`Fitur ${feature} terkunci di paket saat ini. Upgrade paket untuk mengaktifkan.`);
        }
    }, []);

    React.useEffect(() => {
        const notices = [];
        if (localError) notices.push({ key: `err-${Date.now()}`, type: 'error', text: localError });
        if (lockedInfo) notices.push({ key: `warn-${Date.now()}`, type: 'warning', text: lockedInfo });
        if (flash?.error) notices.push({ key: `flash-${Date.now()}`, type: 'error', text: flash.error });
        if (notices.length === 0) return;
        setFloatingNotices((prev) => [...notices, ...prev].slice(0, 3));
    }, [localError, lockedInfo, flash?.error]);

    React.useEffect(() => {
        const clientKey = midtrans?.client_key;
        if (!clientKey || typeof window === 'undefined' || window.snap) return;

        const script = document.createElement('script');
        script.src = `${midtrans?.is_sandbox ? 'https://app.sandbox.midtrans.com/snap/snap.js' : 'https://app.midtrans.com/snap/snap.js'}`;
        script.setAttribute('data-client-key', clientKey);
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if (script.parentNode) script.parentNode.removeChild(script);
        };
    }, [midtrans?.client_key, midtrans?.is_sandbox]);

    const openSnap = async (planCode) => {
        setLocalError('');
        setLoadingPlanCode(planCode || 'current');
        try {
            const { data } = await axios.post(route('settings.billing.checkout'), { plan_code: planCode || subscription?.plan_code || null });
            if (!data?.snap_token && !data?.redirect_url) {
                setLocalError('Token pembayaran tidak tersedia. Coba lagi.');
                return;
            }

            if (window.snap && data.snap_token) {
                window.snap.pay(data.snap_token, {
                    onSuccess: () => router.get(route('settings.billing')),
                    onPending: () => router.get(route('settings.billing')),
                    onError: () => router.get(route('settings.billing')),
                    onClose: () => router.get(route('settings.billing')),
                });
                return;
            }

            if (data.redirect_url) {
                window.location.href = data.redirect_url;
                return;
            }

            setLocalError('Snap.js belum siap. Refresh halaman lalu coba lagi.');
        } catch (error) {
            setLocalError(error?.response?.data?.message || 'Gagal membuat transaksi pembayaran.');
        } finally {
            setLoadingPlanCode(null);
        }
    };

    const cancelPayment = (paymentId) => {
        if (confirm('Apakah Anda yakin ingin membatalkan pembayaran ini?')) {
            router.post(route('settings.billing.payments.cancel', paymentId));
        }
    };

    return (
        <DashboardLayout headerTitle="Pengaturan" hideMainScrollbar>
            <Head title="Paket & Pembayaran" />
            
            <div className="w-full pt-3 pb-10">
                <FloatingNotice
                    notices={floatingNotices}
                    onClose={(key) => setFloatingNotices((prev) => prev.filter((n) => n.key !== key))}
                />

                {/* Page Header */}
                <div className="mb-4">
                    <h1 className="text-[24px] font-black text-[#4722B3]">Paket & Pembayaran</h1>
                    <p className="text-[13px] font-semibold text-gray-500 mt-1">Kelola paket langganan dan pantau riwayat pembayaran.</p>
                </div>

                {/* Tabs - matching Settings page */}
                <div className="flex items-center gap-1 mb-5 border-b border-[#E5EAF3] pb-3 overflow-x-auto">
                    <Link href={route('settings', { active: 'warehouse' })} className={`${topMenuBase} ${topMenuIdle}`}>
                        <Building2 className="h-4 w-4" />Gudang
                    </Link>
                    <Link href={route('settings', { active: 'categories' })} className={`${topMenuBase} ${topMenuIdle}`}>
                        <Tags className="h-4 w-4" />Kategori
                    </Link>
                    <Link href={route('settings', { active: 'units' })} className={`${topMenuBase} ${topMenuIdle}`}>
                        <Ruler className="h-4 w-4" />Satuan
                    </Link>
                    <Link href={route('settings', { active: 'staff' })} className={`${topMenuBase} ${topMenuIdle}`}>
                        <Users2 className="h-4 w-4" />Akun Tim
                    </Link>
                    <div className={`${topMenuBase} ${topMenuActive}`}>
                        <CreditCard className="h-4 w-4" />Billing
                    </div>
                </div>

                <div className="space-y-5">

                    {subscription_center && (
                        <section className="rounded-2xl border border-[#E5EAF3] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Pusat Langganan</p>
                            <div className="mt-3 grid gap-3 md:grid-cols-4">
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Status</p>
                                    <p className="mt-1 text-sm font-black text-slate-900">{subscription_center.status_label}</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Paket Aktif</p>
                                    <p className="mt-1 text-sm font-black text-slate-900">{subscription_center.active_plan}</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Jatuh Tempo</p>
                                    <p className="mt-1 text-sm font-black text-slate-900">
                                        {(!subscription_center.next_due_date || subscription_center.next_due_date === '-') 
                                            ? (subscription?.status === 'trialing' ? 'Mengikuti Masa Coba' : 'Belum Ditentukan') 
                                            : subscription_center.next_due_date}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Tagihan Terakhir</p>
                                    <p className="mt-1 text-sm font-black text-slate-900">
                                        {(!subscription_center.last_payment_status || subscription_center.last_payment_status === '-') 
                                            ? 'Belum Ada Tagihan' 
                                            : subscription_center.last_payment_status}
                                    </p>
                                </div>
                            </div>
                            {subscription_center.pending_order_id && (
                                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                                    Pending order: {subscription_center.pending_order_id}
                                    {subscription_center.pending_expires_at_iso ? ` • Sisa: ${formatCountdown(subscription_center.pending_expires_at_iso)}` : ''}
                                </p>
                            )}
                        </section>
                    )}

                    <section className="rounded-2xl border border-[#E5EAF3] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-[20px] font-black text-[#4722B3] flex items-center gap-2"><CreditCard className="h-5 w-5" />Status Langganan</h2>
                                {subscription && (
                                    <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                                        subscription.status === 'active' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                        subscription.status === 'trialing' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                                        'bg-rose-50 border-rose-200 text-rose-700'
                                    }`}>
                                        {subscriptionStatusLabel(subscription.status)}
                                    </span>
                                )}
                            </div>
                            
                            {subscription ? (
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 rounded-xl bg-[#f8f9fb]">
                                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Paket Aktif</div>
                                        <div className="text-[15px] font-black text-[#4722B3] mt-1">{subscription.plan}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-[#f8f9fb]">
                                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Mulai Aktif</div>
                                        <div className="text-[15px] font-black text-gray-800 mt-1">{subscription.starts_at || '-'}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-[#f8f9fb]">
                                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Masa Aktif Sampai</div>
                                        <div className="text-[15px] font-black text-gray-800 mt-1">{subscription.ends_at || 'Belum ditentukan'}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-[#f8f9fb]">
                                        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Sisa Trial</div>
                                        <div className="text-[15px] font-black text-gray-800 mt-1">{subscription.trial_ends_at || '-'}</div>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-3 text-[13px] font-semibold text-gray-500">Belum ada subscription aktif.</p>
                            )}
                            <div className="mt-6 flex flex-wrap gap-3">
                                <button
                                    onClick={() => openSnap(subscription?.plan_code || null)}
                                    disabled={loadingPlanCode !== null}
                                    className="rounded-xl bg-[#5B33CC] hover:bg-indigo-700 transition-colors px-6 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-indigo-200"
                                >
                                    {loadingPlanCode ? 'Memproses...' : 'Bayar / Perpanjang Paket'}
                                </button>
                                {payments.some(p => p.status === 'pending') && (
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="text-[11px] font-bold text-amber-600 animate-pulse">Mengecek status pembayaran otomatis...</span>
                                    </div>
                                )}
                            </div>
                    </section>

                    <section className="rounded-2xl border border-[#E5EAF3] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                            <h2 className="text-[20px] font-black text-[#4722B3] mb-4 flex items-center gap-2"><ReceiptText className="h-5 w-5" />Riwayat Pembayaran</h2>
                            <div className="overflow-hidden rounded-xl border border-gray-100">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#f8f9fb] text-[11px] uppercase text-gray-500 font-extrabold tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3">Order ID</th>
                                            <th className="px-4 py-3">Jumlah</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Tanggal</th>
                                            <th className="px-4 py-3">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {payments.map((p) => (
                                            <tr key={p.order_id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-3 font-mono text-xs text-gray-600 font-medium">{p.order_id}</td>
                                                <td className="px-4 py-3 font-bold text-gray-800">Rp {Number(p.amount || 0).toLocaleString('id-ID')}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${statusView(p.status).cls}`}>
                                                        {statusView(p.status).label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 text-[13px]">{p.created_at}</td>
                                                <td className="px-4 py-3">
                                                    {p.can_retry ? (
                                                        <div className="flex items-center space-x-3">
                                                            <a href={p.payment_url} className="text-[#5B33CC] hover:text-indigo-800 font-bold text-[13px]" target="_blank" rel="noreferrer">Lanjutkan Bayar</a>
                                                            <button onClick={() => cancelPayment(p.id)} className="text-red-500 hover:text-red-700 font-bold text-[13px]">Batalkan</button>
                                                            {p.expires_at_iso && (
                                                                <span className="text-[11px] font-semibold text-amber-700">
                                                                    Sisa: {formatCountdown(p.expires_at_iso)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (p.status === 'pending' && p.is_expired) ? (
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[12px] font-semibold text-amber-700">
                                                                Link kedaluwarsa{p.expires_at ? ` (${p.expires_at})` : ''}
                                                            </span>
                                                            <button
                                                                onClick={() => openSnap(subscription?.plan_code || null)}
                                                                disabled={loadingPlanCode !== null}
                                                                className="text-[#5B33CC] hover:text-indigo-800 font-bold text-[13px]"
                                                            >
                                                                Buat Ulang Link
                                                            </button>
                                                        </div>
                                                    ) : p.invoice_url ? (
                                                        <a href={p.invoice_url} className="text-[#5B33CC] hover:text-indigo-800 font-bold text-[13px]">Unduh Invoice</a>
                                                    ) : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                        {payments.length === 0 && (
                                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500 font-medium">Belum ada data pembayaran.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                    </section>

                    <section className="rounded-xl border border-[#E5EAF3] bg-white p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-[18px] font-black text-[#4722B3]">Pilih Paket</h2>
                                    <p className="mt-0.5 text-[12px] text-gray-500 font-semibold">Upgrade kapan saja sesuai kebutuhan operasional.</p>
                                </div>
                            </div>
                            
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {plans.map((plan) => (
                                    <div key={plan.code} className={`relative rounded-xl border p-5 flex flex-col ${plan.is_current ? 'border-[#5B33CC] bg-violet-50/50 ring-1 ring-[#5B33CC]' : 'border-[#E5EAF3] hover:border-indigo-200'}`}>
                                        {plan.recommended && (
                                            <span className="absolute -top-2.5 right-4 rounded-full bg-[#5B33CC] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">Populer</span>
                                        )}
                                        
                                        <div>
                                            <h3 className="text-[15px] font-black text-slate-800">{plan.name}</h3>
                                            <p className="text-[11px] font-semibold text-gray-400 mt-0.5">{plan.tagline || '-'}</p>
                                        </div>
                                        
                                        <div className="mt-4 mb-4">
                                            <span className="text-[22px] font-black text-[#4722B3]">
                                                {plan.price_monthly > 0 ? `Rp ${Number(plan.price_monthly).toLocaleString('id-ID')}` : 'Gratis'}
                                            </span>
                                            <span className="text-[11px] font-semibold text-gray-400"> / bulan</span>
                                        </div>

                                        <div className="space-y-2 text-[12px] border-t border-gray-100 pt-3 mb-4">
                                            <div className="flex justify-between"><span className="text-gray-500">Gudang</span><span className="font-bold text-slate-800">{plan.limits?.warehouses}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Akun</span><span className="font-bold text-slate-800">{plan.limits?.users >= 999 ? 'Tidak terbatas' : plan.limits?.users}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Modul</span><span className="font-bold text-slate-800">{plan.modules_count}</span></div>
                                        </div>

                                        <ul className="space-y-1.5 text-[11px] text-gray-600 mb-5 flex-1">
                                            {plan.benefits.slice(0, 5).map((benefit) => (
                                                <li key={`${plan.code}-${benefit}`} className="flex items-start gap-1.5">
                                                    <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                                    <span>{benefit}</span>
                                                </li>
                                            ))}
                                            {plan.benefits.length > 5 && (
                                                <li className="text-[10px] font-bold text-gray-400 pl-5">+{plan.benefits.length - 5} lainnya</li>
                                            )}
                                        </ul>
                                        
                                        <div className="mt-auto">
                                            {plan.is_current ? (
                                                <div className="w-full text-center rounded-lg bg-[#4722B3] px-3 py-2.5 text-[12px] font-bold text-white">Paket Aktif</div>
                                            ) : plan.action === 'downgrade' ? (
                                                <div className="w-full text-center rounded-lg bg-gray-100 px-3 py-2.5 text-[12px] font-bold text-gray-400">Tidak tersedia</div>
                                            ) : (
                                                <button
                                                    onClick={() => openSnap(plan.code)}
                                                    disabled={loadingPlanCode !== null}
                                                    className={`w-full rounded-lg px-3 py-2.5 text-[12px] font-bold transition ${plan.recommended ? 'bg-[#5B33CC] text-white hover:bg-indigo-700' : 'border border-[#5B33CC] text-[#5B33CC] hover:bg-indigo-50'}`}
                                                >
                                                    {loadingPlanCode === plan.code ? 'Memproses...' : plan.action === 'upgrade' ? 'Upgrade' : 'Pilih Paket'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}
