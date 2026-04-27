import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

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
        <GuestLayout>
            <Head title="Login" />

            <div className="mb-10 text-left animate-[fadeInUp_0.6s_ease-out]">
                <h2 className="text-3xl font-bold text-slate-900">Login</h2>
                <p className="mt-2 text-sm text-slate-400">Masuk ke akun Anda untuk melanjutkan</p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600 animate-[fadeInUp_0.4s_ease-out]">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-8">
                <div className="animate-[fadeInUp_0.6s_ease-out_0.1s_both]">
                    <InputLabel htmlFor="email" value="USERNAME / EMAIL" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full border-0 border-b-2 border-slate-200 bg-transparent py-2 px-0 text-slate-900 placeholder:text-slate-300 focus:border-cyan-500 focus:ring-0 rounded-none transition-colors"
                        placeholder="Enter your username or email"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="animate-[fadeInUp_0.6s_ease-out_0.2s_both]">
                    <InputLabel htmlFor="password" value="PASSWORD" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1" />
                    <div className="relative">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full border-0 border-b-2 border-slate-200 bg-transparent py-2 px-0 text-slate-900 placeholder:text-slate-300 focus:border-cyan-500 focus:ring-0 rounded-none transition-colors tracking-widest pr-10"
                            placeholder="••••••••••••"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.447 7.568 7.48 4.5 12 4.5c4.521 0 8.553 3.068 9.964 7.178.09.286.09.574 0 .86C20.553 16.632 16.52 19.5 12 19.5c-4.521 0-8.553-3.068-9.964-7.178Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between pt-2 animate-[fadeInUp_0.6s_ease-out_0.3s_both]">
                    <label className="flex items-center cursor-pointer group">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-slate-300 text-cyan-500 shadow-sm focus:ring-cyan-500"
                        />
                        <span className="ms-3 text-sm font-medium text-slate-500 group-hover:text-slate-800 transition-colors">Remember me</span>
                    </label>
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-semibold text-cyan-500 hover:text-cyan-600 transition-colors"
                        >
                            Lupa kata sandi?
                        </Link>
                    )}
                </div>

                <div className="flex items-center justify-center pt-8 animate-[fadeInUp_0.6s_ease-out_0.4s_both]">
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2e1065] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#2e1065]/30 transition-all hover:bg-[#4c1d95] hover:shadow-xl hover:shadow-[#2e1065]/40 active:scale-95 disabled:opacity-50"
                    >
                        {processing ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Memproses...
                            </>
                        ) : (
                            <>
                                Login
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
