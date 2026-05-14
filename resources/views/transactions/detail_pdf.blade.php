<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Bukti Transaksi {{ $transactionNumber }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #111827;
            font-size: 10px;
            line-height: 1.35;
        }

        .header {
            border-bottom: 2px solid #28106F;
            padding-bottom: 12px;
            margin-bottom: 14px;
        }
        .header table { width: 100%; border-collapse: collapse; }
        .header td { border: none; padding: 0; vertical-align: top; }

        .eyebrow {
            color: #5932C9;
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        h1 { margin: 3px 0; font-size: 20px; color: #111827; }
        .muted { color: #6b7280; font-size: 9px; }

        .doc-info {
            text-align: right;
            font-size: 9px;
            line-height: 1.7;
            color: #334155;
        }

        .grid { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        .box { border: 1px solid #e5e7eb; background: #f9fafb; padding: 9px; }
        .label { color: #6b7280; font-size: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: .5px; }
        .value { margin-top: 3px; font-size: 13px; font-weight: bold; color: #111827; }
        .value-primary { margin-top: 3px; font-size: 13px; font-weight: bold; color: #4722B3; }

        table { width: 100%; border-collapse: collapse; }
        th { background: #111827; color: #ffffff; font-size: 8px; text-transform: uppercase; letter-spacing: .4px; padding: 7px 6px; text-align: left; }
        td { border-bottom: 1px solid #e5e7eb; padding: 7px 6px; vertical-align: top; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .mono { font-family: DejaVu Sans Mono, monospace; }

        .section-title { margin: 16px 0 7px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: .6px; color: #28106F; }

        .detail-table td { padding: 5px 6px; }
        .detail-table .dt { width: 28%; font-weight: bold; color: #374151; background: #f9fafb; }
        .detail-table .dd { color: #111827; }

        .note-box { border: 1px solid #e5e7eb; background: #f9fafb; padding: 8px 10px; font-size: 9px; color: #374151; line-height: 1.5; }

        .footer { margin-top: 20px; padding-top: 8px; border-top: 1.5px solid #28106F; font-size: 8px; color: #6b7280; }
        .footer table td { border: none; padding: 0; }
    </style>
</head>
<body>
    {{-- Header --}}
    <div class="header">
        <table>
            <tr>
                <td style="width: 60%;">
                    <div class="eyebrow">BUKTI TRANSAKSI PERSEDIAAN</div>
                    <h1>{{ $transactionNumber }}</h1>
                    <div class="muted">{{ $movementLabel }} &mdash; {{ $transaction->movement_date->format('d M Y, H:i') }} WIB</div>
                </td>
                <td class="doc-info">
                    <strong>No. Dokumen:</strong> {{ $documentNumber }}<br>
                    <strong>Referensi:</strong> {{ $referenceNumber }}<br>
                    <strong>Status:</strong> {{ $transaction->verification_status === 'verified' ? 'TERVERIFIKASI' : 'MENUNGGU VERIFIKASI' }}
                </td>
            </tr>
        </table>
    </div>

    {{-- Summary Stats --}}
    <table class="grid">
        <tr>
            <td class="box" style="width: 25%;">
                <div class="label">Jenis</div>
                <div class="value-primary">{{ $movementLabel }}</div>
            </td>
            <td class="box" style="width: 25%;">
                <div class="label">Mutasi</div>
                <div class="value-primary mono">{{ $movementSign }}{{ number_format($transaction->quantity, 0, ',', '.') }}</div>
            </td>
            <td class="box" style="width: 25%;">
                <div class="label">Stok Akhir</div>
                <div class="value mono">{{ number_format($transaction->stock_after ?? 0, 0, ',', '.') }}</div>
            </td>
            <td class="box" style="width: 25%;">
                <div class="label">Nilai</div>
                <div class="value">Rp {{ number_format($totalValue, 0, ',', '.') }}</div>
            </td>
        </tr>
    </table>

    {{-- Rincian Barang --}}
    <div class="section-title">Rincian Barang</div>
    <table>
        <thead>
            <tr>
                <th style="width: 32%;">Nama Barang</th>
                <th style="width: 14%;">SKU</th>
                <th style="width: 16%;" class="right">Harga Satuan</th>
                <th style="width: 10%;" class="right">Qty</th>
                <th style="width: 14%;" class="right">Stok Awal</th>
                <th style="width: 14%;" class="right">Stok Akhir</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="bold">{{ $transaction->product?->name ?? '-' }}</td>
                <td class="mono">{{ $transaction->product?->sku ?? '-' }}</td>
                <td class="right">Rp {{ number_format($unitPrice, 0, ',', '.') }}</td>
                <td class="right mono bold">{{ $movementSign }}{{ number_format($transaction->quantity, 0, ',', '.') }}</td>
                <td class="right mono">{{ number_format($transaction->stock_before ?? 0, 0, ',', '.') }}</td>
                <td class="right mono bold">{{ number_format($transaction->stock_after ?? 0, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    {{-- Detail Operasional --}}
    <div class="section-title">Detail Operasional</div>
    <table class="detail-table">
        <tbody>
            @if($transaction->user?->name)
            <tr>
                <td class="dt">Operator</td>
                <td class="dd">{{ $transaction->user->name }}</td>
            </tr>
            @endif
            @if($transaction->warehouse?->name)
            <tr>
                <td class="dt">Gudang</td>
                <td class="dd">{{ $transaction->warehouse->name }}{{ $transaction->warehouse->location ? ' — '.$transaction->warehouse->location : '' }}</td>
            </tr>
            @endif
            <tr>
                <td class="dt">Tanggal Transaksi</td>
                <td class="dd">{{ $transaction->movement_date->format('d M Y, H:i') }} WIB</td>
            </tr>
            @if($transaction->reference_type)
            @php
                $refTypeLabels = [
                    'stock_adjustment' => 'Penyesuaian Stok',
                    'goods_receipt' => 'Penerimaan Barang',
                    'stock_out' => 'Stok Keluar',
                    'stock_transfer' => 'Transfer Stok',
                    'stock_opname' => 'Cek Stok Fisik',
                    'purchase_order' => 'Pesanan Pembelian',
                ];
            @endphp
            <tr>
                <td class="dt">Tipe Referensi</td>
                <td class="dd">{{ $refTypeLabels[$transaction->reference_type] ?? $transaction->reference_type }}</td>
            </tr>
            @endif
            @if($transaction->verification_status === 'verified')
            <tr>
                <td class="dt">Diverifikasi Oleh</td>
                <td class="dd">{{ $transaction->verifiedBy?->name ?? '-' }} &mdash; {{ $transaction->verified_at ? \Carbon\Carbon::parse($transaction->verified_at)->format('d M Y, H:i') : '-' }}</td>
            </tr>
            @endif
            @if($transaction->notes)
            <tr>
                <td class="dt">Catatan</td>
                <td class="dd">{{ $transaction->notes }}</td>
            </tr>
            @endif
        </tbody>
    </table>

    {{-- Footer --}}
    <div class="footer">
        <table>
            <tr>
                <td>Dicetak: {{ $generatedAt->format('d M Y, H:i') }} WIB | {{ $documentNumber }}</td>
                <td class="right">PETAYU &mdash; Smart Storage, Smooth Flow</td>
            </tr>
        </table>
    </div>
</body>
</html>
