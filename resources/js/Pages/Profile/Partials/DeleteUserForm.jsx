import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`rounded-[8px] border border-red-100 bg-red-50/40 shadow-sm ${className}`}>
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-red-100 text-red-700">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-[18px] font-black text-slate-950">
                            Hapus Akun
                        </h2>

                        <p className="mt-1 max-w-2xl text-[13px] font-semibold leading-6 text-red-800/80">
                            Jika akun dihapus, seluruh data yang terkait akan terhapus permanen. Pastikan informasi penting sudah diamankan.
                        </p>
                    </div>
                </div>

                <DangerButton
                    onClick={confirmUserDeletion}
                    className="rounded-[10px] bg-red-700 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] hover:bg-red-600"
                >
                    Hapus Akun
                </DangerButton>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Yakin ingin menghapus akun?
                    </h2>

                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        Setelah dihapus, akun dan seluruh datanya tidak dapat
                        dipulihkan kembali. Masukkan kata sandi untuk konfirmasi.
                    </p>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
                            value="Kata Sandi"
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="mt-1 block w-full rounded-xl border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-red-500 focus:ring-red-500"
                            isFocused
                            placeholder="Kata Sandi"
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal} className="rounded-xl">
                            Batal
                        </SecondaryButton>

                        <DangerButton className="rounded-xl" disabled={processing}>
                            Hapus Akun
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
