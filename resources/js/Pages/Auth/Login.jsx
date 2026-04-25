import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

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

    return (
        <GuestLayout>
            <Head title="Login" />

            <div className="mb-10 text-left">
                <h2 className="text-3xl font-bold text-slate-900">Login</h2>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-8">
                <div>
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

                <div>
                    <InputLabel htmlFor="password" value="PASSWORD" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="block w-full border-0 border-b-2 border-slate-200 bg-transparent py-2 px-0 text-slate-900 placeholder:text-slate-300 focus:border-cyan-500 focus:ring-0 rounded-none transition-colors tracking-widest"
                        placeholder="••••••••••••"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center pt-2">
                    <label className="flex items-center cursor-pointer group">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-slate-300 text-cyan-500 shadow-sm focus:ring-cyan-500"
                        />
                        <span className="ms-3 text-sm font-medium text-slate-500 group-hover:text-slate-800 transition-colors">Remember me</span>
                    </label>
                </div>

                <div className="flex items-center justify-center pt-8">
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2e1065] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#2e1065]/30 transition-all hover:bg-[#4c1d95] active:scale-95 disabled:opacity-50"
                    >
                        Login
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
