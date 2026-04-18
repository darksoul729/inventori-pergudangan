import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
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
        <section className={`space-y-6 ${className}`}>
            <header className="border-b border-slate-200 pb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                    Hapus Akun
                </h2>

                <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800">
                    Jika akun dihapus, seluruh data yang terkait akan terhapus
                    permanen. Pastikan Anda sudah menyimpan informasi yang masih dibutuhkan.
                </p>
            </header>

            <DangerButton
                onClick={confirmUserDeletion}
                className="rounded-xl bg-red-700 px-5 py-2.5 text-xs font-semibold tracking-[0.14em] hover:bg-red-600"
            >
                Hapus Akun
            </DangerButton>

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
