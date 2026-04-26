import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function CreateDriver() {
    const form = useForm({
        name: '',
        email: '',
        phone: '',
        license_number: '',
        password: '',
        password_confirmation: '',
        status: 'approved',
    });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('drivers.store'));
    };

    return (
        <DashboardLayout
            headerTitle="Manajemen Driver"
            headerSearchPlaceholder="Cari driver, kontak, atau nomor SIM..."
            contentClassName="w-full max-w-none"
        >
            <Head title="Buat Akun Driver" />

            <div className="mx-auto w-full max-w-4xl space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-[30px] font-black tracking-tight text-[#28106F]">Buat Akun Driver</h1>
                        <p className="mt-1 text-[14px] font-semibold text-gray-500">
                            Akun driver dibuat oleh manager, bukan lewat register publik.
                        </p>
                    </div>
                    <Link
                        href={route('drivers.index')}
                        className="inline-flex h-11 items-center rounded-[10px] border border-gray-200 px-4 text-[12px] font-black text-gray-600 transition hover:bg-gray-50"
                    >
                        Kembali
                    </Link>
                </div>

                <form onSubmit={submit} className="overflow-hidden rounded-[14px] border border-gray-200 bg-white shadow-sm">
                    <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Nama Driver</label>
                            <input
                                type="text"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] font-bold"
                                required
                                autoFocus
                            />
                            {form.errors.name && <p className="mt-1 text-xs font-bold text-red-500">{form.errors.name}</p>}
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Nomor SIM</label>
                            <input
                                type="text"
                                value={form.data.license_number}
                                onChange={(event) => form.setData('license_number', event.target.value)}
                                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] font-bold"
                                required
                            />
                            {form.errors.license_number && <p className="mt-1 text-xs font-bold text-red-500">{form.errors.license_number}</p>}
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Email Login</label>
                            <input
                                type="email"
                                value={form.data.email}
                                onChange={(event) => form.setData('email', event.target.value)}
                                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] font-bold"
                                required
                            />
                            {form.errors.email && <p className="mt-1 text-xs font-bold text-red-500">{form.errors.email}</p>}
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Telepon</label>
                            <input
                                type="text"
                                value={form.data.phone}
                                onChange={(event) => form.setData('phone', event.target.value)}
                                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] font-bold"
                            />
                            {form.errors.phone && <p className="mt-1 text-xs font-bold text-red-500">{form.errors.phone}</p>}
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Password</label>
                            <input
                                type="password"
                                value={form.data.password}
                                onChange={(event) => form.setData('password', event.target.value)}
                                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] font-bold"
                                required
                            />
                            {form.errors.password && <p className="mt-1 text-xs font-bold text-red-500">{form.errors.password}</p>}
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Konfirmasi Password</label>
                            <input
                                type="password"
                                value={form.data.password_confirmation}
                                onChange={(event) => form.setData('password_confirmation', event.target.value)}
                                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] font-bold"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status Awal</label>
                            <select
                                value={form.data.status}
                                onChange={(event) => form.setData('status', event.target.value)}
                                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] font-bold"
                            >
                                <option value="approved">Approved - bisa login langsung</option>
                                <option value="pending">Pending - belum bisa login</option>
                            </select>
                            {form.errors.status && <p className="mt-1 text-xs font-bold text-red-500">{form.errors.status}</p>}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-4">
                        <Link
                            href={route('drivers.index')}
                            className="inline-flex h-11 items-center rounded-[10px] border border-gray-200 px-5 text-[12px] font-black text-gray-600 transition hover:bg-white"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex h-11 items-center rounded-[10px] bg-[#28106F] px-6 text-[12px] font-black uppercase tracking-wider text-white transition hover:bg-[#2f2aa6] disabled:opacity-50"
                        >
                            Buat Akun Driver
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
