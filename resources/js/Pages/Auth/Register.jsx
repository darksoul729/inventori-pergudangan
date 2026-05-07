import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        email: '',
        company_name: '',
        warehouse_name: '',
        city: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <Head title="Daftar Akun" />

            <div className="mx-auto flex min-h-screen max-w-7xl items-stretch">
                <aside className="hidden w-[42%] bg-violet-700 px-10 py-12 text-white lg:flex lg:flex-col">
                    <Link href="/" className="flex items-center gap-3 text-xl font-semibold">
                        <img src="/images/logo_petayu.png" alt="Petayu" className="h-8 w-8 rounded-md bg-white/95 p-1" />
                        <span>PETAYU</span>
                    </Link>
                    <div className="mt-16 space-y-5">
                        <h2 className="text-3xl font-bold leading-tight">Mulai trial WMS 3 hari untuk setup gudang kamu.</h2>
                        <p className="text-sm text-violet-100">Isi data inti perusahaan, lalu sistem langsung membuat akun admin dan tenant.</p>
                    </div>
                    <div className="mt-10 space-y-3 text-sm text-violet-100">
                        <div className="rounded-xl border border-violet-500/80 bg-violet-600/70 px-4 py-3">Setup gudang utama dan data PIC</div>
                        <div className="rounded-xl border border-violet-500/80 bg-violet-600/70 px-4 py-3">Akses dashboard operasional setelah daftar</div>
                        <div className="rounded-xl border border-violet-500/80 bg-violet-600/70 px-4 py-3">Bisa upgrade paket kapan saja di Billing</div>
                    </div>
                </aside>

                <main className="flex w-full items-center justify-center px-6 py-10 lg:w-[58%]">
                    <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="mb-7">
                            <h1 className="text-3xl font-bold text-slate-900">Daftar Akun Petayu</h1>
                            <p className="mt-2 text-sm text-slate-600">Form singkat untuk aktivasi trial 3 hari.</p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="name" value="Nama PIC" className="mb-1 text-xs font-bold text-slate-600" />
                                    <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="block w-full border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="phone" value="No. HP PIC" className="mb-1 text-xs font-bold text-slate-600" />
                                    <TextInput id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="block w-full border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="email" value="Email Login" className="mb-1 text-xs font-bold text-slate-600" />
                                    <TextInput id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="block w-full border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="company_name" value="Nama Perusahaan" className="mb-1 text-xs font-bold text-slate-600" />
                                    <TextInput id="company_name" value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} className="block w-full border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
                                    <InputError message={errors.company_name} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="warehouse_name" value="Nama Gudang Utama" className="mb-1 text-xs font-bold text-slate-600" />
                                    <TextInput id="warehouse_name" value={data.warehouse_name} onChange={(e) => setData('warehouse_name', e.target.value)} className="block w-full border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
                                    <InputError message={errors.warehouse_name} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="city" value="Kota Operasional" className="mb-1 text-xs font-bold text-slate-600" />
                                    <TextInput id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} className="block w-full border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
                                    <InputError message={errors.city} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="password" value="Password" className="mb-1 text-xs font-bold text-slate-600" />
                                    <TextInput id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="block w-full border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" className="mb-1 text-xs font-bold text-slate-600" />
                                    <TextInput id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} className="block w-full border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-3 w-full rounded-xl bg-violet-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-violet-800 disabled:opacity-50"
                            >
                                {processing ? 'Memproses...' : 'Daftar & Mulai Trial 3 Hari'}
                            </button>

                            <div className="text-center text-sm text-slate-600">
                                Sudah punya akun?{' '}
                                <Link href={route('login')} className="font-bold text-violet-700 hover:text-violet-800">
                                    Masuk di sini
                                </Link>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
