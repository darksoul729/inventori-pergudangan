import { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Boxes, CheckCircle2, FileText, HelpCircle, ShieldCheck, Truck, Users2, Cpu, Smartphone, Cloud, Zap, Menu, X } from 'lucide-react';

const coreValues = [
    { icon: Cloud, label: 'Infrastruktur', value: 'Cloud SaaS' },
    { icon: Zap, label: 'Sinkronisasi', value: 'Data Real-time' },
    { icon: Cpu, label: 'Asisten AI', value: 'Kontekstual' },
    { icon: Smartphone, label: 'Aplikasi Driver', value: 'Siap Pakai' },
];

const modules = [
    {
        icon: Boxes,
        title: 'Manajemen Inventori & Rak',
        desc: 'Atur layout gudang, alokasi rak, stok masuk-keluar, dan stok fisik harian dalam alur yang mudah dipahami tim.',
    },
    {
        icon: Truck,
        title: 'Armada & Pengiriman',
        desc: 'Pantau status pengiriman, keterlambatan, dan tindak lanjut dari satu dashboard operasional.',
    },
    {
        icon: FileText,
        title: 'Pembelian & Pemasok',
        desc: 'Kelola pesanan beli, pemasok, penerimaan barang, dan dokumen pendukung agar proses pembelian lebih tertib.',
    },
    {
        icon: Cpu,
        title: 'Asisten AI Operasional',
        desc: 'AI bantu merangkum kondisi gudang, memberi konteks cepat, dan membantu tim ambil keputusan harian.',
    },
];

const plans = [
    { 
        name: 'Starter', 
        desc: 'Ideal untuk gudang berskala kecil.',
        price: 'Rp1.490.000', 
        period: '/tahun', 
        points: ['Manajemen Stok Dasar', 'Pencatatan Barang Masuk & Keluar', 'Laporan Operasional Standar', 'Maksimal 2 Pengguna'] 
    },
    { 
        name: 'Professional', 
        desc: 'Untuk operasional gudang terstruktur.',
        price: 'Rp7.990.000', 
        period: '/tahun', 
        points: ['Pemetaan Layout Rak Visual', 'Akses Penuh Petayu Driver App', 'Aether AI Assistant (Dasar)', 'Sistem Role (Manager, Staff, Supir)'] 
    },
    { 
        name: 'Enterprise', 
        desc: 'Kustomisasi untuk skala korporat.',
        price: 'Rp24.990.000', 
        period: '/tahun', 
        points: ['Semua Fitur Professional', 'Aether AI Analytics Lanjutan', 'Integrasi API Kustom (ERP)', 'Prioritas Dukungan Teknis 24/7'] 
    },
];

const onboardingSteps = [
    {
        step: '01',
        title: 'Daftar Akun Perusahaan',
        desc: 'Isi data PIC dan gudang utama untuk membuat workspace tenant yang terpisah.',
    },
    {
        step: '02',
        title: 'Pilih Modul Operasional',
        desc: 'Tentukan modul yang dipakai saat onboarding supaya alur sesuai kebutuhan gudang Anda.',
    },
    {
        step: '03',
        title: 'Trial atau Bayar Langsung',
        desc: 'Pilih Trial 3 hari dulu atau langsung aktifkan Paket Berbayar sesuai kebutuhan operasional.',
    },
];

const faqs = [
    {
        q: 'Apakah saya harus Trial dulu?',
        a: 'Tidak wajib. Saat daftar, Anda bisa pilih Trial 3 hari atau langsung Paket Berbayar.',
    },
    {
        q: 'Kapan pilih modul operasional?',
        a: 'Modul dipilih saat onboarding agar dashboard langsung sesuai alur gudang Anda.',
    },
    {
        q: 'Data tiap perusahaan tercampur atau terpisah?',
        a: 'Tiap akun perusahaan memakai tenant terpisah, jadi data operasional tidak tercampur.',
    },
    {
        q: 'Jika Trial habis, apakah bisa upgrade tanpa reset data?',
        a: 'Bisa. Anda cukup lanjut pembayaran paket, data dan histori tetap tersimpan.',
    },
];

const trustBadges = [
    'Invoice & riwayat pembayaran rapi',
    'Akses user berbasis role',
    'Data tenant antar perusahaan terpisah',
];

// CSS-based reveal hook using Intersection Observer
function useReveal() {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { el.classList.add('revealed'); observer.unobserve(el); } },
            { threshold: 0.1, rootMargin: '-50px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return ref;
}

function Reveal({ children, className = '', delay = 0 }) {
    const ref = useReveal();
    return (
        <div ref={ref} className={`reveal-fade-up ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
            {children}
        </div>
    );
}

export default function Welcome({ auth }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showStickyCta, setShowStickyCta] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setShowStickyCta(window.scrollY > 520);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-violet-200 selection:text-violet-900">
            <Head title="WMS untuk UMKM - Petayu">
                    <meta name="description" content="Petayu adalah Warehouse Management System (WMS) SaaS Indonesia untuk UMKM dan gudang menengah. Kelola stok, pengiriman, dan billing dalam satu platform." />
                    <link rel="canonical" href={window.location.origin} />
                    <meta property="og:title" content="Petayu - WMS SaaS Indonesia" />
                    <meta property="og:description" content="Satu sistem untuk stok, pengiriman, dan billing gudang Anda. Dibuat untuk UMKM sampai gudang menengah." />
                    <meta property="og:type" content="website" />
                    <meta property="og:image" content="/images/wms_3d_violet_transparent.png" />
                    <script type="application/ld+json">{JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "Petayu WMS",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Web",
                        "description": "Sistem Manajemen Pergudangan (WMS) berbasis Cloud dengan AI untuk UMKM Indonesia.",
                        "offers": { "@type": "Offer", "price": "1490000", "priceCurrency": "IDR" }
                    })}</script>
                </Head>

            {/* Fixed Header */}
            <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
                <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 lg:px-8">
                    {/* Logo */}
                    <div className="flex items-center gap-12">
                        <Link href="/" className="flex items-center gap-3 group">
                            <img src="/images/logo_petayu.png" className="h-8 w-8 object-contain transition-transform group-hover:scale-105" alt="Petayu Logo" />
                            <span className="text-xl font-extrabold tracking-tight text-slate-900">Petayu</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden items-center gap-8 lg:flex">
                            <a href="#keunggulan" className="text-sm font-semibold text-slate-600 hover:text-violet-700 transition-colors">Keunggulan</a>
                            <a href="#fitur" className="text-sm font-semibold text-slate-600 hover:text-violet-700 transition-colors">Modul Sistem</a>
                            <a href="#paket" className="text-sm font-semibold text-slate-600 hover:text-violet-700 transition-colors">Paket & Harga</a>
                        </nav>
                    </div>

                    {/* Auth Area (Desktop) */}
                    <div className="hidden items-center gap-6 lg:flex">
                        {auth?.user ? (
                            <Link 
                                href={route('dashboard')} 
                                className="rounded-full bg-violet-700 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-800 hover:shadow-md"
                            >
                                Menuju Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link 
                                    href={route('login')} 
                                    className="text-sm font-semibold text-slate-700 hover:text-violet-700 transition-colors"
                                >
                                    Masuk Ke Sistem
                                </Link>
                                <Link 
                                    href={route('register')} 
                                    className="rounded-full bg-violet-700 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-800 hover:shadow-md"
                                >
                                    Daftar & Pilih Paket
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex lg:hidden">
                        <button
                            type="button"
                            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-slate-700"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <span className="sr-only">Open main menu</span>
                            <Menu className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <div className="fixed inset-y-0 right-0 z-[60] w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm shadow-2xl">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-3">
                                <img src="/images/logo_petayu.png" className="h-8 w-8 object-contain" alt="Petayu Logo" />
                                <span className="text-xl font-extrabold tracking-tight text-slate-900">Petayu</span>
                            </Link>
                            <button
                                type="button"
                                className="-m-2.5 rounded-md p-2.5 text-slate-700"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="sr-only">Close menu</span>
                                <X className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="mt-8 flow-root">
                            <div className="-my-6 divide-y divide-slate-100">
                                <div className="space-y-2 py-6">
                                    <a href="#keunggulan" onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50">Keunggulan</a>
                                    <a href="#fitur" onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50">Modul Sistem</a>
                                    <a href="#paket" onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50">Paket & Harga</a>
                                </div>
                                <div className="py-6">
                                    {auth?.user ? (
                                        <Link 
                                            href={route('dashboard')} 
                                            className="-mx-3 block rounded-full px-3 py-3 text-base font-semibold leading-7 text-white bg-violet-700 text-center hover:bg-violet-800"
                                        >
                                            Menuju Dashboard
                                        </Link>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <Link 
                                                href={route('login')} 
                                                className="-mx-3 block rounded-lg px-3 py-2 text-center text-base font-semibold leading-7 text-slate-900 border border-slate-200 hover:bg-slate-50"
                                            >
                                                Masuk Ke Sistem
                                            </Link>
                                            <Link 
                                                href={route('register')} 
                                                className="-mx-3 block rounded-full px-3 py-3 text-base font-semibold leading-7 text-white bg-violet-700 text-center hover:bg-violet-800"
                                            >
                                                Daftar & Pilih Paket
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1">
                {/* Hero Section with Elegant SVG Wave */}
                <section className="relative overflow-hidden bg-white pt-32 lg:pt-40 pb-32 lg:pb-40">
                    <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
                            <div className="max-w-2xl lg:max-w-xl text-center lg:text-left mx-auto lg:mx-0">
                                <Reveal>
                                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
                                        <span className="inline-flex items-center rounded-full bg-violet-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-700 ring-1 ring-inset ring-violet-600/10">
                                            WMS SaaS Indonesia
                                        </span>
                                    </div>
                                </Reveal>
                                <Reveal delay={100}>
                                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl xl:text-6xl leading-[1.15]">
                                        Satu sistem untuk stok, pengiriman, dan billing <span className="text-violet-700 block mt-2">gudang Anda.</span>
                                    </h1>
                                </Reveal>
                                <Reveal delay={200}>
                                    <p className="mt-6 text-lg leading-relaxed text-slate-600">
                                        Dibuat untuk UMKM sampai gudang menengah: alur sederhana, modul jelas, dan siap dipakai tim operasional tanpa bikin bingung.
                                    </p>
                                </Reveal>
                                <Reveal delay={300}>
                                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                        <Link 
                                            href={route('register')} 
                                            className="w-full sm:w-auto rounded-full bg-violet-700 px-8 py-4 text-base font-bold text-white shadow-lg shadow-violet-700/30 hover:bg-violet-800 hover:shadow-violet-800/40 transition-all text-center"
                                        >
                                            Daftar Trial 3 Hari
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                                        >
                                            Masuk <ArrowRight className="h-5 w-5" />
                                        </Link>
                                    </div>
                                </Reveal>
                                <Reveal delay={400}>
                                    <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-5 text-sm font-medium text-slate-500">
                                        <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-violet-600" /> Pilih modul saat onboarding</span>
                                        <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-violet-600" /> Akun tenant terpisah per perusahaan</span>
                                    </div>
                                </Reveal>
                                <Reveal delay={500}>
                                    <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-2">
                                        {trustBadges.map((item) => (
                                            <span key={item} className="inline-flex items-center rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </Reveal>
                            </div>
                            
                            <Reveal delay={200} className="relative mx-auto w-full max-w-lg lg:max-w-none flex justify-center lg:justify-end mt-10 lg:mt-0">
                                <img 
                                    src="/images/wms_3d_violet_transparent.png" 
                                    alt="Ilustrasi 3D sistem manajemen gudang Petayu" 
                                    width={600}
                                    height={600}
                                    className="w-full object-contain max-w-[400px] sm:max-w-[500px] xl:max-w-[600px] drop-shadow-2xl animate-float relative z-10"
                                    fetchpriority="high"
                                />
                            </Reveal>
                        </div>
                    </div>

                    {/* Elegant Smooth Wave Transition to Keunggulan */}
                    <div className="absolute bottom-0 inset-x-0 pointer-events-none translate-y-[1px]">
                        <svg viewBox="0 0 1440 120" className="w-full h-[60px] md:h-[120px] fill-slate-50 block" preserveAspectRatio="none">
                            <path d="M0,60 C320,120 420,0 740,60 C1060,120 1120,0 1440,60 L1440,120 L0,120 Z"></path>
                        </svg>
                    </div>
                </section>

                <section className="py-14 bg-white border-t border-slate-100">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                            {onboardingSteps.map((item, idx) => (
                                <Reveal key={item.step} delay={idx * 100}>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                                        <p className="text-xs font-black tracking-[0.16em] text-violet-700">{item.step}</p>
                                        <h3 className="mt-2 text-lg font-bold text-slate-900">{item.title}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Core Capabilities / Values */}
                <section id="keunggulan" className="bg-slate-50 pb-16 lg:pb-24 relative z-20 pt-14 lg:pt-20">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:grid-cols-4">
                            {coreValues.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <Reveal key={item.label} delay={idx * 100}>
                                        <div className="flex flex-col items-center justify-center bg-white p-8 text-center border border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2rem] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 mb-5 ring-1 ring-violet-100">
                                                <Icon className="h-7 w-7" aria-hidden="true" />
                                            </div>
                                            <p className="text-xl font-bold text-slate-900">{item.value}</p>
                                            <p className="mt-2 text-sm font-medium text-slate-500">{item.label}</p>
                                        </div>
                                    </Reveal>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="fitur" className="py-24 lg:py-32 bg-white border-t border-slate-100">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <Reveal className="mx-auto max-w-2xl text-center">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-violet-700">Infrastruktur Terpusat</h2>
                            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                Alur Gudang yang Jelas, Bukan Ribet
                            </p>
                            <p className="mt-4 text-lg text-slate-600">
                                Setiap modul dibuat agar tim awam tetap cepat paham: input, pantau, tindak lanjut, selesai.
                            </p>
                        </Reveal>
                        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                            <div className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-2">
                                {modules.map((item, idx) => {
                                    const Icon = item.icon;
                                    return (
                                        <Reveal key={item.title} delay={idx * 100}>
                                            <div className="relative flex flex-col gap-6 rounded-[2rem] bg-slate-50 p-8 sm:p-10 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:bg-white group">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-md group-hover:scale-110 transition-transform duration-300">
                                                    <Icon className="h-7 w-7" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
                                                        {item.title}
                                                    </h3>
                                                    <p className="mt-3 text-base leading-relaxed text-slate-600">
                                                        {item.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        </Reveal>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="paket" className="py-24 lg:py-32 bg-slate-50 border-t border-slate-200">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <Reveal className="mx-auto max-w-2xl text-center">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-violet-700">Harga Terbuka</h2>
                            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                Paket Sesuai Skala Gudang
                            </p>
                            <p className="mt-4 text-lg text-slate-600">
                                Mulai dari Trial 3 hari, lalu lanjutkan Paket Berbayar sesuai kebutuhan modul dan jumlah tim.
                            </p>
                        </Reveal>
                        <div className="mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:max-w-5xl lg:grid-cols-3">
                            {plans.map((plan, idx) => (
                                <Reveal key={plan.name} delay={idx * 100}>
                                    <div className={`relative flex flex-col rounded-[2.5rem] p-8 xl:p-10 transition-all duration-300 h-full ${idx === 1 ? 'bg-gradient-to-b from-violet-900 to-slate-900 text-white shadow-2xl shadow-violet-900/40 ring-1 ring-white/10 lg:scale-105 z-10' : 'bg-white shadow-xl shadow-slate-200/40 ring-1 ring-slate-200 hover:-translate-y-1'}`}>
                                        {idx === 1 && (
                                            <div className="absolute -top-5 inset-x-0 flex justify-center">
                                                <span className="rounded-full bg-gradient-to-r from-violet-400 to-violet-600 px-5 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-violet-500/30 ring-1 ring-white/20">
                                                    Paling Populer
                                                </span>
                                            </div>
                                        )}
                                        <div className="mb-6">
                                            <h3 className={`text-2xl font-bold ${idx === 1 ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                                            <p className={`mt-2 text-sm leading-relaxed ${idx === 1 ? 'text-violet-200' : 'text-slate-500'}`}>{plan.desc}</p>
                                        </div>
                                        <div className="mb-8 flex items-baseline flex-wrap gap-x-1.5 gap-y-1">
                                            <span className={`text-lg font-bold ${idx === 1 ? 'text-violet-300' : 'text-slate-400'}`}>Rp</span>
                                            <span className={`text-3xl lg:text-4xl font-black tracking-tight ${idx === 1 ? 'text-white' : 'text-slate-900'}`}>{plan.price.replace('Rp', '')}</span>
                                            <span className={`text-sm font-semibold whitespace-nowrap ${idx === 1 ? 'text-violet-300' : 'text-slate-400'}`}>{plan.period}</span>
                                        </div>
                                        <div className={`h-px w-full mb-8 ${idx === 1 ? 'bg-white/10' : 'bg-slate-100'}`}></div>
                                        <ul role="list" className={`flex-1 space-y-5 text-sm leading-6 ${idx === 1 ? 'text-violet-100' : 'text-slate-600'}`}>
                                            {plan.points.map((p) => (
                                                <li key={p} className="flex gap-x-3 items-start">
                                                    <CheckCircle2 className={`h-6 w-6 shrink-0 ${idx === 1 ? 'text-violet-400' : 'text-violet-600'}`} aria-hidden="true" />
                                                    <span className="pt-0.5">{p}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <Link 
                                            href={route('register')} 
                                            className={`mt-10 block rounded-full px-4 py-4 text-center text-sm font-bold transition-all duration-300 ${idx === 1 ? 'bg-white text-violet-900 hover:bg-slate-50 shadow-xl shadow-white/10 hover:scale-[1.02]' : 'bg-violet-50 text-violet-700 hover:bg-violet-100 ring-1 ring-inset ring-violet-200/50'}`}
                                        >
                                            Pilih Paket {plan.name}
                                        </Link>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-24 lg:py-32 bg-white border-t border-slate-100">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <Reveal className="mx-auto max-w-2xl text-center">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-violet-700">FAQ</h2>
                            <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                Pertanyaan yang Sering Diajukan
                            </p>
                            <p className="mt-4 text-lg text-slate-600">
                                Hal-hal yang sering ditanyakan seputar pendaftaran dan alur kerja Petayu.
                            </p>
                        </Reveal>
                        <div className="mx-auto mt-16 grid max-w-xl grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-2">
                            {faqs.map((item, idx) => (
                                <Reveal key={item.q} delay={idx * 100}>
                                    <div className="relative flex gap-5 rounded-[2rem] bg-slate-50 p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:bg-white group">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-md group-hover:scale-110 transition-transform duration-300">
                                            <HelpCircle className="h-6 w-6" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-700 transition-colors">{item.q}</h3>
                                            <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.a}</p>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Solid CTA Section */}
                <section className="relative bg-violet-900 pb-20 pt-10 lg:pb-28">
                    {/* Smooth transition wave attached perfectly to the CTA */}
                    <div className="absolute bottom-full inset-x-0 w-full overflow-hidden leading-none mb-[-1px]">
                        <svg viewBox="0 0 1440 120" className="w-full h-[60px] md:h-[120px] fill-violet-900 block" preserveAspectRatio="none">
                            <path d="M0,60 C320,120 420,0 740,60 C1060,120 1120,0 1440,60 L1440,120 L0,120 Z"></path>
                        </svg>
                    </div>
                    <Reveal className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                        <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            Siap mulai dengan alur yang lebih rapi?
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-violet-200">
                            Daftar akun, pilih modul operasional, lalu tentukan Trial atau Paket Berbayar sesuai kebutuhan.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href={route('register')} className="w-full sm:w-auto rounded-full bg-white px-8 py-4 text-base font-bold text-violet-900 shadow-lg hover:bg-slate-50 transition-colors">
                                Buat Akun Operasional
                            </Link>
                            <Link href={route('login')} className="w-full sm:w-auto text-base font-semibold leading-6 text-white hover:text-violet-200 transition-colors py-4">
                                Masuk ke Portal <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </Reveal>
                </section>
            </main>

            {!auth?.user && showStickyCta && (
                <div className="fixed inset-x-0 bottom-4 z-[70] px-4">
                    <div className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-2xl border border-violet-200 bg-white/95 p-2 shadow-2xl backdrop-blur">
                        <Link
                            href={route('register')}
                            className="inline-flex flex-1 items-center justify-center rounded-xl bg-violet-700 px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-violet-800"
                        >
                            Daftar Trial 3 Hari
                        </Link>
                        <a
                            href="#paket"
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-50"
                        >
                            Lihat Paket
                        </a>
                    </div>
                </div>
            )}

            {/* Professional Footer */}
            <footer className="relative bg-slate-950 pt-16 pb-8">
                {/* Smooth wave connecting CTA to Footer */}
                <div className="absolute bottom-full inset-x-0 w-full overflow-hidden leading-none mb-[-1px]">
                    <svg viewBox="0 0 1440 120" className="w-full h-[40px] md:h-[80px] fill-slate-950 block" preserveAspectRatio="none">
                        <path d="M0,60 C320,120 420,0 740,60 C1060,120 1120,0 1440,60 L1440,120 L0,120 Z"></path>
                    </svg>
                </div>

                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                        <div className="space-y-6">
                            <Link href="/" className="flex items-center gap-3">
                                <img src="/images/logo_petayu.png" className="h-8 w-8 object-contain" alt="Petayu Logo" />
                                <span className="text-xl font-extrabold tracking-tight text-white">Petayu WMS</span>
                            </Link>
                            <p className="text-sm leading-6 text-slate-400 max-w-xs">
                                Sistem Peta Gudang berbasis Cloud dengan dukungan Kecerdasan Buatan (AI) terintegrasi untuk bisnis modern.
                            </p>
                        </div>
                        <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                            <div className="md:grid md:grid-cols-2 md:gap-8">
                                <div>
                                    <h3 className="text-sm font-bold text-white">Produk</h3>
                                    <ul role="list" className="mt-6 space-y-4 text-sm text-slate-400">
                                        <li><a href="#fitur" className="hover:text-white transition-colors">Manajemen Inventori</a></li>
                                        <li><a href="#fitur" className="hover:text-white transition-colors">Petayu Driver App</a></li>
                                        <li><a href="#fitur" className="hover:text-white transition-colors">Aether AI</a></li>
                                    </ul>
                                </div>
                                <div className="mt-10 md:mt-0">
                                    <h3 className="text-sm font-bold text-white">Sistem</h3>
                                    <ul role="list" className="mt-6 space-y-4 text-sm text-slate-400">
                                        <li><Link href={route('login')} className="hover:text-white transition-colors">Portal Login</Link></li>
                                        <li><Link href={route('register')} className="hover:text-white transition-colors">Daftar Akun Baru</Link></li>
                                        <li><a href="#paket" className="hover:text-white transition-colors">Paket & Harga</a></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="md:grid md:grid-cols-2 md:gap-8">
                                <div>
                                    <h3 className="text-sm font-bold text-white">Keamanan</h3>
                                    <ul role="list" className="mt-6 space-y-4 text-sm text-slate-400">
                                        <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-violet-500" /> Role-Based Access</li>
                                        <li className="flex items-center gap-2"><Users2 className="h-4 w-4 text-violet-500" /> Log Aktivitas</li>
                                        <li className="flex items-center gap-2"><Cloud className="h-4 w-4 text-violet-500" /> Cloud Backups</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-16 border-t border-slate-800 pt-8 sm:mt-20 lg:mt-24 text-center sm:text-left">
                        <p className="text-xs leading-5 text-slate-500">
                            &copy; {new Date().getFullYear()} Petayu, Inc. Hak Cipta Dilindungi Undang-Undang.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
