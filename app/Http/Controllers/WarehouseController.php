<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Rack;
use App\Models\RackStock;
use App\Models\StockMovement;
use App\Models\Warehouse;
use App\Models\WarehouseZone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseController extends Controller
{
    public function index(Request $request): Response
    {
        $warehouse = Warehouse::query()
            ->with([
                'zones.racks.rackStocks.product:id,sku,name',
                'stockMovements' => fn ($query) => $query
                    ->with(['product:id,sku,name', 'user:id,name'])
                    ->latest('movement_date')
                    ->limit(8),
            ])
            ->firstOrFail();

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

        $rackStock = RackStock::query()->updateOrCreate(
            ['rack_id' => $data['rack_id'], 'product_id' => $data['product_id']],
            [
                'quantity' => $data['quantity'],
                'reserved_quantity' => $data['reserved_quantity'],
                'batch_number' => $data['batch_number'] ?? null,
                'expired_date' => $data['expired_date'] ?? null,
                'last_updated_at' => now(),
            ]
        );

        $this->recordRackStockMovement(
            request: $request,
            rack: $rack,
            productId: (int) $data['product_id'],
            previousQuantity: (int) ($existingRackStock?->quantity ?? 0),
            newQuantity: (int) $data['quantity'],
            notes: 'Rack stock assigned to '.$rack->code,
        );

        $this->syncProductStockForRack($rackStock->rack);

        return redirect()->route('warehouse', [
            'zone' => $rackStock->rack->warehouse_zone_id,
            'rack' => $rackStock->rack_id,
        ])->with('status', 'Rack stock saved.');
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

        $rackStock->update([
            'quantity' => $data['quantity'],
            'reserved_quantity' => $data['reserved_quantity'],
            'batch_number' => $data['batch_number'] ?? null,
            'expired_date' => $data['expired_date'] ?? null,
            'last_updated_at' => now(),
        ]);

        $this->recordRackStockMovement(
            request: $request,
            rack: $rackStock->rack,
            productId: (int) $rackStock->product_id,
            previousQuantity: $previousQuantity,
            newQuantity: (int) $data['quantity'],
            notes: 'Rack stock updated on '.$rackStock->rack->code,
        );

        $this->syncProductStockForRack($rackStock->rack);

        return redirect()->route('warehouse', [
            'zone' => $rackStock->rack->warehouse_zone_id,
            'rack' => $rackStock->rack_id,
        ])->with('status', 'Rack stock updated.');
    }

    public function destroyRackStock(RackStock $rackStock): RedirectResponse
    {
        $rack = $rackStock->rack;
        $zoneId = $rack->warehouse_zone_id;
        $rackId = $rack->id;
        $productId = (int) $rackStock->product_id;
        $previousQuantity = (int) $rackStock->quantity;

        $rackStock->delete();
        $this->recordRackStockMovement(
            request: request(),
            rack: $rack,
            productId: $productId,
            previousQuantity: $previousQuantity,
            newQuantity: 0,
            notes: 'Rack stock removed from '.$rack->code,
        );
        $this->syncProductStockForRack($rack);

        return redirect()->route('warehouse', ['zone' => $zoneId, 'rack' => $rackId])->with('status', 'Rack stock deleted.');
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
                    'expired_date' => $stock->expired_date?->toDateString(),
                    'available_quantity' => $stock->quantity - $stock->reserved_quantity,
                ]),
        ];
    }

    private function syncProductStockForRack(Rack $rack): void
    {
        $rack->loadMissing('zone.warehouse', 'zone.warehouse.productStocks', 'zone.racks.rackStocks');

        $warehouse = $rack->zone->warehouse;

        $totals = $warehouse->zones
            ->flatMap->racks
            ->flatMap->rackStocks
            ->groupBy('product_id')
            ->map(function ($stocks, $productId) use ($warehouse) {
                return [
                    'product_id' => (int) $productId,
                    'warehouse_id' => $warehouse->id,
                    'current_stock' => $stocks->sum('quantity'),
                    'reserved_stock' => $stocks->sum('reserved_quantity'),
                    'last_updated_at' => now(),
                ];
            });

        foreach ($totals as $row) {
            $warehouse->productStocks()->updateOrCreate(
                ['product_id' => $row['product_id']],
                $row
            );
        }

        $warehouse->productStocks()
            ->whereNotIn('product_id', $totals->keys()->map(fn ($id) => (int) $id)->all())
            ->delete();
    }

    private function ensureRackCapacity(Rack $rack, int $incomingQuantity, int $productId): void
    {
        $currentOtherQuantity = $rack->rackStocks
            ->reject(fn ($stock) => (int) $stock->product_id === $productId)
            ->sum('quantity');

        if (($currentOtherQuantity + $incomingQuantity) > $rack->capacity) {
            throw ValidationException::withMessages([
                'quantity' => 'Quantity exceeds rack capacity. Reduce the amount or increase rack capacity first.',
            ]);
        }
    }

    private function recordRackStockMovement(
        Request $request,
        Rack $rack,
        int $productId,
        int $previousQuantity,
        int $newQuantity,
        string $notes,
    ): void {
        if ($previousQuantity === $newQuantity) {
            return;
        }

        $rack->loadMissing('zone.warehouse');

        $stockBefore = $rack->zone->warehouse->productStocks()
            ->where('product_id', $productId)
            ->value('current_stock') ?? 0;

        $delta = $newQuantity - $previousQuantity;
        $stockAfter = $stockBefore + $delta;

        StockMovement::query()->create([
            'product_id' => $productId,
            'warehouse_id' => $rack->zone->warehouse->id,
            'movement_type' => 'adjustment',
            'reference_type' => Str::lower(str_replace(' ', '_', $rack->code)),
            'reference_id' => $rack->id,
            'quantity' => abs($delta),
            'stock_before' => $stockBefore,
            'stock_after' => $stockAfter,
            'movement_date' => now(),
            'notes' => $notes,
            'created_by' => $request->user()->id,
        ]);
    }

    private function zoneAccent(string $type, int $index): array
    {
        $palettes = [
            'high_pick' => ['text' => 'text-[#4338ca]', 'badge' => 'bg-[#eef2ff] text-[#4338ca]', 'bar' => '#4338ca'],
            'bulk_storage' => ['text' => 'text-[#1a202c]', 'badge' => 'bg-[#f1f5f9] text-gray-500', 'bar' => '#93c5fd'],
            'electronics' => ['text' => 'text-[#1a202c]', 'badge' => 'bg-[#f1f5f9] text-gray-500', 'bar' => '#4f46e5'],
            'cross_dock' => ['text' => 'text-[#1a202c]', 'badge' => 'bg-[#f1f5f9] text-gray-500', 'bar' => '#cbd5e1'],
            'hazmat' => ['text' => 'text-[#ef4444]', 'badge' => 'bg-[#fef2f2] text-[#ef4444]', 'bar' => '#ef4444'],
        ];

        $fallbacks = [
            ['text' => 'text-[#4338ca]', 'badge' => 'bg-[#eef2ff] text-[#4338ca]', 'bar' => '#4338ca'],
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
