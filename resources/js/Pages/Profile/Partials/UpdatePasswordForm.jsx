import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import { useRef } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={`rounded-[8px] border border-slate-200 bg-white shadow-sm ${className}`}>
            <header className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-slate-100 text-slate-700">
                        <KeyRound className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-[18px] font-black text-slate-950">
                            Ubah Kata Sandi
                        </h2>

                        <p className="mt-1 text-[13px] font-semibold leading-6 text-slate-500">
                            Gunakan kata sandi yang kuat agar akses WMS tetap aman.
                        </p>
                    </div>
                </div>
            </header>

            <form onSubmit={updatePassword} className="space-y-6 p-6">
                <div className="grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <InputLabel
                            htmlFor="current_password"
                            value="Kata Sandi Saat Ini"
                        />

                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            type="password"
                            className="mt-2 block w-full rounded-[10px] border-slate-300 bg-white px-4 py-3 text-[14px] font-semibold text-slate-800 focus:border-indigo-600 focus:ring-indigo-600"
                            autoComplete="current-password"
                        />

                        <InputError
                            message={errors.current_password}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="Kata Sandi Baru" />

                        <TextInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type="password"
                            className="mt-2 block w-full rounded-[10px] border-slate-300 bg-white px-4 py-3 text-[14px] font-semibold text-slate-800 focus:border-indigo-600 focus:ring-indigo-600"
                            autoComplete="new-password"
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Konfirmasi Kata Sandi"
                        />

                        <TextInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            type="password"
                            className="mt-2 block w-full rounded-[10px] border-slate-300 bg-white px-4 py-3 text-[14px] font-semibold text-slate-800 focus:border-indigo-600 focus:ring-indigo-600"
                            autoComplete="new-password"
                        />

                        <InputError
                            message={errors.password_confirmation}
                            className="mt-2"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton
                        disabled={processing}
                        className="rounded-[10px] bg-[#28106F] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] hover:bg-[#2f2aa8] focus:bg-[#2f2aa8]"
                    >
                        Perbarui Kata Sandi
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
