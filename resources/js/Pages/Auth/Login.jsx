import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="h-screen overflow-hidden petayu-bg-app flex font-sans">
            <Head title="Masuk" />

            {/* Left Sidebar */}
            <div className="hidden lg:flex w-[450px] xl:w-[500px] flex-col px-10 py-12 justify-between">
                <div>
                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-12">
                        <img src="/images/logo_petayu.png" alt="Petayu Logo" className="h-10 w-auto object-contain" />
                        <span className="text-xl font-bold text-slate-800 tracking-tight">Petayu<span className="text-violet-700">WMS</span></span>
                    </div>

                    {/* Headings */}
                    <h1 className="text-[2rem] leading-tight font-bold text-slate-900 mb-4">
                        Mulai kelola<br />operasional hari ini.
                    </h1>
                    <p className="text-slate-500 text-sm mb-10 leading-relaxed pr-4">
                        Akses sistem manajemen inventori modern untuk memantau stok, pengiriman, dan performa bisnis Anda.
                    </p>

                    {/* Features List */}
                    <div className="space-y-4 mb-8">
                        {/* Feature 1 */}
                        <div className="bg-white rounded-2xl p-4 flex items-start gap-4 shadow-sm border border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800 text-sm mb-1">Manajemen Inventori Real-time</h3>
                                <p className="text-slate-500 text-xs leading-relaxed">Pantau pergerakan stok gudang secara akurat di berbagai lokasi.</p>
                            </div>
                        </div>
                        {/* Feature 2 */}
                        <div className="bg-white rounded-2xl p-4 flex items-start gap-4 shadow-sm border border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800 text-sm mb-1">Analisis & Pelaporan Otomatis</h3>
                                <p className="text-slate-500 text-xs leading-relaxed">Dapatkan wawasan mendalam tentang penjualan dan performa logistik.</p>
                            </div>
                        </div>
                        {/* Feature 3 */}
                        <div className="bg-white rounded-2xl p-4 flex items-start gap-4 shadow-sm border border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800 text-sm mb-1">Integrasi Distribusi Terpusat</h3>
                                <p className="text-slate-500 text-xs leading-relaxed">Proses pesanan dan pengiriman dengan lebih cepat dan terstruktur.</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Highlight Card */}
                    <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 mb-8 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                            <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            <h4 className="font-semibold text-violet-900 text-sm">AI untuk Operasional yang Lebih Cerdas</h4>
                        </div>
                        <p className="text-violet-700/80 text-xs leading-relaxed relative z-10">
                            Petayu memanfaatkan AI untuk membantu Anda mengoptimalkan stok, memprediksi permintaan, dan meningkatkan efisiensi operasional harian.
                        </p>
                    </div>
                </div>

                {/* Bottom Badges & Copyright */}
                <div>
                    <div className="grid grid-cols-4 gap-2 mb-8">
                        <div className="text-center">
                            <div className="flex justify-center mb-2"><svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>
                            <div className="text-[10px] font-semibold text-slate-800 mb-1">Aman & Terpercaya</div>
                            <div className="text-[9px] text-slate-500">Keamanan data tingkat enterprise</div>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center mb-2"><svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div>
                            <div className="text-[10px] font-semibold text-slate-800 mb-1">Efisiensi Tinggi</div>
                            <div className="text-[9px] text-slate-500">Proses lebih cepat, biaya rendah</div>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center mb-2"><svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                            <div className="text-[10px] font-semibold text-slate-800 mb-1">Real-time</div>
                            <div className="text-[9px] text-slate-500">Data akurat untuk keputusan tepat</div>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center mb-2"><svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div>
                            <div className="text-[10px] font-semibold text-slate-800 mb-1">Support Responsif</div>
                            <div className="text-[9px] text-slate-500">Tim kami siap membantu Anda</div>
                        </div>
                    </div>
                    <div className="text-xs text-slate-400">
                        © 2026 Petayu. Semua hak dilindungi.
                    </div>
                </div>
            </div>

            {/* Right Main Content */}
            <div className="flex-1 p-4 lg:p-6 flex flex-col h-screen">
                <div className="bg-white w-full h-full rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] flex flex-col scrollbar-none overflow-y-auto">
                    
                    {/* Header */}
                    <div className="p-8 lg:p-12 pb-6 shrink-0">
                        <div className="flex w-full justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-1">Masuk ke Dashboard</h2>
                                <p className="text-sm text-slate-500">Masukkan email dan password untuk melanjutkan.</p>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-violet-50 rounded-full">
                                <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                <span className="text-xs font-semibold text-violet-900">Aman & Terpercaya</span>
                            </div>
                        </div>
                    </div>

                    {status && <div className="mb-4 px-8 lg:px-12 font-medium text-sm text-green-600">{status}</div>}

                    {/* Form Container */}
                    <div className="flex-1 px-8 lg:px-12 flex flex-col justify-center min-h-0">
                        <form onSubmit={submit} className="w-full max-w-lg mx-auto">
                            
                            <div className="space-y-6">
                                {/* Input: Email */}
                                <div>
                                    <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 mb-2">Email Login</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </div>
                                        <input id="login-email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-colors"
                                            placeholder="nama@perusahaan.com"
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                                </div>

                                {/* Input: Password */}
                                <div>
                                    <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </div>
                                        <input id="login-password" type={showPassword ? 'text' : 'password'} value={data.password} onChange={(e) => setData('password', e.target.value)} required
                                            className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-colors"
                                            placeholder="Masukkan password Anda"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
                                            {showPassword ? (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                            ) : (
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                                </div>

                                {/* Options */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="flex items-center group cursor-pointer">
                                            <div className="relative flex items-center justify-center w-5 h-5 mr-3">
                                                <input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} className="peer w-5 h-5 opacity-0 absolute cursor-pointer z-10" />
                                                <div className="w-5 h-5 border-2 border-slate-300 rounded-md peer-checked:bg-violet-600 peer-checked:border-violet-600 transition-colors"></div>
                                                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Ingat Saya</span>
                                        </label>
                                        {data.remember && (
                                            <p className="mt-1 text-xs text-violet-700">
                                                Perangkat ini akan tetap login hingga Anda logout.
                                            </p>
                                        )}
                                    </div>

                                    {canResetPassword && (
                                        <Link href={route('password.request')} className="text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors">
                                            Lupa Password?
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-8 flex flex-col gap-4">
                                <button disabled={processing} type="submit" className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                                    Masuk ke Dashboard
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                                
                                <Link href="/" className="w-full py-3.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                    Kembali ke Beranda
                                </Link>
                            </div>
                            
                            {/* Register Link */}
                            <div className="text-center mt-8">
                                <span className="text-sm text-slate-500">Belum punya akun? </span>
                                <Link href={route('register')} className="text-sm font-semibold text-violet-600 hover:text-violet-700">Daftar Trial Gratis</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
