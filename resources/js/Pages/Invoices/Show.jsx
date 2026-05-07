import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Show({ invoice }) {
    const { data, setData, put, processing } = useForm({
        payment_status: invoice.payment_status,
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
                    <h1 className="text-[28px] font-black text-[#28106F]">Detail Tagihan</h1>
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

                <div className="bg-white border border-[#EDE8FC] rounded-2xl p-6 space-y-3">
                    <div className="text-sm"><b>Tanggal:</b> {new Date(invoice.invoice_date).toLocaleDateString('id-ID')}</div>
                    <div className="text-sm"><b>Jatuh tempo:</b> {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('id-ID') : '-'}</div>
                    <div className="text-sm"><b>Total:</b> {formatCurrency(invoice.total_amount)}</div>
                    <div className="text-sm"><b>Catatan:</b> {invoice.notes || '-'}</div>
                </div>

                <div className="bg-white border border-[#EDE8FC] rounded-2xl p-6">
                    <h2 className="text-lg font-black text-[#28106F] mb-4">Item</h2>
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

                <form onSubmit={updateStatus} className="bg-white border border-[#EDE8FC] rounded-2xl p-6 flex items-end gap-3">
                    <div>
                        <label className="text-xs font-bold text-gray-500">Status Pembayaran</label>
                        <select value={data.payment_status} onChange={(e) => setData('payment_status', e.target.value)} className="block mt-1 rounded-xl border-gray-200">
                            <option value="belum_dibayar">Belum Dibayar</option>
                            <option value="sebagian">Sebagian</option>
                            <option value="lunas">Lunas</option>
                        </select>
                    </div>
                    <button disabled={processing} className="px-4 py-2 rounded-xl bg-[#5932C9] text-white text-sm font-bold">
                        {processing ? 'Menyimpan...' : 'Simpan Status'}
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
}
