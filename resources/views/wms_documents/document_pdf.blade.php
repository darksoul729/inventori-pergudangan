<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>{{ $document['title'] }} {{ $document['number'] }}</title>
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
            margin-bottom: 14px;
        }

        .eyebrow {
            color: #4f46e5;
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        h1 {
            margin: 3px 0;
            font-size: 22px;
        }

        .muted {
            color: #6b7280;
        }

        .grid {
            width: 100%;
            margin-bottom: 14px;
        }

        .box {
            border: 1px solid #e5e7eb;
            background: #f9fafb;
            padding: 9px;
        }

        .label {
            color: #6b7280;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: .5px;
        }

        .value {
            margin-top: 3px;
            font-size: 12px;
            font-weight: bold;
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

        .right {
            text-align: right;
        }

        .section-title {
            margin: 14px 0 7px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: .6px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="eyebrow">Warehouse Management System</div>
        <h1>{{ $document['title'] }}</h1>
        <div class="muted">{{ $document['subtitle'] ?? 'Dokumen operasional gudang' }}</div>
        <div style="margin-top: 8px;">
            <strong>No. Dokumen:</strong> {{ $document['number'] }} |
            <strong>Status:</strong> {{ $document['status'] ?? '-' }} |
            <strong>Dibuat:</strong> {{ $generatedAt->format('d M Y H:i') }}
        </div>
    </div>

    <table class="grid">
        <tr>
            @foreach ($document['stats'] as $stat)
                <td class="box" style="width: {{ floor(100 / max(1, count($document['stats']))) }}%;">
                    <div class="label">{{ $stat['label'] }}</div>
                    <div class="value">{{ $stat['value'] }}</div>
                </td>
            @endforeach
        </tr>
    </table>

    <div class="section-title">Rincian Dokumen</div>
    <table>
        <tbody>
            @foreach ($document['details'] as $detail)
                <tr>
                    <td style="width: 22%; font-weight: bold;">{{ $detail['label'] }}</td>
                    <td>{{ $detail['value'] ?: '-' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title">Item Dokumen</div>
    <table>
        <thead>
            <tr>
                @foreach ($document['columns'] as $column)
                    <th class="{{ ($column['align'] ?? '') === 'right' ? 'right' : '' }}">{{ $column['label'] }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @forelse ($document['rows'] as $row)
                <tr>
                    @foreach ($document['columns'] as $column)
                        <td class="{{ ($column['align'] ?? '') === 'right' ? 'right' : '' }}">{{ $row[$column['key']] ?? '-' }}</td>
                    @endforeach
                </tr>
            @empty
                <tr>
                    <td colspan="{{ count($document['columns']) }}" style="text-align: center; padding: 18px;" class="muted">
                        Tidak ada item.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
