<?php

namespace App\Http\Controllers;

use App\Models\LayoutSnapshot;
use App\Models\Product;
use App\Models\Rack;
use App\Models\RackStock;
use App\Models\StockAdjustment;
use App\Models\StockAdjustmentItem;
use App\Models\StockMovement;
use App\Models\Warehouse;
use App\Models\WarehouseLayoutElement;
use App\Models\WarehouseZone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

use App\Traits\HandlesStockSync;

class WarehouseController extends Controller
{
    use HandlesStockSync;

    public function index(Request $request): Response
    {
        $warehouse = Warehouse::orderBy('id')->first() ?? Warehouse::query()->create([
                'code' => 'MAIN',
                'name' => 'Gudang Utama',
                'location' => 'Main Warehouse',
                'description' => 'Default single warehouse',
            ]);

        $warehouse->load([
                'zones.racks.rackStocks.product:id,sku,name',
                'stockMovements' => fn ($query) => $query
                    ->with(['product:id,sku,name', 'user:id,name'])
                    ->latest('movement_date')
                    ->limit(8),
            ]);

        $selectedZone = $warehouse->zones
            ->firstWhere('id', (int) $request->integer('zone'))
            ?? $warehouse->zones->sortBy('code')->first();

        $selectedRack = $selectedZone?->racks
            ->firstWhere('id', (int) $request->integer('rack'))
            ?? $selectedZone?->racks->sortBy('code')->first();

        $zoneSummaries = $warehouse->zones
            ->sortBy('code')
            ->values()
            ->map(fn (WarehouseZone $zone, int $index) => $this->mapZoneSummary($zone, $index));

        $rackSummaries = $warehouse->zones
            ->flatMap(fn (WarehouseZone $zone) => $zone->racks->map(fn (Rack $rack) => $this->mapRackSummary($rack, $zone)))
            ->sortByDesc('occupancy')
            ->values();

        $activityLog = $warehouse->stockMovements
            ->sortByDesc('movement_date')
            ->values()
            ->map(function ($movement) {
                return [
                    'id' => $movement->id,
                    'title' => $this->movementTitle($movement->movement_type, $movement->product?->name),
                    'location' => Str::upper(str_replace('_', ' ', $movement->reference_type)),
                    'time' => $movement->movement_date?->format('d M Y, H:i'),
                    'operator' => $movement->user?->name ?? 'System',
                    'quantity' => $movement->quantity,
                    'notes' => $movement->notes,
                    'type' => $movement->movement_type,
                ];
            });

        $warehouseSummary = [
            'name' => $warehouse->name,
            'location' => $warehouse->location,
            'total_zones' => $zoneSummaries->count(),
            'total_racks' => $rackSummaries->count(),
            'total_items' => $rackSummaries->sum('items'),
            'total_capacity' => $zoneSummaries->sum('capacity'),
            'occupancy' => $zoneSummaries->sum('capacity') > 0
                ? round(($zoneSummaries->sum('used') / $zoneSummaries->sum('capacity')) * 100)
                : 0,
        ];

        $savedLayout = null;
        $latestSnapshot = LayoutSnapshot::where('warehouse_id', $warehouse->id)->latest()->first();
        if ($latestSnapshot) {
            $savedLayout = [
                'zones' => $latestSnapshot->snapshot_data['zones'] ?? [],
                'racks' => $latestSnapshot->snapshot_data['racks'] ?? [],
                'elements' => $latestSnapshot->snapshot_data['elements'] ?? [],
                'canvas' => $latestSnapshot->snapshot_data['canvas'] ?? null,
            ];
        }

        $pendingManualAdjustments = StockAdjustment::query()
            ->with(['creator:id,name,email', 'items:id,stock_adjustment_id,quantity'])
            ->where('warehouse_id', $warehouse->id)
            ->where('status', 'pending')
            ->where('reason', 'manual_rack_stock')
            ->latest('created_at')
            ->limit(10)
            ->get()
            ->map(fn (StockAdjustment $adjustment) => [
                'id' => $adjustment->id,
                'number' => $adjustment->adjustment_number,
                'date_label' => $adjustment->adjustment_date?->format('d M Y') ?? $adjustment->created_at?->format('d M Y'),
                'created_at_label' => $adjustment->created_at?->format('d M Y H:i'),
                'operator' => $adjustment->creator?->name ?? 'System',
                'items_count' => $adjustment->items->count(),
                'total_quantity' => (int) $adjustment->items->sum('quantity'),
            ])
            ->values();

        return Inertia::render('Warehouse', [
            'warehouse' => $warehouseSummary,
            'zoneSummaries' => $zoneSummaries,
            'rackSummaries' => $rackSummaries,
            'activityLog' => $activityLog,
            'selectedZone' => $selectedZone ? $this->mapSelectedZone($selectedZone) : null,
            'selectedRack' => $selectedRack ? $this->mapSelectedRack($selectedRack, $selectedZone) : null,
            'zoneOptions' => $warehouse->zones
                ->sortBy('code')
                ->values()
                ->map(fn (WarehouseZone $zone) => [
                    'id' => $zone->id,
                    'label' => $zone->code.' - '.$zone->name,
                ]),
            'productOptions' => Product::query()
                ->orderBy('name')
                ->get(['id', 'sku', 'name'])
                ->map(fn (Product $product) => [
                    'id' => $product->id,
                    'label' => $product->sku.' - '.$product->name,
                ]),
            'status' => session('status'),
            'savedLayout' => $savedLayout,
            'pendingManualAdjustments' => $pendingManualAdjustments,
        ]);
    }

    public function storeZone(Request $request): RedirectResponse
    {
        $warehouse = Warehouse::query()->firstOrFail();

        $data = $request->validate([
            'code' => ['required', 'string', 'max:30'],
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', 'string', 'max:50'],
            'capacity' => ['required', 'integer', 'min:1'],
            'description' => ['nullable', 'string'],
        ]);

        WarehouseZone::query()->create([
            'warehouse_id' => $warehouse->id,
            'code' => Str::upper($data['code']),
            'name' => $data['name'],
            'type' => $data['type'],
            'capacity' => $data['capacity'],
            'description' => $data['description'] ?? null,
            'is_active' => true,
        ]);

        return redirect()->route('warehouse')->with('status', 'Zone created.');
    }

    public function updateZone(Request $request, WarehouseZone $zone): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:30'],
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', 'string', 'max:50'],
            'capacity' => ['required', 'integer', 'min:1'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $zone->update([
            'code' => Str::upper($data['code']),
            'name' => $data['name'],
            'type' => $data['type'],
            'capacity' => $data['capacity'],
            'description' => $data['description'] ?? null,
            'is_active' => (bool) ($data['is_active'] ?? false),
        ]);

        return redirect()->route('warehouse', ['zone' => $zone->id])->with('status', 'Zone updated.');
    }

    public function destroyZone(WarehouseZone $zone): RedirectResponse
    {
        if ($zone->racks()->exists()) {
            return redirect()->route('warehouse', ['zone' => $zone->id])->with('status', 'Zone cannot be deleted while racks still exist.');
        }

        $zone->delete();

        return redirect()->route('warehouse')->with('status', 'Zone deleted.');
    }

    public function storeRack(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'warehouse_zone_id' => ['required', 'exists:warehouse_zones,id'],
            'code' => ['required', 'string', 'max:30'],
            'name' => ['required', 'string', 'max:100'],
            'rack_type' => ['required', 'string', 'max:50'],
            'capacity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string'],
        ]);

        $rack = Rack::query()->create([
            'warehouse_zone_id' => $data['warehouse_zone_id'],
            'code' => Str::upper($data['code']),
            'name' => $data['name'],
            'rack_type' => $data['rack_type'],
            'capacity' => $data['capacity'],
            'status' => 'active',
            'notes' => $data['notes'] ?? null,
        ]);

        return redirect()->route('warehouse', ['zone' => $rack->warehouse_zone_id, 'rack' => $rack->id])->with('status', 'Rack created.');
    }

    public function updateRack(Request $request, Rack $rack): RedirectResponse
    {
        $data = $request->validate([
            'warehouse_zone_id' => ['required', 'exists:warehouse_zones,id'],
            'code' => ['required', 'string', 'max:30'],
            'name' => ['required', 'string', 'max:100'],
            'rack_type' => ['required', 'string', 'max:50'],
            'capacity' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'string', 'max:20'],
            'notes' => ['nullable', 'string'],
        ]);

        $rack->update([
            'warehouse_zone_id' => $data['warehouse_zone_id'],
            'code' => Str::upper($data['code']),
            'name' => $data['name'],
            'rack_type' => $data['rack_type'],
            'capacity' => $data['capacity'],
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
        ]);

        return redirect()->route('warehouse', ['zone' => $rack->warehouse_zone_id, 'rack' => $rack->id])->with('status', 'Rack updated.');
    }

    public function destroyRack(Rack $rack): RedirectResponse
    {
        $zoneId = $rack->warehouse_zone_id;

        if ($rack->rackStocks()->exists()) {
            return redirect()->route('warehouse', ['zone' => $zoneId, 'rack' => $rack->id])->with('status', 'Rack cannot be deleted while stock items still exist.');
        }

        $rack->delete();

        return redirect()->route('warehouse', ['zone' => $zoneId])->with('status', 'Rack deleted.');
    }

    public function storeRackStock(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'rack_id' => ['required', 'exists:racks,id'],
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:0'],
            'reserved_quantity' => ['required', 'integer', 'min:0'],
            'batch_number' => ['nullable', 'string', 'max:100'],
            'expired_date' => ['nullable', 'date'],
        ]);

        $rack = Rack::query()->with('rackStocks')->findOrFail($data['rack_id']);
        $existingRackStock = RackStock::query()
            ->where('rack_id', $data['rack_id'])
            ->where('product_id', $data['product_id'])
            ->first();

        $this->ensureRackCapacity($rack, (int) $data['quantity'], (int) $data['product_id']);
        $delta = (int) $data['quantity'] - (int) ($existingRackStock?->quantity ?? 0);
        if ($delta === 0) {
            return redirect()->route('warehouse', [
                'zone' => $rack->warehouse_zone_id,
                'rack' => $rack->id,
            ])->with('status', 'Tidak ada perubahan qty untuk disimpan.');
        }

        $this->createPendingRackStockAdjustment(
            request: $request,
            rack: $rack,
            productId: (int) $data['product_id'],
            fromQuantity: (int) ($existingRackStock?->quantity ?? 0),
            toQuantity: (int) $data['quantity'],
            reservedQuantity: (int) $data['reserved_quantity'],
            batchNumber: $data['batch_number'] ?? null,
            expiredDate: $data['expired_date'] ?? null,
            action: 'set',
        );

        return redirect()->route('warehouse', [
            'zone' => $rack->warehouse_zone_id,
            'rack' => $rack->id,
        ])->with('status', 'Permintaan koreksi stok dibuat dan menunggu persetujuan.');
    }

    public function updateRackStock(Request $request, RackStock $rackStock): RedirectResponse
    {
        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:0'],
            'reserved_quantity' => ['required', 'integer', 'min:0'],
            'batch_number' => ['nullable', 'string', 'max:100'],
            'expired_date' => ['nullable', 'date'],
        ]);

        $rackStock->loadMissing('rack.rackStocks');
        $this->ensureRackCapacity($rackStock->rack, (int) $data['quantity'], (int) $rackStock->product_id);
        $previousQuantity = (int) $rackStock->quantity;
        $delta = (int) $data['quantity'] - $previousQuantity;
        if ($delta === 0) {
            return redirect()->route('warehouse', [
                'zone' => $rackStock->rack->warehouse_zone_id,
                'rack' => $rackStock->rack_id,
            ])->with('status', 'Tidak ada perubahan qty untuk disimpan.');
        }

        $this->createPendingRackStockAdjustment(
            request: $request,
            rack: $rackStock->rack,
            productId: (int) $rackStock->product_id,
            fromQuantity: $previousQuantity,
            toQuantity: (int) $data['quantity'],
            reservedQuantity: (int) $data['reserved_quantity'],
            batchNumber: $data['batch_number'] ?? null,
            expiredDate: $data['expired_date'] ?? null,
            action: 'set',
        );

        return redirect()->route('warehouse', [
            'zone' => $rackStock->rack->warehouse_zone_id,
            'rack' => $rackStock->rack_id,
        ])->with('status', 'Permintaan koreksi stok dibuat dan menunggu persetujuan.');
    }

    public function destroyRackStock(RackStock $rackStock): RedirectResponse
    {
        $rack = $rackStock->rack;
        $zoneId = $rack->warehouse_zone_id;
        $rackId = $rack->id;
        $productId = (int) $rackStock->product_id;
        $previousQuantity = (int) $rackStock->quantity;
        if ($previousQuantity <= 0) {
            return redirect()->route('warehouse', ['zone' => $zoneId, 'rack' => $rackId])->with('status', 'Rack stock sudah kosong.');
        }

        $this->createPendingRackStockAdjustment(
            request: request(),
            rack: $rack,
            productId: $productId,
            fromQuantity: $previousQuantity,
            toQuantity: 0,
            reservedQuantity: 0,
            batchNumber: $rackStock->batch_number,
            expiredDate: $rackStock->expired_date?->format('Y-m-d'),
            action: 'delete',
        );

        return redirect()->route('warehouse', ['zone' => $zoneId, 'rack' => $rackId])->with('status', 'Permintaan penghapusan stok dikirim untuk persetujuan.');
    }

    private function createPendingRackStockAdjustment(
        Request $request,
        Rack $rack,
        int $productId,
        int $fromQuantity,
        int $toQuantity,
        int $reservedQuantity,
        ?string $batchNumber,
        ?string $expiredDate,
        string $action = 'set',
    ): void {
        DB::transaction(function () use (
            $request,
            $rack,
            $productId,
            $fromQuantity,
            $toQuantity,
            $reservedQuantity,
            $batchNumber,
            $expiredDate,
            $action,
        ) {
            $delta = $toQuantity - $fromQuantity;

            $adjustment = StockAdjustment::create([
                'adjustment_number' => 'ADJ-' . now()->format('Ymd-His') . '-' . strtoupper(Str::random(4)),
                'warehouse_id' => (int) $rack->zone->warehouse_id,
                'adjustment_date' => now()->toDateString(),
                'status' => 'pending',
                'reason' => 'manual_rack_stock',
                'notes' => 'Pending manual rack stock correction on '.$rack->code,
                'created_by' => $request->user()->id,
            ]);

            $meta = [
                'source' => 'manual_rack_stock',
                'action' => $action,
                'rack_id' => (int) $rack->id,
                'product_id' => $productId,
                'from_quantity' => $fromQuantity,
                'to_quantity' => $toQuantity,
                'reserved_quantity' => max(0, min($reservedQuantity, $toQuantity)),
                'batch_number' => $batchNumber,
                'expired_date' => $expiredDate,
            ];

            StockAdjustmentItem::create([
                'stock_adjustment_id' => $adjustment->id,
                'product_id' => $productId,
                'adjustment_type' => $delta >= 0 ? 'in' : 'out',
                'quantity' => abs($delta),
                'note' => 'MANUAL_RACK_STOCK::'.json_encode($meta),
            ]);
        });
    }

    private function mapZoneSummary(WarehouseZone $zone, int $index): array
    {
        $used = $zone->racks->sum(fn ($rack) => $rack->rackStocks->sum('quantity'));
        $capacity = $zone->capacity > 0 ? $zone->capacity : $zone->racks->sum('capacity');
        $occupancy = $capacity > 0 ? round(($used / $capacity) * 100) : 0;

        return [
            'id' => $zone->id,
            'code' => strtoupper($zone->code),
            'name' => $zone->name,
            'type' => Str::upper(str_replace('_', '-', $zone->type)),
            'used' => $used,
            'capacity' => $capacity,
            'occupancy' => $occupancy,
            'rack_count' => $zone->racks->count(),
            'is_active' => $zone->is_active,
            'accent' => $this->zoneAccent($zone->type, $index),
        ];
    }

    private function mapRackSummary(Rack $rack, WarehouseZone $zone): array
    {
        $items = $rack->rackStocks->sum('quantity');
        $skus = $rack->rackStocks->where('quantity', '>', 0)->unique('product_id')->count();
        $capacity = max($rack->capacity, 1);

        return [
            'id' => $rack->id,
            'code' => strtoupper($rack->code),
            'name' => $rack->name,
            'zone_id' => $zone->id,
            'zone_code' => strtoupper($zone->code),
            'zone_name' => $zone->name,
            'rack_type' => Str::upper(str_replace('_', ' ', $rack->rack_type)),
            'status' => $rack->status,
            'items' => $items,
            'skus' => $skus,
            'capacity' => $rack->capacity,
            'occupancy' => round(($items / $capacity) * 100),
            'top_products' => $rack->rackStocks
                ->sortByDesc('quantity')
                ->take(3)
                ->map(fn ($stock) => [
                    'sku' => $stock->product?->sku,
                    'name' => $stock->product?->name,
                    'quantity' => $stock->quantity,
                ])
                ->values(),
        ];
    }

    private function mapSelectedZone(WarehouseZone $zone): array
    {
        $used = $zone->racks->sum(fn ($rack) => $rack->rackStocks->sum('quantity'));

        return [
            'id' => $zone->id,
            'code' => strtoupper($zone->code),
            'name' => $zone->name,
            'type' => $zone->type,
            'capacity' => $zone->capacity,
            'used' => $used,
            'description' => $zone->description,
            'is_active' => $zone->is_active,
            'racks' => $zone->racks
                ->sortBy('code')
                ->values()
                ->map(fn (Rack $rack) => $this->mapRackSummary($rack, $zone)),
        ];
    }

    private function mapSelectedRack(Rack $rack, ?WarehouseZone $zone): array
    {
        $currentZone = $zone ?? $rack->zone;

        return [
            'id' => $rack->id,
            'warehouse_zone_id' => $rack->warehouse_zone_id,
            'code' => strtoupper($rack->code),
            'name' => $rack->name,
            'rack_type' => $rack->rack_type,
            'capacity' => $rack->capacity,
            'status' => $rack->status,
            'notes' => $rack->notes,
            'summary' => $this->mapRackSummary($rack, $currentZone),
            'stocks' => $rack->rackStocks
                ->sortBy(fn ($stock) => $stock->product?->name)
                ->values()
                ->map(fn (RackStock $stock) => [
                    'id' => $stock->id,
                    'product_id' => $stock->product_id,
                    'sku' => $stock->product?->sku,
                    'product_name' => $stock->product?->name,
                    'quantity' => $stock->quantity,
                    'reserved_quantity' => $stock->reserved_quantity,
                    'batch_number' => $stock->batch_number,
                    'expired_date' => $stock->expired_date?->format('Y-m-d'),
                    'available_quantity' => $stock->quantity - $stock->reserved_quantity,
                ]),
        ];
    }


    private function zoneAccent(string $type, int $index): array
    {
        $palettes = [
            'high_pick' => ['text' => 'text-[#28106F]', 'badge' => 'bg-[#EDE8FC] text-[#28106F]', 'bar' => '#28106F'],
            'bulk_storage' => ['text' => 'text-[#28106F]', 'badge' => 'bg-[#f1f5f9] text-gray-500', 'bar' => '#93c5fd'],
            'electronics' => ['text' => 'text-[#28106F]', 'badge' => 'bg-[#f1f5f9] text-gray-500', 'bar' => '#5932C9'],
            'cross_dock' => ['text' => 'text-[#28106F]', 'badge' => 'bg-[#f1f5f9] text-gray-500', 'bar' => '#cbd5e1'],
            'hazmat' => ['text' => 'text-[#ef4444]', 'badge' => 'bg-[#fef2f2] text-[#ef4444]', 'bar' => '#ef4444'],
        ];

        $fallbacks = [
            ['text' => 'text-[#28106F]', 'badge' => 'bg-[#EDE8FC] text-[#28106F]', 'bar' => '#28106F'],
            ['text' => 'text-[#0f766e]', 'badge' => 'bg-[#ecfeff] text-[#0f766e]', 'bar' => '#14b8a6'],
            ['text' => 'text-[#9a3412]', 'badge' => 'bg-[#fff7ed] text-[#9a3412]', 'bar' => '#f97316'],
        ];

        return $palettes[$type] ?? $fallbacks[$index % count($fallbacks)];
    }

    private function movementTitle(string $type, ?string $productName): string
    {
        return match ($type) {
            'in' => 'Inbound - '.($productName ?? 'Stock Received'),
            'out' => 'Outbound - '.($productName ?? 'Stock Released'),
            'transfer' => 'Transfer - '.($productName ?? 'Warehouse Transfer'),
            'adjustment' => 'Adjustment - '.($productName ?? 'Stock Corrected'),
            'opname' => 'Audit - '.($productName ?? 'Stock Count'),
            default => Str::headline($type).' - '.($productName ?? 'Warehouse Activity'),
        };
    }
}
