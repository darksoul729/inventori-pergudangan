import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const roleLabel = normalizeRole(user.role_name || user.role);

    return (
        <DashboardLayout>
            <Head title="Profil" />

            <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white px-7 py-7 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f46e5]">
                                Pusat Akun
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                                Profil Pengguna
                            </h1>
                            <p className="mt-2 text-sm text-slate-600">
                                Kelola identitas akun, keamanan login, dan status akses operasional.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                            <InfoPill label="Role" value={roleLabel} />
                            <InfoPill label="Email" value={user.email} />
                            <InfoPill label="Status" value={normalizeStatus(user.status)} />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                        <UpdatePasswordForm />
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                        <DeleteUserForm />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function InfoPill({ label, value }) {
    return (
        <div className="rounded-2xl border border-[#dbe3f1] bg-[#f8fafc] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {label}
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900">{value || '-'}</p>
        </div>
    );
}

function normalizeRole(role) {
    const value = (role || '').toString().toLowerCase();

    if (value.includes('admin gudang') || value.includes('manager') || value.includes('manajer')) {
        return 'Manager Gudang';
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
