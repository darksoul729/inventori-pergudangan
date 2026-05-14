import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

export default function CustomDropdown({
    value,
    onChange,
    options = [],
    placeholder = 'Pilih opsi',
    disabled = false,
    tone = 'indigo',
    className = '',
    triggerClassName = '',
    unstyled = false,
    searchable = true,
    modalTitle = 'Pilih Data',
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const ref = useRef(null);
    const selected = options.find((opt) => String(opt.value) === String(value));
    const hasOptions = options.length > 0;
    const toneClasses = tone === 'teal'
        ? 'focus-within:border-teal-600 focus-within:ring-1 focus-within:ring-teal-600'
        : 'focus-within:border-[#5B33CC] focus-within:ring-1 focus-within:ring-[#5B33CC]';
    const locked = disabled || !hasOptions;
    const filteredOptions = searchable
        ? options.filter((opt) => String(opt.label || '').toLowerCase().includes(search.trim().toLowerCase()))
        : options;

    useEffect(() => {
        if (!open) return;
        const selectedIndex = filteredOptions.findIndex((opt) => String(opt.value) === String(value));
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }, [open, filteredOptions, value]);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setOpen(false);
                setSearch('');
                return;
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                if (!filteredOptions.length) return;
                setActiveIndex((prev) => (prev + 1) % filteredOptions.length);
                return;
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();
                if (!filteredOptions.length) return;
                setActiveIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
                return;
            }

            if (event.key === 'Enter') {
                const active = filteredOptions[activeIndex];
                if (!active) return;
                event.preventDefault();
                onChange(String(active.value));
                setOpen(false);
                setSearch('');
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [activeIndex, filteredOptions, onChange, open]);

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => !locked && setOpen((prev) => !prev)}
                disabled={locked}
                className={unstyled
                    ? `w-full disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-between gap-3 ${triggerClassName}`
                    : `w-full bg-[#f8f9fb] border border-transparent ${toneClasses} px-4 py-3 rounded-xl font-bold text-left text-[#4722B3] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-between gap-3 ${triggerClassName}`
                }
            >
                <span className={!selected ? 'text-gray-500' : ''}>{selected?.label || placeholder}</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && createPortal((
                <div className="fixed inset-0 z-[2147483000]">
                    <button
                        type="button"
                        aria-label="Tutup"
                        className="absolute inset-0 bg-black/30"
                        onClick={() => {
                            setOpen(false);
                            setSearch('');
                        }}
                    />
                    <div className="absolute left-1/2 top-1/2 w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
                        <div className="border-b border-gray-100 px-4 py-3">
                            <div className="text-[13px] font-black text-[#4722B3]">{modalTitle}</div>
                            {searchable && (
                                <input
                                    autoFocus
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari data..."
                                    className="mt-2 w-full rounded-xl border border-gray-200 bg-[#f8f9fb] px-3 py-2 text-[13px] font-semibold text-gray-700 focus:border-[#5B33CC] focus:ring-1 focus:ring-[#5B33CC]"
                                />
                            )}
                        </div>
                        <div className="max-h-[55vh] overflow-y-auto">
                            {filteredOptions.length === 0 && (
                                <div className="px-4 py-6 text-center text-[12px] font-semibold text-gray-400">Data tidak ditemukan</div>
                            )}
                            {filteredOptions.map((opt, idx) => {
                                const isSelected = String(opt.value) === String(value);
                                const isActive = idx === activeIndex;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(String(opt.value));
                                            setOpen(false);
                                            setSearch('');
                                        }}
                                        onMouseEnter={() => setActiveIndex(idx)}
                                        className={`w-full px-4 py-3 text-left text-[14px] font-semibold flex items-center justify-between gap-3 ${isActive ? 'bg-gray-50' : 'hover:bg-gray-50'} ${isSelected ? 'text-[#4722B3] bg-indigo-50/40' : 'text-gray-700'}`}
                                    >
                                        <span className="flex min-w-0 items-center gap-3">
                                            {opt.image ? <img src={opt.image} alt="" className="h-8 w-8 rounded-lg border border-gray-100 object-cover" /> : null}
                                            <span className="truncate">{opt.label}</span>
                                        </span>
                                        {isSelected && <Check className="h-4 w-4 text-[#5B33CC]" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ), document.body)}
        </div>
    );
}
