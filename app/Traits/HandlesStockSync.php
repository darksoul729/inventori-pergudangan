<?php

namespace App\Traits;

use App\Models\ProductStock;
use App\Models\Rack;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

trait HandlesStockSync
{
    /**
     * Ensure a rack has enough capacity for an incoming quantity.
     *
     * @throws ValidationException
     */
    protected function ensureRackCapacity(Rack $rack, int $incomingQuantity, int $productId, string $errorKey = 'quantity'): void
    {
        $currentOtherQuantity = $rack->rackStocks()
            ->where('product_id', '!=', $productId)
            ->sum('quantity');

        if (($currentOtherQuantity + $incomingQuantity) > $rack->capacity) {
            throw ValidationException::withMessages([
                $errorKey => "Quantity ($incomingQuantity) exceeds rack capacity ({$rack->capacity}) for rack {$rack->code}. Current other items: $currentOtherQuantity.",
            ]);
        }
    }

    /**
     * Synchronize product stocks summary for a specific warehouse based on its rack stocks + floating stock.
     */
    protected function syncProductStock(int $warehouseId, int $productId): void
    {
        // Aggregate all rack stocks for this product in this warehouse
        $totalRackQuantity = \App\Models\RackStock::where('product_id', $productId)
            ->whereHas('rack.zone', function ($query) use ($warehouseId) {
                $query->where('warehouse_id', $warehouseId);
            })
            ->sum('quantity');
            
        $totalReserved = \App\Models\RackStock::where('product_id', $productId)
            ->whereHas('rack.zone', function ($query) use ($warehouseId) {
                $query->where('warehouse_id', $warehouseId);
            })
            ->sum('reserved_quantity');

        // Preserve floating stock (stock received but not yet placed on rack)
        $existing = ProductStock::where('warehouse_id', $warehouseId)
            ->where('product_id', $productId)
            ->first();
        $floatingStock = $existing ? max(0, (int) $existing->current_stock - (int) ($existing->rack_stock ?? 0)) : 0;

        $totalQuantity = $totalRackQuantity + $floatingStock;

        // Cleanup orphan RackStock records with quantity <= 0
        \App\Models\RackStock::where('product_id', $productId)
            ->whereHas('rack.zone', function ($query) use ($warehouseId) {
                $query->where('warehouse_id', $warehouseId);
            })
            ->where('quantity', '<=', 0)
            ->delete();

        if ($totalQuantity > 0) {
            ProductStock::updateOrCreate(
                ['warehouse_id' => $warehouseId, 'product_id' => $productId],
                [
                    'current_stock' => $totalQuantity,
                    'rack_stock' => $totalRackQuantity,
                    'reserved_stock' => $totalReserved,
                    'last_updated_at' => now(),
                ]
            );
        } else {
            // Remove summary if no stock left at all
            ProductStock::where('warehouse_id', $warehouseId)
                ->where('product_id', $productId)
                ->delete();
        }
    }

    /**
     * Record a stock movement log entry.
     */
    protected function recordMovement(
        Request $request,
        int $productId,
        int $warehouseId,
        string $type,
        string $referenceType,
        int $referenceId,
        int $quantity,
        int $stockBefore,
        int $stockAfter,
        ?string $notes = null
    ): void {
        StockMovement::create([
            'product_id' => $productId,
            'warehouse_id' => $warehouseId,
            'movement_type' => $type,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'quantity' => $quantity,
            'stock_before' => $stockBefore,
            'stock_after' => $stockAfter,
            'movement_date' => now(),
            'notes' => $notes,
            'created_by' => $request->user()?->id,
        ]);
    }
}
