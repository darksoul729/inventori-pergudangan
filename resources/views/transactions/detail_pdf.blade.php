<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Bukti Transaksi {{ $transactionNumber }}</title>
    <style>
        @page {
            margin: 52px 46px 46px 46px;
        }

        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            color: #000000;
            font-size: 9pt;
            line-height: 1.32;
        }

        header {
            position: fixed;
            top: -38px;
            left: 0;
            right: 0;
            height: 24px;
            border-bottom: 1px solid #000000;
            font-size: 7.5pt;
        }

        footer {
            position: fixed;
            bottom: -34px;
            left: 0;
            right: 0;
            height: 22px;
            border-top: 1px solid #000000;
            padding-top: 5px;
            font-size: 7.2pt;
        }

        .row {
            display: table;
            width: 100%;
            table-layout: fixed;
        }

        .cell {
            display: table-cell;
            vertical-align: top;
        }

        .right {
            text-align: right;
        }

        .center {
            text-align: center;
        }

        .bold {
            font-weight: bold;
        }

        .mono {
            font-family: DejaVu Sans Mono, monospace;
        }

        .pagenum:before {
            content: counter(page);
        }

        .letterhead {
            padding-bottom: 8px;
            border-bottom: 2px solid #28106F;
            margin-bottom: 10px;
        }

        .letterhead-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: auto;
            margin: 0;
        }

        .letterhead-table td {
            border: none;
            padding: 0;
            vertical-align: top;
        }

        .letterhead-company-cell {
            padding-right: 14px;
        }

        .letterhead-doc-cell {
            width: 255px;
            text-align: right;
            vertical-align: middle;
        }

        .company-name {
            margin: 0;
            font-size: 15pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .company-sub {
            margin: 2px 0 0;
            font-size: 8.5pt;
        }

        .company-detail {
            margin: 1px 0 0;
            font-size: 7.4pt;
        }

        .doc-code {
            font-size: 8pt;
            line-height: 1.5;
        }

        .document-title {
            margin: 10px 0 10px;
            text-align: center;
        }

        .document-title h1 {
            display: inline-block;
            margin: 0;
            padding-bottom: 2px;
            border-bottom: 1px solid #000000;
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        .document-title p {
            margin: 5px 0 0;
            font-size: 8.2pt;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        th,
        td {
            border: 1px solid #000000;
            padding: 5px 7px;
            vertical-align: top;
            font-size: 8.8pt;
        }

        th {
            font-weight: bold;
            text-align: left;
            text-transform: uppercase;
            letter-spacing: 0.25px;
        }

        .meta-table td {
            padding: 5px 7px;
        }

        .label {
            width: 23%;
            font-weight: bold;
        }

        .value {
            width: 27%;
        }

        .section-title {
            margin: 12px 0 5px;
            padding: 3px 0;
            border-top: 1px solid #000000;
            border-bottom: 1px solid #000000;
            font-size: 9.2pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        .summary-table td {
            width: 33.33%;
            height: 42px;
        }

        .summary-label {
            display: block;
            margin-bottom: 5px;
            font-size: 7.5pt;
            font-weight: bold;
            text-transform: uppercase;
        }

        .summary-value {
            display: block;
            font-size: 13pt;
            font-weight: bold;
        }

        .note-box {
            border: 1px solid #000000;
            min-height: 34px;
            padding: 7px 9px;
            margin-bottom: 8px;
            font-size: 8.8pt;
        }

        .statement {
            margin-top: 8px;
            border: 1px solid #000000;
            padding: 7px 9px;
            font-size: 8pt;
            text-align: justify;
        }

        .approval-table {
            margin-top: 12px;
            margin-bottom: 0;
        }

        .approval-table td {
            width: 25%;
            height: 82px;
            text-align: center;
            vertical-align: top;
            padding: 7px 8px;
        }

        .stamp-box {
            height: 49px;
            margin: 4px auto 5px;
            width: 118px;
            border: 1px solid #000000;
            text-align: center;
            font-size: 7pt;
            line-height: 49px;
            text-transform: uppercase;
        }

        .signature-space {
            height: 32px;
        }

        .signature-name {
            display: inline-block;
            min-width: 112px;
            padding-top: 4px;
            border-top: 1px solid #000000;
            font-weight: bold;
        }

        .small {
            font-size: 7.5pt;
        }
    </style>
</head>
<body>
    <header>
        <div class="row">
            <div class="cell">PETAYU - Bukti Transaksi</div>
            <div class="cell right">{{ $documentNumber }}</div>
        </div>
    </header>

    <footer>
        <div class="row">
            <div class="cell">Dokumen dibuat otomatis oleh sistem pada {{ $generatedAt->format('d/m/Y H:i') }}</div>
            <div class="cell right">Halaman <span class="pagenum"></span></div>
        </div>
    </footer>

    <div class="letterhead">
        <table class="letterhead-table">
            <tr>
                <td class="letterhead-company-cell">
                    <h2 class="company-name">PT. PETAYU INVENTORI PERGUDANGAN</h2>
                    <p class="company-sub">Sistem Inventori Pergudangan</p>
                    <p class="company-sub">Dokumen Administrasi Mutasi Stok Barang</p>
                    <p class="company-detail">Jl. Operasional Gudang No. 01, Makassar, Sulawesi Selatan</p>
                    <p class="company-detail">Telp. (0411) 000-0000 - Email: admin@petayu.id</p>
                </td>
                <td class="letterhead-doc-cell doc-code">
                    <div><strong>No. Dokumen:</strong> {{ $documentNumber }}</div>
                    <div><strong>No. Transaksi:</strong> {{ $transactionNumber }}</div>
                    <div><strong>Tanggal:</strong> {{ $transaction->movement_date->format('d/m/Y H:i') }}</div>
                    <div><strong>Referensi:</strong> {{ $referenceNumber }}</div>
                </td>
            </tr>
        </table>
    </div>

    <div class="document-title">
        <h1>Bukti Transaksi Persediaan</h1>
        <p>Dokumen resmi pencatatan mutasi stok berdasarkan data sistem inventori pergudangan.</p>
    </div>

    <table class="meta-table">
        <tbody>
            <tr>
                <td class="label">Nomor Dokumen</td>
                <td class="value mono">{{ $documentNumber }}</td>
                <td class="label">Jenis Transaksi</td>
                <td class="value">{{ $movementLabel }}</td>
            </tr>
            <tr>
                <td class="label">Nomor Transaksi</td>
                <td class="value mono">{{ $transactionNumber }}</td>
                <td class="label">Tipe Referensi</td>
                <td class="value">{{ $transaction->reference_type ?: 'Manual Entry' }}</td>
            </tr>
            <tr>
                <td class="label">Tanggal Transaksi</td>
                <td class="value">{{ $transaction->movement_date->format('d/m/Y H:i') }}</td>
                <td class="label">Status Dokumen</td>
                <td class="value">Tercatat Sistem</td>
            </tr>
            <tr>
                <td class="label">Nomor Referensi</td>
                <td class="value mono">{{ $referenceNumber }}</td>
                <td class="label">Unit Penerbit</td>
                <td class="value">Inventori Pergudangan</td>
            </tr>
        </tbody>
    </table>

    <table class="summary-table">
        <tbody>
            <tr>
                <td>
                    <span class="summary-label">Jumlah Mutasi</span>
                    <span class="summary-value mono">{{ $movementSign }}{{ number_format($transaction->quantity, 0, ',', '.') }} PCS</span>
                </td>
                <td>
                    <span class="summary-label">Stok Akhir</span>
                    <span class="summary-value mono">{{ number_format($transaction->stock_after ?? 0, 0, ',', '.') }}</span>
                </td>
                <td>
                    <span class="summary-label">Estimasi Nilai</span>
                    <span class="summary-value">Rp {{ number_format($totalValue, 0, ',', '.') }}</span>
                </td>
            </tr>
        </tbody>
    </table>

    <div class="section-title">I. Rincian Barang</div>
    <table>
        <thead>
            <tr>
                <th>Nama Barang</th>
                <th>SKU</th>
                <th class="right">Harga Satuan</th>
                <th class="right">Jumlah</th>
                <th class="right">Total Nilai</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="bold">{{ $transaction->product?->name ?? 'Unidentified Item' }}</td>
                <td class="mono">{{ $transaction->product?->sku ?? '-' }}</td>
                <td class="right">Rp {{ number_format($unitPrice, 0, ',', '.') }}</td>
                <td class="right mono">{{ number_format($transaction->quantity, 0, ',', '.') }}</td>
                <td class="right bold">Rp {{ number_format($totalValue, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div class="section-title">II. Pergerakan Stok</div>
    <table>
        <thead>
            <tr>
                <th class="right">Stok Awal</th>
                <th class="right">Mutasi</th>
                <th class="right">Stok Akhir</th>
                <th>Keterangan</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="right mono">{{ number_format($transaction->stock_before ?? 0, 0, ',', '.') }}</td>
                <td class="right mono">{{ $movementSign }}{{ number_format($transaction->quantity, 0, ',', '.') }}</td>
                <td class="right mono bold">{{ number_format($transaction->stock_after ?? 0, 0, ',', '.') }}</td>
                <td>{{ $movementLabel }}</td>
            </tr>
        </tbody>
    </table>

    <div class="section-title">III. Data Operasional</div>
    <table class="meta-table">
        <tbody>
            <tr>
                <td class="label">Operator</td>
                <td class="value">{{ $transaction->user?->name ?? 'System Auto' }}</td>
                <td class="label">Email Operator</td>
                <td class="value">{{ $transaction->user?->email ?? 'verified_system' }}</td>
            </tr>
            <tr>
                <td class="label">Gudang</td>
                <td class="value">{{ $transaction->warehouse?->name ?? 'N/A' }}</td>
                <td class="label">Lokasi Gudang</td>
                <td class="value">{{ $transaction->warehouse?->location ?? 'Belum ditentukan' }}</td>
            </tr>
        </tbody>
    </table>

    <div class="section-title">IV. Catatan Transaksi</div>
    <div class="note-box">
        {{ $transaction->notes ?: 'Tidak ada catatan tambahan pada transaksi ini.' }}
    </div>

    <div class="statement">
        Dokumen ini diterbitkan oleh sistem sebagai bukti administrasi mutasi stok. Pemeriksaan dilakukan dengan mencocokkan nomor transaksi, referensi, nama barang, jumlah mutasi, gudang, dan operator pada sistem.
    </div>

    <table class="approval-table">
        <tbody>
            <tr>
                <td>
                    <div class="bold">Dibuat oleh,</div>
                    <div class="signature-space"></div>
                    <div class="signature-name">{{ $transaction->user?->name ?? 'System Auto' }}</div>
                    <div class="small">Operator</div>
                </td>
                <td>
                    <div class="bold">Diperiksa oleh,</div>
                    <div class="signature-space"></div>
                    <div class="signature-name">{{ $transaction->verifiedBy?->name ?? 'Supervisor Gudang' }}</div>
                    <div class="small">Pemeriksa</div>
                </td>
                <td>
                    <div class="bold">Disetujui oleh,</div>
                    <div class="signature-space"></div>
                    <div class="signature-name">Manager Gudang</div>
                    <div class="small">Penanggung Jawab</div>
                </td>
                <td>
                    <div class="bold">Cap Perusahaan,</div>
                    <div class="stamp-box">Stempel</div>
                    <div class="small">PETAYU</div>
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>
