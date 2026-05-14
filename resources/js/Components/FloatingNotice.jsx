import React from 'react';

export default function FloatingNotice({ notices = [], onClose, topClass = 'top-24' }) {
    if (!notices.length) return null;

    return (
        <div className={`pointer-events-none fixed right-8 ${topClass} z-[450] flex w-[360px] flex-col gap-3`}>
            {notices.map((notice) => (
                <div
                    key={notice.key}
                    className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.18)] backdrop-blur-sm ${
                        notice.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50/95 text-emerald-800'
                            : notice.type === 'warning'
                                ? 'border-amber-200 bg-amber-50/95 text-amber-800'
                                : notice.type === 'info'
                                    ? 'border-indigo-200 bg-indigo-50/95 text-indigo-800'
                                    : 'border-rose-200 bg-rose-50/95 text-rose-700'
                    }`}
                >
                    <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold leading-6">{notice.text}</p>
                        <button
                            type="button"
                            onClick={() => onClose?.(notice.key)}
                            className="text-xs font-black opacity-60 hover:opacity-100"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
