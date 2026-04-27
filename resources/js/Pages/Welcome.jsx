import { Head, Link } from '@inertiajs/react';
import { 
    Phone, Mail, MapPin, Clock, ArrowRight,
    Package, Boxes, BarChart3, ShieldCheck,
    Truck, Zap, Database, Smartphone, Users,
    CheckCircle2
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Social Icons ---
const Facebook = ({ size = 24, className }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const Twitter = ({ size = 24, className }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
const Linkedin = ({ size = 24, className }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
const Instagram = ({ size = 24, className }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;

// --- Animated Counter ---
function AnimatedCounter({ from = 0, to, duration = 2, suffix = "" }) {
    const nodeRef = useRef();
    const inView = useInView(nodeRef, { once: true, margin: "-100px 0px" });

    useEffect(() => {
        if (!inView) return;
        const node = nodeRef.current;
        const controls = animate(from, to, {
            duration: duration,
            ease: "easeOut",
            onUpdate(value) {
                if (node) node.textContent = Math.round(value) + suffix;
            },
        });
        return () => controls.stop();
    }, [from, to, inView, duration, suffix]);

    return <span ref={nodeRef}>{from}{suffix}</span>;
}

// --- Smooth Reveal Components ---
const FadeIn = ({ children, delay = 0, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
        className={className}
    >
        {children}
    </motion.div>
);

const StaggerContainer = ({ children, className = "" }) => (
    <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
            visible: { transition: { staggerChildren: 0.15 } },
            hidden: {}
        }}
        className={className}
    >
        {children}
    </motion.div>
);

const StaggerItem = ({ children, className = "" }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } }
        }}
        className={className}
    >
        {children}
    </motion.div>
);

function CleanHeroIllustration() {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full h-[350px] lg:h-[450px] flex items-center justify-center bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-50 rounded-tr-full" />
            
            <motion.img 
                animate={{ y: [-15, 15, -15] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                src="/images/logo_petayu.png" 
                alt="Petayu Hero" 
                className="w-1/2 md:w-3/4 max-w-[300px] h-auto object-contain relative z-10" 
            />
            
            <motion.div 
                animate={{ y: [15, -15, 15] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-8 left-8 p-3 bg-white rounded-2xl shadow-lg border border-slate-100"
            >
                <CheckCircle2 className="text-violet-600" size={24} />
            </motion.div>
            
            <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-12 right-12 p-3 bg-white rounded-2xl shadow-lg border border-slate-100"
            >
                <Database className="text-cyan-500" size={28} />
            </motion.div>
        </motion.div>
    );
}

export default function Welcome({ auth, stats }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            const sections = ['home', 'features', 'stats', 'solutions', 'contact'];
            const scrollPos = window.scrollY + 100;
            
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element && scrollPos >= element.offsetTop && scrollPos < element.offsetTop + element.offsetHeight) {
                    setActiveSection(section);
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { id: 'home', label: 'Beranda' },
        { id: 'features', label: 'Fitur' },
        { id: 'stats', label: 'Statistik' },
        { id: 'solutions', label: 'Solusi AI' },
        { id: 'contact', label: 'Kontak & Peta' },
    ];

    const MAP_CENTER = [-6.2088, 106.8456]; // Jakarta coordinates

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-violet-600 selection:text-white">
            <Head title="Petayu - Platform Gudang" />

            {/* --- TOP INFO BAR (Light Solid Mode) --- */}
            <div className="hidden bg-slate-100 border-b border-slate-200 py-2 text-xs text-slate-500 lg:block">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
                    <div className="flex gap-6">
                        <span className="flex items-center gap-2 hover:text-violet-600 font-medium transition-colors"><Phone size={14} /> +62 21 5555 0120</span>
                        <span className="flex items-center gap-2 hover:text-violet-600 font-medium transition-colors"><Mail size={14} /> info@petayu.id</span>
                    </div>
                    <div className="flex items-center gap-4 font-medium">
                        <a href="#contact" className="hover:text-violet-600 transition-colors">Pusat Bantuan</a>
                        <a href="#contact" className="hover:text-violet-600 transition-colors">Dokumentasi API</a>
                    </div>
                </div>
            </div>

            {/* --- NAVBAR --- */}
            <header 
                className={`sticky top-0 z-50 transition-all duration-300 ${
                    scrolled ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 py-4 shadow-sm' : 'bg-slate-50 border-transparent py-6'
                }`}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
                    <a href="#home" className="flex items-center gap-3">
                        <motion.img 
                            whileHover={{ scale: 1.05 }}
                            src="/images/logo_petayu.png" 
                            alt="Petayu Logo" 
                            className="h-10 w-auto" 
                        />
                        <span className="text-2xl font-black text-slate-900">
                            Petayu<span className="text-violet-600">.</span>
                        </span>
                    </a>

                    <nav className="hidden items-center gap-8 font-bold text-sm lg:flex text-slate-600">
                        {navLinks.map((link) => (
                            <a 
                                key={link.id}
                                href={`#${link.id}`} 
                                className={`relative py-2 transition-colors ${activeSection === link.id ? 'text-violet-600' : 'hover:text-violet-600'}`}
                            >
                                {link.label}
                                {activeSection === link.id && (
                                    <motion.div 
                                        layoutId="activeNav" 
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-full" 
                                    />
                                )}
                            </a>
                        ))}
                    </nav>

                    <div className="hidden lg:flex items-center gap-3 text-sm">
                        {auth.user ? (
                            <Link href={route('dashboard')}>
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="rounded-xl border-2 border-violet-600 bg-violet-600 px-6 py-2.5 font-bold text-white transition-all shadow-sm">
                                    Dashboard
                                </motion.button>
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="font-bold text-slate-600 py-2.5 px-4 rounded-xl border-2 border-transparent hover:text-violet-600 transition-colors">
                                    Log In
                                </Link>
                                <Link href={route('login')}>
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="rounded-xl border-2 border-violet-600 bg-violet-600 px-6 py-2.5 font-bold text-white transition-all shadow-sm">
                                        Minta Demo
                                    </motion.button>
                                </Link>
                            </>
                        )}
                    </div>

                    <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                        </svg>
                    </button>
                </div>

                {isMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="lg:hidden bg-white border-t border-slate-200 px-6 py-4 absolute w-full rounded-b-xl shadow-lg"
                    >
                        <nav className="flex flex-col gap-4 font-bold text-slate-600 text-sm">
                            {navLinks.map((link) => (
                                <a 
                                    key={link.id} 
                                    href={`#${link.id}`} 
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`${activeSection === link.id ? 'text-violet-600' : ''}`}
                                >
                                    {link.label}
                                </a>
                            ))}
                            <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-3">
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="rounded-xl bg-violet-600 border-2 border-violet-600 px-6 py-3 text-center text-white">Dashboard</Link>
                                ) : (
                                    <Link href={route('login')} className="rounded-xl bg-violet-600 border-2 border-violet-600 px-6 py-3 text-center text-white">Log In / Demo</Link>
                                )}
                            </div>
                        </nav>
                    </motion.div>
                )}
            </header>

            <main>
                {/* --- MURNI LIGHT HERO SECTION --- */}
                <section id="home" className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 bg-slate-50 overflow-hidden text-center lg:text-left">
                    <div className="mx-auto w-full max-w-7xl px-6 grid gap-12 lg:grid-cols-2 lg:gap-8 items-center relative z-10">
                        <div className="max-w-2xl mx-auto lg:mx-0">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white px-4 py-1.5 text-sm font-bold text-slate-600 mb-8 mx-auto lg:mx-0"
                            >
                                <div className="w-2 h-2 rounded-full bg-violet-600"></div>
                                Ekosistem Logistik Modern
                            </motion.div>
                            
                            <motion.h1 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.1 }}
                                className="text-5xl lg:text-6xl xl:text-7xl font-black leading-tight tracking-tight text-slate-900 mb-6"
                            >
                                Kontrol <span className="text-violet-600">Inventori</span><br/> Tanpa Batas.
                            </motion.h1>
                            
                            <motion.p 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.2 }}
                                className="text-lg text-slate-600 mb-10 leading-relaxed font-medium"
                            >
                                Petayu membangun pondasi yang kuat untuk distribusi barang. Alokasi rak otomatis, Proof of Delivery digital, hingga asisten AI pelaporan siap pakai.
                            </motion.p>
                            
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.3 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                            >
                                <motion.a 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    href="#features" 
                                    className="rounded-full bg-violet-600 px-8 py-4 font-bold text-white hover:bg-violet-700 border-2 border-violet-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20"
                                >
                                    Eksplorasi Fitur
                                    <ArrowRight size={18} />
                                </motion.a>
                                <motion.a 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    href="#contact" 
                                    className="rounded-full bg-white px-8 py-4 font-bold text-slate-700 hover:text-violet-600 hover:border-violet-300 border-2 border-slate-200 transition-colors flex items-center justify-center shadow-sm"
                                >
                                    Hubungi Kami
                                </motion.a>
                            </motion.div>
                        </div>

                        <div>
                            <CleanHeroIllustration />
                        </div>
                    </div>
                </section>

                {/* --- FEATURES (Light Style Grid) --- */}
                <section id="features" className="py-24 bg-white border-t border-slate-100">
                    <div className="mx-auto max-w-7xl px-6">
                        <FadeIn className="text-center max-w-3xl mx-auto mb-20">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-600 mb-3">Keunggulan Core</h2>
                            <h3 className="text-4xl font-black text-slate-900 tracking-tight">Setiap Modul Didesain Untuk Efisiensi</h3>
                        </FadeIn>

                        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { icon: <Boxes size={28}/>, title: "Alokasi Zona & Rak", desc: "Pemetaan hierarkis gudang, otomatisasi ruang kosong, dan limitasi stok secara sistematis." },
                                { icon: <Zap size={28}/>, title: "Catatan Cepat (Real-time)", desc: "Setiap barang masuk dan keluar tercermin pada sistem dalam hitungan presisi mili detik." },
                                { icon: <ShieldCheck size={28}/>, title: "Verifikasi Pengiriman", desc: "Bukti penerimaan digital aman yang dikirim seketika oleh Driver langsung dari lapangan." },
                                { icon: <BarChart3 size={28}/>, title: "Pelaporan Holistik", desc: "Ekspor tabel PDF harian, bulanan dengan diagram metrik tanpa komputasi manual." },
                                { icon: <Truck size={28}/>, title: "Pembelian & Suplai", desc: "Manajemen Purchase Order terintegrasi dengan daftar referensi supplier andal Anda." },
                                { icon: <Smartphone size={28}/>, title: "AI Terintegrasi", desc: "Petayu menavigasi pertanyaan, mengukur tren, dan memberikan wawasan cerdas bagi Anda." },
                            ].map((ft, i) => (
                                <StaggerItem key={i}>
                                    <div className="h-full p-8 rounded-3xl bg-slate-50 hover:bg-violet-50 hover:border-violet-200 border-2 border-transparent transition-colors group">
                                        <div className="mb-6 w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-500 group-hover:text-violet-600 group-hover:border-violet-200 transition-colors">
                                            {ft.icon}
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900 mb-3">{ft.title}</h4>
                                        <p className="text-slate-600 text-sm leading-relaxed">{ft.desc}</p>
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </div>
                </section>

                {/* --- STATS SECTION (SOLID LIGHT / SLATE) --- */}
                <section id="stats" className="py-24 bg-slate-100 border-y border-slate-200">
                    <div className="mx-auto max-w-7xl px-6">
                        <FadeIn className="text-center mb-16">
                            <h2 className="text-3xl font-black text-slate-900">Performa Nyata Petayu</h2>
                        </FadeIn>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { val: stats?.transactions || 0, label: "Total Transaksi Lintas Gudang" },
                                { val: stats?.products || 0, label: "Produk Master Tersedia" },
                                { val: stats?.accuracy || 99, label: "Akurasi Distribusi Server", suffix: "%" },
                                { val: 24, label: "Aksesibilitas Uptime", suffix: "/7" },
                            ].map((stat, i) => (
                                <FadeIn key={i} delay={i * 0.1}>
                                    <div className="flex flex-col items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                        <span className="text-5xl font-black text-cyan-600 mb-3">
                                            <AnimatedCounter from={0} to={stat.val} suffix={stat.suffix} />
                                        </span>
                                        <span className="text-sm font-bold text-slate-500 text-center">{stat.label}</span>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- AI SOLUTIONS (Clean Version) --- */}
                <section id="solutions" className="py-24 bg-white">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <FadeIn>
                                <h2 className="text-sm font-bold uppercase tracking-widest text-violet-600 mb-3">Kecerdasan Buatan</h2>
                                <h3 className="text-4xl font-black text-slate-900 mb-6 leading-tight">Berbincang dengan Gudang Anda.</h3>
                                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                    Mengetahui posisi barang atau menganalisis tren distribusi kini semudah mengirim pesan teks. Sistem cerdas Petayu dirancang memproses pertanyaan logistik kompleks menjadi jawaban operasional instan.
                                </p>
                                
                                <ul className="space-y-4 font-bold text-slate-700">
                                    <li className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600"><CheckCircle2 size={12}/></div>
                                        Rekomendasi Kapasitas Rak Otomatis
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600"><CheckCircle2 size={12}/></div>
                                        Analisa Anomali Pergerakan Barang
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600"><CheckCircle2 size={12}/></div>
                                        Visualisasi Data Intuitif
                                    </li>
                                </ul>
                            </FadeIn>
                            
                            <FadeIn delay={0.2}>
                                {/* Chat UI Mockup Bright */}
                                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xl">
                                    <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center">
                                            <span className="text-white font-black text-xs">AI</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 leading-none mb-1">Petayu Assistant</p>
                                            <p className="text-xs text-emerald-500 font-bold">Online</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 border border-slate-300" />
                                            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 text-sm text-slate-700 shadow-sm leading-relaxed">
                                                Tolong periksa tren status pergerakan produk Kategori A minggu ini.
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-4 items-start flex-row-reverse">
                                            <div className="w-8 h-8 rounded-full bg-violet-600 shrink-0 shadow-sm flex items-center justify-center text-white font-black text-[10px]">AI</div>
                                            <div className="bg-violet-600 text-white rounded-2xl rounded-tr-none p-4 text-sm shadow-md leading-relaxed">
                                                Terdeteksi lonjakan aktivitas logistik <span className="font-black text-cyan-300">40%</span>. Saya menyarankan restock segera atau relokasi inventori dari Gudang Utara untuk mencegah terjadinya <span className="font-bold underline">stockout</span> besok lusa.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </div>
                </section>

                {/* --- CONTACT & MAP SECTIONS (Left Form, Right Map) --- */}
                <section id="contact" className="py-24 bg-slate-50 border-t border-slate-200">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="mb-12">
                            <h2 className="text-center text-4xl font-black text-slate-900 mb-4">Hubungi Ekspor Logistik</h2>
                            <p className="text-center text-slate-600 font-medium max-w-2xl mx-auto">Kami siap diundang berdiskusi atau melakukan demonstrasi teknis untuk menjawab tantangan tata kelola pergudangan perusahaan Anda.</p>
                        </div>
                        
                        <div className="grid lg:grid-cols-2 bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
                            {/* Form Box */}
                            <div className="p-8 md:p-12">
                                <h3 className="text-2xl font-black text-slate-900 mb-6">Kirim Pesan</h3>
                                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Nama Lengkap</label>
                                            <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-violet-600 outline-none transition-colors" placeholder="Fulan Pulan" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Perusahaan</label>
                                            <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-violet-600 outline-none transition-colors" placeholder="PT Laju Maju" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Email Utama</label>
                                        <input type="email" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-violet-600 outline-none transition-colors" placeholder="email@perusahaan.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Persoalan / Kebutuhan Demo</label>
                                        <textarea rows="4" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-violet-600 outline-none transition-colors" placeholder="Bisa detailkan apa kesulitan sistem Gudang Anda saat ini..."></textarea>
                                    </div>
                                    <button className="w-full bg-violet-600 hover:bg-violet-700 border-2 border-violet-600 text-white font-bold py-4 rounded-xl shadow-md transition-colors">
                                        Kirim Segera
                                    </button>
                                </form>
                            </div>
                            
                            {/* Maps Box */}
                            <div className="bg-slate-200 relative min-h-[400px]">
                                <MapContainer center={MAP_CENTER} zoom={13} scrollWheelZoom={false} className="w-full h-full absolute inset-0 z-10">
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                                    <Marker position={MAP_CENTER}>
                                        <Popup className="font-bold">
                                            Kantor Pusat Petayu <br/> Jakarta, Indonesia.
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                                
                                {/* Info Box Over Map */}
                                <div className="absolute top-6 right-6 z-[1000] bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl w-64 border border-slate-100">
                                    <div className="mb-4">
                                        <h4 className="font-black text-slate-900 mb-1">Jakarta Office</h4>
                                        <p className="text-xs text-slate-500 font-medium">Jl. Jenderal Sudirman No.Kav 10-11, Jakarta Pusat, 10220</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm font-bold text-violet-600">
                                            <div className="bg-violet-50 p-2 rounded-lg">
                                                <Phone size={14}/>
                                            </div>
                                            +62 21 5555 0120
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold text-violet-600">
                                            <div className="bg-violet-50 p-2 rounded-lg">
                                                <Mail size={14}/>
                                            </div>
                                            info@petayu.id
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* --- LIGHT FOOTER --- */}
            <footer className="bg-white pt-20 pb-10 text-slate-600">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        <div className="lg:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <img src="/images/logo_petayu.png" alt="Logo" className="h-8 w-auto" />
                                <span className="text-2xl font-black text-slate-900">Petayu<span className="text-violet-600">.</span></span>
                            </div>
                            <p className="mb-6 text-sm leading-relaxed font-medium">Sistem manajemen pergudangan era baru. Mengkombinasikan fungsionalitas dan pelaporan WMS konvensional dengan kelincahan presisi digital masa kini.</p>
                            <div className="flex gap-3">
                                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center hover:border-violet-600 hover:text-violet-600 transition-colors"><Facebook size={18}/></a>
                                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center hover:border-violet-600 hover:text-violet-600 transition-colors"><Twitter size={18}/></a>
                                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center hover:border-violet-600 hover:text-violet-600 transition-colors"><Linkedin size={18}/></a>
                                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center hover:border-violet-600 hover:text-violet-600 transition-colors"><Instagram size={18}/></a>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="text-slate-900 font-bold mb-6">Sistem Kami</h4>
                            <ul className="space-y-3 text-sm font-semibold text-slate-500">
                                <li><a href="#features" className="hover:text-violet-600 transition-colors">Core Inventory</a></li>
                                <li><a href="#solutions" className="hover:text-violet-600 transition-colors">Petayu Analytics</a></li>
                                <li><a href="#features" className="hover:text-violet-600 transition-colors">App Driver & Kurir</a></li>
                                <li><a href="#stats" className="hover:text-violet-600 transition-colors">Laporan Otomatis</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="text-slate-900 font-bold mb-6">Korporat</h4>
                            <ul className="space-y-3 text-sm font-semibold text-slate-500">
                                <li><a href="#home" className="hover:text-violet-600 transition-colors">Tentang Tim</a></li>
                                <li><a href="#contact" className="hover:text-violet-600 transition-colors">Harga & Layanan</a></li>
                                <li><a href="#contact" className="hover:text-violet-600 transition-colors">Pusat Karir</a></li>
                                <li><a href="#contact" className="hover:text-violet-600 transition-colors">Kontak Langsung</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="text-slate-900 font-bold mb-6">Dapatkan Akses Rilis Baru</h4>
                            <p className="text-sm mb-4 font-semibold text-slate-500">Jangan lewatkan informasi seputar pembaruan API mingguan kami.</p>
                            <form className="flex" onSubmit={e => e.preventDefault()}>
                                <input type="email" placeholder="Email.." className="w-full bg-slate-50 border-2 border-slate-200 border-r-0 rounded-l-xl px-4 py-3 text-sm focus:border-violet-600 outline-none transition-colors" />
                                <button className="bg-violet-600 text-white px-5 py-3 font-bold rounded-r-xl border-2 border-violet-600 hover:bg-violet-700 transition-colors">Daftar</button>
                            </form>
                        </div>
                    </div>
                    
                    <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-sm font-bold text-slate-400">
                        <p>© 2026 Hak Cipta Dilindungi Petayu Indonesia.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <a href="#contact" className="hover:text-violet-600 transition-colors">Kebijakan Privasi</a>
                            <a href="#contact" className="hover:text-violet-600 transition-colors">Syarat Penggunaan</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
