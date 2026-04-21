<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Laporan Status Gudang Operasional</title>
    <style>
        @page {
            margin: 90px 55px 80px 55px;
        }
        header {
            position: fixed;
            top: -65px;
            left: 0;
            right: 0;
            height: 45px;
            border-bottom: 2.5px solid #1e293b;
            display: table;
            width: 100%;
        }
        .header-left {
            display: table-cell;
            vertical-align: middle;
            font-size: 8.5pt;
            font-weight: bold;
            color: #1e293b;
        }
        .header-right {
            display: table-cell;
            vertical-align: middle;
            text-align: right;
            font-size: 8pt;
            color: #64748b;
        }
        footer {
            position: fixed;
            bottom: -55px;
            left: 0;
            right: 0;
            height: 40px;
            border-top: 1px solid #cbd5e1;
            padding-top: 8px;
            display: table;
            width: 100%;
        }
        .footer-left {
            display: table-cell;
            font-size: 7.5pt;
            color: #94a3b8;
            vertical-align: middle;
        }
        .footer-right {
            display: table-cell;
            text-align: right;
            font-size: 7.5pt;
            color: #94a3b8;
            vertical-align: middle;
        }
        .pagenum:before {
            content: counter(page);
        }
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 10pt;
            color: #1e293b;
            line-height: 1.5;
        }

        /* ─── Letterhead ─── */
        .letterhead {
            border-bottom: 3px double #1e293b;
            padding-bottom: 16px;
            margin-bottom: 20px;
        }
        .lh-inner {
            display: table;
            width: 100%;
        }
        .lh-logo-col {
            display: table-cell;
            width: 70px;
            vertical-align: middle;
        }
        .lh-logo-box {
            width: 54px;
            height: 54px;
            background-color: #1e293b;
            border-radius: 8px;
            text-align: center;
            line-height: 54px;
            font-size: 22pt;
            font-weight: 900;
            color: #ffffff;
            letter-spacing: -2px;
        }
        .lh-text-col {
            display: table-cell;
            vertical-align: middle;
            padding-left: 14px;
        }
        .lh-company {
            font-size: 16pt;
            font-weight: bold;
            color: #0f172a;
            margin: 0;
            letter-spacing: 0.5px;
        }
        .lh-sub {
            font-size: 8.5pt;
            color: #64748b;
            margin: 2px 0 0;
        }
        .lh-badge-col {
            display: table-cell;
            vertical-align: middle;
            text-align: right;
            width: 160px;
        }
        .confidential-badge {
            display: inline-block;
            border: 1.5px solid #ef4444;
            color: #ef4444;
            font-size: 7.5pt;
            font-weight: bold;
            padding: 3px 10px;
            border-radius: 4px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        /* ─── Report Title Block ─── */
        .report-title-block {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-left: 5px solid #1e293b;
            padding: 12px 16px;
            margin-bottom: 12px;
        }
        .report-title-block h1 {
            margin: 0 0 4px;
            font-size: 14pt;
            font-weight: bold;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .report-meta-row {
            display: table;
            width: 100%;
            margin-top: 4px;
        }
        .report-meta-cell {
            display: table-cell;
            font-size: 8.5pt;
            color: #64748b;
        }
        .report-meta-cell.right {
            text-align: right;
        }

        /* ─── Section Title ─── */
        .section-title {
            background-color: #1e293b;
            color: #ffffff;
            padding: 6px 12px;
            font-size: 10.5pt;
            font-weight: bold;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-top: 22px;
            margin-bottom: 12px;
        }
        .section-sub {
            font-size: 8.5pt;
            color: #64748b;
            margin-bottom: 10px;
            margin-top: -8px;
        }

        /* ─── Summary KPI Grid ─── */
        .kpi-grid {
            display: table;
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
        }
        .kpi-cell {
            display: table-cell;
            border: 1px solid #e2e8f0;
            padding: 10px 14px;
            vertical-align: top;
        }
        .kpi-cell.shaded {
            background-color: #f8fafc;
        }
        .kpi-label {
            font-size: 7.5pt;
            font-weight: bold;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            display: block;
            margin-bottom: 4px;
        }
        .kpi-value {
            font-size: 15pt;
            font-weight: bold;
            color: #0f172a;
            line-height: 1.1;
        }
        .kpi-note {
            font-size: 7.5pt;
            color: #94a3b8;
            margin-top: 3px;
        }

        /* ─── Description Paragraph ─── */
        .desc {
            font-size: 9.5pt;
            color: #334155;
            margin-bottom: 14px;
            line-height: 1.6;
        }

        /* ─── Progress Bar (text only, DomPDF safe) ─── */
        .progress-outer {
            background-color: #e2e8f0;
            height: 8px;
            width: 100%;
            margin-top: 4px;
        }
        .progress-inner {
            background-color: #1e293b;
            height: 8px;
        }

        /* ─── Tables ─── */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
            font-size: 9pt;
        }
        thead tr {
            background-color: #1e293b;
            color: #ffffff;
        }
        th {
            padding: 8px 10px;
            text-align: left;
            font-size: 8.5pt;
            font-weight: bold;
            letter-spacing: 0.3px;
            border: 1px solid #1e293b;
        }
        td {
            border: 1px solid #e2e8f0;
            padding: 6px 10px;
            font-size: 9pt;
        }
        tr.even td {
            background-color: #f8fafc;
        }
        td.center { text-align: center; }
        td.right  { text-align: right; }
        td.bold   { font-weight: bold; }
        td.total  { font-weight: bold; background-color: #f1f5f9; }

        /* ─── Status Badges ─── */
        .badge-in     { color: #16a34a; font-weight: bold; }
        .badge-out    { color: #dc2626; font-weight: bold; }
        .badge-high   { color: #7c3aed; font-weight: bold; }
        .badge-low    { color: #94a3b8; }

        /* ─── Shipment Status ─── */
        .badge-transit   { color: #d97706; font-weight: bold; }
        .badge-delivered { color: #16a34a; font-weight: bold; }
        .badge-delayed   { color: #dc2626; font-weight: bold; }

        /* ─── Signatures ─── */
        .signature-section {
            margin-top: 48px;
            display: table;
            width: 100%;
        }
        .signature-box {
            display: table-cell;
            width: 50%;
            text-align: center;
            vertical-align: top;
            padding: 0 20px;
        }
        .signature-line {
            margin: 54px auto 6px;
            border-top: 1px solid #0f172a;
            width: 180px;
        }
        .sig-title {
            font-size: 9.5pt;
            font-weight: bold;
        }
        .sig-date {
            font-size: 8pt;
            color: #64748b;
            margin-top: 2px;
        }

        /* ─── Footer line ─── */
        .end-line {
            clear: both;
            margin-top: 30px;
            text-align: center;
            font-size: 8pt;
            font-style: italic;
            color: #94a3b8;
            border-top: 1px dashed #e2e8f0;
            padding-top: 10px;
        }

        .page-break { page-break-after: always; }
    </style>
</head>
<body>

{{-- Fixed Header --}}
<header>
    <div class="header-left">SISTEM INFORMASI MANAJEMEN GUDANG — AETHER</div>
    <div class="header-right">No. Ref: LPG/{{ date('Ymd') }}/{{ str_pad(rand(1,999), 3, '0', STR_PAD_LEFT) }}</div>
</header>

{{-- Fixed Footer --}}
<footer>
    <div class="footer-left">Laporan ini bersifat RAHASIA — Hanya untuk kalangan internal</div>
    <div class="footer-right">Halaman <span class="pagenum"></span> | Dicetak: {{ date('d/m/Y H:i') }}</div>
</footer>


{{-- ═══════════════════════ KANAN ATAS ═══════════════════════ --}}
<div class="letterhead">
    <div class="lh-inner">
        <div class="lh-logo-col">
            <div class="lh-logo-box">A</div>
        </div>
        <div class="lh-text-col">
            <p class="lh-company">PT. AETHER INVENTORI PERGUDANGAN</p>
            <p class="lh-sub">Jl. Kawasan Industri Strategis No. 12, Jakarta Utara, DKI Jakarta 14350</p>
            <p class="lh-sub">Telp: (021) 1234-5678 &nbsp;|&nbsp; Email: admin@aether-logistik.id &nbsp;|&nbsp; www.aether-logistik.id</p>
        </div>
        <div class="lh-badge-col">
            <span class="confidential-badge">Rahasia</span>
        </div>
    </div>
</div>


{{-- ═══════════════════════ JUDUL LAPORAN ═══════════════════════ --}}
<div class="report-title-block">
    <h1>Laporan Status Operasional Gudang</h1>
    <div class="report-meta-row">
        <div class="report-meta-cell">Periode: <strong>{{ $stats['period'] }}</strong></div>
        <div class="report-meta-cell right">Dibuat pada: {{ $stats['generated_at_idn'] }}</div>
    </div>
</div>


{{-- ═══════════════════════ I. RINGKASAN EKSEKUTIF ═══════════════════════ --}}
<div class="section-title">I. Ringkasan Eksekutif</div>

<div class="kpi-grid">
    <div class="kpi-cell">
        <span class="kpi-label">Total Unit Tersimpan</span>
        <div class="kpi-value">{{ number_format($stats['total_inventory']) }}</div>
        <div class="kpi-note">dari {{ number_format($stats['total_capacity']) }} kapasitas rak</div>
    </div>
    <div class="kpi-cell shaded">
        <span class="kpi-label">Total Produk Terdaftar</span>
        <div class="kpi-value">{{ number_format($stats['total_products']) }}</div>
        <div class="kpi-note">jenis barang aktif</div>
    </div>
    <div class="kpi-cell">
        <span class="kpi-label">Estimasi Nilai Aset</span>
        <div class="kpi-value" style="font-size: 12pt;">Rp {{ number_format($stats['total_value'], 0, ',', '.') }}</div>
        <div class="kpi-note">berdasarkan harga beli</div>
    </div>
    <div class="kpi-cell shaded">
        <span class="kpi-label">Efisiensi Penyimpanan</span>
        <div class="kpi-value">{{ $stats['efficiency'] }}%</div>
        <div class="progress-outer">
            <div class="progress-inner" style="width: {{ min($stats['efficiency'], 100) }}%;"></div>
        </div>
    </div>
</div>

<div class="kpi-grid">
    <div class="kpi-cell">
        <span class="kpi-label">Total Pengiriman</span>
        <div class="kpi-value">{{ number_format($shipments['total']) }}</div>
        <div class="kpi-note">perjalanan terdaftar</div>
    </div>
    <div class="kpi-cell shaded">
        <span class="kpi-label">Sedang Transit</span>
        <div class="kpi-value" style="color: #d97706;">{{ number_format($shipments['transit']) }}</div>
        <div class="kpi-note">dalam perjalanan aktif</div>
    </div>
    <div class="kpi-cell">
        <span class="kpi-label">Terkirim</span>
        <div class="kpi-value" style="color: #16a34a;">{{ number_format($shipments['delivered']) }}</div>
        <div class="kpi-note">selesai dikirim</div>
    </div>
    <div class="kpi-cell shaded">
        <span class="kpi-label">Barang Masuk (30 Hari)</span>
        <div class="kpi-value">{{ number_format($movementSummary['inbound']) }}</div>
        <div class="kpi-note">unit diterima gudang</div>
    </div>
</div>

<p class="desc">
    Laporan ini mencakup kondisi operasional gudang secara menyeluruh per tanggal <strong>{{ date('d F Y') }}</strong>.
    Gudang saat ini beroperasi pada kapasitas <strong>{{ $stats['efficiency'] }}%</strong>, menyimpan total
    <strong>{{ number_format($stats['total_inventory']) }} unit barang</strong> dengan estimasi nilai aset sebesar
    <strong>Rp {{ number_format($stats['total_value'], 0, ',', '.') }}</strong>. Dokumen ini bersifat rahasia dan
    hanya diperuntukkan bagi pemangku kepentingan internal perusahaan.
</p>


{{-- ═══════════════════════ II. DISTRIBUSI PER KATEGORI ═══════════════════════ --}}
<div class="section-title">II. Distribusi Stok & Valuasi per Kategori</div>
<p class="section-sub">Ringkasan volume unit dan estimasi nilai aset berdasarkan kategori produk.</p>

@php $grandQty = $categories->sum('total_qty'); $grandVal = $categories->sum('total_value'); @endphp
<table>
    <thead>
        <tr>
            <th style="width: 5%;">No</th>
            <th style="width: 30%;">Kategori</th>
            <th style="width: 12%; text-align: center;">Jml Produk</th>
            <th style="width: 13%; text-align: center;">Total Unit</th>
            <th style="width: 10%; text-align: center;">% Unit</th>
            <th style="width: 20%; text-align: right;">Nilai Aset (Rp)</th>
            <th style="width: 10%; text-align: center;">% Nilai</th>
        </tr>
    </thead>
    <tbody>
        @foreach($categories as $i => $cat)
        <tr class="{{ $i % 2 == 0 ? '' : 'even' }}">
            <td class="center">{{ $i + 1 }}</td>
            <td class="bold">{{ $cat->name }}</td>
            <td class="center">{{ number_format($cat->product_count) }}</td>
            <td class="center">{{ number_format($cat->total_qty) }}</td>
            <td class="center">
                {{ $grandQty > 0 ? number_format(($cat->total_qty / $grandQty) * 100, 1) : 0 }}%
            </td>
            <td class="right">{{ number_format($cat->total_value, 0, ',', '.') }}</td>
            <td class="center">
                {{ $grandVal > 0 ? number_format(($cat->total_value / $grandVal) * 100, 1) : 0 }}%
            </td>
        </tr>
        @endforeach
        <tr>
            <td colspan="3" class="total bold right">TOTAL</td>
            <td class="total center bold">{{ number_format($grandQty) }}</td>
            <td class="total center bold">100%</td>
            <td class="total right bold">{{ number_format($grandVal, 0, ',', '.') }}</td>
            <td class="total center bold">100%</td>
        </tr>
    </tbody>
</table>


{{-- ═══════════════════════ III. MANIFEST STOK PRODUK ═══════════════════════ --}}
<div class="page-break"></div>

<div class="section-title">III. Manifest Stok Produk</div>
<p class="section-sub">Daftar seluruh produk beserta jumlah unit yang tersimpan di rak gudang saat ini.</p>

<table>
    <thead>
        <tr>
            <th style="width: 5%;">No</th>
            <th style="width: 14%;">Kode SKU</th>
            <th style="width: 36%;">Nama Produk</th>
            <th style="width: 20%;">Kategori</th>
            <th style="width: 10%; text-align: center;">Qty</th>
            <th style="width: 8%; text-align: center;">Satuan</th>
            <th style="width: 7%; text-align: center;">Status</th>
        </tr>
    </thead>
    <tbody>
        @foreach($products as $idx => $product)
        @php $qty = $product->total_qty ?? 0; @endphp
        <tr class="{{ $idx % 2 == 0 ? '' : 'even' }}">
            <td class="center">{{ $idx + 1 }}</td>
            <td class="bold">{{ $product->sku }}</td>
            <td>{{ $product->name }}</td>
            <td>{{ $product->category->name ?? 'Tidak Berkategori' }}</td>
            <td class="center bold">{{ number_format($qty) }}</td>
            <td class="center">{{ $product->unit->name ?? 'Pcs' }}</td>
            <td class="center">
                @if($qty > 0)
                    <span class="badge-in">Tersedia</span>
                @else
                    <span class="badge-out">Habis</span>
                @endif
            </td>
        </tr>
        @endforeach
    </tbody>
</table>


{{-- ═══════════════════════ IV. RIWAYAT PERGERAKAN BARANG ═══════════════════════ --}}
<div class="page-break"></div>

<div class="section-title">IV. Riwayat Pergerakan Barang (50 Terkini)</div>
<p class="section-sub">Catatan transaksi masuk dan keluar barang paling terbaru di gudang operasional.</p>

<table>
    <thead>
        <tr>
            <th style="width: 16%;">Tanggal & Waktu</th>
            <th style="width: 8%; text-align: center;">Jenis</th>
            <th style="width: 38%;">Nama Produk</th>
            <th style="width: 8%; text-align: center;">Qty</th>
            <th style="width: 15%;">Referensi</th>
        </tr>
    </thead>
    <tbody>
        @foreach($movements as $mi => $m)
        <tr class="{{ $mi % 2 == 0 ? '' : 'even' }}">
            <td>{{ $m->movement_date->format('d/m/Y H:i') }}</td>
            <td class="center">
                @if($m->movement_type === 'in')
                    <span class="badge-in">MASUK</span>
                @else
                    <span class="badge-out">KELUAR</span>
                @endif
            </td>
            <td>{{ $m->product->name }}</td>
            <td class="center bold">{{ number_format($m->quantity) }}</td>
            <td>{{ $m->reference_type }} #{{ $m->reference_id }}</td>
        </tr>
        @endforeach
    </tbody>
</table>


{{-- ═══════════════════════ V. UTILISASI RAK PENYIMPANAN ═══════════════════════ --}}
<div class="page-break"></div>

<div class="section-title">V. Utilisasi Rak Penyimpanan</div>
<p class="section-sub">Detail kapasitas dan tingkat keterisian setiap rak di gudang operasional.</p>

<table>
    <thead>
        <tr>
            <th style="width: 5%;">No</th>
            <th style="width: 14%;">Kode Rak</th>
            <th style="width: 22%;">Zona / Sektor</th>
            <th style="width: 14%; text-align: center;">Terpakai</th>
            <th style="width: 14%; text-align: center;">Kapasitas</th>
            <th style="width: 13%; text-align: center;">Utilisasi</th>
            <th style="width: 18%; text-align: center;">Status</th>
        </tr>
    </thead>
    <tbody>
        @foreach($racks as $ri => $rack)
        @php
            $used = $rack->total_qty ?? 0;
            $cap  = max(1, $rack->capacity);
            $pct  = round(($used / $cap) * 100, 1);
        @endphp
        <tr class="{{ $ri % 2 == 0 ? '' : 'even' }}">
            <td class="center">{{ $ri + 1 }}</td>
            <td class="bold">{{ $rack->code }}</td>
            <td>{{ $rack->zone->name ?? 'Tidak Terklasifikasi' }}</td>
            <td class="center">{{ number_format($used) }}</td>
            <td class="center">{{ number_format($rack->capacity) }}</td>
            <td class="center bold">{{ $pct }}%</td>
            <td class="center">
                @if($pct >= 90)
                    <span class="badge-out">Hampir Penuh</span>
                @elseif($pct >= 50)
                    <span class="badge-transit">Sedang Terisi</span>
                @elseif($pct > 0)
                    <span class="badge-in">Tersedia</span>
                @else
                    <span class="badge-low">Kosong</span>
                @endif
            </td>
        </tr>
        @endforeach
    </tbody>
</table>


{{-- ═══════════════════════ VI. PENGESAHAN & TANDA TANGAN ═══════════════════════ --}}
<div class="section-title">VI. Pengesahan Laporan</div>

<p class="desc">
    Laporan ini telah dibuat secara otomatis oleh Sistem Informasi Manajemen Gudang (SIMAG) — Aether,
    dan disahkan oleh pihak yang bertanda tangan di bawah ini.
</p>

<div class="signature-section">
    <div class="signature-box">
        <p>Dibuat Oleh,</p>
        <div class="signature-line"></div>
        <p class="sig-title">Kepala Gudang / Supervisor</p>
        <p class="sig-date">Tanggal: {{ date('d F Y') }}</p>
    </div>
    <div class="signature-box">
        <p>Disetujui Oleh,</p>
        <div class="signature-line"></div>
        <p class="sig-title">Manajer Operasional</p>
        <p class="sig-date">Tanggal: __________________</p>
    </div>
</div>

<div class="end-line">
    ─── AKHIR DOKUMEN ─── Dicetak oleh Sistem SIMAG Aether pada {{ $stats['generated_at'] }} WIB ───
</div>

</body>
</html>
