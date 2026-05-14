import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function VerifyEmail({ status, email, meta = {} }) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({ code: '' });
    const [cooldown, setCooldown] = useState(Number(meta?.resend_available_in_seconds || 0));

    useEffect(() => {
        setCooldown(Number(meta?.resend_available_in_seconds || 0));
    }, [meta?.resend_available_in_seconds]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown((prev) => Math.max(prev - 1, 0)), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const resend = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    const verify = (e) => {
        e.preventDefault();
        post(route('verification.verify.code'), {
            onSuccess: () => reset('code'),
        });
    };

    return (
        <div className="h-screen overflow-hidden bg-[#f8f9fa] flex items-center justify-center p-4 font-sans">
            <Head title="Verifikasi Email - Petayu WMS" />

            <div className="bg-white max-w-md w-full rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 text-center animate-fade-in relative overflow-hidden">
                {/* Decorative background shape */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-50 rounded-full blur-2xl opacity-60"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-60"></div>

                <div className="relative z-10">
                    <div className="flex items-center justify-center gap-2 mb-5">
                        <img src="/images/logo_petayu.png" alt="Petayu" className="h-8 w-8 object-contain" />
                        <span className="text-base font-bold text-slate-800 tracking-tight">Petayu<span className="text-violet-700">WMS</span></span>
                    </div>

                    <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm shadow-violet-100">
                        <Mail className="w-8 h-8" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Verifikasi Email dengan Kode</h2>
                    
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        Kami sudah mengirim OTP 6 digit ke <span className="font-semibold text-slate-700">{email}</span>.
                        Masukkan kodenya di bawah ini untuk aktivasi trial.
                    </p>

                    {(status === 'verification-code-sent' || status === 'verification-link-sent') && (
                        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-left">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-emerald-800">
                                Kode OTP baru sudah dikirim. Cek email terbaru berdasarkan jam kirim.
                            </p>
                        </div>
                    )}
                    {status === 'verification-resend-cooldown' && (
                        <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-xl text-left">
                            <p className="text-sm font-medium text-amber-800">
                                Tunggu {cooldown} detik sebelum kirim ulang kode.
                            </p>
                        </div>
                    )}

                    <form onSubmit={verify} className="flex flex-col gap-4 text-left">
                        <label htmlFor="otp-code" className="text-sm font-semibold text-slate-700">Kode Verifikasi</label>
                        <input
                            id="otp-code"
                            type="text"
                            inputMode="numeric"
                            autoFocus
                            maxLength={6}
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-lg tracking-[0.35em] font-bold text-slate-800 focus:border-violet-500 focus:ring-violet-500"
                            placeholder="000000"
                        />
                        {errors.code && <p className="text-xs text-rose-600 -mt-2">{errors.code}</p>}

                        <button 
                            type="submit" 
                            disabled={processing || data.code.length !== 6}
                            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm shadow-violet-200"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Verifikasi & Masuk Dashboard
                        </button>
                    </form>

                    <form onSubmit={resend} className="mt-4">
                        <button 
                            type="submit" 
                            disabled={processing || cooldown > 0}
                            className="w-full bg-white hover:bg-slate-50 text-violet-700 border border-violet-200 font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {cooldown > 0 ? `Kirim ulang dalam ${cooldown} dtk` : 'Kirim Ulang Kode'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="mt-4 text-xs text-slate-500 text-left">
                        <p>Kode berlaku sampai: {meta?.expires_at ? new Date(meta.expires_at).toLocaleString('id-ID') : '-'}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm mt-4">
                        <span className="text-slate-500">Bukan email yang benar?</span>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="font-semibold text-slate-700 hover:text-violet-600 transition-colors"
                        >
                            Keluar & Daftar Ulang
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
