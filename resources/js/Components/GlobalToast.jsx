import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function GlobalToast() {
    const { props } = usePage();
    const flash = props?.flash || {};
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        if (flash.success) {
            addToast(flash.success, 'success');
        }
        if (flash.error) {
            addToast(flash.error, 'error');
        }
        if (flash.warning) {
            addToast(flash.warning, 'warning');
        }
        if (flash.info) {
            addToast(flash.info, 'info');
        }
    }, [flash]);

    const addToast = (message, type) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    useEffect(() => {
        if (toasts.length > 0) {
            const timers = toasts.map(toast => {
                return setTimeout(() => {
                    removeToast(toast.id);
                }, 5000);
            });
            return () => {
                timers.forEach(timer => clearTimeout(timer));
            };
        }
    }, [toasts]);

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => {
                    const isSuccess = toast.type === 'success';
                    const isError = toast.type === 'error';
                    const isWarning = toast.type === 'warning';
                    
                    const Icon = isSuccess ? CheckCircle2 : isError ? AlertCircle : Info;
                    const bgClass = isSuccess ? 'bg-emerald-50 border-emerald-200' : isError ? 'bg-rose-50 border-rose-200' : isWarning ? 'bg-amber-50 border-amber-200' : 'bg-indigo-50 border-indigo-200';
                    const textClass = isSuccess ? 'text-emerald-700' : isError ? 'text-rose-700' : isWarning ? 'text-amber-700' : 'text-indigo-700';
                    const iconClass = isSuccess ? 'text-emerald-500' : isError ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-indigo-500';

                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl max-w-sm ${bgClass}`}
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconClass}`} />
                            <div className={`flex-1 text-[14px] font-bold leading-relaxed ${textClass}`}>
                                {toast.message}
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className={`flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 ${textClass}`}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
