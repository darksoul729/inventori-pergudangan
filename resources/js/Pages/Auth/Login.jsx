import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen bg-slate-100">
            <Head title="Login" />

            <div className="mx-auto flex min-h-screen max-w-7xl items-stretch">
                <aside className="hidden w-[42%] bg-violet-700 px-10 py-12 text-white lg:flex lg:flex-col">
                    <Link href="/" className="flex items-center gap-3 text-xl font-semibold">
                        <img src="/images/logo_petayu.png" alt="Petayu" className="h-8 w-8 rounded-md bg-white/95 p-1" />
                        <span>PETAYU</span>
                    </Link>
                    <div className="mt-16 space-y-5">
                        <h2 className="text-3xl font-bold leading-tight">Sistem WMS yang rapi dan mudah dipakai tim gudang.</h2>
                        <p className="text-sm text-violet-100">Fokus ke operasional harian: stok, rak, pengiriman, dan billing SaaS.</p>
                    </div>
                    <div className="mt-10 space-y-3 text-sm text-violet-100">
                        <div className="rounded-xl border border-violet-500/80 bg-violet-600/70 px-4 py-3">1 akun admin untuk mulai setup gudang</div>
                        <div className="rounded-xl border border-violet-500/80 bg-violet-600/70 px-4 py-3">Akses modul bertahap sesuai paket</div>
                        <div className="rounded-xl border border-violet-500/80 bg-violet-600/70 px-4 py-3">Alur sederhana untuk UMKM sampai menengah</div>
                    </div>
                </aside>

                <main className="flex w-full items-center justify-center px-6 py-10 lg:w-[58%]">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="mb-7">
                            <h1 className="text-3xl font-bold text-slate-900">Masuk ke Petayu</h1>
                            <p className="mt-2 text-sm text-slate-600">Gunakan akun admin untuk lanjut ke dashboard.</p>
                        </div>

                        {status && (
                            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <InputLabel htmlFor="email" value="Email Login" className="mb-1 text-xs font-bold text-slate-600" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-600 focus:ring-violet-600/20"
                                    placeholder="admin@petayu.com"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <div className="mb-1 flex items-center justify-between">
                                    <InputLabel htmlFor="password" value="Password" className="text-xs font-bold text-slate-600" />
                                    {canResetPassword && (
                                        <Link href={route('password.request')} className="text-xs font-semibold text-violet-700 hover:text-violet-800">
                                            Lupa password?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <TextInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        className="block w-full border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm tracking-widest text-slate-900 placeholder:text-slate-400 focus:border-violet-600 focus:ring-violet-600/20"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.447 7.568 7.48 4.5 12 4.5c4.521 0 8.553 3.068 9.964 7.178.09.286.09.574 0 .86C20.553 16.632 16.52 19.5 12 19.5c-4.521 0-8.553-3.068-9.964-7.178Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <label className="flex cursor-pointer items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-300 text-violet-700 shadow-sm focus:ring-violet-500"
                                />
                                <span className="ms-2 text-sm text-slate-600">Ingat saya</span>
                            </label>

                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-violet-800 disabled:opacity-50"
                            >
                                {processing ? 'Memproses...' : 'Masuk'}
                            </button>

                            <div className="text-center text-sm text-slate-600">
                                Belum punya akun?{' '}
                                <Link href={route('register')} className="font-bold text-violet-700 hover:text-violet-800">
                                    Daftar
                                </Link>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
