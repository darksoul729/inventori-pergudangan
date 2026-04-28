import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import ShipmentMap from '@/Components/ShipmentMap';

const statusStyles = {
    'on-time': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    delayed: 'bg-rose-50 text-rose-700 border-rose-200',
    'in-transit': 'bg-amber-50 text-amber-700 border-amber-200',
    delivered: 'bg-sky-50 text-sky-700 border-sky-200',
    pending: 'bg-slate-100 text-slate-600 border-slate-200',
};

const stageFlow = [
    { key: 'claimed_at', label: 'Diklaim Driver' },
    { key: 'picked_up_at', label: 'Diambil Driver' },
    { key: 'in_transit_at', label: 'Dalam Perjalanan' },
    { key: 'arrived_at_destination_at', label: 'Sampai Gudang Tujuan' },
    { key: 'delivered_at', label: 'Terkirim' },
];

const verificationBadgeStyles = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-100 text-rose-700 border-rose-200',
};

const verificationLabels = {
    pending: 'Menunggu Verifikasi Admin',
    approved: 'Bukti Disetujui',
    rejected: 'Bukti Ditolak',
};

function MetricCard({ label, value, helper }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-4 shadow-sm backdrop-blur">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
            <p className="mt-1 text-[20px] font-black tracking-tight text-slate-900">{value}</p>
            {helper && <p className="mt-1 text-[11px] font-semibold text-slate-500">{helper}</p>}
        </div>
    );
}

function TimelineRow({ label, value, isDone, isLast }) {
    return (
        <div className="relative pl-10">
            <span className={`absolute left-0 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border ${isDone ? 'border-[#2946d8] bg-[#2946d8] text-white' : 'border-slate-300 bg-white text-slate-300'}`}>
                {isDone ? (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <span className="h-2 w-2 rounded-full bg-current" />
                )}
            </span>
            {!isLast && <span className={`absolute left-[11px] top-8 h-[44px] w-[2px] ${isDone ? 'bg-[#b9c4ff]' : 'bg-slate-200'}`} />}
            <p className="text-[12px] font-black uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-1 text-[13px] font-semibold ${value ? 'text-slate-800' : 'text-slate-400'}`}>{value || 'Belum tercatat'}</p>
        </div>
    );
}

export default function ShipmentDetail({ auth, shipment }) {
    const [verificationModal, setVerificationModal] = useState({ open: false, status: 'approved' });
    const [verificationNote, setVerificationNote] = useState('');

    const routeMetrics = shipment.route_metrics || {};
    const alerts = shipment.alerts || {};
    const delayMinutes = Math.max(0, Math.round(Number(alerts.delay_minutes || 0)));
    const podVerificationStatus = shipment.pod_verification_status || 'pending';

    const completionCount = useMemo(
        () => stageFlow.reduce((total, stage) => total + (shipment[stage.key] ? 1 : 0), 0),
        [shipment],
    );

    const openVerificationModal = (verificationStatus) => {
        setVerificationNote(shipment.pod_verification_note || '');
        setVerificationModal({ open: true, status: verificationStatus });
    };

    const handleVerificationSubmit = () => {
        router.put(route('shipments.verify-proof', shipment.id), {
            verification_status: verificationModal.status,
            verification_note: verificationNote,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setVerificationModal({ open: false, status: 'approved' });
                setVerificationNote('');
            },
        });
    };

    const handlePrintProof = () => {
        const printWindow = window.open('', '_blank', 'width=980,height=720');
        if (!printWindow) return;

        const escapeHtml = (value) => String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        const printable = (value, fallback = '-') => escapeHtml(value || fallback);
        const deliveryPhotoUrl = shipment.delivery_photo_url && String(shipment.delivery_photo_url).startsWith('/storage/')
            ? shipment.delivery_photo_url
            : null;

        const timelineHtml = stageFlow.map((stage) => `
            <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-weight:700;color:#475569;">${escapeHtml(stage.label)}</td>
                <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;color:#111827;">${printable(shipment[stage.key])}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Proof of Delivery ${printable(shipment.id)}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 32px; color: #111827; }
                        .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; }
                        .header-logo { width:48px; height:48px; object-fit:contain; margin-right:14px; flex-shrink:0; }
                        .badge { display:inline-block; padding:6px 12px; border-radius:999px; background:#eef2ff; color:#28106F; font-size:12px; font-weight:700; }
                        .grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px; }
                        .card { border:1px solid #e5e7eb; border-radius:20px; padding:20px; }
                        .label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.12em; color:#64748b; margin-bottom:8px; }
                        .value { font-size:16px; font-weight:700; color:#111827; }
                        table { width:100%; border-collapse:collapse; }
                        img { max-width:100%; border-radius:16px; margin-top:12px; border:1px solid #e5e7eb; }
                        .header-logo { max-width:none; border-radius:0; margin-top:0; border:none; }
                        @media print { body { margin: 20px; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div style="display:flex;align-items:flex-start;">
                            <img src="/images/logo 1.png" class="header-logo" alt="Logo" />
                            <div>
                                <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.16em;color:#5932C9;">Proof of Delivery</div>
                                <h1 style="margin:8px 0 4px;font-size:32px;">Shipment ${printable(shipment.id)}</h1>
                                <div style="color:#6b7280;font-weight:600;">${printable(shipment.origin_name)} (${printable(shipment.origin)}) -> ${printable(shipment.destination_name)} (${printable(shipment.destination)})</div>
                            </div>
                        </div>
                        <div class="badge">${printable(shipment.tracking_stage_label || shipment.status)}</div>
                    </div>

                    <div class="grid">
                        <div class="card">
                            <div class="label">Penerima</div>
                            <div class="value">${printable(shipment.delivery_recipient_name)}</div>
                        </div>
                        <div class="card">
                            <div class="label">Waktu Terkirim</div>
                            <div class="value">${printable(shipment.delivered_at)}</div>
                        </div>
                        <div class="card">
                            <div class="label">Driver</div>
                            <div class="value">${printable(shipment.driver_name)}</div>
                        </div>
                        <div class="card">
                            <div class="label">ETA</div>
                            <div class="value">${printable(shipment.estimated_arrival)}</div>
                        </div>
                    </div>

                    <div class="card" style="margin-bottom:24px;">
                        <div class="label">Catatan Serah Terima</div>
                        <div style="font-size:15px;line-height:1.7;color:#374151;">${printable(shipment.delivery_note, 'Tidak ada catatan serah terima.')}</div>
                    </div>

                    <div class="card" style="margin-bottom:24px;">
                        <div class="label">Timeline Pengiriman</div>
                        <table>${timelineHtml}</table>
                    </div>

                    <div class="card">
                        <div class="label">Foto Serah Terima</div>
                        ${deliveryPhotoUrl
                ? `<img src="${escapeHtml(deliveryPhotoUrl)}" alt="Proof of delivery ${printable(shipment.id)}" />`
                : '<div style="font-size:14px;color:#6b7280;font-weight:600;">Foto serah terima belum tersedia.</div>'}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 400);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['shipment', 'notifications'],
                preserveState: true,
                preserveScroll: true,
            });
        }, 12000);

        return () => clearInterval(interval);
    }, []);

    return (
        <DashboardLayout user={auth.user} contentClassName="mx-auto w-full max-w-[1760px]">
            <Head title={`Pelacakan ${shipment.id}`} />

            <div className="space-y-6 p-5 md:space-y-8 md:p-8">
                <section className="relative overflow-hidden rounded-[30px] border border-[#d7defc] bg-gradient-to-br from-[#f5f8ff] via-white to-[#eef2ff] p-5 shadow-sm md:p-7">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#5b6cff]/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-[#47b3ff]/10 blur-3xl" />

                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                                <Link href={route('shipments.index')} className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600">
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>
                                Detail Pelacakan
                            </div>

                            <h1 className="mt-4 text-[28px] font-black leading-tight tracking-tight text-slate-900 md:text-[34px]">
                                Shipment {shipment.id}
                            </h1>
                            <p className="mt-1 text-[13px] font-semibold text-slate-500">
                                {shipment.origin_name} ({shipment.origin}) &rarr; {shipment.destination_name} ({shipment.destination})
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.13em] ${statusStyles[shipment.status] || statusStyles.pending}`}>
                                    {shipment.tracking_stage_label || shipment.status}
                                </span>
                                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-black text-slate-600">
                                    Progress Step {completionCount}/{stageFlow.length}
                                </span>
                                <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-black ${verificationBadgeStyles[podVerificationStatus] || verificationBadgeStyles.pending}`}>
                                    {verificationLabels[podVerificationStatus] || verificationLabels.pending}
                                </span>
                            </div>
                        </div>

                        <div className="grid w-full max-w-[560px] grid-cols-1 gap-3 sm:grid-cols-3">
                            <MetricCard
                                label="ETA"
                                value={shipment.estimated_arrival || '-'}
                                helper={alerts.eta_label ? `Status ETA: ${alerts.eta_label}` : 'Belum ada label ETA'}
                            />
                            <MetricCard
                                label="Progress Rute"
                                value={`${routeMetrics.progress_percent ?? 0}%`}
                                helper={routeMetrics.remaining_km != null ? `${routeMetrics.remaining_km} km tersisa` : 'Sisa jarak belum tersedia'}
                            />
                            <MetricCard
                                label="Lokasi GPS"
                                value={shipment.last_location_at || '-'}
                                helper={shipment.driver_lat && shipment.driver_lng ? `${shipment.driver_lat}, ${shipment.driver_lng}` : 'Lokasi belum sinkron'}
                            />
                        </div>
                    </div>

                    <div className="relative mt-5 flex flex-wrap items-center gap-3">
                        <a
                            href={route('shipments.proof-pdf', shipment.id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#2f44d1] px-4 py-2.5 text-[12px] font-black uppercase tracking-[0.11em] text-white shadow-lg shadow-indigo-100 hover:bg-[#2337bf]"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0 0l4-4m-4 4l-4-4M4 17v1a2 2 0 002 2h12a2 2 0 002-2v-1" />
                            </svg>
                            Unduh PDF
                        </a>
                        <button
                            type="button"
                            onClick={handlePrintProof}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-black uppercase tracking-[0.11em] text-slate-700 hover:bg-slate-50"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" />
                            </svg>
                            Cetak Bukti
                        </button>
                    </div>
                </section>

                {alerts.is_delayed && (
                    <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-600">Alert Keterlambatan</p>
                        <p className="mt-2 text-[20px] font-black text-slate-900">Terlambat {delayMinutes.toLocaleString('id-ID')} menit</p>
                        <p className="mt-1 text-[12px] font-semibold text-rose-700">ETA sudah lewat {alerts.eta_label}.</p>
                    </section>
                )}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                    <main className="space-y-6 xl:col-span-8">
                        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Peta Tracking</p>
                                    <h2 className="mt-1 text-[18px] font-black tracking-tight text-slate-900">Rute Langsung & Posisi Driver</h2>
                                </div>
                                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                    Langsung
                                </span>
                            </div>
                            <div className="relative h-[360px] sm:h-[460px] md:h-[560px]">
                                <ShipmentMap shipments={[shipment]} />
                            </div>
                            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 px-5 py-4 text-[11px] font-semibold text-slate-600 sm:grid-cols-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Jarak Total</p>
                                    <p className="mt-1">{routeMetrics.total_km ? `${routeMetrics.total_km} km` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Sisa Jarak</p>
                                    <p className="mt-1">{routeMetrics.remaining_km != null ? `${routeMetrics.remaining_km} km` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Deviasi</p>
                                    <p className="mt-1">{alerts.off_route_km != null ? `${alerts.off_route_km} km` : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Batas Aman</p>
                                    <p className="mt-1">{alerts.off_route_threshold_km != null ? `${alerts.off_route_threshold_km} km` : '-'}</p>
                                </div>
                            </div>
                        </section>

                        {alerts.is_off_route && (
                            <section className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-600">Warning Keluar Jalur</p>
                                <p className="mt-2 text-[20px] font-black text-slate-900">Deviasi {alerts.off_route_km} km</p>
                                <p className="mt-1 text-[12px] font-semibold text-amber-700">Melebihi batas aman {alerts.off_route_threshold_km} km dari rute utama.</p>
                            </section>
                        )}

                        {shipment.items && shipment.items.length > 0 && (
                            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Daftar Muatan</p>
                                        <h3 className="mt-1 text-[18px] font-black tracking-tight text-slate-900">Barang Dikirim</h3>
                                    </div>
                                    {shipment.items_summary && (
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                            <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1">{shipment.items_summary.total_items} produk</span>
                                            {shipment.items_summary.total_weight_kg && (
                                                <span className="rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-indigo-700">
                                                    {shipment.items_summary.total_weight_kg.toLocaleString()} kg
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {shipment.items.map((item, i) => (
                                        <div key={item.id || i} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-[14px] font-black text-slate-900">{item.product_name}</p>
                                                <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                                                    {item.sku && <span>SKU: {item.sku}</span>}
                                                    {item.notes && <span>Catatan: {item.notes}</span>}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[15px] font-black text-slate-900">{Number(item.quantity).toLocaleString()} <span className="text-[11px] font-bold text-slate-500">{item.unit || 'pcs'}</span></p>
                                                {item.weight_kg && <p className="text-[11px] font-semibold text-slate-500">{Number(item.weight_kg).toLocaleString()} kg</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </main>

                    <aside className="space-y-6 xl:col-span-4">
                        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Timeline Tracking</p>
                            <h3 className="mt-1 text-[18px] font-black tracking-tight text-slate-900">Progress Pengiriman</h3>
                            {shipment.last_tracking_note && (
                                <p className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-[12px] font-semibold text-indigo-700">
                                    {shipment.last_tracking_note}
                                </p>
                            )}

                            <div className="mt-5 space-y-7">
                                {stageFlow.map((stage, index) => (
                                    <TimelineRow
                                        key={stage.key}
                                        label={stage.label}
                                        value={shipment[stage.key]}
                                        isDone={Boolean(shipment[stage.key])}
                                        isLast={index === stageFlow.length - 1}
                                    />
                                ))}
                            </div>
                        </section>

                        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Driver Bertugas</p>
                            <div className="mt-4 flex items-center gap-3">
                                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[18px] font-black text-indigo-700">
                                    {(shipment.driver_name || 'D').charAt(0)}
                                </span>
                                <div>
                                    <p className="text-[16px] font-black text-slate-900">{shipment.driver_name || 'Driver belum ditentukan'}</p>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">ID Verified Driver</p>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-[12px] font-semibold text-slate-600">
                                <p>{shipment.driver_lat && shipment.driver_lng ? `${shipment.driver_lat}, ${shipment.driver_lng}` : 'Lokasi driver belum tersedia'}</p>
                                <p className="text-[11px] text-slate-500">{shipment.last_location_at ? `Update GPS: ${shipment.last_location_at}` : 'Belum ada update GPS'}</p>
                            </div>
                        </section>

                        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Proof of Delivery</p>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">Penerima</p>
                                    <p className="mt-1 text-[14px] font-black text-slate-900">{shipment.delivery_recipient_name || 'Belum ada konfirmasi penerima'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">Catatan Driver</p>
                                    <p className="mt-1 text-[12px] font-semibold leading-relaxed text-slate-600">{shipment.delivery_note || 'Belum ada catatan serah terima.'}</p>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">Foto Serah Terima</p>
                                    <div className="mt-2">
                                        {shipment.delivery_photo_url ? (
                                            <a href={shipment.delivery_photo_url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-2xl border border-slate-200">
                                                <img
                                                    src={shipment.delivery_photo_url}
                                                    alt={`Proof of delivery ${shipment.id}`}
                                                    className="h-44 w-full object-cover"
                                                />
                                            </a>
                                        ) : (
                                            <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-[12px] font-semibold text-slate-400">
                                                Foto serah terima belum diunggah
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">Waktu Terkirim</p>
                                    <p className="mt-1 text-[12px] font-semibold text-slate-700">{shipment.delivered_at || '-'}</p>
                                </div>

                                {shipment.pod_verified_at && (
                                    <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-600">
                                        Diverifikasi: {shipment.pod_verified_at}
                                    </p>
                                )}

                                {shipment.pod_verification_note && (
                                    <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold leading-relaxed text-slate-600">
                                        Catatan Admin: {shipment.pod_verification_note}
                                    </p>
                                )}

                                {shipment.tracking_stage === 'delivered' && (
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={() => openVerificationModal('approved')}
                                            className="rounded-xl bg-emerald-600 py-2.5 text-[11px] font-black uppercase tracking-[0.11em] text-white hover:bg-emerald-700"
                                        >
                                            Approve Bukti
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openVerificationModal('rejected')}
                                            className="rounded-xl bg-rose-600 py-2.5 text-[11px] font-black uppercase tracking-[0.11em] text-white hover:bg-rose-700"
                                        >
                                            Tolak Bukti
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </aside>
                </div>
            </div>

            {verificationModal.open && (
                <div className="fixed inset-0 z-[10020] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-[24px] border border-slate-200 bg-white p-6 shadow-2xl">
                        <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${verificationModal.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            Verifikasi Bukti POD
                        </p>
                        <h3 className="mt-2 text-[20px] font-black text-slate-900">
                            {verificationModal.status === 'approved' ? 'Setujui bukti pengiriman ini?' : 'Tolak bukti pengiriman ini?'}
                        </h3>
                        <p className="mt-2 text-[13px] font-semibold text-slate-500">
                            Shipment #{shipment.id} akan diperbarui sesuai keputusan admin.
                        </p>

                        <div className="mt-4">
                            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                Catatan Verifikasi (Opsional)
                            </label>
                            <textarea
                                value={verificationNote}
                                onChange={(e) => setVerificationNote(e.target.value)}
                                rows={4}
                                placeholder="Contoh: Foto sudah jelas dan data penerima sesuai."
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[13px] font-semibold text-slate-700 focus:border-indigo-400 focus:outline-none"
                            />
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setVerificationModal({ open: false, status: 'approved' })}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-black text-slate-600 hover:bg-slate-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleVerificationSubmit}
                                className={`rounded-xl px-4 py-2.5 text-[12px] font-black text-white ${verificationModal.status === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                            >
                                {verificationModal.status === 'approved' ? 'Ya, Approve Bukti' : 'Ya, Tolak Bukti'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
