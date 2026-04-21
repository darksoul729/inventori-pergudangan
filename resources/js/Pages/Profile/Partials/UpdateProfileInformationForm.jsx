import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    const roleName = normalizeRole(user.role_name || user.role);
    const accountStatus = normalizeStatus(user.status);

    return (
        <section className={className}>
            <header className="border-b border-slate-200 pb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                    Informasi Profil
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Perbarui data akun sesuai struktur pengguna sistem gudang.
                </p>
            </header>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Peran
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{roleName}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Status Akun
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-700">{accountStatus}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Verifikasi Email
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                        {user.email_verified_at ? 'Terverifikasi' : 'Belum Terverifikasi'}
                    </p>
                </div>
            </div>

            <form onSubmit={submit} className="mt-8 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="name" value="Nama Lengkap" />

                        <TextInput
                            id="name"
                            className="mt-2 block w-full rounded-xl border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-600 focus:ring-indigo-600"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                        />

                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email" />

                        <TextInput
                            id="email"
                            type="email"
                            className="mt-2 block w-full rounded-xl border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-600 focus:ring-indigo-600"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />

                        <InputError className="mt-2" message={errors.email} />
                    </div>
                    <div>
                        <InputLabel htmlFor="phone" value="Nomor Telepon" />

                        <TextInput
                            id="phone"
                            type="text"
                            className="mt-2 block w-full rounded-xl border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-600 focus:ring-indigo-600"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            autoComplete="tel"
                        />

                        <InputError className="mt-2" message={errors.phone} />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                        <p className="text-sm text-amber-900">
                            Alamat email Anda belum terverifikasi.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-1 rounded-md font-medium text-amber-700 underline hover:text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                            >
                                Klik di sini untuk kirim ulang email verifikasi.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-emerald-700">
                                Tautan verifikasi baru telah dikirim ke email Anda.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton
                        disabled={processing}
                        className="rounded-xl bg-[#3632c0] px-5 py-2.5 text-xs font-semibold tracking-[0.14em] hover:bg-[#2f2aa8] focus:bg-[#2f2aa8]"
                    >
                        Simpan Perubahan
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-medium text-emerald-700">
                            Tersimpan.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}

function normalizeRole(role) {
    const value = (role || '').toString().toLowerCase();

    if (value.includes('admin gudang') || value.includes('manager') || value.includes('manajer')) {
        return 'Manager Gudang';
    }

    if (value.includes('supervisor') || value.includes('spv')) {
        return 'Supervisor Gudang';
    }

    if (value.includes('staff') || value.includes('staf')) {
        return 'Staff Operasional';
    }

    if (value.includes('driver')) {
        return 'Driver';
    }

    return 'Belum Ditentukan';
}

function normalizeStatus(status) {
    const value = (status || '').toString().toLowerCase();

    if (value === 'active') {
        return 'Aktif';
    }

    if (value === 'inactive') {
        return 'Nonaktif';
    }

    return 'Belum Diatur';
}
