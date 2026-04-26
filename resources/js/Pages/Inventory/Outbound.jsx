import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

const TruckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
);

const ArrowRightIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
);

const PackageIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

export default function Outbound() {
    return (
        <DashboardLayout>
            <Head title="Barang Keluar - Pengiriman" />

            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <div className="max-w-xl w-full text-center">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center mx-auto mb-6">
                        <TruckIcon className="w-10 h-10 text-indigo-600" />
                    </div>

                    <h1 className="text-[24px] font-black text-gray-900 mb-3">
                        Barang Keluar Sekarang Lewat Pengiriman
                    </h1>
                    <p className="text-[14px] font-semibold text-gray-500 leading-relaxed mb-8">
                        Semua pengeluaran barang dari gudang sekarang terintegrasi dengan sistem pengiriman. 
                        Buat shipment baru untuk mengirim barang ke tujuan — stok akan otomatis direservasi 
                        dan dikurangi saat pengiriman selesai.
                    </p>

                    <div className="grid grid-cols-1 gap-4 mb-8">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-left">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                <PackageIcon className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <div className="text-[13px] font-black text-gray-800">Reservasi Stok Otomatis</div>
                                <div className="text-[12px] text-gray-500">Stok direservasi saat shipment dibuat, dikurangi saat delivered</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-left">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <TruckIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-[13px] font-black text-gray-800">Tracking GPS & Driver</div>
                                <div className="text-[12px] text-gray-500">Pantau lokasi pengiriman real-time di peta</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-left">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <div>
                                <div className="text-[13px] font-black text-gray-800">Dokumen StockOut Otomatis</div>
                                <div className="text-[12px] text-gray-500">Dokumen barang keluar dibuat otomatis saat shipment delivered</div>
                            </div>
                        </div>
                    </div>

                    <Link
                        href={route('shipments.create')}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-[14px]"
                    >
                        <TruckIcon className="w-5 h-5" />
                        Buat Pengiriman Baru
                        <ArrowRightIcon className="w-5 h-5" />
                    </Link>

                    <div className="mt-4">
                        <Link
                            href={route('inventory')}
                            className="text-[12px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            ← Kembali ke Inventaris
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
