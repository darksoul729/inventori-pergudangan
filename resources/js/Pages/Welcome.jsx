import { Head, Link } from '@inertiajs/react';
import { 
    Phone, Mail, MapPin, Clock, ArrowRight,
    Package, Boxes, BarChart3, ShieldCheck
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const Facebook = ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const Twitter = ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);
const Linkedin = ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);
const Instagram = ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const Youtube = ({ size = 24, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
);

/* ── ScrollReveal: fade-in + slide-up on viewport entry ── */
function ScrollReveal({ children, className = '', delay = 0, direction = 'up' }) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const dirClass = direction === 'up' ? 'translate-y-10' : direction === 'left' ? '-translate-x-10' : 'translate-x-10';

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0 translate-x-0' : `opacity-0 ${dirClass}`} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

/* ── AnimatedCounter: counts up when scrolled into view ── */
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    const startTime = performance.now();
                    const animate = (currentTime) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                        setCount(Math.floor(eased * target));
                        if (progress < 1) requestAnimationFrame(animate);
                    };
                    requestAnimationFrame(animate);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.3 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [target, duration]);

    return <span ref={ref}>{count}{suffix}</span>;
}

/* ── WarehouseIllustration: custom SVG for hero section ── */
function WarehouseIllustration() {
    return (
        <svg viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-lg drop-shadow-2xl">
            {/* Background glow */}
            <circle cx="240" cy="180" r="160" fill="url(#heroGlow)" opacity="0.3" />

            {/* Warehouse building */}
            <rect x="60" y="100" width="360" height="200" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            {/* Roof */}
            <path d="M40 100 L240 30 L440 100" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeLinejoin="round" />
            <path d="M40 100 L240 30 L440 100 L440 100" fill="rgba(255,255,255,0.03)" />

            {/* Large door */}
            <rect x="180" y="180" width="120" height="120" rx="6" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <line x1="240" y1="180" x2="240" y2="300" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <circle cx="230" cy="240" r="3" fill="rgba(255,255,255,0.2)" />
            <circle cx="250" cy="240" r="3" fill="rgba(255,255,255,0.2)" />

            {/* Left shelves */}
            <rect x="80" y="130" width="85" height="6" rx="2" fill="rgba(255,255,255,0.15)" />
            <rect x="80" y="165" width="85" height="6" rx="2" fill="rgba(255,255,255,0.15)" />
            <rect x="80" y="200" width="85" height="6" rx="2" fill="rgba(255,255,255,0.15)" />
            {/* Boxes on left shelves */}
            <rect x="85" y="115" width="22" height="15" rx="3" fill="#06b6d4" opacity="0.5" />
            <rect x="112" y="118" width="18" height="12" rx="3" fill="#8b5cf6" opacity="0.5" />
            <rect x="135" y="112" width="25" height="18" rx="3" fill="#06b6d4" opacity="0.35" />
            <rect x="85" y="150" width="28" height="15" rx="3" fill="#8b5cf6" opacity="0.5" />
            <rect x="118" y="153" width="20" height="12" rx="3" fill="#06b6d4" opacity="0.5" />
            <rect x="85" y="185" width="18" height="15" rx="3" fill="#06b6d4" opacity="0.4" />
            <rect x="108" y="188" width="24" height="12" rx="3" fill="#8b5cf6" opacity="0.4" />

            {/* Right shelves */}
            <rect x="315" y="130" width="85" height="6" rx="2" fill="rgba(255,255,255,0.15)" />
            <rect x="315" y="165" width="85" height="6" rx="2" fill="rgba(255,255,255,0.15)" />
            <rect x="315" y="200" width="85" height="6" rx="2" fill="rgba(255,255,255,0.15)" />
            {/* Boxes on right shelves */}
            <rect x="320" y="115" width="20" height="15" rx="3" fill="#8b5cf6" opacity="0.5" />
            <rect x="345" y="118" width="25" height="12" rx="3" fill="#06b6d4" opacity="0.5" />
            <rect x="375" y="112" width="20" height="18" rx="3" fill="#8b5cf6" opacity="0.35" />
            <rect x="320" y="150" width="24" height="15" rx="3" fill="#06b6d4" opacity="0.5" />
            <rect x="350" y="153" width="20" height="12" rx="3" fill="#8b5cf6" opacity="0.5" />
            <rect x="320" y="185" width="28" height="15" rx="3" fill="#8b5cf6" opacity="0.4" />
            <rect x="355" y="188" width="18" height="12" rx="3" fill="#06b6d4" opacity="0.4" />

            {/* Floor pallets */}
            <rect x="85" y="260" width="45" height="40" rx="5" fill="#06b6d4" opacity="0.2" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.4" />
            <line x1="85" y1="275" x2="130" y2="275" stroke="#06b6d4" strokeWidth="0.8" strokeOpacity="0.3" />
            <rect x="140" y="268" width="30" height="32" rx="4" fill="#8b5cf6" opacity="0.2" stroke="#8b5cf6" strokeWidth="1" strokeOpacity="0.4" />
            <rect x="320" y="262" width="40" height="38" rx="5" fill="#06b6d4" opacity="0.2" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.4" />
            <rect x="370" y="270" width="25" height="30" rx="4" fill="#8b5cf6" opacity="0.2" stroke="#8b5cf6" strokeWidth="1" strokeOpacity="0.4" />

            {/* Forklift */}
            <rect x="175" y="240" width="55" height="22" rx="5" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            <rect x="230" y="222" width="6" height="40" rx="2" fill="rgba(255,255,255,0.15)" />
            <rect x="228" y="218" width="10" height="8" rx="2" fill="#06b6d4" opacity="0.4" />
            <circle cx="185" cy="264" r="5" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <circle cx="215" cy="264" r="5" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

            {/* Floating data elements */}
            <g opacity="0.6">
                <rect x="400" y="50" width="55" height="35" rx="6" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4 3" />
                <line x1="408" y1="62" x2="440" y2="62" stroke="#06b6d4" strokeWidth="1.2" />
                <line x1="408" y1="70" x2="430" y2="70" stroke="#06b6d4" strokeWidth="1.2" />
                <line x1="408" y1="78" x2="445" y2="78" stroke="#06b6d4" strokeWidth="1.2" />
                <line x1="380" y1="68" x2="400" y2="68" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" />
            </g>
            <g opacity="0.5">
                <rect x="20" y="60" width="45" height="30" rx="5" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 3" />
                <line x1="28" y1="70" x2="52" y2="70" stroke="#8b5cf6" strokeWidth="1.2" />
                <line x1="28" y1="78" x2="48" y2="78" stroke="#8b5cf6" strokeWidth="1.2" />
                <line x1="65" y1="75" x2="80" y2="75" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="3 3" />
            </g>

            {/* Signal waves from warehouse */}
            <path d="M440 140 Q460 140 460 160" stroke="#06b6d4" strokeWidth="1" fill="none" opacity="0.3" />
            <path d="M445 130 Q475 130 475 165" stroke="#06b6d4" strokeWidth="1" fill="none" opacity="0.2" />

            <defs>
                <radialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </radialGradient>
            </defs>
        </svg>
    );
}

export default function Welcome({ auth }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [contactForm, setContactForm] = useState({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' });
    const [contactSent, setContactSent] = useState(false);
    const [contactSending, setContactSending] = useState(false);

    const handleContactSubmit = (e) => {
        e.preventDefault();
        setContactSending(true);
        // Simulate send (replace with real API call)
        setTimeout(() => {
            setContactSending(false);
            setContactSent(true);
            setContactForm({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' });
            setTimeout(() => setContactSent(false), 5000);
        }, 1500);
    };

    useEffect(() => {
        const sections = ['home', 'services', 'projects', 'about', 'contact'];
        
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 100; // Offset for navbar

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const offsetTop = element.offsetTop;
                    const height = element.offsetHeight;

                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + height) {
                        setActiveSection(section);
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check on mount

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <Head title="Sistem Gudang - Petayu" />

            <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
                {/* --- TOP BAR --- */}
                <div className="hidden border-b border-slate-200 bg-white py-2 lg:block">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 text-sm">
                        <div className="flex gap-6 text-slate-600">
                            <div className="flex items-center gap-2">
                                <Phone size={16} className="text-violet-600" />
                                <span>+62 21 5555 0120</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-violet-600" />
                                <span>info@petayu.id</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <a href="#" className="text-slate-400 hover:text-violet-600"><Facebook size={16} /></a>
                            <a href="#" className="text-slate-400 hover:text-violet-600"><Twitter size={16} /></a>
                            <a href="#" className="text-slate-400 hover:text-violet-600"><Linkedin size={16} /></a>
                            <a href="#" className="text-slate-400 hover:text-violet-600"><Instagram size={16} /></a>
                            <a href="#" className="text-slate-400 hover:text-violet-600"><Youtube size={16} /></a>
                        </div>
                    </div>
                </div>

                {/* --- NAVBAR --- */}
                <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 py-4 backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
                        <div className="flex items-center gap-2">
                            <img src="/images/image.png" alt="Logo" className="h-10 w-auto" />
                            <span className="text-2xl font-black tracking-tight text-[#2e1065]">Petayu<span className="text-cyan-500">.</span></span>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden items-center gap-8 font-semibold text-[#2e1065] lg:flex">
                            <a href="#home" className={`transition-colors hover:text-cyan-500 ${activeSection === 'home' ? 'text-cyan-500' : ''}`}>Beranda</a>
                            <a href="#services" className={`transition-colors hover:text-cyan-500 ${activeSection === 'services' ? 'text-cyan-500' : ''}`}>Layanan</a>
                            <a href="#projects" className={`transition-colors hover:text-cyan-500 ${activeSection === 'projects' ? 'text-cyan-500' : ''}`}>Statistik</a>
                            <a href="#about" className={`transition-colors hover:text-cyan-500 ${activeSection === 'about' ? 'text-cyan-500' : ''}`}>Tentang Kami</a>
                            <a href="#contact" className={`transition-colors hover:text-cyan-500 ${activeSection === 'contact' ? 'text-cyan-500' : ''}`}>Hubungi Kami</a>
                        </nav>

                        <div className="hidden lg:block">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="rounded-full bg-violet-600 px-6 py-2.5 font-bold text-white transition-colors hover:bg-violet-700">
                                    Dashboard
                                </Link>
                            ) : (
                                <Link href={route('login')} className="rounded-full bg-violet-600 px-6 py-2.5 font-bold text-white transition-colors hover:bg-violet-700">
                                    Login
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <div className="space-y-1.5">
                                <span className="block h-0.5 w-6 bg-[#2e1065]"></span>
                                <span className="block h-0.5 w-6 bg-[#2e1065]"></span>
                                <span className="block h-0.5 w-6 bg-[#2e1065]"></span>
                            </div>
                        </button>
                    </div>

                    {/* Mobile Nav */}
                    {isMenuOpen && (
                        <div className="absolute left-0 top-full w-full border-b border-slate-200 bg-white px-6 py-4 lg:hidden">
                            <nav className="flex flex-col gap-4 font-semibold text-[#2e1065]">
                                <a href="#home" className={activeSection === 'home' ? 'text-cyan-500' : ''} onClick={() => setIsMenuOpen(false)}>Beranda</a>
                                <a href="#services" className={activeSection === 'services' ? 'text-cyan-500' : ''} onClick={() => setIsMenuOpen(false)}>Layanan</a>
                                <a href="#projects" className={activeSection === 'projects' ? 'text-cyan-500' : ''} onClick={() => setIsMenuOpen(false)}>Statistik</a>
                                <a href="#about" className={activeSection === 'about' ? 'text-cyan-500' : ''} onClick={() => setIsMenuOpen(false)}>Tentang Kami</a>
                                <a href="#contact" className={activeSection === 'contact' ? 'text-cyan-500' : ''} onClick={() => setIsMenuOpen(false)}>Hubungi Kami</a>
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="inline-block rounded-full bg-violet-600 px-6 py-2.5 text-center font-bold text-white">Dashboard</Link>
                                ) : (
                                    <Link href={route('login')} className="inline-block rounded-full bg-violet-600 px-6 py-2.5 text-center font-bold text-white">Login</Link>
                                )}
                            </nav>
                        </div>
                    )}
                </header>

                <main>
                    {/* --- HOME HERO --- */}
                    <section id="home" className="relative flex min-h-[70vh] items-center bg-[#2e1065] py-20 lg:min-h-[80vh]">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                        <div className="mx-auto w-full max-w-7xl px-6 relative z-10 grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
                            <div>
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm font-bold text-cyan-400">
                                    <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
                                    Manajemen Gudang Pintar
                                </div>
                                <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-white lg:text-7xl">
                                    Optimalkan Arus <span className="text-cyan-400">Inventori</span> Anda.
                                </h1>
                                <p className="mt-6 max-w-lg text-lg text-slate-300">
                                    Sederhanakan pergerakan stok, kelola alokasi rak, dan hasilkan laporan komprehensif semuanya dari satu platform yang intuitif.
                                </p>
                                <div className="mt-8 flex flex-wrap gap-4">
                                    <a href="#services" className="rounded-full bg-violet-600 px-8 py-3.5 font-bold text-white hover:bg-violet-700 transition-colors">
                                        Jelajahi Layanan
                                    </a>
                                    <a href="#about" className="rounded-full border border-slate-600 bg-transparent px-8 py-3.5 font-bold text-white hover:bg-slate-800 transition-colors">
                                        Pelajari Lebih Lanjut
                                    </a>
                                </div>
                            </div>
                            <div className="hidden lg:flex justify-end">
                                <WarehouseIllustration />
                            </div>
                        </div>
                    </section>

                    {/* --- SERVICES --- */}
                    <section id="services" className="py-24 bg-white">
                        <div className="mx-auto max-w-7xl px-6">
                            <ScrollReveal>
                                <div className="text-center">
                                    <p className="text-sm font-bold uppercase tracking-widest text-violet-600">Layanan Kami</p>
                                    <h2 className="mt-2 text-4xl font-black text-[#2e1065]">Kapabilitas Inti</h2>
                                </div>
                            </ScrollReveal>
                            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                                {[
                                    { icon: <Package className="h-10 w-10 text-violet-600" />, title: "Pelacakan Inventori", desc: "Visibilitas real-time terhadap tingkat stok dan lokasi produk Anda." },
                                    { icon: <Boxes className="h-10 w-10 text-violet-600" />, title: "Alokasi Rak", desc: "Optimalkan ruang gudang dengan pemetaan zona dan rak yang cerdas." },
                                    { icon: <BarChart3 className="h-10 w-10 text-violet-600" />, title: "Laporan Lanjutan", desc: "Hasilkan laporan PDF dan Excel untuk wawasan bisnis yang dapat ditindaklanjuti." },
                                    { icon: <ShieldCheck className="h-10 w-10 text-violet-600" />, title: "Operasi Aman", desc: "Kontrol akses berbasis peran yang memastikan integritas dan keamanan data." }
                                ].map((srv, idx) => (
                                    <ScrollReveal key={idx} delay={idx * 100}>
                                        <div className="group rounded-2xl border border-slate-100 bg-slate-50 p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-violet-200">
                                            <div className="mb-6 inline-block rounded-xl bg-violet-100 p-4 transition-colors group-hover:bg-violet-200">{srv.icon}</div>
                                            <h3 className="text-xl font-bold text-[#2e1065]">{srv.title}</h3>
                                            <p className="mt-4 leading-relaxed text-slate-600">{srv.desc}</p>
                                        </div>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* --- PROJECTS / STATS --- */}
                    <section id="projects" className="bg-[#2e1065] py-20 text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                        <div className="mx-auto max-w-7xl px-6 relative z-10">
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
                                <ScrollReveal delay={0}>
                                    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10">
                                        <div className="text-5xl font-black text-cyan-400"><AnimatedCounter target={500} suffix="+" /></div>
                                        <div className="mt-2 text-lg font-semibold text-slate-300">Proyek Selesai</div>
                                    </div>
                                </ScrollReveal>
                                <ScrollReveal delay={100}>
                                    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10">
                                        <div className="text-5xl font-black text-cyan-400"><AnimatedCounter target={12} suffix="K" /></div>
                                        <div className="mt-2 text-lg font-semibold text-slate-300">Item Dikelola</div>
                                    </div>
                                </ScrollReveal>
                                <ScrollReveal delay={200}>
                                    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10">
                                        <div className="text-5xl font-black text-cyan-400"><AnimatedCounter target={99} suffix="%" /></div>
                                        <div className="mt-2 text-lg font-semibold text-slate-300">Tingkat Akurasi</div>
                                    </div>
                                </ScrollReveal>
                                <ScrollReveal delay={300}>
                                    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10">
                                        <div className="text-5xl font-black text-cyan-400">24/7</div>
                                        <div className="mt-2 text-lg font-semibold text-slate-300">Ketersediaan Dukungan</div>
                                    </div>
                                </ScrollReveal>
                            </div>
                        </div>
                    </section>

                    {/* --- ABOUT US --- */}
                    <section id="about" className="py-24 bg-slate-50">
                        <div className="mx-auto max-w-7xl px-6">
                            <ScrollReveal>
                                <div className="mb-16 text-center max-w-3xl mx-auto">
                                    <p className="text-sm font-bold uppercase tracking-widest text-violet-600">About Us</p>
                                    <h2 className="mt-2 text-4xl font-black text-[#2e1065]">Sistem Inventori Terintegrasi</h2>
                                    <p className="mt-6 text-lg leading-relaxed text-slate-600">
                                        Petayu didedikasikan untuk mengubah cara bisnis menangani aset fisik mereka. Platform kami terintegrasi secara mendalam dengan operasional harian untuk memberikan alur kerja yang mulus dari penerimaan hingga pengiriman barang.
                                    </p>
                                </div>
                            </ScrollReveal>

                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                <ScrollReveal delay={0}>
                                    <div className="group rounded-2xl bg-white p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                        <h3 className="text-xl font-bold text-[#2e1065]">1. Manajemen Inventori</h3>
                                        <ul className="mt-5 space-y-3 text-sm text-slate-600">
                                            <li className="flex gap-3"><span className="text-violet-600 font-bold">•</span> <span><strong>Master Data:</strong> Kelola data produk dengan kategori, unit, dan gambar.</span></li>
                                            <li className="flex gap-3"><span className="text-violet-600 font-bold">•</span> <span><strong>Stok Real-time:</strong> Pantau level stok global dan per gudang.</span></li>
                                            <li className="flex gap-3"><span className="text-violet-600 font-bold">•</span> <span><strong>In & Out:</strong> Fitur Add Entry dan Record Outbound.</span></li>
                                            <li className="flex gap-3"><span className="text-violet-600 font-bold">•</span> <span><strong>Low Stock:</strong> Peringatan otomatis batas minimum stok.</span></li>
                                        </ul>
                                    </div>
                                </ScrollReveal>

                                <ScrollReveal delay={80}>
                                    <div className="group rounded-2xl bg-white p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                        <h3 className="text-xl font-bold text-[#2e1065]">2. Manajemen Gudang</h3>
                                        <ul className="mt-5 space-y-3 text-sm text-slate-600">
                                            <li className="flex gap-3"><span className="text-violet-600 font-bold">•</span> <span><strong>Hierarki Dinamis:</strong> Gudang → Zona → Rak.</span></li>
                                            <li className="flex gap-3"><span className="text-violet-600 font-bold">•</span> <span><strong>Occupancy:</strong> Validasi otomatis cegah kelebihan kapasitas (Capacity Guard).</span></li>
                                            <li className="flex gap-3"><span className="text-violet-600 font-bold">•</span> <span><strong>Tracking Fisik:</strong> Catat lokasi detail barang hingga rak.</span></li>
                                        </ul>
                                    </div>
                                </ScrollReveal>

                                <ScrollReveal delay={160}>
                                    <div className="group rounded-2xl bg-white p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                        <h3 className="text-xl font-bold text-[#2e1065]">3. Transaksi & Logistik</h3>
                                        <ul className="mt-5 space-y-3 text-sm text-slate-600">
                                            <li className="flex gap-3"><span className="text-violet-600 font-bold">•</span> <span><strong>Purchase Order:</strong> Siklus pembuatan dan pantauan PO.</span></li>
                                            <li className="flex gap-3"><span className="text-violet-600 font-bold">•</span> <span><strong>Shipment:</strong> Lacak pengiriman ke tujuan.</span></li>
                                            <li className="flex gap-3"><span className="text-violet-600 font-bold">•</span> <span><strong>Logic Ketat:</strong> Sinkronisasi transaksi & stok fisik.</span></li>
                                            <li className="flex gap-3"><span className="text-violet-600 font-bold">•</span> <span><strong>Stock Opname:</strong> Penyesuaian stok sistem & aktual.</span></li>
                                        </ul>
                                    </div>
                                </ScrollReveal>

                                <ScrollReveal delay={240}>
                                    <div className="group rounded-2xl bg-white p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                        <h3 className="text-xl font-bold text-[#2e1065]">4. Integrasi Mobile</h3>
                                        <ul className="mt-5 space-y-3 text-sm text-slate-600">
                                            <li className="flex gap-3"><span className="text-violet-600 font-bold">•</span> <span><strong>Aplikasi Driver:</strong> Integrasi mobile melalui API.</span></li>
                                            <li className="flex gap-3"><span className="text-violet-600 font-bold">•</span> <span><strong>Manajemen Tugas:</strong> Klaim & perbarui status pengiriman.</span></li>
                                            <li className="flex gap-3"><span className="text-violet-600 font-bold">•</span> <span><strong>POD:</strong> Verifikasi bukti pengiriman yang sah.</span></li>
                                        </ul>
                                    </div>
                                </ScrollReveal>

                                <ScrollReveal delay={320}>
                                    <div className="group rounded-2xl bg-white p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                        <h3 className="text-xl font-bold text-[#2e1065]">5. Supplier & Partner</h3>
                                        <ul className="mt-5 space-y-3 text-sm text-slate-600">
                                            <li className="flex gap-3"><span className="text-violet-600 font-bold">•</span> <span><strong>Direktori:</strong> Database sentral seluruh partner.</span></li>
                                            <li className="flex gap-3"><span className="text-violet-600 font-bold">•</span> <span><strong>Analisis KPI:</strong> Penilaian performa berdasar transaksi & ketepatan.</span></li>
                                        </ul>
                                    </div>
                                </ScrollReveal>

                                <ScrollReveal delay={400}>
                                    <div className="group rounded-2xl bg-gradient-to-br from-[#2e1065] to-violet-900 p-8 shadow-lg border border-violet-800 text-white relative overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="absolute top-0 right-0 p-4 opacity-20">
                                            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
                                        </div>
                                        <h3 className="text-xl font-bold mb-1 relative z-10">6. Aether AI <span className="inline-block ml-2 text-[10px] font-black uppercase tracking-wider bg-cyan-500 text-[#2e1065] px-2 py-0.5 rounded-full">Unggulan</span></h3>
                                        <ul className="mt-5 space-y-3 text-sm text-violet-200 relative z-10">
                                            <li className="flex gap-3"><span className="text-cyan-400 font-bold">•</span> <span><strong>Interaksi Alami:</strong> Bicara dengan sistem via Aether Orb.</span></li>
                                            <li className="flex gap-3"><span className="text-cyan-400 font-bold">•</span> <span><strong>Insight & Saran:</strong> Rekomendasi stok & tata ruang.</span></li>
                                            <li className="flex gap-3"><span className="text-cyan-400 font-bold">•</span> <span><strong>Suara Interaktif:</strong> Dukungan interruptible voice.</span></li>
                                        </ul>
                                    </div>
                                </ScrollReveal>

                                <ScrollReveal delay={480}>
                                    <div className="group rounded-2xl bg-white p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 lg:col-span-3">
                                        <div className="grid md:grid-cols-2 gap-8 items-center">
                                            <div>
                                                <h3 className="text-xl font-bold text-[#2e1065]">7. Pelaporan & Keamanan</h3>
                                                <ul className="mt-5 space-y-3 text-sm text-slate-600">
                                                    <li className="flex gap-3"><span className="text-violet-600 font-bold">•</span> <span><strong>Custom Report:</strong> Alat pembuat laporan PDF dinamis.</span></li>
                                                    <li className="flex gap-3"><span className="text-violet-600 font-bold">•</span> <span><strong>Export Data:</strong> Ekspor ke Excel dengan format audit rapi.</span></li>
                                                    <li className="flex gap-3"><span className="text-violet-600 font-bold">•</span> <span><strong>RBAC:</strong> Keamanan akses dengan 4 level: Manager, Supervisor, Staff, Driver.</span></li>
                                                </ul>
                                            </div>
                                            <div className="hidden md:flex justify-end pr-8">
                                                <div className="text-slate-200">
                                                    <ShieldCheck size={120} strokeWidth={1} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>
                        </div>
                    </section>



                    {/* --- CONTACT US --- */}
                    <section id="contact" className="bg-white py-16">
                        <div className="mx-auto max-w-5xl px-6">
                            {/* Header */}
                            <ScrollReveal>
                                <div className="text-center mb-16">
                                    <h2 className="text-[40px] font-black text-[#2e1065]">Hubungi Kami</h2>
                                    <div className="mt-2 flex items-center justify-center gap-2 font-bold">
                                        <span className="text-[#2e1065]">Beranda</span>
                                        <span className="text-violet-600">/ Hubungi Kami</span>
                                    </div>
                                </div>
                            </ScrollReveal>

                            {/* Main Contact Container */}
                            <div className="grid gap-12 lg:grid-cols-[1fr_0.6fr] items-start">
                                {/* Left: Form */}
                                <ScrollReveal direction="left">
                                    <div>
                                        <div className="flex items-center gap-4 text-violet-600 font-bold uppercase tracking-wider text-sm mb-4">
                                            <div className="h-0.5 w-8 bg-violet-600"></div>
                                            Hubungi Kami
                                        </div>
                                        <h3 className="text-4xl font-black text-[#2e1065] mb-2">Punya Ide Proyek?</h3>
                                        <h3 className="text-4xl font-black text-violet-600 mb-8">Mari Berdiskusi!</h3>

                                        {contactSent && (
                                            <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 text-sm font-semibold text-green-700 flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Pesan Anda berhasil dikirim!
                                            </div>
                                        )}

                                        <form onSubmit={handleContactSubmit} className="grid gap-6 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-[#2e1065]">Nama Depan *</label>
                                                <input type="text" required value={contactForm.firstName} onChange={(e) => setContactForm({...contactForm, firstName: e.target.value})} placeholder="Cth. Budi" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm placeholder:text-slate-400 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition-colors" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-[#2e1065]">Nama Belakang *</label>
                                                <input type="text" required value={contactForm.lastName} onChange={(e) => setContactForm({...contactForm, lastName: e.target.value})} placeholder="Cth. Santoso" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm placeholder:text-slate-400 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition-colors" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-[#2e1065]">Email *</label>
                                                <input type="email" required value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} placeholder="contoh@gmail.com" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm placeholder:text-slate-400 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition-colors" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-[#2e1065]">Nomor Telepon *</label>
                                                <input type="tel" required value={contactForm.phone} onChange={(e) => setContactForm({...contactForm, phone: e.target.value})} placeholder="Masukkan Nomor Telepon" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm placeholder:text-slate-400 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition-colors" />
                                            </div>
                                            <div className="space-y-2 sm:col-span-2">
                                                <label className="text-sm font-bold text-[#2e1065]">Subjek *</label>
                                                <input type="text" required value={contactForm.subject} onChange={(e) => setContactForm({...contactForm, subject: e.target.value})} placeholder="Masukkan subjek di sini..." className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm placeholder:text-slate-400 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition-colors" />
                                            </div>
                                            <div className="space-y-2 sm:col-span-2">
                                                <label className="text-sm font-bold text-[#2e1065]">Pesan Anda *</label>
                                                <textarea rows={4} required value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} placeholder="Masukkan pesan di sini..." className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm placeholder:text-slate-400 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition-colors"></textarea>
                                            </div>
                                            <div className="sm:col-span-2 mt-2">
                                                <button type="submit" disabled={contactSending} className="rounded-full bg-violet-600 px-8 py-3.5 font-bold text-white transition-all hover:bg-violet-700 hover:shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2">
                                                    {contactSending ? (
                                                        <>
                                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                                            Mengirim...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Kirim Pesan
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </ScrollReveal>

                                {/* Right: Info Card */}
                                <ScrollReveal direction="right">
                                <div className="rounded-[32px] bg-[#2e1065] p-10 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 opacity-10">
                                        <svg width="200" height="200" viewBox="0 0 100 100" fill="white"><rect width="100" height="100" rx="20" transform="rotate(45 50 50)" /></svg>
                                    </div>
                                    <div className="relative z-10 space-y-10">
                                        <div>
                                            <h4 className="text-xl font-bold mb-3 flex items-center gap-2"><MapPin size={18} /> Alamat</h4>
                                            <p className="text-slate-300 leading-relaxed max-w-[220px]">Jl. Gatot Subroto Kav. 36-38,<br/>Jakarta Selatan 12950</p>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-3 flex items-center gap-2"><Phone size={18} /> Kontak</h4>
                                            <p className="text-slate-300 mb-1 flex items-center gap-2"><Phone size={14} /> +62 21 5555 0120</p>
                                            <p className="text-slate-300 flex items-center gap-2"><Mail size={14} /> info@petayu.id</p>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-3 flex items-center gap-2"><Clock size={18} /> Jam Operasional</h4>
                                            <div className="flex gap-4 text-slate-300 mb-1">
                                                <span className="w-32">Senin - Jumat</span>
                                                <span>: 08:00 - 17:00 WIB</span>
                                            </div>
                                            <div className="flex gap-4 text-slate-300">
                                                <span className="w-32">Sabtu</span>
                                                <span>: 09:00 - 14:00 WIB</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-4">Tetap Terhubung</h4>
                                            <div className="flex gap-3">
                                                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors"><Facebook size={18} /></a>
                                                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors"><Twitter size={18} /></a>
                                                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors"><Linkedin size={18} /></a>
                                                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors"><Instagram size={18} /></a>
                                                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors"><Youtube size={18} /></a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                </ScrollReveal>
                            </div>
                        </div>
                    </section>

                    {/* --- MAP SECTION --- */}
                    <div className="bg-white pb-24">
                        <div className="mx-auto max-w-5xl px-6">
                            <ScrollReveal>
                                <div className="h-[300px] w-full relative overflow-hidden rounded-[32px] border border-slate-100 shadow-sm">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2!2d106.82!3d-6.22!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sJakarta+Selatan!5e0!3m2!1sid!2sid!4v1"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Lokasi Petayu"
                                        className="w-full h-full"
                                    ></iframe>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#2e1065]/5 to-transparent pointer-events-none"></div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </main>

                {/* --- FOOTER --- */}
                <footer className="bg-[#2e1065] pt-16">
                    <div className="mx-auto max-w-7xl px-6">
                        {/* CTA Top Bar */}
                        <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-700/50 pb-12 mb-12">
                            <h2 className="text-4xl font-black text-white mb-6 md:mb-0">
                                Ayo <span className="text-violet-600">Terhubung</span> dengan kami
                            </h2>
                            <a href="#contact" className="rounded-full bg-violet-600 px-8 py-3.5 font-bold text-white transition hover:bg-violet-700">
                                Hubungi Kami
                            </a>
                        </div>

                        {/* Footer Grid */}
                        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 pb-16">
                            {/* Col 1 */}
                            <div>
                                <div className="flex items-center gap-2 mb-6">
                                    <img src="/images/image.png" alt="Logo" className="h-8 w-auto" />
                                    <span className="text-2xl font-black tracking-tight text-white">Petayu<span className="text-cyan-500">.</span></span>
                                </div>
                                <p className="text-slate-400 leading-relaxed text-sm mb-6">
                                    Sistem manajemen inventori dan gudang pintar yang dirancang untuk efisiensi maksimal dan transparansi operasional.
                                </p>
                                <div className="flex gap-3">
                                    <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-violet-600 transition-colors"><Facebook size={14} /></a>
                                    <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-violet-600 transition-colors"><Twitter size={14} /></a>
                                    <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-violet-600 transition-colors"><Linkedin size={14} /></a>
                                    <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-violet-600 transition-colors"><Instagram size={14} /></a>
                                    <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-violet-600 transition-colors"><Youtube size={14} /></a>
                                </div>
                            </div>

                            {/* Col 2 */}
                            <div>
                                <h4 className="text-lg font-bold text-white mb-6">Navigasi</h4>
                                <ul className="space-y-4 text-sm text-slate-400">
                                    <li><a href="#" className="hover:text-violet-600">Tim Kami</a></li>
                                    <li><a href="#contact" className="hover:text-violet-600">Hubungi Kami</a></li>
                                    <li><a href="#about" className="hover:text-violet-600">Tentang Kami</a></li>
                                    <li><a href="#" className="hover:text-violet-600">Testimoni</a></li>
                                    <li><a href="#" className="hover:text-violet-600">FAQ</a></li>
                                </ul>
                            </div>

                            {/* Col 3 */}
                            <div>
                                <h4 className="text-lg font-bold text-white mb-6">Kontak</h4>
                                <ul className="space-y-4 text-sm text-slate-400">
                                    <li className="flex items-center gap-2"><Phone size={14} /> +62 21 5555 0120</li>
                                    <li className="flex items-center gap-2"><Mail size={14} /> info@petayu.id</li>
                                    <li className="flex items-center gap-2 leading-relaxed"><MapPin size={14} className="shrink-0" /> Jl. Gatot Subroto Kav. 36-38, Jakarta Selatan</li>
                                </ul>
                            </div>

                            {/* Col 4 */}
                            <div>
                                <h4 className="text-lg font-bold text-white mb-6">Dapatkan Informasi Terbaru</h4>
                                <form className="flex mt-4" onSubmit={(e) => e.preventDefault()}>
                                    <input 
                                        type="email" 
                                        placeholder="Alamat email" 
                                        className="w-full rounded-l-full border-none bg-slate-800/50 px-5 py-3 text-sm text-white placeholder:text-slate-500 focus:ring-1 focus:ring-violet-600 focus:outline-none" 
                                    />
                                    <button type="submit" className="rounded-r-full bg-cyan-500 px-5 py-3 text-[#2e1065] font-bold transition hover:bg-cyan-400">
                                        <ArrowRight size={18} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="bg-[#1e0a45] py-6 border-t border-white/5">
                        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between text-sm font-medium text-white/90">
                            <p>Hak Cipta © 2026 Petayu. Seluruh Hak Dilindungi.</p>
                            <div className="flex gap-4 mt-2 md:mt-0">
                                <a href="#" className="hover:text-white">Syarat & Ketentuan</a>
                                <span>|</span>
                                <a href="#" className="hover:text-white">Kebijakan Privasi</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
