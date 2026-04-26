import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, Plus, Filter, Download, RefreshCw } from 'lucide-react';

/**
 * PageHeader Component - Reusable page header with consistent styling
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} [props.subtitle] - Optional subtitle/description
 * @param {string} [props.backHref] - Optional back button URL
 * @param {string} [props.backLabel] - Back button label (default: "Kembali")
 * @param {React.ReactNode} [props.primaryAction] - Primary action button/content
 * @param {React.ReactNode} [props.secondaryActions] - Secondary actions (array of buttons)
 * @param {Array<{label: string, href: string, active: boolean}>} [props.tabs] - Tab navigation items
 * @param {React.ReactNode} [props.filters] - Filter controls
 * @param {string} [props.className] - Additional CSS classes
 */
export default function PageHeader({
    title,
    subtitle,
    backHref,
    backLabel = 'Kembali',
    primaryAction,
    secondaryActions,
    tabs,
    filters,
    className = '',
}) {
    return (
        <div className={`mb-6 ${className}`}>
            {/* Top Row: Back + Title + Actions */}
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    {/* Back Button */}
                    {backHref && (
                        <Link
                            href={backHref}
                            className="inline-flex items-center space-x-1.5 text-[12px] font-bold text-gray-500 hover:text-[#28106F] transition-colors mb-3 group"
                        >
                            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                            <span>{backLabel}</span>
                        </Link>
                    )}

                    {/* Title & Subtitle */}
                    <div>
                        <h1 className="text-[22px] font-black text-[#28106F] tracking-tight leading-tight">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="mt-1.5 text-[13px] font-semibold text-gray-500 leading-relaxed max-w-2xl">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 flex-shrink-0 ml-6">
                    {secondaryActions && (
                        <div className="flex items-center space-x-2">
                            {secondaryActions}
                        </div>
                    )}
                    {primaryAction && (
                        <div className="flex-shrink-0">
                            {primaryAction}
                        </div>
                    )}
                </div>
            </div>

            {/* Filters Row */}
            {filters && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <div className="flex items-center space-x-3 flex-1">
                            {filters}
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs Navigation */}
            {tabs && tabs.length > 0 && (
                <div className="mt-4 border-b border-gray-200">
                    <nav className="flex space-x-1">
                        {tabs.map((tab, index) => (
                            <Link
                                key={index}
                                href={tab.href}
                                className={`px-4 py-3 text-[13px] font-bold transition-all border-b-2 ${
                                    tab.active
                                        ? 'border-[#28106F] text-[#28106F]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </div>
    );
}

/**
 * Pre-styled action button for use with PageHeader
 */
export function PageHeaderButton({
    children,
    onClick,
    href,
    variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger'
    icon: Icon,
    disabled = false,
    type = 'button',
}) {
    const baseClasses = 'inline-flex items-center space-x-2 px-4 py-2.5 rounded-[10px] text-[12px] font-black uppercase tracking-wider transition-all';
    
    const variantClasses = {
        primary: 'bg-[#28106F] text-white hover:bg-[#2d29a6] shadow-lg shadow-indigo-200/50',
        secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300',
        ghost: 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100',
        danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200/50',
    };

    const className = `${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

    const content = (
        <>
            {Icon && <Icon className="w-4 h-4" />}
            <span>{children}</span>
        </>
    );

    if (href) {
        return (
            <Link href={href} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <button type={type} onClick={onClick} disabled={disabled} className={className}>
            {content}
        </button>
    );
}

/**
 * Pre-styled icon button for use with PageHeader secondary actions
 */
export function PageHeaderIconButton({
    onClick,
    href,
    icon: Icon,
    label,
    variant = 'secondary',
    disabled = false,
}) {
    const baseClasses = 'inline-flex items-center justify-center w-10 h-10 rounded-[10px] transition-all';
    
    const variantClasses = {
        primary: 'bg-[#28106F] text-white hover:bg-[#2d29a6]',
        secondary: 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900',
        ghost: 'bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100',
        danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
    };

    const className = `${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

    const content = <Icon className="w-4.5 h-4.5" />;

    if (href) {
        return (
            <Link href={href} className={className} title={label}>
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} disabled={disabled} className={className} title={label}>
            {content}
        </button>
    );
}

// Export common action presets
export const PageHeaderActions = {
    Add: ({ href, onClick, label = 'Tambah' }) => (
        <PageHeaderButton href={href} onClick={onClick} icon={Plus} variant="primary">
            {label}
        </PageHeaderButton>
    ),
    
    Export: ({ onClick, label = 'Export' }) => (
        <PageHeaderButton onClick={onClick} icon={Download} variant="secondary">
            {label}
        </PageHeaderButton>
    ),
    
    Refresh: ({ onClick }) => (
        <PageHeaderIconButton onClick={onClick} icon={RefreshCw} label="Refresh" variant="secondary" />
    ),
};
