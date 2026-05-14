import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function ResetPasswordOtp({ status, email = '', resendAvailableInSeconds = 0, otpMeta = {} }) {
    const { data, setData, post, processing, errors } = useForm({
        email,
        code: '',
    });
    const [cooldown, setCooldown] = useState(Number(resendAvailableInSeconds || 0));

    const formatWita = (isoString) => {
        if (!isoString) return '-';
        const date = new Date(isoString);
        if (Number.isNaN(date.getTime())) return '-';

        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Makassar',
        }).format(date) + ' WITA';
    };

    useEffect(() => {
        setCooldown(Number(resendAvailableInSeconds || 0));
    }, [resendAvailableInSeconds]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown((prev) => Math.max(prev - 1, 0)), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const verifyOtp = (e) => {
        e.preventDefault();
        post(route('password.verify-otp'), {
            preserveScroll: true,
        });
    };

    const resendOtp = (e) => {
        e.preventDefault();
        post(route('password.resend-otp'), {
            preserveScroll: true,
        });
    };

    return (
        <div className="min-h-screen petayu-bg-app flex font-sans">
            <Head title="Reset Password OTP" />

            <div className="hidden lg:flex w-[450px] xl:w-[500px] flex-col px-10 py-12 justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-12">
                        <img src="/images/logo_petayu.png" alt="Petayu Logo" className="h-10 w-auto object-contain" />
                        <span className="text-xl font-bold text-slate-800 tracking-tight">Petayu<span className="text-violet-700">WMS</span></span>
                    </div>

                    <h1 className="text-[2rem] leading-tight font-bold text-slate-900 mb-4">
                        Verifikasi OTP
                        <br />
                        lalu reset password.
                    </h1>
                    <p className="text-slate-500 text-sm mb-10 leading-relaxed pr-4">
                        Masukkan kode OTP 6 digit dari email Anda untuk menyimpan password baru.
                    </p>
                </div>

                <div className="text-xs text-slate-400">© 2026 Petayu. Semua hak dilindungi.</div>
            </div>

            <div className="flex-1 p-4 lg:p-6 flex flex-col h-screen">
                <div className="bg-white w-full h-full rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] flex flex-col justify-center">
                    <div className="w-full max-w-lg mx-auto px-8 lg:px-0">
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">Verifikasi OTP</h2>
                        <p className="text-sm text-slate-500 mb-8">Langkah 1 dari 2.</p>

                        {status === 'password-otp-sent' && (
                            <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                Kode OTP sudah dikirim ke email Anda.
                            </div>
                        )}
                        {status === 'password-otp-resend-cooldown' && (
                            <div className="mb-5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                                Tunggu {cooldown} detik sebelum kirim ulang OTP.
                            </div>
                        )}
                        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                            OTP terakhir dikirim: {formatWita(otpMeta?.sent_at)}
                        </div>

                        <form onSubmit={verifyOtp} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Login</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700"
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Kode OTP</label>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-center tracking-[0.35em] font-bold text-slate-800 focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600"
                                    placeholder="000000"
                                />
                                {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-600/30 transition-all disabled:opacity-70"
                            >
                                {processing ? 'Verifikasi...' : 'Verifikasi OTP'}
                            </button>
                        </form>
                        <form onSubmit={resendOtp} className="mt-3">
                            <button
                                type="submit"
                                disabled={processing || cooldown > 0}
                                className="w-full py-2.5 bg-white border border-violet-200 text-violet-700 rounded-xl text-sm font-semibold disabled:opacity-60"
                            >
                                {cooldown > 0 ? `Kirim ulang dalam ${cooldown} dtk` : 'Kirim Ulang OTP'}
                            </button>
                        </form>

                        <div className="mt-7 text-center">
                            <Link href={route('password.request')} className="text-sm font-semibold text-violet-600 hover:text-violet-700">
                                Kembali ke Kirim OTP
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
