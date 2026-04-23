import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import ShipmentMap from '@/Components/ShipmentMap';

export default function ShipmentDetail({ auth, shipment }) {
    const [verificationModal, setVerificationModal] = useState({ open: false, status: 'approved' });
    const [verificationNote, setVerificationNote] = useState('');

    const routeMetrics = shipment.route_metrics || {};
    const alerts = shipment.alerts || {};
    const podVerificationStatus = shipment.pod_verification_status || 'pending';

    const statusColors = {
        'on-time': 'bg-green-100 text-green-700 border-green-200',
        'delayed': 'bg-red-100 text-red-700 border-red-200',
        'in-transit': 'bg-amber-100 text-amber-700 border-amber-200',
        'delivered': 'bg-blue-100 text-blue-700 border-blue-200',
    };
    const verificationBadgeStyles = {
        pending: 'bg-amber-100 text-amber-700 border-amber-200',
        approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    const verificationLabels = {
        pending: 'Menunggu Verifikasi Admin',
        approved: 'Bukti Disetujui',
        rejected: 'Bukti Ditolak',
    };

    const trackingStages = [
        { key: 'claimed_at', label: 'Diklaim Driver' },
        { key: 'picked_up_at', label: 'Diambil Driver' },
        { key: 'in_transit_at', label: 'Dalam Perjalanan' },
        { key: 'arrived_at_destination_at', label: 'Sampai Gudang Tujuan' },
        { key: 'delivered_at', label: 'Terkirim' },
    ];

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

        const timelineHtml = trackingStages.map((stage) => `
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
                        .badge { display:inline-block; padding:6px 12px; border-radius:999px; background:#eef2ff; color:#4338ca; font-size:12px; font-weight:700; }
                        .grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px; }
                        .card { border:1px solid #e5e7eb; border-radius:20px; padding:20px; }
                        .label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.12em; color:#64748b; margin-bottom:8px; }
                        .value { font-size:16px; font-weight:700; color:#111827; }
                        table { width:100%; border-collapse:collapse; }
                        img { max-width:100%; border-radius:16px; margin-top:12px; border:1px solid #e5e7eb; }
                        @media print { body { margin: 20px; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div>
                            <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.16em;color:#6366f1;">Proof of Delivery</div>
                            <h1 style="margin:8px 0 4px;font-size:32px;">Shipment ${printable(shipment.id)}</h1>
                            <div style="color:#6b7280;font-weight:600;">${printable(shipment.origin_name)} (${printable(shipment.origin)}) -> ${printable(shipment.destination_name)} (${printable(shipment.destination)})</div>
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
                : '<div style="font-size:14px;color:#6b7280;font-weight:600;">Foto serah terima belum tersedia.</div>'
            }
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
        <DashboardLayout user={auth.user} contentClassName="w-full max-w-[1760px] mx-auto">
            <Head title={`Pelacakan ${shipment.id}`} />

            <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
                {alerts.is_delayed && (
                    <div className="bg-red-50 border border-red-100 rounded-[24px] p-5 shadow-sm">
                        <div className="text-[11px] font-black text-red-500 uppercase tracking-[0.2em] mb-2">Alert Keterlambatan</div>
                        <div className="text-[22px] font-black text-[#1a202c]">
                            Terlambat {alerts.delay_minutes} menit
                        </div>
                        <div className="text-[13px] font-semibold text-red-700 mt-2">
                            ETA sudah lewat {alerts.eta_label}.
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('shipments.index')}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-2xl font-black text-[#1a202c]">PELACAKAN {shipment.id}</h1>
                                <span className={`px-3 py-1 text-[11px] font-black rounded-full border uppercase tracking-wider ${statusColors[shipment.status]}`}>
                                    {shipment.status.replace('-', ' ')}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-gray-400">Status aktual pengiriman diperbarui secara real-time</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <a
                            href={route('shipments.proof-pdf', shipment.id)}
                            className="px-6 py-2.5 bg-emerald-600 text-white text-[12px] font-black rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center space-x-2 uppercase tracking-wide"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0 0l4-4m-4 4l-4-4M4 17v1a2 2 0 002 2h12a2 2 0 002-2v-1" />
                            </svg>
                            <span>Download PDF</span>
                        </a>
                        <button
                            onClick={handlePrintProof}
                            className="px-6 py-2.5 bg-white text-[#1a202c] text-[12px] font-black rounded-xl hover:bg-gray-50 transition-all shadow-sm border border-gray-200 flex items-center space-x-2 uppercase tracking-wide"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" />
                            </svg>
                            <span>Cetak Bukti</span>
                        </button>
                        <button className="px-6 py-2.5 bg-indigo-600 text-white text-[12px] font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center space-x-2 uppercase tracking-wide">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            <span>Share Link</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 xl:gap-8">
                    <div className="order-first xl:order-none xl:col-span-3 space-y-6 xl:space-y-8">
                        <div className="h-[420px] sm:h-[560px] md:h-[720px] xl:h-[880px] max-h-[86vh] bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden relative self-start">
                            <ShipmentMap shipments={[shipment]} />

                            <div className="absolute top-8 left-8 z-[1000] flex flex-col space-y-3">
                                <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-xl border border-white/20 flex items-center space-x-4">
                                    <div className="relative">
                                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-500 animate-ping opacity-75"></div>
                                    </div>
                                    <div>
                                        <div className="text-[12px] font-black text-gray-800 uppercase tracking-widest leading-none">Live Tracking Active</div>
                                        <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">
                                            {shipment.last_location_at ? `GPS ${shipment.last_location_at}` : 'Menunggu sinkronisasi GPS'}
                                        </div>
                                    </div>
                                </div>

                                {shipment.status === 'in-transit' && (
                                    <div className="bg-[#1a202c]/95 backdrop-blur rounded-2xl p-4 shadow-xl border border-white/10 animate-in slide-in-from-left duration-500">
                                        <div className="flex items-center space-x-4 text-white">
                                            <div className="p-2 bg-indigo-500 rounded-lg">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Progress Rute</div>
                                                <div className="text-[16px] font-black italic tracking-wide">
                                                    {routeMetrics.progress_percent ?? 0}
                                                    <span className="text-[10px] uppercase font-bold not-italic text-indigo-400 ml-1">Persen</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="absolute bottom-8 right-8 z-[1000] bg-white/95 backdrop-blur p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col space-y-2">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Titik Asal</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Tujuan Akhir</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Lokasi Driver</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Rute Aktual</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8">
                            {alerts.is_off_route && (
                                <div className="xl:col-span-2 bg-amber-50 border border-amber-100 rounded-[28px] px-6 py-5 shadow-sm">
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <div className="text-[11px] font-black text-amber-600 uppercase tracking-[0.2em] mb-1">Warning Keluar Jalur</div>
                                            <div className="text-[22px] font-black text-[#1a202c]">
                                                Deviasi {alerts.off_route_km} km
                                            </div>
                                        </div>
                                        <div className="text-[13px] font-semibold text-amber-700 md:text-right">
                                            Melebihi batas aman {alerts.off_route_threshold_km} km dari rute utama.
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Driver Bertugas</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-[22px] font-black text-indigo-600">
                                        {shipment.driver_name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-[16px] font-black text-[#1a202c]">{shipment.driver_name}</div>
                                        <div className="text-[12px] font-bold text-indigo-500 uppercase tracking-wide">ID Verified Driver</div>
                                    </div>
                                </div>
                                <button className="w-full py-4 bg-indigo-50 text-indigo-600 text-[12px] font-black rounded-2xl hover:bg-indigo-100 transition-all flex items-center justify-center space-x-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    <span>KONTAK DRIVER</span>
                                </button>
                                <div className="pt-2 border-t border-gray-100 space-y-2">
                                    <div className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Lokasi Terakhir</div>
                                    <div className="text-[13px] font-semibold text-gray-700">
                                        {shipment.driver_lat && shipment.driver_lng ? `${shipment.driver_lat}, ${shipment.driver_lng}` : 'Lokasi driver belum tersedia'}
                                    </div>
                                    <div className="text-[12px] font-semibold text-gray-400">
                                        {shipment.last_location_at ? `Update ${shipment.last_location_at}` : 'Belum ada update GPS'}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-5">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Proof Of Delivery</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Penerima</div>
                                        <div className="text-[16px] font-black text-[#1a202c] mt-1">
                                            {shipment.delivery_recipient_name || 'Belum ada konfirmasi penerima'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Catatan Driver</div>
                                        <div className="text-[13px] font-semibold text-gray-600 mt-1 leading-relaxed">
                                            {shipment.delivery_note || 'Belum ada catatan serah terima.'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Foto Serah Terima</div>
                                        {shipment.delivery_photo_url ? (
                                            <a href={shipment.delivery_photo_url} target="_blank" rel="noreferrer">
                                                <img
                                                    src={shipment.delivery_photo_url}
                                                    alt={`Proof of delivery ${shipment.id}`}
                                                    className="w-full h-48 object-cover rounded-2xl border border-gray-100 shadow-sm"
                                                />
                                            </a>
                                        ) : (
                                            <div className="h-32 rounded-2xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-[12px] font-semibold text-gray-400">
                                                Foto serah terima belum diunggah.
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Waktu Terkirim</div>
                                        <div className="text-[13px] font-semibold text-gray-700 mt-1">
                                            {shipment.delivered_at || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Status Verifikasi POD</div>
                                        <div className="mt-2">
                                            <span className={`inline-flex px-3 py-1 text-[11px] font-black rounded-full border ${verificationBadgeStyles[podVerificationStatus] || verificationBadgeStyles.pending}`}>
                                                {verificationLabels[podVerificationStatus] || verificationLabels.pending}
                                            </span>
                                        </div>
                                        {shipment.pod_verified_at && (
                                            <div className="text-[12px] font-semibold text-gray-500 mt-2">
                                                Diverifikasi: {shipment.pod_verified_at}
                                            </div>
                                        )}
                                        {shipment.pod_verification_note && (
                                            <div className="text-[12px] font-semibold text-gray-600 mt-2 leading-relaxed">
                                                Catatan Admin: {shipment.pod_verification_note}
                                            </div>
                                        )}
                                    </div>
                                    {shipment.tracking_stage === 'delivered' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => openVerificationModal('approved')}
                                                className="w-full py-3 bg-emerald-600 text-white text-[12px] font-black rounded-2xl hover:bg-emerald-700 transition-all"
                                            >
                                                APPROVE BUKTI
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => openVerificationModal('rejected')}
                                                className="w-full py-3 bg-red-600 text-white text-[12px] font-black rounded-2xl hover:bg-red-700 transition-all"
                                            >
                                                TOLAK BUKTI
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-1 space-y-6">
                        {/* Route Timeline */}
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <svg className="w-24 h-24 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" /></svg>
                            </div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Manifest Rangkuman</h3>
                            <div className="relative space-y-10 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-indigo-50">
                                <div className="relative pl-12">
                                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center z-10 shadow-sm shadow-indigo-100">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    </div>
                                    <div className="text-[11px] font-black text-indigo-500 uppercase tracking-wider">ASAL PENGIRIMAN</div>
                                    <div className="text-[18px] font-black text-gray-800 mt-1">{shipment.origin_name}</div>
                                    <div className="text-[12px] font-bold text-gray-400 leading-relaxed mt-1">{shipment.origin}</div>
                                </div>
                                <div className="relative pl-12">
                                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center z-10 shadow-sm shadow-blue-100">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <div className="text-[11px] font-black text-blue-500 uppercase tracking-wider">TUJUAN AKHIR</div>
                                    <div className="text-[18px] font-black text-gray-800 mt-1">{shipment.destination_name}</div>
                                    <div className="text-[12px] font-bold text-gray-400 leading-relaxed mt-1">{shipment.destination}</div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-4">Progress Driver</div>
                                <div className="space-y-3">
                                    <div className="inline-flex px-3 py-1 text-[11px] font-black rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        {shipment.tracking_stage_label}
                                    </div>
                                    {shipment.last_tracking_note && (
                                        <p className="text-[13px] font-semibold text-gray-500">{shipment.last_tracking_note}</p>
                                    )}
                                    <div className="space-y-2">
                                        {trackingStages.map((stage) => (
                                            <div key={stage.key} className="flex items-center justify-between text-[12px]">
                                                <span className="font-bold text-gray-500">{stage.label}</span>
                                                <span className="font-semibold text-gray-700">{shipment[stage.key] || '-'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cargo & Stats */}
                        <div className="bg-indigo-600 rounded-[32px] p-8 text-white space-y-6 shadow-xl shadow-indigo-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-[11px] font-black text-indigo-200 uppercase tracking-wider">JENIS KARGO</div>
                                    <div className="text-[24px] font-black mt-1 uppercase">{shipment.load_type}</div>
                                </div>
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                                    {shipment.load_type === 'air' ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                    ) : shipment.load_type === 'sea' ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5" /></svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                                    )}
                                </div>
                            </div>
                            <div className="pt-6 border-t border-white/10">
                                <div className="text-[11px] font-black text-indigo-200 uppercase tracking-wider">ESTIMASI KEDATANGAN</div>
                                <div className="text-[18px] font-black mt-1">{shipment.estimated_arrival}</div>
                                <div className="text-[12px] font-bold text-indigo-200/80 mt-2">
                                    {alerts.eta_label ? `Status ETA: ${alerts.eta_label}` : 'ETA belum tersedia'}
                                </div>
                            </div>
                            <div className="pt-6 border-t border-white/10 space-y-3">
                                <div>
                                    <div className="text-[11px] font-black text-indigo-200 uppercase tracking-wider">PROGRESS PERJALANAN</div>
                                    <div className="text-[28px] font-black mt-1">{routeMetrics.progress_percent ?? 0}%</div>
                                </div>
                                <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-white transition-all duration-700"
                                        style={{ width: `${routeMetrics.progress_percent ?? 0}%` }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-[12px]">
                                    <div>
                                        <div className="font-black text-indigo-200 uppercase tracking-wider">Jarak Total</div>
                                        <div className="font-black mt-1">{routeMetrics.total_km ? `${routeMetrics.total_km} km` : '-'}</div>
                                    </div>
                                    <div>
                                        <div className="font-black text-indigo-200 uppercase tracking-wider">Sisa Perjalanan</div>
                                        <div className="font-black mt-1">{routeMetrics.remaining_km !== null ? `${routeMetrics.remaining_km} km` : '-'}</div>
                                    </div>
                                    <div>
                                        <div className="font-black text-indigo-200 uppercase tracking-wider">Deviasi Jalur</div>
                                        <div className="font-black mt-1">{alerts.off_route_km !== null ? `${alerts.off_route_km} km` : '-'}</div>
                                    </div>
                                    <div>
                                        <div className="font-black text-indigo-200 uppercase tracking-wider">Batas Aman</div>
                                        <div className="font-black mt-1">{alerts.off_route_threshold_km !== null ? `${alerts.off_route_threshold_km} km` : '-'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {verificationModal.open && (
                <div className="fixed inset-0 z-[10020] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-[28px] border border-gray-200 bg-white p-6 shadow-2xl">
                        <div className={`text-[11px] font-black uppercase tracking-[0.2em] ${verificationModal.status === 'approved' ? 'text-emerald-600' : 'text-red-600'}`}>
                            Verifikasi Bukti POD
                        </div>
                        <h3 className="mt-2 text-[20px] font-black text-[#1a202c]">
                            {verificationModal.status === 'approved' ? 'Setujui bukti pengiriman ini?' : 'Tolak bukti pengiriman ini?'}
                        </h3>
                        <p className="mt-3 text-[13px] font-semibold leading-6 text-gray-500">
                            Shipment #{shipment.id} akan diperbarui sesuai keputusan admin.
                        </p>

                        <div className="mt-5">
                            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                                Catatan Verifikasi (Opsional)
                            </label>
                            <textarea
                                value={verificationNote}
                                onChange={(e) => setVerificationNote(e.target.value)}
                                rows={4}
                                placeholder="Contoh: Foto sudah jelas dan data penerima sesuai."
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-[13px] font-semibold text-gray-700 focus:border-indigo-400 focus:outline-none"
                            />
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setVerificationModal({ open: false, status: 'approved' })}
                                className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[12px] font-black text-gray-600 hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleVerificationSubmit}
                                className={`px-4 py-2.5 rounded-xl text-[12px] font-black text-white ${verificationModal.status === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                            >
                                {verificationModal.status === 'approved' ? 'Ya, Approve Bukti' : 'Ya, Tolak Bukti'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes pulse-ring {
                    0% { transform: scale(.33); }
                    80%, 100% { opacity: 0; }
                }
            `}</style>
        </DashboardLayout>
    );
}
