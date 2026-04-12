<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use App\Models\Warehouse;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PurchaseOrderController extends Controller
{
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
        $warehouses = Warehouse::all(['id', 'name']);
        $products = Product::all(['id', 'sku', 'name', 'unit_id']);
        
        // Auto generate string PO
        $autoPoNumber = 'PO-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4));

        return Inertia::render('PurchaseOrders/Create', [
            'suppliers' => $suppliers,
            'warehouses' => $warehouses,
            'products' => $products,
            'autoPoNumber' => $autoPoNumber,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'po_number' => 'required|string|unique:purchase_orders,po_number',
            'supplier_id' => 'required|exists:suppliers,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'order_date' => 'required|date',
            'expected_date' => 'nullable|date|after_or_equal:order_date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

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
        $purchaseOrder->load(['supplier', 'warehouse', 'creator', 'approver', 'items.product']);
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

        DB::transaction(function () use ($validated, $request, $purchaseOrder) {
            $updateData = ['status' => $validated['status']];
            
            if ($validated['status'] === 'approved') {
                $updateData['approved_by'] = $request->user()->id;
            }

            $purchaseOrder->update($updateData);

            // If marked as received, create a Goods Receipt record
            if ($validated['status'] === 'received') {
                $receipt = \App\Models\GoodsReceipt::create([
                    'receipt_number' => 'GR-' . now()->format('Ymd') . '-' . strtoupper(Str::random(4)),
                    'purchase_order_id' => $purchaseOrder->id,
                    'supplier_id' => $purchaseOrder->supplier_id,
                    'warehouse_id' => $purchaseOrder->warehouse_id,
                    'receipt_date' => now()->format('Y-m-d'),
                    'status' => 'received',
                    'created_by' => $request->user()->id,
                ]);

                // Copy items from PO to GR
                foreach ($purchaseOrder->items as $item) {
                    \App\Models\GoodsReceiptItem::create([
                        'goods_receipt_id' => $receipt->id,
                        'product_id' => $item->product_id,
                        'quantity_received' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'subtotal' => $item->subtotal,
                    ]);
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
}
