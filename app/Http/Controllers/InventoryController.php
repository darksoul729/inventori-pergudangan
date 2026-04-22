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

        // 3. Filter by Status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where(function ($q) use ($request, $operationalWarehouse) {
                $subquery = DB::table('product_stocks')
                    ->select(DB::raw('SUM(current_stock)'))
                    ->whereColumn('product_id', 'products.id')
                    ->where('warehouse_id', $operationalWarehouse->id);

                if ($request->status === 'OutOfStock') {
                    $q->whereDoesntHave('productStocks')
                        ->orWhereRaw("({$subquery->toSql()}) = 0");
                } elseif ($request->status === 'LowStock') {
                    $q->whereRaw("({$subquery->toSql()}) > 0")
                        ->whereRaw("({$subquery->toSql()}) < products.minimum_stock");
                } elseif ($request->status === 'Healthy') {
                    $q->whereRaw("({$subquery->toSql()}) >= products.minimum_stock");
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

        $productsPagination = $query->paginate(10)->withQueryString();

        $productsResult = $productsPagination->getCollection()->map(function ($product) {
            $totalStock = $product->total_stock ?? 0;

            // Calculate total capacity from all racks holding this product
            $realCapacity = $product->rackStocks->sum(function ($rs) {
                return $rs->rack->capacity ?? 0;
            });

            // Use real capacity if available, otherwise fallback to a multiple of min stock or 1000
            $maxStock = $realCapacity > 0 ? $realCapacity : max(1000, $product->minimum_stock * 10);
            $percentage = $maxStock > 0 ? min(round(($totalStock / $maxStock) * 100), 100) : 0;

            return [
                'id' => $product->id,
                'sku' => $product->sku,
                'name' => $product->name,
                'category' => $product->category?->name ?? 'Uncategorized',
                'current_stock' => $totalStock,
                'max_stock' => $maxStock,
                'percentage' => $percentage,
                'status' => $this->getStockStatus($totalStock, (int) $product->minimum_stock),
                'status_color' => $this->getStatusColor($totalStock, (int) $product->minimum_stock),
                'image_url' => $product->image ? Storage::url($product->image) : null,
                'warehouse_stocks' => $product->productStocks->pluck('current_stock', 'warehouse_id')->toArray(),
            ];
        });

        // Replace collection with the mapped array data for the response
        $productsData = $productsPagination->toArray();
        $productsData['data'] = $productsResult;

        $stats = [
            'total_skus' => Product::count(),
            'out_of_stock' => Product::whereDoesntHave('productStocks', function ($query) use ($operationalWarehouse) {
                $query->where('warehouse_id', $operationalWarehouse->id)
                    ->where('current_stock', '>', 0);
            })->count(),
            'low_stock' => Product::with(['productStocks' => fn($q) => $q->where('warehouse_id', $operationalWarehouse->id)])
                ->get()
                ->filter(fn($p) => $this->getStockStatus($p->productStocks->sum('current_stock'), $p->minimum_stock) !== 'Healthy')
                ->count(),
            'storage_efficiency' => '94.8',
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
        $operationalWarehouse = Warehouse::orderBy('id')->firstOrFail();

        $products = Product::whereHas('productStocks', function ($q) use ($operationalWarehouse) {
            $q->where('warehouse_id', $operationalWarehouse->id)->where('current_stock', '>', 0);
        })
            ->with(['productStocks' => fn($q) => $q->where('warehouse_id', $operationalWarehouse->id)])
            ->get(['id', 'sku', 'name', 'minimum_stock'])
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'sku' => $product->sku,
                    'name' => $product->name,
                    'minimum_stock' => $product->minimum_stock,
                    'current_stock' => $product->productStocks->sum('current_stock')
                ];
            });

        return Inertia::render('Inventory/Outbound', [
            'products' => $products,
            'warehouses' => [$operationalWarehouse],
            'operationalWarehouse' => [
                'id' => $operationalWarehouse->id,
                'name' => $operationalWarehouse->name,
            ],
        ]);
    }
    public function store(Request $request): RedirectResponse
    {
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
            // Initial stock fields - only require locations if stock is > 0
            'initial_stock' => 'nullable|integer|min:0',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'rack_id' => 'required_unless:initial_stock,0|exists:racks,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

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
            ...array_intersect_key($validated, ['image' => true]),
        ]);

        return redirect()
            ->route('inventory.show', $product)
            ->with('success', 'Product updated successfully.');
    }

    public function recordOutbound(Request $request): RedirectResponse
    {
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

            StockOutItem::create([
                'stock_out_id' => $stockOut->id,
                'product_id' => $product->id,
                'quantity' => $validated['quantity'],
                'unit_price' => $product->selling_price ?? 0,
                'subtotal' => $validated['quantity'] * (float) ($product->selling_price ?? 0),
            ]);

            // Find racks with stock for this product in this warehouse
            $racks = Rack::whereHas('zone', function ($q) use ($validated) {
                $q->where('warehouse_id', $validated['warehouse_id']);
            })->whereHas('rackStocks', function ($q) use ($validated) {
                $q->where('product_id', $validated['product_id'])->where('quantity', '>', 0);
            })->with([
                        'rackStocks' => function ($q) use ($validated) {
                            $q->where('product_id', $validated['product_id']);
                        }
                    ])->get();

            $remainingToReduce = $validated['quantity'];
            $stockBefore = $productStock->current_stock;

            foreach ($racks as $rack) {
                if ($remainingToReduce <= 0)
                    break;

                $rackStock = $rack->rackStocks->first();
                $reduction = min($rackStock->quantity, $remainingToReduce);

                $rackStock->decrement('quantity', $reduction);
                $remainingToReduce -= $reduction;
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

    private function getStockStatus(int $current, int $min): string
    {
        if ($current <= 0)
            return 'Critical';
        if ($current <= $min)
            return 'Low Stock';
        return 'Healthy';
    }

    private function getStatusColor(int $current, int $min): string
    {
        if ($current <= 0)
            return 'text-red-500 bg-red-50';
        if ($current <= $min)
            return 'text-amber-600 bg-amber-50';
        return 'text-emerald-600 bg-emerald-50';
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

        $totalStock = $product->productStocks->sum('current_stock');

        // Distribution by zone/rack
        $distribution = $product->rackStocks->map(function ($rs) {
            return [
                'rack_code' => $rs->rack->code,
                'zone_name' => $rs->rack->zone->name,
                'warehouse_name' => $rs->rack->zone->warehouse->name,
                'quantity' => $rs->quantity,
                'capacity' => $rs->rack->capacity,
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
        $maxStock = $product->rackStocks->sum(fn($rs) => $rs->rack->capacity) ?: max(1000, $product->minimum_stock * 10);

        $stats = [
            'current_stock' => $totalStock,
            'max_stock' => $maxStock,
            'percentage' => $maxStock > 0 ? min(round(($totalStock / $maxStock) * 100), 100) : 0,
            'status' => $this->getStockStatus($totalStock, (int) $product->minimum_stock),
            'status_color' => $this->getStatusColor($totalStock, (int) $product->minimum_stock),
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
                'image_url' => $product->image ? Storage::url($product->image) : null,
            ],
            'stats' => $stats,
            'distribution' => $distribution,
            'movements' => $movements,
        ]);
    }
}
