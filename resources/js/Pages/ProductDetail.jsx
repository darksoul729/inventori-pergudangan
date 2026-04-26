import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';

// Icons
const TrendUpIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const VelocityIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const DownloadIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const PhotoPlaceholder = () => (
    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-900 to-[#1e1b4b] shadow-[0_8px_20px_rgba(49,46,129,0.3)] flex items-center justify-center p-0.5 overflow-hidden flex-shrink-0 relative">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-blue-500/20 blur-md focus:outline-none"></div>
        {/* Abstract 3D shape for Lithium Core */}
        <div className="relative w-12 h-14 bg-[#312e81] border-2 border-indigo-400 rounded-sm flex items-center justify-center shadow-inner">
            <div className="w-8 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
            <div className="absolute -top-1 w-6 h-1.5 bg-indigo-300 rounded-sm"></div>
            <div className="absolute -bottom-1 w-6 h-1.5 bg-indigo-300 rounded-sm"></div>
            {/* Dots */}
            <div className="absolute left-2 top-2 w-1.5 h-1.5 rounded-full bg-cyan-300"></div>
            <div className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
            <div className="absolute left-2 bottom-2 w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
            <div className="absolute right-2 bottom-2 w-1.5 h-1.5 rounded-full bg-cyan-300"></div>
        </div>
    </div>
);

export default function ProductDetail({ product, stats, distribution, movements }) {
    const { auth } = usePage().props;
    const roleName = String(auth?.user?.role_name || auth?.user?.role || '').toLowerCase();
    const isManager = roleName.includes('manager') || roleName.includes('manajer') || roleName.includes('admin gudang');

    return (
        <DashboardLayout>
            <Head title={`${product.name} - Detail Produk`} />

            <div className="pt-2 pb-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header Section */}
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center space-x-6">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-900 to-[#1e1b4b] shadow-[0_8px_20px_rgba(49,46,129,0.3)] flex items-center justify-center p-0.5 overflow-hidden flex-shrink-0 relative">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <div className="absolute inset-0 bg-blue-500/10 blur-md"></div>
                                    <div className="relative w-12 h-14 bg-[#312e81] border-2 border-indigo-400 rounded-sm flex items-center justify-center shadow-inner">
                                        <div className="w-8 h-[2px] bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="px-3 py-1 bg-[#f1f5f9] text-gray-600 text-[10px] font-black tracking-widest rounded-lg uppercase">SKU: {product.sku}</span>
                                <span className="px-3 py-1 bg-[#eef2ff] text-[#5932C9] text-[10px] font-black tracking-widest rounded-lg uppercase">{product.category}</span>
                            </div>
                            <h1 className="text-[32px] font-black text-[#28106F] leading-none mb-2 tracking-tight">{product.name}</h1>
                            <div className="flex items-center space-x-1.5">
                                <div className={`w-2 h-2 rounded-full ${stats.status === 'Healthy' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                                <span className={`text-[13px] font-bold ${stats.status === 'Healthy' ? 'text-emerald-600' : 'text-red-600'}`}>{stats.status}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 mt-4">
                        <Link
                            href={route('inventory')}
                            className="px-6 py-2.5 bg-white border border-[#EDE8FC] hover:bg-gray-50 text-gray-600 font-bold rounded-xl text-[13px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors"
                        >
                            Kembali ke Daftar
                        </Link>
                        {isManager && (
                            <Link
                                href={route('inventory.edit', product.id)}
                                className="px-6 py-2.5 bg-[#5932C9] shadow-[0_4px_14px_rgba(89,50,201,0.3)] hover:bg-indigo-700 text-white font-bold rounded-xl text-[13px] transition-colors"
                            >
                                Edit Entri
                            </Link>
                        )}
                    </div>
                </div>

                {/* 3 Top Stat Cards */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-[24px] p-7 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC] animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
                        <div className="text-[11px] font-extrabold text-gray-400 tracking-widest uppercase mb-3">TOTAL STOK</div>
                        <div className="flex items-baseline space-x-1.5 mb-4">
                            <span className="text-[36px] font-black text-[#28106F] leading-none">{stats.current_stock.toLocaleString('id-ID')}</span>
                            <span className="text-[14px] font-bold text-gray-400">Unit</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[#5932C9]">
                            <TrendUpIcon className="w-4 h-4" />
                            <span className="text-[12px] font-bold">Tersebar di {distribution.length} Lokasi Rak</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-[24px] p-7 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC] animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
                        <div className="text-[11px] font-extrabold text-gray-400 tracking-widest uppercase mb-3">VALUASI UNIT</div>
                        <div className="flex items-baseline space-x-1.5 mb-4">
                            <span className="text-[36px] font-black text-[#28106F] leading-none">Rp {(parseFloat(product.purchase_price)).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="text-[12px] font-bold text-gray-500 italic">
                            Harga beli satuan terkini
                        </div>
                    </div>
                    <div className="bg-white rounded-[24px] p-7 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC] animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
                        <div className="text-[11px] font-extrabold text-gray-400 tracking-widest uppercase mb-3">STOK MAKSIMUM</div>
                        <div className="flex items-baseline space-x-1.5 mb-4">
                            <span className="text-[36px] font-black text-[#28106F] leading-none">{stats.max_stock.toLocaleString('id-ID')}</span>
                            <span className="text-[14px] font-bold text-gray-400">Unit</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-500">
                            <VelocityIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-[12px] font-bold">Tingkat Pergerakan: {stats.velocity}</span>
                        </div>
                    </div>
                </div>

                {/* 2 Middle Cards */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Warehouse Distribution Mapping Visual */}
                    <div className="bg-white rounded-[24px] p-7 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC] animate-in fade-in slide-in-from-left-4 duration-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[16px] font-black text-[#28106F]">Distribusi Gudang</h3>
                            <span className="px-3 py-1 bg-[#f8f9fb] text-gray-600 border border-gray-100 text-[10px] font-bold rounded-lg tracking-wide uppercase">{stats.status}</span>
                        </div>
                        <div className="w-full bg-[#f8f9fb] h-[280px] rounded-2xl relative overflow-hidden flex flex-col p-6 border border-gray-100 space-y-4">
                            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#28106F_1px,transparent_1px)] [background-size:16px_16px]"></div>

                            {distribution.slice(0, 3).map((dist, idx) => (
                                <div key={idx} className="relative z-10 bg-white/80 backdrop-blur-sm border border-gray-100 p-4 rounded-xl shadow-sm flex justify-between items-center group hover:border-indigo-300 transition-colors">
                                    <div>
                                        <div className="text-[10px] font-black text-indigo-500 tracking-widest uppercase mb-1">{dist.zone_name}</div>
                                        <div className="text-[16px] font-black text-[#28106F]">{dist.rack_code}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[18px] font-black text-[#28106F]">{dist.quantity} <span className="text-[11px] text-gray-400 font-bold">UNIT</span></div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase">Kapasitas: {dist.capacity}</div>
                                    </div>
                                </div>
                            ))}

                            {distribution.length === 0 && (
                                <div className="h-full flex items-center justify-center text-gray-400 font-bold italic text-[13px]">
                                    Belum ada alokasi rak untuk produk ini.
                                </div>
                            )}

                            {distribution.length > 3 && (
                                <div className="text-center text-[11px] font-bold text-gray-400">
                                    + {distribution.length - 3} Lokasi Lainnya
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stock Efficiency visualization */}
                    <div className="bg-white rounded-[24px] p-7 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC] animate-in fade-in slide-in-from-right-4 duration-700">
                        <div className="mb-8">
                            <h3 className="text-[16px] font-black text-[#28106F]">Efisiensi Stok & Kapasitas</h3>
                        </div>

                        <div className="flex-1 flex flex-col justify-center items-center px-4 pb-6">
                            <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                                {/* SVG Circular Progress */}
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                                        strokeDasharray={552}
                                        strokeDashoffset={552 - (552 * stats.percentage) / 100}
                                        className="text-[#5932C9] transition-all duration-1000 ease-out"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-[42px] font-black text-[#28106F] leading-none">{stats.percentage}%</span>
                                    <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-2">Terisi</span>
                                </div>
                            </div>

                            <div className="w-full grid grid-cols-2 gap-4">
                                <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50">
                                    <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">STOK SAAT INI</div>
                                    <div className="text-[18px] font-black text-[#28106F]">{stats.current_stock} <span className="text-[10px] font-bold text-gray-400 uppercase">Unit</span></div>
                                </div>
                                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">KAPASITAS TOTAL</div>
                                    <div className="text-[18px] font-black text-[#28106F]">{stats.max_stock} <span className="text-[10px] font-bold text-gray-400 uppercase">Unit</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Bottom Section */}
                <div className="bg-white rounded-[24px] overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-[#EDE8FC] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                    <div className="flex justify-between items-center p-8 border-b border-gray-100">
                        <h3 className="text-[16px] font-black text-[#28106F]">Riwayat Pergerakan</h3>
                        <button className="flex items-center space-x-2 text-[12px] font-black text-[#5932C9] hover:text-indigo-700 transition-colors">
                            <span>Ekspor Riwayat</span>
                            <DownloadIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.1em] uppercase">DATE & TIME</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.1em] uppercase">TRANSACTION TYPE</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.1em] uppercase">QUANTITY</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.1em] uppercase">LAST STOCK</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.1em] uppercase">OPERATOR</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 tracking-[0.1em] uppercase text-right">WAREHOUSE</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {movements.map((move) => (
                                    <tr key={move.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="text-[13px] font-black text-[#28106F]">{move.date}</div>
                                            <div className="text-[11px] font-bold text-gray-400 mt-1">{move.time}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-[13px] font-bold text-[#28106F]">{move.type}</div>
                                            <div className="text-[11px] font-semibold text-gray-400 mt-1">{move.reference}</div>
                                        </td>
                                        <td className={`px-8 py-6 text-[14px] font-black ${move.type === 'Restok Masuk' ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                                            {move.quantity_formatted}
                                        </td>
                                        <td className="px-8 py-6 text-[13px] font-bold text-gray-600">{move.stock_after}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-black">{move.operator_initials}</div>
                                                <span className="text-[13px] font-bold text-gray-600">{move.operator}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">{move.location}</span>
                                        </td>
                                    </tr>
                                ))}
                                {movements.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-12 text-center text-gray-400 font-bold italic text-[14px]">
                                            Belum ada riwayat pergerakan untuk produk ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
