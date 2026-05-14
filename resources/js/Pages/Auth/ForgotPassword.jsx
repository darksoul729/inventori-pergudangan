import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="min-h-screen petayu-bg-app flex font-sans">
            <Head title="Lupa Password" />

            <div className="hidden lg:flex w-[450px] xl:w-[500px] flex-col px-10 py-12 justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-12">
                        <img src="/images/logo_petayu.png" alt="Petayu Logo" className="h-10 w-auto object-contain" />
                        <span className="text-xl font-bold text-slate-800 tracking-tight">Petayu<span className="text-violet-700">WMS</span></span>
                    </div>

                    <h1 className="text-[2rem] leading-tight font-bold text-slate-900 mb-4">
                        Lupa password?
                        <br />
                        Kirim kode OTP dulu.
                    </h1>
                    <p className="text-slate-500 text-sm mb-10 leading-relaxed pr-4">
                        Masukkan email login yang terdaftar. Kami akan kirim kode OTP untuk reset password Anda.
                    </p>
                </div>

                <div className="text-xs text-slate-400">© 2026 Petayu. Semua hak dilindungi.</div>
            </div>

            <div className="flex-1 p-4 lg:p-6 flex flex-col h-screen">
                <div className="bg-white w-full h-full rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] flex flex-col justify-center">
                    <div className="w-full max-w-lg mx-auto px-8 lg:px-0">
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">Kirim Kode OTP</h2>
                        <p className="text-sm text-slate-500 mb-8">Langkah 1 dari 2 untuk reset password.</p>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Login</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-colors"
                                    placeholder="nama@perusahaan.com"
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-600/30 transition-all disabled:opacity-70"
                            >
                                {processing ? 'Mengirim...' : 'Kirim Kode OTP'}
                            </button>
                        </form>

                        <div className="mt-7 text-center">
                            <Link href={route('login')} className="text-sm font-semibold text-violet-600 hover:text-violet-700">
                                Kembali ke Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

