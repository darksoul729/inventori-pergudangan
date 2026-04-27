import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Kata Sandi" />

            <div className="mb-10 text-left animate-[fadeInUp_0.6s_ease-out]">
                <h2 className="text-3xl font-bold text-slate-900">Reset Kata Sandi</h2>
                <p className="mt-2 text-sm text-slate-400">Buat kata sandi baru untuk akun Anda</p>
            </div>

            <form onSubmit={submit} className="space-y-8">
                <div className="animate-[fadeInUp_0.6s_ease-out_0.1s_both]">
                    <InputLabel htmlFor="email" value="EMAIL" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full border-0 border-b-2 border-slate-200 bg-transparent py-2 px-0 text-slate-900 placeholder:text-slate-300 focus:border-cyan-500 focus:ring-0 rounded-none transition-colors"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="animate-[fadeInUp_0.6s_ease-out_0.2s_both]">
                    <InputLabel htmlFor="password" value="KATA SANDI BARU" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1" />
                    <div className="relative">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full border-0 border-b-2 border-slate-200 bg-transparent py-2 px-0 text-slate-900 placeholder:text-slate-300 focus:border-cyan-500 focus:ring-0 rounded-none transition-colors tracking-widest pr-10"
                            autoComplete="new-password"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                {showPassword ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                ) : (
                                    <>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.447 7.568 7.48 4.5 12 4.5c4.521 0 8.553 3.068 9.964 7.178.09.286.09.574 0 .86C20.553 16.632 16.52 19.5 12 19.5c-4.521 0-8.553-3.068-9.964-7.178Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </>
                                )}
                            </svg>
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="animate-[fadeInUp_0.6s_ease-out_0.3s_both]">
                    <InputLabel htmlFor="password_confirmation" value="KONFIRMASI KATA SANDI" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1" />
                    <div className="relative">
                        <TextInput
                            type={showConfirm ? 'text' : 'password'}
                            id="password_confirmation"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full border-0 border-b-2 border-slate-200 bg-transparent py-2 px-0 text-slate-900 placeholder:text-slate-300 focus:border-cyan-500 focus:ring-0 rounded-none transition-colors tracking-widest pr-10"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                {showConfirm ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                ) : (
                                    <>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.447 7.568 7.48 4.5 12 4.5c4.521 0 8.553 3.068 9.964 7.178.09.286.09.574 0 .86C20.553 16.632 16.52 19.5 12 19.5c-4.521 0-8.553-3.068-9.964-7.178Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </>
                                )}
                            </svg>
                        </button>
                    </div>
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="flex items-center justify-between pt-2 animate-[fadeInUp_0.6s_ease-out_0.4s_both]">
                    <Link
                        href={route('login')}
                        className="text-sm font-semibold text-cyan-500 hover:text-cyan-600 transition-colors"
                    >
                        Kembali ke Login
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex items-center gap-2 rounded-full bg-[#2e1065] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#2e1065]/30 transition-all hover:bg-[#4c1d95] hover:shadow-xl active:scale-95 disabled:opacity-50"
                    >
                        {processing ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Menyimpan...
                            </>
                        ) : (
                            'Simpan Kata Sandi'
                        )}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
