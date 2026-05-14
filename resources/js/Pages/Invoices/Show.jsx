import DashboardLayout from '@/Layouts/DashboardLayout';
import CustomDropdown from '@/Components/CustomDropdown';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Show({ invoice }) {
    const { props } = usePage();
    const tenantNotifyPartial = Boolean(props.invoiceNotificationSettings?.notify_partial ?? true);
    const tenantNotifyPaid = Boolean(props.invoiceNotificationSettings?.notify_paid ?? true);
    const { data, setData, put, processing } = useForm({
        payment_status: invoice.payment_status,
        notify_lunas: tenantNotifyPaid,
        notify_sebagian: tenantNotifyPartial,
    });

    const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount || 0);

    const updateStatus = (e) => {
        e.preventDefault();
        put(route('invoices.update-status', invoice.id));
    };

    const customerPhoneRaw = String(invoice.customer?.phone || '').replace(/[^\d]/g, '');
    const customerPhone = customerPhoneRaw.startsWith('0') ? `62${customerPhoneRaw.slice(1)}` : customerPhoneRaw;
    const waText = encodeURIComponent(
        `Halo ${invoice.customer?.name || 'Pelanggan'}, berikut tagihan ${invoice.invoice_number} sebesar ${formatCurrency(invoice.total_amount)}. Terima kasih.`
    );
    const waLink = customerPhone ? `https://wa.me/${customerPhone}?text=${waText}` : null;

    return (
        <DashboardLayout>
            <Head title={`Tagihan ${invoice.invoice_number}`} />
            <div className="space-y-6 pb-12">
                <div>
                    <h1 className="text-[28px] font-black text-[#4722B3]">Detail Tagihan</h1>
                    <p className="text-sm text-gray-500 font-semibold mt-1">{invoice.invoice_number} - {invoice.customer?.name}</p>
                </div>
                <div className="flex gap-3">
                    <a href={route('invoices.pdf', invoice.id)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold">
                        Unduh PDF
                    </a>
                    {waLink && (
                        <a href={waLink} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold">
                            Kirim WhatsApp
                        </a>
                    )}
                </div>

                <div className="bg-white border border-[#E5EAF3] rounded-2xl p-6 space-y-3">
                    <div className="text-sm"><b>Tanggal:</b> {new Date(invoice.invoice_date).toLocaleDateString('id-ID')}</div>
                    <div className="text-sm"><b>Jatuh tempo:</b> {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('id-ID') : '-'}</div>
                    <div className="text-sm"><b>Total:</b> {formatCurrency(invoice.total_amount)}</div>
                    <div className="text-sm"><b>Catatan:</b> {invoice.notes || '-'}</div>
                </div>

                <div className="bg-white border border-[#E5EAF3] rounded-2xl p-6">
                    <h2 className="text-lg font-black text-[#4722B3] mb-4">Item</h2>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b text-gray-400 text-xs uppercase">
                                <th className="py-2">Deskripsi</th>
                                <th className="py-2">Qty</th>
                                <th className="py-2">Harga</th>
                                <th className="py-2">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item) => (
                                <tr key={item.id} className="border-b border-gray-50">
                                    <td className="py-2">{item.description}</td>
                                    <td className="py-2">{item.quantity}</td>
                                    <td className="py-2">{formatCurrency(item.unit_price)}</td>
                                    <td className="py-2">{formatCurrency(item.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <form onSubmit={updateStatus} className="bg-white border border-[#E5EAF3] rounded-2xl p-6 space-y-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="text-xs font-bold text-gray-500">Status Pembayaran</label>
                            <CustomDropdown
                                value={data.payment_status}
                                onChange={(value) => setData('payment_status', value)}
                                options={[
                                    { value: 'belum_dibayar', label: 'Belum Dibayar' },
                                    { value: 'sebagian', label: 'Sebagian' },
                                    { value: 'lunas', label: 'Lunas' },
                                ]}
                                className="mt-1 min-w-[220px]"
                            />
                        </div>
                        <button disabled={processing} className="px-4 py-2 rounded-xl bg-[#5B33CC] text-white text-sm font-bold">
                            {processing ? 'Menyimpan...' : 'Simpan Status'}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <input
                                type="checkbox"
                                className="rounded border-gray-300 text-[#5B33CC] focus:ring-[#5B33CC]"
                                checked={data.notify_lunas}
                                onChange={(e) => setData('notify_lunas', e.target.checked)}
                            />
                            Kirim email saat status jadi Lunas
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <input
                                type="checkbox"
                                className="rounded border-gray-300 text-[#5B33CC] focus:ring-[#5B33CC]"
                                checked={data.notify_sebagian}
                                onChange={(e) => setData('notify_sebagian', e.target.checked)}
                            />
                            Kirim email saat status jadi Sebagian
                        </label>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
