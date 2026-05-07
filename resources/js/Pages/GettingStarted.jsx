import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function GettingStarted() {
    const { props } = usePage();
    const roleName = String(props.auth?.user?.role_name || props.auth?.user?.role || '').toLowerCase();
    const isManager = roleName.includes('manager') || roleName.includes('manajer') || roleName.includes('admin gudang');
    const isSupervisor = roleName.includes('supervisor') || roleName.includes('spv');

    const steps = [
        { title: '1. Cek Dasbor', desc: 'Lihat stok menipis, pengiriman terlambat, dan tagihan belum lunas.', href: '/dashboard' },
        { title: '2. Cek Stok Barang', desc: 'Pastikan data barang masuk/keluar sudah benar.', href: '/inventory' },
        { title: '3. Proses Pengiriman', desc: 'Pantau pengiriman aktif dan update status bila ada kendala.', href: '/shipments' },
        { title: '4. Cek Tagihan', desc: 'Tindak lanjuti tagihan yang belum lunas.', href: '/tagihan' },
        { title: '5. Buka Laporan', desc: 'Lihat ringkasan akhir untuk evaluasi harian.', href: '/reports' },
    ];

    const roleTips = isManager
        ? [
            'Manager: fokus keputusan akhir, approval, dan evaluasi harian.',
            'Gunakan mode lanjutan hanya saat ubah struktur gudang besar.',
        ]
        : isSupervisor
            ? [
                'Supervisor: fokus validasi operasional harian dan eskalasi ke manager.',
                'Pastikan pengiriman, stok fisik, dan mutasi sudah sinkron.',
            ]
            : [
                'Staff: fokus input harian, ketepatan data, dan update status tepat waktu.',
                'Laporkan selisih stok atau keterlambatan ke supervisor.',
            ];

    return (
        <DashboardLayout headerTitle="Mulai di Sini" contentClassName="w-full max-w-none">
            <Head title="Mulai di Sini" />

            <div className="mx-auto max-w-5xl space-y-5 pb-10">
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
                    <h1 className="text-2xl font-black text-indigo-900">Mulai di Sini</h1>
                    <p className="mt-1 text-sm font-semibold text-indigo-800">Panduan singkat agar user baru langsung paham alur kerja harian.</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    {steps.map((step) => (
                        <Link
                            key={step.title}
                            href={step.href}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50"
                        >
                            <p className="text-sm font-black text-slate-900">{step.title}</p>
                            <p className="mt-1 text-sm font-semibold text-slate-500">{step.desc}</p>
                        </Link>
                    ))}
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">Catatan Per Role</p>
                    <div className="mt-2 space-y-1 text-sm font-semibold text-emerald-900">
                        {roleTips.map((tip) => (
                            <p key={tip}>{tip}</p>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
