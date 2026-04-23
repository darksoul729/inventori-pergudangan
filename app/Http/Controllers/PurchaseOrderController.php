<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Rack;
use App\Models\RackStock;
use App\Models\Supplier;
use App\Models\Warehouse;
use App\Models\Product;
use App\Traits\HandlesStockSync;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PurchaseOrderController extends Controller
{
    use HandlesStockSync;

    public function index()
    {
        $purchaseOrders = PurchaseOrder::with(['supplier', 'warehouse', 'creator', 'items'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($po) {
                // Calculate grand total from items subtotal
                $po->total_amount = $po->items->sum('subtotal');
                return $po;
            });

        return Inertia::render('PurchaseOrders/Index', [
            'purchaseOrders' => $purchaseOrders,
        ]);
    }

    public function create()
    {
        $suppliers = Supplier::where('status', 'active')->get(['id', 'name', 'code']);
        $operationalWarehouse = Warehouse::orderBy('id')->firstOrFail(['id', 'name', 'location']);
        $products = Product::all(['id', 'sku', 'name', 'unit_id']);
        
        // Auto generate string PO
        $autoPoNumber = 'PO-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));

        return Inertia::render('PurchaseOrders/Create', [
            'suppliers' => $suppliers,
            'products' => $products,
            'autoPoNumber' => $autoPoNumber,
            'operationalWarehouse' => $operationalWarehouse,
        ]);
    }

    public function store(Request $request)
    {
        $operationalWarehouse = Warehouse::orderBy('id')->firstOrFail();

        $validated = $request->validate([
            'po_number' => 'required|string|unique:purchase_orders,po_number',
            'supplier_id' => 'required|exists:suppliers,id',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'order_date' => 'required|date',
            'expected_date' => 'nullable|date|after_or_equal:order_date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $validated['warehouse_id'] = $validated['warehouse_id'] ?? $operationalWarehouse->id;

        DB::transaction(function () use ($validated, $request) {
            $po = PurchaseOrder::create([
                'po_number' => $validated['po_number'],
                'supplier_id' => $validated['supplier_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'order_date' => $validated['order_date'],
                'expected_date' => $validated['expected_date'],
                'status' => 'pending',
                'notes' => $validated['notes'],
                'created_by' => $request->user()->id,
            ]);

            foreach ($validated['items'] as $itemData) {
                $subtotal = $itemData['quantity'] * $itemData['unit_price'];
                PurchaseOrderItem::create([
                    'purchase_order_id' => $po->id,
                    'product_id' => $itemData['product_id'],
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'subtotal' => $subtotal,
                ]);
            }
        });

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase Order created successfully.');
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load(['supplier', 'warehouse', 'creator', 'approver', 'items.product', 'goodsReceipts.items']);
        $purchaseOrder->total_amount = $purchaseOrder->items->sum('subtotal');

        return Inertia::render('PurchaseOrders/Show', [
            'purchaseOrder' => $purchaseOrder,
        ]);
    }

    public function updateStatus(Request $request, PurchaseOrder $purchaseOrder)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected,received,cancelled',
        ]);

        if (in_array($validated['status'], ['approved', 'rejected', 'cancelled'], true)) {
            abort_unless($this->isManager($request), 403, 'Hanya Manager Gudang yang dapat menyetujui, menolak, atau membatalkan PO.');
        }

        DB::transaction(function () use ($validated, $request, $purchaseOrder) {
            $purchaseOrder->loadMissing(['items', 'goodsReceipts']);
            $previousStatus = $purchaseOrder->status;
            $updateData = ['status' => $validated['status']];

            if ($validated['status'] === 'received' && !in_array($previousStatus, ['approved', 'received'], true)) {
                throw ValidationException::withMessages([
                    'status' => 'PO harus disetujui Manager Gudang sebelum bisa dikonfirmasi diterima.',
                ]);
            }
            
            if ($validated['status'] === 'approved') {
                $updateData['approved_by'] = $request->user()->id;
            }

            $purchaseOrder->update($updateData);

            // If marked as received, create a Goods Receipt record
            if ($validated['status'] === 'received' && $previousStatus !== 'received' && $purchaseOrder->goodsReceipts->isEmpty()) {
                $receipt = \App\Models\GoodsReceipt::create([
                    'receipt_number' => 'GR-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4)),
                    'purchase_order_id' => $purchaseOrder->id,
                    'supplier_id' => $purchaseOrder->supplier_id,
                    'warehouse_id' => $purchaseOrder->warehouse_id,
                    'receipt_date' => now()->format('Y-m-d'),
                    'status' => 'received',
                    'created_by' => $request->user()->id,
                ]);

                // Copy items from PO to GR and put received stock into warehouse racks.
                foreach ($purchaseOrder->items as $item) {
                    \App\Models\GoodsReceiptItem::create([
                        'goods_receipt_id' => $receipt->id,
                        'product_id' => $item->product_id,
                        'quantity_received' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'subtotal' => $item->subtotal,
                    ]);

                    $this->putAwayReceivedItem(
                        request: $request,
                        warehouseId: (int) $purchaseOrder->warehouse_id,
                        productId: (int) $item->product_id,
                        quantity: (int) $item->quantity,
                        receiptId: (int) $receipt->id,
                    );
                }

                // Trigger automatic performance calculation for this supplier for the current month
                \Illuminate\Support\Facades\Artisan::call('supplier:calculate-performance', [
                    '--month' => now()->month,
                    '--year' => now()->year,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Purchase Order status updated to ' . $validated['status'] . '.');
    }

    private function isManager(Request $request): bool
    {
        $roleName = strtolower((string) ($request->user()?->role?->name ?? ''));

        return str_contains($roleName, 'manager')
            || str_contains($roleName, 'manajer')
            || str_contains($roleName, 'admin gudang');
    }

    private function putAwayReceivedItem(Request $request, int $warehouseId, int $productId, int $quantity, int $receiptId): void
    {
        $rack = $this->findAvailableRack($warehouseId, $productId, $quantity);

        if (! $rack) {
            throw ValidationException::withMessages([
                'status' => 'No active rack has enough capacity for the received item. Please create rack capacity before receiving this PO.',
            ]);
        }

        $stockBefore = (int) ($rack->zone->warehouse->productStocks()
            ->where('product_id', $productId)
            ->value('current_stock') ?? 0);

        $rackStock = RackStock::query()->firstOrNew([
            'rack_id' => $rack->id,
            'product_id' => $productId,
        ]);

        $rackStock->quantity = (int) $rackStock->quantity + $quantity;
        $rackStock->reserved_quantity = (int) ($rackStock->reserved_quantity ?? 0);
        $rackStock->last_updated_at = now();
        $rackStock->save();

        $this->syncProductStock($warehouseId, $productId);

        $this->recordMovement(
            request: $request,
            productId: $productId,
            warehouseId: $warehouseId,
            type: 'in',
            referenceType: 'goods_receipt',
            referenceId: $receiptId,
            quantity: $quantity,
            stockBefore: $stockBefore,
            stockAfter: $stockBefore + $quantity,
            notes: 'Goods receipt putaway to '.$rack->code,
        );
    }

    private function findAvailableRack(int $warehouseId, int $productId, int $quantity): ?Rack
    {
        return Rack::query()
            ->where('status', 'active')
            ->whereHas('zone', fn ($query) => $query->where('warehouse_id', $warehouseId))
            ->with(['zone.warehouse', 'rackStocks'])
            ->orderBy('id')
            ->get()
            ->first(function (Rack $rack) use ($productId, $quantity) {
                $currentOtherQuantity = $rack->rackStocks
                    ->where('product_id', '!=', $productId)
                    ->sum('quantity');

                $currentProductQuantity = $rack->rackStocks
                    ->where('product_id', $productId)
                    ->sum('quantity');

                return ($currentOtherQuantity + $currentProductQuantity + $quantity) <= $rack->capacity;
            });
    }
}
