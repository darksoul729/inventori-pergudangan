<?php

namespace App\Traits;

use App\Models\Product;
use App\Models\ProductStock;
use App\Models\RackStock;
use App\Models\Shipment;
use App\Models\StockMovement;
use App\Models\StockOut;
use App\Models\StockOutItem;
use App\Models\Warehouse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

trait HandlesShipmentStock
{
    /**
     * Reserve stock for shipment items (increment reserved_stock on ProductStock + RackStock).
     */
    protected function reserveShipmentStock(array $itemsData): void
    {
        $warehouse = Warehouse::first();

        if (!$warehouse) {
            return;
        }

        $warehouseId = $warehouse->id;

        foreach ($itemsData as $item) {
            $productId = $item['product_id'] ?? null;
            $quantity = (int) ($item['quantity'] ?? 0);

            if (!$productId || $quantity <= 0) {
                continue;
            }

            // Check available stock
            $productStock = ProductStock::where('warehouse_id', $warehouseId)
                ->where('product_id', $productId)
                ->first();

            $availableStock = $productStock
                ? ($productStock->current_stock - $productStock->reserved_stock)
                : 0;

            if ($availableStock < $quantity) {
                $productName = $item['product_name'] ?? "ID:$productId";
                throw ValidationException::withMessages([
                    'items' => "Stok tidak cukup untuk {$productName}. Tersedia: {$availableStock}, Diminta: {$quantity}.",
                ]);
            }

            // Reserve on ProductStock
            ProductStock::where('warehouse_id', $warehouseId)
                ->where('product_id', $productId)
                ->increment('reserved_stock', $quantity);

            // Reserve on RackStock (FEFO: prioritize items expiring soonest)
            $rackStocks = RackStock::where('product_id', $productId)
                ->whereHas('rack.zone', fn ($q) => $q->where('warehouse_id', $warehouseId))
                ->where('quantity', '>', 0)
                ->orderByRaw('CASE WHEN expired_date IS NULL THEN 1 ELSE 0 END')
                ->orderBy('expired_date', 'asc')
                ->get();

            $remaining = $quantity;
            $totalAvailable = $rackStocks->sum('quantity') - $rackStocks->sum('reserved_quantity');

            if ($totalAvailable < $quantity) {
                $sourceRackLabels = $rackStocks
                    ->loadMissing('rack.zone')
                    ->map(function ($stock) {
                        $zoneCode = $stock->rack?->zone?->code ? strtoupper($stock->rack->zone->code).'/' : '';
                        $rackCode = $stock->rack?->code ? strtoupper($stock->rack->code) : '-';
                        $available = max(0, (int) $stock->quantity - (int) $stock->reserved_quantity);
                        return "{$zoneCode}{$rackCode}:{$available}";
                    })
                    ->take(6)
                    ->implode(', ');

                $productName = $item['product_name'] ?? "ID:$productId";
                throw ValidationException::withMessages([
                    'items' => "Stok rack tidak cukup untuk {$productName}. Tersedia di rack: {$totalAvailable}, diminta: {$quantity}. Sumber: {$sourceRackLabels}",
                ]);
            }

            foreach ($rackStocks as $rackStock) {
                if ($remaining <= 0) {
                    break;
                }

                $rackAvailable = $rackStock->quantity - $rackStock->reserved_quantity;
                $share = $totalAvailable > 0
                    ? (int) round($rackAvailable / $totalAvailable * $quantity)
                    : 0;
                $reserveAmount = min($share, $rackAvailable, $remaining);

                if ($reserveAmount > 0) {
                    $rackStock->increment('reserved_quantity', $reserveAmount);
                    $remaining -= $reserveAmount;
                }
            }

            // If any remaining, just reserve from first available rack
            if ($remaining > 0) {
                foreach ($rackStocks as $rackStock) {
                    if ($remaining <= 0) break;
                    $rackAvailable = $rackStock->quantity - $rackStock->reserved_quantity;
                    $reserveAmount = min($rackAvailable, $remaining);
                    if ($reserveAmount > 0) {
                        $rackStock->increment('reserved_quantity', $reserveAmount);
                        $remaining -= $reserveAmount;
                    }
                }
            }

            if ($remaining > 0) {
                $productName = $item['product_name'] ?? "ID:$productId";
                throw ValidationException::withMessages([
                    'items' => "Reservasi stok rack untuk {$productName} gagal diselesaikan. Sisa belum ter-reserve: {$remaining}.",
                ]);
            }
        }
    }

    /**
     * Release reserved stock for shipment items (decrement reserved_stock).
     */
    protected function releaseShipmentStock(array $itemsData): void
    {
        $warehouse = Warehouse::first();
        if (!$warehouse) return;

        $warehouseId = $warehouse->id;

        foreach ($itemsData as $item) {
            $productId = $item['product_id'] ?? null;
            $quantity = (int) ($item['quantity'] ?? 0);

            if (!$productId || $quantity <= 0) continue;

            // Release from ProductStock
            ProductStock::where('warehouse_id', $warehouseId)
                ->where('product_id', $productId)
                ->decrement('reserved_stock', min($quantity, ProductStock::where('warehouse_id', $warehouseId)->where('product_id', $productId)->value('reserved_stock') ?? 0));

            // Release from RackStock
            $rackStocks = RackStock::where('product_id', $productId)
                ->whereHas('rack.zone', fn ($q) => $q->where('warehouse_id', $warehouseId))
                ->where('reserved_quantity', '>', 0)
                ->get();

            $remaining = $quantity;
            foreach ($rackStocks as $rackStock) {
                if ($remaining <= 0) break;
                $releaseAmount = min($rackStock->reserved_quantity, $remaining);
                $rackStock->decrement('reserved_quantity', $releaseAmount);
                $remaining -= $releaseAmount;
            }
        }
    }

    /**
     * Deduct actual stock when shipment is delivered.
     * Creates StockOut document + items, deducts from RackStock, records StockMovement.
     */
    protected function deductShipmentStock(Shipment $shipment): void
    {
        $warehouse = Warehouse::first();
        if (!$warehouse) return;

        $warehouseId = $warehouse->id;
        $shipment->load('items');

        $itemsWithProduct = $shipment->items->filter(fn ($i) => $i->product_id);
        if ($itemsWithProduct->isEmpty()) return;

        DB::transaction(function () use ($shipment, $warehouseId, $itemsWithProduct) {

        // Create StockOut document (WMS official outbound record)
        $stockOut = StockOut::create([
            'stock_out_number' => 'SO-' . now()->format('Ymd-His') . '-' . strtoupper(Str::random(4)),
            'warehouse_id' => $warehouseId,
            'customer_id' => $this->resolveShipmentCustomer($shipment)?->id,
            'out_date' => now()->toDateString(),
            'purpose' => 'shipment',
            'status' => 'completed',
            'notes' => "Pengiriman #{$shipment->shipment_id} ke {$shipment->destination_name}",
            'created_by' => request()->user()?->id,
        ]);

        foreach ($itemsWithProduct as $item) {
            $productId = $item->product_id;
            $quantity = (int) $item->quantity;
            $product = Product::find($productId);

            // Deduct from RackStock (FEFO: prioritize items expiring soonest, reserved first)
            $rackStocks = RackStock::where('product_id', $productId)
                ->whereHas('rack.zone', fn ($q) => $q->where('warehouse_id', $warehouseId))
                ->where('quantity', '>', 0)
                ->orderByRaw('CASE WHEN expired_date IS NULL THEN 1 ELSE 0 END')
                ->orderBy('expired_date', 'asc')
                ->get();

            $stockBefore = ProductStock::where('warehouse_id', $warehouseId)
                ->where('product_id', $productId)
                ->value('current_stock') ?? 0;

            $remaining = $quantity;
            $pickedDetails = [];

            foreach ($rackStocks as $rackStock) {
                if ($remaining <= 0) break;

                // FEFO: deduct from reserved quantity first, then actual
                $deductFromReserved = min($rackStock->reserved_quantity, $remaining);
                $deductFromActual = min($rackStock->quantity - $deductFromReserved, $remaining - $deductFromReserved);

                if ($deductFromReserved > 0) {
                    $rackStock->decrement('reserved_quantity', $deductFromReserved);
                }

                $totalDeduct = $deductFromReserved + $deductFromActual;
                if ($totalDeduct > 0) {
                    $rackStock->decrement('quantity', $totalDeduct);
                    $rackStock->forceFill(['last_updated_at' => now()])->save();
                    $remaining -= $totalDeduct;
                    $pickedDetails[] = [
                        'rack_id' => $rackStock->rack_id,
                        'batch_number' => $rackStock->batch_number,
                        'expired_date' => $rackStock->expired_date,
                        'quantity' => $totalDeduct,
                    ];
                }
            }

            if ($remaining > 0) {
                throw ValidationException::withMessages([
                    'items' => "Stok tidak cukup untuk dikurangi. Sisa belum terpenuhi: {$remaining} unit.",
                ]);
            }

            // Create StockOutItems per FEFO picked batch for pick tracking.
            foreach ($pickedDetails as $picked) {
                StockOutItem::create([
                    'stock_out_id' => $stockOut->id,
                    'product_id' => $productId,
                    'rack_id' => $picked['rack_id'],
                    'batch_number' => $picked['batch_number'],
                    'expired_date' => $picked['expired_date'],
                    'quantity' => $picked['quantity'],
                    'unit_price' => $product?->selling_price ?? 0,
                    'subtotal' => $picked['quantity'] * (float) ($product?->selling_price ?? 0),
                ]);
            }

            // Re-sync ProductStock summary
            $this->syncProductStockSummary($warehouseId, $productId);

            // Record stock movement with proper reference
            $stockAfter = ProductStock::where('warehouse_id', $warehouseId)
                ->where('product_id', $productId)
                ->value('current_stock') ?? 0;

            StockMovement::create([
                'product_id' => $productId,
                'warehouse_id' => $warehouseId,
                'movement_type' => 'out',
                'reference_type' => 'stock_out',
                'reference_id' => $stockOut->id,
                'quantity' => $quantity,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'movement_date' => now(),
                'notes' => "Pengiriman #{$shipment->shipment_id} ke {$shipment->destination_name}",
                'created_by' => request()->user()?->id,
            ]);
        }

        }); // end DB::transaction
    }

    /**
     * Resolve or create a customer record for the shipment destination.
     */
    protected function resolveShipmentCustomer(Shipment $shipment): ?\App\Models\Customer
    {
        // Try to find existing customer by destination name
        $customer = \App\Models\Customer::where('name', 'like', "%{$shipment->destination_name}%")->first();

        if (!$customer) {
            // Create a generic customer for this destination
            $customer = \App\Models\Customer::create([
                'code' => 'CUS-' . strtoupper(Str::random(6)),
                'name' => $shipment->destination_name ?? 'Unknown',
                'contact_person' => '-',
                'email' => null,
                'phone' => null,
                'address' => $shipment->destination ?? '-',
            ]);
        }

        return $customer;
    }

    /**
     * Re-sync ProductStock summary from rack stocks.
     */
    protected function syncProductStockSummary(int $warehouseId, int $productId): void
    {
        $totalRackQuantity = RackStock::where('product_id', $productId)
            ->whereHas('rack.zone', fn ($q) => $q->where('warehouse_id', $warehouseId))
            ->sum('quantity');

        $totalReserved = RackStock::where('product_id', $productId)
            ->whereHas('rack.zone', fn ($q) => $q->where('warehouse_id', $warehouseId))
            ->sum('reserved_quantity');

        // Preserve floating stock (same logic as HandlesStockSync::syncProductStock)
        $existing = ProductStock::where('warehouse_id', $warehouseId)
            ->where('product_id', $productId)
            ->first();
        $floatingStock = $existing ? max(0, (int) $existing->current_stock - (int) ($existing->rack_stock ?? 0)) : 0;
        $totalQuantity = $totalRackQuantity + $floatingStock;

        // Cleanup orphan RackStock records with quantity <= 0
        RackStock::where('product_id', $productId)
            ->whereHas('rack.zone', fn ($q) => $q->where('warehouse_id', $warehouseId))
            ->where('quantity', '<=', 0)
            ->delete();

        if ($totalQuantity > 0) {
            ProductStock::updateOrCreate(
                ['warehouse_id' => $warehouseId, 'product_id' => $productId],
                ['current_stock' => $totalQuantity, 'rack_stock' => $totalRackQuantity, 'reserved_stock' => $totalReserved, 'last_updated_at' => now()]
            );
        } else {
            ProductStock::where('warehouse_id', $warehouseId)->where('product_id', $productId)->delete();
        }
    }
}
