<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Warehouse Layout Export</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #0f172a; font-size: 12px; }
        h1 { font-size: 18px; margin: 0 0 6px; }
        .meta { margin-bottom: 14px; color: #475569; }
        .chips { margin-bottom: 14px; }
        .chip { display: inline-block; border: 1px solid #cbd5e1; border-radius: 10px; padding: 4px 8px; margin-right: 6px; font-size: 11px; }
        .preview { margin: 12px 0 16px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px; background: #f8fafc; }
        .preview img { width: 100%; height: auto; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; font-size: 11px; }
        th { background: #f8fafc; }
        h2 { font-size: 13px; margin: 14px 0 8px; }
    </style>
</head>
<body>
    <h1>{{ $warehouseName }} - Layout Export</h1>
    <div class="meta">Generated at: {{ $dateLabel }}</div>
    <div class="chips">
        <span class="chip">Zona: {{ $zonesCount }}</span>
        <span class="chip">Rak: {{ $racksCount }}</span>
        <span class="chip">Occupancy: {{ $occupancy !== null ? round((float) $occupancy, 1).'%' : '-' }}</span>
        <span class="chip">Canvas: {{ data_get($canvas, 'w', '-') }} x {{ data_get($canvas, 'h', '-') }}</span>
    </div>
    @if(!empty($layoutImage))
        <div class="preview">
            <img src="{{ $layoutImage }}" alt="Layout Preview">
        </div>
    @endif

    <h2>Zones</h2>
    <table>
        <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>X</th><th>Y</th><th>W</th><th>H</th><th>Rot</th></tr></thead>
        <tbody>
        @forelse($zones as $item)
            <tr>
                <td>{{ $item['code'] ?? '-' }}</td>
                <td>{{ $item['name'] ?? '-' }}</td>
                <td>{{ $item['type'] ?? '-' }}</td>
                <td>{{ $item['x'] ?? '-' }}</td>
                <td>{{ $item['y'] ?? '-' }}</td>
                <td>{{ $item['w'] ?? '-' }}</td>
                <td>{{ $item['h'] ?? '-' }}</td>
                <td>{{ $item['rotation'] ?? 0 }}</td>
            </tr>
        @empty
            <tr><td colspan="8">No data</td></tr>
        @endforelse
        </tbody>
    </table>

    <h2>Racks</h2>
    <table>
        <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>X</th><th>Y</th><th>W</th><th>H</th><th>Rot</th></tr></thead>
        <tbody>
        @forelse($racks as $item)
            <tr>
                <td>{{ $item['code'] ?? '-' }}</td>
                <td>{{ $item['name'] ?? '-' }}</td>
                <td>{{ $item['type'] ?? '-' }}</td>
                <td>{{ $item['x'] ?? '-' }}</td>
                <td>{{ $item['y'] ?? '-' }}</td>
                <td>{{ $item['w'] ?? '-' }}</td>
                <td>{{ $item['h'] ?? '-' }}</td>
                <td>{{ $item['rotation'] ?? 0 }}</td>
            </tr>
        @empty
            <tr><td colspan="8">No data</td></tr>
        @endforelse
        </tbody>
    </table>

    <h2>Structures / Areas</h2>
    <table>
        <thead><tr><th>Code</th><th>Name</th><th>Kind</th><th>Type</th><th>X</th><th>Y</th><th>W</th><th>H</th><th>Rot</th></tr></thead>
        <tbody>
        @forelse($others as $item)
            <tr>
                <td>{{ $item['code'] ?? '-' }}</td>
                <td>{{ $item['name'] ?? '-' }}</td>
                <td>{{ $item['kind'] ?? '-' }}</td>
                <td>{{ $item['type'] ?? '-' }}</td>
                <td>{{ $item['x'] ?? '-' }}</td>
                <td>{{ $item['y'] ?? '-' }}</td>
                <td>{{ $item['w'] ?? '-' }}</td>
                <td>{{ $item['h'] ?? '-' }}</td>
                <td>{{ $item['rotation'] ?? 0 }}</td>
            </tr>
        @empty
            <tr><td colspan="9">No data</td></tr>
        @endforelse
        </tbody>
    </table>
</body>
</html>
