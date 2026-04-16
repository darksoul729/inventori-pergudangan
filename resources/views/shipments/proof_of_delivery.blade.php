<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Proof of Delivery {{ $shipment->shipment_id }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #111827;
            font-size: 12px;
            margin: 28px;
        }
        .header {
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 16px;
            margin-bottom: 20px;
        }
        .kicker {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.18em;
            color: #4f46e5;
            margin-bottom: 6px;
        }
        .title {
            font-size: 26px;
            font-weight: 700;
            margin: 0;
        }
        .subtitle {
            margin-top: 6px;
            color: #4b5563;
        }
        .grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .grid td {
            width: 50%;
            vertical-align: top;
            padding: 12px 16px;
            border: 1px solid #e5e7eb;
        }
        .label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #6b7280;
            margin-bottom: 6px;
        }
        .value {
            font-size: 14px;
            font-weight: 700;
            color: #111827;
        }
        .section {
            margin-bottom: 22px;
        }
        .section-title {
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #374151;
            margin-bottom: 10px;
        }
        .note-box {
            border: 1px solid #e5e7eb;
            padding: 14px 16px;
            border-radius: 12px;
            line-height: 1.7;
            color: #374151;
        }
        .timeline {
            width: 100%;
            border-collapse: collapse;
        }
        .timeline td {
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .timeline td:last-child {
            text-align: right;
            font-weight: 700;
        }
        .alert {
            padding: 10px 14px;
            border-radius: 10px;
            margin-bottom: 10px;
            font-weight: 700;
        }
        .alert.error {
            background: #fef2f2;
            color: #b91c1c;
            border: 1px solid #fecaca;
        }
        .alert.warning {
            background: #fffbeb;
            color: #b45309;
            border: 1px solid #fde68a;
        }
        .photo {
            width: 100%;
            max-height: 320px;
            object-fit: cover;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
        }
        .footer {
            margin-top: 28px;
            font-size: 10px;
            color: #6b7280;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="kicker">Proof of Delivery</div>
        <h1 class="title">{{ $shipment->shipment_id }}</h1>
        <div class="subtitle">
            {{ $shipment->origin_name }} ({{ $shipment->origin }}) -> {{ $shipment->destination_name }} ({{ $shipment->destination }})
        </div>
    </div>

    @if($alerts['is_delayed'])
        <div class="alert error">
            Shipment melewati ETA {{ $alerts['delay_minutes'] }} menit.
        </div>
    @endif

    @if($alerts['is_off_route'])
        <div class="alert warning">
            Driver terdeteksi keluar jalur sejauh {{ $alerts['off_route_km'] }} km.
        </div>
    @endif

    <table class="grid">
        <tr>
            <td>
                <div class="label">Driver</div>
                <div class="value">{{ $shipment->driver?->user?->name ?? 'Unassigned' }}</div>
            </td>
            <td>
                <div class="label">Penerima</div>
                <div class="value">{{ $shipment->delivery_recipient_name ?: '-' }}</div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="label">Waktu Terkirim</div>
                <div class="value">{{ optional($shipment->delivered_at)->format('d M Y H:i') ?: '-' }}</div>
            </td>
            <td>
                <div class="label">ETA</div>
                <div class="value">{{ optional($shipment->estimated_arrival)->format('d M Y H:i') ?: '-' }}</div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="label">Jarak Total</div>
                <div class="value">{{ $routeMetrics['total_km'] ? $routeMetrics['total_km'].' km' : '-' }}</div>
            </td>
            <td>
                <div class="label">Sisa Perjalanan Saat Ini</div>
                <div class="value">{{ $routeMetrics['remaining_km'] !== null ? $routeMetrics['remaining_km'].' km' : '-' }}</div>
            </td>
        </tr>
    </table>

    <div class="section">
        <div class="section-title">Catatan Serah Terima</div>
        <div class="note-box">
            {{ $shipment->delivery_note ?: 'Tidak ada catatan serah terima.' }}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Timeline Pengiriman</div>
        <table class="timeline">
            <tr><td>Diklaim Driver</td><td>{{ optional($shipment->claimed_at)->format('d M Y H:i') ?: '-' }}</td></tr>
            <tr><td>Diambil Driver</td><td>{{ optional($shipment->picked_up_at)->format('d M Y H:i') ?: '-' }}</td></tr>
            <tr><td>Dalam Perjalanan</td><td>{{ optional($shipment->in_transit_at)->format('d M Y H:i') ?: '-' }}</td></tr>
            <tr><td>Sampai Gudang Tujuan</td><td>{{ optional($shipment->arrived_at_destination_at)->format('d M Y H:i') ?: '-' }}</td></tr>
            <tr><td>Terkirim</td><td>{{ optional($shipment->delivered_at)->format('d M Y H:i') ?: '-' }}</td></tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Foto Serah Terima</div>
        @if($shipment->delivery_photo_path)
            <img class="photo" src="{{ public_path('storage/'.$shipment->delivery_photo_path) }}" alt="Proof of delivery photo">
        @else
            <div class="note-box">Foto serah terima belum tersedia.</div>
        @endif
    </div>

    <div class="footer">
        Dokumen ini dibuat otomatis oleh Aether Logistix pada {{ now()->format('d M Y H:i') }}.
    </div>
</body>
</html>
