<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Laporan Operasional Gudang</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #111; font-size: 12px; margin: 28px; }
        h1 { margin: 0; font-size: 20px; }
        .muted { color: #555; }
        .head { margin-bottom: 16px; }
        .box { border: 1px solid #1f2937; padding: 10px; margin-bottom: 14px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #1f2937; padding: 7px; text-align: left; }
        th { background: #f3f4f6; }
        .section-title { margin: 18px 0 8px; font-size: 14px; font-weight: bold; }
        .right { text-align: right; }
    </style>
</head>
<body>
    @php
        $hariMap = [
            'Sun' => 'Min',
            'Mon' => 'Sen',
            'Tue' => 'Sel',
            'Wed' => 'Rab',
            'Thu' => 'Kam',
            'Fri' => 'Jum',
            'Sat' => 'Sab',
        ];
    @endphp
    <div class="head">
        <h1>Laporan Operasional Gudang</h1>
        <div class="muted">Dicetak: {{ $generatedAt->format('d M Y H:i') }} WITA</div>
    </div>

    <div class="box">
        <div><strong>Nama Gudang:</strong> {{ $warehouseName }}</div>
        <div><strong>Lokasi:</strong> {{ $warehouseLocation }}</div>
    </div>

    <div class="section-title">Ringkasan Hari Ini</div>
    <table>
        <tbody>
            <tr><th>Barang Masuk (Hari Ini)</th><td class="right">{{ number_format((int) ($stats['today_inbound'] ?? 0), 0, ',', '.') }}</td></tr>
            <tr><th>Barang Keluar (Hari Ini)</th><td class="right">{{ number_format((int) ($stats['today_outbound'] ?? 0), 0, ',', '.') }}</td></tr>
            <tr><th>Total Barang & Stok</th><td class="right">{{ number_format((int) ($stats['total_inventory'] ?? 0), 0, ',', '.') }}</td></tr>
            <tr><th>Kapasitas Rak Terpakai</th><td class="right">{{ $stats['rack_utilization'] ?? 0 }}%</td></tr>
            <tr><th>Stok Menipis</th><td class="right">{{ number_format((int) ($stats['low_stock_count'] ?? 0), 0, ',', '.') }}</td></tr>
            <tr><th>Pengiriman Terlambat</th><td class="right">{{ number_format((int) ($stats['delayed_shipments'] ?? 0), 0, ',', '.') }}</td></tr>
            <tr><th>Tagihan Belum Lunas</th><td class="right">{{ number_format((int) ($stats['unpaid_invoices'] ?? 0), 0, ',', '.') }}</td></tr>
        </tbody>
    </table>

    <div class="section-title">Tren 7 Hari Terakhir</div>
    <table>
        <thead>
            <tr>
                <th>Hari</th>
                <th>Tanggal</th>
                <th class="right">Masuk</th>
                <th class="right">Keluar</th>
            </tr>
        </thead>
        <tbody>
            @forelse($trends as $trend)
                <tr>
                    <td>{{ $hariMap[$trend['label'] ?? ''] ?? ($trend['label'] ?? '-') }}</td>
                    <td>{{ \Carbon\Carbon::parse($trend['date'])->format('d M Y') }}</td>
                    <td class="right">{{ number_format((int) ($trend['inbound'] ?? 0), 0, ',', '.') }}</td>
                    <td class="right">{{ number_format((int) ($trend['outbound'] ?? 0), 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4">Belum ada data tren.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
