import { Head, Link } from '@inertiajs/react';
import React from 'react';

export default function RegisterSuccess({ successData }) {
    const mode = successData?.mode || 'trial';
    const payment = successData?.payment || {};
    const isPaidMode = mode === 'paid';
    const [nowTick, setNowTick] = React.useState(Date.now());

    React.useEffect(() => {
        const id = window.setInterval(() => setNowTick(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);

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

    const paymentCountdown = formatCountdown(payment?.expires_at_iso);

    let ctaHref = route('dashboard');
    let ctaLabel = 'Masuk Dashboard';
    if (isPaidMode) {
        if (payment?.payment_url) {
            ctaHref = payment.payment_url;
            ctaLabel = 'Lanjutkan Pembayaran';
        } else {
            ctaHref = route('settings.billing');
            ctaLabel = 'Buka Paket & Pembayaran';
        }
    }

    return (
        <div className="h-screen overflow-hidden bg-[#f8f9fa] flex items-center justify-center p-4 font-sans">
            <Head title="Pendaftaran Berhasil" />

            <div className="bg-white max-w-lg w-full rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 relative overflow-hidden">
                {/* Decorative */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full blur-2xl opacity-60"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-50 rounded-full blur-2xl opacity-60"></div>

                <div className="relative z-10">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <img src="/images/logo_petayu.png" alt="Petayu" className="h-8 w-8 object-contain" />
                        <span className="text-base font-bold text-slate-800 tracking-tight">Petayu<span className="text-violet-700">WMS</span></span>
                    </div>

                    {/* Success Icon */}
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm shadow-emerald-100">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pendaftaran Berhasil!</h1>
                        <p className="mt-2 text-sm text-slate-500">Akun Anda sudah aktif. Lanjutkan ke langkah berikutnya.</p>
                    </div>

                    {/* Info Card */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Perusahaan</p>
                                    <p className="text-sm font-semibold text-slate-800 truncate">{successData?.company_name || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Email</p>
                                    <p className="text-sm font-semibold text-slate-800 truncate">{successData?.email || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isPaidMode ? 'bg-violet-100 text-violet-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Mode</p>
                                    <p className={`text-sm font-semibold ${isPaidMode ? 'text-violet-700' : 'text-emerald-700'}`}>
                                        {isPaidMode ? 'Paket Berbayar' : 'Trial'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Paket</p>
                                    <p className="text-sm font-semibold text-slate-800">{successData?.plan_name || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment countdown */}
                    {isPaidMode && payment?.expires_at && (
                        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                            <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-sm font-medium text-amber-800">
                                Link pembayaran berlaku sampai {payment.expires_at}
                                {paymentCountdown ? ` • Sisa: ${paymentCountdown}` : ''}
                            </p>
                        </div>
                    )}

                    {/* CTA Buttons */}
                    <div className="flex flex-col gap-3">
                        <a
                            href={ctaHref}
                            className={`w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all ${
                                isPaidMode
                                    ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/30'
                                    : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                            }`}
                        >
                            {ctaLabel}
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </a>
                        {isPaidMode && (
                            <Link
                                href={route('dashboard')}
                                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Ke Dashboard Dulu
                            </Link>
                        )}
                    </div>

                    {/* Footer */}
                    <p className="mt-6 text-center text-xs text-slate-400">
                        © 2026 Petayu. Semua hak dilindungi.
                    </p>
                </div>
            </div>
        </div>
    );
}
