import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import React from 'react';

export default function Billing({ subscription, payments = [], plans = [], midtrans }) {
    const { props } = usePage();
    const flash = props?.flash || {};
    const [lockedInfo, setLockedInfo] = React.useState(null);
    const [loadingPlanCode, setLoadingPlanCode] = React.useState(null);
    const [localError, setLocalError] = React.useState('');

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
        if (normalized === 'failed') return { label: 'Gagal', cls: 'bg-rose-100 text-rose-700' };
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

    return (
        <DashboardLayout headerTitle="Billing SaaS" contentClassName="max-w-[1100px] mx-auto">
            <Head title="Billing SaaS" />
            <div className="space-y-6 py-4">
                {flash.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                        {flash.error}
                    </div>
                )}
                {localError && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                        {localError}
                    </div>
                )}
                {lockedInfo && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                        {lockedInfo}
                    </div>
                )}

                <section className="rounded-2xl border border-[#EDE8FC] bg-white p-5">
                    <h2 className="text-lg font-black text-[#28106F]">Status Langganan</h2>
                    {subscription ? (
                        <div className="mt-3 grid gap-2 text-sm font-semibold text-gray-700">
                            <div>Paket: <span className="font-black">{subscription.plan}</span></div>
                            <div>Status: <span className="font-black">{subscriptionStatusLabel(subscription.status)}</span></div>
                            <div>Aktif sejak: <span className="font-black">{subscription.starts_at || '-'}</span></div>
                            <div>Masa aktif sampai: <span className="font-black">{subscription.ends_at || 'Belum ditentukan'}</span></div>
                            <div>Trial berakhir: <span className="font-black">{subscription.trial_ends_at || '-'}</span></div>
                        </div>
                    ) : (
                        <p className="mt-3 text-sm font-semibold text-gray-500">Belum ada subscription aktif.</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            onClick={() => openSnap(subscription?.plan_code || null)}
                            disabled={loadingPlanCode !== null}
                            className="rounded-xl bg-[#28106F] px-4 py-2 text-sm font-black text-white"
                        >
                            {loadingPlanCode ? 'Memproses...' : 'Bayar / Perpanjang Paket'}
                        </button>
                        <button
                            onClick={() => router.get(route('settings.billing'))}
                            className="rounded-xl border border-[#28106F] px-4 py-2 text-sm font-black text-[#28106F]"
                        >
                            Cek Status Sekarang
                        </button>
                    </div>
                </section>

                <section className="rounded-2xl border border-[#EDE8FC] bg-white p-5">
                    <h2 className="text-lg font-black text-[#28106F]">Riwayat Pembayaran</h2>
                    <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#f8f9fb] text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-3 py-2">Order ID</th>
                                    <th className="px-3 py-2">Jumlah</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2">Tanggal</th>
                                    <th className="px-3 py-2">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((p) => (
                                    <tr key={p.order_id} className="border-b border-[#EDE8FC]">
                                        <td className="px-3 py-2 font-mono text-xs">{p.order_id}</td>
                                        <td className="px-3 py-2">Rp {Number(p.amount || 0).toLocaleString('id-ID')}</td>
                                        <td className="px-3 py-2">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black uppercase ${statusView(p.status).cls}`}>
                                                {statusView(p.status).label}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">{p.created_at}</td>
                                        <td className="px-3 py-2">
                                            {p.can_retry ? (
                                                <a href={p.payment_url} className="text-[#28106F] font-bold" target="_blank" rel="noreferrer">Lanjutkan Bayar</a>
                                            ) : p.invoice_url ? (
                                                <a href={p.invoice_url} className="text-[#28106F] font-bold">Unduh Invoice</a>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))}
                                {payments.length === 0 && (
                                    <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">Belum ada data pembayaran.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="rounded-2xl border border-[#EDE8FC] bg-white p-5">
                    <h2 className="text-lg font-black text-[#28106F]">Paket & Benefit</h2>
                    <p className="mt-1 text-sm text-gray-600">Pilih paket sesuai skala bisnis kamu. Catatan: versi saat ini masih 1 gudang aktif (single warehouse).</p>
                    <p className="mt-1 text-xs text-gray-500">Alur sederhana: pilih paket, bayar, lalu klik "Cek Status Sekarang".</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {plans.map((plan) => (
                            <div key={plan.code} className={`rounded-xl border p-4 ${plan.is_current ? 'border-[#28106F] bg-[#f7f4ff]' : 'border-[#EDE8FC] bg-white'}`}>
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="text-base font-black text-[#28106F]">{plan.name}</h3>
                                        <p className="text-xs font-semibold text-gray-500">{plan.tagline || '-'}</p>
                                    </div>
                                    {plan.recommended && (
                                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black uppercase text-emerald-700">Rekomendasi</span>
                                    )}
                                </div>
                                <div className="mt-3 text-sm font-bold text-gray-800">
                                    {plan.price_monthly > 0 ? `Rp ${Number(plan.price_monthly).toLocaleString('id-ID')} / bulan` : 'Gratis (Trial)'}
                                </div>
                                <div className="mt-2 text-xs text-gray-600">
                                    Maks gudang: <span className="font-black">{plan.limits?.warehouses}</span> · Maks user: <span className="font-black">{plan.limits?.users}</span>
                                </div>
                                <div className="mt-2 text-xs text-gray-600">
                                    Modul aktif: <span className="font-black">{plan.modules_count}</span>
                                </div>
                                <ul className="mt-3 space-y-1 text-xs text-gray-700">
                                    {plan.benefits.map((benefit) => (
                                        <li key={`${plan.code}-${benefit}`}>• {benefit}</li>
                                    ))}
                                </ul>
                                <div className="mt-4">
                                    {plan.is_current ? (
                                        <span className="rounded-lg bg-[#28106F] px-3 py-2 text-xs font-black text-white">Paket Saat Ini</span>
                                    ) : plan.action === 'downgrade' ? (
                                        <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">Downgrade: Tunggu masa aktif selesai</span>
                                    ) : (
                                        <button
                                            onClick={() => openSnap(plan.code)}
                                            disabled={loadingPlanCode !== null}
                                            className="rounded-lg border border-[#28106F] px-3 py-2 text-xs font-black text-[#28106F]"
                                        >
                                            {loadingPlanCode === plan.code
                                                ? 'Memproses...'
                                                : plan.action === 'upgrade'
                                                    ? 'Upgrade ke Paket Ini'
                                                    : 'Perpanjang Paket Ini'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
