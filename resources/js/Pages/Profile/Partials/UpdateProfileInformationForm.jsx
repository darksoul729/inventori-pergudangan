import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Camera, UploadCloud, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const [photoPreview, setPhotoPreview] = useState(user.profile_photo_url);

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            _method: 'patch',
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            profile_photo: null,
        });

    useEffect(() => {
        if (!data.profile_photo) {
            setPhotoPreview(user.profile_photo_url);
            return undefined;
        }

        const nextPreview = URL.createObjectURL(data.profile_photo);
        setPhotoPreview(nextPreview);

        return () => URL.revokeObjectURL(nextPreview);
    }, [data.profile_photo, user.profile_photo_url]);

    const submit = (e) => {
        e.preventDefault();

        post(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <section className={`rounded-[8px] border border-slate-200 bg-white shadow-sm ${className}`}>
            <header className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#f4f3ff] text-[#28106F]">
                        <UserRound className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-[18px] font-black text-slate-950">
                            Informasi Profil
                        </h2>
                        <p className="mt-1 text-[13px] font-semibold leading-6 text-slate-500">
                            Perbarui identitas pengguna yang tampil di sistem operasional gudang.
                        </p>
                    </div>
                </div>
            </header>

            <form onSubmit={submit} className="p-6">
                <div className="mb-7 rounded-[8px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-indigo-100 bg-[#f4f3ff] text-[#28106F]">
                                {photoPreview ? (
                                    <img
                                        src={photoPreview}
                                        alt={`Foto profil ${user.name}`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <Camera className="h-8 w-8" />
                                )}
                            </div>
                            <div>
                                <p className="text-[14px] font-black text-slate-900">Foto Profil</p>
                                <p className="mt-1 text-[12px] font-semibold leading-5 text-slate-500">
                                    Gunakan JPG, PNG, atau WebP. Maksimal 2 MB.
                                </p>
                            </div>
                        </div>

                        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-700 shadow-sm transition-all hover:border-indigo-100 hover:text-[#28106F]">
                            <UploadCloud className="h-4 w-4" />
                            Pilih Foto
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="sr-only"
                                onChange={(event) => setData('profile_photo', event.target.files?.[0] || null)}
                            />
                        </label>
                    </div>
                    <InputError className="mt-3" message={errors.profile_photo} />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="name" value="Nama Lengkap" />

                        <TextInput
                            id="name"
                            className="mt-2 block w-full rounded-[10px] border-slate-300 bg-white px-4 py-3 text-[14px] font-semibold text-slate-800 focus:border-indigo-600 focus:ring-indigo-600"
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
                            className="mt-2 block w-full rounded-[10px] border-slate-300 bg-white px-4 py-3 text-[14px] font-semibold text-slate-800 focus:border-indigo-600 focus:ring-indigo-600"
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
                            type="tel"
                            className="mt-2 block w-full rounded-[10px] border-slate-300 bg-white px-4 py-3 text-[14px] font-semibold text-slate-800 focus:border-indigo-600 focus:ring-indigo-600"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            autoComplete="tel"
                        />

                        <InputError className="mt-2" message={errors.phone} />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="mt-6 rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3">
                        <p className="text-sm font-semibold text-amber-900">
                            Alamat email Anda belum terverifikasi.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-1 rounded-md font-black text-amber-700 underline hover:text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                            >
                                Kirim ulang email verifikasi.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-black text-emerald-700">
                                Tautan verifikasi baru telah dikirim ke email Anda.
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-7 flex items-center gap-4">
                    <PrimaryButton
                        disabled={processing}
                        className="rounded-[10px] bg-[#1f2937] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] hover:bg-[#111827] focus:bg-[#111827]"
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
                        <p className="text-sm font-black text-emerald-700">
                            Tersimpan.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
