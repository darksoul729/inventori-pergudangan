import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// SVG icons mapped to module codes
function ModuleIcon({ code, size = 'md' }) {
    const cls = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    const icons = {
        inventory_core: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
        warehouse_ops: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
        shipment: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>,
        invoicing: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>,
        reports_advanced: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
        ai_contextual: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
        layout_editor: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>,
    };
    return icons[code] || <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
}

export default function Register({ moduleOptions = [], trialDays = 3, planOptions = [] }) {
    const [step, setStep] = useState(1);
    const { data, setData, post, processing, errors, reset, clearErrors, setError } = useForm({
        name: '',
        phone: '',
        email: '',
        company_name: '',
        warehouse_name: '',
        city: '',
        password: '',
        password_confirmation: '',
        selected_modules: [],
        onboarding_mode: 'trial',
        selected_plan_code: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [activePreset, setActivePreset] = useState(null);

    // Initial load: Pre-select required modules
    useEffect(() => {
        if (moduleOptions.length > 0) {
            const required = moduleOptions.filter(m => m.required).map(m => m.code);
            setData('selected_modules', required);
        }
    }, []);

    const getPasswordStrength = (password) => {
        let score = 0;
        if (!password) return score;
        if (password.length >= 8) score += 25;
        if (/[A-Z]/.test(password)) score += 25;
        if (/[0-9]/.test(password)) score += 25;
        if (/[^A-Za-z0-9]/.test(password)) score += 25;
        return score;
    };

    const passwordScore = getPasswordStrength(data.password);
    const paidPlanOptions = planOptions.filter((plan) => !String(plan.code || '').toLowerCase().includes('trial'));
    const formatRupiah = (amount) => `Rp ${Number(amount || 0).toLocaleString('id-ID')}`;
    const selectedModuleSet = new Set(data.selected_modules);
    const selectedCount = moduleOptions.filter((m) => selectedModuleSet.has(m.code) || m.required).length;
    const groupedModules = moduleOptions.reduce((acc, mod) => {
        const category = mod.category || 'Lainnya';
        if (!acc[category]) acc[category] = [];
        acc[category].push(mod);
        return acc;
    }, {});

    const categoryOrder = ['Inti Gudang', 'Operasional Lanjut', 'Keuangan', 'AI Asisten', 'Lainnya'];
    const orderedCategories = categoryOrder.filter((c) => groupedModules[c]?.length > 0);

    const toggleModule = (mod, checked) => {
        if (mod.required) return;
        setActivePreset(null);
        if (checked) {
            setData('selected_modules', Array.from(new Set([...data.selected_modules, mod.code])));
            return;
        }
        setData('selected_modules', data.selected_modules.filter((c) => c !== mod.code));
    };

    const applyPreset = (preset, name) => {
        const required = moduleOptions.filter((m) => m.required).map((m) => m.code);
        const final = Array.from(new Set([...required, ...preset]));
        setData('selected_modules', final);
        setActivePreset(name);
    };

    const handleNextStep1 = () => {
        clearErrors();
        
        if (!data.name || !data.phone || !data.email || !data.company_name || !data.warehouse_name || !data.city || !data.password || !data.password_confirmation) {
            setError('name', 'Mohon lengkapi semua data wajib sebelum melanjutkan.');
            return;
        }

        const tempDomains = ['mailinator.com', 'yopmail.com', '10minutemail.com', 'guerrillamail.com', 'temp-mail.org', 'throwawaymail.com', 'tempmail.com', 'tempmail.net', 'tempmail.org', 'tempmail.io'];
        const domain = data.email.split('@')[1]?.toLowerCase();
        
        if (domain && tempDomains.includes(domain)) {
            setError('email', 'Pendaftaran tidak dapat menggunakan email sementara (temporary email).');
            return;
        }
        
        if (passwordScore < 100) {
            setError('password', 'Password harus memenuhi semua kriteria keamanan.');
            return;
        }
        
        if (data.password !== data.password_confirmation) {
            setError('password_confirmation', 'Konfirmasi password tidak cocok dengan password baru.');
            return;
        }

        setStep(2);
    };

    const submit = (e) => {
        e.preventDefault();
        if (data.onboarding_mode === 'paid' && !data.selected_plan_code) {
            setError('selected_plan_code', 'Pilih paket berbayar terlebih dahulu.');
            return;
        }
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="h-screen overflow-hidden petayu-bg-app flex font-sans">
            <Head title="Daftar Akun" />

            {/* Left Sidebar */}
            <div className="hidden lg:flex w-[450px] xl:w-[500px] flex-col px-10 py-12 justify-between">
                <div>
                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-12">
                        <img src="/images/logo_petayu.png" alt="Petayu Logo" className="h-10 w-auto object-contain" />
                        <span className="text-xl font-bold text-slate-800 tracking-tight">Petayu<span className="text-violet-700">WMS</span></span>
                    </div>

                    {/* Headings */}
                    <h1 className="text-[2rem] leading-tight font-bold text-slate-900 mb-4">
                        Setup akun sebelum<br />masuk dashboard
                    </h1>
                    <p className="text-slate-500 text-sm mb-10 leading-relaxed pr-4">
                        Ikuti alur singkat ini untuk menyiapkan perusahaan Anda dan mulai mengelola operasional dengan lebih cerdas.
                    </p>

                    {/* Step Cards */}
                    <div className="space-y-4 mb-8">
                        {/* Step 1 */}
                        <div className={`bg-white rounded-2xl p-4 flex items-start gap-4 shadow-sm border transition-colors ${step === 1 ? 'border-violet-300 ring-2 ring-violet-50' : 'border-slate-100 opacity-60'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${step >= 1 ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400'}`}>
                                <span className="font-bold text-sm">1</span>
                            </div>
                            <div>
                                <h3 className={`font-semibold text-sm mb-1 ${step >= 1 ? 'text-slate-800' : 'text-slate-500'}`}>Data Perusahaan & Profil</h3>
                                <p className="text-slate-500 text-xs leading-relaxed">Lengkapi data dasar perusahaan dan profil Anda.</p>
                            </div>
                        </div>
                        {/* Step 2 */}
                        <div className={`bg-white rounded-2xl p-4 flex items-start gap-4 shadow-sm border transition-colors ${step === 2 ? 'border-violet-300 ring-2 ring-violet-50' : 'border-slate-100 opacity-60'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${step >= 2 ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400'}`}>
                                <span className="font-bold text-sm">2</span>
                            </div>
                            <div>
                                <h3 className={`font-semibold text-sm mb-1 ${step >= 2 ? 'text-slate-800' : 'text-slate-500'}`}>Pilih modul operasional</h3>
                                <p className="text-slate-500 text-xs leading-relaxed">Pilih modul yang sesuai dengan kebutuhan operasional Anda.</p>
                            </div>
                        </div>
                        {/* Step 3 */}
                        <div className={`bg-white rounded-2xl p-4 flex items-start gap-4 shadow-sm border transition-colors ${step === 3 ? 'border-violet-300 ring-2 ring-violet-50' : 'border-slate-100 opacity-60'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${step >= 3 ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400'}`}>
                                <span className="font-bold text-sm">3</span>
                            </div>
                            <div>
                                <h3 className={`font-semibold text-sm mb-1 ${step >= 3 ? 'text-slate-800' : 'text-slate-500'}`}>Aktivasi: Trial atau Bayar</h3>
                                <p className="text-slate-500 text-xs leading-relaxed">Pilih Trial dulu atau langsung aktifkan Paket Berbayar.</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Highlight Card */}
                    <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 mb-8 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                            <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            <h4 className="font-semibold text-violet-900 text-sm">AI untuk Operasional yang Lebih Cerdas</h4>
                        </div>
                        <p className="text-violet-700/80 text-xs leading-relaxed relative z-10">
                            Petayu memanfaatkan AI untuk membantu Anda mengoptimalkan stok, memprediksi permintaan, dan meningkatkan efisiensi operasional harian.
                        </p>
                    </div>
                </div>

                {/* Bottom Badges & Copyright */}
                <div>
                    <div className="grid grid-cols-4 gap-2 mb-8">
                        <div className="text-center">
                            <div className="flex justify-center mb-2"><svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>
                            <div className="text-[10px] font-semibold text-slate-800 mb-1">Aman & Terpercaya</div>
                            <div className="text-[9px] text-slate-500">Keamanan data tingkat enterprise</div>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center mb-2"><svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div>
                            <div className="text-[10px] font-semibold text-slate-800 mb-1">Efisiensi Tinggi</div>
                            <div className="text-[9px] text-slate-500">Proses lebih cepat, biaya lebih rendah</div>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center mb-2"><svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                            <div className="text-[10px] font-semibold text-slate-800 mb-1">Real-time</div>
                            <div className="text-[9px] text-slate-500">Data akurat untuk keputusan tepat</div>
                        </div>
                        <div className="text-center">
                            <div className="flex justify-center mb-2"><svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div>
                            <div className="text-[10px] font-semibold text-slate-800 mb-1">Support Responsif</div>
                            <div className="text-[9px] text-slate-500">Tim kami siap membantu Anda</div>
                        </div>
                    </div>
                    <div className="text-xs text-slate-400">
                        © 2026 Petayu. Semua hak dilindungi.
                    </div>
                </div>
            </div>

            {/* Right Main Content */}
            <div className="flex-1 p-4 lg:p-6 flex flex-col h-screen">
                {/* Mobile Step Indicator */}
                <div className="flex items-center justify-between mb-3 lg:hidden">
                    <div className="flex items-center gap-2">
                        <img src="/images/logo_petayu.png" alt="Petayu" className="h-7 w-7 object-contain" />
                        <span className="text-sm font-bold text-slate-800">Petayu</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`h-2 rounded-full transition-all ${s === step ? 'w-6 bg-violet-600' : s < step ? 'w-2 bg-emerald-500' : 'w-2 bg-slate-200'}`} />
                        ))}
                        <span className="ml-2 text-xs font-semibold text-slate-500">{step}/3</span>
                    </div>
                </div>

                <div className="bg-white w-full h-full rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] flex flex-col overflow-y-auto scrollbar-none">
                    
                    {/* Header */}
                    <div className="p-8 lg:px-12 lg:pt-10 flex justify-between items-center shrink-0">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-1">Daftar Akun Petayu</h2>
                            <p className="text-sm text-slate-500">Lengkapi data di bawah ini untuk memulai onboarding akun Anda.</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-violet-50 rounded-full">
                            <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            <span className="text-xs font-semibold text-violet-900">Aman & Terpercaya</span>
                        </div>
                    </div>

                    {/* Stepper (Visual Only) */}
                    <div className="px-8 lg:px-12 py-6 flex items-center justify-between shrink-0">
                        {/* Step 1 */}
                        <div className="flex-1 flex items-center">
                            <div className={`flex items-center gap-3 ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step > 1 ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : step === 1 ? 'bg-violet-600 text-white shadow-md shadow-violet-200' : 'bg-slate-100 text-slate-500'}`}>{step > 1 ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : 1}</div>
                                <span className={`text-sm font-semibold hidden sm:block transition-colors ${step > 1 ? 'text-emerald-600' : step === 1 ? 'text-violet-700' : 'text-slate-500'}`}>Data Perusahaan</span>
                            </div>
                            <div className={`h-px flex-1 mx-4 xl:mx-8 transition-colors ${step > 1 ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>
                        </div>
                        {/* Step 2 */}
                        <div className="flex-1 flex items-center">
                            <div className={`flex items-center gap-3 ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step > 2 ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : step === 2 ? 'bg-violet-600 text-white shadow-md shadow-violet-200' : 'bg-slate-100 text-slate-500'}`}>{step > 2 ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : 2}</div>
                                <span className={`text-sm hidden sm:block transition-colors ${step > 2 ? 'text-emerald-600 font-semibold' : step === 2 ? 'text-violet-700 font-semibold' : 'text-slate-500 font-medium'}`}>Pilih Modul</span>
                            </div>
                            <div className={`h-px flex-1 mx-4 xl:mx-8 transition-colors ${step > 2 ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>
                        </div>
                        {/* Step 3 */}
                        <div className={`flex items-center gap-3 ${step >= 3 ? 'opacity-100' : 'opacity-50'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 3 ? 'bg-violet-600 text-white shadow-md shadow-violet-200' : 'bg-slate-100 text-slate-500'}`}>3</div>
                            <span className={`text-sm hidden sm:block transition-colors ${step >= 3 ? 'text-violet-700 font-semibold' : 'text-slate-500 font-medium'}`}>Trial / Bayar</span>
                        </div>
                        
                        <div className="ml-8 px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-xs font-bold hidden 2xl:block">
                            Step {step} / 3
                        </div>
                    </div>

                    {/* Step 1: Form Data Perusahaan */}
                    {step === 1 && (
                        <div className="flex-1 px-8 lg:px-12 pb-10 flex flex-col min-h-0 animate-fade-in">
                            <h3 className="text-base font-bold text-slate-800 mb-6 shrink-0">Data dasar perusahaan</h3>
                            
                            <div className="flex flex-col flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 overflow-y-auto pr-2 pb-6 custom-scrollbar">
                                    {/* Input: Nama PIC */}
                                    <div>
                                        <label htmlFor="reg-name" className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            </div>
                                            <input id="reg-name" type="text" value={data.name} onChange={(e) => setData('name', e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-colors"
                                                placeholder="Masukkan nama lengkap"
                                            />
                                        </div>
                                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                    </div>

                                    {/* Input: No HP PIC */}
                                    <div>
                                        <label htmlFor="reg-phone" className="block text-sm font-semibold text-slate-700 mb-2">No. WhatsApp / HP</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                            </div>
                                            <input id="reg-phone" type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-colors"
                                                placeholder="Contoh: 0812 3456 7890"
                                            />
                                        </div>
                                        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                                    </div>

                                    {/* Input: Email Perusahaan */}
                                    <div>
                                        <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-700 mb-2">Email Login</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            </div>
                                            <input id="reg-email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-colors"
                                                placeholder="nama@perusahaan.com"
                                            />
                                        </div>
                                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                                    </div>

                                    {/* Input: Nama Perusahaan */}
                                    <div>
                                        <label htmlFor="reg-company" className="block text-sm font-semibold text-slate-700 mb-2">Nama Perusahaan</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            </div>
                                            <input id="reg-company" type="text" value={data.company_name} onChange={(e) => setData('company_name', e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-colors"
                                                placeholder="Masukkan nama perusahaan"
                                            />
                                        </div>
                                        {errors.company_name && <p className="mt-1 text-xs text-red-500">{errors.company_name}</p>}
                                    </div>

                                    {/* Input: Nama Gudang Utama */}
                                    <div>
                                        <label htmlFor="reg-warehouse" className="block text-sm font-semibold text-slate-700 mb-2">Nama Gudang Utama</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                            </div>
                                            <input id="reg-warehouse" type="text" value={data.warehouse_name} onChange={(e) => setData('warehouse_name', e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-colors"
                                                placeholder="Masukkan nama gudang utama"
                                            />
                                        </div>
                                        {errors.warehouse_name && <p className="mt-1 text-xs text-red-500">{errors.warehouse_name}</p>}
                                    </div>

                                    {/* Input: Kota Operasional */}
                                    <div>
                                        <label htmlFor="reg-city" className="block text-sm font-semibold text-slate-700 mb-2">Kota Operasional</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            </div>
                                            <input id="reg-city" type="text" value={data.city} onChange={(e) => setData('city', e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-colors"
                                                placeholder="Pilih kota operasional"
                                            />
                                        </div>
                                        {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                                    </div>

                                    {/* Input: Password */}
                                    <div>
                                        <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            </div>
                                            <input id="reg-password" type={showPassword ? 'text' : 'password'} value={data.password} onChange={(e) => setData('password', e.target.value)}
                                                className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-colors"
                                                placeholder="Minimal 8 karakter"
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
                                                {showPassword ? (
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                ) : (
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                )}
                                            </button>
                                        </div>
                                        
                                        {/* Password Strength Indicator */}
                                        <div className="mt-3">
                                            <div className="flex gap-1 h-1.5 mb-2">
                                                <div className={`flex-1 rounded-full transition-colors ${passwordScore >= 25 ? (passwordScore < 50 ? 'bg-red-400' : passwordScore < 75 ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-slate-200'}`}></div>
                                                <div className={`flex-1 rounded-full transition-colors ${passwordScore >= 50 ? (passwordScore < 75 ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-slate-200'}`}></div>
                                                <div className={`flex-1 rounded-full transition-colors ${passwordScore >= 75 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                                                <div className={`flex-1 rounded-full transition-colors ${passwordScore >= 100 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                                            </div>
                                            <div className="text-[11px] font-medium mb-3">
                                                <span className={passwordScore === 100 ? "text-emerald-600" : "text-slate-500"}>
                                                    {passwordScore === 0 && "Kekuatan password: Belum diisi"}
                                                    {passwordScore === 25 && "Kekuatan password: Sangat Lemah"}
                                                    {passwordScore === 50 && "Kekuatan password: Lemah"}
                                                    {passwordScore === 75 && "Kekuatan password: Cukup Kuat"}
                                                    {passwordScore === 100 && "Kekuatan password: Sangat Kuat"}
                                                </span>
                                            </div>
                                            
                                            <ul className="text-[11px] text-slate-500 space-y-1.5">
                                                <li className={`flex items-center gap-1.5 transition-colors ${data.password.length >= 8 ? 'text-emerald-600' : ''}`}>
                                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={data.password.length >= 8 ? "3" : "2"} d={data.password.length >= 8 ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} /></svg>
                                                    Minimal 8 karakter
                                                </li>
                                                <li className={`flex items-center gap-1.5 transition-colors ${/[A-Z]/.test(data.password) ? 'text-emerald-600' : ''}`}>
                                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={/[A-Z]/.test(data.password) ? "3" : "2"} d={/[A-Z]/.test(data.password) ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} /></svg>
                                                    Minimal 1 huruf kapital (A-Z)
                                                </li>
                                                <li className={`flex items-center gap-1.5 transition-colors ${/[0-9]/.test(data.password) ? 'text-emerald-600' : ''}`}>
                                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={/[0-9]/.test(data.password) ? "3" : "2"} d={/[0-9]/.test(data.password) ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} /></svg>
                                                    Minimal 1 angka (0-9)
                                                </li>
                                                <li className={`flex items-center gap-1.5 transition-colors ${/[^A-Za-z0-9]/.test(data.password) ? 'text-emerald-600' : ''}`}>
                                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={/[^A-Za-z0-9]/.test(data.password) ? "3" : "2"} d={/[^A-Za-z0-9]/.test(data.password) ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} /></svg>
                                                    Minimal 1 simbol khusus (@, #, $)
                                                </li>
                                            </ul>
                                        </div>
                                        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                                    </div>

                                    {/* Input: Konfirmasi Password */}
                                    <div>
                                        <label htmlFor="reg-password-confirm" className="block text-sm font-semibold text-slate-700 mb-2">Konfirmasi Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            </div>
                                            <input id="reg-password-confirm" type={showPasswordConfirmation ? 'text' : 'password'} value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-colors"
                                                placeholder="Ulangi password"
                                            />
                                            <button type="button" onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
                                                {showPasswordConfirmation ? (
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                                ) : (
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                )}
                                            </button>
                                        </div>
                                        {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>}
                                    </div>
                                </div>

                                {/* Bottom Actions */}
                                <div className="mt-auto pt-4 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <Link href="/" className="px-6 py-3 w-full sm:w-auto border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        Kembali
                                    </Link>

                                    <button type="button" onClick={handleNextStep1} disabled={processing || passwordScore < 100} className="px-8 py-3 w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                        Pilih Modul
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                                {passwordScore < 100 && (
                                    <p className="text-xs text-slate-400 text-right mt-2 shrink-0">Lengkapi semua field & password untuk melanjutkan.</p>
                                )}
                                
                                {/* Login Link */}
                                <div className="text-center mt-6 shrink-0">
                                    <span className="text-sm text-slate-500">Sudah punya akun? </span>
                                    <Link href={route('login')} className="text-sm font-semibold text-violet-600 hover:text-violet-700">Masuk di sini</Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Form Pilih Modul */}
                    {step === 2 && (
                        <div className="flex-1 px-8 lg:px-12 pb-10 flex flex-col min-h-0 animate-fade-in">
                            <h3 className="text-base font-bold text-slate-800 mb-1 shrink-0">Pilih Modul Operasional</h3>
                            <p className="text-sm text-slate-500 mb-6 shrink-0">Aktifkan modul sesuai kebutuhan gudang Anda. Modul inti sudah terpilih otomatis.</p>

                            <div className="flex-1 overflow-y-auto pr-2 pb-6 custom-scrollbar">
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                    <div className="xl:col-span-2 space-y-6">
                                        {/* Presets — hanya tampil saat mode paid */}
                                        {data.onboarding_mode !== 'trial' && (
                                        <div className="flex flex-wrap gap-2">
                                            <button type="button" onClick={() => applyPreset(['warehouse_ops', 'invoicing'], 'small')} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold border transition-all ${activePreset === 'small' ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200' : 'bg-slate-100 text-slate-700 border-transparent hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200'}`}>
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                Toko & Gudang Kecil
                                            </button>
                                            <button type="button" onClick={() => applyPreset(['warehouse_ops', 'shipment', 'invoicing'], 'medium')} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold border transition-all ${activePreset === 'medium' ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200' : 'bg-slate-100 text-slate-700 border-transparent hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200'}`}>
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                Gudang Menengah
                                            </button>
                                            <button type="button" onClick={() => applyPreset(['warehouse_ops', 'shipment', 'invoicing', 'reports_advanced', 'ai_contextual'], 'full')} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold border transition-all ${activePreset === 'full' ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200' : 'bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200'}`}>
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                Full Operasional
                                            </button>
                                        </div>
                                        )}

                                        {/* Banner trial — semua modul aktif */}
                                        {data.onboarding_mode === 'trial' && (
                                            <div className="flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3">
                                                <svg className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <p className="text-xs font-semibold text-violet-700">Semua modul aktif selama trial {trialDays} hari. Setelah trial berakhir, modul disesuaikan dengan paket yang Anda pilih.</p>
                                            </div>
                                        )}

                                        {/* Module Categories */}
                                        {orderedCategories.map((category) => (
                                            <div key={category}>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{category}</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {groupedModules[category].map((mod) => {
                                                        const isTrial = data.onboarding_mode === 'trial';
                                                        const isChecked = isTrial || selectedModuleSet.has(mod.code) || mod.required;
                                                        const isDisabled = isTrial || mod.required;
                                                        return (
                                                            <label key={mod.code} className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all group ${isChecked ? 'border-violet-400 bg-violet-50/60 shadow-sm' : 'border-slate-200 hover:border-violet-300 bg-white hover:shadow-sm'} ${isDisabled ? 'cursor-default' : 'cursor-pointer'}`}>
                                                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${isChecked ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-violet-100 group-hover:text-violet-600'}`}>
                                                                    <ModuleIcon code={mod.code} />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-bold text-slate-900">{mod.name}</span>
                                                                        {mod.required && (
                                                                            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">Wajib</span>
                                                                        )}
                                                                    </div>
                                                                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">{mod.description || 'Modul operasional tambahan.'}</p>
                                                                </div>
                                                                <input
                                                                    type="checkbox"
                                                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-600"
                                                                    checked={isChecked}
                                                                    disabled={isDisabled}
                                                                    onChange={(e) => toggleModule(mod, e.target.checked)}
                                                                />
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Sidebar Summary */}
                                    <div className="xl:col-span-1">
                                        <div className="sticky top-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900">Ringkasan</h4>
                                                    <p className="text-xs text-slate-500">{selectedCount} modul aktif</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                                                {moduleOptions
                                                    .filter((mod) => selectedModuleSet.has(mod.code) || mod.required)
                                                    .map((mod) => (
                                                        <div key={mod.code} className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                                                                <ModuleIcon code={mod.code} size="sm" />
                                                            </div>
                                                            <span className="text-xs font-semibold text-slate-700">{mod.name}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-800">
                                                <span className="font-bold">Trial {trialDays} hari</span> aktif setelah verifikasi email. Modul bisa ditambah dari menu Paket & Pembayaran.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-auto pt-4 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <button type="button" onClick={() => setStep(1)} className="px-6 py-3 w-full sm:w-auto border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    Kembali
                                </button>
                                <button type="button" onClick={() => setStep(3)} className="px-8 py-3 w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center gap-2">
                                    Lanjut ke Aktivasi
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Aktivasi Trial / Bayar */}
                    {step === 3 && (
                        <div className="flex-1 px-8 lg:px-12 pb-10 flex flex-col min-h-0 animate-fade-in">
                            <h3 className="text-base font-bold text-slate-800 mb-1">Aktivasi Akun</h3>
                            <p className="text-sm text-slate-500 mb-6">Pilih cara memulai yang paling cocok untuk tim Anda.</p>

                            {/* Info box ABOVE options */}
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Setelah daftar, Anda akan menerima email verifikasi. Akun langsung aktif setelah dikonfirmasi.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
                                {/* Trial Option */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData('onboarding_mode', 'trial');
                                        setData('selected_plan_code', '');
                                        clearErrors('selected_plan_code');
                                    }}
                                    className={`text-left rounded-2xl border-2 p-6 transition-all ${
                                        data.onboarding_mode === 'trial' ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-100' : 'border-slate-200 bg-white hover:border-emerald-300'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors ${data.onboarding_mode === 'trial' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-slate-900">Trial Gratis {trialDays} Hari</p>
                                            <p className="mt-1 text-sm text-slate-500">Evaluasi semua fitur tanpa komitmen. Upgrade kapan saja.</p>
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">Gratis</span>
                                                <span className="text-xs text-slate-400">Tanpa kartu kredit</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>

                                {/* Paid Option */}
                                <button
                                    type="button"
                                    onClick={() => setData('onboarding_mode', 'paid')}
                                    className={`text-left rounded-2xl border-2 p-6 transition-all ${
                                        data.onboarding_mode === 'paid' ? 'border-violet-500 bg-violet-50/50 shadow-md shadow-violet-100' : 'border-slate-200 bg-white hover:border-violet-300'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors ${data.onboarding_mode === 'paid' ? 'bg-violet-600 text-white' : 'bg-violet-100 text-violet-600'}`}>
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-slate-900">Langsung Berlangganan</p>
                                            <p className="mt-1 text-sm text-slate-500">Akses penuh tanpa batas waktu trial. Bayar setelah masuk dashboard.</p>
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-bold text-violet-700">Pro</span>
                                                <span className="text-xs text-slate-400">Pilih paket di bawah</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {data.onboarding_mode === 'paid' && (
                                <div className="mb-6">
                                    <p className="text-sm font-bold text-slate-800 mb-4">Pilih Paket Berbayar</p>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                        {paidPlanOptions.map((plan, idx) => {
                                            const planIcons = [
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
                                            ];
                                            const planData = {
                                                basic_umkm: { tagline: 'Untuk UMKM dan toko kecil', features: ['Stok, supplier, barang masuk-keluar', 'Tagihan dasar & laporan harian', '1 gudang · maks 5 user'] },
                                                pro: { tagline: 'Gudang berkembang', features: ['Semua fitur Basic', 'Pengiriman, driver & AI kontekstual', '1 gudang · maks 20 user'], recommended: true },
                                                enterprise: { tagline: 'Skala besar & kebutuhan custom', features: ['Semua fitur Pro', 'Kapasitas user besar (unlimited)', 'Prioritas support & SLA'] },
                                            };
                                            const info = planData[plan.code] || { tagline: '', features: [] };
                                            return (
                                                <button
                                                    key={plan.code}
                                                    type="button"
                                                    onClick={() => { setData('selected_plan_code', plan.code); clearErrors('selected_plan_code'); }}
                                                    className={`relative text-left rounded-2xl border-2 p-5 transition-all flex flex-col ${
                                                        data.selected_plan_code === plan.code ? 'border-violet-500 bg-violet-50/60 shadow-lg shadow-violet-100' : 'border-slate-200 hover:border-violet-300 bg-white'
                                                    }`}
                                                >
                                                    {info.recommended && (
                                                        <span className="absolute -top-2.5 right-4 rounded-full bg-violet-600 px-2.5 py-0.5 text-[10px] font-bold text-white">Populer</span>
                                                    )}
                                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-3 ${data.selected_plan_code === plan.code ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                        {planIcons[idx] || planIcons[0]}
                                                    </div>
                                                    <p className="text-base font-bold text-slate-900">{plan.name}</p>
                                                    <p className="text-[11px] text-slate-400 mb-2">{info.tagline}</p>
                                                    <p className="text-lg font-black text-violet-700 mb-3">
                                                        {Number(plan.monthly_price || 0) > 0 ? formatRupiah(plan.monthly_price) : 'Custom'}
                                                        <span className="text-xs font-medium text-slate-400">/bulan</span>
                                                    </p>
                                                    <ul className="space-y-1.5 mt-auto">
                                                        {info.features.map((f) => (
                                                            <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                                                                <svg className="w-3.5 h-3.5 text-violet-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                                {f}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.selected_plan_code && <p className="mt-3 text-xs text-red-500">{errors.selected_plan_code}</p>}
                                </div>
                            )}

                            {/* Final Summary */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                        </div>
                                        Ringkasan Pendaftaran
                                    </h4>
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ${data.onboarding_mode === 'trial' ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'}`}>
                                        {data.onboarding_mode === 'trial' ? `Trial ${trialDays} Hari` : 'Paket Berbayar'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Nama</p>
                                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">{data.name || '-'}</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Email</p>
                                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">{data.email || '-'}</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Perusahaan</p>
                                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">{data.company_name || '-'}</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Gudang</p>
                                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">{data.warehouse_name || '-'}</p>
                                    </div>
                                    <div className="rounded-xl bg-violet-50 px-3 py-2.5">
                                        <p className="text-[10px] font-medium text-violet-400 uppercase tracking-wider">Modul</p>
                                        <p className="text-sm font-bold text-violet-700 mt-0.5">{selectedCount} modul</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={submit} className="mt-auto pt-4 pb-4 sm:pb-6 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                                <button type="button" onClick={() => setStep(2)} disabled={processing} className="px-6 py-3.5 w-full sm:w-auto border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    Kembali
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || (data.onboarding_mode === 'paid' && !data.selected_plan_code)}
                                    className={`px-8 py-3.5 w-full sm:w-auto text-white rounded-xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                        data.onboarding_mode === 'paid'
                                            ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/30'
                                            : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                                    }`}
                                >
                                    {processing ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                            Memproses...
                                        </>
                                    ) : data.onboarding_mode === 'paid' ? (
                                        <>Buat Akun & Lanjut Pembayaran</>
                                    ) : (
                                        <>Buat Akun & Mulai Trial {trialDays} Hari</>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
