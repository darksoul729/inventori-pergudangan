import { Link } from '@inertiajs/react';

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

                {/* Top spacer */}
                <div className="relative z-10 w-full"></div>

                {/* Illustration */}
                <div className="relative z-10 flex flex-1 items-center justify-center py-10 w-full">
                    <img 
                        src="/images/image.png" 
                        alt="Petayu Illustration" 
                        className="w-full max-w-[350px] object-contain rounded-3xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                    />
                </div>

                {/* Footer */}
                <div className="relative z-20 mt-auto flex flex-col items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-cyan-400 transition-colors">Facebook</Link>
                        <Link href="#" className="hover:text-cyan-400 transition-colors">LinkedIn</Link>
                        <Link href="#" className="hover:text-cyan-400 transition-colors">Instagram</Link>
                    </div>
                    <div className="text-center">
                        © 2025 Petayu. <br/> All rights reserved
                    </div>
                </div>
            </div>

            {/* Right Panel: Form Content (White) */}
            <div className="flex w-full flex-col justify-center p-8 lg:w-[55%] lg:p-24 bg-white z-0 relative">
                {/* Subtle background pattern for white area */}
                <div className="absolute inset-0 z-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,1) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                
                {/* Back to Home Button */}
                <Link href="/" className="absolute top-8 left-8 lg:top-12 lg:left-12 z-20 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-[#2e1065] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Back to Landing Page
                </Link>
                
                <div className="relative z-10 w-full max-w-md mx-auto">
                    {/* Logo */}
                    <div className="mb-16 flex justify-center">
                        <Link href="/" className="flex items-center gap-3">
                            <img src="/images/image.png" alt="Petayu Logo" className="h-10 w-auto" />
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
