import DashboardLayout from '@/Layouts/DashboardLayout';
import { isManagerRole, isSupervisorRole, isStaffRole } from '@/Utils/roleCapabilities';
import OnboardingTutorial from '@/Components/OnboardingTutorial';
import { Head, Link, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { Truck, ArrowRight, Package, AlertCircle, FileText, ArrowDownToLine, ArrowUpFromLine, Columns, X, Rocket } from 'lucide-react';


export default function Dashboard({ stats = {}, trends = [], racks = [], wmsKpis = {}, onboarding = {} }) {
    const { auth, saas } = usePage().props;
    const userRole = auth?.user?.role_name || auth?.user?.role || '';
    const normalizedRole = String(userRole).toLowerCase();
    const isManager = isManagerRole(userRole);
    const isSupervisor = isSupervisorRole(userRole);
    const isStaff = isStaffRole(userRole);
    const isDriver = normalizedRole.includes('driver');

    const canManageShipment = isManager || isSupervisor || isDriver;
    const canManageFinance = isManager;
    const canManageInventory = isManager || isSupervisor || isStaff;
    const canCreatePurchaseOrder = isManager || isSupervisor || isStaff;
    
    const moduleFlags = saas?.modules || {};
    const hasModule = (code) => moduleFlags[code] !== false;
    const aiEnabled = hasModule('ai_contextual');
    const quickInputActions = [
        (canManageInventory || isManager) ? {
            href: canCreatePurchaseOrder ? '/purchase-orders/create' : '/purchase-orders',
            label: canCreatePurchaseOrder ? 'Catat Barang Masuk' : 'Lihat Pesanan Beli',
        } : null,
        (canManageShipment || isManager) && hasModule('shipment') ? {
            href: '/shipments/create',
            label: 'Buat Pengiriman',
        } : null,
        (canManageFinance || isManager) && hasModule('invoicing') ? {
            href: '/tagihan',
            label: 'Buat Tagihan',
        } : null,
    ].filter(Boolean);

    const [selectedRack, setSelectedRack] = useState(null);
    const [sortBy, setSortBy] = useState('zone');

    // Onboarding tutorial - show if setup incomplete and user is manager
    const setup = onboarding?.setup || {};
    const setupIncomplete = isManager && setup && Object.values(setup).some(v => !v);
    const completedCount = Object.values(setup).filter(Boolean).length;
    const [showOnboarding, setShowOnboarding] = useState(() => {
        if (!setupIncomplete) return false;
        if (typeof window !== 'undefined') return !localStorage.getItem('onboarding_dismissed');
        return true;
    });
    const [hoveredTrendIndex, setHoveredTrendIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDocuments = React.useMemo(() => {
        const docs = wmsKpis.latest_documents || [];
        if (!searchTerm) return docs;
        const term = searchTerm.toLowerCase();
        return docs.filter(doc =>
            (doc.number || '').toLowerCase().includes(term) ||
            (doc.type || '').toLowerCase().includes(term) ||
            (doc.party || '').toLowerCase().includes(term)
        );
    }, [wmsKpis.latest_documents, searchTerm]);

    const [aiInsight, setAiInsight] = useState('Asisten AI sedang menyiapkan ringkasan data...');
    const [aiLoading, setAiLoading] = useState(aiEnabled);

    const fetchAiInsight = (refresh = false) => {
        if (!aiEnabled) return;
        if (refresh) {
            setAiLoading(true);
            setAiInsight('Memuat ulang ringkasan terbaru...');
        }
        fetch(`/petayu-ai/dashboard-insight${refresh ? '?refresh=1' : ''}`)
            .then(res => res.json())
            .then(data => {
                setAiInsight(data.text || 'Asisten AI aktif dan siap membantu ringkasan operasional.');
            })
            .catch(() => {
                setAiInsight('Asisten AI tidak tersedia sementara. Sistem tetap berjalan normal.');
            })
            .finally(() => setAiLoading(false));
    };

    useEffect(() => {
        if (aiEnabled) fetchAiInsight();
    }, [aiEnabled]);

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num ? num.toString() : '0';
    };

    const formatPreciseNumber = (num) => num ? num.toLocaleString('id-ID') : '0';
    const hasRacks = racks.length > 0;
    const hasTrends = trends.length > 0;
    const onboardingStatusLabel = (value) => {
        const v = String(value || '').toLowerCase();
        if (v === 'active') return 'Aktif';
        if (v === 'trialing') return 'Masa Coba';
        if (v === 'past_due') return 'Perlu Pembayaran';
        if (v === 'canceled') return 'Tidak Aktif';
        return 'Masa Coba';
    };
    const onboardingToneClass = {
        danger: 'border-rose-200 bg-rose-50 text-rose-800',
        warning: 'border-amber-200 bg-amber-50 text-amber-800',
        info: 'border-blue-200 bg-blue-50 text-blue-800',
    };
    const onboardingStatusBadgeClass = {
        trialing: 'border-amber-200 bg-amber-100 text-amber-800',
        active: 'border-emerald-200 bg-emerald-100 text-emerald-800',
        past_due: 'border-rose-200 bg-rose-100 text-rose-800',
        canceled: 'border-slate-300 bg-slate-200 text-slate-700',
    };
    const nextActionTone = onboarding?.next_action?.tone || 'info';

    // Rack Calculations
    const totalRacks = racks.length;
    const occupiedRacks = racks.filter((r) => r.is_occupied).length;
    const alertRacks = racks.filter((r) => r.has_alert).length;
    
    const utilizationRaw = wmsKpis.rack_utilization || (totalRacks > 0 ? Math.round((occupiedRacks / totalRacks) * 100) : 0);
    const rackUtilization = Math.min(Math.max(utilizationRaw, 0), 100);
    const warehouseUtilization = wmsKpis.warehouse_utilization || 0;
    const unplacedStock = wmsKpis.unplaced_stock || 0;

    const getUtilColorObj = (val) => {
        if (val >= 90) return { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600', iconBg: 'bg-rose-100', dot: 'bg-rose-500' };
        if (val >= 75) return { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', iconBg: 'bg-amber-100', dot: 'bg-amber-500' };
        return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', iconBg: 'bg-emerald-100', dot: 'bg-emerald-500' };
    };
    const utilColors = getUtilColorObj(rackUtilization);

    // Visualizer Sorting Logic
    const getProcessedRacks = () => {
        let processed = [...racks];
        if (sortBy === 'capacity') {
            return { all: processed.sort((a, b) => b.fill_percent - a.fill_percent) };
        } else if (sortBy === 'newest') {
            return { all: processed.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) };
        } else {
            const grouped = {};
            processed.forEach(rack => {
                const zone = rack.zone_name || 'Belum Ditentukan';
                if (!grouped[zone]) grouped[zone] = [];
                grouped[zone].push(rack);
            });
            return Object.fromEntries(
                Object.entries(grouped).sort((a, b) => {
                    const lastA = new Date(Math.max(...a[1].map(r => new Date(r.created_at))));
                    const lastB = new Date(Math.max(...b[1].map(r => new Date(r.created_at))));
                    return lastB - lastA;
                })
            );
        }
    };
    const processedData = getProcessedRacks();

    // Trend Calculations
    const latestTrend = trends[trends.length - 1] || { inbound: 0, outbound: 0, date: '-' };
    const previousTrend = trends[trends.length - 2] || latestTrend;
    const inboundDelta = latestTrend.inbound - previousTrend.inbound;
    const outboundDelta = latestTrend.outbound - previousTrend.outbound;
    const formatDelta = (value) => value === 0 ? '0' : `${value > 0 ? '+' : ''}${value}`;
    const maxVal = Math.max(...trends.flatMap(t => [t.inbound, t.outbound]), 10);

    const generatePath = (key, isArea = false) => {
        if (trends.length < 2) return "";
        const points = trends.map((t, i) => ({
            x: (i / (trends.length - 1)) * 100,
            y: 30 - ((t[key] / maxVal) * 20 + 5)
        }));
        let path = `M ${points[0].x},${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) / 3;
            const cp2x = p0.x + (2 * (p1.x - p0.x)) / 3;
            path += ` C ${cp1x},${p0.y} ${cp2x},${p1.y} ${p1.x},${p1.y}`;
        }
        if (isArea) path += ` L 100,100 L 0,100 Z`;
        return path;
    };

    const printOperationalReport = () => {
        window.open(route('dashboard.operational-pdf'), '_blank');
    };


    return (
        <DashboardLayout headerSearchPlaceholder="Cari dokumen atau aktivitas..." searchValue={searchTerm} onSearch={setSearchTerm}>
            <Head title="Dasbor Gudang" />

            {showOnboarding && (
                <OnboardingTutorial
                    setup={setup}
                    onDismiss={() => { setShowOnboarding(false); localStorage.setItem('onboarding_dismissed', '1'); }}
                />
            )}
            
            <div className="max-w-[1500px] mx-auto pb-12 space-y-5">
                {/* Header */}
                <div>
                    <h1 className="text-[22px] font-black text-[#4722B3]">Ringkasan Operasional</h1>
                    <p className="text-[13px] font-semibold text-gray-500 mt-0.5">Pantau barang masuk, keluar, dan stok hari ini.</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {isManager && (
                        <Link href="/panduan-setup" className="flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 hover:bg-violet-100 transition group">
                            <div className="w-9 h-9 rounded-lg bg-[#5B33CC] text-white flex items-center justify-center flex-shrink-0">
                                <Rocket className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-[12px] font-black text-[#4722B3]">Panduan Setup</div>
                                <div className="text-[10px] font-semibold text-gray-400">{completedCount}/5 selesai</div>
                            </div>
                        </Link>
                    )}
                    {quickInputActions.map((action) => (
                        <Link key={action.href} href={action.href} className="flex items-center gap-3 rounded-xl border border-[#E5EAF3] bg-white px-4 py-3 hover:border-[#5B33CC] hover:bg-indigo-50/50 transition group">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0 group-hover:bg-[#5B33CC] group-hover:text-white transition">
                                {action.href.includes('purchase') && <ArrowDownToLine className="w-4 h-4" />}
                                {action.href.includes('shipment') && <Truck className="w-4 h-4" />}
                                {action.href.includes('tagihan') && <FileText className="w-4 h-4" />}
                            </div>
                            <div className="text-[12px] font-bold text-slate-700 group-hover:text-[#4722B3]">{action.label}</div>
                        </Link>
                    ))}
                </div>

                {/* Setup Banner - only if incomplete */}
                {isManager && setupIncomplete && (
                    <Link href="/panduan-setup" className="flex items-center gap-4 rounded-xl bg-[#4722B3] px-5 py-3.5 text-white hover:bg-[#3a1b96] transition group">
                        <div className="flex-1">
                            <div className="text-[13px] font-black">Selesaikan setup gudang untuk mulai operasional</div>
                            <div className="mt-1.5 h-1.5 bg-white/20 rounded-full overflow-hidden max-w-xs">
                                <div className="h-full bg-white rounded-full" style={{ width: `${(completedCount / 5) * 100}%` }}></div>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-indigo-300 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </Link>
                )}

                {onboarding?.show && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Status Akun</p>
                                    <p className="text-xs text-slate-500">Informasi langganan dan aktivasi</p>
                                </div>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${onboardingStatusBadgeClass[onboarding.subscription_status] || 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                                {onboardingStatusLabel(onboarding.subscription_status)}
                            </span>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Paket</p>
                                    <p className="text-sm font-semibold text-slate-800">{onboarding.subscription_plan || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Durasi</p>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {onboarding.subscription_status === 'trialing'
                                            ? `Sisa trial ${onboarding.trial_days_left ?? 0} hari`
                                            : (onboarding.trial_ends_at || '-')
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${onboarding?.email_verified ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Email</p>
                                    <p className={`text-sm font-semibold ${onboarding?.email_verified ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        {onboarding?.email_verified ? 'Terverifikasi' : 'Belum terverifikasi'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <Link
                                href={onboarding?.next_action?.href || '/settings/billing'}
                                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-violet-200 hover:bg-violet-700 transition-all"
                            >
                                {onboarding?.next_action?.label || 'Lihat Paket & Langganan'}
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Alert Cards for Checklist Hari Ini */}
                {(wmsKpis.low_stock_count > 0 || wmsKpis.delayed_shipments > 0 || wmsKpis.unpaid_invoices > 0) && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {wmsKpis.low_stock_count > 0 && (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-rose-700">Stok Menipis</p>
                                    <p className="mt-1 text-2xl font-black text-rose-900">{wmsKpis.low_stock_count}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                                    <AlertCircle className="h-5 w-5" />
                                </div>
                            </div>
                        )}
                        {wmsKpis.delayed_shipments > 0 && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Pengiriman Terlambat</p>
                                    <p className="mt-1 text-2xl font-black text-amber-900">{wmsKpis.delayed_shipments}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                    <Truck className="h-5 w-5" />
                                </div>
                            </div>
                        )}
                        {wmsKpis.unpaid_invoices > 0 && (
                            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-indigo-700">Tagihan Belum Lunas</p>
                                    <p className="mt-1 text-2xl font-black text-indigo-900">{wmsKpis.unpaid_invoices}</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <FileText className="h-5 w-5" />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- 1. KPI Utama (5 Cards) --- */}
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {/* Inbound */}
                    {/* Inbound */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center group hover:border-blue-200 transition-colors">
                        <div className="flex items-center space-x-2 mb-3">
                            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                                <ArrowDownToLine className="w-3.5 h-3.5" />
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Barang Masuk (Hari Ini)</p>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900">{formatPreciseNumber(wmsKpis.today_inbound || 0)}</h3>
                    </div>

                    {/* Outbound & Tingkat Keluar */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center group hover:border-violet-200 transition-colors relative">
                        {stats.outbound_rate !== undefined && (
                            <span className="absolute top-4 right-4 bg-slate-50 text-slate-500 border border-slate-100 text-[8px] font-black px-1.5 py-0.5 rounded-md tracking-wide" title="Tingkat Keluar per Jam">
                                {stats.outbound_rate}/JAM
                            </span>
                        )}
                        <div className="flex items-center space-x-2 mb-3">
                            <div className="w-6 h-6 rounded-md bg-violet-50 text-violet-600 flex items-center justify-center">
                                <ArrowUpFromLine className="w-3.5 h-3.5" />
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Barang Keluar (Hari Ini)</p>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900">{formatPreciseNumber(wmsKpis.today_outbound || 0)}</h3>
                    </div>

                    {/* Utilisasi Rack */}
                    <div className={`rounded-2xl p-6 border flex flex-col justify-center items-center text-center group transition-colors relative ${utilColors.border} ${utilColors.bg}`}>
                        <span className={`absolute top-4 right-4 block h-2 w-2 rounded-full ${utilColors.dot}`}></span>
                        <div className="flex items-center space-x-2 mb-3">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${utilColors.iconBg} ${utilColors.text}`}>
                                <Columns className="w-3.5 h-3.5" />
                            </div>
                            <p className={`text-[10px] font-black uppercase tracking-wider opacity-70 ${utilColors.text}`}>Kapasitas Rak Terpakai</p>
                        </div>
                        <h3 className={`text-4xl font-black ${utilColors.text}`}>{rackUtilization}%</h3>
                    </div>

                    {/* Total Inventaris */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center group hover:border-slate-300 transition-colors relative">
                        <div className="flex items-center space-x-2 mb-3">
                            <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
                                <Package className="w-3.5 h-3.5" />
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Total Barang & Stok</p>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900">{formatNumber(stats.total_inventory || 0)}</h3>
                        {unplacedStock > 0 && (
                            <p className="absolute bottom-4 text-[9px] font-bold text-amber-600">{formatNumber(unplacedStock)} belum di-rack</p>
                        )}
                    </div>

                </div>

                {/* Info kedaluwarsa dipisah agar tidak duplikatif dengan KPI utama */}
                {(wmsKpis.expired_stock > 0 || wmsKpis.expiring_soon > 0) && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className={`rounded-xl border px-4 py-3 ${wmsKpis.expired_stock > 0 ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                            <p className="text-[10px] font-black uppercase tracking-wider">Stok Kedaluwarsa</p>
                            <p className="mt-1 text-xl font-black">{wmsKpis.expired_stock || 0}</p>
                        </div>
                        <div className={`rounded-xl border px-4 py-3 ${wmsKpis.expiring_soon > 0 ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-600'}`}>
                            <p className="text-[10px] font-black uppercase tracking-wider">Segera Kedaluwarsa</p>
                            <p className="mt-1 text-xl font-black">{wmsKpis.expiring_soon || 0}</p>
                        </div>
                    </div>
                )}

                {/* --- 2. Tengah: Peta Gudang & Ringkasan AI --- */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    
                    {/* Visualisasi Lantai Gudang */}
                    <div className="xl:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-[#E5EAF3] min-h-[340px] flex flex-col relative">
                        <div className="flex justify-between items-start mb-5 relative z-10">
                            <div>
                                <h2 className="text-[16px] font-black text-[#4722B3]">Peta Rak</h2>
                                <p className="text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-wider">
                                    Tampilan: <span className="text-[#4722B3] font-black">{sortBy === 'zone' ? 'Zona' : sortBy === 'capacity' ? 'Kapasitas Penuh' : 'Baru Ditambahkan'}</span>
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                {/* Filter UI */}
                                <div className="flex bg-[#f4f5f9] p-1 rounded-lg border border-gray-100 shadow-sm">
                                    {[
                                        { id: 'zone', label: 'ZONA' },
                                        { id: 'capacity', label: 'PENUH' },
                                        { id: 'newest', label: 'BARU' }
                                    ].map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => setSortBy(option.id)}
                                            className={`px-2.5 py-1 rounded-[7px] text-[9px] font-black transition-all ${sortBy === option.id ? 'bg-white text-[#4722B3] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 bg-[#fbfcfd] rounded-[18px] border border-[#E5EAF3] relative flex flex-col overflow-y-auto max-h-[400px] custom-scrollbar">
                            {hasRacks ? (
                            <div className="p-5 px-10 pt-8 space-y-6">
                                {Object.entries(processedData).map(([groupName, groupRacks]) => (
                                    <div key={groupName} className="space-y-3">
                                        {sortBy === 'zone' && (
                                            <div className="flex items-center space-x-3">
                                                <div className="h-px flex-1 bg-gray-100"></div>
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.16em]">{groupName}</span>
                                                <div className="h-px flex-1 bg-gray-100"></div>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-12 gap-2.5">
                                            {groupRacks.map((rack, index) => {
                                                const column = index % 12;
                                                const isLeftEdge = column < 2;
                                                const isRightEdge = column > 9;
                                                let tooltipPosClass = "left-1/2 -translate-x-1/2";
                                                if (isLeftEdge) tooltipPosClass = "left-0 translate-x-0";
                                                else if (isRightEdge) tooltipPosClass = "right-0 translate-x-0";

                                                return (
                                                    <div
                                                        key={rack.id}
                                                        onClick={() => setSelectedRack(rack)}
                                                        className={`h-4 rounded-[5px] transition-all duration-300 relative group cursor-pointer ${rack.has_alert ? 'bg-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.3)]' : rack.is_occupied ? 'bg-[#4722B3]' : 'bg-[#e2e8f0]'}`}
                                                    >
                                                        {/* Advanced Tooltip */}
                                                        <div className={`absolute bottom-full ${tooltipPosClass} mb-2.5 w-40 p-2.5 bg-white text-[#4722B3] rounded-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 z-50 pointer-events-none shadow-[0_10px_24px_rgba(0,0,0,0.08)] border border-[#E5EAF3]`}>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="text-[9px] font-black tracking-wider uppercase opacity-40">Info Rak</span>
                                                                {rack.has_alert && <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>}
                                                            </div>
                                                            <div className="text-[12px] font-black mb-2 text-[#4722B3]">{rack.name}</div>
                                                            <div className="space-y-1.5">
                                                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-400">
                                                                    <span>Kapasitas</span>
                                                                    <span className={rack.has_alert ? 'text-red-600' : 'text-[#4722B3]'}>{rack.fill_percent}%</span>
                                                                </div>
                                                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-500 ${rack.has_alert ? 'bg-red-500' : 'bg-[#4722B3]'}`}
                                                                        style={{ width: `${Math.min(rack.fill_percent, 100)}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="text-[8px] font-bold text-gray-500">
                                                                    {formatPreciseNumber(rack.current_qty)} / {formatPreciseNumber(rack.capacity)} unit
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* Pointer Arrow */}
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[10px] border-[6px] border-transparent border-t-white opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 z-50 pointer-events-none shadow-sm"></div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            ) : (
                                <div className="h-full min-h-[230px] flex items-center justify-center p-8">
                                    <div className="max-w-md rounded-2xl border border-[#E5EAF3] bg-white px-6 py-6 text-center shadow-sm">
                                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFE9FF] text-[#4722B3]">
                                            <Columns className="h-5 w-5" />
                                        </div>
                                        <p className="text-[15px] font-black text-slate-900">Belum ada rak aktif</p>
                                        <p className="mt-2 text-[12px] font-semibold text-slate-500">
                                            Mulai dari buat zona dan rak dulu supaya stok bisa ditempatkan dan dipantau.
                                        </p>
                                        <div className="mt-4 flex items-center justify-center gap-2">
                                            <Link href="/warehouse" className="btn-secondary text-[11px] !py-2 !px-3">Atur Layout Gudang</Link>
                                            <Link href="/rack-allocation" className="btn-primary text-[11px] !py-2 !px-3">Buat Rak</Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Summary Legend Overlay */}
                        {hasRacks && <div className="absolute bottom-10 left-10 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-gray-100 shadow-sm flex items-center space-x-3 z-10 pointer-events-none">
                            <div className="flex items-center space-x-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#4722B3]"></span>
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Terisi</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#e2e8f0]"></span>
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Kosong</span>
                            </div>
                        </div>}
                    </div>

                    {/* Ringkasan AI */}
                    <div className="xl:col-span-4 bg-[#2d2a7f] rounded-[20px] p-6 text-white shadow-sm flex flex-col justify-between min-h-[340px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[320px] h-[320px] bg-[#4a46c8] rounded-full filter blur-[70px] opacity-55 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                        <div className="relative z-10 w-full mb-5 flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center space-x-2 mb-1.5">
                                    <div className={`w-[7px] h-[7px] rounded-full shadow-[0_0_10px_rgba(96,165,250,0.9)] ${aiEnabled ? 'bg-[#60a5fa] animate-pulse' : 'bg-white/50'}`}></div>
                                    <span className="text-[10px] font-black text-[#93c5fd] tracking-[0.18em] uppercase">Asisten AI</span>
                                </div>
                                <div className="text-[9px] font-bold text-[#93c5fd]/70 tracking-[0.16em] uppercase">
                                    {aiEnabled ? 'Ringkasan Otomatis' : 'Terkunci di Paket Saat Ini'}
                                </div>
                            </div>
                            <div className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/90">
                                Peringatan {alertRacks}
                            </div>
                        </div>
                        <div className="relative z-10 mb-6 max-w-[95%]">
                            <p className={`text-[17px] font-extrabold leading-[1.4] text-white transition-opacity duration-500 ${aiLoading ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
                                {aiEnabled ? (
                                    aiInsight.split(/(\*\*.*?\*\*)/g).map((part, index) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                            return <strong key={index} className="text-white font-black border-b-[1.5px] border-white/40 pb-[1px]">{part.slice(2, -2)}</strong>;
                                        }
                                        return part;
                                    })
                                ) : (
                                    <>
                                        Fitur Asisten AI belum aktif di paketmu sekarang. Upgrade paket untuk membuka ringkasan otomatis dan rekomendasi kontekstual.
                                    </>
                                )}
                            </p>
                        </div>
                        <div className="relative z-10 mt-auto flex items-center justify-between mb-4">
                            {aiEnabled ? (
                                <button
                                    onClick={() => fetchAiInsight(true)}
                                    disabled={aiLoading}
                                    className="flex items-center space-x-2.5 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-[10px] transition-all backdrop-blur-md border border-white/5 group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="text-[11px] font-black tracking-wide text-white">
                                        {aiLoading ? 'Memuat...' : 'Muat Ulang Ringkasan'}
                                    </span>
                                    {!aiLoading && <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />}
                                </button>
                            ) : (
                                <Link
                                    href={'/settings/billing?source=locked&module=Asisten%20AI'}
                                    className="flex items-center space-x-2.5 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-[10px] transition-all backdrop-blur-md border border-white/5 group"
                                >
                                    <span className="text-[11px] font-black tracking-wide text-white">Aktifkan Asisten AI</span>
                                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}
                        </div>
                        <div className="relative z-10 pt-4 border-t border-white/10 w-full">
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-[9px] font-extrabold text-[#93c5fd]/70 uppercase tracking-[0.16em] mb-1 block">Skor Efisiensi</span>
                                    <div className="text-[28px] font-black text-white leading-none">{stats.efficiency_score || 88}%</div>
                                </div>
                                <div className="flex space-x-1 items-end">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className={`w-2 rounded-full ${i < 6 ? 'h-5 bg-[#60a5fa]' : 'h-3 bg-white/20'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 4. Bawah: Tren Stok & Dokumen --- */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    
                    {/* Tren Pergerakan Stok */}
                    <div className="xl:col-span-8 bg-white rounded-[20px] p-6 shadow-sm border border-[#E5EAF3] min-h-[320px] flex flex-col">
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <h2 className="text-[16px] font-black text-[#4722B3]">Tren Pergerakan Stok</h2>
                                <p className="text-[11px] font-semibold text-gray-500 mt-1">Perbandingan barang masuk dan keluar.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-1.5 text-[10px] font-bold text-gray-600">
                                    <span className="w-2.5 h-2.5 rounded-md bg-[#2563eb]"></span>
                                    <span>Masuk</span>
                                </div>
                                <div className="flex items-center space-x-1.5 text-[10px] font-bold text-gray-600">
                                    <span className="w-2.5 h-2.5 rounded-md bg-[#94a3b8]"></span>
                                    <span>Keluar</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full relative group/chart mt-4">
                            {!hasTrends && (
                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                    <div className="max-w-sm rounded-2xl border border-[#E5EAF3] bg-white px-6 py-5 text-center shadow-sm">
                                        <p className="text-[14px] font-black text-slate-900">Belum ada data tren</p>
                                        <p className="mt-1 text-[12px] font-semibold text-slate-500">
                                            Catat barang masuk atau barang keluar dulu, nanti grafik tren tampil otomatis.
                                        </p>
                                        <div className="mt-3 flex justify-center gap-2">
                                            <Link href={canCreatePurchaseOrder ? "/purchase-orders/create" : "/purchase-orders"} className="btn-primary text-[11px] !py-2 !px-3">
                                                {canCreatePurchaseOrder ? 'Buat Pesanan Masuk' : 'Lihat Pesanan Beli'}
                                            </Link>
                                            <Link href="/transaction" className="btn-secondary text-[11px] !py-2 !px-3">Lihat Riwayat</Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Dynamic SVG Graph */}
                            <div className="absolute inset-0">
                                <svg
                                    width="100%"
                                    height="100%"
                                    preserveAspectRatio="none"
                                    viewBox="0 0 100 30"
                                    onMouseLeave={() => setHoveredTrendIndex(null)}
                                    className="overflow-visible"
                                >
                                    {/* Horizontal Grid Lines */}
                                    {[7.5, 15, 22.5].map(y => (
                                        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f1f5f9" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                                    ))}

                                    {/* Vertical Crosshair */}
                                    {hoveredTrendIndex !== null && (
                                        <line
                                            x1={(hoveredTrendIndex / (trends.length - 1)) * 100}
                                            y1="0"
                                            x2={(hoveredTrendIndex / (trends.length - 1)) * 100}
                                            y2="30"
                                            stroke="#e2e8f0"
                                            strokeWidth="1"
                                            strokeDasharray="4 4"
                                            vectorEffect="non-scaling-stroke"
                                        />
                                    )}

                                    {/* Outbound & Inbound Paths */}
                                    <path d={generatePath('outbound')} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" strokeLinecap="round" opacity="0.6" vectorEffect="non-scaling-stroke" />
                                    <path d={generatePath('inbound')} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                                    <path d={generatePath('inbound') + " L 100,30 L 0,30 Z"} fill="url(#blue-gradient)" opacity="0.08" />

                                    {/* Interaction Rects */}
                                    {trends.map((_, i) => (
                                        <rect
                                            key={i}
                                            x={(i / (trends.length - 1)) * 100 - 5}
                                            y="0"
                                            width="10"
                                            height="100"
                                            fill="transparent"
                                            onMouseEnter={() => setHoveredTrendIndex(i)}
                                            className="cursor-pointer"
                                        />
                                    ))}

                                    <defs>
                                        <linearGradient id="blue-gradient" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#2563eb" />
                                            <stop offset="100%" stopColor="transparent" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* HTML Hover Markers (Perfect Circles avoiding SVG stretch) */}
                                {trends.map((t, i) => {
                                    const xPct = (i / (trends.length - 1)) * 100;
                                    const yInTopPct = ( (30 - ((t.inbound / maxVal) * 20 + 5)) / 30 ) * 100;
                                    const yOutTopPct = ( (30 - ((t.outbound / maxVal) * 20 + 5)) / 30 ) * 100;
                                    const isHovered = hoveredTrendIndex === i;

                                    return (
                                        <React.Fragment key={`marker-${i}`}>
                                            <div 
                                                className={`absolute w-[11px] h-[11px] bg-[#2563eb] rounded-full border-2 border-white shadow-sm transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none ${isHovered ? 'scale-[1.4] ring-[3px] ring-blue-100 z-10' : 'scale-100 z-0'}`}
                                                style={{ left: `${xPct}%`, top: `${yInTopPct}%` }}
                                            />
                                            <div 
                                                className={`absolute w-2.5 h-2.5 bg-[#94a3b8] rounded-full border-[1.5px] border-white shadow-sm transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none ${isHovered ? 'scale-[1.4] ring-[3px] ring-slate-100 z-10' : 'scale-100 z-0'}`}
                                                style={{ left: `${xPct}%`, top: `${yOutTopPct}%` }}
                                            />
                                        </React.Fragment>
                                    );
                                })}
                            </div>

                            {/* Interactive Tooltip */}
                            {hoveredTrendIndex !== null && (
                                <div
                                    className="absolute z-50 pointer-events-none transition-all duration-200 bg-[#4722B3] rounded-xl p-3 shadow-2xl border border-white/10 text-white min-w-[140px]"
                                    style={{
                                        left: `${(hoveredTrendIndex / (trends.length - 1)) * 100}%`,
                                        bottom: '60%',
                                        transform: `translateX(${hoveredTrendIndex > (trends.length / 2) ? '-100%' : '0%'}) ${hoveredTrendIndex > (trends.length / 2) ? 'translateX(-10px)' : 'translateX(10px)'}`
                                    }}
                                >
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{trends[hoveredTrendIndex].date}</div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center space-x-6">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb]"></div>
                                                <span className="text-[11px] font-bold">Masuk</span>
                                            </div>
                                            <span className="text-[11px] font-black">{formatPreciseNumber(trends[hoveredTrendIndex].inbound)}</span>
                                        </div>
                                        <div className="flex justify-between items-center space-x-6">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#94a3b8]"></div>
                                                <span className="text-[11px] font-bold">Keluar</span>
                                            </div>
                                            <span className="text-[11px] font-black">{formatPreciseNumber(trends[hoveredTrendIndex].outbound)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* X-axis Labels */}
                            <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-1">
                                {trends.map((t, i) => (
                                    <span key={i} className={`text-[10px] font-black transition-colors ${hoveredTrendIndex === i ? 'text-[#2563eb]' : 'text-gray-400'}`}>
                                        {t.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Dokumen Terbaru */}
                    <div className="xl:col-span-4 bg-white rounded-[20px] p-6 shadow-sm border border-[#E5EAF3] min-h-[320px] flex flex-col h-full max-h-[350px]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[16px] font-black text-[#4722B3]">Dokumen Terbaru</h2>
                            {filteredDocuments.length > 0 && (
                                <span className="rounded-[8px] bg-[#f4f3ff] px-2.5 py-1 text-[10px] font-black text-[#4722B3]">
                                    {filteredDocuments.length} Baru
                                </span>
                            )}
                        </div>
                        
                        {filteredDocuments.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                <div className="w-12 h-12 rounded-full border border-dashed border-gray-200 flex items-center justify-center mb-3 text-gray-300">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <p className="text-[13px] font-black text-slate-800">Belum ada dokumen terbaru</p>
                                <p className="mt-1 text-[12px] font-semibold text-gray-400">Mulai input transaksi agar dokumen muncul otomatis di sini.</p>
                                <div className="mt-3 flex flex-wrap justify-center gap-2">
                                    <Link href={canCreatePurchaseOrder ? "/purchase-orders/create" : "/purchase-orders"} className="btn-primary text-[11px] !py-2 !px-3">
                                        {canCreatePurchaseOrder ? 'Buat Pesanan Pertama' : 'Lihat Pesanan Beli'}
                                    </Link>
                                    <Link href="/tagihan" className="btn-secondary text-[11px] !py-2 !px-3">
                                        Lihat Tagihan
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-2">
                                {filteredDocuments.map((doc, idx) => {
                                    const isGr = doc.type && doc.type.toLowerCase().includes('gr');
                                    const badgeColor = isGr ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-violet-50 text-violet-600 border-violet-200';
                                    const Wrapper = doc.url ? Link : 'div';
                                    
                                    return (
                                        <Wrapper 
                                            key={`${doc.number}-${idx}`} 
                                            {...(doc.url ? { href: doc.url } : {})}
                                            className={`block p-3 rounded-xl border border-[#E5EAF3] hover:border-slate-300 transition-all ${doc.url ? 'cursor-pointer hover:bg-slate-50/50 shadow-sm hover:shadow' : ''}`}
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${badgeColor}`}>
                                                        {doc.type}
                                                    </span>
                                                    <p className="text-[12px] font-bold text-slate-900">{doc.number}</p>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 mt-0.5 whitespace-nowrap">{doc.date}</span>
                                            </div>
                                            <p className="text-[11px] font-medium text-slate-500">{doc.party || 'Internal / Sistem'}</p>
                                        </Wrapper>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
            
            {/* Rack Detail Modal (Pop-up) */}
            {selectedRack && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pb-24">
                    <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-md" onClick={() => setSelectedRack(null)}></div>
                    <div className="relative bg-white rounded-[32px] w-full max-w-[440px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className={`h-24 flex items-center justify-center ${selectedRack.has_alert ? 'bg-red-500' : 'bg-[#4722B3]'} relative`}>
                            <button
                                onClick={() => setSelectedRack(null)}
                                className="absolute top-6 right-6 text-white opacity-60 hover:opacity-100"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <Columns className="w-10 h-10 text-white opacity-20" />
                        </div>

                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-[20px] font-black text-[#4722B3]">{selectedRack.name}</h3>
                                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">{selectedRack.code}</p>
                                </div>
                                <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wide ${selectedRack.has_alert ? 'bg-red-50 text-red-600' : 'bg-[#f4f3ff] text-[#4722B3]'}`}>
                                    {selectedRack.fill_percent}% TERISI
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[11px] font-black text-gray-500 tracking-wider">
                                        <span>STATUS KETERISIAN</span>
                                        <span className="text-[#4722B3]">{formatPreciseNumber(selectedRack.current_qty)} / {formatPreciseNumber(selectedRack.capacity)} Unit</span>
                                    </div>
                                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-700 ${selectedRack.has_alert ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-[#4722B3]'}`}
                                            style={{ width: `${Math.min(selectedRack.fill_percent, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#EFE9FF] p-4 rounded-2xl border border-gray-100">
                                        <div className="text-[9px] font-black text-gray-400 uppercase mb-1">Pemanfaatan</div>
                                        <div className="text-[18px] font-black text-[#4722B3]">{selectedRack.fill_percent}%</div>
                                    </div>
                                    <div className="bg-[#EFE9FF] p-4 rounded-2xl border border-gray-100">
                                        <div className="text-[9px] font-black text-gray-400 uppercase mb-1">Tersedia</div>
                                        <div className="text-[18px] font-black text-[#4722B3]">{formatPreciseNumber(Math.max(0, selectedRack.capacity - selectedRack.current_qty))} Unit</div>
                                    </div>
                                </div>

                                {selectedRack.has_alert && (
                                    <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <AlertCircleIcon className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-black text-red-900 leading-none mb-1 uppercase tracking-tight">Peringatan Kapasitas</div>
                                            <p className="text-[10px] font-bold text-red-700/80 leading-relaxed">
                                                Rak ini memiliki tingkat pemanfaatan di atas batas aman.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
            `}</style>
        </DashboardLayout>
    );
}
