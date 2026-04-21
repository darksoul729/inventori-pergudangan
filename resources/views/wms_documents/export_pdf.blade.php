<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Dokumen WMS</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #111827;
            font-size: 10px;
            line-height: 1.35;
        }

        .header {
            border-bottom: 2px solid #111827;
            padding-bottom: 12px;
            margin-bottom: 16px;
        }

        .eyebrow {
            color: #4f46e5;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        h1 {
            margin: 3px 0 4px;
            font-size: 22px;
        }

        .muted {
            color: #6b7280;
        }

        .meta {
            margin-top: 8px;
            font-size: 9px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background: #111827;
            color: #ffffff;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: .4px;
            padding: 7px 6px;
            text-align: left;
        }

        td {
            border-bottom: 1px solid #e5e7eb;
            padding: 7px 6px;
            vertical-align: top;
        }

        .number {
            font-weight: bold;
            color: #111827;
        }

        .tag {
            display: inline-block;
            margin-top: 2px;
            padding: 2px 5px;
            border-radius: 4px;
            background: #eef2ff;
            color: #3730a3;
            font-size: 8px;
            font-weight: bold;
        }

        .right {
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="eyebrow">Warehouse Document Center</div>
        <h1>Rekap Dokumen WMS</h1>
        <div class="muted">Goods Receipt, Stock Out, Transfer Rack, Stock Opname, dan Stock Adjustment.</div>
        <div class="meta">
            Dibuat: {{ $generatedAt->format('d M Y H:i') }} |
            Filter jenis: {{ $filters['type'] ?: 'all' }} |
            Tanggal: {{ $filters['date_from'] ?: 'awal' }} sampai {{ $filters['date_to'] ?: 'akhir' }} |
            Pencarian: {{ $filters['search'] ?: '-' }} |
            Total: {{ number_format($documents->count(), 0, ',', '.') }} dokumen
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 18%;">Dokumen</th>
                <th style="width: 9%;">Tanggal</th>
                <th style="width: 13%;">Status</th>
                <th style="width: 17%;">Pihak / Sumber</th>
                <th style="width: 15%;">Gudang</th>
                <th class="right" style="width: 7%;">Item</th>
                <th class="right" style="width: 8%;">Qty</th>
                <th style="width: 13%;">Operator</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($documents as $document)
                <tr>
                    <td>
                        <div class="number">{{ $document['number'] }}</div>
                        <span class="tag">{{ $document['type_label'] }}</span>
                        <div class="muted" style="margin-top: 3px;">{{ $document['summary'] }}</div>
                    </td>
                    <td>{{ $document['date_label'] ?? $document['date'] }}</td>
                    <td>{{ $document['status'] }}</td>
                    <td>{{ $document['party'] }}</td>
                    <td>{{ $document['warehouse'] }}</td>
                    <td class="right">{{ number_format($document['item_count'], 0, ',', '.') }}</td>
                    <td class="right">{{ number_format($document['total_quantity'], 0, ',', '.') }}</td>
                    <td>{{ $document['operator'] }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" style="text-align: center; padding: 24px;" class="muted">
                        Tidak ada dokumen untuk filter ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
