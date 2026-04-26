import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import { ToastStack, useToastStack } from '@/Components/ToastStack';
import { CanvasErrorBoundary } from '@/Components/ErrorBoundary';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useDebouncedAutoSave } from '@/hooks/useDebouncedAutoSave';

const GRID_SIZE = 20;
let CANVAS_WIDTH = 1680;
let CANVAS_HEIGHT = 980;
const MIN_SCALE = 0.6;
const MAX_SCALE = 1.75;

const TYPE_STYLES = {
    storage: { label: 'Storage', bg: '#f8dcdc', border: '#f1b9b8', badge: '#fff1f2', text: '#9f1239', chip: '#fbe7e7' },
    high_pick: { label: 'High Pick', bg: '#ffe8c8', border: '#f6c98f', badge: '#fff7ed', text: '#9a3412', chip: '#ffedd5' },
    bulk_storage: { label: 'Bulk Storage', bg: '#dce9fb', border: '#abc9f4', badge: '#eff6ff', text: '#1d4ed8', chip: '#dbeafe' },
    electronics: { label: 'Electronics', bg: '#e5dcff', border: '#c9b8ff', badge: '#f5f3ff', text: '#6d28d9', chip: '#ede9fe' },
    cross_dock: { label: 'Cross Dock', bg: '#d8f1ea', border: '#9fddca', badge: '#ecfdf5', text: '#0f766e', chip: '#d1fae5' },
    hazmat: { label: 'Hazmat', bg: '#ffd9da', border: '#ffaaaa', badge: '#fff1f2', text: '#dc2626', chip: '#ffe4e6' },
    inbound: { label: 'Inbound', bg: '#d8f0ff', border: '#8dd0ff', badge: '#eff6ff', text: '#0369a1', chip: '#e0f2fe' },
    outbound: { label: 'Outbound', bg: '#ede9fe', border: '#c4b5fd', badge: '#f5f3ff', text: '#6d28d9', chip: '#ede9fe' },
    rack: { label: 'Rack', bg: '#F8F7FF', border: '#cbd5e1', badge: '#F8F7FF', text: '#334155', chip: '#f1f5f9' },
    wall: { label: 'Wall', bg: '#334155', border: '#0f172a', badge: '#e2e8f0', text: '#0f172a', chip: '#cbd5e1' },
};

const TYPE_OPTIONS = [
    { value: 'storage', label: 'Storage' },
    { value: 'high_pick', label: 'High Pick' },
    { value: 'bulk_storage', label: 'Bulk Storage' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'cross_dock', label: 'Cross Dock' },
    { value: 'hazmat', label: 'Hazmat' },
    { value: 'wall', label: 'Wall' },
];

const ADD_ACTIONS = [
    { id: 'zone', label: 'Add Zone', type: 'storage', kind: 'zone' },
    { id: 'rack', label: 'Add Rack', type: 'rack', kind: 'rack' },
    { id: 'wall', label: 'Add Wall', type: 'wall', kind: 'structure' },
    { id: 'inbound', label: 'Add Area Inbound', type: 'inbound', kind: 'area' },
    { id: 'outbound', label: 'Add Area Outbound', type: 'outbound', kind: 'area' },
    { id: 'cross_dock', label: 'Add Cross Dock', type: 'cross_dock', kind: 'zone' },
    { id: 'hazmat', label: 'Add Hazmat Area', type: 'hazmat', kind: 'zone' },
];

const STATUS_OPTIONS = [
    { value: 'active', label: 'Aktif' },
    { value: 'planned', label: 'Planned' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'inactive', label: 'Inactive' },
];

const RESIZE_DIRECTIONS = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const LAYOUT_STORAGE_KEY = 'warehouse-layout-editor-draft-v1';
const TEMPLATE_OPTIONS = [
    { value: 'data_driven', label: 'Data Aktual (Rekomendasi)' },
    { value: 'flow', label: 'Flow Inbound → Outbound' },
    { value: 'dense', label: 'Kepadatan Tinggi' },
    { value: 'db_exact', label: 'Urutan Rak DB (Exact)' },
];

const normalizeTypeKey = (value = '') => String(value).toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_');
const normalizeTemplateKey = (value = 'data_driven') => {
    const map = {
        balanced: 'data_driven',
        throughput: 'flow',
        compact: 'dense',
        db: 'db_exact',
    };

    const normalized = String(value || '').toLowerCase();
    const mapped = map[normalized] || normalized;
    return TEMPLATE_OPTIONS.some((option) => option.value === mapped) ? mapped : 'data_driven';
};
const formatNumber = (value) => new Intl.NumberFormat('id-ID').format(value ?? 0);
const formatPercent = (value) => `${Math.max(0, Math.min(999, Number(value) || 0))}%`;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const snap = (value) => Math.round(value / GRID_SIZE) * GRID_SIZE;
const createId = () => `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const formatDateTime = (iso) => {
    if (!iso) return '-';
    try {
        return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '-';
    }
};

function buildRackFrameByTemplate(index, total, zoneFrame, template = 'data_driven') {
    if (template === 'db_exact') {
        const laneCount = Math.max(1, Math.floor((zoneFrame.h - 80) / 60)); 
        const laneIndex = index % laneCount;
        const columnIndex = Math.floor(index / laneCount);
        const widthShrink = Math.min(columnIndex * 28, Math.max(0, zoneFrame.w * 0.35));
        const rackWidth = clamp(snap(zoneFrame.w - 56 - widthShrink), 120, Math.max(120, zoneFrame.w - 40));

        return {
            x: snap(zoneFrame.x + 20 + columnIndex * 40),
            y: snap(zoneFrame.y + 44 + laneIndex * 60), 
            w: rackWidth,
            h: 44, 
        };
    }

    if (template === 'dense') {
        const laneCount = Math.max(1, Math.floor((zoneFrame.h - 80) / 54));
        const laneIndex = index % laneCount;
        const columnIndex = Math.floor(index / laneCount);
        return {
            x: snap(zoneFrame.x + 20 + columnIndex * 40),
            y: snap(zoneFrame.y + 44 + laneIndex * 54),
            w: clamp(snap(zoneFrame.w - 60 - columnIndex * 22), 110, Math.max(110, zoneFrame.w - 32)),
            h: 44,
        };
    }

    if (template === 'flow') {
        const laneCount = Math.max(1, Math.floor((zoneFrame.h - 80) / 64));
        const laneIndex = index % laneCount;
        const columnIndex = Math.floor(index / laneCount);
        const stagger = laneIndex % 2 === 0 ? 0 : 20;
        return {
            x: snap(zoneFrame.x + 20 + columnIndex * 40 + stagger),
            y: snap(zoneFrame.y + 46 + laneIndex * 64),
            w: clamp(snap(zoneFrame.w - 72 - columnIndex * 24), 120, Math.max(120, zoneFrame.w - 40)),
            h: 44,
        };
    }

    return buildRackFrame(index, zoneFrame);
}

const getTypeStyle = (type, fallback = 'storage') => TYPE_STYLES[normalizeTypeKey(type)] || TYPE_STYLES[fallback];
const isStructuralType = (type) => ['wall'].includes(normalizeTypeKey(type));
const getItemMinSize = (item) => {
    const type = normalizeTypeKey(item?.type);
    if (type === 'wall') return { minW: 120, minH: 12 };
    if (item?.kind === 'rack') return { minW: 80, minH: 44 };
    return { minW: 120, minH: 80 };
};


function SelectIcon({ className = 'h-4 w-4' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5l7 14 2-6 5-2L5 5z" />
        </svg>
    );
}

function buildTemplateZoneFrame(index, zones = [], template = 'data_driven') {
    const zoneCount = Math.max(1, zones.length || index + 1);
    const targetZone = zones[index] || {};
    const capacity = Math.max(1, Number(targetZone.capacity) || 1);
    const occupancy = clamp(Number(targetZone.occupancy) || 0, 0, 100);

    const columns = template === 'flow'
        ? Math.min(4, zoneCount)
        : template === 'dense'
            ? Math.min(4, Math.max(2, Math.ceil(Math.sqrt(zoneCount + 1))))
            : Math.min(3, Math.max(2, Math.ceil(Math.sqrt(zoneCount))));
    const rows = Math.max(1, Math.ceil(zoneCount / columns));

    const startX = 150;
    const startY = 150;
    const gapX = template === 'dense' ? 36 : 52;
    const gapY = template === 'dense' ? 30 : 46;
    const maxFrameWidth = template === 'flow' ? 1800 : 1520;
    const maxFrameHeight = template === 'dense' ? 700 : 820;

    const col = index % columns;
    const row = Math.floor(index / columns);

    const slotW = (maxFrameWidth - (columns - 1) * gapX) / columns;
    const slotH = (maxFrameHeight - (rows - 1) * gapY) / rows;

    const capacityFactor = clamp(capacity / 2400, 0.65, 1.25);
    const occupancyFactor = clamp(0.8 + occupancy / 250, 0.75, 1.2);

    let widthFactor = 0.92;
    let heightFactor = 0.88;

    if (template === 'flow') {
        widthFactor = 1.02;
        heightFactor = 0.78;
    }
    if (template === 'dense') {
        widthFactor = 0.95;
        heightFactor = 0.94;
    }

    const w = snap(clamp(slotW * widthFactor * occupancyFactor, 160, Math.max(160, slotW * 0.95)));
    const h = snap(clamp(slotH * heightFactor * capacityFactor, 140, Math.max(140, slotH * 0.95)));

    const laneOffset = template === 'flow' && row % 2 === 1 ? 24 : 0;

    return {
        x: snap(startX + col * (slotW + gapX) + laneOffset),
        y: snap(startY + row * (slotH + gapY)),
        w,
        h,
    };
}

function isRackInsideZone(rack, zone) {
    return (
        rack.x >= zone.x &&
        rack.y >= zone.y &&
        rack.x + rack.w <= zone.x + zone.w &&
        rack.y + rack.h <= zone.y + zone.h
    );
}

function clampRackToZone(rack, zone) {
    const maxW = Math.max(GRID_SIZE * 2, zone.w - GRID_SIZE * 2);
    const maxH = Math.max(GRID_SIZE, zone.h - GRID_SIZE * 2);
    const nextW = clamp(snap(rack.w), GRID_SIZE * 2, maxW);
    const nextH = clamp(snap(rack.h), GRID_SIZE, maxH);

    return {
        ...rack,
        w: nextW,
        h: nextH,
        x: clamp(snap(rack.x), zone.x, zone.x + zone.w - nextW),
        y: clamp(snap(rack.y), zone.y, zone.y + zone.h - nextH),
        zoneId: zone.id,
        zoneServerId: zone.serverId ?? null,
    };
}

function normalizeRackPlacements(items) {
    const zones = items.filter((item) => item.kind === 'zone');
    const invalidRackIds = [];

    const mapped = items.map((item) => {
        if (item.kind !== 'rack') return item;

        const assigned = zones.find((zone) => zone.id === item.zoneId);
        const containing = zones.find((zone) => isRackInsideZone(item, zone));
        const targetZone = containing || assigned;

        if (!targetZone) {
            invalidRackIds.push(item.id);
            return item;
        }

        return clampRackToZone(item, targetZone);
    });

    return { items: mapped, invalidRackIds };
}

function SketchIcon({ className = 'h-4 w-4' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20l4.5-1 9-9a2.1 2.1 0 10-3-3l-9 9L4 20z" />
        </svg>
    );
}

function SaveIcon({ className = 'h-4 w-4' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h8l4 4v12a2 2 0 01-2 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3v6h8" />
        </svg>
    );
}

function UndoIcon({ className = 'h-4 w-4' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l-4-4m0 0l4-4m-4 4h11a4 4 0 014 4v0a4 4 0 01-4 4H5" />
        </svg>
    );
}

function RedoIcon({ className = 'h-4 w-4' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 14l4-4m0 0l-4-4m4 4H9a4 4 0 00-4 4v0a4 4 0 004 4h11" />
        </svg>
    );
}

function ResetIcon({ className = 'h-4 w-4' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 9a8 8 0 00-14.3-4M4 15a8 8 0 0014.3 4" />
        </svg>
    );
}

function ZoomInIcon({ className = 'h-4 w-4' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5v12M5 11h12M20 20l-4-4" />
            <circle cx="11" cy="11" r="7" strokeWidth={2} />
        </svg>
    );
}

function ZoomOutIcon({ className = 'h-4 w-4' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11h12M20 20l-4-4" />
            <circle cx="11" cy="11" r="7" strokeWidth={2} />
        </svg>
    );
}

function DuplicateIcon({ className = 'h-4 w-4' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="9" y="9" width="11" height="11" rx="2" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 15H5a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v1" />
        </svg>
    );
}

function TrashIcon({ className = 'h-4 w-4' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
        </svg>
    );
}

function TransferIcon({ className = 'h-4 w-4' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h11m0 0l-4-4m4 4l-4 4M17 17H6m0 0l4 4m-4-4l4-4" />
        </svg>
    );
}

function RotateIcon({ className = 'h-4 w-4' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 4h5v5M9 20H4v-5" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9a7 7 0 00-12-4M5 15a7 7 0 0012 4" />
        </svg>
    );
}

function LayersIcon({ className = 'h-4 w-4' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 16l9 5 9-5" />
        </svg>
    );
}

function ActivityIcon({ className = 'h-4 w-4' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    );
}

function PanelIcon({ className = 'h-4 w-4' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16M4 12h10M4 19h16" />
        </svg>
    );
}

function Modal({ open, title, subtitle, onClose, children }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[12000] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4 py-8">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white p-7 shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-[22px] font-black tracking-tight text-[#28106F]">{title}</h3>
                        {subtitle ? <p className="mt-1 text-[13px] font-semibold text-slate-500">{subtitle}</p> : null}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500"
                    >
                        Tutup
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

function Field({ label, children, hint }) {
    return (
        <label className="block">
            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</div>
            {children}
            {hint ? <div className="mt-2 text-[11px] font-semibold text-slate-400">{hint}</div> : null}
        </label>
    );
}

function BaseInput(props) {
    return (
        <input
            {...props}
            className={`w-full rounded-[14px] border border-[#dbe4f0] bg-white px-4 py-3 text-[13px] font-semibold text-[#28106F] shadow-sm outline-none transition focus:border-[#28106F] focus:ring-2 focus:ring-[#c7d2fe] ${props.className || ''}`}
        />
    );
}

function BaseTextArea(props) {
    return (
        <textarea
            {...props}
            className={`w-full rounded-[14px] border border-[#dbe4f0] bg-white px-4 py-3 text-[13px] font-semibold text-[#28106F] shadow-sm outline-none transition focus:border-[#28106F] focus:ring-2 focus:ring-[#c7d2fe] ${props.className || ''}`}
        />
    );
}

function BaseSelect({ options, className = '', ...props }) {
    return (
        <select
            {...props}
            className={`w-full rounded-[14px] border border-[#dbe4f0] bg-white px-4 py-3 text-[13px] font-semibold text-[#28106F] shadow-sm outline-none transition focus:border-[#28106F] focus:ring-2 focus:ring-[#c7d2fe] ${className}`}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}

function ToolbarButton({ active = false, tone = 'default', disabled = false, icon, children, ...props }) {
    const toneClass = disabled
        ? 'border-[#e2e8f0] bg-[#f1f5f9] text-slate-400 cursor-not-allowed'
        : tone === 'primary'
            ? 'border-[#28106F] bg-[#28106F] text-white shadow-[0_10px_20px_rgba(89,50,201,0.18)]'
            : tone === 'subtle'
                ? 'border-[#dbe4f0] bg-[#F8F7FF] text-slate-700 hover:bg-slate-100'
                : active
                    ? 'border-[#28106F] bg-[#eef2ff] text-[#28106F]'
                    : 'border-[#dbe4f0] bg-white text-slate-600 hover:bg-slate-50';

    return (
        <button
            type="button"
            disabled={disabled}
            {...props}
            className={`inline-flex shrink-0 items-center gap-2 rounded-[14px] border px-4 text-[11px] font-black uppercase tracking-[0.15em] transition ${toneClass} ${props.className || ''}`}
        >
            {icon}
            <span>{children}</span>
        </button>
    );
}

function ToolRailButton({ active = false, icon, label, caption, ...props }) {
    return (
        <button
            type="button"
            {...props}
            title={label}
            className={`group flex w-full flex-col items-center gap-1 rounded-[16px] border px-1 py-2.5 text-center transition ${active
                ? 'border-[#28106F] bg-[#eef2ff] text-[#28106F] shadow-[0_12px_24px_rgba(89,50,201,0.12)]'
                : 'border-[#e2e8f0] bg-white/92 text-slate-500 hover:border-[#c7d2fe] hover:text-[#28106F] hover:shadow-[0_8px_18px_rgba(148,163,184,0.12)]'
                } ${props.className || ''}`}
        >
            <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#F8F7FF] transition group-hover:bg-[#eef2ff]">
                {icon}
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.18em]">{label}</span>
            {caption ? <span className="text-[7px] font-bold uppercase tracking-[0.16em] text-slate-400">{caption}</span> : null}
        </button>
    );
}

function SummaryChip({ label, value, accent = 'text-[#28106F]' }) {
    return (
        <div className="rounded-[14px] border border-[#e6ebf5] bg-white px-3 py-2.5 shadow-[0_8px_18px_rgba(148,163,184,0.06)]">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</div>
            <div className={`mt-1 text-[15px] font-black tracking-tight ${accent}`}>{value}</div>
        </div>
    );
}

function InspectorSection({ title, children, action }) {
    return (
        <section className="rounded-[18px] border border-[#e6ebf5] bg-white p-3.5 shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{title}</div>
                {action}
            </div>
            {children}
        </section>
    );
}

function buildZoneFrame(index) {
    const presets = [
        { x: 170, y: 170, w: 320, h: 210 },
        { x: 560, y: 170, w: 320, h: 210 },
        { x: 950, y: 170, w: 320, h: 210 },
        { x: 170, y: 470, w: 320, h: 190 },
        { x: 560, y: 470, w: 320, h: 190 },
        { x: 950, y: 470, w: 320, h: 190 },
    ];

    return presets[index] || {
        x: 80 + ((index % 3) * 500),
        y: 120 + (Math.floor(index / 3) * 280),
        w: 420,
        h: 220,
    };
}

function buildRackFrame(index, zoneFrame) {
    const laneCount = Math.max(1, Math.floor((zoneFrame.h - 80) / 60));
    const laneIndex = index % laneCount;
    const columnIndex = Math.floor(index / laneCount);
    const baseWidth = Math.max(140, zoneFrame.w - 68 - columnIndex * 40);
    return {
        x: snap(zoneFrame.x + 20 + columnIndex * 40),
        y: snap(zoneFrame.y + 48 + laneIndex * 60),
        w: snap(baseWidth),
        h: 44,
    };
}

const WAREHOUSE_LAYOUT_PRESETS = {
    data_driven: {
        width: 1720, height: 1040,
        walls: [
            { id: 'wall-n', kind: 'structure', type: 'wall', name: 'North Boundary', code: 'BN-N', x: 80, y: 100, w: 1560, h: 20 },
            { id: 'wall-w', kind: 'structure', type: 'wall', name: 'West Boundary', code: 'BN-W', x: 80, y: 100, w: 20, h: 840 },
            { id: 'wall-e', kind: 'structure', type: 'wall', name: 'East Boundary', code: 'BN-E', x: 1620, y: 100, w: 20, h: 840 },
            { id: 'wall-s1', kind: 'structure', type: 'wall', name: 'South Dock', code: 'BN-S1', x: 80, y: 920, w: 600, h: 20 },
            { id: 'wall-s2', kind: 'structure', type: 'wall', name: 'South Door', code: 'BN-S2', x: 800, y: 920, w: 260, h: 20 },
            { id: 'wall-s3', kind: 'structure', type: 'wall', name: 'South Bay', code: 'BN-S3', x: 1180, y: 920, w: 460, h: 20 },
            { id: 'wall-h1', kind: 'structure', type: 'wall', name: 'Inner Divider V', code: 'DV-01', x: 1200, y: 120, w: 16, h: 320 },
            { id: 'wall-h2', kind: 'structure', type: 'wall', name: 'Inner Divider H', code: 'DH-01', x: 1216, y: 424, w: 284, h: 16 },
            { id: 'pillar-1', kind: 'structure', type: 'wall', name: 'Pillar A', code: 'P-A', x: 600, y: 480, w: 36, h: 36 },
            { id: 'pillar-2', kind: 'structure', type: 'wall', name: 'Pillar B', code: 'P-B', x: 1040, y: 480, w: 36, h: 36 }
        ]
    },
    dense: {
        width: 1400, height: 960,
        walls: [
            { id: 'w-n', kind: 'structure', type: 'wall', name: 'North Boundary', code: 'W-N', x: 60, y: 60, w: 1280, h: 20 },
            { id: 'w-w', kind: 'structure', type: 'wall', name: 'West Boundary', code: 'W-W', x: 60, y: 60, w: 20, h: 840 },
            { id: 'w-e', kind: 'structure', type: 'wall', name: 'East Boundary', code: 'W-E', x: 1320, y: 60, w: 20, h: 840 },
            { id: 'w-s', kind: 'structure', type: 'wall', name: 'South Compact', code: 'W-S', x: 60, y: 880, w: 1280, h: 20 },
            { id: 'pillar-1', kind: 'structure', type: 'wall', name: 'Core Pillar', code: 'P-A', x: 700, y: 480, w: 40, h: 40 }
        ]
    },
    flow: {
        width: 2200, height: 1100,
        walls: [
            { id: 'w-n', kind: 'structure', type: 'wall', name: 'Inbound Line', code: 'W-N', x: 60, y: 80, w: 2080, h: 20 },
            { id: 'w-s', kind: 'structure', type: 'wall', name: 'Outbound Line', code: 'W-S', x: 60, y: 1000, w: 2080, h: 20 },
            { id: 'w-w', kind: 'structure', type: 'wall', name: 'West Line', code: 'W-W', x: 60, y: 80, w: 20, h: 940 },
            { id: 'w-e', kind: 'structure', type: 'wall', name: 'East Line', code: 'W-E', x: 2120, y: 80, w: 20, h: 940 },
            { id: 'divider-flow', kind: 'structure', type: 'wall', name: 'Center Divider', code: 'C-D', x: 1100, y: 100, w: 20, h: 600 }
        ]
    },
    db_exact: {
         width: 1680, height: 980,
         walls: [
            { id: 'w-n', kind: 'structure', type: 'wall', name: 'North Boundary', code: 'W-N', x: 80, y: 80, w: 1520, h: 20 },
            { id: 'w-w', kind: 'structure', type: 'wall', name: 'West Boundary', code: 'W-W', x: 80, y: 80, w: 20, h: 820 },
            { id: 'w-e', kind: 'structure', type: 'wall', name: 'East Boundary', code: 'W-E', x: 1580, y: 80, w: 20, h: 820 },
            { id: 'w-s', kind: 'structure', type: 'wall', name: 'South Boundary', code: 'W-S', x: 80, y: 880, w: 1520, h: 20 }
        ]
    }
};

function createInitialItems({ zoneSummaries, rackSummaries, savedLayout }) {
    if (savedLayout) {
        const items = [];
        const zoneSummaryMap = new Map((zoneSummaries || []).map((zone) => [zone.id, zone]));
        const savedZoneGeometryMap = new Map((savedLayout.zones || []).map((zone) => [zone.id, zone]));
        const savedRackGeometryMap = new Map((savedLayout.racks || []).map((rack) => [rack.id, rack]));

        (savedLayout.elements || []).forEach((el, index) => {
            items.push({
                id: `el-${el.id ?? index}`,
                serverId: el.id ?? null,
                source: 'server',
                kind: el.element_type === 'wall' ? 'structure' : 'area',
                type: el.element_type,
                name: el.name,
                code: el.code ?? `EL-${index + 1}`,
                capacity: 0,
                occupancy: 0,
                status: el.status ?? 'active',
                color: getTypeStyle(el.element_type).bg,
                x: el.pos_x ?? 0,
                y: el.pos_y ?? 0,
                w: el.width ?? 120,
                h: el.height ?? 80,
                rotation: el.rotation ?? 0,
                metadata: el.metadata ?? {},
                zoneId: null,
                zoneServerId: null,
            });
        });

        const zonesSource = (savedLayout.zones || []).length ? savedLayout.zones : (zoneSummaries || []);
        zonesSource.forEach((zone, index) => {
            const zoneId = zone.id;
            const zoneSummary = zoneSummaryMap.get(zoneId);
            const zoneGeometry = savedZoneGeometryMap.get(zoneId) || zone;
            const zoneType = normalizeTypeKey(zone.type ?? zoneSummary?.type ?? 'storage');

            items.push({
                id: `zone-${zoneId}`,
                serverId: zoneId,
                source: 'server',
                kind: 'zone',
                type: zoneType,
                name: zone.name ?? zoneSummary?.name ?? `Zone ${index + 1}`,
                code: zone.code ?? zoneSummary?.code ?? `ZONE-${index + 1}`,
                capacity: zoneSummary?.capacity ?? zone.capacity ?? 0,
                occupancy: zoneSummary?.occupancy ?? zone.occupancy ?? 0,
                status: (zoneSummary?.is_active ?? zone.is_active) ? 'active' : 'inactive',
                color: getTypeStyle(zoneType).bg,
                x: zoneGeometry.pos_x ?? 170,
                y: zoneGeometry.pos_y ?? 170,
                w: zoneGeometry.width ?? 320,
                h: zoneGeometry.height ?? 210,
                rotation: zoneGeometry.rotation ?? 0,
                metadata: {
                    rackCount: zoneSummary?.rack_count ?? zone.racks?.length ?? 0,
                    used: zoneSummary?.used ?? 0,
                },
                zoneId: null,
                zoneServerId: null,
            });

            const racksInZone = (rackSummaries || [])
                .filter((rack) => rack.zone_id === zoneId)
                .sort((a, b) => String(a.code).localeCompare(String(b.code)));

            racksInZone.forEach((rack, rackIndex) => {
                const rackGeometry = savedRackGeometryMap.get(rack.id);
                const zoneX = zoneGeometry.pos_x ?? 170;
                const zoneY = zoneGeometry.pos_y ?? 170;

                items.push({
                    id: `rack-${rack.id}`,
                    serverId: rack.id,
                    source: 'server',
                    kind: 'rack',
                    type: 'rack',
                    zoneId: `zone-${zoneId}`,
                    zoneServerId: zoneId,
                    name: rack.name,
                    code: rack.code,
                    capacity: rack.capacity ?? 0,
                    occupancy: rack.occupancy ?? 0,
                    status: rack.status ?? 'active',
                    color: getTypeStyle('rack').bg,
                    x: rackGeometry?.pos_x ?? (zoneX + 20 + rackIndex * 16),
                    y: rackGeometry?.pos_y ?? (zoneY + 50 + (rackIndex % 8) * 24),
                    w: rackGeometry?.width ?? 120,
                    h: rackGeometry?.height ?? 54,
                    rotation: rackGeometry?.rotation ?? 0,
                    metadata: {
                        skus: rack.skus ?? 0,
                        items: rack.items ?? 0,
                        rackType: rack.rack_type ?? 'STANDARD',
                    },
                });
            });
        });

        return items;
    }

    const structuralPreset = WAREHOUSE_LAYOUT_PRESET.map((item) => ({
        ...item,
        serverId: null,
        source: 'local',
        zoneId: null,
        zoneServerId: null,
        capacity: 0,
        occupancy: 0,
        status: 'active',
        color: getTypeStyle(item.type, 'wall').bg,
        metadata: { preset: true },
    }));

    const zoneFrames = new Map();
    const zones = zoneSummaries.map((zone, index) => {
        const type = normalizeTypeKey(zone.type);
        const frame = buildZoneFrame(index);
        zoneFrames.set(zone.id, frame);

        return {
            id: `zone-${zone.id}`,
            serverId: zone.id,
            source: 'server',
            kind: 'zone',
            type,
            name: zone.name,
            code: zone.code,
            capacity: zone.capacity ?? 0,
            occupancy: zone.occupancy ?? 0,
            status: zone.is_active ? 'active' : 'inactive',
            color: getTypeStyle(type).bg,
            x: frame.x,
            y: frame.y,
            w: frame.w,
            h: frame.h,
            rotation: 0,
            metadata: { rackCount: zone.rack_count ?? 0, used: zone.used ?? 0 },
        };
    });

    const racksByZone = rackSummaries.reduce((acc, rack) => {
        const items = acc.get(rack.zone_id) || [];
        items.push(rack);
        acc.set(rack.zone_id, items);
        return acc;
    }, new Map());

    const racks = Array.from(racksByZone.entries()).flatMap(([zoneId, racksInZone]) => {
        const frame = zoneFrames.get(zoneId) || buildZoneFrame(0);

        return racksInZone
            .sort((a, b) => String(a.code).localeCompare(String(b.code)))
            .map((rack, index) => {
                const box = buildRackFrame(index, frame);
                return {
                    id: `rack-${rack.id}`,
                    serverId: rack.id,
                    source: 'server',
                    kind: 'rack',
                    type: 'rack',
                    zoneId: `zone-${zoneId}`,
                    zoneServerId: zoneId,
                    name: rack.name,
                    code: rack.code,
                    capacity: rack.capacity ?? 0,
                    occupancy: rack.occupancy ?? 0,
                    status: rack.status ?? 'active',
                    color: getTypeStyle('rack').bg,
                    x: box.x,
                    y: box.y,
                    w: box.w,
                    h: box.h,
                    rotation: 0,
                    metadata: { skus: rack.skus ?? 0, items: rack.items ?? 0, rackType: rack.rack_type ?? 'STANDARD' },
                };
            });
    });

    const staticAreas = [
        {
            id: 'area-inbound',
            serverId: null,
            source: 'local',
            kind: 'area',
            type: 'inbound',
            name: 'Inbound Dock',
            code: 'IN-01',
            capacity: 0,
            occupancy: 0,
            status: 'active',
            color: getTypeStyle('inbound').bg,
            x: 80,
            y: 38,
            w: 460,
            h: 54,
            rotation: 0,
            metadata: { source: 'system-default' },
        },
        {
            id: 'area-outbound',
            serverId: null,
            source: 'local',
            kind: 'area',
            type: 'outbound',
            name: 'Outbound Dispatch',
            code: 'OUT-01',
            capacity: 0,
            occupancy: 0,
            status: 'active',
            color: getTypeStyle('outbound').bg,
            x: 1180,
            y: 38,
            w: 360,
            h: 54,
            rotation: 0,
            metadata: { source: 'system-default' },
        },
    ];

    return [...structuralPreset, ...staticAreas, ...zones, ...racks];
}

function createDraftFromItem(item) {
    return {
        name: item?.name ?? '',
        code: item?.code ?? '',
        type: item?.type ?? 'storage',
        color: item?.color ?? getTypeStyle(item?.type).bg,
        capacity: item?.capacity ?? 0,
        occupancy: item?.occupancy ?? 0,
        status: item?.status ?? 'active',
        x: item?.x ?? 0,
        y: item?.y ?? 0,
        w: item?.w ?? 0,
        h: item?.h ?? 0,
        rotation: item?.rotation ?? 0,
    };
}

function occupancyTone(value) {
    if (value >= 90) return 'text-red-500';
    if (value >= 70) return 'text-orange-500';
    if (value >= 40) return 'text-amber-500';
    return 'text-emerald-500';
}

const DEFAULT_CANVAS_FRAME = {
    x: 120,
    y: 90,
    w: 1360,
    h: 760,
};

export default function Warehouse({
    warehouse,
    zoneSummaries = [],
    rackSummaries = [],
    activityLog = [],
    pendingManualAdjustments = [],
    selectedZone,
    selectedRack,
    zoneOptions = [],
    productOptions = [],
    status,
    savedLayout,
}) {
    const { props } = usePage();
    const roleName = String(props.auth?.user?.role_name || props.auth?.user?.role || '').toLowerCase();
    const isManager = roleName.includes('manager') || roleName.includes('manajer') || roleName.includes('admin gudang');
    const isSupervisor = roleName.includes('supervisor') || roleName.includes('spv');
    const canManageRackStock = isManager || isSupervisor;
    const canApproveAdjustments = isManager || isSupervisor;

    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('warehouse-view-mode') || 'dashboard';
        }
        return 'dashboard';
    });
    const [dashSelectedZoneId, setDashSelectedZoneId] = useState(selectedZone?.id ?? zoneSummaries[0]?.id ?? null);
    const [mode, setMode] = useState('select');
    const [pendingAddType, setPendingAddType] = useState(null);
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 24, y: 18 });
    const [isPanShortcutActive, setIsPanShortcutActive] = useState(false);
    const [isInspectorOpen, setIsInspectorOpen] = useState(false);
    const [inspectorWidth, setInspectorWidth] = useState(248);
    const [canvasFrame, setCanvasFrame] = useState(DEFAULT_CANVAS_FRAME);
    const [showZoneModal, setShowZoneModal] = useState(false);
    const [showZoneEditModal, setShowZoneEditModal] = useState(false);
    const [editingZoneId, setEditingZoneId] = useState(null);
    const [showRackModal, setShowRackModal] = useState(false);
    const [showRackEditModal, setShowRackEditModal] = useState(false);
    const [editingRackId, setEditingRackId] = useState(null);
    const [showRackStockModal, setShowRackStockModal] = useState(false);
    const [editingRackStock, setEditingRackStock] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isZoneTransitioning, setIsZoneTransitioning] = useState(false);
    const [lastAutoSavedAt, setLastAutoSavedAt] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(() => normalizeTemplateKey('data_driven'));
    const [showHeatmap, setShowHeatmap] = useState(false);
    const { toasts, addToast, removeToast } = useToastStack();
    const selectedTemplateLabel = TEMPLATE_OPTIONS.find((option) => option.value === selectedTemplate)?.label ?? TEMPLATE_OPTIONS[0].label;

    const layoutSeed = useMemo(() => {
        if (savedLayout) {
            return createInitialItems({ zoneSummaries, rackSummaries, savedLayout });
        }
        try {
            const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed?.items) && parsed.items.length) {
                    return parsed.items;
                }
            }
        } catch { /* ignore */ }
        return createInitialItems({ zoneSummaries, rackSummaries });
    }, [zoneSummaries, rackSummaries, savedLayout]);

    const {
        state: layoutItems,
        setState: setLayoutItems,
        undo,
        redo,
        canUndo,
        canRedo,
    } = useUndoRedo(layoutSeed);

    const [selectedItemId, setSelectedItemId] = useState(selectedRack ? `rack-${selectedRack.id}` : selectedZone ? `zone-${selectedZone.id}` : layoutSeed[0]?.id ?? null);
    const [draft, setDraft] = useState(createDraftFromItem(layoutSeed.find((item) => item.id === selectedItemId) || layoutSeed[0]));

    const surfaceRef = useRef(null);
    const viewportRef = useRef(null);
    const gestureRef = useRef(null);
    const toolbarRef = useRef(null);
    const didLoadDraftRef = useRef(false);
    const skipNextSeedSyncRef = useRef(false);
    const invalidRackCursorRef = useRef(0);

    useDebouncedAutoSave(() => {
        if (isManager) {
            const zones = layoutItems.filter((i) => i.kind === 'zone' && i.serverId).map((i) => ({
                id: i.serverId, pos_x: i.x, pos_y: i.y, width: i.w, height: i.h, rotation: i.rotation ?? 0,
            }));
            const racks = layoutItems.filter((i) => i.kind === 'rack' && i.serverId).map((i) => ({
                id: i.serverId, pos_x: i.x, pos_y: i.y, width: i.w, height: i.h, rotation: i.rotation ?? 0,
            }));
            const elements = layoutItems.filter((i) => i.kind === 'structure' || i.kind === 'area').map((i) => ({
                element_type: i.type, name: i.name, code: i.code, pos_x: i.x, pos_y: i.y, width: i.w, height: i.h,
                rotation: i.rotation ?? 0, status: i.status ?? 'active', metadata: i.metadata ?? null,
            }));
            fetch('/warehouse/layout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '' },
                body: JSON.stringify({ zones, racks, elements, canvas: { x: canvasFrame.x, y: canvasFrame.y, w: canvasFrame.w, h: canvasFrame.h } }),
            }).catch(() => {});
        }
    }, [layoutItems, canvasFrame], 3000);

    useDebouncedAutoSave(() => {
        try {
            const payload = {
                items: layoutItems,
                canvasFrame,
                selectedItemId,
                selectedTemplate,
                savedAt: new Date().toISOString(),
            };
            window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(payload));
            setLastAutoSavedAt(payload.savedAt);
        } catch {
            // ignore local storage failures
        }
    }, [layoutItems, canvasFrame, selectedItemId, selectedTemplate], 1200);

    const fitCanvasToViewport = React.useCallback(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const bounds = viewport.getBoundingClientRect();
        const availableWidth = Math.max(bounds.width - 88, 320);
        const availableHeight = Math.max(bounds.height - 96, 320);
        const scaleX = availableWidth / CANVAS_WIDTH;
        const scaleY = availableHeight / CANVAS_HEIGHT;
        const nextScale = clamp(Number(Math.min(scaleX, scaleY, isInspectorOpen ? 1.16 : 1.24).toFixed(2)), MIN_SCALE, isInspectorOpen ? 1.16 : 1.24);

        setScale(nextScale);
        setPan({
            x: Math.max(24, Math.round((availableWidth - CANVAS_WIDTH * nextScale) / 2) + 44),
            y: Math.max(24, Math.round((availableHeight - CANVAS_HEIGHT * nextScale) / 2) + 46),
        });
    }, [isInspectorOpen]);

    const zoneCreateForm = useForm({
        code: '',
        name: '',
        type: 'storage',
        capacity: 1000,
        description: '',
    });

    const zoneEditForm = useForm({
        code: selectedZone?.code ?? '',
        name: selectedZone?.name ?? '',
        type: selectedZone?.type ?? 'storage',
        capacity: selectedZone?.capacity ?? 0,
        description: selectedZone?.description ?? '',
        is_active: selectedZone?.is_active ? 1 : 0,
    });

    const rackCreateForm = useForm({
        warehouse_zone_id: selectedZone?.id ?? zoneOptions[0]?.id ?? '',
        code: '',
        name: '',
        rack_type: 'standard',
        capacity: 250,
        notes: '',
    });

    const rackEditForm = useForm({
        warehouse_zone_id: selectedRack?.warehouse_zone_id ?? selectedZone?.id ?? zoneOptions[0]?.id ?? '',
        code: selectedRack?.code ?? '',
        name: selectedRack?.name ?? '',
        rack_type: selectedRack?.rack_type ?? 'standard',
        capacity: selectedRack?.capacity ?? 0,
        status: selectedRack?.status ?? 'active',
        notes: selectedRack?.notes ?? '',
    });

    const rackStockCreateForm = useForm({
        rack_id: selectedRack?.id ?? '',
        product_id: productOptions[0]?.id ?? '',
        quantity: 0,
        reserved_quantity: 0,
        batch_number: '',
        expired_date: '',
    });

    useEffect(() => {
        if (didLoadDraftRef.current) return;
        try {
            const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
            if (!raw) {
                didLoadDraftRef.current = true;
                return;
            }
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed?.items) && parsed.items.length) {
                setLayoutItems(parsed.items);
                setSelectedItemId(parsed.selectedItemId ?? parsed.items[0]?.id ?? null);
                skipNextSeedSyncRef.current = true;
            }
            if (parsed?.canvasFrame) {
                setCanvasFrame((current) => ({ ...current, ...parsed.canvasFrame }));
            }
            if (parsed?.savedAt) {
                setLastAutoSavedAt(parsed.savedAt);
            }
            if (parsed?.selectedTemplate) {
                setSelectedTemplate(normalizeTemplateKey(parsed.selectedTemplate));
            }
        } catch {
            window.localStorage.removeItem(LAYOUT_STORAGE_KEY);
        } finally {
            didLoadDraftRef.current = true;
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('warehouse-view-mode', viewMode);
        }
    }, [viewMode]);

    useEffect(() => {
        if (!didLoadDraftRef.current) return;
        if (skipNextSeedSyncRef.current) {
            skipNextSeedSyncRef.current = false;
            return;
        }
        setLayoutItems(layoutSeed);
        setSelectedItemId(selectedRack ? `rack-${selectedRack.id}` : selectedZone ? `zone-${selectedZone.id}` : layoutSeed[0]?.id ?? null);
    }, [layoutSeed, selectedRack?.id, selectedZone?.id]);

    useEffect(() => {
        zoneEditForm.setData({
            code: selectedZone?.code ?? '',
            name: selectedZone?.name ?? '',
            type: selectedZone?.type ?? 'storage',
            capacity: selectedZone?.capacity ?? 0,
            description: selectedZone?.description ?? '',
            is_active: selectedZone?.is_active ? 1 : 0,
        });
        rackCreateForm.setData('warehouse_zone_id', selectedZone?.id ?? zoneOptions[0]?.id ?? '');
    }, [selectedZone?.id]);

    useEffect(() => {
        rackEditForm.setData({
            warehouse_zone_id: selectedRack?.warehouse_zone_id ?? selectedZone?.id ?? zoneOptions[0]?.id ?? '',
            code: selectedRack?.code ?? '',
            name: selectedRack?.name ?? '',
            rack_type: selectedRack?.rack_type ?? 'standard',
            capacity: selectedRack?.capacity ?? 0,
            status: selectedRack?.status ?? 'active',
            notes: selectedRack?.notes ?? '',
        });
        rackStockCreateForm.setData('rack_id', selectedRack?.id ?? '');
    }, [selectedRack?.id]);

    useEffect(() => {
        if (status) addToast(status, 'info');
    }, [status]);

    useEffect(() => {
        if (!showRackStockModal) {
            setEditingRackStock(null);
            rackStockCreateForm.reset();
            rackStockCreateForm.setData({
                rack_id: selectedRack?.id ?? '',
                product_id: productOptions[0]?.id ?? '',
                quantity: 0,
                reserved_quantity: 0,
                batch_number: '',
                expired_date: '',
            });
        }
    }, [showRackStockModal, selectedRack?.id]);

    useEffect(() => {
        fitCanvasToViewport();
        window.addEventListener('resize', fitCanvasToViewport);
        return () => window.removeEventListener('resize', fitCanvasToViewport);
    }, [fitCanvasToViewport]);

    useEffect(() => {
        const isEditableTarget = (target) => {
            if (!(target instanceof HTMLElement)) return false;
            const tag = target.tagName;
            return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
        };

        const handleKeyDown = (event) => {
            if (event.code === 'Space' && !isEditableTarget(event.target)) {
                event.preventDefault();
                setIsPanShortcutActive(true);
                return;
            }

            if (isEditableTarget(event.target)) return;

            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
                event.preventDefault();
                handleSaveLayout();
                return;
            }
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.shiftKey) {
                event.preventDefault();
                undo();
                return;
            }
            if (((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'z') ||
                ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y')) {
                event.preventDefault();
                redo();
                return;
            }

            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
                event.preventDefault();
                handleDuplicate();
                return;
            }

            if (event.key === 'Delete' || event.key === 'Backspace') {
                event.preventDefault();
                handleDeleteLocal();
                return;
            }

            if (event.key.toLowerCase() === 'm') {
                event.preventDefault();
                setShowHeatmap((current) => !current);
                return;
            }

            if (event.key === '0') {
                event.preventDefault();
                resetView();
                return;
            }

            if (event.key === '+' || event.key === '=') {
                event.preventDefault();
                zoomIn();
                return;
            }

            if (event.key === '-') {
                event.preventDefault();
                zoomOut();
                return;
            }

            if (event.key.toLowerCase() === 'r') {
                event.preventDefault();
                handleRotateRack();
                return;
            }

            if (event.key.toLowerCase() === 'h') {
                event.preventDefault();
                setIsPanShortcutActive(true);
            }
        };

        const handleKeyUp = (event) => {
            if (event.code === 'Space') {
                setIsPanShortcutActive(false);
            }
        };

        const handleBlur = () => setIsPanShortcutActive(false);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('blur', handleBlur);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('blur', handleBlur);
        };
    }, []);

    const selectedItem = useMemo(() => layoutItems.find((item) => item.id === selectedItemId) ?? null, [layoutItems, selectedItemId]);
    const selectedServerZone = selectedItem?.kind === 'zone' && selectedItem.source === 'server'
        ? zoneSummaries.find((zone) => zone.id === selectedItem.serverId)
        : null;
    const selectedServerRack = selectedItem?.kind === 'rack' && selectedItem.source === 'server'
        ? rackSummaries.find((rack) => rack.id === selectedItem.serverId)
        : null;

    useEffect(() => {
        setDraft(createDraftFromItem(selectedItem));
    }, [selectedItemId, selectedItem]);

    const zones = useMemo(() => layoutItems.filter((item) => item.kind === 'zone'), [layoutItems]);
    const racks = useMemo(() => layoutItems.filter((item) => item.kind === 'rack'), [layoutItems]);
    const visibleActivities = useMemo(() => {
        if (!searchTerm) return activityLog;
        const term = searchTerm.toLowerCase();
        return activityLog.filter((activity) =>
            String(activity.title || '').toLowerCase().includes(term) ||
            String(activity.location || '').toLowerCase().includes(term) ||
            String(activity.operator || '').toLowerCase().includes(term),
        );
    }, [activityLog, searchTerm]);

    const filteredZones = useMemo(() => {
        if (!searchTerm) return zones;
        const term = searchTerm.toLowerCase();
        return zones.filter((zone) =>
            String(zone.name).toLowerCase().includes(term) ||
            String(zone.code).toLowerCase().includes(term) ||
            String(getTypeStyle(zone.type).label).toLowerCase().includes(term),
        );
    }, [zones, searchTerm]);

    const filteredRacks = useMemo(() => {
        if (!searchTerm) return racks;
        const term = searchTerm.toLowerCase();
        return racks.filter((rack) =>
            String(rack.name).toLowerCase().includes(term) ||
            String(rack.code).toLowerCase().includes(term),
        );
    }, [racks, searchTerm]);

    // Dashboard view computed values
    const dashSelectedZone = useMemo(() => {
        return zoneSummaries.find(z => z.id === dashSelectedZoneId) || zoneSummaries[0] || null;
    }, [zoneSummaries, dashSelectedZoneId]);

    const dashZoneRacks = useMemo(() => {
        if (!dashSelectedZone) return [];
        return rackSummaries.filter(r => r.zone_id === dashSelectedZone.id);
    }, [rackSummaries, dashSelectedZone]);

    useEffect(() => {
        setIsZoneTransitioning(true);
        const raf = window.requestAnimationFrame(() => setIsZoneTransitioning(false));
        return () => window.cancelAnimationFrame(raf);
    }, [dashSelectedZoneId]);

    const dashSelectedRackDetail = useMemo(() => {
        if (!selectedRack && !dashSelectedZone) return null;
        // If a rack is selected via URL params and belongs to the selected zone, use it
        if (selectedRack && selectedZone && selectedZone.id === dashSelectedZoneId) return selectedRack;
        // Otherwise use the first rack of the selected zone
        const firstRack = dashZoneRacks[0];
        if (!firstRack) return null;
        return selectedRack?.id === firstRack?.id ? selectedRack : null;
    }, [dashSelectedZoneId, dashZoneRacks, selectedRack, selectedZone]);

    const selectedRackStocks = useMemo(() => {
        if (!selectedServerRack || !selectedRack || selectedRack.id !== selectedServerRack.id) return [];
        return selectedRack.stocks || [];
    }, [selectedServerRack, selectedRack]);

    const totalOccupancy = useMemo(() => {
        const capacityTotal = layoutItems.reduce((total, item) => total + (item.kind === 'rack' || item.kind === 'zone' ? Number(item.capacity) || 0 : 0), 0);
        const usedTotal = layoutItems.reduce((total, item) => total + (((Number(item.capacity) || 0) * (Number(item.occupancy) || 0)) / 100), 0);
        return capacityTotal > 0 ? Math.round((usedTotal / capacityTotal) * 100) : warehouse?.occupancy ?? 0;
    }, [layoutItems, warehouse?.occupancy]);

    const invalidRackInfo = useMemo(() => {
        const normalized = normalizeRackPlacements(layoutItems);
        const racks = normalized.invalidRackIds
            .map((id) => layoutItems.find((item) => item.id === id))
            .filter(Boolean);

        return {
            ids: normalized.invalidRackIds,
            racks,
        };
    }, [layoutItems]);

    const invalidRackCount = invalidRackInfo.ids.length;

    useEffect(() => {
        if (invalidRackCount <= 0) {
            invalidRackCursorRef.current = 0;
            return;
        }

        if (invalidRackCursorRef.current >= invalidRackCount) {
            invalidRackCursorRef.current = 0;
        }
    }, [invalidRackCount]);

    const handleCanvasWheel = (event) => {
        event.preventDefault();
        const delta = event.deltaY > 0 ? -0.08 : 0.08;
        setScale((current) => clamp(Number((current + delta).toFixed(2)), MIN_SCALE, MAX_SCALE));
    };

    const isSelectedZoneLocked = selectedItem?.kind === 'zone' && Boolean(selectedItem.metadata?.locked);

    const toggleSelectedZoneLock = () => {
        if (!selectedItem || selectedItem.kind !== 'zone') return;
        const nextLocked = !Boolean(selectedItem.metadata?.locked);
        setLayoutItems((current) => current.map((item) => item.id === selectedItem.id
            ? { ...item, metadata: { ...(item.metadata || {}), locked: nextLocked } }
            : item,
        ));
        addToast(nextLocked ? `${selectedItem.name} dikunci.` : `${selectedItem.name} dibuka kuncinya.`, 'info');
    };

    const restoreDraftFromLocal = () => {
        try {
            const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
            if (!raw) {
                addToast('Belum ada draft lokal yang bisa dipulihkan.', 'warning');
                return;
            }
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed?.items) && parsed.items.length) {
                setLayoutItems(parsed.items);
                setSelectedItemId(parsed.selectedItemId ?? parsed.items[0]?.id ?? null);
                setCanvasFrame((current) => ({ ...current, ...(parsed.canvasFrame || {}) }));
                if (parsed?.selectedTemplate) setSelectedTemplate(normalizeTemplateKey(parsed.selectedTemplate));
                if (parsed?.savedAt) setLastAutoSavedAt(parsed.savedAt);
                addToast('Draft layout berhasil dipulihkan.', 'success');
                return;
            }
            addToast('Draft lokal tidak valid.', 'warning');
        } catch {
            addToast('Draft lokal gagal dibaca.', 'error');
        }
    };

    const clearDraftFromLocal = () => {
        if (!window.confirm('Hapus draft lokal layout? Tindakan ini tidak bisa dibatalkan.')) {
            return;
        }
        try {
            window.localStorage.removeItem(LAYOUT_STORAGE_KEY);
            setLastAutoSavedAt(null);
            addToast('Draft lokal dihapus.', 'info');
        } catch {
            addToast('Gagal menghapus draft lokal.', 'error');
        }
    };

    const applyLayoutTemplate = (templateId) => {
        setLayoutItems((current) => {
            const zonesOnly = current.filter((item) => item.kind === 'zone').sort((a, b) => String(a.code).localeCompare(String(b.code)));
            const racksOnly = current
                .filter((item) => item.kind === 'rack')
                .sort((a, b) => String(a.code).localeCompare(String(b.code)));
            const zoneFrameMap = new Map();
            const rackFrameMap = new Map();

            zonesOnly.forEach((zone, index) => zoneFrameMap.set(zone.id, buildTemplateZoneFrame(index, zonesOnly, templateId)));

            zonesOnly.forEach((zone) => {
                const frame = zoneFrameMap.get(zone.id) || { x: zone.x, y: zone.y, w: zone.w, h: zone.h };
                const zoneRect = {
                    ...zone,
                    ...frame,
                };

                const zoneRacks = racksOnly
                    .filter((rack) => rack.zoneId === zone.id)
                    .sort((a, b) => String(a.code).localeCompare(String(b.code)));

                zoneRacks.forEach((rack, rackIndex) => {
                    const rackFrame = buildRackFrameByTemplate(rackIndex, zoneRacks.length, zoneRect, templateId);
                    rackFrameMap.set(rack.id, clampRackToZone({ ...rack, ...rackFrame }, zoneRect));
                });
            });

            let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
            zonesOnly.forEach((z) => {
                const f = zoneFrameMap.get(z.id) || z;
                if (f.x < minX) minX = f.x;
                if (f.y < minY) minY = f.y;
                if (f.x + f.w > maxX) maxX = f.x + f.w;
                if (f.y + f.h > maxY) maxY = f.y + f.h;
            });
            if (minX === Infinity) { minX = 100; minY = 100; maxX = 1200; maxY = 800; }

            const wallPad = 80;
            const wX = snap(minX - wallPad);
            const wY = snap(minY - wallPad);
            const wW = snap(maxX - minX + wallPad * 2);
            const wH = snap(maxY - minY + wallPad * 2);

            const newStructures = [
                { id: 'w-n', kind: 'structure', type: 'wall', name: 'North Boundary', code: 'BN-N', x: wX, y: wY, w: wW, h: 20 },
                { id: 'w-s', kind: 'structure', type: 'wall', name: 'South Boundary', code: 'BN-S', x: wX, y: wY + wH - 20, w: wW, h: 20 },
                { id: 'w-w', kind: 'structure', type: 'wall', name: 'West Boundary', code: 'BN-W', x: wX, y: wY, w: 20, h: wH },
                { id: 'w-e', kind: 'structure', type: 'wall', name: 'East Boundary', code: 'BN-E', x: wX + wW - 20, y: wY, w: 20, h: wH },
            ];

            if (templateId === 'flow') {
                const midX = snap(minX + (maxX - minX) / 2);
                const halfH = snap((wH - 300) / 2);
                newStructures.push({ id: 'div-t', kind: 'structure', type: 'wall', name: 'Divider Top', code: 'DV-T', x: midX, y: wY, w: 20, h: halfH });
                newStructures.push({ id: 'div-b', kind: 'structure', type: 'wall', name: 'Divider Bot', code: 'DV-B', x: midX, y: wY + wH - halfH, w: 20, h: halfH });
            } else if (templateId === 'data_driven') {
                newStructures.push({ id: 'pil-1', kind: 'structure', type: 'wall', name: 'Pillar A', code: 'P-A', x: snap(minX + (maxX - minX) / 3), y: snap(minY + (maxY - minY) / 2), w: 40, h: 40 });
                newStructures.push({ id: 'pil-2', kind: 'structure', type: 'wall', name: 'Pillar B', code: 'P-B', x: snap(minX + ((maxX - minX) / 3) * 2), y: snap(minY + (maxY - minY) / 2), w: 40, h: 40 });
            } else if (templateId === 'dense') {
                const qX = (maxX - minX) / 4;
                const qY = (maxY - minY) / 2;
                newStructures.push({ id: 'pil-d1', kind: 'structure', type: 'wall', name: 'Support A', code: 'S-A', x: snap(minX + qX), y: snap(minY + qY), w: 20, h: 20 });
                newStructures.push({ id: 'pil-d2', kind: 'structure', type: 'wall', name: 'Support B', code: 'S-B', x: snap(minX + qX * 2), y: snap(minY + qY), w: 20, h: 20 });
                newStructures.push({ id: 'pil-d3', kind: 'structure', type: 'wall', name: 'Support C', code: 'S-C', x: snap(minX + qX * 3), y: snap(minY + qY), w: 20, h: 20 });
            }

            const nonStructures = current.filter(item => item.kind !== 'structure').map((item) => {
                if (item.kind === 'zone') {
                    const frame = zoneFrameMap.get(item.id) || { x: item.x, y: item.y, w: item.w, h: item.h };
                    return { ...item, ...frame };
                }

                if (item.kind === 'rack') {
                    return rackFrameMap.get(item.id) || item;
                }

                if (item.kind === 'area') {
                    const areaW = item.w || 300;
                    const areaH = item.h || 60;
                    if (item.type === 'inbound') {
                        if (templateId === 'dense') {
                            return { ...item, x: snap(wX + 80), y: snap(wY + wH - areaH / 2) };
                        }
                        return { ...item, x: snap(wX + 80), y: snap(wY - areaH / 2) };
                    }
                    if (item.type === 'outbound') {
                        if (templateId === 'flow' || templateId === 'dense') {
                            return { ...item, x: snap(wX + wW - areaW - 80), y: snap(wY + wH - areaH / 2) };
                        }
                        return { ...item, x: snap(wX + wW - areaW - 80), y: snap(wY - areaH / 2) };
                    }
                }

                return item;
            });

            const allItems = [...nonStructures, ...newStructures];
            let gMinX = Infinity, gMinY = Infinity, gMaxX = -Infinity, gMaxY = -Infinity;
            allItems.forEach(i => {
                if (i.x < gMinX) gMinX = i.x;
                if (i.y < gMinY) gMinY = i.y;
                if (i.x + (i.w || 0) > gMaxX) gMaxX = i.x + (i.w || 0);
                if (i.y + (i.h || 0) > gMaxY) gMaxY = i.y + (i.h || 0);
            });

            const pad = 100;
            const shiftX = snap(pad - gMinX);
            const shiftY = snap(pad - gMinY);

            const shiftedItems = allItems.map(item => ({
                ...item,
                x: snap(item.x + shiftX),
                y: snap(item.y + shiftY)
            }));

            const cWidth = snap((gMaxX - gMinX) + pad * 2);
            const cHeight = snap((gMaxY - gMinY) + pad * 2);

            CANVAS_WIDTH = cWidth;
            CANVAS_HEIGHT = cHeight;

            setTimeout(() => {
                setCanvasFrame(current => ({ ...current, x: 0, y: 0, w: cWidth, h: cHeight }));
            }, 0);

            return normalizeRackPlacements(shiftedItems).items;
        });

        setSelectedTemplate(templateId);
        addToast(`Template ${TEMPLATE_OPTIONS.find((opt) => opt.value === templateId)?.label || templateId} diterapkan.`, 'success');
    };

    const renderLayoutToCanvas = () => {
        const width = 1920;
        const height = 1120;
        const pad = 50;
        const ratioX = (width - pad * 2) / CANVAS_WIDTH;
        const ratioY = (height - pad * 2) / CANVAS_HEIGHT;
        const ratio = Math.min(ratioX, ratioY);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.fillStyle = '#f3f5fb';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(148,163,184,0.18)';
        ctx.lineWidth = 1;
        for (let x = pad; x <= width - pad; x += GRID_SIZE * ratio) {
            ctx.beginPath();
            ctx.moveTo(x, pad);
            ctx.lineTo(x, height - pad);
            ctx.stroke();
        }
        for (let y = pad; y <= height - pad; y += GRID_SIZE * ratio) {
            ctx.beginPath();
            ctx.moveTo(pad, y);
            ctx.lineTo(width - pad, y);
            ctx.stroke();
        }

        ctx.fillStyle = '#111827';
        ctx.font = '700 24px sans-serif';
        ctx.fillText(`${warehouse?.name || 'Warehouse'} Layout`, pad, 32);

        layoutItems.forEach((item) => {
            const style = getTypeStyle(item.type, item.kind === 'rack' ? 'rack' : 'storage');
            const x = pad + item.x * ratio;
            const y = pad + item.y * ratio;
            const w = Math.max(6, item.w * ratio);
            const h = Math.max(6, item.h * ratio);

            ctx.fillStyle = item.kind === 'structure' ? '#334155' : style.bg;
            ctx.strokeStyle = item.kind === 'structure' ? '#0f172a' : style.border;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.rect(x, y, w, h);
            ctx.fill();
            ctx.stroke();

            if (item.kind !== 'structure') {
                ctx.fillStyle = '#0f172a';
                ctx.font = `700 ${Math.max(9, Math.round(12 * ratio))}px sans-serif`;
                ctx.fillText(item.code, x + 6, y + 16);
                ctx.font = `700 ${Math.max(10, Math.round(14 * ratio))}px sans-serif`;
                ctx.fillText(item.name, x + 6, y + 32);
            }
        });

        return canvas;
    };

    const exportLayoutAsPng = () => {
        const canvas = renderLayoutToCanvas();
        if (!canvas) {
            addToast('Gagal menyiapkan export PNG.', 'error');
            return;
        }
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `warehouse-layout-${new Date().toISOString().slice(0, 10)}.png`;
        link.click();
        addToast('Layout berhasil diexport ke PNG.', 'success');
    };

    const exportLayoutAsPdf = () => {
        const canvas = renderLayoutToCanvas();
        if (!canvas) {
            addToast('Gagal menyiapkan export PDF.', 'error');
            return;
        }
        const dataUrl = canvas.toDataURL('image/png');
        const printWindow = window.open('', '_blank', 'width=1280,height=900');
        if (!printWindow) {
            addToast('Popup diblokir browser. Izinkan popup untuk export PDF.', 'warning');
            return;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Warehouse Layout PDF</title>
                    <style>
                        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                        img { width: 100%; height: auto; border: 1px solid #e2e8f0; }
                        h1 { margin: 0 0 12px; font-size: 18px; }
                    </style>
                </head>
                <body>
                    <h1>${warehouse?.name || 'Warehouse'} Layout</h1>
                    <img src="${dataUrl}" alt="Warehouse Layout" />
                    <script>
                        window.onload = function () { window.print(); };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
        addToast('Preview PDF dibuka. Pilih Save as PDF pada dialog print.', 'info');
    };

    const focusNextInvalidRack = () => {
        if (!invalidRackInfo.racks.length) {
            addToast('Tidak ada rack invalid saat ini.', 'info');
            return;
        }

        const index = invalidRackCursorRef.current % invalidRackInfo.racks.length;
        const targetRack = invalidRackInfo.racks[index];
        invalidRackCursorRef.current = (index + 1) % invalidRackInfo.racks.length;

        setSelectedItemId(targetRack.id);
        setIsInspectorOpen(true);

        const viewport = viewportRef.current?.getBoundingClientRect();
        if (viewport) {
            const targetCenterX = targetRack.x + targetRack.w / 2;
            const targetCenterY = targetRack.y + targetRack.h / 2;
            setPan({
                x: Math.round(viewport.width / 2 - targetCenterX * scale),
                y: Math.round(viewport.height / 2 - targetCenterY * scale),
            });
        }

        addToast(`Fokus ke rack invalid: ${targetRack.name}.`, 'warning');
    };

    const fixAllInvalidRacks = () => {
        if (!invalidRackInfo.racks.length) {
            addToast('Tidak ada rack invalid saat ini.', 'info');
            return;
        }

        const zones = layoutItems.filter((item) => item.kind === 'zone');
        if (!zones.length) {
            addToast('Tidak ada zona untuk menempatkan rack. Buat zona terlebih dahulu.', 'warning');
            return;
        }

        let fixedCount = 0;
        setLayoutItems((current) => current.map((item) => {
            if (item.kind !== 'rack' || !invalidRackInfo.ids.includes(item.id)) return item;

            const assigned = zones.find((zone) => zone.id === item.zoneId);
            if (assigned && isRackInsideZone(item, assigned)) return item;

            let nearestZone = null;
            let nearestDist = Infinity;

            zones.forEach((zone) => {
                const rackCX = item.x + item.w / 2;
                const rackCY = item.y + item.h / 2;
                const zoneCX = zone.x + zone.w / 2;
                const zoneCY = zone.y + zone.h / 2;
                const dist = Math.hypot(rackCX - zoneCX, rackCY - zoneCY);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestZone = zone;
                }
            });

            if (!nearestZone) return item;

            const clampedW = clamp(snap(item.w), GRID_SIZE * 2, Math.max(GRID_SIZE * 2, nearestZone.w - GRID_SIZE * 2));
            const clampedH = clamp(snap(item.h), GRID_SIZE, Math.max(GRID_SIZE, nearestZone.h - GRID_SIZE * 2));
            const clampedX = clamp(snap(nearestZone.x + GRID_SIZE), nearestZone.x, nearestZone.x + nearestZone.w - clampedW);
            const clampedY = clamp(snap(nearestZone.y + GRID_SIZE * 2), nearestZone.y, nearestZone.y + nearestZone.h - clampedH);

            fixedCount++;
            return {
                ...item,
                x: clampedX,
                y: clampedY,
                w: clampedW,
                h: clampedH,
                zoneId: nearestZone.id,
                zoneServerId: nearestZone.serverId ?? null,
            };
        }));

        addToast(`${fixedCount} rack invalid berhasil dipindahkan ke zona terdekat.`, 'success');
    };

    const clientToCanvas = (clientX, clientY) => {
        const rect = viewportRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return {
            x: snap((clientX - rect.left - pan.x) / scale),
            y: snap((clientY - rect.top - pan.y) / scale),
        };
    };

    const snapToGuide = (value, guides, threshold = GRID_SIZE) => {
        let closest = value;
        let distance = threshold + 1;

        guides.forEach((guide) => {
            const nextDistance = Math.abs(guide - value);
            if (nextDistance <= threshold && nextDistance < distance) {
                closest = guide;
                distance = nextDistance;
            }
        });

        return snap(closest);
    };

    const snapPointToLayoutGuides = (point, { includeCenters = true, threshold = GRID_SIZE } = {}) => {
        const xGuides = [canvasFrame.x, canvasFrame.x + canvasFrame.w];
        const yGuides = [canvasFrame.y, canvasFrame.y + canvasFrame.h];

        if (includeCenters) {
            xGuides.push(canvasFrame.x + canvasFrame.w / 2);
            yGuides.push(canvasFrame.y + canvasFrame.h / 2);
        }

        layoutItems.forEach((item) => {
            xGuides.push(item.x, item.x + item.w);
            yGuides.push(item.y, item.y + item.h);
            if (includeCenters) {
                xGuides.push(item.x + item.w / 2);
                yGuides.push(item.y + item.h / 2);
            }
        });

        return {
            x: snapToGuide(point.x, xGuides, threshold),
            y: snapToGuide(point.y, yGuides, threshold),
        };
    };

    const beginPan = (event) => {
        gestureRef.current = {
            mode: 'pan',
            startClientX: event.clientX,
            startClientY: event.clientY,
            startPan: pan,
        };
    };

    const beginMove = (event, item) => {
        if (item.kind === 'zone' && item.metadata?.locked) {
            addToast(`Zona ${item.name} sedang dikunci. Buka lock di panel kanan untuk memindahkan.`, 'warning');
            return;
        }
        gestureRef.current = {
            mode: 'move',
            id: item.id,
            itemType: item.type,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startRect: { x: item.x, y: item.y, w: item.w, h: item.h },
        };
    };

    const beginResize = (event, item, direction) => {
        if (item.kind === 'zone' && item.metadata?.locked) {
            addToast(`Zona ${item.name} sedang dikunci. Buka lock di panel kanan untuk resize.`, 'warning');
            return;
        }
        gestureRef.current = {
            mode: 'resize',
            id: item.id,
            itemType: item.type,
            direction,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startRect: { x: item.x, y: item.y, w: item.w, h: item.h },
        };
    };

    const beginCanvasResize = (event) => {
        gestureRef.current = {
            mode: 'canvas-resize',
            startClientX: event.clientX,
            startClientY: event.clientY,
            startRect: { ...canvasFrame },
        };
    };

    const beginCanvasMove = (event) => {
        gestureRef.current = {
            mode: 'canvas-move',
            startClientX: event.clientX,
            startClientY: event.clientY,
            startRect: { ...canvasFrame },
        };
    };

    const beginInspectorResize = (event) => {
        gestureRef.current = {
            mode: 'inspector-resize',
            startClientX: event.clientX,
            startWidth: inspectorWidth,
        };
    };

    const beginOrthogonalDraw = (event, action) => {
        const startPoint = snapPointToLayoutGuides(clientToCanvas(event.clientX, event.clientY), { includeCenters: false, threshold: GRID_SIZE * 1.4 });
        const thickness = GRID_SIZE;
        const tempItem = {
            id: createId(),
            serverId: null,
            source: 'local',
            kind: action.kind || 'structure',
            type: action.type || 'wall',
            zoneId: null,
            zoneServerId: null,
            name: `${getTypeStyle(action.type || 'wall', 'wall').label} ${layoutItems.filter((item) => normalizeTypeKey(item.type) === normalizeTypeKey(action.type)).length + 1}`,
            code: `${action.id || 'wall'}-${layoutItems.length + 1}`.toUpperCase(),
            capacity: 0,
            occupancy: 0,
            status: 'planned',
            color: getTypeStyle(action.type || 'wall', 'wall').bg,
            x: startPoint.x,
            y: startPoint.y,
            w: thickness * 6,
            h: thickness,
            metadata: {},
        };

        setLayoutItems((current) => [...current, tempItem]);
        setSelectedItemId(tempItem.id);
        gestureRef.current = {
            mode: 'draw-orthogonal',
            id: tempItem.id,
            actionId: action.id,
            startPoint,
            thickness,
        };
    };

    useEffect(() => {
        const handleMouseMove = (event) => {
            const gesture = gestureRef.current;
            if (!gesture) return;

            if (gesture.mode === 'pan') {
                setPan({
                    x: gesture.startPan.x + (event.clientX - gesture.startClientX),
                    y: gesture.startPan.y + (event.clientY - gesture.startClientY),
                });
                return;
            }

            if (gesture.mode === 'canvas-move') {
                const deltaX = snap((event.clientX - gesture.startClientX) / scale);
                const deltaY = snap((event.clientY - gesture.startClientY) / scale);
                setCanvasFrame((current) => ({
                    ...current,
                    x: clamp(snap(gesture.startRect.x + deltaX), -CANVAS_WIDTH * 0.35, CANVAS_WIDTH - 240),
                    y: clamp(snap(gesture.startRect.y + deltaY), -CANVAS_HEIGHT * 0.35, CANVAS_HEIGHT - 200),
                }));
                return;
            }

            if (gesture.mode === 'canvas-resize') {
                const deltaX = snap((event.clientX - gesture.startClientX) / scale);
                const deltaY = snap((event.clientY - gesture.startClientY) / scale);
                const minBoardW = 720;
                const minBoardH = 480;

                setCanvasFrame({
                    ...canvasFrame,
                    w: clamp(snap(gesture.startRect.w + deltaX), minBoardW, CANVAS_WIDTH * 1.8),
                    h: clamp(snap(gesture.startRect.h + deltaY), minBoardH, CANVAS_HEIGHT * 1.8),
                });
                return;
            }

            if (gesture.mode === 'inspector-resize') {
                const deltaX = gesture.startClientX - event.clientX;
                setInspectorWidth(clamp(gesture.startWidth + deltaX, 220, 420));
                return;
            }

            if (gesture.mode === 'draw-orthogonal') {
                const point = snapPointToLayoutGuides(clientToCanvas(event.clientX, event.clientY), { includeCenters: false, threshold: GRID_SIZE * 1.4 });
                const deltaX = point.x - gesture.startPoint.x;
                const deltaY = point.y - gesture.startPoint.y;
                const horizontal = Math.abs(deltaX) >= Math.abs(deltaY);
                const thickness = gesture.thickness;
                const minLength = 120;

                setLayoutItems((current) => current.map((item) => {
                    if (item.id !== gesture.id) return item;

                    if (horizontal) {
                        const length = Math.max(minLength, Math.abs(deltaX) || minLength);
                        return {
                            ...item,
                            x: deltaX >= 0 ? gesture.startPoint.x : gesture.startPoint.x - length,
                            y: gesture.startPoint.y,
                            w: snap(length),
                            h: thickness,
                        };
                    }

                    const length = Math.max(minLength, Math.abs(deltaY) || minLength);
                    return {
                        ...item,
                        x: gesture.startPoint.x,
                        y: deltaY >= 0 ? gesture.startPoint.y : gesture.startPoint.y - length,
                        w: thickness,
                        h: snap(length),
                    };
                }));
                return;
            }

            const deltaX = snap((event.clientX - gesture.startClientX) / scale);
            const deltaY = snap((event.clientY - gesture.startClientY) / scale);

            setLayoutItems((current) => current.map((item) => {
                if (item.id !== gesture.id) return item;

                if (gesture.mode === 'move') {
                    if (item.kind === 'zone' && item.metadata?.locked) {
                        return item;
                    }
                    const nextPoint = snapPointToLayoutGuides({
                        x: gesture.startRect.x + deltaX,
                        y: gesture.startRect.y + deltaY,
                    }, { includeCenters: false, threshold: GRID_SIZE * 1.4 });
                    let moved = {
                        ...item,
                        x: normalizeTypeKey(gesture.itemType) === 'wall' ? nextPoint.x : snap(gesture.startRect.x + deltaX),
                        y: normalizeTypeKey(gesture.itemType) === 'wall' ? nextPoint.y : snap(gesture.startRect.y + deltaY),
                    };

                    if (item.kind === 'rack') {
                        const zonesInLayout = current.filter((entry) => entry.kind === 'zone');
                        const assignedZone = zonesInLayout.find((zone) => zone.id === item.zoneId);
                        const containingZone = zonesInLayout.find((zone) => isRackInsideZone(moved, zone));
                        const targetZone = containingZone || assignedZone;
                        if (targetZone) {
                            moved = clampRackToZone(moved, targetZone);
                        }
                    }

                    return moved;
                }

                const next = { ...item };
                const { minW, minH } = getItemMinSize(item);

                if (item.kind === 'zone' && item.metadata?.locked) {
                    return item;
                }

                if (gesture.direction.includes('e')) next.w = clamp(snap(gesture.startRect.w + deltaX), minW, CANVAS_WIDTH * 1.2);
                if (gesture.direction.includes('s')) next.h = clamp(snap(gesture.startRect.h + deltaY), minH, CANVAS_HEIGHT * 1.2);
                if (gesture.direction.includes('w')) {
                    const width = clamp(snap(gesture.startRect.w - deltaX), minW, CANVAS_WIDTH * 1.2);
                    next.x = snap(gesture.startRect.x + (gesture.startRect.w - width));
                    next.w = width;
                }
                if (gesture.direction.includes('n')) {
                    const height = clamp(snap(gesture.startRect.h - deltaY), minH, CANVAS_HEIGHT * 1.2);
                    next.y = snap(gesture.startRect.y + (gesture.startRect.h - height));
                    next.h = height;
                }

                if (normalizeTypeKey(gesture.itemType) === 'wall') {
                    const snappedStart = snapPointToLayoutGuides({ x: next.x, y: next.y }, { includeCenters: false, threshold: GRID_SIZE * 1.4 });
                    const snappedEnd = snapPointToLayoutGuides({ x: next.x + next.w, y: next.y + next.h }, { includeCenters: false, threshold: GRID_SIZE * 1.4 });
                    next.x = snappedStart.x;
                    next.y = snappedStart.y;
                    next.w = Math.max(minW, snap(snappedEnd.x - snappedStart.x || next.w));
                    next.h = Math.max(minH, snap(snappedEnd.y - snappedStart.y || next.h));
                    if (next.w > next.h) {
                        next.h = GRID_SIZE;
                    } else {
                        next.w = GRID_SIZE;
                    }
                }

                if (item.kind === 'rack') {
                    const zonesInLayout = current.filter((entry) => entry.kind === 'zone');
                    const assignedZone = zonesInLayout.find((zone) => zone.id === item.zoneId);
                    const containingZone = zonesInLayout.find((zone) => isRackInsideZone(next, zone));
                    const targetZone = containingZone || assignedZone;
                    if (targetZone) {
                        return clampRackToZone(next, targetZone);
                    }
                }

                return next;
            }));
        };

        const handleMouseUp = () => {
            gestureRef.current = null;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [scale, pan, canvasFrame, layoutItems]);

    const handleCanvasMouseDown = (event) => {
        if (event.button === 1 || isPanShortcutActive) {
            event.preventDefault();
            beginPan(event);
            return;
        }
        if (event.button !== 0) return;

        if (pendingAddType) {
            const action = ADD_ACTIONS.find((item) => item.id === pendingAddType);
            if (action?.id === 'wall') {
                beginOrthogonalDraw(event, action);
                setMode('sketch');
                addToast('Draw Wall aktif. Klik lalu drag lurus. Garis akan snap ke grid dan garis layout terdekat.');
                return;
            }
            const point = clientToCanvas(event.clientX, event.clientY);
            const dimensions = action?.id === 'rack'
                ? { w: 120, h: 54 }
                : action?.id === 'wall'
                    ? { w: 240, h: 20 }
                    : { w: 260, h: 140 };

            const selectedZoneId = selectedItem?.kind === 'zone'
                ? selectedItem.id
                : selectedItem?.kind === 'rack'
                    ? selectedItem.zoneId
                    : zones[0]?.id;
            const parentZone = layoutItems.find((item) => item.id === selectedZoneId && item.kind === 'zone');

            const nextItem = {
                id: createId(),
                serverId: null,
                source: 'local',
                kind: action?.kind === 'area' ? 'area' : action?.kind || 'zone',
                type: action?.type || 'storage',
                zoneId: action?.id === 'rack' ? parentZone?.id ?? null : null,
                zoneServerId: action?.id === 'rack' ? parentZone?.serverId ?? null : null,
                name: action?.id === 'rack'
                    ? `Rack ${racks.length + 1}`
                    : `${getTypeStyle(action?.type || 'storage').label} ${layoutItems.filter((item) => normalizeTypeKey(item.type) === normalizeTypeKey(action?.type)).length + 1}`,
                code: `${action?.id || 'zone'}-${layoutItems.length + 1}`.toUpperCase(),
                capacity: action?.id === 'rack' ? 180 : isStructuralType(action?.type) ? 0 : 1000,
                occupancy: 0,
                status: 'planned',
                color: getTypeStyle(action?.type || 'storage', action?.id === 'rack' ? 'rack' : 'storage').bg,
                x: point.x,
                y: point.y,
                w: dimensions.w,
                h: dimensions.h,
                metadata: {},
            };

            if (nextItem.kind === 'rack' && parentZone) {
                Object.assign(nextItem, clampRackToZone(nextItem, parentZone));
            }

            setLayoutItems((current) => [...current, nextItem]);
            setSelectedItemId(nextItem.id);
            setMode('select');
            setPendingAddType(null);
            addToast(`${action?.label} aktif. Klik area kerja untuk menaruh elemen, lalu drag atau resize untuk membentuk denah.`);
            return;
        }

        setSelectedItemId(null);
        beginPan(event);
    };

    const handleItemMouseDown = (event, item) => {
        event.stopPropagation();
        if (event.button === 1 || isPanShortcutActive) {
            event.preventDefault();
            beginPan(event);
            return;
        }
        if (event.button !== 0) return;
        setSelectedItemId(item.id);
        if (mode === 'select' || mode === 'sketch') {
            beginMove(event, item);
        }
    };

    const handleDuplicate = () => {
        if (!selectedItem) {
            addToast('Pilih elemen dulu untuk duplicate.');
            return;
        }
        const clone = {
            ...selectedItem,
            id: createId(),
            serverId: null,
            source: 'local',
            name: `${selectedItem.name} Copy`,
            code: `${selectedItem.code}-COPY`,
            x: clamp(selectedItem.x + GRID_SIZE * 2, 0, CANVAS_WIDTH - selectedItem.w),
            y: clamp(selectedItem.y + GRID_SIZE * 2, 0, CANVAS_HEIGHT - selectedItem.h),
            status: 'planned',
        };
        setLayoutItems((current) => [...current, clone]);
        setSelectedItemId(clone.id);
        addToast(`${selectedItem.name} diduplikasi ke workspace.`);
    };

    const handleDeleteLocal = () => {
        if (!selectedItem) {
            addToast('Pilih elemen dulu untuk dihapus.');
            return;
        }
        if (selectedItem.kind === 'zone' && selectedItem.metadata?.locked) {
            addToast('Zona terkunci tidak dapat dihapus. Buka lock terlebih dahulu.', 'warning');
            return;
        }
        const targetId = selectedItem.id;
        setLayoutItems((current) => current.filter((item) => item.id !== targetId && item.zoneId !== targetId));
        setSelectedItemId(null);
        addToast(`${selectedItem.name} dihapus dari layout editor.`);
    };

    const handleApplyDraft = () => {
        if (!selectedItem) return;
        if (selectedItem.kind === 'zone' && selectedItem.metadata?.locked) {
            addToast('Zona terkunci tidak dapat diubah. Buka lock terlebih dahulu.', 'warning');
            return;
        }

        setLayoutItems((current) => current.map((item) => {
            if (item.id !== selectedItem.id) return item;

            let nextItem = {
                ...item,
                ...draft,
                capacity: Number(draft.capacity) || 0,
                occupancy: clamp(Number(draft.occupancy) || 0, 0, 100),
                x: clamp(snap(Number(draft.x) || 0), 0, CANVAS_WIDTH - (Number(draft.w) || item.w)),
                y: clamp(snap(Number(draft.y) || 0), 0, CANVAS_HEIGHT - (Number(draft.h) || item.h)),
                w: Math.max(getItemMinSize(item).minW, snap(Number(draft.w) || item.w)),
                h: Math.max(getItemMinSize(item).minH, snap(Number(draft.h) || item.h)),
                rotation: Number(draft.rotation) || 0,
            };

            if (item.kind === 'rack') {
                const zonesInLayout = current.filter((entry) => entry.kind === 'zone');
                const assignedZone = zonesInLayout.find((zone) => zone.id === item.zoneId);
                const containingZone = zonesInLayout.find((zone) => isRackInsideZone(nextItem, zone));
                const targetZone = containingZone || assignedZone;
                if (targetZone) {
                    nextItem = clampRackToZone(nextItem, targetZone);
                } else {
                    addToast('Rack harus berada di dalam zona yang valid.', 'warning');
                }
            }

            return nextItem;
        }));

        addToast(`${selectedItem.name} diperbarui pada layout editor.`);
    };

    const handleSaveLayout = async () => {
        const normalized = normalizeRackPlacements(layoutItems);
        if (normalized.invalidRackIds.length > 0) {
            addToast(`Ada ${normalized.invalidRackIds.length} rack di luar zona. Perbaiki sebelum menyimpan.`, 'warning');
            return;
        }

        if (normalized.items !== layoutItems) {
            setLayoutItems(normalized.items);
        }

        setIsSaving(true);
        const zones = normalized.items.filter((i) => i.kind === 'zone' && i.serverId).map((i) => ({
            id: i.serverId,
            pos_x: i.x,
            pos_y: i.y,
            width: i.w,
            height: i.h,
            rotation: i.rotation ?? 0,
        }));
        const racks = normalized.items.filter((i) => i.kind === 'rack' && i.serverId).map((i) => ({
            id: i.serverId,
            pos_x: i.x,
            pos_y: i.y,
            width: i.w,
            height: i.h,
            rotation: i.rotation ?? 0,
        }));
        const elements = normalized.items.filter((i) => i.kind === 'structure' || i.kind === 'area').map((i) => ({
            element_type: i.type,
            name: i.name,
            code: i.code,
            pos_x: i.x,
            pos_y: i.y,
            width: i.w,
            height: i.h,
            rotation: i.rotation ?? 0,
            status: i.status ?? 'active',
            metadata: i.metadata ?? null,
        }));

        try {
            const res = await fetch('/warehouse/layout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '' },
                body: JSON.stringify({ zones, racks, elements, canvas: { x: canvasFrame.x, y: canvasFrame.y, w: canvasFrame.w, h: canvasFrame.h } }),
            });
            if (!res.ok) throw new Error('Server error');
            addToast('Layout berhasil disimpan ke database.', 'success');
        } catch {
            try {
                window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({
                    items: layoutItems,
                    canvasFrame,
                    selectedItemId,
                    savedAt: new Date().toISOString(),
                }));
                addToast('Gagal sync ke server, layout disimpan lokal.', 'warning');
            } catch {
                addToast('Gagal menyimpan layout.', 'error');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleRotateRack = () => {
        if (!selectedItem || selectedItem.kind !== 'rack') {
            addToast('Pilih rack dulu untuk rotate.');
            return;
        }

        setLayoutItems((current) => current.map((item) => item.id === selectedItem.id ? {
            ...item,
            rotation: item.rotation === 90 ? 0 : 90,
            w: item.rotation === 90 ? Math.max(120, item.h) : Math.max(16, item.h),
            h: item.rotation === 90 ? Math.max(16, item.w) : Math.max(120, item.w),
        } : item));

        setDraft((current) => ({
            ...current,
            rotation: current.rotation === 90 ? 0 : 90,
            w: current.rotation === 90 ? Math.max(120, Number(current.h) || 0) : Math.max(16, Number(current.h) || 0),
            h: current.rotation === 90 ? Math.max(16, Number(current.w) || 0) : Math.max(120, Number(current.w) || 0),
        }));
        addToast(`${selectedItem.name} diputar ${selectedItem.rotation === 90 ? 'horizontal' : 'vertical'}.`);
    };

    const syncZoneToServer = () => {
        if (!selectedItem || selectedItem.kind !== 'zone' || !selectedItem.serverId) return;
        zoneEditForm.setData({
            code: draft.code,
            name: draft.name,
            type: draft.type,
            capacity: Number(draft.capacity) || 0,
            description: selectedZone?.description ?? '',
            is_active: draft.status === 'inactive' ? 0 : 1,
        });
        zoneEditForm.put(`/warehouse/zones/${selectedItem.serverId}?zone=${selectedItem.serverId}`, {
            preserveScroll: true,
            onSuccess: () => addToast('Zona tersinkron ke data master.'),
        });
    };

    const syncRackToServer = () => {
        if (!selectedItem || selectedItem.kind !== 'rack' || !selectedItem.serverId) return;
        rackEditForm.setData({
            warehouse_zone_id: selectedItem.zoneServerId ?? selectedZone?.id ?? zoneOptions[0]?.id ?? '',
            code: draft.code,
            name: draft.name,
            rack_type: selectedRack?.rack_type ?? 'standard',
            capacity: Number(draft.capacity) || 0,
            status: draft.status,
            notes: selectedRack?.notes ?? '',
        });
        rackEditForm.put(`/warehouse/racks/${selectedItem.serverId}?zone=${selectedItem.zoneServerId ?? selectedZone?.id}&rack=${selectedItem.serverId}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => addToast('Rak tersinkron ke data master.'),
        });
    };

    const deleteRackStock = (stock) => {
        if (!window.confirm(`Delete ${stock.sku} from this rack?`)) return;
        router.delete(`/warehouse/rack-stocks/${stock.id}?zone=${selectedZone?.id}&rack=${selectedRack?.id}`, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const rackCapacityRemaining = selectedRack
        ? Math.max(
            0,
            (selectedRack.capacity ?? 0) -
            (selectedRack.stocks ?? []).reduce((total, stock) => {
                if (editingRackStock && editingRackStock.id === stock.id) return total;
                return total + (stock.quantity ?? 0);
            }, 0),
        )
        : 0;

    const openRackStockCreateModal = () => {
        setEditingRackStock(null);
        rackStockCreateForm.setData({
            rack_id: selectedRack?.id ?? '',
            product_id: productOptions[0]?.id ?? '',
            quantity: 0,
            reserved_quantity: 0,
            batch_number: '',
            expired_date: '',
        });
        setShowRackStockModal(true);
    };

    const openRackCreateModal = (zoneId = null) => {
        const resolvedZoneId = zoneId ?? dashSelectedZoneId ?? selectedZone?.id ?? zoneOptions[0]?.id ?? '';
        rackCreateForm.setData({
            warehouse_zone_id: resolvedZoneId,
            code: '',
            name: '',
            rack_type: 'standard',
            capacity: 250,
            notes: '',
        });
        setShowRackModal(true);
    };

    const openZoneEditModal = (zone) => {
        if (!zone?.id) return;
        setEditingZoneId(zone.id);
        zoneEditForm.setData({
            code: zone.code ?? '',
            name: zone.name ?? '',
            type: zone.type ?? 'storage',
            capacity: zone.capacity ?? 0,
            description: zone.description ?? '',
            is_active: zone.is_active ? 1 : 0,
        });
        setShowZoneEditModal(true);
    };

    const openRackEditModal = (rack) => {
        if (!rack?.id) return;
        setEditingRackId(rack.id);
        rackEditForm.setData({
            warehouse_zone_id: rack.zone_id ?? dashSelectedZoneId ?? selectedZone?.id ?? zoneOptions[0]?.id ?? '',
            code: rack.code ?? '',
            name: rack.name ?? '',
            rack_type: rack.rack_type ?? 'standard',
            capacity: rack.capacity ?? 0,
            status: rack.status ?? 'active',
            notes: rack.notes ?? '',
        });
        setShowRackEditModal(true);
    };

    const openRackStockEditModal = (stock) => {
        setEditingRackStock(stock);
        rackStockCreateForm.setData({
            rack_id: selectedRack?.id ?? '',
            product_id: stock.product_id,
            quantity: stock.quantity,
            reserved_quantity: stock.reserved_quantity,
            batch_number: stock.batch_number ?? '',
            expired_date: stock.expired_date ?? '',
        });
        setShowRackStockModal(true);
    };

    const resetView = () => {
        fitCanvasToViewport();
    };

    const zoomIn = () => setScale((current) => clamp(Number((current + 0.1).toFixed(2)), MIN_SCALE, MAX_SCALE));
    const zoomOut = () => setScale((current) => clamp(Number((current - 0.1).toFixed(2)), MIN_SCALE, MAX_SCALE));

    return (
        <DashboardLayout
            headerSearchPlaceholder="Cari zona, rak, kode, atau aktivitas..."
            searchValue={searchTerm}
            onSearch={setSearchTerm}
            contentClassName="w-full max-w-none"
            fullPage={viewMode === 'editor'}
        >
            <Head title="Manajemen Gudang" />

            {viewMode === 'dashboard' ? (
                <div className="min-h-screen bg-slate-50">
                    <ToastStack toasts={toasts} onRemove={removeToast} />

                    {/* Header */}
                    <div className="px-4 pb-0 pt-5 sm:px-6">
                        <div className="w-full rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl font-black tracking-tight text-slate-900">{warehouse?.name || 'Gudang'}</h1>
                                        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{warehouse?.location}</span>
                                    </div>
                                    <p className="mt-2 text-sm font-semibold text-slate-500">Overview zona, rak, dan stok gudang secara real-time</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isManager ? (
                                        <button type="button" onClick={() => setShowZoneModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#3f4fda] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3443c4]">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            Tambah Zona
                                        </button>
                                    ) : null}
                                    <Link href={route('rack.allocation')} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                                        <TransferIcon className="h-4 w-4" />
                                        Transfer Rack
                                    </Link>
                                    <button type="button" onClick={() => setViewMode('editor')} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                                        <LayersIcon className="h-4 w-4" />
                                        Layout Editor
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="px-4 pb-0 pt-4 sm:px-6">
                        <div className="w-full rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                                        <LayersIcon className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-slate-900">{zoneSummaries.length}</div>
                                        <div className="text-xs font-medium text-slate-500">Zona Aktif</div>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                                        <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-slate-900">{rackSummaries.length}</div>
                                        <div className="text-xs font-medium text-slate-500">Total Rak</div>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                                        <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-slate-900">{formatNumber(warehouse?.total_items)}</div>
                                        <div className="text-xs font-medium text-slate-500">Total Item</div>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
                                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
                                        <ActivityIcon className="h-5 w-5 text-rose-600" />
                                    </div>
                                    <div>
                                        <div className={`text-2xl font-black ${occupancyTone(warehouse?.occupancy ?? 0)}`}>{formatPercent(warehouse?.occupancy)}</div>
                                        <div className="text-xs font-medium text-slate-500">Keterisian</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="w-full px-4 py-6 sm:px-6">
                        <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Zona Aktif</p>
                                <p className="mt-1 text-[18px] font-black tracking-tight text-slate-900">{dashSelectedZone?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Rack Di Zona</p>
                                <p className="mt-1 text-[18px] font-black tracking-tight text-slate-900">{dashZoneRacks.length}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Occupancy Zona</p>
                                <p className={`mt-1 text-[18px] font-black tracking-tight ${occupancyTone(dashSelectedZone?.occupancy ?? 0)}`}>
                                    {dashSelectedZone ? formatPercent(dashSelectedZone.occupancy) : '-'}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-12">
                            {/* Zone Sidebar */}
                            <div className="lg:col-span-4 xl:col-span-3">
                                <div className="sticky top-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Zona Gudang</h2>
                                        {isManager ? (
                                            <button type="button" onClick={() => setShowZoneModal(true)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">+ Zona</button>
                                        ) : null}
                                    </div>
                                    <div className="space-y-2">
                                        {zoneSummaries.map((zone) => {
                                            const isSelected = dashSelectedZoneId === zone.id;
                                            const accent = zone.accent || { bar: '#28106F' };
                                            return (
                                                <button
                                                    key={zone.id}
                                                    type="button"
                                                    onClick={() => setDashSelectedZoneId(zone.id)}
                                                    className={`w-full rounded-2xl border p-4 text-left transition-all ${isSelected ? 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-white ring-2 ring-indigo-100 shadow-sm' : 'border-slate-200 bg-white/90 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm'}`}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500" style={{ backgroundColor: TYPE_STYLES[normalizeTypeKey(zone.type)]?.chip || '#f1f5f9', color: TYPE_STYLES[normalizeTypeKey(zone.type)]?.text || '#475569' }}>{zone.type}</span>
                                                                <span className="text-xs font-semibold text-slate-400">{zone.code}</span>
                                                            </div>
                                                            <div className="mt-1 text-sm font-bold text-slate-900">{zone.name}</div>
                                                        </div>
                                                        <div className={`text-lg font-bold ${occupancyTone(zone.occupancy)}`}>{formatPercent(zone.occupancy)}</div>
                                                    </div>
                                                    <div className="mt-3">
                                                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                                            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(zone.occupancy, 100)}%`, backgroundColor: accent.bar || '#28106F' }} />
                                                        </div>
                                                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                                                            <span>{formatNumber(zone.used)} / {formatNumber(zone.capacity)} unit</span>
                                                            <span>{zone.rack_count} rak</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Zone Detail + Racks */}
                            <div className="lg:col-span-8 xl:col-span-9">
                                {dashSelectedZone ? (
                                    <div className={`space-y-6 transition-all duration-300 ease-out ${isZoneTransitioning ? 'translate-y-1 opacity-0' : 'translate-y-0 opacity-100'}`}>
                                        {/* Zone Header */}
                                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h2 className="text-xl font-bold text-slate-900">{dashSelectedZone.name}</h2>
                                                        <span className="rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: TYPE_STYLES[normalizeTypeKey(dashSelectedZone.type)]?.chip || '#f1f5f9', color: TYPE_STYLES[normalizeTypeKey(dashSelectedZone.type)]?.text || '#475569' }}>{dashSelectedZone.type}</span>
                                                    </div>
                                                    <p className="mt-1 text-sm text-slate-500">Kode: {dashSelectedZone.code} · Kapasitas: {formatNumber(dashSelectedZone.capacity)} unit · Terisi: {formatNumber(dashSelectedZone.used)} unit</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isManager ? (
                                                        <button type="button" onClick={() => openRackCreateModal(dashSelectedZone.id)} className="inline-flex items-center gap-1.5 rounded-xl bg-[#3f4fda] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#3443c4]">
                                                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                            Tambah Rak
                                                        </button>
                                                    ) : null}
                                                    {isManager && dashSelectedZone ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => openZoneEditModal(dashSelectedZone)}
                                                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                                        >
                                                            Edit Zona
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100/90">
                                                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(dashSelectedZone.occupancy, 100)}%`, backgroundColor: dashSelectedZone.accent?.bar || '#28106F' }} />
                                                </div>
                                                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                                                    <span>Keterisian: {formatPercent(dashSelectedZone.occupancy)}</span>
                                                    <span>{dashSelectedZone.rack_count} rak terdaftar</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Racks Grid */}
                                        <div>
                                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Rak di {dashSelectedZone.name}</h3>
                                            {dashZoneRacks.length === 0 ? (
                                                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
                                                    <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                                    <p className="mt-3 text-sm font-medium text-slate-500">Belum ada rak di zona ini</p>
                                                    {isManager ? (
                                                        <button type="button" onClick={() => openRackCreateModal(dashSelectedZone.id)} className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#3f4fda] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3443c4]">
                                                            Tambah Rak Pertama
                                                        </button>
                                                    ) : null}
                                                </div>
                                            ) : (
                                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                                    {dashZoneRacks.map((rack) => {
                                                        const rackDetail = selectedRack?.id === rack.id ? selectedRack : null;
                                                        const stocks = rackDetail?.stocks || [];
                                                        return (
                                                            <div key={rack.id} className="rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md">
                                                                <div className="border-b border-slate-100 p-4">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div className="min-w-0">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">{rack.code}</span>
                                                                                <span className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">{rack.rack_type}</span>
                                                                                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${rack.occupancy >= 90 ? 'bg-rose-50 text-rose-600' : rack.occupancy >= 70 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                                                                    {rack.occupancy >= 90 ? 'Kritis' : rack.occupancy >= 70 ? 'Padat' : 'Normal'}
                                                                                </span>
                                                                            </div>
                                                                            <div className="mt-1 text-sm font-bold text-slate-900">{rack.name}</div>
                                                                        </div>
                                                                        <div className={`text-right text-lg font-bold ${occupancyTone(rack.occupancy)}`}>{formatPercent(rack.occupancy)}</div>
                                                                    </div>
                                                                    <div className="mt-3">
                                                                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                                                            <div className={`h-full rounded-full transition-all ${rack.occupancy >= 90 ? 'bg-red-500' : rack.occupancy >= 70 ? 'bg-orange-500' : rack.occupancy >= 40 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${Math.min(rack.occupancy, 100)}%` }} />
                                                                        </div>
                                                                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                                                                            <span>{formatNumber(rack.items)} / {formatNumber(rack.capacity)} item</span>
                                                                            <span>{rack.skus} SKU</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Stock Content */}
                                                                <div className="p-4">
                                                                    {rack.top_products && rack.top_products.length > 0 ? (
                                                                        <div className="space-y-2">
                                                                            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Produk Teratas</div>
                                                                            {rack.top_products.map((product, idx) => (
                                                                                <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                                                                                    <div className="min-w-0">
                                                                                        <div className="truncate text-xs font-semibold text-slate-700">{product.name}</div>
                                                                                        <div className="text-[10px] text-slate-400">{product.sku}</div>
                                                                                    </div>
                                                                                    <div className="text-sm font-bold text-slate-900">{formatNumber(product.quantity)}</div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-center text-xs text-slate-400">Belum ada stok</div>
                                                                    )}

                                                                    {/* Rack Actions */}
                                                                    <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                                                                        <Link
                                                                            href={route('warehouse', { zone: dashSelectedZone.id, rack: rack.id })}
                                                                            preserveScroll
                                                                            className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
                                                                        >
                                                                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                                            Detail
                                                                        </Link>
                                                                        {isManager ? (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => openRackEditModal(rack)}
                                                                                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                        ) : null}
                                                                        {canManageRackStock ? (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    rackStockCreateForm.setData('rack_id', rack.id);
                                                                                    setEditingRackStock(null);
                                                                                    setShowRackStockModal(true);
                                                                                }}
                                                                                className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                                                                            >
                                                                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                                                Stok
                                                                            </button>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Selected Rack Detail (if URL param) */}
                                        {selectedRack && selectedZone && selectedZone.id === dashSelectedZoneId ? (
                                            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-white p-5 shadow-[0_8px_20px_rgba(89,50,201,0.08)]">
                                                <div className="mb-4 flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-900">{selectedRack.code} — {selectedRack.name}</h3>
                                                        <p className="text-sm text-slate-500">Kapasitas: {formatNumber(selectedRack.capacity)} · Tipe: {selectedRack.rack_type} · Status: {selectedRack.status}</p>
                                                    </div>
                                                    {canManageRackStock ? (
                                                        <button type="button" onClick={openRackStockCreateModal} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500">
                                                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                            Tambah Stok
                                                        </button>
                                                    ) : null}
                                                </div>
                                                {selectedRack.stocks && selectedRack.stocks.length > 0 ? (
                                                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                                                        <table className="min-w-full divide-y divide-slate-200">
                                                            <thead className="bg-slate-50">
                                                                <tr>
                                                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Produk</th>
                                                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Qty</th>
                                                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Reserved</th>
                                                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Tersedia</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Batch</th>
                                                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Exp</th>
                                                                    {canManageRackStock ? <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th> : null}
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100">
                                                                {selectedRack.stocks.map((stock) => (
                                                                    <tr key={stock.id} className="hover:bg-slate-50">
                                                                        <td className="whitespace-nowrap px-4 py-3">
                                                                            <div className="text-sm font-semibold text-slate-900">{stock.product_name}</div>
                                                                            <div className="text-xs text-slate-400">{stock.sku}</div>
                                                                        </td>
                                                                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold text-slate-900">{formatNumber(stock.quantity)}</td>
                                                                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-amber-600">{formatNumber(stock.reserved_quantity)}</td>
                                                                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-emerald-600">{formatNumber(stock.available_quantity)}</td>
                                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">{stock.batch_number || '-'}</td>
                                                                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-slate-500">{stock.expired_date || '-'}</td>
                                                                        {canManageRackStock ? (
                                                                            <td className="whitespace-nowrap px-4 py-3 text-right">
                                                                                <div className="flex items-center justify-end gap-2">
                                                                                    <button type="button" onClick={() => openRackStockEditModal(stock)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">Edit</button>
                                                                                    <button type="button" onClick={() => deleteRackStock(stock)} className="text-xs font-semibold text-red-600 hover:text-red-500">Hapus</button>
                                                                                </div>
                                                                            </td>
                                                                        ) : null}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <div className="rounded-lg border-2 border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                                                        Belum ada stok pada rak ini
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}

                                        {/* Pending Manual Adjustments */}
                                        {canApproveAdjustments ? (
                                            <div>
                                                <div className="mb-3 flex items-center justify-between">
                                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Manual Adjustment Pending</h3>
                                                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                                                        {pendingManualAdjustments.length} menunggu
                                                    </span>
                                                </div>
                                                {pendingManualAdjustments.length === 0 ? (
                                                    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                                                        Tidak ada koreksi stok manual yang menunggu approval.
                                                    </div>
                                                ) : (
                                                    <div className="overflow-hidden rounded-xl border border-amber-200 bg-white">
                                                        <div className="divide-y divide-slate-100">
                                                            {pendingManualAdjustments.slice(0, 6).map((adjustment) => (
                                                                <div key={adjustment.id} className="flex items-center justify-between px-4 py-3">
                                                                    <div className="min-w-0">
                                                                        <div className="truncate text-sm font-semibold text-slate-900">{adjustment.number}</div>
                                                                        <div className="text-xs text-slate-500">
                                                                            {adjustment.operator} · {adjustment.created_at_label} · {adjustment.items_count} item
                                                                        </div>
                                                                    </div>
                                                                    <div className="ml-4 flex items-center gap-2">
                                                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                                                                            {formatNumber(adjustment.total_quantity)}
                                                                        </span>
                                                                        <Link
                                                                            href={route('stock-adjustments.show', adjustment.id)}
                                                                            className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-100"
                                                                        >
                                                                            Review
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}

                                        {/* Activity Log */}
                                        <div>
                                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Aktivitas Terakhir</h3>
                                            {activityLog.length === 0 ? (
                                                <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">Belum ada aktivitas</div>
                                            ) : (
                                                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                                                    <div className="divide-y divide-slate-100">
                                                        {activityLog.slice(0, 5).map((activity) => (
                                                            <div key={activity.id} className="flex items-center justify-between px-4 py-3">
                                                                <div className="min-w-0">
                                                                    <div className="truncate text-sm font-semibold text-slate-900">{activity.title}</div>
                                                                    <div className="text-xs text-slate-500">{activity.location} · {activity.operator} · {activity.time}</div>
                                                                </div>
                                                                <div className={`ml-4 rounded-full px-2.5 py-1 text-xs font-bold ${activity.type === 'in' ? 'bg-emerald-50 text-emerald-700' : activity.type === 'out' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                                                    {formatNumber(activity.quantity)}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
                                        <svg className="mx-auto h-16 w-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        <p className="mt-4 text-lg font-semibold text-slate-500">Pilih zona untuk melihat detail</p>
                                        <p className="mt-1 text-sm text-slate-400">Klik zona di panel kiri untuk melihat rak dan stok</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="md:hidden">
                    <div className="mx-6 mt-5 rounded-[28px] border border-amber-200 bg-amber-50 px-6 py-6 text-amber-900 shadow-[0_10px_30px_rgba(245,158,11,0.08)]">
                        <div className="text-[18px] font-black tracking-tight">Gunakan desktop untuk editor denah gudang.</div>
                        <p className="mt-2 text-[14px] font-semibold leading-7 text-amber-800">
                            Workspace editor membutuhkan area canvas lebar untuk drag, resize, dan panel properti. Buka halaman ini pada desktop atau laptop untuk pengalaman penuh.
                        </p>
                    </div>
                </div>

                <div className="hidden min-h-0 flex-1 flex-col overflow-hidden md:flex">
                    <ToastStack toasts={toasts} onRemove={removeToast} />

                    <div className="flex h-full min-h-0 overflow-hidden border-t border-[#dbe4f0] bg-[#f3f5fb] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                        <CanvasErrorBoundary onReset={() => { setLayoutItems([]); setSelectedItemId(null); }}>
                        <div className="flex min-w-0 flex-1 flex-col">
                            <div className="shrink-0 border-b border-[#e5eaf3] bg-white">
                                {/* Compact header */}
                                <div className="flex items-center gap-3 px-4 pt-2 pb-1">
                                    <button type="button" onClick={() => setViewMode('dashboard')} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50">
                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" /></svg>
                                        Dashboard
                                    </button>
                                    <span className="truncate text-[14px] font-black tracking-tight text-[#28106F]">{warehouse?.name || 'Manajemen Gudang'}</span>
                                    <span className="shrink-0 rounded-full bg-[#eef2ff] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#28106F]">{formatNumber(zones.length)} Zona</span>
                                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-700">{formatNumber(racks.length)} Rak</span>
                                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] ${occupancyTone(totalOccupancy)} bg-slate-50`}>{formatPercent(totalOccupancy)} Terisi</span>
                                </div>

                                {/* Toolbar with arrow navigation */}
                                <div className="relative flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => toolbarRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                                        className="absolute left-0 z-10 flex h-8 w-6 items-center justify-center rounded-r-md border border-l-0 border-[#dbe4f0] bg-white/90 text-slate-400 shadow-sm backdrop-blur-sm transition hover:bg-slate-50 hover:text-slate-600"
                                    >
                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <div
                                        ref={toolbarRef}
                                        className="flex flex-1 items-center gap-1.5 overflow-x-auto px-8 pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                    >
                                    <ToolbarButton active={mode === 'select'} onClick={() => { setMode('select'); setPendingAddType(null); }} icon={<SelectIcon />}>
                                        Select
                                    </ToolbarButton>
                                    <ToolbarButton active={mode === 'sketch'} onClick={() => setMode('sketch')} icon={<SketchIcon />}>
                                        Sketch
                                    </ToolbarButton>
                                    <Link
                                        href={route('rack.allocation')}
                                        className="inline-flex shrink-0 items-center gap-1.5 rounded-[14px] border border-[#dbe4f0] bg-white px-3 text-[11px] font-black uppercase tracking-[0.15em] text-[#28106F] transition hover:bg-indigo-50"
                                    >
                                        <TransferIcon />
                                        Transfer Rack
                                    </Link>
                                    <span className="h-5 w-px shrink-0 bg-[#e2e8f0]" />
                                    <ToolbarButton tone="primary" onClick={handleSaveLayout} icon={<SaveIcon />}>
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </ToolbarButton>
                                    <ToolbarButton tone="subtle" onClick={undo} disabled={!canUndo} icon={<UndoIcon />}>
                                        Undo
                                    </ToolbarButton>
                                    <ToolbarButton tone="subtle" onClick={redo} disabled={!canRedo} icon={<RedoIcon />}>
                                        Redo
                                    </ToolbarButton>
                                    <span className="h-5 w-px shrink-0 bg-[#e2e8f0]" />
                                    <ToolbarButton tone="subtle" onClick={() => setShowHeatmap((c) => !c)} active={showHeatmap} icon={<ActivityIcon />}>
                                        Heatmap
                                    </ToolbarButton>
                                    <ToolbarButton tone="subtle" onClick={handleDeleteLocal} icon={<TrashIcon />}>
                                        Delete
                                    </ToolbarButton>
                                    <ToolbarButton tone="subtle" onClick={handleRotateRack} icon={<RotateIcon />}>
                                        Rotate
                                    </ToolbarButton>
                                    <ToolbarButton tone="subtle" onClick={resetView} icon={<ResetIcon />}>
                                        Reset
                                    </ToolbarButton>
                                    <ToolbarButton tone="subtle" onClick={() => setIsInspectorOpen((current) => !current)} icon={<PanelIcon />}>
                                        Panel
                                    </ToolbarButton>
                                    <span className="h-5 w-px shrink-0 bg-[#e2e8f0]" />
                                    <div className="inline-flex shrink-0 items-center gap-1.5 rounded-[14px] border border-[#dbe4f0] bg-white px-2" style={{ minHeight: 40 }}>
                                        <span className="whitespace-nowrap text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">Preset</span>
                                        <div className="group relative h-8 min-w-[200px] rounded-[12px] border border-[#D4C8F5] bg-[#F8F7FF] hover:border-[#28106F] hover:shadow-[0_4px_12px_rgba(89,50,201,0.08)] transition-all cursor-pointer outline-none">
                                            <div className="pointer-events-none flex h-full items-center justify-between gap-2 px-3">
                                                <span className="truncate text-[11px] font-black text-[#28106F] transition-colors group-hover:text-[#28106F]">{selectedTemplateLabel}</span>
                                                <svg className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-all duration-300 group-hover:text-[#28106F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                            <BaseSelect
                                                aria-label="Preset layout"
                                                value={selectedTemplate}
                                                onChange={(event) => setSelectedTemplate(event.target.value)}
                                                options={TEMPLATE_OPTIONS}
                                                className="absolute inset-0 h-full min-w-full cursor-pointer border-none bg-transparent p-0 text-transparent opacity-0 shadow-none outline-none focus:ring-2 focus:ring-[#c7d2fe]"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => applyLayoutTemplate(selectedTemplate)}
                                            className="rounded-lg border border-[#dbe4f0] bg-[#F8F7FF] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-slate-600 transition hover:bg-slate-100"
                                        >
                                            Pakai
                                        </button>
                                    </div>
                                    <span className="h-5 w-px shrink-0 bg-[#e2e8f0]" />
                                    <ToolbarButton tone="subtle" onClick={exportLayoutAsPng}>PNG</ToolbarButton>
                                    <ToolbarButton tone="subtle" onClick={exportLayoutAsPdf}>PDF</ToolbarButton>
                                    <ToolbarButton tone="subtle" onClick={restoreDraftFromLocal}>Draft</ToolbarButton>
                                    <span className="h-5 w-px shrink-0 bg-[#e2e8f0]" />
                                    <div className="flex shrink-0 items-center gap-1 rounded-[14px] border border-[#dbe4f0] bg-[#F8F7FF] px-1.5" style={{ minHeight: 40 }}>
                                        <button type="button" onClick={zoomOut} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white hover:shadow-sm">
                                            <ZoomOutIcon />
                                        </button>
                                        <div className="min-w-[48px] text-center text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{Math.round(scale * 100)}%</div>
                                        <button type="button" onClick={zoomIn} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white hover:shadow-sm">
                                            <ZoomInIcon />
                                        </button>
                                    </div>
                                    <div className="inline-flex shrink-0 items-center rounded-[14px] border border-[#dbe4f0] bg-white px-2.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500" style={{ minHeight: 40 }}>
                                        {formatNumber(racks.length)} rak
                                    </div>
                                    <div className="inline-flex shrink-0 items-center rounded-[14px] bg-[#28106F] px-2.5 text-[10px] font-black uppercase tracking-[0.12em] text-white" style={{ minHeight: 40 }}>
                                        {formatPercent(totalOccupancy)} isi
                                    </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toolbarRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                                        className="absolute right-0 z-10 flex h-8 w-6 items-center justify-center rounded-l-md border border-r-0 border-[#dbe4f0] bg-white/90 text-slate-400 shadow-sm backdrop-blur-sm transition hover:bg-slate-50 hover:text-slate-600"
                                    >
                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                                {invalidRackCount > 0 ? (
                                    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-[12px] border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800">
                                        <span>Ada {invalidRackCount} rack berada di luar zona valid. Perbaiki posisi sebelum `Save Layout`.</span>
                                        <button
                                            type="button"
                                            onClick={focusNextInvalidRack}
                                            className="rounded-[10px] border border-amber-300 bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-800 transition hover:bg-amber-200"
                                        >
                                            Focus Rack
                                        </button>
                                        <button
                                            type="button"
                                            onClick={fixAllInvalidRacks}
                                            className="rounded-[10px] border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-800 transition hover:bg-emerald-200"
                                        >
                                            Fix All
                                        </button>
                                        {invalidRackInfo.racks.slice(0, 3).map((rack) => (
                                            <span key={rack.id} className="rounded-full border border-amber-200 bg-white/70 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-amber-700">
                                                {rack.code}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex min-h-0 flex-1 overflow-hidden">
                                <div className="flex w-[68px] shrink-0 flex-col border-r border-[#e5eaf3] bg-[#edf2fb]">
                                    <div className="shrink-0 px-2 pb-2 pt-3">
                                        <div className="mb-1 text-center text-[9px] font-black uppercase tracking-[0.24em] text-slate-400">Tools</div>
                                    </div>
                                    <div className="scrollbar-none flex min-h-0 flex-1 flex-col items-center gap-3 overflow-y-auto px-2 pb-4">
                                        <ToolRailButton active={mode === 'select'} onClick={() => { setMode('select'); setPendingAddType(null); }} icon={<SelectIcon className="h-4 w-4" />} label="Select" />
                                        <ToolRailButton active={mode === 'sketch'} onClick={() => setMode('sketch')} icon={<SketchIcon className="h-4 w-4" />} label="Sketch" />
                                        {ADD_ACTIONS.map((action) => (
                                            <ToolRailButton
                                                key={action.id}
                                                active={pendingAddType === action.id}
                                                onClick={() => {
                                                    setMode('sketch');
                                                    setPendingAddType(action.id);
                                                }}
                                                icon={<LayersIcon className="h-4 w-4" />}
                                                label={action.id === 'zone'
                                                    ? 'Zone'
                                                    : action.id === 'rack'
                                                        ? 'Rack'
                                                        : action.id === 'wall'
                                                            ? 'Wall'
                                                            : action.id === 'inbound'
                                                                ? 'In'
                                                                : action.id === 'outbound'
                                                                    ? 'Out'
                                                                    : action.id === 'cross_dock'
                                                                        ? 'Cross'
                                                                        : 'Haz'}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className={`flex min-w-0 flex-1 flex-col bg-[#f7f8fd] ${isInspectorOpen ? 'border-r border-[#e5eaf3]' : ''}`}>
                                    <div className="shrink-0 border-b border-[#e5eaf3] bg-white px-3 py-2">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#28106F]">
                                                        Snap to Grid
                                                    </span>
                                                    <span className="text-[11px] font-semibold text-slate-500">
                                                        Tahan `Space` lalu drag atau klik tengah mouse untuk geser kamera dari mana saja.
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                                                <span className="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1">
                                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                                    &lt;40%
                                            </span>
                                            <span className="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1">
                                                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                                40-70%
                                            </span>
                                            <span className="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1">
                                                <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                                                70-90%
                                            </span>
                                            <span className="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1">
                                                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                                &gt;90%
                                            </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        ref={viewportRef}
                                        className="relative min-h-0 flex-1 overflow-hidden bg-[#f5f7fd]"
                                        onWheel={handleCanvasWheel}
                                    >
                                        <div
                                            ref={surfaceRef}
                                            onMouseDown={handleCanvasMouseDown}
                                            className={`absolute inset-0 ${isPanShortcutActive ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                                            style={{
                                                backgroundColor: '#f5f7fd',
                                                backgroundImage: 'linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)',
                                                backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                                            }}
                                        >
                                            <div
                                                className="absolute left-0 top-0 origin-top-left"
                                                style={{
                                                    width: CANVAS_WIDTH,
                                                    height: CANVAS_HEIGHT,
                                                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                                                }}
                                            >
                                                <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 w-fit max-w-[360px] -translate-x-1/2 rounded-full border border-[#dbe4f0] bg-white/88 px-4 py-2 text-[10px] font-semibold leading-5 text-slate-600 shadow-[0_10px_24px_rgba(148,163,184,0.12)] backdrop-blur">
                                                    {pendingAddType
                                                        ? `${ADD_ACTIONS.find((item) => item.id === pendingAddType)?.label} aktif. Klik lalu tempatkan di canvas.`
                                                        : 'Space pan · +/- zoom · Ctrl+Z undo · Ctrl+Shift+Z redo · Ctrl+S save · Delete hapus · M heatmap'}
                                                </div>
                                                <div
                                                    className="absolute rounded-[26px] border border-[#dfe6f4] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.99),_rgba(250,252,255,0.94))] shadow-[0_22px_52px_rgba(148,163,184,0.10)]"
                                                    style={{ left: canvasFrame.x, top: canvasFrame.y, width: canvasFrame.w, height: canvasFrame.h }}
                                                >
                                                    <button
                                                        type="button"
                                                        onMouseDown={(event) => {
                                                            event.stopPropagation();
                                                            beginCanvasMove(event);
                                                        }}
                                                        className="absolute left-5 top-5 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dbe4f0] bg-white/92 text-slate-500 shadow-[0_8px_18px_rgba(148,163,184,0.14)] cursor-move"
                                                        title="Move canvas"
                                                    >
                                                        <span className="h-2 w-2 rounded-full bg-[#28106F]" />
                                                    </button>
                                                    <div className="pointer-events-none absolute inset-[18px] rounded-[22px] border border-[#eef2f7]" />
                                                    <div className="pointer-events-none absolute left-[30px] right-[30px] top-[30px] h-9 rounded-[14px] border border-dashed border-[#EDE8FC] bg-[#fbfcff]" />
                                                    <div className="pointer-events-none absolute bottom-[26px] left-[48px] right-[48px] h-px border-t border-dashed border-[#EDE8FC]" />
                                                    <div className="pointer-events-none absolute left-[150px] right-[150px] top-[116px] h-px border-t border-dashed border-[#d7e0ef]" />
                                                    <div className="pointer-events-none absolute left-[150px] right-[150px] top-[430px] h-px border-t border-dashed border-[#d7e0ef]" />
                                                    <div className="pointer-events-none absolute left-[530px] top-[150px] bottom-[150px] w-px border-l border-dashed border-[#e2e8f0]" />
                                                    <div className="pointer-events-none absolute left-[920px] top-[150px] bottom-[150px] w-px border-l border-dashed border-[#e2e8f0]" />
                                                    <button
                                                        type="button"
                                                        onMouseDown={(event) => {
                                                            event.stopPropagation();
                                                            beginCanvasResize(event);
                                                        }}
                                                        className="absolute -bottom-3 -right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-white bg-[#28106F] text-white shadow-[0_10px_24px_rgba(89,50,201,0.24)] cursor-nwse-resize"
                                                        title="Resize canvas"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M15 9l6 6m0 0h-4m4 0v-4M9 15l-6-6m0 0h4m-4 0v4" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                {layoutItems.map((item) => {
                                                    const typeStyle = getTypeStyle(item.type, item.kind === 'rack' ? 'rack' : 'storage');
                                                    const normalizedType = normalizeTypeKey(item.type);
                                                    const isStructure = isStructuralType(item.type);
                                                    const isWall = normalizedType === 'wall';
                                                    const isSelected = selectedItemId === item.id;

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            onMouseDown={(event) => handleItemMouseDown(event, item)}
                                                            className={`absolute select-none overflow-hidden border transition-all duration-200 ${isWall ? 'rounded-[6px]' : item.kind === 'rack' ? 'rounded-[8px]' : 'rounded-[20px]'} ${item.kind === 'rack' || isStructure ? 'shadow-sm hover:shadow' : 'shadow-md hover:shadow-lg'} ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                                                            style={{
                                                                left: item.x,
                                                                top: item.y,
                                                                width: item.w,
                                                                height: item.h,
                                                                background: isWall
                                                                    ? 'linear-gradient(180deg, #475569, #334155)'
                                                                    : item.kind === 'rack'
                                                                        ? 'linear-gradient(180deg, #ffffff, #f1f5f9)'
                                                                        : `linear-gradient(180deg, ${typeStyle.bg}, ${item.color || typeStyle.bg})`,
                                                                borderColor: isSelected ? '#5932C9' : typeStyle.border,
                                                                boxShadow: showHeatmap && item.occupancy > 50
                                                                    ? `inset 0 0 ${Math.min(item.w, item.h) * 0.4}px rgba(239, 68, 68, ${Math.min(item.occupancy / 100, 0.4)})`
                                                                    : item.kind === 'rack' && item.occupancy > 90
                                                                        ? '0 0 0 2px rgba(239, 68, 68, 0.6), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                                        : undefined,
                                                            }}
                                                        >
                                                            {!isWall ? (
                                                                <div className={`absolute inset-x-0 top-0 ${item.kind === 'rack' ? 'h-[2px] bg-slate-400/50' : 'h-[5px]'}`} style={item.kind === 'rack' ? undefined : { backgroundColor: typeStyle.border }} />
                                                            ) : null}
                                                            {item.kind === 'zone' && item.metadata?.locked ? (
                                                                <div className="absolute right-3 top-3 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] text-amber-700 shadow-sm">
                                                                    Locked
                                                                </div>
                                                            ) : null}
                                                            {!isWall ? <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.4),transparent_50%)] pointer-events-none" /> : null}
                                                            {isWall ? (
                                                                <div className="relative flex h-full items-center justify-center px-3">
                                                                    {isSelected ? <div className="truncate text-[9px] font-bold uppercase tracking-[0.2em] text-white/90">{item.code}</div> : null}
                                                                </div>
                                                            ) : (
                                                            <div className={`relative flex h-full flex-col justify-between ${item.kind === 'rack' ? 'px-2.5 py-1.5' : 'p-4'}`}>
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <div className={`truncate font-bold uppercase text-slate-500/90 ${item.kind === 'rack' ? 'text-[7px] tracking-wider' : 'text-[10px] tracking-widest'}`}>{item.code}</div>
                                                                        <div className={`truncate font-black tracking-tight text-slate-800 ${item.kind === 'rack' ? 'mt-0 text-[9px]' : 'mt-0.5 text-[15px]'}`}>{item.name}</div>
                                                                    </div>
                                                                    {item.kind !== 'zone' ? (
                                                                        <div className={`rounded-md font-bold ${item.kind === 'rack' ? 'px-1.5 py-0.5 text-[8px]' : 'px-2.5 py-1 text-[11px]'} ${typeStyle.badge}`} style={{ color: typeStyle.text }}>
                                                                            {formatPercent(item.occupancy)}
                                                                        </div>
                                                                    ) : (
                                                                        <div className={`text-[13px] font-black ${occupancyTone(item.occupancy)}`}>
                                                                            {formatPercent(item.occupancy)}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {item.kind === 'rack' ? (
                                                                    <div className="mt-1 flex flex-1 items-center gap-1 opacity-80">
                                                                        {Array.from({ length: Math.max(4, Math.min(10, Math.floor(item.w / 20))) }).map((_, shelfIndex) => (
                                                                            <div key={shelfIndex} className="h-full min-h-[4px] flex-1 rounded-[1px] border border-slate-300/60 bg-[linear-gradient(180deg,#ffffff,#F8F7FF)]" />
                                                                        ))}
                                                                    </div>
                                                                ) : null}

                                                                <div className="flex items-end justify-between gap-3">
                                                                    <div className={`rounded-lg border border-white/60 bg-white/70 font-bold uppercase text-slate-600 shadow-sm backdrop-blur-md ${item.kind === 'rack' ? 'px-1.5 py-0.5 text-[7px] tracking-wider' : 'px-2.5 py-1 text-[10px] tracking-widest'}`}>
                                                                        {item.kind === 'rack' ? 'Rack' : typeStyle.label}
                                                                    </div>
                                                                    <div className={`font-bold uppercase tracking-wider text-slate-500/90 ${item.kind === 'rack' ? 'text-[8px]' : 'text-[11px]'}`}>
                                                                        {isStructuralType(item.type) ? `${item.w} x ${item.h}` : item.kind === 'rack' ? `${formatNumber(item.capacity)} slot` : `${formatNumber(item.capacity)} unit`}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            )}

                                                            {isSelected ? RESIZE_DIRECTIONS.map((direction) => {
                                                                const positionMap = {
                                                                    nw: '-left-2 -top-2',
                                                                    n: 'left-1/2 -top-2 -translate-x-1/2',
                                                                    ne: '-right-2 -top-2',
                                                                    e: '-right-2 top-1/2 -translate-y-1/2',
                                                                    se: '-right-2 -bottom-2',
                                                                    s: 'left-1/2 -bottom-2 -translate-x-1/2',
                                                                    sw: '-left-2 -bottom-2',
                                                                    w: '-left-2 top-1/2 -translate-y-1/2',
                                                                };
                                                                const cursorMap = {
                                                                    nw: 'cursor-nwse-resize',
                                                                    n: 'cursor-ns-resize',
                                                                    ne: 'cursor-nesw-resize',
                                                                    e: 'cursor-ew-resize',
                                                                    se: 'cursor-nwse-resize',
                                                                    s: 'cursor-ns-resize',
                                                                    sw: 'cursor-nesw-resize',
                                                                    w: 'cursor-ew-resize',
                                                                };
                                                                return (
                                                                    <button
                                                                        key={direction}
                                                                        type="button"
                                                                        onMouseDown={(event) => {
                                                                            event.stopPropagation();
                                                                            beginResize(event, item, direction);
                                                                        }}
                                                                        className={`absolute ${positionMap[direction]} z-20 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#28106F] shadow-[0_4px_10px_rgba(89,50,201,0.22)] ${cursorMap[direction]}`}
                                                                    />
                                                                );
                                                            }) : null}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isInspectorOpen ? (
                                <aside
                                    className="relative flex min-h-0 shrink-0 flex-col border-l border-[#e5eaf3] bg-[#f6f8fc]"
                                    style={{ width: inspectorWidth }}
                                >
                                    <button
                                        type="button"
                                        onMouseDown={beginInspectorResize}
                                        className="absolute left-0 top-0 z-20 h-full w-2 -translate-x-1/2 cursor-ew-resize bg-transparent hover:bg-indigo-100/40"
                                        title="Resize inspector"
                                    />
                                    <div className="shrink-0 border-b border-[#e5eaf3] bg-white px-4 py-3">
                                        <div className="flex items-center justify-between">
                                            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Inspector</div>
                                            <button type="button" onClick={() => setIsInspectorOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                        {selectedItem ? (
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className={`h-3 w-3 shrink-0 rounded-full ${getTypeStyle(selectedItem.type, selectedItem.kind === 'rack' ? 'rack' : isStructuralType(selectedItem.type) ? 'wall' : 'storage').badge}`} style={{ backgroundColor: getTypeStyle(selectedItem.type, selectedItem.kind === 'rack' ? 'rack' : isStructuralType(selectedItem.type) ? 'wall' : 'storage').bg }} />
                                                <span className="truncate text-[14px] font-black text-[#28106F]">{selectedItem.name}</span>
                                                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">{selectedItem.code}</span>
                                            </div>
                                        ) : (
                                            <div className="mt-2 text-[11px] font-semibold text-slate-400">Klik card di canvas untuk edit</div>
                                        )}
                                    </div>

                                    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
                                        {!selectedItem ? (
                                            <div className="flex flex-col items-center gap-3 py-8 text-center">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                                    <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                                                </div>
                                                <div>
                                                    <div className="text-[12px] font-black text-slate-600">Pilih Card</div>
                                                    <div className="mt-1 text-[11px] font-semibold leading-5 text-slate-400">Klik salah satu card di canvas untuk mulai edit propertinya.</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {/* Quick Stats */}
                                                <div className="grid grid-cols-3 gap-1.5">
                                                    <div className="rounded-lg bg-white px-2.5 py-2 text-center shadow-sm">
                                                        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Posisi</div>
                                                        <div className="mt-0.5 text-[12px] font-black text-[#28106F]">{selectedItem.x},{selectedItem.y}</div>
                                                    </div>
                                                    <div className="rounded-lg bg-white px-2.5 py-2 text-center shadow-sm">
                                                        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Ukuran</div>
                                                        <div className="mt-0.5 text-[12px] font-black text-[#0f766e]">{selectedItem.w}×{selectedItem.h}</div>
                                                    </div>
                                                    <div className="rounded-lg bg-white px-2.5 py-2 text-center shadow-sm">
                                                        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Terisi</div>
                                                        <div className={`mt-0.5 text-[12px] font-black ${occupancyTone(selectedItem.occupancy)}`}>{formatPercent(selectedItem.occupancy)}</div>
                                                    </div>
                                                </div>

                                                {/* Identity */}
                                                <section className="rounded-xl bg-white p-3 shadow-sm">
                                                    <div className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Identitas</div>
                                                    <div className="space-y-2">
                                                        <Field label="Nama">
                                                            <BaseInput value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
                                                        </Field>
                                                        <Field label="Kode">
                                                            <BaseInput value={draft.code} onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value.toUpperCase() }))} />
                                                        </Field>
                                                    </div>
                                                </section>

                                                {/* Type + Status */}
                                                <section className="rounded-xl bg-white p-3 shadow-sm">
                                                    <div className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Tipe & Status</div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Field label="Tipe">
                                                            <BaseSelect
                                                                value={draft.type}
                                                                onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value, color: getTypeStyle(event.target.value, selectedItem.kind === 'rack' ? 'rack' : isStructuralType(event.target.value) ? normalizeTypeKey(event.target.value) : 'storage').bg }))}
                                                                options={selectedItem.kind === 'rack'
                                                                    ? [{ value: 'rack', label: 'Rack' }]
                                                                    : selectedItem.kind === 'structure'
                                                                        ? [{ value: 'wall', label: 'Wall' }]
                                                                    : [
                                                                        ...TYPE_OPTIONS,
                                                                        { value: 'inbound', label: 'Inbound' },
                                                                        { value: 'outbound', label: 'Outbound' },
                                                                    ]}
                                                            />
                                                        </Field>
                                                        <Field label="Status">
                                                            <BaseSelect value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))} options={STATUS_OPTIONS} />
                                                        </Field>
                                                    </div>
                                                </section>

                                                {/* Capacity + Style */}
                                                <section className="rounded-xl bg-white p-3 shadow-sm">
                                                    <div className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Kapasitas & Warna</div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Field label="Kapasitas %">
                                                            <BaseInput type="number" min="0" max="100" value={draft.occupancy} onChange={(event) => setDraft((current) => ({ ...current, occupancy: event.target.value }))} />
                                                        </Field>
                                                        <Field label="Kapasitas Unit">
                                                            <BaseInput type="number" min="0" value={draft.capacity} onChange={(event) => setDraft((current) => ({ ...current, capacity: event.target.value }))} />
                                                        </Field>
                                                        <Field label="Warna">
                                                            <BaseInput value={draft.color} onChange={(event) => setDraft((current) => ({ ...current, color: event.target.value }))} />
                                                        </Field>
                                                        {selectedItem.kind === 'rack' ? (
                                                            <Field label="Rotasi">
                                                                <BaseSelect
                                                                    value={String(draft.rotation ?? 0)}
                                                                    onChange={(event) => setDraft((current) => ({ ...current, rotation: Number(event.target.value) }))}
                                                                    options={[
                                                                        { value: '0', label: '0° Horizontal' },
                                                                        { value: '90', label: '90° Vertical' },
                                                                    ]}
                                                                />
                                                            </Field>
                                                        ) : null}
                                                    </div>
                                                </section>

                                                {/* Layout Position */}
                                                <section className="rounded-xl bg-white p-3 shadow-sm">
                                                    <div className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Posisi & Ukuran</div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Field label="X">
                                                            <BaseInput type="number" value={draft.x} onChange={(event) => setDraft((current) => ({ ...current, x: event.target.value }))} />
                                                        </Field>
                                                        <Field label="Y">
                                                            <BaseInput type="number" value={draft.y} onChange={(event) => setDraft((current) => ({ ...current, y: event.target.value }))} />
                                                        </Field>
                                                        <Field label="Lebar">
                                                            <BaseInput type="number" value={draft.w} onChange={(event) => setDraft((current) => ({ ...current, w: event.target.value }))} />
                                                        </Field>
                                                        <Field label="Tinggi">
                                                            <BaseInput type="number" value={draft.h} onChange={(event) => setDraft((current) => ({ ...current, h: event.target.value }))} />
                                                        </Field>
                                                    </div>
                                                    {selectedItem.kind === 'rack' ? (
                                                        <div className="mt-2">
                                                            <Field label="Zona Induk" hint="Rak lokal bisa dikaitkan ke zona aktif pada canvas.">
                                                                <BaseSelect
                                                                    value={selectedItem.zoneId ?? ''}
                                                                    onChange={(event) => {
                                                                        const nextZoneId = event.target.value;
                                                                        setLayoutItems((current) => current.map((item) => item.id === selectedItem.id ? { ...item, zoneId: nextZoneId || null } : item));
                                                                    }}
                                                                    options={[
                                                                        { value: '', label: 'Tanpa Zona' },
                                                                        ...zones.map((zone) => ({ value: zone.id, label: `${zone.code} - ${zone.name}` })),
                                                                    ]}
                                                                />
                                                            </Field>
                                                        </div>
                                                    ) : null}
                                                </section>

                                                {/* Actions */}
                                                <section className="rounded-xl bg-white p-3 shadow-sm">
                                                    <div className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Aksi</div>
                                                    <div className="space-y-2">
                                                        <button
                                                            type="button"
                                                            onClick={handleApplyDraft}
                                                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#28106F] px-3 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-[0_8px_16px_rgba(89,50,201,0.18)] transition hover:bg-[#3730a3]"
                                                        >
                                                            <SaveIcon /> Simpan Perubahan
                                                        </button>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={handleDuplicate}
                                                                className="flex items-center justify-center gap-1.5 rounded-lg border border-[#dbe4f0] bg-[#F8F7FF] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 transition hover:bg-slate-100"
                                                            >
                                                                <DuplicateIcon /> Duplikat
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={handleDeleteLocal}
                                                                className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-red-600 transition hover:bg-red-100"
                                                            >
                                                                <TrashIcon /> Hapus
                                                            </button>
                                                        </div>
                                                        {selectedItem.kind === 'zone' ? (
                                                            <button
                                                                type="button"
                                                                onClick={toggleSelectedZoneLock}
                                                                className={`flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition ${isSelectedZoneLocked ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-[#dbe4f0] bg-[#F8F7FF] text-slate-600 hover:bg-slate-100'}`}
                                                            >
                                                                {isSelectedZoneLocked ? '🔓 Unlock Zone' : '🔒 Lock Zone'}
                                                            </button>
                                                        ) : null}
                                                        {selectedItem.kind === 'rack' ? (
                                                            <button
                                                                type="button"
                                                                onClick={handleRotateRack}
                                                                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#dbe4f0] bg-[#F8F7FF] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 transition hover:bg-slate-100"
                                                            >
                                                                <RotateIcon /> Rotate Rack
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </section>
                                            </div>
                                        )}
                                    </div>
                                </aside>
                                ) : null}
                            </div>
                        </div>
                        </CanvasErrorBoundary>
                    </div>
                </div>
                </div>
            )}

            <Modal
                open={isManager && showZoneModal}
                title="Buat Zona Baru"
                subtitle="Form lama tetap disediakan untuk membuat zona di data master warehouse."
                onClose={() => setShowZoneModal(false)}
            >
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        zoneCreateForm.post('/warehouse/zones', {
                            preserveScroll: true,
                            onSuccess: () => setShowZoneModal(false),
                        });
                    }}
                    className="space-y-4"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Kode">
                            <BaseInput value={zoneCreateForm.data.code} onChange={(event) => zoneCreateForm.setData('code', event.target.value)} />
                            <InputError message={zoneCreateForm.errors.code} className="mt-2" />
                        </Field>
                        <Field label="Nama">
                            <BaseInput value={zoneCreateForm.data.name} onChange={(event) => zoneCreateForm.setData('name', event.target.value)} />
                            <InputError message={zoneCreateForm.errors.name} className="mt-2" />
                        </Field>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Tipe">
                            <BaseSelect value={zoneCreateForm.data.type} onChange={(event) => zoneCreateForm.setData('type', event.target.value)} options={TYPE_OPTIONS} />
                        </Field>
                        <Field label="Kapasitas">
                            <BaseInput type="number" min="1" value={zoneCreateForm.data.capacity} onChange={(event) => zoneCreateForm.setData('capacity', event.target.value)} />
                            <InputError message={zoneCreateForm.errors.capacity} className="mt-2" />
                        </Field>
                    </div>
                    <Field label="Deskripsi">
                        <BaseTextArea rows={4} value={zoneCreateForm.data.description} onChange={(event) => zoneCreateForm.setData('description', event.target.value)} />
                    </Field>
                    <button
                        type="submit"
                        disabled={zoneCreateForm.processing}
                        className="rounded-[14px] bg-[#28106F] px-5 py-3 text-[12px] font-black uppercase tracking-[0.16em] text-white shadow-[0_10px_20px_rgba(89,50,201,0.18)] disabled:opacity-60"
                    >
                        Simpan Zona
                    </button>
                </form>
            </Modal>

            <Modal
                open={isManager && showZoneEditModal}
                title="Edit Zona"
                subtitle="Perbarui data zona agar konsisten dengan layout operasional."
                onClose={() => {
                    setShowZoneEditModal(false);
                    setEditingZoneId(null);
                }}
            >
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (!editingZoneId) return;
                        zoneEditForm.put(`/warehouse/zones/${editingZoneId}?zone=${editingZoneId}`, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setShowZoneEditModal(false);
                                setEditingZoneId(null);
                            },
                        });
                    }}
                    className="space-y-4"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Kode">
                            <BaseInput value={zoneEditForm.data.code} onChange={(event) => zoneEditForm.setData('code', event.target.value)} />
                            <InputError message={zoneEditForm.errors.code} className="mt-2" />
                        </Field>
                        <Field label="Nama">
                            <BaseInput value={zoneEditForm.data.name} onChange={(event) => zoneEditForm.setData('name', event.target.value)} />
                            <InputError message={zoneEditForm.errors.name} className="mt-2" />
                        </Field>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Tipe">
                            <BaseSelect value={zoneEditForm.data.type} onChange={(event) => zoneEditForm.setData('type', event.target.value)} options={TYPE_OPTIONS} />
                        </Field>
                        <Field label="Kapasitas">
                            <BaseInput type="number" min="1" value={zoneEditForm.data.capacity} onChange={(event) => zoneEditForm.setData('capacity', event.target.value)} />
                            <InputError message={zoneEditForm.errors.capacity} className="mt-2" />
                        </Field>
                    </div>
                    <Field label="Deskripsi">
                        <BaseTextArea rows={4} value={zoneEditForm.data.description} onChange={(event) => zoneEditForm.setData('description', event.target.value)} />
                    </Field>
                    <button
                        type="submit"
                        disabled={zoneEditForm.processing || !editingZoneId}
                        className="rounded-[14px] bg-[#28106F] px-5 py-3 text-[12px] font-black uppercase tracking-[0.16em] text-white shadow-[0_10px_20px_rgba(89,50,201,0.18)] disabled:opacity-60"
                    >
                        Simpan Perubahan Zona
                    </button>
                </form>
            </Modal>

            <Modal
                open={isManager && showRackModal}
                title="Buat Rak Baru"
                subtitle="Form lama tetap disediakan untuk membuat rak pada data master warehouse."
                onClose={() => setShowRackModal(false)}
            >
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        rackCreateForm.post('/warehouse/racks', {
                            preserveScroll: true,
                            onSuccess: () => setShowRackModal(false),
                        });
                    }}
                    className="space-y-4"
                >
                    <Field label="Zona">
                        <BaseSelect
                            value={rackCreateForm.data.warehouse_zone_id}
                            onChange={(event) => rackCreateForm.setData('warehouse_zone_id', event.target.value)}
                            options={zoneOptions.map((zone) => ({ value: zone.id, label: zone.label }))}
                        />
                    </Field>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Kode">
                            <BaseInput value={rackCreateForm.data.code} onChange={(event) => rackCreateForm.setData('code', event.target.value)} />
                        </Field>
                        <Field label="Nama">
                            <BaseInput value={rackCreateForm.data.name} onChange={(event) => rackCreateForm.setData('name', event.target.value)} />
                        </Field>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Tipe Rack">
                            <BaseInput value={rackCreateForm.data.rack_type} onChange={(event) => rackCreateForm.setData('rack_type', event.target.value)} />
                        </Field>
                        <Field label="Kapasitas">
                            <BaseInput type="number" min="1" value={rackCreateForm.data.capacity} onChange={(event) => rackCreateForm.setData('capacity', event.target.value)} />
                        </Field>
                    </div>
                    <Field label="Catatan">
                        <BaseTextArea rows={4} value={rackCreateForm.data.notes} onChange={(event) => rackCreateForm.setData('notes', event.target.value)} />
                    </Field>
                    <button
                        type="submit"
                        disabled={rackCreateForm.processing}
                        className="rounded-[14px] bg-[#28106F] px-5 py-3 text-[12px] font-black uppercase tracking-[0.16em] text-white shadow-[0_10px_20px_rgba(89,50,201,0.18)] disabled:opacity-60"
                    >
                        Simpan Rack
                    </button>
                </form>
            </Modal>

            <Modal
                open={isManager && showRackEditModal}
                title="Edit Rack"
                subtitle="Perbarui detail rack agar sinkron dengan operasional gudang."
                onClose={() => {
                    setShowRackEditModal(false);
                    setEditingRackId(null);
                }}
            >
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (!editingRackId) return;
                        rackEditForm.put(`/warehouse/racks/${editingRackId}?zone=${dashSelectedZoneId ?? selectedZone?.id}&rack=${editingRackId}`, {
                            preserveScroll: true,
                            onSuccess: () => {
                                setShowRackEditModal(false);
                                setEditingRackId(null);
                            },
                        });
                    }}
                    className="space-y-4"
                >
                    <Field label="Zona">
                        <BaseSelect
                            value={rackEditForm.data.warehouse_zone_id}
                            onChange={(event) => rackEditForm.setData('warehouse_zone_id', event.target.value)}
                            options={zoneOptions.map((zone) => ({ value: zone.id, label: zone.label }))}
                        />
                    </Field>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Kode">
                            <BaseInput value={rackEditForm.data.code} onChange={(event) => rackEditForm.setData('code', event.target.value)} />
                            <InputError message={rackEditForm.errors.code} className="mt-2" />
                        </Field>
                        <Field label="Nama">
                            <BaseInput value={rackEditForm.data.name} onChange={(event) => rackEditForm.setData('name', event.target.value)} />
                            <InputError message={rackEditForm.errors.name} className="mt-2" />
                        </Field>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Tipe Rack">
                            <BaseInput value={rackEditForm.data.rack_type} onChange={(event) => rackEditForm.setData('rack_type', event.target.value)} />
                        </Field>
                        <Field label="Kapasitas">
                            <BaseInput type="number" min="1" value={rackEditForm.data.capacity} onChange={(event) => rackEditForm.setData('capacity', event.target.value)} />
                        </Field>
                    </div>
                    <Field label="Status">
                        <BaseSelect
                            value={rackEditForm.data.status}
                            onChange={(event) => rackEditForm.setData('status', event.target.value)}
                            options={[
                                { value: 'active', label: 'Active' },
                                { value: 'maintenance', label: 'Maintenance' },
                                { value: 'inactive', label: 'Inactive' },
                            ]}
                        />
                    </Field>
                    <Field label="Catatan">
                        <BaseTextArea rows={4} value={rackEditForm.data.notes} onChange={(event) => rackEditForm.setData('notes', event.target.value)} />
                    </Field>
                    <button
                        type="submit"
                        disabled={rackEditForm.processing || !editingRackId}
                        className="rounded-[14px] bg-[#28106F] px-5 py-3 text-[12px] font-black uppercase tracking-[0.16em] text-white shadow-[0_10px_20px_rgba(89,50,201,0.18)] disabled:opacity-60"
                    >
                        Simpan Perubahan Rack
                    </button>
                </form>
            </Modal>

            <Modal
                open={canManageRackStock && showRackStockModal}
                title={editingRackStock ? 'Ubah Produk Rack' : 'Tambahkan Produk ke Rack'}
                subtitle={editingRackStock ? 'Ubah detail stok produk pada rack aktif.' : 'Tambah stok produk langsung dari inspector rack.'}
                onClose={() => setShowRackStockModal(false)}
            >
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        const options = {
                            preserveScroll: true,
                            preserveState: true,
                            onSuccess: () => setShowRackStockModal(false),
                        };

                        if (editingRackStock) {
                            rackStockCreateForm.put(`/warehouse/rack-stocks/${editingRackStock.id}?zone=${selectedZone?.id}&rack=${selectedRack?.id}`, options);
                            return;
                        }

                        rackStockCreateForm.post('/warehouse/rack-stocks', options);
                    }}
                    className="space-y-4"
                >
                    <Field label="Produk">
                        <BaseSelect
                            value={rackStockCreateForm.data.product_id}
                            onChange={(event) => rackStockCreateForm.setData('product_id', event.target.value)}
                            options={productOptions.map((product) => ({ value: product.id, label: product.label }))}
                        />
                    </Field>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Kuantitas">
                            <BaseInput type="number" min="0" value={rackStockCreateForm.data.quantity} onChange={(event) => rackStockCreateForm.setData('quantity', event.target.value)} />
                        </Field>
                        <Field label="Reserved">
                            <BaseInput type="number" min="0" value={rackStockCreateForm.data.reserved_quantity} onChange={(event) => rackStockCreateForm.setData('reserved_quantity', event.target.value)} />
                        </Field>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Batch">
                            <BaseInput value={rackStockCreateForm.data.batch_number} onChange={(event) => rackStockCreateForm.setData('batch_number', event.target.value)} />
                        </Field>
                        <Field label="Tanggal Kedaluwarsa">
                            <BaseInput type="date" value={rackStockCreateForm.data.expired_date} onChange={(event) => rackStockCreateForm.setData('expired_date', event.target.value)} />
                        </Field>
                    </div>
                    <div className="rounded-[18px] border border-[#EDE8FC] bg-[#F8F7FF] px-4 py-4 text-[12px] font-semibold text-slate-500">
                        Kuantitas tersedia: <span className="font-black text-[#28106F]">{formatNumber((Number(rackStockCreateForm.data.quantity) || 0) - (Number(rackStockCreateForm.data.reserved_quantity) || 0))}</span>
                    </div>
                    <div className="rounded-[18px] border border-[#EDE8FC] bg-[#F8F7FF] px-4 py-4 text-[12px] font-semibold text-slate-500">
                        Sisa kapasitas rack sebelum produk ini: <span className="font-black text-[#28106F]">{formatNumber(rackCapacityRemaining)}</span>
                    </div>
                    <InputError message={rackStockCreateForm.errors.quantity} className="mt-2" />
                    <button
                        type="submit"
                        disabled={rackStockCreateForm.processing}
                        className="rounded-[14px] bg-[#28106F] px-5 py-3 text-[12px] font-black uppercase tracking-[0.16em] text-white shadow-[0_10px_20px_rgba(89,50,201,0.18)] disabled:opacity-60"
                    >
                        {editingRackStock ? 'Perbarui Produk' : 'Tambahkan Produk'}
                    </button>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
