import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';

const BackIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const RouteIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
);

const ShieldIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const statusConfig = {
    approved: {
        label: 'Terverifikasi',
        tone: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    },
    pending: {
        label: 'Menunggu',
        tone: 'border-amber-100 bg-amber-50 text-amber-700',
    },
    suspended: {
        label: 'Ditangguhkan',
        tone: 'border-red-100 bg-red-50 text-red-700',
    },
};

const stageLabels = {
    ready_for_pickup: 'Siap Diambil',
    picked_up: 'Sudah Diambil',
    in_transit: 'Dalam Perjalanan',
    arrived_at_destination: 'Sampai Tujuan',
    delivered: 'Terkirim',
};

const initials = (name = '') => name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'DR';

const formatCoordinate = (value) => {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    return Number(value).toFixed(6);
};

const DetailRow = ({ label, value }) => (
    <div className="grid grid-cols-1 gap-1 border-b border-[#EDE8FC] py-3 last:border-b-0 sm:grid-cols-[170px_1fr]">
        <dt className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">{label}</dt>
        <dd className="text-[14px] font-bold text-[#28106F]">{value || '-'}</dd>
    </div>
);

const StatCard = ({ label, value }) => (
    <div className="rounded-[8px] border border-[#EDE8FC] bg-white px-5 py-4 shadow-sm">
        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">{label}</div>
        <div className="mt-1 text-[22px] font-black text-[#28106F]">{value}</div>
    </div>
);

export default function DriverDetail({ driver }) {
    const { put, processing } = useForm();
    const currentStatus = statusConfig[driver.status] || statusConfig.pending;
    const activeShipment = driver.active_shipment;

    const updateStatus = (status) => {
        const label = statusConfig[status]?.label || status;

        if (confirm(`Ubah status driver menjadi ${label}?`)) {
            put(route('drivers.status.update', driver.id), {
                data: { status },
                preserveScroll: true,
            });
        }
    };

    return (
        <DashboardLayout contentClassName="w-full max-w-none">
            <Head title={`Detail Driver ${driver.name || ''}`} />

            <div className="pb-12 pt-2">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('drivers.index')}
                            aria-label="Kembali ke daftar driver"
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#dbe4f0] bg-white text-slate-500 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition hover:border-[#28106F] hover:text-[#28106F]"
                        >
                            <BackIcon className="h-5 w-5" />
                        </Link>
                        <div>
                            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">Detail Driver</p>
                            <h1 className="text-2xl font-black tracking-tight text-[#28106F]">{driver.name || 'Driver'}</h1>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex rounded-xl border px-4 py-2 text-[12px] font-black uppercase tracking-[0.14em] ${currentStatus.tone}`}>
                            {currentStatus.label}
                        </span>
                        <button
                            type="button"
                            onClick={() => updateStatus('approved')}
                            disabled={processing || driver.status === 'approved'}
                            className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-[12px] font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Setujui Akses
                        </button>
                        <button
                            type="button"
                            onClick={() => updateStatus('suspended')}
                            disabled={processing || driver.status === 'suspended'}
                            className="inline-flex h-10 items-center justify-center rounded-xl bg-red-50 px-4 text-[12px] font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Tangguhkan
                        </button>
                    </div>
                </div>

                <article className="w-full">
                    <header className="border-b border-[#EDE8FC] pb-6">
                        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
                            <section className="rounded-[8px] border border-[#EDE8FC] bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-5">
                                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[24px] bg-[#28106F] text-3xl font-black text-white shadow-lg shadow-indigo-200">
                                        {initials(driver.name)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Profil Driver</p>
                                        <h2 className="mt-1 truncate text-[22px] font-black text-[#28106F]">{driver.name || '-'}</h2>
                                        <p className="mt-1 text-[13px] font-bold text-gray-500">{driver.email || '-'}</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="rounded-lg bg-indigo-50 px-3 py-1 text-[11px] font-black text-indigo-700">SIM {driver.license_number || '-'}</span>
                                            <span className="rounded-lg bg-gray-100 px-3 py-1 text-[11px] font-black text-gray-600">{driver.phone || 'Telepon belum diisi'}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="grid gap-4 md:grid-cols-3">
                                <StatCard label="Total Tugas" value={driver.stats?.total_shipments || 0} />
                                <StatCard label="Tugas Aktif" value={driver.stats?.active_shipments || 0} />
                                <StatCard label="Selesai" value={driver.stats?.delivered_shipments || 0} />
                            </section>
                        </div>
                    </header>

                    <main className="grid gap-7 py-7 xl:grid-cols-[1fr_0.8fr]">
                        <section className="space-y-7">
                            <section>
                                <h2 className="mb-4 flex items-center gap-3 text-[13px] font-black uppercase tracking-[0.14em] text-[#28106F]">
                                    <ShieldIcon className="h-5 w-5 text-[#28106F]" />
                                    Identitas Driver
                                </h2>
                                <dl className="rounded-xl border border-[#EDE8FC] bg-white px-5 shadow-sm">
                                    <DetailRow label="Nama Lengkap" value={driver.name} />
                                    <DetailRow label="Email Login" value={driver.email} />
                                    <DetailRow label="Nomor Telepon" value={driver.phone} />
                                    <DetailRow label="Nomor SIM" value={driver.license_number} />
                                    <DetailRow label="Status Akun" value={driver.account_status === 'active' ? 'Aktif' : 'Tidak aktif'} />
                                    <DetailRow label="Status Driver" value={currentStatus.label} />
                                </dl>
                            </section>

                            <section>
                                <h2 className="mb-4 text-[13px] font-black uppercase tracking-[0.14em] text-[#28106F]">Foto ID Karyawan / KTP</h2>
                                {driver.photo_id_card ? (
                                    <div className="rounded-xl border border-[#EDE8FC] bg-white p-4 shadow-sm">
                                        <img
                                            src={`/storage/${driver.photo_id_card}`}
                                            alt="Foto ID driver"
                                            className="max-h-[360px] w-full rounded-lg object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-[#dbe4f0] bg-white px-6 py-12 text-center shadow-sm">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-xl font-black text-indigo-600">
                                            {initials(driver.name)}
                                        </div>
                                        <p className="mt-4 text-[14px] font-black text-[#28106F]">Foto ID belum diunggah</p>
                                        <p className="mt-1 text-[13px] font-semibold text-gray-500">Sementara sistem menampilkan profil default berdasarkan inisial driver.</p>
                                    </div>
                                )}
                            </section>
                        </section>

                        <aside className="space-y-7">
                            <section>
                                <h2 className="mb-4 flex items-center gap-3 text-[13px] font-black uppercase tracking-[0.14em] text-[#28106F]">
                                    <RouteIcon className="h-5 w-5 text-[#28106F]" />
                                    Lokasi & Tugas Aktif
                                </h2>
                                <dl className="rounded-xl border border-[#EDE8FC] bg-white px-5 shadow-sm">
                                    <DetailRow label="Latitude" value={formatCoordinate(driver.latitude)} />
                                    <DetailRow label="Longitude" value={formatCoordinate(driver.longitude)} />
                                    <DetailRow label="Update Terakhir" value={driver.updated_at ? new Date(driver.updated_at).toLocaleString('id-ID') : '-'} />
                                    <DetailRow label="Deteksi Fake GPS" value={driver.last_location_mock ? 'Terdeteksi' : 'Tidak terdeteksi'} />
                                </dl>
                            </section>

                            <section className="rounded-xl border border-[#EDE8FC] bg-white p-5 shadow-sm">
                                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Tugas Aktif</p>
                                {activeShipment ? (
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <p className="text-[18px] font-black text-[#28106F]">{activeShipment.shipment_id}</p>
                                            <p className="mt-1 text-[13px] font-bold text-gray-500">{stageLabels[activeShipment.tracking_stage] || activeShipment.tracking_stage}</p>
                                        </div>
                                        <div className="rounded-xl bg-[#f8f9fb] p-4">
                                            <div className="text-[12px] font-bold text-gray-500">{activeShipment.origin_name || '-'}</div>
                                            <div className="my-2 h-px bg-[#dbe4f0]" />
                                            <div className="text-[13px] font-black text-[#28106F]">{activeShipment.destination_name || '-'}</div>
                                        </div>
                                        <DetailRow label="Estimasi Tiba" value={activeShipment.estimated_arrival} />
                                        <Link
                                            href={route('shipments.show', activeShipment.shipment_id)}
                                            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#28106F] px-4 text-[12px] font-black text-white transition hover:bg-[#3730a3]"
                                        >
                                            Lihat Pengiriman
                                        </Link>
                                    </div>
                                ) : (
                                    <p className="mt-4 text-[14px] font-bold text-gray-500">Tidak ada tugas pengiriman aktif.</p>
                                )}
                            </section>
                        </aside>
                    </main>

                    <section>
                        <h2 className="mb-4 text-[13px] font-black uppercase tracking-[0.14em] text-[#28106F]">Riwayat Pengiriman Terbaru</h2>
                        <div className="overflow-x-auto rounded-xl border border-[#EDE8FC] bg-white shadow-sm">
                            <table className="w-full min-w-[900px] text-left text-sm">
                                <thead className="bg-[#f8f9fb] text-[11px] uppercase tracking-[0.12em] text-gray-400">
                                    <tr>
                                        <th className="px-4 py-3 font-black">ID Pengiriman</th>
                                        <th className="px-4 py-3 font-black">Rute</th>
                                        <th className="px-4 py-3 font-black">Tahap</th>
                                        <th className="px-4 py-3 font-black">Estimasi</th>
                                        <th className="px-4 py-3 text-right font-black">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#EDE8FC]">
                                    {driver.shipments?.map((shipment) => (
                                        <tr key={shipment.id}>
                                            <td className="px-4 py-4 font-black text-[#28106F]">{shipment.shipment_id}</td>
                                            <td className="px-4 py-4 font-semibold text-gray-600">{shipment.origin_name || '-'} ke {shipment.destination_name || '-'}</td>
                                            <td className="px-4 py-4 font-bold text-gray-600">{stageLabels[shipment.tracking_stage] || shipment.tracking_stage || '-'}</td>
                                            <td className="px-4 py-4 font-semibold text-gray-500">{shipment.estimated_arrival || '-'}</td>
                                            <td className="px-4 py-4 text-right">
                                                <Link href={shipment.url} className="text-[12px] font-black text-[#28106F] hover:text-[#3730a3]">
                                                    Lihat
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!driver.shipments || driver.shipments.length === 0) && (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-10 text-center text-[13px] font-bold text-gray-400">
                                                Belum ada riwayat pengiriman untuk driver ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </article>
            </div>
        </DashboardLayout>
    );
}
