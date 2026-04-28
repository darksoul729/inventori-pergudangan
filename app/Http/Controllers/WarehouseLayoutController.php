<?php

namespace App\Http\Controllers;

use App\Models\LayoutSnapshot;
use App\Models\Rack;
use App\Models\Warehouse;
use App\Models\WarehouseLayoutElement;
use App\Models\WarehouseZone;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WarehouseLayoutController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $warehouse = Warehouse::orderBy('id')->first();

        if (!$warehouse) {
            return response()->json(['layout' => null]);
        }

        $zones = $warehouse->zones()
            ->with(['racks.rackStocks.product:id,sku,name'])
            ->get()
            ->map(fn (WarehouseZone $zone) => [
                'id' => $zone->id,
                'code' => strtoupper($zone->code),
                'name' => $zone->name,
                'type' => $zone->type,
                'capacity' => $zone->capacity,
                'is_active' => $zone->is_active,
                'pos_x' => $zone->pos_x,
                'pos_y' => $zone->pos_y,
                'width' => $zone->width,
                'height' => $zone->height,
                'rotation' => $zone->rotation ?? 0,
                'racks' => $zone->racks->map(fn (Rack $rack) => [
                    'id' => $rack->id,
                    'code' => strtoupper($rack->code),
                    'name' => $rack->name,
                    'rack_type' => $rack->rack_type,
                    'capacity' => $rack->capacity,
                    'status' => $rack->status,
                    'pos_x' => $rack->pos_x,
                    'pos_y' => $rack->pos_y,
                    'width' => $rack->width,
                    'height' => $rack->height,
                    'rotation' => $rack->rotation ?? 0,
                    'stocks' => $rack->rackStocks->map(fn ($stock) => [
                        'id' => $stock->id,
                        'product_id' => $stock->product_id,
                        'sku' => $stock->product?->sku,
                        'product_name' => $stock->product?->name,
                        'quantity' => $stock->quantity,
                        'reserved_quantity' => $stock->reserved_quantity,
                        'batch_number' => $stock->batch_number,
                        'expired_date' => $stock->expired_date?->format('Y-m-d'),
                        'available_quantity' => $stock->quantity - $stock->reserved_quantity,
                    ])->values(),
                ])->values(),
            ])->values();

        $elements = WarehouseLayoutElement::where('warehouse_id', $warehouse->id)
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($el) => [
                'id' => $el->id,
                'element_type' => $el->element_type,
                'name' => $el->name,
                'code' => $el->code,
                'pos_x' => $el->pos_x,
                'pos_y' => $el->pos_y,
                'width' => $el->width,
                'height' => $el->height,
                'rotation' => $el->rotation,
                'status' => $el->status,
                'metadata' => $el->metadata,
            ])->values();

        $latestSnapshot = LayoutSnapshot::where('warehouse_id', $warehouse->id)
            ->latest()
            ->first();

        return response()->json([
            'layout' => [
                'zones' => $zones,
                'elements' => $elements,
                'canvas' => $latestSnapshot?->snapshot_data['canvas'] ?? null,
                'updated_at' => $latestSnapshot?->created_at?->toIso8601String(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $warehouse = Warehouse::orderBy('id')->firstOrFail();

        $data = $request->validate([
            'zones' => ['nullable', 'array'],
            'zones.*.id' => ['required', 'integer', 'exists:warehouse_zones,id'],
            'zones.*.pos_x' => ['nullable', 'integer'],
            'zones.*.pos_y' => ['nullable', 'integer'],
            'zones.*.width' => ['nullable', 'integer', 'min:1'],
            'zones.*.height' => ['nullable', 'integer', 'min:1'],
            'zones.*.rotation' => ['nullable', 'integer', 'min:0', 'max:360'],
            'racks' => ['nullable', 'array'],
            'racks.*.id' => ['required', 'integer', 'exists:racks,id'],
            'racks.*.pos_x' => ['nullable', 'integer'],
            'racks.*.pos_y' => ['nullable', 'integer'],
            'racks.*.width' => ['nullable', 'integer', 'min:1'],
            'racks.*.height' => ['nullable', 'integer', 'min:1'],
            'racks.*.rotation' => ['nullable', 'integer', 'min:0', 'max:360'],
            'elements' => ['nullable', 'array'],
            'elements.*.element_type' => ['required', 'string', 'max:50'],
            'elements.*.name' => ['required', 'string', 'max:100'],
            'elements.*.code' => ['nullable', 'string', 'max:30'],
            'elements.*.pos_x' => ['required', 'integer'],
            'elements.*.pos_y' => ['required', 'integer'],
            'elements.*.width' => ['required', 'integer', 'min:1'],
            'elements.*.height' => ['required', 'integer', 'min:1'],
            'elements.*.rotation' => ['nullable', 'integer', 'min:0', 'max:360'],
            'elements.*.status' => ['nullable', 'string', 'max:20'],
            'canvas' => ['nullable', 'array'],
            'canvas.x' => ['nullable', 'integer'],
            'canvas.y' => ['nullable', 'integer'],
            'canvas.w' => ['nullable', 'integer', 'min:1'],
            'canvas.h' => ['nullable', 'integer', 'min:1'],
        ]);

        // Update zone positions
        foreach ($data['zones'] ?? [] as $zoneData) {
            WarehouseZone::where('id', $zoneData['id'])->where('warehouse_id', $warehouse->id)->update([
                'pos_x' => $zoneData['pos_x'] ?? null,
                'pos_y' => $zoneData['pos_y'] ?? null,
                'width' => $zoneData['width'] ?? null,
                'height' => $zoneData['height'] ?? null,
                'rotation' => $zoneData['rotation'] ?? 0,
            ]);
        }

        // Update rack positions
        foreach ($data['racks'] ?? [] as $rackData) {
            Rack::where('id', $rackData['id'])->update([
                'pos_x' => $rackData['pos_x'] ?? null,
                'pos_y' => $rackData['pos_y'] ?? null,
                'width' => $rackData['width'] ?? null,
                'height' => $rackData['height'] ?? null,
                'rotation' => $rackData['rotation'] ?? 0,
            ]);
        }

        // Sync elements (delete old, create new)
        WarehouseLayoutElement::where('warehouse_id', $warehouse->id)->delete();
        foreach ($data['elements'] ?? [] as $index => $elData) {
            WarehouseLayoutElement::create([
                'warehouse_id' => $warehouse->id,
                'element_type' => $elData['element_type'],
                'name' => $elData['name'],
                'code' => $elData['code'] ?? null,
                'pos_x' => $elData['pos_x'],
                'pos_y' => $elData['pos_y'],
                'width' => $elData['width'],
                'height' => $elData['height'],
                'rotation' => $elData['rotation'] ?? 0,
                'status' => $elData['status'] ?? 'active',
                'metadata' => $elData['metadata'] ?? null,
                'sort_order' => $index,
            ]);
        }

        // Create snapshot
        LayoutSnapshot::create([
            'warehouse_id' => $warehouse->id,
            'user_id' => Auth::id(),
            'name' => 'Auto save',
            'snapshot_data' => [
                'zones' => $data['zones'] ?? [],
                'racks' => $data['racks'] ?? [],
                'elements' => $data['elements'] ?? [],
                'canvas' => $data['canvas'] ?? null,
            ],
            'action_type' => 'manual',
        ]);

        return response()->json(['message' => 'Layout saved successfully.']);
    }

    public function snapshots(Request $request): JsonResponse
    {
        $warehouse = Warehouse::orderBy('id')->first();
        if (!$warehouse) {
            return response()->json(['snapshots' => []]);
        }

        $snapshots = LayoutSnapshot::where('warehouse_id', $warehouse->id)
            ->with('user:id,name')
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn ($snap) => [
                'id' => $snap->id,
                'name' => $snap->name,
                'action_type' => $snap->action_type,
                'user_name' => $snap->user?->name ?? 'System',
                'created_at' => $snap->created_at->toIso8601String(),
            ]);

        return response()->json(['snapshots' => $snapshots]);
    }

    public function exportPdf(Request $request)
    {
        $data = $request->validate([
            'warehouse_name' => ['nullable', 'string', 'max:255'],
            'occupancy' => ['nullable', 'numeric'],
            'zones_count' => ['nullable', 'integer'],
            'racks_count' => ['nullable', 'integer'],
            'layout_image' => ['nullable', 'string'],
            'items' => ['required', 'array'],
            'items.*.kind' => ['required', 'string'],
            'items.*.type' => ['nullable', 'string'],
            'items.*.name' => ['required', 'string'],
            'items.*.code' => ['nullable', 'string'],
            'items.*.x' => ['required', 'numeric'],
            'items.*.y' => ['required', 'numeric'],
            'items.*.w' => ['required', 'numeric'],
            'items.*.h' => ['required', 'numeric'],
            'items.*.rotation' => ['nullable', 'numeric'],
            'canvas' => ['nullable', 'array'],
            'canvas.w' => ['nullable', 'numeric'],
            'canvas.h' => ['nullable', 'numeric'],
        ]);

        $grouped = collect($data['items'])->groupBy('kind');
        $warehouseName = $data['warehouse_name'] ?? 'Warehouse';
        $dateLabel = now()->format('d M Y H:i');

        $html = view('reports.warehouse_layout_export', [
            'warehouseName' => $warehouseName,
            'dateLabel' => $dateLabel,
            'occupancy' => $data['occupancy'] ?? null,
            'zonesCount' => $data['zones_count'] ?? $grouped->get('zone', collect())->count(),
            'racksCount' => $data['racks_count'] ?? $grouped->get('rack', collect())->count(),
            'layoutImage' => $data['layout_image'] ?? null,
            'canvas' => $data['canvas'] ?? null,
            'zones' => $grouped->get('zone', collect())->values(),
            'racks' => $grouped->get('rack', collect())->values(),
            'others' => $grouped->except(['zone', 'rack'])->flatten(1)->values(),
        ])->render();

        $pdf = Pdf::loadHTML($html)->setPaper('a4', 'portrait');
        $filename = 'warehouse-layout-'.now()->format('Ymd-His').'.pdf';

        return $pdf->download($filename);
    }
}
