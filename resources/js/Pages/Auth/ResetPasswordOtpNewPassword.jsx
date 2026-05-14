import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function ResetPasswordOtpNewPassword({ email = '', resetSessionToken = '', status }) {
    const { data, setData, post, processing, errors } = useForm({
        email,
        reset_session_token: resetSessionToken,
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const getPasswordStrength = (password) => {
        let score = 0;
        if (!password) return score;
        if (password.length >= 8) score += 25;
        if (/[A-Z]/.test(password)) score += 25;
        if (/[0-9]/.test(password)) score += 25;
        if (/[^A-Za-z0-9]/.test(password)) score += 25;
        return score;
    };

    const strength = getPasswordStrength(data.password);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'));
    };

    return (
        <div className="min-h-screen petayu-bg-app flex font-sans">
            <Head title="Ganti Password Baru" />

            <div className="hidden lg:flex w-[450px] xl:w-[500px] flex-col px-10 py-12 justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-12">
                        <img src="/images/logo_petayu.png" alt="Petayu Logo" className="h-10 w-auto object-contain" />
                        <span className="text-xl font-bold text-slate-800 tracking-tight">Petayu<span className="text-violet-700">WMS</span></span>
                    </div>

                    <h1 className="text-[2rem] leading-tight font-bold text-slate-900 mb-4">
                        Buat password baru
                        <br />
                        untuk akun Anda.
                    </h1>
                    <p className="text-slate-500 text-sm mb-10 leading-relaxed pr-4">
                        OTP sudah diverifikasi. Lanjutkan dengan membuat password baru yang kuat.
                    </p>
                </div>

                <div className="text-xs text-slate-400">© 2026 Petayu. Semua hak dilindungi.</div>
            </div>

            <div className="flex-1 p-4 lg:p-6 flex flex-col h-screen">
                <div className="bg-white w-full h-full rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] flex flex-col justify-center">
                    <div className="w-full max-w-lg mx-auto px-8 lg:px-0">
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">Reset Password</h2>
                        <p className="text-sm text-slate-500 mb-8">Langkah 2 dari 2.</p>

                        {status === 'otp-verified' && (
                            <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                OTP valid. Silakan set password baru.
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Login</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    readOnly
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700"
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                                {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Password Baru</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600"
                                        placeholder="Minimal 8 karakter"
                                    />
                                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                                        {showPassword ? 'Sembunyi' : 'Lihat'}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                                <div className="mt-2">
                                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                                        <div className={`h-full transition-all ${strength < 50 ? 'bg-rose-500' : strength < 100 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${strength}%` }} />
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {strength < 50 ? 'Lemah' : strength < 100 ? 'Sedang' : 'Kuat'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Konfirmasi Password Baru</label>
                                <div className="relative">
                                    <input
                                        type={showPasswordConfirmation ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600"
                                        placeholder="Ulangi password baru"
                                    />
                                    <button type="button" onClick={() => setShowPasswordConfirmation((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                                        {showPasswordConfirmation ? 'Sembunyi' : 'Lihat'}
                                    </button>
                                </div>
                                {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing || strength < 100}
                                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-70"
                            >
                                {processing ? 'Memproses...' : 'Simpan Password Baru'}
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
