import DashboardLayout from '@/Layouts/DashboardLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, Link, usePage, router } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import { Plus, Truck, Clock, ShieldCheck, Building2, Phone, Mail, X, ExternalLink, Filter, BarChart3, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { isManagerRole } from '@/Utils/roleCapabilities';

export default function Supplier({ suppliers = [], stats = {}, filters = {} }) {
    const { props } = usePage();
    const roleName = props.auth?.user?.role_name || props.auth?.user?.role || '';
    const isManager = isManagerRole(roleName);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSupplierId, setEditingSupplierId] = useState(null);
    const [confirmDeleteSupplier, setConfirmDeleteSupplier] = useState(null);

    const filtered = useMemo(() => {
        if (!search) return suppliers;
        const s = search.toLowerCase();
        return suppliers.filter(sup => (sup.name || '').toLowerCase().includes(s) || (sup.code || '').toLowerCase().includes(s));
    }, [suppliers, search]);

    const { data, setData, post, put, processing, reset } = useForm({
        code: '', name: '', category: '', contact_person: '', phone: '', email: ''
    });

    const openCreateModal = () => {
        setEditingSupplierId(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (supplier) => {
        setEditingSupplierId(supplier.id);
        setData({
            code: supplier.code || '',
            name: supplier.name || '',
            category: supplier.category || '',
            contact_person: supplier.contact_person || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
        });
        setShowModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => { reset(); setShowModal(false); setEditingSupplierId(null); } };
        if (editingSupplierId) {
            put(route('supplier.update', editingSupplierId), options);
            return;
        }
        post(route('supplier.store'), options);
    };

    const handleDelete = (supplier) => {
        setConfirmDeleteSupplier(supplier);
    };

    const performDelete = () => {
        if (!confirmDeleteSupplier) return;
        router.delete(route('supplier.destroy', confirmDeleteSupplier.id), {
            preserveScroll: true,
            onSuccess: () => setConfirmDeleteSupplier(null),
        });
    };

    const list = filtered || [];
    const total = list.length;
    const activeCount = list.filter(s => s.status === 'active').length;
    const avgScore = list.length ? Math.round(list.reduce((sum, s) => sum + (s.latest_performance?.performance_score || 0), 0) / list.length) : 0;

    // Data grafik performa pemasok (multi-line)
    const chartData = list.slice(0, 8).map(s => ({
        name: s.code,
        score: s.latest_performance?.performance_score || 0,
        autoScore: s.latest_performance?.auto_score || 0,
        onTimeRate: s.latest_performance?.total_orders
            ? Math.round((Number(s.latest_performance?.on_time_deliveries || 0) / Math.max(1, Number(s.latest_performance?.total_orders || 0))) * 100)
            : 0,
        nameFull: s.name
    }));
    const buildLinePoints = useMemo(() => (key) => {
        if (chartData.length === 0) return [];
        const w = 920;
        const h = 240;
        const left = 48;
        const right = 20;
        const top = 20;
        const bottom = 38;
        const usableW = w - left - right;
        const usableH = h - top - bottom;
        const count = chartData.length;
        return chartData.map((d, i) => {
            const value = Math.max(0, Math.min(100, Number(d[key] || 0)));
            return {
                ...d,
                value,
                x: left + (count === 1 ? usableW / 2 : (i * usableW) / (count - 1)),
                y: top + ((100 - value) / 100) * usableH,
            };
        });
    }, [chartData]);
    const buildLinePath = useMemo(() => (points) => {
        if (points.length === 0) return '';
        if (points.length === 1) {
            const p = points[0];
            // Tetap tampilkan garis saat hanya ada satu pemasok.
            const startX = 48;
            const endX = 900;
            return `M ${startX} ${p.y} L ${endX} ${p.y}`;
        }
        return points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }, []);
    const scorePoints = useMemo(() => buildLinePoints('score'), [buildLinePoints]);
    const autoPoints = useMemo(() => buildLinePoints('autoScore'), [buildLinePoints]);
    const onTimePoints = useMemo(() => buildLinePoints('onTimeRate'), [buildLinePoints]);
    const scorePath = useMemo(() => buildLinePath(scorePoints), [buildLinePath, scorePoints]);
    const autoPath = useMemo(() => buildLinePath(autoPoints), [buildLinePath, autoPoints]);
    const onTimePath = useMemo(() => buildLinePath(onTimePoints), [buildLinePath, onTimePoints]);

    return (
        <DashboardLayout headerTitle="Pemasok" headerSearchPlaceholder="Cari...">
            <Head title="Pemasok" />
            <div className="pb-12 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[24px] font-black text-[#4722B3]">Pemasok</h1>
                        <p className="text-sm text-gray-500 mt-1">Kelola pemasok untuk kebutuhan pembelian gudang Anda.</p>
                    </div>
                    {isManager && (
                        <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-[#5B33CC] text-white font-bold rounded-lg text-sm">
                            <Plus className="w-4 h-4" />Tambah
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-[#E5EAF3]">
                        <div className="flex items-center gap-2 mb-1"><Truck className="w-4 h-4 text-indigo-500" /><span className="text-[11px] font-bold text-gray-500">Total</span></div>
                        <div className="text-[24px] font-black text-[#4722B3]">{total}</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#E5EAF3]">
                        <div className="flex items-center gap-2 mb-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span className="text-[11px] font-bold text-gray-500">Aktif</span></div>
                        <div className="text-[24px] font-black text-emerald-600">{activeCount}</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#E5EAF3]">
                        <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-amber-500" /><span className="text-[11px] font-bold text-gray-500">Rata-rata Lead Time</span></div>
                        <div className="text-[24px] font-black text-amber-600">{stats?.avgLeadTime?.value || 0} hari</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#E5EAF3]">
                        <div className="flex items-center gap-2 mb-1"><BarChart3 className="w-4 h-4 text-[#5B33CC]" /><span className="text-[11px] font-bold text-gray-500">Skor Rata</span></div>
                        <div className="text-[24px] font-black text-[#4722B3]">{avgScore}%</div>
                    </div>
                </div>

                {/* Chart - Performa Diagram */}
                {list.length > 0 && (
                    <div className="bg-white rounded-xl border border-[#E5EAF3] p-6">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h3 className="font-black text-[#4722B3]">Grafik Performa Pemasok</h3>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-gray-500">
                                <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#5B33CC]"></span>Skor</span>
                                <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#2563EB]"></span>Auto</span>
                                <span className="inline-flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#F59E0B]"></span>On-time %</span>
                            </div>
                        </div>
                        <div className="rounded-xl border border-[#E5EAF3] bg-[#fafbff] p-4">
                            <svg viewBox="0 0 920 240" className="w-full h-[240px]">
                                {[0, 20, 40, 60, 80, 100].map((yTick) => {
                                    const y = 20 + ((100 - yTick) / 100) * (240 - 20 - 38);
                                    return (
                                        <g key={yTick}>
                                            <line x1="48" y1={y} x2="900" y2={y} stroke="#e5eaf3" strokeDasharray="4 6" />
                                            <text x="16" y={y + 4} fontSize="10" fill="#94a3b8" fontWeight="700">{yTick}</text>
                                        </g>
                                    );
                                })}

                                {chartData.length === 1 ? (
                                    <>
                                        {[
                                            { label: 'Skor', value: scorePoints[0]?.value || 0, color: '#5B33CC', x: 300 },
                                            { label: 'Auto', value: autoPoints[0]?.value || 0, color: '#2563EB', x: 460 },
                                            { label: 'On-time', value: onTimePoints[0]?.value || 0, color: '#F59E0B', x: 620 },
                                        ].map((bar) => {
                                            const y = 20 + ((100 - bar.value) / 100) * (240 - 20 - 38);
                                            const barHeight = Math.max(6, 202 - y);
                                            return (
                                                <g key={bar.label}>
                                                    <rect x={bar.x - 26} y={202 - barHeight} width="52" height={barHeight} rx="8" fill={bar.color} fillOpacity="0.9" />
                                                    <text x={bar.x} y={192 - barHeight} textAnchor="middle" fontSize="11" fill="#1f2937" fontWeight="800">
                                                        {bar.value}%
                                                    </text>
                                                    <text x={bar.x} y="224" textAnchor="middle" fontSize="10" fill="#475569" fontWeight="700">
                                                        {bar.label}
                                                    </text>
                                                </g>
                                            );
                                        })}
                                        <text x="460" y="236" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="700">
                                            {chartData[0]?.name || '-'}
                                        </text>
                                    </>
                                ) : (
                                    <>
                                        {scorePath && <path d={scorePath} fill="none" stroke="#5B33CC" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />}
                                        {autoPath && <path d={autoPath} fill="none" stroke="#2563EB" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />}
                                        {onTimePath && <path d={onTimePath} fill="none" stroke="#F59E0B" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />}

                                        {scorePoints.map((p, i) => (
                                            <g key={`${p.name}-${i}`}>
                                                <circle cx={p.x} cy={p.y} r="4.5" fill="#5B33CC" />
                                                <circle cx={autoPoints[i]?.x || p.x} cy={autoPoints[i]?.y || p.y} r="4.5" fill="#2563EB" />
                                                <circle cx={onTimePoints[i]?.x || p.x} cy={onTimePoints[i]?.y || p.y} r="4.5" fill="#F59E0B" />
                                                <text x={p.x} y="226" textAnchor="middle" fontSize="10" fill="#475569" fontWeight="700">
                                                    {p.name}
                                                </text>
                                            </g>
                                        ))}
                                    </>
                                )}
                            </svg>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="bg-white rounded-xl border border-[#E5EAF3] overflow-hidden">
                    {list.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {list.map((s) => {
                                const perf = s.latest_performance || {};
                                const score = perf.performance_score || 0;
                                return (
                                    <div key={s.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center font-black text-xs text-[#5B33CC]">
                                            {s.code}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-[#4722B3]">{s.name}</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${score >= 80 ? 'bg-emerald-50 text-emerald-700' : score >= 70 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                                                    {score}%
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500">{s.category} · {s.contact_person || '-'} · {s.phone || s.email || '-'}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            {isManager && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(s)}
                                                        className="p-2 border border-[#E5EAF3] rounded-lg text-[#5B33CC] hover:bg-indigo-50"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(s)}
                                                        className="p-2 border border-red-100 rounded-lg text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            <Link href={route('supplier.show', s.id)} className="p-2 bg-[#5B33CC] rounded-lg text-white hover:bg-indigo-700">
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <Truck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="font-black text-[#4722B3]">Belum ada pemasok</p>
                        <p className="mt-1 text-[13px] font-semibold text-gray-500">Tambah pemasok dulu agar pesanan beli bisa diproses lebih cepat.</p>
                        {isManager && (
                            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                                <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-4 py-2 bg-[#5B33CC] text-white font-bold rounded-lg text-sm">
                                    <Plus className="w-4 h-4" />Tambah Pemasok
                                </button>
                                <Link href={route('purchase-orders.create')} className="inline-flex items-center gap-2 px-4 py-2 border border-[#E5EAF3] bg-white text-[#5B33CC] font-bold rounded-lg text-sm hover:bg-gray-50">
                                    Buat Pesanan Beli
                                </Link>
                            </div>
                        )}
                    </div>
                )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl mx-4">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="font-black text-[#4722B3] text-lg">{editingSupplierId ? 'Edit Pemasok' : 'Pemasok Baru'}</h2>
                            <button onClick={() => { setShowModal(false); setEditingSupplierId(null); }} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input value={data.code} onChange={e => setData('code', e.target.value)} placeholder="Kode" className="w-full pl-10 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-semibold" required />
                                </div>
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input value={data.category} onChange={e => setData('category', e.target.value)} placeholder="Kategori" className="w-full pl-10 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-semibold" />
                                </div>
                            </div>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Nama Pemasok" className="w-full pl-10 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-semibold" required />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input value={data.contact_person} onChange={e => setData('contact_person', e.target.value)} placeholder="Penanggung Jawab" className="w-full pl-10 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-semibold" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="HP" className="w-full pl-10 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-semibold" />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input value={data.email} onChange={e => setData('email', e.target.value)} placeholder="Email" className="w-full pl-10 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-semibold" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowModal(false); setEditingSupplierId(null); }} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-lg text-sm">Batal</button>
                                <button type="submit" disabled={processing} className="flex-1 px-4 py-2.5 bg-[#5B33CC] text-white font-bold rounded-lg text-sm">{processing ? 'Simpan...' : (editingSupplierId ? 'Update' : 'Simpan')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal Konfirmasi Hapus */}
            <Modal show={!!confirmDeleteSupplier} onClose={() => setConfirmDeleteSupplier(null)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-50 rounded-full mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-black text-center text-[#4722B3]">Hapus Pemasok?</h3>
                    <p className="mt-2 text-sm text-center text-gray-500 font-semibold leading-relaxed">
                        Anda akan menghapus <span className="text-[#5B33CC] font-bold">"{confirmDeleteSupplier?.name}"</span>. 
                        Tindakan ini tidak dapat dibatalkan dan semua data performa terkait akan ikut terhapus.
                    </p>
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setConfirmDeleteSupplier(null)}
                            className="flex-1 px-4 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={performDelete}
                            className="flex-1 px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-lg shadow-red-100"
                        >
                            Ya, Hapus
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
