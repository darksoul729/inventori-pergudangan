import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Kata Sandi" />

            <div className="mb-10 text-left animate-[fadeInUp_0.6s_ease-out]">
                <h2 className="text-3xl font-bold text-slate-900">Lupa Kata Sandi</h2>
                <p className="mt-2 text-sm text-slate-400">Masukkan email Anda untuk mendapatkan tautan reset</p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600 animate-[fadeInUp_0.4s_ease-out]">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-8">
                <div className="animate-[fadeInUp_0.6s_ease-out_0.1s_both]">
                    <InputLabel htmlFor="email" value="EMAIL" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full border-0 border-b-2 border-slate-200 bg-transparent py-2 px-0 text-slate-900 placeholder:text-slate-300 focus:border-cyan-500 focus:ring-0 rounded-none transition-colors"
                        placeholder="contoh@email.com"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="flex items-center justify-between pt-2 animate-[fadeInUp_0.6s_ease-out_0.2s_both]">
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
                                Mengirim...
                            </>
                        ) : (
                            'Kirim Tautan Reset'
                        )}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
