import React from 'react';

export class CanvasErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Canvas Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#F8F7FF] p-8 text-center">
                    <div className="text-[48px]">⚠️</div>
                    <h2 className="text-[18px] font-black text-[#28106F]">Canvas Editor Error</h2>
                    <p className="max-w-[400px] text-[13px] font-semibold text-slate-500">
                        Terjadi kesalahan pada layout editor. Klik tombol di bawah untuk mereset canvas.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            this.props.onReset?.();
                        }}
                        className="rounded-[14px] border border-[#28106F] bg-[#28106F] px-6 py-3 text-[12px] font-black uppercase tracking-[0.15em] text-white shadow-[0_10px_20px_rgba(89,50,201,0.18)] transition hover:bg-[#3730a3]"
                    >
                        Reset Canvas
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
