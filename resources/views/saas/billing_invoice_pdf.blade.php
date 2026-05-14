<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Invoice Langganan</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #1f2937; font-size: 12px; }
        .wrap { padding: 20px; }
        .title { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
        .muted { color: #6b7280; }
        table { width: 100%; border-collapse: collapse; margin-top: 18px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        th { background: #f9fafb; }
        .right { text-align: right; }
        .total { font-size: 14px; font-weight: 700; }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="title">Invoice Langganan SaaS</div>
        <div class="muted">PETAYU</div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0 14px 0;">

        <table>
            <tr>
                <th>Nomor Invoice</th>
                <td>{{ $invoiceNumber }}</td>
                <th>Tanggal</th>
                <td>{{ optional($payment->created_at)->format('d M Y H:i') }}</td>
            </tr>
            <tr>
                <th>Pelanggan</th>
                <td>{{ $tenantName }}</td>
                <th>Order ID</th>
                <td>{{ $payment->provider_order_id }}</td>
            </tr>
            <tr>
                <th>Paket</th>
                <td>{{ $subscription?->plan?->name ?? '-' }}</td>
                <th>Status</th>
                <td>{{ strtoupper($payment->status) }}</td>
            </tr>
        </table>

        <table>
            <thead>
                <tr>
                    <th>Deskripsi</th>
                    <th class="right">Jumlah</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Langganan Paket {{ $subscription?->plan?->name ?? 'SaaS' }}</td>
                    <td class="right">Rp {{ number_format((int) $payment->amount, 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td class="total">Total</td>
                    <td class="right total">Rp {{ number_format((int) $payment->amount, 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>
