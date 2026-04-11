import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, router, useForm } from '@inertiajs/react';

const ActivityIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const RackIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16M7 4v16M17 4v16" />
    </svg>
);

const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value ?? 0);

const toneStyles = {
    in: { dot: 'bg-[#4f46e5]', badge: 'bg-[#eef2ff] text-[#4338ca]' },
    out: { dot: 'bg-[#ef4444]', badge: 'bg-[#fef2f2] text-[#ef4444]' },
    transfer: { dot: 'bg-[#0f766e]', badge: 'bg-[#ecfeff] text-[#0f766e]' },
    adjustment: { dot: 'bg-[#f97316]', badge: 'bg-[#fff7ed] text-[#9a3412]' },
    opname: { dot: 'bg-[#64748b]', badge: 'bg-[#f8fafc] text-[#475569]' },
};

function SectionCard({ title, subtitle, children, action }) {
    return (
        <div className="rounded-[24px] border border-[#edf2f7] bg-white p-7 shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-[18px] font-black text-[#1a202c]">{title}</h3>
                    {subtitle ? <p className="mt-1 text-[13px] font-semibold text-gray-500">{subtitle}</p> : null}
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

function Modal({ open, title, subtitle, onClose, children }) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/45 px-4 py-8">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-[22px] font-black text-[#1a202c]">{title}</h3>
                        {subtitle ? <p className="mt-1 text-[13px] font-semibold text-gray-500">{subtitle}</p> : null}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full bg-[#f3f4f6] px-3 py-2 text-[11px] font-black uppercase tracking-[0.15em] text-gray-500"
                    >
                        Close
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

function WorkspaceShell({ eyebrow, title, description, children, aside }) {
    return (
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8">
                <SectionCard
                    title={title}
                    subtitle={description}
                    action={eyebrow ? (
                        <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#4338ca]">
                            {eyebrow}
                        </span>
                    ) : null}
                >
                    {children}
                </SectionCard>
            </div>
            <div className="col-span-12 lg:col-span-4">{aside}</div>
        </div>
    );
}

function SelectField({ label, value, onChange, options, name }) {
    return (
        <div>
            <InputLabel value={label} className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400" />
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full rounded-xl border border-[#dbe4f0] bg-white px-4 py-3 text-[13px] font-semibold text-[#1a202c] shadow-sm focus:border-[#4338ca] focus:outline-none focus:ring-2 focus:ring-[#c7d2fe]"
            >
                {options.map((option) => (
                    <option key={option.value ?? option.id} value={option.value ?? option.id}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function TextAreaField({ label, value, onChange, name, rows = 4 }) {
    return (
        <div>
            <InputLabel value={label} className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400" />
            <textarea
                name={name}
                rows={rows}
                value={value}
                onChange={onChange}
                className="w-full rounded-xl border border-[#dbe4f0] bg-white px-4 py-3 text-[13px] font-semibold text-[#1a202c] shadow-sm focus:border-[#4338ca] focus:outline-none focus:ring-2 focus:ring-[#c7d2fe]"
            />
        </div>
    );
}

function FormActions({ processing, submitLabel }) {
    return (
        <div className="flex items-center gap-3">
            <button
                type="submit"
                disabled={processing}
                className="rounded-xl bg-[#4338ca] px-4 py-3 text-[12px] font-black uppercase tracking-[0.15em] text-white shadow-[0_10px_20px_rgba(67,56,202,0.18)] transition hover:bg-[#3730a3] disabled:opacity-60"
            >
                {submitLabel}
            </button>
        </div>
    );
}

export default function Warehouse({
    warehouse,
    zoneSummaries = [],
    rackSummaries = [],
    activityLog = [],
    selectedZone,
    selectedRack,
    zoneOptions = [],
    productOptions = [],
    status,
}) {
    const [activeWorkspace, setActiveWorkspace] = useState('zone');
    const [showZoneModal, setShowZoneModal] = useState(false);
    const [showRackModal, setShowRackModal] = useState(false);
    const [showRackStockModal, setShowRackStockModal] = useState(false);
    const [editingRackStock, setEditingRackStock] = useState(null);
    const [toastStatus, setToastStatus] = useState(status ?? '');
    const rackCapacityRemaining = selectedRack
        ? Math.max(
            0,
            (selectedRack.capacity ?? 0) -
            (selectedRack.stocks ?? []).reduce((total, stock) => {
                if (editingRackStock && editingRackStock.id === stock.id) {
                    return total;
                }

                return total + (stock.quantity ?? 0);
            }, 0),
        )
        : 0;

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
        setToastStatus(status ?? '');
    }, [status]);

    useEffect(() => {
        if (!toastStatus) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            setToastStatus('');
        }, 3000);

        return () => window.clearTimeout(timeoutId);
    }, [toastStatus]);

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

    const topRacks = rackSummaries.slice(0, 4);

    const workspaceTabs = [
        { id: 'zone', label: 'Zone Workspace' },
        { id: 'rack', label: 'Rack Workspace' },
        { id: 'activity', label: 'Activity Log' },
    ];

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

    const deleteRackStock = (stock) => {
        if (!window.confirm(`Delete ${stock.sku} from this rack?`)) {
            return;
        }

        router.delete(`/warehouse/rack-stocks/${stock.id}?zone=${selectedZone?.id}&rack=${selectedRack?.id}`, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <DashboardLayout>
            <Head title="Warehouse Operational Detail" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-[26px] font-black tracking-tight text-[#1a202c]">Warehouse Operational Detail</h1>
                        <p className="mt-1 text-[14px] font-semibold text-gray-500">
                            Physical assets and zoning status for {warehouse?.name} in {warehouse?.location}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3.5">
                        <button
                            type="button"
                            onClick={() => setShowZoneModal(true)}
                            className="rounded-[10px] border border-[#dbe4f0] bg-white px-5 py-2.5 text-[12px] font-black text-[#1a202c] shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
                        >
                            New Zone
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowRackModal(true)}
                            className="rounded-[10px] border border-[#dbe4f0] bg-white px-5 py-2.5 text-[12px] font-black text-[#1a202c] shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
                        >
                            New Rack
                        </button>
                        <div className="rounded-[10px] border border-[#edf2f7] bg-white px-5 py-2.5 text-[12px] font-bold text-[#1a202c] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                            {warehouse?.total_racks} active racks
                        </div>
                        <div className="flex items-center gap-2 rounded-[10px] bg-[#4338ca] px-5 py-2.5 text-[12px] font-bold text-white shadow-[0_4px_12px_rgba(67,56,202,0.2)]">
                            <ActivityIcon className="h-4 w-4" />
                            <span>{warehouse?.occupancy}% overall occupancy</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    {workspaceTabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveWorkspace(tab.id)}
                            className={`rounded-full px-4 py-2.5 text-[12px] font-black uppercase tracking-[0.16em] transition ${
                                activeWorkspace === tab.id
                                    ? 'bg-[#4338ca] text-white shadow-[0_10px_20px_rgba(67,56,202,0.18)]'
                                    : 'bg-white text-gray-500 border border-[#e5e7eb]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                    {zoneSummaries.map((zone) => (
                        <Link
                            key={zone.id}
                            href={`/warehouse?zone=${zone.id}`}
                            preserveScroll
                            preserveState
                            className={`flex flex-col justify-between rounded-[20px] border p-6 shadow-[0_2px_16px_rgba(0,0,0,0.02)] transition ${selectedZone?.id === zone.id ? 'border-[#4338ca] bg-[#fdfdff]' : 'border-[#edf2f7] bg-white'}`}
                        >
                            <div className="mb-6 flex items-center justify-between gap-3">
                                <span className={`text-[13px] font-black uppercase tracking-wide ${zone.accent.text}`}>{zone.code}</span>
                                <span className={`rounded-lg px-2.5 py-1 text-[9.5px] font-black uppercase tracking-wide ${zone.accent.badge}`}>{zone.type}</span>
                            </div>
                            <div>
                                <div className="mb-2 text-[32px] font-black leading-none text-[#1a202c]">{zone.occupancy}%</div>
                                <div className="mb-4 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                                    {formatNumber(zone.used)} / {formatNumber(zone.capacity)} pallets
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f1f5f9]">
                                    <div className="h-full rounded-full" style={{ width: `${Math.min(zone.occupancy, 100)}%`, backgroundColor: zone.accent.bar }} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {activeWorkspace === 'zone' ? (
                <WorkspaceShell
                    eyebrow="Step 1"
                    title="Zone Workspace"
                    description="Pilih dan edit zone aktif terlebih dahulu. Daftar rack untuk zone ini ada di panel samping."
                    aside={
                        <SectionCard title="Zone Directory" subtitle="Klik zone untuk berpindah konteks kerja.">
                            <div className="space-y-3">
                                {zoneSummaries.map((zone) => (
                                    <Link
                                        key={zone.id}
                                        href={`/warehouse?zone=${zone.id}`}
                                        preserveScroll
                                        preserveState
                                        className={`block rounded-[18px] border px-4 py-4 transition ${selectedZone?.id === zone.id ? 'border-[#4338ca] bg-[#fdfdff]' : 'border-[#edf2f7] bg-[#fbfcfe]'}`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-[13px] font-black text-[#1a202c]">{zone.code}</div>
                                                <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">{zone.name}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[14px] font-black text-[#1a202c]">{zone.occupancy}%</div>
                                                <div className="text-[10px] font-semibold text-gray-400">{zone.rack_count} racks</div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </SectionCard>
                    }
                >
                    <SectionCard
                        title="Selected Zone"
                        subtitle="Edit zone terpilih dan lihat seluruh rack di dalamnya."
                        action={selectedZone ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm(`Delete ${selectedZone.name}?`)) {
                                        router.delete(`/warehouse/zones/${selectedZone.id}`, { preserveScroll: true });
                                    }
                                }}
                                className="rounded-xl bg-[#fff1f2] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[#e11d48]"
                            >
                                Delete Zone
                            </button>
                            ) : null}
                        >
                        {selectedZone ? (
                            <div className="space-y-6">
                                <form onSubmit={(e) => { e.preventDefault(); zoneEditForm.put(`/warehouse/zones/${selectedZone.id}?zone=${selectedZone.id}`, { preserveScroll: true }); }} className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                        <div>
                                            <InputLabel value="Code" className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400" />
                                            <TextInput className="w-full rounded-xl border-[#dbe4f0] px-4 py-3 text-[13px] font-semibold" value={zoneEditForm.data.code} onChange={(e) => zoneEditForm.setData('code', e.target.value)} />
                                        </div>
                                        <div>
                                            <InputLabel value="Name" className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400" />
                                            <TextInput className="w-full rounded-xl border-[#dbe4f0] px-4 py-3 text-[13px] font-semibold" value={zoneEditForm.data.name} onChange={(e) => zoneEditForm.setData('name', e.target.value)} />
                                        </div>
                                        <SelectField label="Type" name="type" value={zoneEditForm.data.type} onChange={(e) => zoneEditForm.setData('type', e.target.value)} options={[
                                            { value: 'storage', label: 'Storage' },
                                            { value: 'high_pick', label: 'High Pick' },
                                            { value: 'bulk_storage', label: 'Bulk Storage' },
                                            { value: 'electronics', label: 'Electronics' },
                                            { value: 'cross_dock', label: 'Cross Dock' },
                                            { value: 'hazmat', label: 'Hazmat' },
                                        ]} />
                                        <div>
                                            <InputLabel value="Capacity" className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400" />
                                            <TextInput type="number" min="1" className="w-full rounded-xl border-[#dbe4f0] px-4 py-3 text-[13px] font-semibold" value={zoneEditForm.data.capacity} onChange={(e) => zoneEditForm.setData('capacity', e.target.value)} />
                                        </div>
                                    </div>
                                    <TextAreaField label="Description" name="description" value={zoneEditForm.data.description} onChange={(e) => zoneEditForm.setData('description', e.target.value)} rows={3} />
                                    <label className="flex items-center gap-3 text-[13px] font-semibold text-gray-600">
                                        <input type="checkbox" checked={Boolean(zoneEditForm.data.is_active)} onChange={(e) => zoneEditForm.setData('is_active', e.target.checked ? 1 : 0)} />
                                        Zone aktif
                                    </label>
                                    <FormActions processing={zoneEditForm.processing} submitLabel="Update Zone" />
                                </form>

                                <div className="border-t border-[#edf2f7] pt-6">
                                    <div className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Racks In This Zone</div>
                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        {selectedZone.racks.map((rack) => (
                                            <Link key={rack.id} href={`/warehouse?zone=${selectedZone.id}&rack=${rack.id}`} preserveScroll preserveState className={`rounded-[18px] border p-5 transition ${selectedRack?.id === rack.id ? 'border-[#4338ca] bg-[#fdfdff]' : 'border-[#edf2f7] bg-[#fbfcfe]'}`}>
                                                <div className="text-[14px] font-black text-[#1a202c]">{rack.name}</div>
                                                <div className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">{rack.code}</div>
                                                <div className="mt-4 flex items-center justify-between text-[12px] font-semibold text-gray-500">
                                                    <span>{formatNumber(rack.items)} items</span>
                                                    <span>{rack.occupancy}% full</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-[13px] font-semibold text-gray-500">No zone selected.</div>
                        )}
                    </SectionCard>
                </WorkspaceShell>
                ) : null}

                {activeWorkspace === 'rack' ? (
                <SectionCard
                    title="Rack Workspace"
                    subtitle="Setelah zone dipilih, kelola rack aktif dan isi stock-nya dalam satu panel lebar penuh."
                    action={<span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#4338ca]">Step 2</span>}
                >
                    <div className="space-y-8">
                        <div className="rounded-[20px] border border-[#edf2f7] bg-[#fbfcfe] p-5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-[15px] font-black text-[#1a202c]">Rack Directory</div>
                                    <div className="mt-1 text-[12px] font-semibold text-gray-500">Klik rack untuk berpindah tanpa kehilangan posisi scroll.</div>
                                </div>
                                {selectedZone ? (
                                    <div className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">
                                        {selectedZone.code} • {selectedZone.racks.length} racks
                                    </div>
                                ) : null}
                            </div>

                            {selectedZone ? (
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    {selectedZone.racks.map((rack) => (
                                        <Link
                                            key={rack.id}
                                            href={`/warehouse?zone=${selectedZone.id}&rack=${rack.id}`}
                                            preserveScroll
                                            preserveState
                                            className={`rounded-[18px] border px-4 py-4 transition ${selectedRack?.id === rack.id ? 'border-[#4338ca] bg-[#fdfdff]' : 'border-[#edf2f7] bg-white'}`}
                                        >
                                            <div className="text-[13px] font-black text-[#1a202c]">{rack.name}</div>
                                            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">{rack.code}</div>
                                            <div className="mt-3 flex items-center justify-between text-[12px] font-semibold text-gray-500">
                                                <span>{formatNumber(rack.skus)} skus</span>
                                                <span>{rack.occupancy}%</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-[13px] font-semibold text-gray-500">Pilih zone dulu.</div>
                            )}
                        </div>

                        <SectionCard
                            title="Selected Rack"
                            subtitle="Kelola metadata rack dan isi produk di dalamnya."
                            action={selectedRack ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (window.confirm(`Delete ${selectedRack.name}?`)) {
                                            router.delete(`/warehouse/racks/${selectedRack.id}?zone=${selectedZone?.id}`, { preserveScroll: true, preserveState: true });
                                        }
                                    }}
                                    className="rounded-xl bg-[#fff1f2] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[#e11d48]"
                                >
                                    Delete Rack
                                </button>
                            ) : null}
                        >
                            {selectedRack ? (
                                <div className="space-y-8">
                                    <form onSubmit={(e) => { e.preventDefault(); rackEditForm.put(`/warehouse/racks/${selectedRack.id}?zone=${selectedZone?.id}&rack=${selectedRack.id}`, { preserveScroll: true, preserveState: true }); }} className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                            <SelectField label="Zone" name="warehouse_zone_id" value={rackEditForm.data.warehouse_zone_id} onChange={(e) => rackEditForm.setData('warehouse_zone_id', e.target.value)} options={zoneOptions} />
                                            <div>
                                                <InputLabel value="Code" className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400" />
                                                <TextInput className="w-full rounded-xl border-[#dbe4f0] px-4 py-3 text-[13px] font-semibold" value={rackEditForm.data.code} onChange={(e) => rackEditForm.setData('code', e.target.value)} />
                                            </div>
                                            <div>
                                                <InputLabel value="Name" className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400" />
                                                <TextInput className="w-full rounded-xl border-[#dbe4f0] px-4 py-3 text-[13px] font-semibold" value={rackEditForm.data.name} onChange={(e) => rackEditForm.setData('name', e.target.value)} />
                                            </div>
                                            <div>
                                                <InputLabel value="Type" className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400" />
                                                <TextInput className="w-full rounded-xl border-[#dbe4f0] px-4 py-3 text-[13px] font-semibold" value={rackEditForm.data.rack_type} onChange={(e) => rackEditForm.setData('rack_type', e.target.value)} />
                                            </div>
                                            <div>
                                                <InputLabel value="Capacity" className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400" />
                                                <TextInput type="number" min="1" className="w-full rounded-xl border-[#dbe4f0] px-4 py-3 text-[13px] font-semibold" value={rackEditForm.data.capacity} onChange={(e) => rackEditForm.setData('capacity', e.target.value)} />
                                            </div>
                                            <SelectField label="Status" name="status" value={rackEditForm.data.status} onChange={(e) => rackEditForm.setData('status', e.target.value)} options={[
                                                { value: 'active', label: 'Active' },
                                                { value: 'maintenance', label: 'Maintenance' },
                                                { value: 'inactive', label: 'Inactive' },
                                            ]} />
                                        </div>
                                        <TextAreaField label="Notes" name="notes" value={rackEditForm.data.notes} onChange={(e) => rackEditForm.setData('notes', e.target.value)} rows={3} />
                                        <FormActions processing={rackEditForm.processing} submitLabel="Update Rack" />
                                    </form>

                                    <div className="rounded-[20px] border border-[#edf2f7] bg-[#fbfcfe] p-5">
                                        <div className="grid gap-4 md:grid-cols-4">
                                            <div><div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Zone</div><div className="mt-1 text-[16px] font-black text-[#1a202c]">{selectedRack.summary.zone_code}</div></div>
                                            <div><div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Items</div><div className="mt-1 text-[16px] font-black text-[#1a202c]">{formatNumber(selectedRack.summary.items)}</div></div>
                                            <div><div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">SKUs</div><div className="mt-1 text-[16px] font-black text-[#1a202c]">{formatNumber(selectedRack.summary.skus)}</div></div>
                                            <div><div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Occupancy</div><div className="mt-1 text-[16px] font-black text-[#ef4444]">{selectedRack.summary.occupancy}%</div></div>
                                        </div>
                                    </div>

                                    <div className="rounded-[20px] border border-[#edf2f7] bg-[#fbfcfe] p-5">
                                        <div className="mb-5 flex items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-[15px] font-black text-[#1a202c]">Rack Product Table</h4>
                                                <p className="mt-1 text-[12px] font-semibold text-gray-500">Isi rack ditampilkan sebagai tabel lebar penuh. Tambah atau edit via modal.</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-full bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-gray-500">
                                                    Remaining {formatNumber(rackCapacityRemaining)}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={openRackStockCreateModal}
                                                    className="rounded-xl bg-[#4338ca] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white"
                                                >
                                                    Add Product
                                                </button>
                                            </div>
                                        </div>

                                        {selectedRack.stocks.length ? (
                                            <div className="overflow-hidden rounded-[18px] border border-[#e5e7eb] bg-white">
                                                <div className="grid grid-cols-[1.8fr_0.8fr_0.8fr_0.8fr_1fr_1fr] gap-4 border-b border-[#e5e7eb] bg-[#f8fafc] px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                                                    <div>Product</div>
                                                    <div>Qty</div>
                                                    <div>Reserved</div>
                                                    <div>Available</div>
                                                    <div>Batch</div>
                                                    <div>Action</div>
                                                </div>
                                                {selectedRack.stocks.map((stock) => (
                                                    <div key={stock.id} className="grid grid-cols-[1.8fr_0.8fr_0.8fr_0.8fr_1fr_1fr] gap-4 border-b border-[#f1f5f9] px-5 py-4 text-[13px] font-semibold text-gray-600 last:border-b-0">
                                                        <div>
                                                            <div className="font-black text-[#1a202c]">{stock.product_name}</div>
                                                            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">{stock.sku}</div>
                                                        </div>
                                                        <div>{formatNumber(stock.quantity)}</div>
                                                        <div>{formatNumber(stock.reserved_quantity)}</div>
                                                        <div>{formatNumber(stock.available_quantity)}</div>
                                                        <div className="truncate">{stock.batch_number || '-'}</div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => openRackStockEditModal(stock)}
                                                                className="rounded-lg bg-[#eef2ff] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#4338ca]"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => deleteRackStock(stock)}
                                                                className="rounded-lg bg-[#fff1f2] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#e11d48]"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-[20px] border border-dashed border-[#dbe4f0] bg-white p-8 text-center text-[13px] font-semibold text-gray-500">
                                                Rack ini belum punya stok. Gunakan tombol `Add Product`.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-[13px] font-semibold text-gray-500">Pilih rack dari daftar zone atau kartu ringkasan di atas.</div>
                            )}
                        </SectionCard>
                    </div>
                </SectionCard>
                ) : null}

                {activeWorkspace === 'activity' ? (
                    <SectionCard title="Crew Activity Log" subtitle="Hanya log aktivitas yang ditampilkan agar fokus monitoring lebih mudah.">
                        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                            <div className="space-y-6">
                                {activityLog.map((activity) => {
                                    const tone = toneStyles[activity.type] ?? toneStyles.in;
                                    return (
                                        <div key={activity.id} className="flex gap-4 rounded-[20px] border border-[#edf2f7] bg-[#fbfcfe] p-5">
                                            <div className="flex flex-col items-center pt-1">
                                                <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                                                <span className="mt-2 h-full w-px bg-[#eef2f7]" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-[13px] font-black text-[#1a202c]">{activity.title}</div>
                                                <div className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">{activity.location} • {activity.time}</div>
                                                <div className="mt-3 text-[12px] font-semibold text-gray-500">Operator: {activity.operator} • {formatNumber(activity.quantity)} units</div>
                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${tone.badge}`}>{activity.type}</span>
                                                    <span className="text-[11px] font-medium text-gray-500">{activity.notes}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="rounded-[20px] border border-[#edf2f7] bg-[#fbfcfe] p-6">
                                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Recent Rack Focus</div>
                                <div className="mt-4 space-y-3">
                                    {topRacks.map((rack) => (
                                        <Link
                                            key={rack.id}
                                            href={`/warehouse?zone=${rack.zone_id}&rack=${rack.id}`}
                                            onClick={() => setActiveWorkspace('rack')}
                                            preserveScroll
                                            preserveState
                                            className="block rounded-[16px] border border-[#edf2f7] bg-white px-4 py-4"
                                        >
                                            <div className="text-[13px] font-black text-[#1a202c]">{rack.name}</div>
                                            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">{rack.zone_code}</div>
                                            <div className="mt-3 flex items-center justify-between text-[12px] font-semibold text-gray-500">
                                                <span>{formatNumber(rack.items)} items</span>
                                                <span>{rack.occupancy}%</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                ) : null}
            </div>

            {toastStatus ? (
                <div className="pointer-events-none fixed right-6 top-24 z-50 max-w-sm rounded-2xl border border-[#c7d2fe] bg-white px-5 py-4 text-[13px] font-bold text-[#1d4ed8] shadow-[0_20px_50px_rgba(67,56,202,0.18)]">
                    {toastStatus}
                </div>
            ) : null}

            <Modal
                open={showZoneModal}
                title="Create Zone"
                subtitle="Tambahkan area baru tanpa memenuhi halaman utama."
                onClose={() => setShowZoneModal(false)}
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        zoneCreateForm.post('/warehouse/zones', {
                            preserveScroll: true,
                            onSuccess: () => setShowZoneModal(false),
                        });
                    }}
                    className="space-y-4"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <InputLabel value="Code" className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400" />
                            <TextInput className="w-full rounded-xl border-[#dbe4f0] px-4 py-3 text-[13px] font-semibold" value={zoneCreateForm.data.code} onChange={(e) => zoneCreateForm.setData('code', e.target.value)} />
                            <InputError message={zoneCreateForm.errors.code} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel value="Name" className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400" />
                            <TextInput className="w-full rounded-xl border-[#dbe4f0] px-4 py-3 text-[13px] font-semibold" value={zoneCreateForm.data.name} onChange={(e) => zoneCreateForm.setData('name', e.target.value)} />
                            <InputError message={zoneCreateForm.errors.name} className="mt-2" />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <SelectField label="Type" name="type" value={zoneCreateForm.data.type} onChange={(e) => zoneCreateForm.setData('type', e.target.value)} options={[
                            { value: 'storage', label: 'Storage' },
                            { value: 'high_pick', label: 'High Pick' },
                            { value: 'bulk_storage', label: 'Bulk Storage' },
                            { value: 'electronics', label: 'Electronics' },
                            { value: 'cross_dock', label: 'Cross Dock' },
                            { value: 'hazmat', label: 'Hazmat' },
                        ]} />
                        <div>
                            <InputLabel value="Capacity" className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400" />
                            <TextInput type="number" min="1" className="w-full rounded-xl border-[#dbe4f0] px-4 py-3 text-[13px] font-semibold" value={zoneCreateForm.data.capacity} onChange={(e) => zoneCreateForm.setData('capacity', e.target.value)} />
                            <InputError message={zoneCreateForm.errors.capacity} className="mt-2" />
                        </div>
                    </div>
                    <TextAreaField label="Description" name="description" value={zoneCreateForm.data.description} onChange={(e) => zoneCreateForm.setData('description', e.target.value)} rows={4} />
                    <FormActions processing={zoneCreateForm.processing} submitLabel="Save Zone" />
                </form>
            </Modal>

            <Modal
                open={showRackModal}
                title="Create Rack"
                subtitle="Tambah rack baru lewat modal supaya workspace tetap bersih."
                onClose={() => setShowRackModal(false)}
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        rackCreateForm.post('/warehouse/racks', {
                            preserveScroll: true,
                            onSuccess: () => setShowRackModal(false),
                        });
                    }}
                    className="space-y-4"
                >
                    <SelectField label="Zone" name="warehouse_zone_id" value={rackCreateForm.data.warehouse_zone_id} onChange={(e) => rackCreateForm.setData('warehouse_zone_id', e.target.value)} options={zoneOptions} />
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <InputLabel value="Code" className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400" />
                            <TextInput className="w-full rounded-xl border-[#dbe4f0] px-4 py-3 text-[13px] font-semibold" value={rackCreateForm.data.code} onChange={(e) => rackCreateForm.setData('code', e.target.value)} />
                        </div>
                        <div>
                            <InputLabel value="Name" className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400" />
                            <TextInput className="w-full rounded-xl border-[#dbe4f0] px-4 py-3 text-[13px] font-semibold" value={rackCreateForm.data.name} onChange={(e) => rackCreateForm.setData('name', e.target.value)} />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <InputLabel value="Rack Type" className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400" />
                            <TextInput className="w-full rounded-xl border-[#dbe4f0] px-4 py-3 text-[13px] font-semibold" value={rackCreateForm.data.rack_type} onChange={(e) => rackCreateForm.setData('rack_type', e.target.value)} />
                        </div>
                        <div>
                            <InputLabel value="Capacity" className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400" />
                            <TextInput type="number" min="1" className="w-full rounded-xl border-[#dbe4f0] px-4 py-3 text-[13px] font-semibold" value={rackCreateForm.data.capacity} onChange={(e) => rackCreateForm.setData('capacity', e.target.value)} />
                        </div>
                    </div>
                    <TextAreaField label="Notes" name="notes" value={rackCreateForm.data.notes} onChange={(e) => rackCreateForm.setData('notes', e.target.value)} rows={4} />
                    <FormActions processing={rackCreateForm.processing} submitLabel="Save Rack" />
                </form>
            </Modal>

            <Modal
                open={showRackStockModal}
                title={editingRackStock ? 'Edit Rack Product' : 'Assign Product To Rack'}
                subtitle={editingRackStock ? 'Ubah detail stok produk di rack ini.' : 'Tambahkan produk baru ke rack aktif lewat modal.'}
                onClose={() => setShowRackStockModal(false)}
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
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
                    <input type="hidden" value={rackStockCreateForm.data.rack_id} />
                    <SelectField label="Product" name="product_id" value={rackStockCreateForm.data.product_id} onChange={(e) => rackStockCreateForm.setData('product_id', e.target.value)} options={productOptions} />
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <InputLabel value="Quantity" className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400" />
                            <TextInput type="number" min="0" className="w-full rounded-xl border-[#dbe4f0] px-4 py-3 text-[13px] font-semibold" value={rackStockCreateForm.data.quantity} onChange={(e) => rackStockCreateForm.setData('quantity', e.target.value)} />
                        </div>
                        <div>
                            <InputLabel value="Reserved" className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400" />
                            <TextInput type="number" min="0" className="w-full rounded-xl border-[#dbe4f0] px-4 py-3 text-[13px] font-semibold" value={rackStockCreateForm.data.reserved_quantity} onChange={(e) => rackStockCreateForm.setData('reserved_quantity', e.target.value)} />
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <InputLabel value="Batch" className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400" />
                            <TextInput className="w-full rounded-xl border-[#dbe4f0] px-4 py-3 text-[13px] font-semibold" value={rackStockCreateForm.data.batch_number} onChange={(e) => rackStockCreateForm.setData('batch_number', e.target.value)} />
                        </div>
                        <div>
                            <InputLabel value="Expired Date" className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400" />
                            <TextInput type="date" className="w-full rounded-xl border-[#dbe4f0] px-4 py-3 text-[13px] font-semibold" value={rackStockCreateForm.data.expired_date} onChange={(e) => rackStockCreateForm.setData('expired_date', e.target.value)} />
                        </div>
                    </div>
                    <div className="rounded-2xl border border-[#edf2f7] bg-[#f8fafc] px-4 py-3 text-[12px] font-semibold text-gray-500">
                        Available quantity: <span className="font-black text-[#1a202c]">{formatNumber((Number(rackStockCreateForm.data.quantity) || 0) - (Number(rackStockCreateForm.data.reserved_quantity) || 0))}</span>
                    </div>
                    <div className="rounded-2xl border border-[#edf2f7] bg-[#f8fafc] px-4 py-3 text-[12px] font-semibold text-gray-500">
                        Rack remaining capacity before this product: <span className="font-black text-[#1a202c]">{formatNumber(rackCapacityRemaining)}</span>
                    </div>
                    <InputError message={rackStockCreateForm.errors.quantity} className="mt-2" />
                    <FormActions processing={rackStockCreateForm.processing} submitLabel={editingRackStock ? 'Update Product' : 'Assign Product'} />
                </form>
            </Modal>
        </DashboardLayout>
    );
}
