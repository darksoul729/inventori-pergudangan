import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Building2, Tags, Ruler, Users2, ShieldCheck, CreditCard } from 'lucide-react';

export const BuildingIcon = Building2;
export const TagIcon = Tags;
export const ScaleIcon = Ruler;
export const UsersIcon = Users2;

export default function SettingsSidebar({ activeTab, onTabChange }) {
    const { auth } = usePage().props;
    const roleName = (auth?.user?.role_name || auth?.user?.role || '').toString().toLowerCase();
    const isSystemAdmin = roleName.includes('admin sistem') || roleName.includes('admin system') || roleName.includes('super admin') || roleName.includes('system_admin');

    const renderButtonOrLink = (tabId, icon, title, subtitle, routeName, queryParams = {}) => {
        const isActive = activeTab === tabId;
        const IconComponent = icon;
        
        const content = (
            <>
                <div className={`p-2 rounded-xl flex-shrink-0 ${isActive ? 'bg-indigo-50 text-indigo-500' : 'bg-gray-100 text-gray-400'}`}>
                    <IconComponent className="w-5 h-5" />
                </div>
                <div>
                    <div className="mb-0.5">{title}</div>
                    <div className={`text-[11px] font-semibold ${isActive ? 'text-indigo-400' : 'text-gray-400'}`}>{subtitle}</div>
                </div>
            </>
        );

        const className = `group w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-bold text-[13px] transition-all text-left border ${
            isActive
                ? 'bg-violet-50 text-[#4B2BB7] border-violet-200 shadow-[0_6px_24px_rgba(91,51,204,0.08)]'
                : 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900'
        }`;

        if (onTabChange && ['warehouse', 'categories', 'units', 'staff'].includes(tabId)) {
            return (
                <button onClick={() => onTabChange(tabId)} className={className}>
                    {content}
                </button>
            );
        }

        return (
            <Link href={route(routeName, queryParams)} className={className}>
                {content}
            </Link>
        );
    };

    return (
        <div className="xl:sticky xl:top-4 h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="mb-3 rounded-xl border border-violet-100 bg-violet-50 px-3 py-2.5">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-violet-700" />
                    <h3 className="text-[11px] font-extrabold text-violet-700 tracking-widest uppercase">Panel Pengaturan</h3>
                </div>
                <p className="mt-1 text-[10px] font-semibold text-violet-500">Konfigurasi operasional dan paket akun.</p>
            </div>
            <div className="flex flex-col space-y-2">
                {renderButtonOrLink('warehouse', BuildingIcon, 'Gudang Utama', 'Nama, alamat, dan profil gudang', 'settings', { active: 'warehouse' })}
                {renderButtonOrLink('categories', TagIcon, 'Kategori Barang', 'Kelompok barang biar rapi', 'settings', { active: 'categories' })}
                {renderButtonOrLink('units', ScaleIcon, 'Satuan Barang', 'Contoh: pcs, box, kg, liter', 'settings', { active: 'units' })}
                {renderButtonOrLink('staff', UsersIcon, 'Akun Tim', 'Akses login untuk tim operasional', 'settings', { active: 'staff' })}
                {isSystemAdmin && renderButtonOrLink('saas', ShieldCheck, 'Admin SaaS', 'Kelola paket, tenant, dan modul', 'settings.saas')}
                {renderButtonOrLink('billing', CreditCard, 'Paket & Pembayaran', 'Tagihan, invoice, dan status langganan', 'settings.billing')}
            </div>
        </div>
    );
}
