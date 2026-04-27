import { Link } from '@inertiajs/react';

const features = [
    {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625-2.5H4.375L3.75 7.5M20.25 7.5H3.75m16.5 0v11.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V7.5m16.5 0H3.75" />
            </svg>
        ),
        title: 'Manajemen Inventori',
        desc: 'Pelacakan stok real-time',
    },
    {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
        ),
        title: 'Alokasi Rak Cerdas',
        desc: 'Optimasi ruang gudang',
    },
    {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
        ),
        title: 'Keamanan RBAC',
        desc: '4 level akses terjamin',
    },
];

export default function GuestLayout({ children }) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-white">
            {/* Left Panel: Illustration (Violet) */}
            <div className="relative hidden w-[45%] flex-col items-center justify-between bg-[#2e1065] p-12 lg:flex rounded-r-[3rem] shadow-[20px_0_40px_rgba(46,16,101,0.15)] z-10 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-cyan-500/10 blur-[100px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-violet-400/20 blur-[100px]"></div>
                </div>

                {/* Top: Logo */}
                <div className="relative z-10 w-full flex items-center gap-3">
                    <img src="/images/image.png" alt="Petayu Logo" className="h-8 w-auto" />
                    <span className="text-2xl font-black tracking-tight text-white">Petayu<span className="text-cyan-400">.</span></span>
                </div>

                {/* Illustration */}
                <div className="relative z-10 flex flex-1 items-center justify-center py-10 w-full">
                    <img 
                        src="/images/image.png" 
                        alt="Petayu Illustration" 
                        className="w-full max-w-[300px] object-contain rounded-3xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-[float_6s_ease-in-out_infinite]"
                    />
                </div>

                {/* Feature highlights */}
                <div className="relative z-20 mt-auto w-full space-y-4 mb-4">
                    {features.map((feat, idx) => (
                        <div 
                            key={idx} 
                            className="flex items-center gap-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-3 transition-all hover:bg-white/10"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                                {feat.icon}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">{feat.title}</div>
                                <div className="text-xs text-slate-400">{feat.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="relative z-20 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    © 2025 Petayu. All rights reserved
                </div>
            </div>

            {/* Right Panel: Form Content (White) */}
            <div className="flex w-full flex-col justify-center p-8 lg:w-[55%] lg:p-24 bg-white z-0 relative">
                {/* Subtle background pattern for white area */}
                <div className="absolute inset-0 z-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,1) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                
                {/* Mobile-only decorative gradient bar at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2e1065] via-cyan-500 to-[#2e1065] lg:hidden"></div>
                
                {/* Back to Home Button */}
                <Link href="/" className="absolute top-8 left-8 lg:top-12 lg:left-12 z-20 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-[#2e1065] transition-colors group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 transition-transform group-hover:-translate-x-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Back to Landing Page
                </Link>
                
                <div className="relative z-10 w-full max-w-md mx-auto">
                    {/* Logo */}
                    <div className="mb-16 flex justify-center">
                        <Link href="/" className="flex items-center gap-3 group">
                            <img src="/images/image.png" alt="Petayu Logo" className="h-10 w-auto transition-transform group-hover:scale-105" />
                            <div className="flex flex-col">
                                <span className="text-3xl font-black tracking-tight text-[#2e1065]">Petayu<span className="text-cyan-500">.</span></span>
                            </div>
                        </Link>
                    </div>

                    {/* The Form Container */}
                    {children}
                </div>
            </div>
        </div>
    );
}
