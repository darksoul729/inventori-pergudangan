import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ShieldAlert, FileQuestion, ServerCrash, Home, ArrowLeft, CreditCard } from 'lucide-react';

export default function ErrorPage({ status, message }) {
    const title = {
        503: '503: Layanan Tidak Tersedia',
        500: '500: Kesalahan Server',
        404: '404: Halaman Tidak Ditemukan',
        403: '403: Akses Ditolak',
    }[status] || 'Terjadi Kesalahan';

    let defaultDescription = {
        503: 'Maaf, layanan sedang dalam perbaikan. Silakan coba beberapa saat lagi.',
        500: 'Wah, sepertinya ada masalah di server kami. Tim teknis sudah diberitahu.',
        404: 'Halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.',
        403: 'Maaf, Anda tidak memiliki izin untuk mengakses fitur atau halaman ini.',
    }[status];

    const displayMessage = message && message.trim() !== '' && message !== 'This action is unauthorized.' 
        ? message 
        : defaultDescription;

    const Icon = {
        503: ServerCrash,
        500: ServerCrash,
        404: FileQuestion,
        403: ShieldAlert,
    }[status] || FileQuestion;

    const isModuleLocked = status === 403 && /modul ini tidak aktif/i.test(displayMessage || '');
    const isDesktopOnlyBlocked = status === 403 && /hanya tersedia untuk perangkat desktop\/laptop/i.test(displayMessage || '');

    return (
        <div className="min-h-screen relative font-sans overflow-hidden">
            <Head title={title} />
            <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-[6px]" />

            <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.2)]">
                    <div className="border-b border-slate-100 px-7 py-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                                <Icon className="h-6 w-6" strokeWidth={2.2} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                                    Error {status}
                                </p>
                                <h1 className="text-[24px] font-black text-slate-900">
                                    {title.split(': ')[1] || title}
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className="px-7 py-6">
                        <p className="text-[14px] leading-7 font-semibold text-slate-600">
                            {displayMessage}
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            {isDesktopOnlyBlocked ? (
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5B33CC] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#4a26aa]"
                                >
                                    Keluar
                                </Link>
                            ) : (
                                <>
                                    <button
                                        onClick={() => window.history.back()}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Kembali
                                    </button>
                                    <Link
                                        href="/dashboard"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5B33CC] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#4a26aa]"
                                    >
                                        <Home className="h-4 w-4" />
                                        Ke Dasbor
                                    </Link>
                                    {isModuleLocked && (
                                        <Link
                                            href="/settings/billing"
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-5 py-2.5 text-[13px] font-bold text-violet-700 hover:bg-violet-100"
                                        >
                                            <CreditCard className="h-4 w-4" />
                                            Lihat Paket
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] font-semibold text-slate-500">
                            Jika Anda yakin ini bukan batasan paket/role, hubungi Admin sistem.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
