import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowRight,
    BarChart3,
    Boxes,
    ClipboardCheck,
    FileText,
    Home,
    PackageCheck,
    Settings,
    ShoppingCart,
    Sparkles,
    Truck,
    Users,
} from 'lucide-react';

const modules = [
    {
        title: 'Dasbor Operasional',
        href: '/dashboard',
        icon: BarChart3,
        access: 'Manager, Supervisor, Staff',
        summary: 'Pantau total stok, laju barang keluar, utilisasi rak, alert sistem, tren inbound dan outbound.',
        steps: [
            'Gunakan kartu KPI untuk membaca kondisi gudang secara cepat.',
            'Cek visualisasi rak untuk melihat kapasitas, rak kosong, dan rak hampir penuh.',
            'Buka dokumen terbaru untuk menelusuri bukti transaksi yang membentuk angka dasbor.',
        ],
    },
    {
        title: 'PETAYU AI',
        href: '/petayu-ai',
        icon: Sparkles,
        access: 'Semua role terautentikasi',
        summary: 'Asisten analitik untuk bertanya kondisi stok, ringkasan operasional, dan rekomendasi berbasis data sistem.',
        steps: [
            'Mulai percakapan baru dari halaman PETAYU AI.',
            'Tanyakan ringkasan stok, pergerakan barang, atau status operasional.',
            'Gunakan jawaban sebagai bahan analisis awal sebelum mengambil tindakan di modul terkait.',
        ],
    },
    {
        title: 'Manajemen Gudang',
        href: '/warehouse',
        icon: Home,
        access: 'Manager, Supervisor',
        summary: 'Kelola zona, rak, kapasitas, layout gudang, serta penempatan stok di lokasi gudang.',
        steps: [
            'Manager mengatur zona dan master rak.',
            'Gunakan editor layout untuk sketch, rotate, simpan draft, dan ekspor PDF layout.',
            'Manager atau Supervisor menempatkan stok ke rak yang sesuai.',
            'Staff memakai informasi rak untuk mencari lokasi barang saat transaksi.',
        ],
    },
    {
        title: 'Transfer Rack',
        href: '/rack-allocation',
        icon: PackageCheck,
        access: 'Manager, Supervisor',
        summary: 'Pindahkan stok antar rak dan simpan bukti perpindahan untuk audit internal.',
        steps: [
            'Pilih produk, rak asal, rak tujuan, dan jumlah yang dipindahkan.',
            'Pastikan kapasitas rak tujuan masih mencukupi.',
            'Cetak atau buka detail transfer sebagai bukti perpindahan.',
        ],
    },
    {
        title: 'Stock Opname',
        href: '/stock-opname',
        icon: ClipboardCheck,
        access: 'Manager, Supervisor',
        summary: 'Cocokkan stok sistem dengan stok fisik, lalu hasilkan koreksi bila ada selisih.',
        steps: [
            'Buat sesi opname berdasarkan area atau kebutuhan audit.',
            'Masukkan stok fisik yang ditemukan di lapangan.',
            'Tinjau selisih dan gunakan dokumen detail sebagai dasar koreksi stok.',
        ],
    },
    {
        title: 'Inventaris',
        href: '/inventory',
        icon: Boxes,
        access: 'Manager, Supervisor, Staff',
        summary: 'Lihat daftar produk, stok tersedia, batas minimum, stok maksimum otomatis, kategori, satuan, dan detail pergerakan.',
        steps: [
            'Cari produk berdasarkan nama atau kode.',
            'Buka detail produk untuk melihat stok, histori pergerakan, dan distribusi rak.',
            'Stok maksimum dihitung otomatis dari total kapasitas rak yang terhubung ke produk.',
            'Manager Gudang dapat menambah, mengubah, dan hapus paksa produk (dengan validasi relasi transaksi).',
        ],
    },
    {
        title: 'Pesanan Pembelian',
        href: '/purchase-orders',
        icon: ShoppingCart,
        access: 'Manager, Supervisor, Staff',
        summary: 'Pantau PO, pemasok, status pemesanan, dan proses barang masuk dari pembelian.',
        steps: [
            'Manager atau Supervisor membuat PO baru saat stok perlu dipenuhi.',
            'Perbarui status PO sesuai progres pengadaan.',
            'Gunakan detail PO untuk menelusuri produk, pemasok, dan dokumen terkait.',
        ],
    },
    {
        title: 'Pemasok',
        href: '/supplier',
        icon: Users,
        access: 'Manager, Supervisor, Staff',
        summary: 'Kelola data supplier dan catatan performa pemasok untuk evaluasi pembelian.',
        steps: [
            'Manager menambah data pemasok baru.',
            'Supervisor mencatat performa pemasok berdasarkan pengiriman dan kualitas.',
            'Gunakan detail supplier untuk membaca histori transaksi dan evaluasi.',
        ],
    },
    {
        title: 'Transaksi',
        href: '/transaction',
        icon: FileText,
        access: 'Manager, Supervisor, Staff',
        summary: 'Lihat transaksi masuk, keluar, adjustment, opname, dan dokumen pergerakan stok.',
        steps: [
            'Filter transaksi berdasarkan tipe, tanggal, atau status.',
            'Buka detail untuk melihat nomor dokumen, pihak terkait, dan item.',
            'Manager atau Supervisor dapat melakukan verifikasi transaksi bila diperlukan.',
        ],
    },
    {
        title: 'Dokumen WMS',
        href: '/wms-documents',
        icon: FileText,
        access: 'Manager, Supervisor',
        summary: 'Kumpulan dokumen operasional gudang untuk ekspor dan arsip.',
        steps: [
            'Gunakan halaman ini untuk melihat dokumen masuk, keluar, opname, dan adjustment.',
            'Ekspor data saat diperlukan untuk laporan operasional.',
            'Pastikan dokumen sudah terverifikasi sebelum dipakai sebagai arsip final.',
        ],
    },
    {
        title: 'Pengiriman',
        href: '/shipments',
        icon: Truck,
        access: 'Manager, Supervisor, Staff',
        summary: 'Pantau pengiriman, status delivery, bukti POD, validasi stok rak, dan posisi operasional pengiriman.',
        steps: [
            'Buat pengiriman dari data pesanan atau kebutuhan distribusi.',
            'Sistem membaca ketersediaan stok per rak sebelum pengiriman diproses.',
            'Perbarui status sesuai proses pengiriman.',
            'Verifikasi proof of delivery sebelum pengiriman dinyatakan selesai.',
        ],
    },
    {
        title: 'Manajemen Driver',
        href: '/drivers',
        icon: Truck,
        access: 'Manager',
        summary: 'Kelola driver, status aktif/nonaktif (tahan), serta koordinat GPS untuk kebutuhan tracking.',
        steps: [
            'Manager menambah atau mengubah data driver.',
            'Aktifkan driver yang siap menerima tugas pengiriman, atau nonaktifkan sementara bila diperlukan.',
            'Sebelum menonaktifkan driver, cek dulu apakah masih punya shipment aktif.',
            'Gunakan data lokasi untuk memantau driver yang sedang bertugas.',
        ],
    },
    {
        title: 'Laporan',
        href: '/reports',
        icon: BarChart3,
        access: 'Manager, Supervisor',
        summary: 'Buat laporan stok, transaksi, performa gudang, dan ekspor data analitik.',
        steps: [
            'Pilih sumber data laporan yang ingin dianalisis.',
            'Gunakan visualisasi untuk membaca tren dan komposisi.',
            'Generate atau unduh laporan saat data sudah sesuai kebutuhan.',
        ],
    },
    {
        title: 'Pengaturan',
        href: '/settings',
        icon: Settings,
        access: 'Manager',
        summary: 'Atur profil gudang, kategori, satuan, serta akun operasional dengan layout panel konfigurasi terbaru.',
        steps: [
            'Lengkapi identitas dan lokasi gudang.',
            'Kelola kategori dan satuan agar master produk konsisten.',
            'Tambah dan kelola akun staff sesuai kebutuhan operasional.',
        ],
    },
];

const flowSteps = [
    'Manager menyiapkan master gudang, kategori, satuan, produk, supplier, dan driver.',
    'Supervisor atau Manager membuat PO, menerima barang, melakukan transfer rack, dan menjalankan stock opname.',
    'Staff menjalankan transaksi keluar dan membantu pengiriman berdasarkan data stok per rak.',
    'Supervisor memverifikasi transaksi, POD, opname, dan adjustment.',
    'Manager membaca dasbor dan laporan untuk mengambil keputusan operasional.',
];

export default function Documentation() {
    const [searchTerm, setSearchTerm] = useState('');
    const normalizedQuery = searchTerm.trim().toLowerCase();
    const flowSectionRef = useRef(null);
    const modulesSectionRef = useRef(null);

    const filteredModules = useMemo(() => {
        if (!normalizedQuery) return modules;
        return modules.filter((item) => {
            const haystack = `${item.title} ${item.summary} ${item.access} ${(item.steps || []).join(' ')}`.toLowerCase();
            return haystack.includes(normalizedQuery);
        });
    }, [normalizedQuery]);

    const filteredFlowSteps = useMemo(() => {
        if (!normalizedQuery) return flowSteps;
        return flowSteps.filter((step) => step.toLowerCase().includes(normalizedQuery));
    }, [normalizedQuery]);

    useEffect(() => {
        if (!normalizedQuery) return;
        if (filteredFlowSteps.length > 0) {
            flowSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        if (filteredModules.length > 0) {
            modulesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [filteredFlowSteps.length, filteredModules.length, normalizedQuery]);

    return (
        <DashboardLayout
            headerTitle="Dokumentasi Sistem"
            contentClassName="max-w-[1280px] mx-auto"
            searchValue={searchTerm}
            onSearch={setSearchTerm}
        >
            <Head title="Dokumentasi Sistem" />

            <div className="pb-16">
                <section className="pt-4 pb-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#28106F]">Pusat Bantuan</p>
                            <h1 className="mt-3 text-[34px] font-black tracking-tight text-[#111827]">Dokumentasi Inventori Pergudangan</h1>
                            <p className="mt-3 max-w-3xl text-[14px] font-semibold leading-7 text-gray-500">
                                Panduan ringkas untuk setiap menu di sistem WMS ini, termasuk fungsi utama, hak akses, dan langkah kerja yang dipakai dalam operasional gudang.
                            </p>
                        </div>
                        <Link
                            href="/help/live-support"
                            className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#28106F] px-5 py-3 text-[12px] font-black uppercase tracking-wider text-white shadow-lg shadow-indigo-100 transition-all hover:bg-[#28239d]"
                        >
                            Bantuan Langsung
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>

                <section ref={flowSectionRef} id="alur-kerja" className="mb-8 rounded-[8px] border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[8px] bg-indigo-50 text-[#28106F]">
                            <PackageCheck className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-[18px] font-black text-gray-900">Alur Kerja Utama</h2>
                            <div className="mt-4 grid gap-3 md:grid-cols-5">
                                {filteredFlowSteps.map((step, index) => (
                                    <div key={step} className="rounded-[8px] border border-gray-100 bg-[#F8F7FF] p-4">
                                        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[8px] bg-white text-[12px] font-black text-[#28106F] shadow-sm">
                                            {index + 1}
                                        </div>
                                        <p className="text-[12px] font-bold leading-6 text-gray-600">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section ref={modulesSectionRef} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredModules.map((item) => {
                        const Icon = item.icon;

                        return (
                            <article key={item.title} className="rounded-[8px] border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[8px] bg-[#f4f3ff] text-[#28106F]">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <span className="rounded-full bg-gray-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
                                        {item.access}
                                    </span>
                                </div>
                                <h3 className="text-[17px] font-black text-gray-900">{item.title}</h3>
                                <p className="mt-2 text-[13px] font-semibold leading-6 text-gray-500">{item.summary}</p>
                                <div className="mt-5 space-y-2">
                                    {item.steps.map((step) => (
                                        <div key={step} className="flex gap-2 text-[12px] font-bold leading-6 text-gray-600">
                                            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#28106F]" />
                                            <span>{step}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link href={item.href} className="mt-5 inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-wider text-[#28106F] hover:text-[#28239d]">
                                    Buka Menu
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </article>
                        );
                    })}
                </section>
                {normalizedQuery && filteredModules.length === 0 && filteredFlowSteps.length === 0 && (
                    <section className="mt-6 rounded-[8px] border border-slate-200 bg-white p-6 text-center text-[13px] font-bold text-slate-500">
                        Tidak ada hasil untuk kata kunci "{searchTerm}".
                    </section>
                )}
            </div>
        </DashboardLayout>
    );
}
