import { Link } from '@inertiajs/react';

const features = [
    {
        icon: (
            <svg className="w-5 h-5 block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625-2.5H4.375L3.75 7.5M20.25 7.5H3.75m16.5 0v11.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V7.5m16.5 0H3.75" />
            </svg>
        ),
        title: 'Manajemen Inventori',
        desc: 'Pelacakan stok real-time',
    },
    {
        icon: (
            <svg className="w-5 h-5 block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
        ),
        title: 'Alokasi Rak Cerdas',
        desc: 'Optimasi ruang gudang',
    },
    {
        icon: (
            <svg className="w-5 h-5 block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
        ),
        title: 'Keamanan RBAC',
        desc: '4 level akses terjamin',
    },
];

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-8">
            {/* The Main Container Wrapped inside a Boxy Card with Shadow */}
            <div className="flex w-full max-w-6xl min-h-[600px] flex-col lg:flex-row overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-200/50">
                
                {/* Left Panel: Solid Violet features area */}
                <div className="relative hidden w-[45%] flex-col p-12 lg:flex bg-violet-600">
                    {/* Top: Logo */}
                    <div className="flex items-center gap-3">
                        <img src="/images/logo_petayu.png" alt="Petayu Logo" className="h-8 w-auto brightness-0 invert" />
                        <span className="text-2xl font-black tracking-tight text-white">Petayu<span className="text-cyan-400">.</span></span>
                    </div>

                    {/* Middle: Feature highlights */}
                    <div className="mt-16 w-full space-y-4">
                         {features.map((feat, idx) => (
                            <div 
                                key={idx} 
                                className="flex items-center gap-5 rounded-2xl border border-white/30 bg-white/10 p-5 shadow-lg backdrop-blur-sm"
                            >
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-md">
                                    {feat.icon}
                                </div>
                                <div>
                                    <div className="text-lg font-black text-white mb-1">{feat.title}</div>
                                    <div className="text-sm font-medium text-violet-100">{feat.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Form Content (White bg) */}
                <div className="relative flex w-full flex-col justify-center p-8 lg:w-[55%] lg:p-16 bg-white">
                    {/* Decorative Top border for mobile (solid) */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-violet-600 lg:hidden"></div>
                    
                    {/* Back to Home Button */}
                    <div className="absolute top-8 left-8">
                        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-violet-600 transition-colors group">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:-translate-x-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Kembali
                        </Link>
                    </div>
                    
                    {/* Mobile Logo display */}
                    <div className="mb-8 mt-12 flex justify-center lg:hidden">
                        <Link href="/" className="flex items-center gap-3">
                            <img src="/images/logo_petayu.png" alt="Petayu Logo" className="h-10 w-auto" />
                            <span className="text-3xl font-black tracking-tight text-slate-900">Petayu<span className="text-violet-600">.</span></span>
                        </Link>
                    </div>

                    <div className="w-full mx-auto max-w-sm mt-8 lg:mt-0">
                        {/* Title block */}
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Login Petayu</h2>
                            <p className="text-sm font-medium text-slate-500 mb-10">Masukkan detail akun untuk masuk sistem</p>
                        </div>

                        {/* Rendering the injected children/Login form */}
                        {children}
                    </div>
                    
                    {/* Footer */}
                    <div className="absolute bottom-8 right-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden lg:block">
                        © 2026 Petayu.
                    </div>
                </div>
            </div>
        </div>
    );
}
