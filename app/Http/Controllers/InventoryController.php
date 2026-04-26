<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductStock;
use App\Models\Rack;
use App\Models\RackStock;
use App\Models\StockMovement;
use App\Models\Customer;
use App\Models\StockOut;
use App\Models\StockOutItem;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Traits\HandlesStockSync;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    use HandlesStockSync;

    public function index(Request $request): Response
    {
        $operationalWarehouse = Warehouse::with('zones.racks')->orderBy('id')->firstOrFail();

        $query = Product::query()
            ->with([
                'category',
                'unit',
                'productStocks' => fn($q) => $q->where('warehouse_id', $operationalWarehouse->id)->with('warehouse'),
                'rackStocks.rack'
            ])
            ->withSum([
                'productStocks as total_stock' => fn($q) => $q->where('warehouse_id', $operationalWarehouse->id)
            ], 'current_stock');

        // 1. Filter by Category
        if ($request->filled('category_id') && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('unit_id') && $request->unit_id !== 'all') {
            $query->where('unit_id', $request->unit_id);
        }

        if ($request->filled('default_supplier_id') && $request->default_supplier_id !== 'all') {
            $query->where('default_supplier_id', $request->default_supplier_id);
        }

        // 3. Filter by Status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where(function ($q) use ($request, $operationalWarehouse) {
                $stockSubquery = 'COALESCE((select SUM(current_stock) from product_stocks where product_id = products.id and warehouse_id = ?), 0)';
                $capacitySubquery = 'COALESCE((select SUM(racks.capacity) from rack_stocks inner join racks on racks.id = rack_stocks.rack_id where rack_stocks.product_id = products.id), 0)';
                $maxStockExpression = "CASE WHEN {$capacitySubquery} > 0 THEN {$capacitySubquery} ELSE GREATEST(1000, products.minimum_stock * 10) END";
                $warehouseId = $operationalWarehouse->id;

                if ($request->status === 'OutOfStock') {
                    $q->whereRaw("{$stockSubquery} = 0", [$warehouseId]);
                } elseif ($request->status === 'LowStock') {
                    $q->whereRaw(
                        "{$stockSubquery} > 0 and ({$stockSubquery} <= products.minimum_stock or {$stockSubquery} <= ({$maxStockExpression} * 0.20))",
                        [$warehouseId, $warehouseId, $warehouseId]
                    );
                } elseif ($request->status === 'Healthy') {
                    $q->whereRaw(
                        "{$stockSubquery} > products.minimum_stock and {$stockSubquery} > ({$maxStockExpression} * 0.20)",
                        [$warehouseId, $warehouseId]
                    );
                }
            });
        }

        // 4. Search by Name or SKU
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('sku', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('min_percentage') || $request->filled('max_percentage')) {
            $stockSubquery = 'COALESCE((select SUM(current_stock) from product_stocks where product_id = products.id and warehouse_id = ?), 0)';
            $capacitySubquery = 'COALESCE((select SUM(racks.capacity) from rack_stocks inner join racks on racks.id = rack_stocks.rack_id where rack_stocks.product_id = products.id), 0)';
            $maxStockExpression = "CASE WHEN {$capacitySubquery} > 0 THEN {$capacitySubquery} ELSE GREATEST(1000, products.minimum_stock * 10) END";
            $percentageExpression = "({$stockSubquery} / NULLIF({$maxStockExpression}, 0)) * 100";
            $warehouseId = $operationalWarehouse->id;

            if ($request->filled('min_percentage')) {
                $query->whereRaw("{$percentageExpression} >= ?", [$warehouseId, max(0, min(100, (float) $request->min_percentage))]);
            }

            if ($request->filled('max_percentage')) {
                $query->whereRaw("{$percentageExpression} <= ?", [$warehouseId, max(0, min(100, (float) $request->max_percentage))]);
            }
        }

        $productsPagination = $query->paginate(10)->withQueryString();

        $productsResult = $productsPagination->getCollection()->map(function ($product) {
            $totalStock = (int) ($product->total_stock ?? 0);

            $maxStock = $this->getDisplayCapacity($product);
            $percentage = $maxStock > 0 ? min(round(($totalStock / $maxStock) * 100), 100) : 0;

            return [
                'id' => $product->id,
                'sku' => $product->sku,
                'name' => $product->name,
                'category' => $product->category?->name ?? 'Uncategorized',
                'current_stock' => $totalStock,
                'max_stock' => $maxStock,
                'percentage' => $percentage,
                'status' => $this->getStockStatus($totalStock, (int) $product->minimum_stock, (int) $maxStock),
                'status_color' => $this->getStatusColor($totalStock, (int) $product->minimum_stock, (int) $maxStock),
                'image_url' => $product->image ? Storage::url($product->image) : null,
                'warehouse_stocks' => $product->productStocks->pluck('current_stock', 'warehouse_id')->toArray(),
            ];
        });

        // Replace collection with the mapped array data for the response
        $productsData = $productsPagination->toArray();
        $productsData['data'] = $productsResult;

        $totalRackCapacity = (int) $operationalWarehouse->zones
            ->flatMap(fn($zone) => $zone->racks)
            ->sum('capacity');
        $occupiedRackStock = (int) RackStock::whereHas('rack.zone', fn($query) => $query->where('warehouse_id', $operationalWarehouse->id))
            ->sum('quantity');
        $totalWarehouseStock = (int) ProductStock::where('warehouse_id', $operationalWarehouse->id)
            ->sum('current_stock');
        $unplacedStock = max(0, $totalWarehouseStock - $occupiedRackStock);
        $storageEfficiency = $totalRackCapacity > 0
            ? min(round(($occupiedRackStock / $totalRackCapacity) * 100, 1), 100)
            : 0;
        $warehouseUtilization = $totalRackCapacity > 0
            ? round(($totalWarehouseStock / $totalRackCapacity) * 100, 1)
            : 0;

        $stats = [
            'total_skus' => Product::count(),
            'out_of_stock' => Product::whereDoesntHave('productStocks', function ($query) use ($operationalWarehouse) {
                $query->where('warehouse_id', $operationalWarehouse->id)
                    ->where('current_stock', '>', 0);
            })->count(),
            'low_stock' => Product::with(['productStocks' => fn($q) => $q->where('warehouse_id', $operationalWarehouse->id)])
                ->with('rackStocks.rack')
                ->get()
                ->filter(fn($p) => $this->getStockStatus(
                    (int) $p->productStocks->sum('current_stock'),
                    (int) $p->minimum_stock,
                    $this->getDisplayCapacity($p)
                ) !== 'Healthy')
                ->count(),
            'storage_efficiency' => $storageEfficiency,
            'warehouse_utilization' => $warehouseUtilization,
            'occupied_storage' => $occupiedRackStock,
            'total_storage_capacity' => $totalRackCapacity,
            'total_warehouse_stock' => $totalWarehouseStock,
            'unplaced_stock' => $unplacedStock,
        ];

        return Inertia::render('Inventory', [
            'products' => $productsData,
            'stats' => $stats,
            'categories' => Category::all(['id', 'name']),
            'units' => Unit::all(['id', 'name']),
            'suppliers' => Supplier::all(['id', 'name']),
            'warehouses' => [$operationalWarehouse],
            'operationalWarehouse' => [
                'id' => $operationalWarehouse->id,
                'name' => $operationalWarehouse->name,
                'location' => $operationalWarehouse->location,
            ],
            'filters' => $request->only([
                'search',
                'category_id',
                'status',
                'unit_id',
                'default_supplier_id',
                'min_percentage',
                'max_percentage',
            ]),
        ]);
    }

    public function create(): Response
    {
        $operationalWarehouse = Warehouse::with('zones.racks')->orderBy('id')->firstOrFail();

        return Inertia::render('Inventory/Create', [
            'categories' => Category::all(['id', 'name']),
            'units' => Unit::all(['id', 'name']),
            'suppliers' => Supplier::all(['id', 'name']),
            'warehouses' => [$operationalWarehouse],
            'operationalWarehouse' => [
                'id' => $operationalWarehouse->id,
                'name' => $operationalWarehouse->name,
                'location' => $operationalWarehouse->location,
            ],
        ]);
    }

    public function edit(Product $product): Response
    {
        $operationalWarehouse = Warehouse::with('zones.racks')->orderBy('id')->firstOrFail();
        $product->load(['category', 'unit', 'defaultSupplier']);

        return Inertia::render('Inventory/Create', [
            'product' => [
                'id' => $product->id,
                'sku' => $product->sku,
                'name' => $product->name,
                'category_id' => $product->category_id,
                'unit_id' => $product->unit_id,
                'default_supplier_id' => $product->default_supplier_id,
                'purchase_price' => $product->purchase_price,
                'selling_price' => $product->selling_price,
                'minimum_stock' => $product->minimum_stock,
                'description' => $product->description,
                'volume_entry_mode' => $product->volume_entry_mode ?? 'none',
                'dimension_unit' => $product->dimension_unit,
                'dimension_length' => $product->dimension_length,
                'dimension_width' => $product->dimension_width,
                'dimension_height' => $product->dimension_height,
                'volume_m3_per_unit' => $product->volume_m3_per_unit,
                'image_url' => $product->image ? Storage::url($product->image) : null,
            ],
            'isEdit' => true,
            'categories' => Category::all(['id', 'name']),
            'units' => Unit::all(['id', 'name']),
            'suppliers' => Supplier::all(['id', 'name']),
            'warehouses' => [$operationalWarehouse],
            'operationalWarehouse' => [
                'id' => $operationalWarehouse->id,
                'name' => $operationalWarehouse->name,
                'location' => $operationalWarehouse->location,
            ],
        ]);
    }

    public function outbound(): Response
    {
        return Inertia::render('Inventory/Outbound');
    }
    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create-product');
        $operationalWarehouse = Warehouse::orderBy('id')->firstOrFail();

        $validated = $request->validate([
            'sku' => 'required|string|unique:products,sku',
            'name' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'unit_id' => 'required|exists:units,id',
            'default_supplier_id' => 'nullable|exists:suppliers,id',
            'purchase_price' => 'nullable|numeric',
            'selling_price' => 'nullable|numeric',
            'minimum_stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'volume_entry_mode' => 'nullable|in:none,auto,manual',
            'dimension_unit' => 'nullable|in:mm,cm,m',
            'dimension_length' => 'nullable|numeric|min:0',
            'dimension_width' => 'nullable|numeric|min:0',
            'dimension_height' => 'nullable|numeric|min:0',
            'volume_m3_per_unit' => 'nullable|numeric|min:0',
            // Initial stock fields - only require locations if stock is > 0
            'initial_stock' => 'nullable|integer|min:0',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'rack_id' => 'required_unless:initial_stock,0|exists:racks,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
        $volumePayload = $this->resolveVolumePayload($validated);

        $validated['warehouse_id'] = $validated['warehouse_id'] ?? $operationalWarehouse->id;

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        DB::transaction(function () use ($validated, $request, $imagePath) {
            $product = Product::create([
                'sku' => $validated['sku'],
                'name' => $validated['name'],
                'category_id' => $validated['category_id'],
                'unit_id' => $validated['unit_id'],
                'default_supplier_id' => $validated['default_supplier_id'],
                'purchase_price' => $validated['purchase_price'] ?? 0,
                'selling_price' => $validated['selling_price'] ?? 0,
                'minimum_stock' => $validated['minimum_stock'],
                'description' => $validated['description'],
                ...$volumePayload,
                'image' => $imagePath,
                'is_active' => true,
            ]);

            if (!empty($validated['initial_stock']) && $validated['initial_stock'] > 0) {
                $rack = Rack::findOrFail($validated['rack_id']);

                // 1. Capacity Validation - use 'initial_stock' as error key for frontend mapping
                $this->ensureRackCapacity($rack, (int) $validated['initial_stock'], $product->id, 'initial_stock');

                // 2. Update RackStock (Physical Truth)
                \App\Models\RackStock::updateOrCreate(
                    ['rack_id' => $validated['rack_id'], 'product_id' => $product->id],
                    [
                        'quantity' => $validated['initial_stock'],
                        'last_updated_at' => now(),
                    ]
                );

                // 3. Sync ProductStock (Warehouse Summary)
                $this->syncProductStock((int) $validated['warehouse_id'], $product->id);

                // 4. Record Movement (Log)
                $this->recordMovement(
                    request: $request,
                    productId: $product->id,
                    warehouseId: (int) $validated['warehouse_id'],
                    type: 'in',
                    referenceType: 'goods_receipt',
                    referenceId: $product->id,
                    quantity: $validated['initial_stock'],
                    stockBefore: 0,
                    stockAfter: $validated['initial_stock'],
                    notes: 'Initial stock entry on ' . $rack->code
                );
            }
        });

        return redirect()->route('inventory')->with('success', 'Product created successfully.');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        Gate::authorize('update-product');
        $validated = $request->validate([
            'sku' => 'required|string|unique:products,sku,' . $product->id,
            'name' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'unit_id' => 'required|exists:units,id',
            'default_supplier_id' => 'nullable|exists:suppliers,id',
            'purchase_price' => 'nullable|numeric',
            'selling_price' => 'nullable|numeric',
            'minimum_stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'volume_entry_mode' => 'nullable|in:none,auto,manual',
            'dimension_unit' => 'nullable|in:mm,cm,m',
            'dimension_length' => 'nullable|numeric|min:0',
            'dimension_width' => 'nullable|numeric|min:0',
            'dimension_height' => 'nullable|numeric|min:0',
            'volume_m3_per_unit' => 'nullable|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
        $volumePayload = $this->resolveVolumePayload($validated);

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }

            $validated['image'] = $request->file('image')->store('products', 'public');
        } else {
            unset($validated['image']);
        }

        $product->update([
            'sku' => $validated['sku'],
            'name' => $validated['name'],
            'category_id' => $validated['category_id'],
            'unit_id' => $validated['unit_id'],
            'default_supplier_id' => $validated['default_supplier_id'],
            'purchase_price' => $validated['purchase_price'] ?? 0,
            'selling_price' => $validated['selling_price'] ?? 0,
            'minimum_stock' => $validated['minimum_stock'],
            'description' => $validated['description'] ?? null,
            ...$volumePayload,
            ...array_intersect_key($validated, ['image' => true]),
        ]);

        return redirect()
            ->route('inventory.show', $product)
            ->with('success', 'Product updated successfully.');
    }

    public function recordOutbound(Request $request): RedirectResponse
    {
        Gate::authorize('create-stockOut');
        $operationalWarehouse = Warehouse::orderBy('id')->firstOrFail();

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'quantity' => 'required|integer|min:1',
            'destination' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $validated['warehouse_id'] = $validated['warehouse_id'] ?? $operationalWarehouse->id;

        DB::transaction(function () use ($validated, $request) {
            $product = Product::findOrFail($validated['product_id']);
            $productStock = ProductStock::where('product_id', $validated['product_id'])
                ->where('warehouse_id', $validated['warehouse_id'])
                ->first();

            if (!$productStock || $productStock->current_stock < $validated['quantity']) {
                throw ValidationException::withMessages([
                    'quantity' => "Insufficient stock in selected warehouse. Available: " . ($productStock ? $productStock->current_stock : 0) . " units."
                ]);
            }

            $availableStock = (int) $productStock->current_stock - (int) ($productStock->reserved_stock ?? 0);
            if ($availableStock < $validated['quantity']) {
                throw ValidationException::withMessages([
                    'quantity' => "Insufficient available stock (reserved: {$productStock->reserved_stock}). Available: {$availableStock} units."
                ]);
            }

            $customer = $this->resolveOutboundCustomer($validated['destination'] ?? null);
            $stockOut = StockOut::create([
                'stock_out_number' => 'SO-' . now()->format('Ymd-His') . '-' . strtoupper(Str::random(4)),
                'warehouse_id' => $validated['warehouse_id'],
                'customer_id' => $customer->id,
                'out_date' => now()->toDateString(),
                'purpose' => 'delivery',
                'status' => 'completed',
                'notes' => $validated['notes'] ?? $validated['destination'] ?? null,
                'created_by' => $request->user()->id,
            ]);

            // Find rack stocks for this product (FEFO: prioritize items expiring soonest)
            $rackStocks = RackStock::where('product_id', $validated['product_id'])
                ->whereHas('rack.zone', fn ($q) => $q->where('warehouse_id', $validated['warehouse_id']))
                ->where('quantity', '>', 0)
                ->orderByRaw('CASE WHEN expired_date IS NULL THEN 1 ELSE 0 END')
                ->orderBy('expired_date', 'asc')
                ->get();

            $remainingToReduce = $validated['quantity'];
            $stockBefore = $productStock->current_stock;
            $pickedDetails = [];

            foreach ($rackStocks as $rackStock) {
                if ($remainingToReduce <= 0)
                    break;

                $available = max(0, (int) $rackStock->quantity - (int) ($rackStock->reserved_quantity ?? 0));
                $reduction = min($available, $remainingToReduce);

                if ($reduction <= 0)
                    continue;

                $rackStock->decrement('quantity', $reduction);
                $rackStock->forceFill(['last_updated_at' => now()])->save();
                $remainingToReduce -= $reduction;
                $pickedDetails[] = [
                    'rack_id' => $rackStock->rack_id,
                    'batch_number' => $rackStock->batch_number,
                    'expired_date' => $rackStock->expired_date,
                    'quantity' => $reduction,
                ];
            }

            if ($remainingToReduce > 0) {
                throw ValidationException::withMessages([
                    'quantity' => "Unable to fulfill outbound — part of the stock is reserved for shipment. Unfulfilled: {$remainingToReduce} units."
                ]);
            }

            foreach ($pickedDetails as $picked) {
                StockOutItem::create([
                    'stock_out_id' => $stockOut->id,
                    'product_id' => $product->id,
                    'rack_id' => $picked['rack_id'],
                    'batch_number' => $picked['batch_number'],
                    'expired_date' => $picked['expired_date'],
                    'quantity' => $picked['quantity'],
                    'unit_price' => $product->selling_price ?? 0,
                    'subtotal' => $picked['quantity'] * (float) ($product->selling_price ?? 0),
                ]);
            }

            // 2. Sync ProductStock (Warehouse Summary)
            $this->syncProductStock((int) $validated['warehouse_id'], (int) $validated['product_id']);

            // 3. Record Movement (Log)
            $this->recordMovement(
                request: $request,
                productId: (int) $validated['product_id'],
                warehouseId: (int) $validated['warehouse_id'],
                type: 'out',
                referenceType: 'stock_out',
                referenceId: (int) $stockOut->id,
                quantity: $validated['quantity'],
                stockBefore: $stockBefore,
                stockAfter: $stockBefore - $validated['quantity'],
                notes: $validated['notes'] ?? ('Outbound to: ' . ($validated['destination'] ?? $customer->name))
            );
        });

        return redirect()->route('inventory')->with('success', 'Outbound recorded successfully.');
    }

    private function resolveOutboundCustomer(?string $destination): Customer
    {
        $name = trim((string) $destination);

        return Customer::firstOrCreate(
            ['code' => 'GENERAL-OUT'],
            [
                'name' => $name !== '' ? $name : 'General Outbound',
                'contact_person' => null,
                'phone' => null,
                'email' => null,
                'address' => $name !== '' ? $name : null,
            ]
        );
    }

    private function resolveVolumePayload(array $validated): array
    {
        $mode = $validated['volume_entry_mode'] ?? 'none';

        if ($mode === 'none') {
            return [
                'volume_entry_mode' => 'none',
                'dimension_unit' => null,
                'dimension_length' => null,
                'dimension_width' => null,
                'dimension_height' => null,
                'volume_m3_per_unit' => null,
            ];
        }

        if ($mode === 'manual') {
            $volume = isset($validated['volume_m3_per_unit']) ? (float) $validated['volume_m3_per_unit'] : 0.0;

            if ($volume <= 0) {
                throw ValidationException::withMessages([
                    'volume_m3_per_unit' => 'Volume manual harus lebih besar dari 0.',
                ]);
            }

            return [
                'volume_entry_mode' => 'manual',
                'dimension_unit' => null,
                'dimension_length' => null,
                'dimension_width' => null,
                'dimension_height' => null,
                'volume_m3_per_unit' => round($volume, 6),
            ];
        }

        $unit = $validated['dimension_unit'] ?? null;
        $length = isset($validated['dimension_length']) ? (float) $validated['dimension_length'] : 0.0;
        $width = isset($validated['dimension_width']) ? (float) $validated['dimension_width'] : 0.0;
        $height = isset($validated['dimension_height']) ? (float) $validated['dimension_height'] : 0.0;

        if (!$unit || $length <= 0 || $width <= 0 || $height <= 0) {
            throw ValidationException::withMessages([
                'dimension_length' => 'Mode otomatis butuh panjang, lebar, tinggi, dan satuan dimensi yang valid.',
            ]);
        }

        $divisor = match ($unit) {
            'mm' => 1_000_000_000,
            'cm' => 1_000_000,
            default => 1,
        };

        $volume = ($length * $width * $height) / $divisor;

        if ($volume <= 0) {
            throw ValidationException::withMessages([
                'dimension_length' => 'Volume hasil perhitungan harus lebih besar dari 0.',
            ]);
        }

        return [
            'volume_entry_mode' => 'auto',
            'dimension_unit' => $unit,
            'dimension_length' => round($length, 3),
            'dimension_width' => round($width, 3),
            'dimension_height' => round($height, 3),
            'volume_m3_per_unit' => round($volume, 6),
        ];
    }

    private function getStockStatus(int $current, int $min, ?int $maxStock = null): string
    {
        if ($current <= 0)
            return 'Critical';
        if ($this->isLowStock($current, $min, $maxStock))
            return 'Low Stock';
        return 'Healthy';
    }

    private function getStatusColor(int $current, int $min, ?int $maxStock = null): string
    {
        if ($current <= 0)
            return 'text-red-500 bg-red-50';
        if ($this->isLowStock($current, $min, $maxStock))
            return 'text-amber-600 bg-amber-50';
        return 'text-emerald-600 bg-emerald-50';
    }

    private function isLowStock(int $current, int $min, ?int $maxStock = null): bool
    {
        if ($current <= $min) {
            return true;
        }

        if ($maxStock === null || $maxStock <= 0) {
            return false;
        }

        return ($current / $maxStock) * 100 <= 20;
    }

    private function getDisplayCapacity(Product $product): int
    {
        $realCapacity = (int) $product->rackStocks->sum(function ($rackStock) {
            return $rackStock->rack->capacity ?? 0;
        });

        return $realCapacity > 0 ? $realCapacity : max(1000, (int) $product->minimum_stock * 10);
    }

    public function show(Product $product): Response
    {
        $operationalWarehouse = Warehouse::orderBy('id')->firstOrFail();

        $product->load([
            'category',
            'unit',
            'defaultSupplier',
            'rackStocks.rack.zone.warehouse',
            'productStocks.warehouse'
        ]);

        $totalStock = (int) $product->productStocks->sum('current_stock');

        // Distribution by zone/rack
        $distribution = $product->rackStocks->map(function ($rs) {
            return [
                'rack_code' => $rs->rack->code,
                'zone_name' => $rs->rack->zone->name,
                'warehouse_name' => $rs->rack->zone->warehouse->name,
                'quantity' => $rs->quantity,
                'capacity' => $rs->rack->capacity,
                'batch_number' => $rs->batch_number,
                'expired_date' => $rs->expired_date,
            ];
        });

        // Stock Movements History
        $movements = StockMovement::where('product_id', $product->id)
            ->with(['user', 'warehouse'])
            ->orderBy('movement_date', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($m) {
                return [
                    'id' => $m->id,
                    'type' => $m->movement_type === 'in' ? 'Restok Masuk' : ($m->movement_type === 'out' ? 'Barang Keluar' : 'Transfer'),
                    'reference' => $m->reference_type . ' #' . $m->reference_id,
                    'quantity' => $m->quantity,
                    'quantity_formatted' => ($m->movement_type === 'in' ? '+ ' : '- ') . $m->quantity,
                    'stock_after' => $m->stock_after,
                    'date' => $m->movement_date->format('M d, Y'),
                    'time' => $m->movement_date->format('H:i:s T'),
                    'location' => $m->warehouse?->name ?? 'External',
                    'operator' => $m->user?->name ?? 'System',
                    'operator_initials' => collect(explode(' ', $m->user?->name ?? 'System'))
                        ->map(fn($n) => substr($n, 0, 1))
                        ->take(2)
                        ->join(''),
                ];
            });

        // Calculate max stock for progress bar (sum of capacities where product is stored or default)
        $maxStock = $this->getDisplayCapacity($product);

        $stats = [
            'current_stock' => $totalStock,
            'max_stock' => $maxStock,
            'percentage' => $maxStock > 0 ? min(round(($totalStock / $maxStock) * 100), 100) : 0,
            'status' => $this->getStockStatus($totalStock, (int) $product->minimum_stock, (int) $maxStock),
            'status_color' => $this->getStatusColor($totalStock, (int) $product->minimum_stock, (int) $maxStock),
            'velocity' => $movements->count() > 5 ? 'Tinggi' : ($movements->count() > 0 ? 'Sedang' : 'Rendah'),
        ];

        return Inertia::render('ProductDetail', [
            'product' => [
                'id' => $product->id,
                'sku' => $product->sku,
                'name' => $product->name,
                'category' => $product->category?->name ?? 'Uncategorized',
                'description' => $product->description,
                'purchase_price' => $product->purchase_price,
                'selling_price' => $product->selling_price,
                'volume_entry_mode' => $product->volume_entry_mode,
                'dimension_unit' => $product->dimension_unit,
                'dimension_length' => $product->dimension_length,
                'dimension_width' => $product->dimension_width,
                'dimension_height' => $product->dimension_height,
                'volume_m3_per_unit' => $product->volume_m3_per_unit,
                'image_url' => $product->image ? Storage::url($product->image) : null,
            ],
            'stats' => $stats,
            'distribution' => $distribution,
            'movements' => $movements,
        ]);
    }
}
