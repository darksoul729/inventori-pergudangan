import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage } from '@inertiajs/react';
import { BadgeCheck, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const roleLabel = normalizeRole(user.role_name || user.role);
    const statusLabel = normalizeStatus(user.status);
    const initials = getInitials(user.name);

    return (
        <DashboardLayout headerTitle="Profil Pengguna" contentClassName="max-w-none" hideSearch={true}>
            <Head title="Profil" />

            <div className="pb-12">
                <section className="border-b border-slate-200 bg-white px-7 py-7 shadow-sm">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            <ProfilePhoto user={user} initials={initials} size="large" />
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#28106F]">
                                    Pusat Akun
                                </p>
                                <h1 className="mt-2 text-[32px] font-black tracking-tight text-slate-950">
                                    {user.name}
                                </h1>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <StatusBadge icon={ShieldCheck} text={roleLabel} />
                                    <StatusBadge icon={BadgeCheck} text={statusLabel} tone="success" />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <InfoPill icon={Mail} label="Email" value={user.email} />
                            <InfoPill icon={Phone} label="Telepon" value={user.phone || 'Belum diisi'} />
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 pt-7 lg:grid-cols-[340px_minmax(0,1fr)]">
                    <aside className="space-y-6">
                        <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                                Kartu Identitas
                            </p>
                            <div className="mt-4 rounded-[8px] border border-slate-200 bg-slate-50 p-5">
                                <div className="flex items-center gap-4">
                                    <ProfilePhoto user={user} initials={initials} />
                                    <div className="min-w-0">
                                        <p className="truncate text-[16px] font-black text-slate-950">{user.name}</p>
                                        <p className="mt-1 text-[12px] font-bold uppercase tracking-wider text-slate-400">{roleLabel}</p>
                                    </div>
                                </div>
                                <dl className="mt-5 space-y-4">
                                    <IdentityRow label="Status Akses" value={statusLabel} />
                                    <IdentityRow label="Verifikasi Email" value={user.email_verified_at ? 'Terverifikasi' : 'Belum Terverifikasi'} />
                                    <IdentityRow label="Nomor Telepon" value={user.phone || '-'} />
                                </dl>
                            </div>
                        </div>

                        <div className="rounded-[8px] border border-indigo-100 bg-indigo-50 px-4 py-4">
                            <p className="text-[13px] font-black text-[#28106F]">Akses operasional gudang</p>
                            <p className="mt-2 text-[12px] font-semibold leading-6 text-indigo-900/70">
                                Data profil dipakai untuk audit transaksi, eskalasi kendala, dan identitas pengguna pada workflow WMS.
                            </p>
                        </div>
                    </aside>

                    <main className="space-y-6">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />

                        <UpdatePasswordForm />

                        <DeleteUserForm />
                    </main>
                </section>
            </div>
        </DashboardLayout>
    );
}

function ProfilePhoto({ user, initials, size = 'normal' }) {
    const large = size === 'large';

    return (
        <div className={`${large ? 'h-24 w-24 rounded-[8px]' : 'h-16 w-16 rounded-[8px]'} flex flex-shrink-0 items-center justify-center overflow-hidden border border-indigo-100 bg-[#f4f3ff] text-[#28106F] shadow-sm`}>
            {user.profile_photo_url ? (
                <img
                    src={user.profile_photo_url}
                    alt={`Foto profil ${user.name}`}
                    className="h-full w-full object-cover"
                />
            ) : (
                <span className={`${large ? 'text-[30px]' : 'text-[20px]'} font-black tracking-tight`}>{initials}</span>
            )}
        </div>
    );
}

function InfoPill({ icon: Icon, label, value }) {
    return (
        <div className="min-w-[230px] rounded-[8px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-[8px] bg-slate-50 text-slate-500">
                    <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
                    <p className="mt-1 truncate text-[13px] font-black text-slate-900">{value || '-'}</p>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ icon: Icon, text, tone = 'default' }) {
    const styles = tone === 'success'
        ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
        : 'border-indigo-100 bg-[#f4f3ff] text-[#28106F]';

    return (
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-wider ${styles}`}>
            <Icon className="h-3.5 w-3.5" />
            {text}
        </span>
    );
}

function IdentityRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4 first:border-t-0 first:pt-0">
            <dt className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</dt>
            <dd className="text-right text-[13px] font-black text-slate-800">{value}</dd>
        </div>
    );
}

function getInitials(name) {
    const words = (name || 'Pengguna Sistem').trim().split(/\s+/).slice(0, 2);
    return words.map((word) => word.charAt(0)).join('').toUpperCase();
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
