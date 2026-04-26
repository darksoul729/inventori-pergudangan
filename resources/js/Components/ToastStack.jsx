import React, { useEffect, useState } from 'react';

let toastIdCounter = 0;

export const useToastStack = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, severity = 'info', duration = 4000) => {
        const id = ++toastIdCounter;
        setToasts((prev) => [...prev, { id, message, severity, duration }]);
        return id;
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return { toasts, addToast, removeToast };
};

export function ToastStack({ toasts, onRemove }) {
    return (
        <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex flex-col gap-2">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onRemove }) {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), toast.duration);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onRemove]);

    const severityStyles = {
        success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        error: 'bg-red-50 border-red-200 text-red-700',
        warning: 'bg-amber-50 border-amber-200 text-amber-700',
        info: 'bg-[#eef2ff] border-[#c7d2fe] text-[#28106F]',
    };

    return (
        <div className={`pointer-events-auto flex items-center gap-3 rounded-[16px] border px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur ${severityStyles[toast.severity] || severityStyles.info}`}>
            <span className="text-[13px] font-bold leading-5">{toast.message}</span>
            <button
                onClick={() => onRemove(toast.id)}
                className="rounded-full p-1 text-[10px] font-black opacity-60 transition hover:opacity-100"
            >
                ✕
            </button>
        </div>
    );
}
