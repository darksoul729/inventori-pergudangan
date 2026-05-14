import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage } from '@inertiajs/react';
import { BadgeCheck, Mail, Phone, ShieldCheck, UserRound, Sparkles } from 'lucide-react';
import { useState } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth, saas } = usePage().props;
    const user = auth.user;
    const roleLabel = normalizeRole(user.role_name || user.role);
    const statusLabel = normalizeStatus(user.status);
    const initials = getInitials(user.name);
    const planLabel = getPlanLabel(saas?.plan);

    return (
        <DashboardLayout headerTitle="Profil Akun" contentClassName="max-w-none" hideMainScrollbar>
            <Head title="Profil" />

            <div className="relative min-h-screen pb-20">
                {/* Atmospheric Header Background */}
                <div className="absolute top-0 left-0 right-0 h-[220px] bg-gradient-to-br from-[#4722B3]/5 via-white to-transparent -z-10" />
                <div className="absolute top-0 left-0 right-0 h-[220px] opacity-[0.03] -z-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234722B3' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
                <section className="px-10 pt-10">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                            <div className="relative group">
                                <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#5B33CC] to-[#4722B3] rounded-[22px] blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                                <ProfilePhoto user={user} initials={initials} size="large" />
                            </div>
                            <div className="pb-2">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-[36px] font-black tracking-tight text-slate-900 leading-tight">
                                        {user.name}
                                    </h1>
                                    {user.email_verified_at && <BadgeCheck className="w-7 h-7 text-[#5B33CC] fill-indigo-50" />}
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-3">
                                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-sm">
                                        <ShieldCheck className="w-3 h-3 text-[#5B33CC]" />
                                        {roleLabel}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full shadow-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        {statusLabel}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 pb-2">
                            <InfoPill icon={Mail} label="Email Terdaftar" value={user.email} />
                            <InfoPill icon={Phone} label="Kontak WhatsApp" value={user.phone || 'Belum diisi'} />
                        </div>
                    </div>
                </section>

                <section className="grid gap-8 px-10 pt-10 lg:grid-cols-[340px_minmax(0,1fr)]">
                    <aside className="space-y-6 lg:sticky lg:top-10 lg:self-start">
                        {/* ID Card Style Summary */}
                        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all hover:shadow-xl">
                            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[#5B33CC]/5 blur-3xl" />
                            <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-emerald-500/5 blur-3xl" />
                            
                            <p className="relative text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                                ID Card Personel
                            </p>
                            
                            <div className="relative mt-5 rounded-2xl border border-[#E5EAF3] bg-gradient-to-b from-white to-slate-50/50 p-5 shadow-inner">
                                <div className="flex items-center gap-4">
                                    <ProfilePhoto user={user} initials={initials} />
                                    <div className="min-w-0">
                                        <p className="truncate text-[16px] font-black text-slate-950">{user.name}</p>
                                        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[#5B33CC]">{roleLabel}</p>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-4">
                                    <IdentityRow label="ID User" value={`#USR-${user.id.toString().padStart(4, '0')}`} />
                                    <IdentityRow label="Verifikasi" value={user.email_verified_at ? 'Sukses' : 'Pending'} />
                                    <IdentityRow label="Tier Paket" value={planLabel} />
                                </div>
                            </div>

                        </div>

                        <div className="rounded-2xl border border-indigo-100 bg-[#f4f3ff] p-5">
                            <div className="flex items-center gap-2 text-[#4722B3]">
                                <ShieldCheck className="w-4 h-4" />
                                <p className="text-[13px] font-black">Keamanan Data</p>
                            </div>
                            <p className="mt-3 text-[12px] font-semibold leading-relaxed text-indigo-900/60">
                                Informasi ini bersifat pribadi dan hanya digunakan untuk keperluan otentikasi serta log audit sistem pergudangan.
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
    const [imageError, setImageError] = useState(false);

    return (
        <div className={`${large ? 'h-32 w-32 rounded-[22px]' : 'h-16 w-16 rounded-xl'} flex flex-shrink-0 items-center justify-center overflow-hidden border-4 border-white bg-[#f4f3ff] text-[#4722B3] shadow-md relative z-10`}>
            {user.profile_photo_url && !imageError ? (
                <img
                    src={user.profile_photo_url}
                    alt={`Foto profil ${user.name}`}
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                />
            ) : (
                <img
                    src="/images/image.png"
                    alt="Foto profil default"
                    className="h-full w-full object-cover opacity-85"
                />
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
        : 'border-indigo-100 bg-[#f4f3ff] text-[#4722B3]';

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

function getPlanLabel(planCode) {
    const plans = {
        'trial_3d': 'Free Trial',
        'basic': 'Basic Plan',
        'pro': 'Professional',
        'enterprise': 'Enterprise'
    };

    return plans[planCode] || 'Standard';
}
