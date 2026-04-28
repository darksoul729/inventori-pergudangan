import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Clock3,
    FileText,
    LifeBuoy,
    MessageSquare,
    ShieldCheck,
    Sparkles,
    UserRoundCheck,
} from 'lucide-react';

const supportChannels = [
    {
        title: 'Manager Gudang',
        description: 'Untuk kendala data master, akses role, verifikasi transaksi, dan koreksi stok yang memerlukan keputusan operasional gudang.',
        response: 'Prioritas tinggi saat jam operasional gudang.',
        icon: UserRoundCheck,
    },
    {
        title: 'Supervisor Gudang',
        description: 'Untuk bantuan proses inbound, outbound, transfer rack, stock opname, dan validasi dokumen harian.',
        response: 'Dipakai untuk masalah yang perlu dicek langsung di area gudang.',
        icon: ShieldCheck,
    },
    {
        title: 'PETAYU AI',
        description: 'Untuk pertanyaan cepat tentang ringkasan stok, tren transaksi, penggunaan modul, atau analisis awal sebelum eskalasi.',
        response: 'Tersedia dari menu PETAYU AI dan bubble bantuan di halaman sistem.',
        icon: Sparkles,
    },
];

const issueCategories = [
    {
        title: 'Stok tidak sesuai',
        detail: 'Cek histori produk, transaksi terakhir, stock opname, adjustment, lokasi rack, dan perhitungan stok maksimum otomatis berbasis kapasitas rack.',
        route: '/inventory',
    },
    {
        title: 'Dokumen belum muncul',
        detail: 'Pastikan transaksi sudah tersimpan dan role memiliki akses ke Dokumen WMS atau detail transaksi.',
        route: '/transaction',
    },
    {
        title: 'Pengiriman bermasalah',
        detail: 'Periksa status shipment, validasi stok per rack, driver, proof of delivery, dan catatan verifikasi POD.',
        route: '/shipments',
    },
    {
        title: 'Hapus produk gagal',
        detail: 'Cek apakah produk masih punya stok atau terhubung dokumen transaksi. Gunakan hapus paksa hanya bila produk tidak lagi dipakai operasional aktif.',
        route: '/inventory',
    },
    {
        title: 'PO atau supplier',
        detail: 'Cek status purchase order, detail supplier, dan catatan performa pemasok.',
        route: '/purchase-orders',
    },
    {
        title: 'Akses menu tertutup',
        detail: 'Cocokkan role pengguna: Manager Gudang, Supervisor Gudang, Staff Operasional, atau Driver. Menu tertentu memang dibatasi.',
        route: '/settings',
    },
    {
        title: 'Laporan tidak sesuai',
        detail: 'Pastikan filter sumber data, tanggal, dan transaksi verifikasi sudah benar sebelum generate laporan.',
        route: '/reports',
    },
];

const escalationSteps = [
    'Catat menu yang bermasalah, nomor dokumen, nama produk, rack, supplier, driver, atau shipment terkait.',
    'Ambil screenshot tampilan error atau data yang tidak sesuai.',
    'Jika terkait produk: cek stok maksimum otomatis (kapasitas rack), stok fisik rack, dan status relasi transaksi produk.',
    'Cek dokumentasi sistem untuk memastikan langkah kerja sudah benar.',
    'Laporkan ke Supervisor Gudang jika masalah terjadi pada proses operasional gudang.',
    'Eskalasi ke Manager Gudang jika masalah menyangkut role akses, data master, koreksi stok final, atau bug sistem.',
];

const quickChecks = [
    'Refresh halaman setelah submit data.',
    'Pastikan koneksi internet stabil.',
    'Pastikan role akun sesuai tugas yang dikerjakan.',
    'Cek apakah dokumen sudah diverifikasi.',
    'Untuk shipment, pastikan stok tersedia di rack dan tidak seluruhnya ter-reservasi.',
    'Untuk driver, pastikan tidak ada shipment aktif sebelum status ditahan/nonaktifkan.',
    'Gunakan pencarian atau filter tanggal sebelum menyimpulkan data hilang.',
];

const contactByRole = {
    staff: {
        label: 'Supervisor Gudang',
        detail: 'Staff Operasional sebaiknya melapor dulu ke Supervisor Gudang untuk kendala input, transaksi harian, stock opname, dan pengiriman.',
    },
    supervisor: {
        label: 'Manager Gudang',
        detail: 'Supervisor Gudang dapat eskalasi ke Manager Gudang untuk approval, data master, koreksi stok final, dan keputusan operasional lintas shift.',
    },
    manager: {
        label: 'PETAYU AI dan Dokumentasi Sistem',
        detail: 'Manager Gudang dapat memakai PETAYU AI untuk analisis awal, lalu memakai dokumentasi untuk memvalidasi alur sebelum mengambil keputusan.',
    },
    driver: {
        label: 'Supervisor Gudang',
        detail: 'Driver sebaiknya melapor ke Supervisor Gudang untuk kendala shipment, status pengiriman, proof of delivery, lokasi, atau perubahan status tahan.',
    },
};

const normalizeRoleKey = (role) => {
    const value = (role || '').toString().toLowerCase();

    if (value.includes('manager') || value.includes('manajer') || value.includes('admin gudang')) return 'manager';
    if (value.includes('supervisor') || value.includes('spv')) return 'supervisor';
    if (value.includes('staff') || value.includes('staf')) return 'staff';
    if (value.includes('driver')) return 'driver';

    return 'staff';
};

const formatRoleLabel = (roleKey) => {
    if (roleKey === 'manager') return 'Manager Gudang';
    if (roleKey === 'supervisor') return 'Supervisor Gudang';
    if (roleKey === 'driver') return 'Driver';

    return 'Staff Operasional';
};

export default function LiveSupport() {
    const { auth } = usePage().props;
    const currentRole = normalizeRoleKey(auth?.user?.role_name || auth?.user?.role);
    const recommendedContact = contactByRole[currentRole] || contactByRole.staff;
    const [searchTerm, setSearchTerm] = useState('');
    const normalizedQuery = searchTerm.trim().toLowerCase();
    const channelsSectionRef = useRef(null);
    const categoriesSectionRef = useRef(null);
    const quickChecksSectionRef = useRef(null);
    const escalationSectionRef = useRef(null);

    const filteredSupportChannels = useMemo(() => {
        if (!normalizedQuery) return supportChannels;
        return supportChannels.filter((item) => `${item.title} ${item.description} ${item.response}`.toLowerCase().includes(normalizedQuery));
    }, [normalizedQuery]);

    const filteredIssueCategories = useMemo(() => {
        if (!normalizedQuery) return issueCategories;
        return issueCategories.filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(normalizedQuery));
    }, [normalizedQuery]);

    const filteredQuickChecks = useMemo(() => {
        if (!normalizedQuery) return quickChecks;
        return quickChecks.filter((item) => item.toLowerCase().includes(normalizedQuery));
    }, [normalizedQuery]);

    const filteredEscalationSteps = useMemo(() => {
        if (!normalizedQuery) return escalationSteps;
        return escalationSteps.filter((item) => item.toLowerCase().includes(normalizedQuery));
    }, [normalizedQuery]);

    useEffect(() => {
        if (!normalizedQuery) return;
        if (filteredSupportChannels.length > 0) {
            channelsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        if (filteredIssueCategories.length > 0) {
            categoriesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        if (filteredQuickChecks.length > 0) {
            quickChecksSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        if (filteredEscalationSteps.length > 0) {
            escalationSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [
        filteredEscalationSteps.length,
        filteredIssueCategories.length,
        filteredQuickChecks.length,
        filteredSupportChannels.length,
        normalizedQuery,
    ]);

    return (
        <DashboardLayout
            headerTitle="Bantuan Langsung"
            contentClassName="max-w-[1280px] mx-auto"
            searchValue={searchTerm}
            onSearch={setSearchTerm}
        >
            <Head title="Bantuan Langsung" />

            <div className="pb-16">
                <section className="pt-4 pb-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#28106F]">Pusat Bantuan</p>
                            <h1 className="mt-3 text-[34px] font-black tracking-tight text-[#111827]">Bantuan Langsung Operasional</h1>
                            <p className="mt-3 max-w-3xl text-[14px] font-semibold leading-7 text-gray-500">
                                Gunakan halaman ini untuk menentukan jalur bantuan saat terjadi kendala data, akses, dokumen, pengiriman, atau proses gudang.
                            </p>
                        </div>
                        <Link
                            href="/help/documentation"
                            className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#28106F] px-5 py-3 text-[12px] font-black uppercase tracking-wider text-white shadow-lg shadow-indigo-100 transition-all hover:bg-[#28239d]"
                        >
                            Dokumentasi Sistem
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>

                <section className="mb-8 rounded-[8px] border border-indigo-100 bg-[#f4f3ff] p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#28106F]">Jalur Kontak Disarankan</p>
                            <h2 className="mt-2 text-[22px] font-black text-gray-900">{recommendedContact.label}</h2>
                            <p className="mt-2 max-w-4xl text-[13px] font-bold leading-6 text-gray-600">{recommendedContact.detail}</p>
                        </div>
                        <div className="rounded-[8px] bg-white px-4 py-3 text-[12px] font-black uppercase tracking-wider text-[#28106F] shadow-sm">
                            Peran Saat Ini: {formatRoleLabel(currentRole)}
                        </div>
                    </div>
                </section>

                <section ref={channelsSectionRef} className="mb-8 grid gap-4 lg:grid-cols-3">
                    {filteredSupportChannels.map((channel) => {
                        const Icon = channel.icon;

                        return (
                            <article key={channel.title} className="rounded-[8px] border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#f4f3ff] text-[#28106F]">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h2 className="text-[18px] font-black text-gray-900">{channel.title}</h2>
                                <p className="mt-3 text-[13px] font-semibold leading-6 text-gray-500">{channel.description}</p>
                                <div className="mt-5 flex items-start gap-2 rounded-[8px] bg-[#F8F7FF] p-4 text-[12px] font-bold leading-6 text-gray-600">
                                    <Clock3 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#28106F]" />
                                    <span>{channel.response}</span>
                                </div>
                            </article>
                        );
                    })}
                </section>

                <section className="mb-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                    <div ref={categoriesSectionRef} className="rounded-[8px] border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-amber-50 text-amber-600">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-[18px] font-black text-gray-900">Kategori Kendala</h2>
                                <p className="text-[12px] font-bold text-gray-400">Pilih area masalah sebelum eskalasi.</p>
                            </div>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            {filteredIssueCategories.map((issue) => (
                                <Link key={issue.title} href={issue.route} className="group rounded-[8px] border border-gray-100 bg-[#F8F7FF] p-4 transition-all hover:border-indigo-100 hover:bg-white hover:shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-[14px] font-black text-gray-900 group-hover:text-[#28106F]">{issue.title}</h3>
                                        <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-300 group-hover:text-[#28106F]" />
                                    </div>
                                    <p className="mt-2 text-[12px] font-semibold leading-6 text-gray-500">{issue.detail}</p>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div ref={quickChecksSectionRef} className="rounded-[8px] border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-emerald-50 text-emerald-600">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-[18px] font-black text-gray-900">Cek Cepat</h2>
                                <p className="text-[12px] font-bold text-gray-400">Lakukan sebelum membuat laporan kendala.</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {filteredQuickChecks.map((item) => (
                                <div key={item} className="flex gap-3 rounded-[8px] bg-[#F8F7FF] p-4 text-[13px] font-bold leading-6 text-gray-600">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                    <div ref={escalationSectionRef} className="rounded-[8px] border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[8px] bg-indigo-50 text-[#28106F]">
                            <LifeBuoy className="h-6 w-6" />
                        </div>
                        <h2 className="text-[20px] font-black text-gray-900">Format Laporan Kendala</h2>
                        <p className="mt-3 text-[13px] font-semibold leading-7 text-gray-500">
                            Saat menghubungi penanggung jawab gudang, sertakan data yang cukup agar masalah bisa ditelusuri tanpa bolak-balik klarifikasi.
                        </p>
                        <div className="mt-6 space-y-3 text-[13px] font-bold leading-6 text-gray-600">
                            <div className="rounded-[8px] border border-gray-100 bg-[#F8F7FF] p-4">Menu: contoh Inventaris, Pengiriman, Laporan</div>
                            <div className="rounded-[8px] border border-gray-100 bg-[#F8F7FF] p-4">Nomor dokumen: PO, Stock Out, Shipment, Opname, atau Adjustment</div>
                            <div className="rounded-[8px] border border-gray-100 bg-[#F8F7FF] p-4">Masalah: data tidak sesuai, akses ditolak, gagal submit, atau laporan tidak sinkron</div>
                            <div className="rounded-[8px] border border-gray-100 bg-[#F8F7FF] p-4">Bukti: screenshot, waktu kejadian, dan akun pengguna</div>
                        </div>
                    </div>

                    <div className="rounded-[8px] border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-indigo-50 text-[#28106F]">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-[18px] font-black text-gray-900">Alur Eskalasi</h2>
                                <p className="text-[12px] font-bold text-gray-400">Urutan penanganan kendala sistem.</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {filteredEscalationSteps.map((step, index) => (
                                <div key={step} className="flex gap-4 rounded-[8px] border border-gray-100 bg-[#F8F7FF] p-4">
                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-white text-[12px] font-black text-[#28106F] shadow-sm">
                                        {index + 1}
                                    </div>
                                    <p className="text-[13px] font-bold leading-6 text-gray-600">{step}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                            <Link href="/help/documentation" className="inline-flex flex-1 items-center justify-center gap-2 rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-[12px] font-black uppercase tracking-wider text-gray-700 transition-all hover:border-indigo-100 hover:text-[#28106F]">
                                <FileText className="h-4 w-4" />
                                Baca Dokumentasi
                            </Link>
                            <Link href={`/petayu-ai?prompt=${encodeURIComponent('Saya butuh bantuan langsung. Jelaskan jalur eskalasi kendala sistem sesuai role saya dan data apa saja yang harus saya siapkan.')}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-[12px] bg-[#28106F] px-4 py-3 text-[12px] font-black uppercase tracking-wider text-white transition-all hover:bg-[#28239d]">
                                <Sparkles className="h-4 w-4" />
                                Tanya PETAYU AI
                            </Link>
                        </div>
                    </div>
                </section>
                {normalizedQuery &&
                    filteredSupportChannels.length === 0 &&
                    filteredIssueCategories.length === 0 &&
                    filteredQuickChecks.length === 0 &&
                    filteredEscalationSteps.length === 0 && (
                    <section className="mt-6 rounded-[8px] border border-slate-200 bg-white p-6 text-center text-[13px] font-bold text-slate-500">
                        Tidak ada hasil untuk kata kunci "{searchTerm}".
                    </section>
                )}
            </div>
        </DashboardLayout>
    );
}
