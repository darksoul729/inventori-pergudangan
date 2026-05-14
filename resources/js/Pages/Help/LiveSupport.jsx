import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    FileText,
    ShieldCheck,
} from 'lucide-react';

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
        title: 'Pesanan beli atau pemasok',
        detail: 'Cek status purchase order, detail supplier, histori kirim email PO, dan catatan performa pemasok.',
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


const quickChecks = [
    'Refresh halaman setelah submit data.',
    'Pastikan koneksi internet stabil.',
    'Pastikan role akun sesuai tugas yang dikerjakan.',
    'Cek apakah dokumen yang butuh approval sudah disetujui Supervisor/Manager.',
    'Untuk shipment, pastikan stok tersedia di rack dan tidak seluruhnya ter-reservasi.',
    'Untuk driver, pastikan tidak ada shipment aktif sebelum status ditahan/nonaktifkan.',
    'Gunakan pencarian atau filter tanggal sebelum menyimpulkan data hilang.',
];

const contactByRole = {
    staff: {
        label: 'Supervisor Gudang',
        detail: 'Staff Operasional menangani input harian (PO, transfer rak, stock opname, outbound). Untuk approval/reject dokumen, eskalasi ke Supervisor Gudang.',
    },
    supervisor: {
        label: 'Manager Gudang',
        detail: 'Supervisor Gudang menangani approval harian. Eskalasi ke Manager Gudang untuk keputusan lintas shift, data master, dan kebijakan operasional.',
    },
    manager: {
        label: 'PETAYU AI dan Panduan Sistem',
        detail: 'Manager Gudang dapat menggunakan PETAYU AI untuk analisis cepat, lalu validasi SOP lewat dokumentasi sebelum eksekusi keputusan.',
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
    const categoriesSectionRef = useRef(null);
    const quickChecksSectionRef = useRef(null);

    const filteredIssueCategories = useMemo(() => {
        if (!normalizedQuery) return issueCategories;
        return issueCategories.filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(normalizedQuery));
    }, [normalizedQuery]);

    const filteredQuickChecks = useMemo(() => {
        if (!normalizedQuery) return quickChecks;
        return quickChecks.filter((item) => item.toLowerCase().includes(normalizedQuery));
    }, [normalizedQuery]);

    useEffect(() => {
        if (!normalizedQuery) return;
        if (filteredIssueCategories.length > 0) {
            categoriesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        if (filteredQuickChecks.length > 0) {
            quickChecksSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [
        filteredIssueCategories.length,
        filteredQuickChecks.length,
        normalizedQuery,
    ]);

    return (
        <DashboardLayout
            headerTitle="Bantuan Cepat"
            contentClassName="max-w-[1280px] mx-auto"
            searchValue={searchTerm}
            onSearch={setSearchTerm}
        >
            <Head title="Bantuan Cepat" />

            <div className="pb-16">
                <section className="pt-4 pb-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#4722B3]">Pusat Bantuan</p>
                            <h1 className="mt-3 text-[34px] font-black tracking-tight text-[#111827]">Bantuan Cepat Operasional</h1>
                            <p className="mt-3 max-w-3xl text-[14px] font-semibold leading-7 text-gray-500">
                                Halaman bantuan singkat untuk UMKM dan tim gudang: pilih kendala, lakukan cek cepat, lalu eskalasi ke PIC yang tepat.
                            </p>
                        </div>
                        <Link
                            href="/help/documentation"
                            className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#4722B3] px-5 py-3 text-[12px] font-black uppercase tracking-wider text-white shadow-lg shadow-indigo-100 transition-all hover:bg-[#28239d]"
                        >
                            Panduan Sistem
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>

                <section className="mb-8 rounded-[8px] border border-indigo-100 bg-[#f4f3ff] p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#4722B3]">Jalur Kontak Disarankan</p>
                            <h2 className="mt-2 text-[22px] font-black text-gray-900">{recommendedContact.label}</h2>
                            <p className="mt-2 max-w-4xl text-[13px] font-bold leading-6 text-gray-600">{recommendedContact.detail}</p>
                        </div>
                        <div className="rounded-[8px] bg-white px-4 py-3 text-[12px] font-black uppercase tracking-wider text-[#4722B3] shadow-sm">
                            Peran Saat Ini: {formatRoleLabel(currentRole)}
                        </div>
                    </div>
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
                                <Link key={issue.title} href={issue.route} className="group rounded-[8px] border border-gray-100 bg-[#EFE9FF] p-4 transition-all hover:border-indigo-100 hover:bg-white hover:shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-[14px] font-black text-gray-900 group-hover:text-[#4722B3]">{issue.title}</h3>
                                        <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-300 group-hover:text-[#4722B3]" />
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
                                <div key={item} className="flex gap-3 rounded-[8px] bg-[#EFE9FF] p-4 text-[13px] font-bold leading-6 text-gray-600">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="rounded-[8px] border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-indigo-50 text-[#4722B3]">
                            <FileText className="h-5 w-5" />
                        </div>
                        <h2 className="text-[18px] font-black text-gray-900">Format Laporan Kendala (Singkat)</h2>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-[8px] border border-gray-100 bg-[#EFE9FF] p-4 text-[13px] font-bold text-gray-700">Menu + nomor dokumen terkait</div>
                        <div className="rounded-[8px] border border-gray-100 bg-[#EFE9FF] p-4 text-[13px] font-bold text-gray-700">Masalah yang muncul + screenshot</div>
                        <div className="rounded-[8px] border border-gray-100 bg-[#EFE9FF] p-4 text-[13px] font-bold text-gray-700">Waktu kejadian + nama akun</div>
                        <div className="rounded-[8px] border border-gray-100 bg-[#EFE9FF] p-4 text-[13px] font-bold text-gray-700">Langkah yang sudah dicoba</div>
                    </div>
                </section>
                {normalizedQuery &&
                    filteredIssueCategories.length === 0 &&
                    filteredQuickChecks.length === 0 && (
                    <section className="mt-6 rounded-[8px] border border-slate-200 bg-white p-6 text-center text-[13px] font-bold text-slate-500">
                        Tidak ada hasil untuk kata kunci "{searchTerm}".
                    </section>
                )}
            </div>
        </DashboardLayout>
    );
}
