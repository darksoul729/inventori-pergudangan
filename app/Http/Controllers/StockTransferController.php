<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductStock;
use App\Models\Rack;
use App\Models\RackStock;
use App\Models\StockTransfer;
use App\Models\StockTransferItem;
use App\Models\Warehouse;
use App\Traits\HandlesStockSync;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StockTransferController extends Controller
{
    use HandlesStockSync;

    public function index(): Response
    {
        $warehouse = Warehouse::with([
            'zones.racks.rackStocks.product:id,sku,name',
        ])->orderBy('id')->firstOrFail();

        $racks = $warehouse->zones
            ->flatMap(fn ($zone) => $zone->racks->map(function (Rack $rack) use ($zone) {
                return [
                    'id' => $rack->id,
                    'code' => $rack->code,
                    'name' => $rack->name,
                    'zone' => $zone->code.' - '.$zone->name,
                    'capacity' => $rack->capacity,
                    'used' => $rack->rackStocks->sum('quantity'),
                    'available_capacity' => max(0, $rack->capacity - $rack->rackStocks->sum('quantity')),
                    'stocks' => $rack->rackStocks
                        ->where('quantity', '>', 0)
                        ->map(fn (RackStock $stock) => [
                            'product_id' => $stock->product_id,
                            'sku' => $stock->product?->sku,
                            'name' => $stock->product?->name,
                            'quantity' => $stock->quantity,
                            'reserved_quantity' => $stock->reserved_quantity,
                            'available_quantity' => max(0, $stock->quantity - $stock->reserved_quantity),
                        ])
                        ->values(),
                ];
            }))
            ->sortBy('code')
            ->values();

        // Products with floating/unplaced stock (need put-away)
        $unplacedProducts = Product::query()
            ->with(['category:id,name', 'unit:id,name', 'productStocks' => fn ($q) => $q->where('warehouse_id', $warehouse->id)])
            ->whereHas('productStocks', fn ($q) => $q
                ->where('warehouse_id', $warehouse->id)
                ->whereRaw('current_stock > COALESCE(rack_stock, 0)'))
            ->orderBy('name')
            ->get()
            ->map(function (Product $product) {
                $systemStock = (int) ($product->productStocks->first()?->current_stock ?? 0);
                $rackStock = (int) ($product->productStocks->first()?->rack_stock ?? 0);
                $unplacedStock = max(0, $systemStock - $rackStock);

                return [
                    'id' => $product->id,
                    'sku' => $product->sku,
                    'name' => $product->name,
                    'category' => $product->category?->name ?? 'Uncategorized',
                    'unit' => $product->unit?->name ?? 'unit',
                    'system_stock' => $systemStock,
                    'unplaced_stock' => $unplacedStock,
                ];
            });

        $recentTransfers = StockTransfer::query()
            ->with(['items.product:id,sku,name', 'creator:id,name'])
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (StockTransfer $transfer) => [
                'id' => $transfer->id,
                'number' => $transfer->transfer_number,
                'date' => $transfer->transfer_date?->format('d M Y'),
                'status' => $transfer->status,
                'created_by' => $transfer->created_by,
                'notes' => $transfer->notes,
                'operator' => $transfer->creator?->name ?? 'System',
                'items' => $transfer->items->map(fn ($item) => [
                    'sku' => $item->product?->sku,
                    'name' => $item->product?->name,
                    'quantity' => $item->quantity,
                ]),
            ]);

        return Inertia::render('RackAllocation', [
            'warehouse' => [
                'id' => $warehouse->id,
                'name' => $warehouse->name,
                'location' => $warehouse->location,
            ],
            'racks' => $racks,
            'unplacedProducts' => $unplacedProducts,
            'recentTransfers' => $recentTransfers,
            'can_create' => Gate::check('create-stockTransfer'),
            'can_approve' => Gate::check('approve-stockTransfer'),
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create-stockTransfer');
        $warehouse = Warehouse::orderBy('id')->firstOrFail();

        $data = $request->validate([
            'from_rack_id' => ['nullable', 'exists:racks,id'],
            'to_rack_id' => ['required', 'exists:racks,id'],
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string'],
            'type' => ['nullable', 'in:transfer,putaway'],
        ]);

        $isPutaway = ($data['type'] ?? '') === 'putaway' || empty($data['from_rack_id']);

        if (! $isPutaway && $data['from_rack_id'] === $data['to_rack_id']) {
            throw ValidationException::withMessages([
                'from_rack_id' => 'Source and destination rack must be different.',
            ]);
        }

        DB::transaction(function () use ($request, $warehouse, $data, $isPutaway) {
            $toRack = Rack::with(['zone.warehouse', 'rackStocks'])->findOrFail($data['to_rack_id']);

            if ((int) $toRack->zone->warehouse_id !== (int) $warehouse->id) {
                throw ValidationException::withMessages([
                    'to_rack_id' => 'Destination rack must belong to the operational warehouse.',
                ]);
            }

            $fromRack = null;
            $sourceStock = null;

            if (! $isPutaway) {
                $fromRack = Rack::with(['zone.warehouse', 'rackStocks'])->findOrFail($data['from_rack_id']);

                if ((int) $fromRack->zone->warehouse_id !== (int) $warehouse->id) {
                    throw ValidationException::withMessages([
                        'from_rack_id' => 'Source rack must belong to the operational warehouse.',
                    ]);
                }

                $sourceStock = RackStock::where('rack_id', $fromRack->id)
                    ->where('product_id', $data['product_id'])
                    ->first();

                $availableQuantity = max(0, (int) ($sourceStock?->quantity ?? 0) - (int) ($sourceStock?->reserved_quantity ?? 0));

                if (! $sourceStock || $availableQuantity < (int) $data['quantity']) {
                    throw ValidationException::withMessages([
                        'quantity' => 'Stok siap pakai di rak asal tidak mencukupi. Tersedia: '.$availableQuantity.' unit.',
                    ]);
                }
            } else {
                // Put-away: validate product has unplaced stock
                $productStock = ProductStock::where('warehouse_id', $warehouse->id)
                    ->where('product_id', $data['product_id'])
                    ->first();
                $unplacedStock = max(0, (int) ($productStock?->current_stock ?? 0) - (int) ($productStock?->rack_stock ?? 0));

                if (! $productStock || $unplacedStock < (int) $data['quantity']) {
                    throw ValidationException::withMessages([
                        'quantity' => 'Stok belum ditempatkan tidak mencukupi. Tersedia: '.$unplacedStock.' unit.',
                    ]);
                }
            }

            $targetExistingQuantity = (int) $toRack->rackStocks
                ->where('product_id', (int) $data['product_id'])
                ->sum('quantity');

            $this->ensureRackCapacity(
                $toRack,
                $targetExistingQuantity + (int) $data['quantity'],
                (int) $data['product_id'],
                'quantity',
            );

            $stockBefore = (int) (ProductStock::where('warehouse_id', $warehouse->id)
                ->where('product_id', (int) $data['product_id'])
                ->value('current_stock') ?? 0);

            $transferLabel = $isPutaway
                ? 'Put-away to '.$toRack->code
                : 'Rack transfer '.$fromRack->code.' to '.$toRack->code;

            $transfer = StockTransfer::create([
                'transfer_number' => 'TRF-' . now()->format('Ymd-His') . '-' . strtoupper(Str::random(4)),
                'from_warehouse_id' => $warehouse->id,
                'to_warehouse_id' => $warehouse->id,
                'transfer_date' => now()->toDateString(),
                'status' => 'pending',
                'notes' => $data['notes'] ?? $transferLabel,
                'created_by' => $request->user()->id,
            ]);

            StockTransferItem::create([
                'stock_transfer_id' => $transfer->id,
                'from_rack_id' => $fromRack?->id,
                'to_rack_id' => $toRack->id,
                'product_id' => (int) $data['product_id'],
                'quantity' => (int) $data['quantity'],
            ]);

            // For put-away, apply immediately (no approval needed)
            // For managers, auto-approve since they can approve their own transfers
            $isManager = in_array(true, [
                str_contains(strtolower($request->user()?->role?->name ?? ''), 'manager'),
                str_contains(strtolower($request->user()?->role?->name ?? ''), 'admin gudang'),
                str_contains(strtolower($request->user()?->role?->name ?? ''), 'manajer'),
            ]);

            if ($isPutaway || $isManager) {
                $this->applyTransferItems($transfer, $warehouse, $request);
                $transfer->update(['status' => 'completed']);
            }
        });

        $statusMsg = ($isPutaway || ($isManager ?? false)) ? 'Transfer selesai. Stok sudah dipindahkan.' : 'Transfer dibuat. Menunggu persetujuan supervisor/manager.';
        return redirect()->route('rack.allocation')->with('status', $statusMsg);
    }

    public function show(StockTransfer $stockTransfer): Response
    {
        $stockTransfer->load([
            'fromWarehouse:id,name,location',
            'toWarehouse:id,name,location',
            'items.product:id,sku,name',
            'items.fromRack:id,code,name',
            'items.toRack:id,code,name',
            'creator:id,name,email',
        ]);

        return Inertia::render('StockTransferDetail', [
            'transfer' => [
                'id' => $stockTransfer->id,
                'number' => $stockTransfer->transfer_number,
                'date' => $stockTransfer->transfer_date?->format('Y-m-d'),
                'date_label' => $stockTransfer->transfer_date?->format('d M Y'),
                'status' => $stockTransfer->status,
                'created_by' => $stockTransfer->created_by,
                'notes' => $stockTransfer->notes,
                'from_warehouse' => $stockTransfer->fromWarehouse,
                'to_warehouse' => $stockTransfer->toWarehouse,
                'operator' => $stockTransfer->creator,
                'items' => $stockTransfer->items->map(fn (StockTransferItem $item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'sku' => $item->product?->sku,
                    'name' => $item->product?->name,
                    'quantity' => $item->quantity,
                    'from_rack' => $item->fromRack ? $item->fromRack->code : 'Unplaced',
                    'to_rack' => $item->toRack?->code ?? '-',
                ]),
                'total_quantity' => $stockTransfer->items->sum('quantity'),
            ],
            'can_approve' => Gate::check('approve-stockTransfer'),
        ]);
    }

    public function downloadPdf(StockTransfer $stockTransfer)
    {
        $document = $this->documentPayload($stockTransfer);

        $pdf = Pdf::loadView('wms_documents.document_pdf', [
            'document' => $document,
            'generatedAt' => now(),
        ])->setPaper('a4', 'portrait');

        return $pdf->download('Stock_Transfer_'.$stockTransfer->transfer_number.'.pdf');
    }

    private function documentPayload(StockTransfer $stockTransfer): array
    {
        $stockTransfer->loadMissing([
            'fromWarehouse:id,name,location',
            'toWarehouse:id,name,location',
            'items.product:id,sku,name',
            'items.fromRack:id,code,name',
            'items.toRack:id,code,name',
            'creator:id,name,email',
        ]);

        return [
            'title' => 'Transfer Rack',
            'subtitle' => 'Dokumen perpindahan stok internal dalam satu warehouse',
            'number' => $stockTransfer->transfer_number,
            'status' => ucfirst($stockTransfer->status ?? 'completed'),
            'stats' => [
                ['label' => 'Tanggal Transfer', 'value' => $stockTransfer->transfer_date?->format('d M Y') ?? '-'],
                ['label' => 'Total Qty', 'value' => number_format((float) $stockTransfer->items->sum('quantity'), 0, ',', '.')],
                ['label' => 'Item', 'value' => number_format($stockTransfer->items->count(), 0, ',', '.')],
                ['label' => 'Operator', 'value' => $stockTransfer->creator?->name ?? 'Sistem'],
            ],
            'details' => [
                ['label' => 'Warehouse Asal', 'value' => $stockTransfer->fromWarehouse?->name],
                ['label' => 'Warehouse Tujuan', 'value' => $stockTransfer->toWarehouse?->name],
                ['label' => 'Lokasi Asal', 'value' => $stockTransfer->fromWarehouse?->location],
                ['label' => 'Lokasi Tujuan', 'value' => $stockTransfer->toWarehouse?->location],
                ['label' => 'Catatan', 'value' => $stockTransfer->notes],
            ],
            'columns' => [
                ['key' => 'product', 'label' => 'Produk'],
                ['key' => 'sku', 'label' => 'SKU'],
                ['key' => 'from_rack', 'label' => 'Rack Asal'],
                ['key' => 'to_rack', 'label' => 'Rack Tujuan'],
                ['key' => 'quantity', 'label' => 'Qty', 'align' => 'right'],
            ],
            'rows' => $stockTransfer->items->map(fn (StockTransferItem $item) => [
                'product' => $item->product?->name,
                'sku' => $item->product?->sku,
                'from_rack' => $item->fromRack?->code ?? 'Unplaced',
                'to_rack' => $item->toRack?->code ?? '-',
                'quantity' => number_format((float) $item->quantity, 0, ',', '.'),
            ])->all(),
        ];
    }

    public function approve(Request $request, StockTransfer $stockTransfer): RedirectResponse
    {
        Gate::authorize('approve-stockTransfer');

        if ($stockTransfer->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => 'Transfer sudah diproses sebelumnya.',
            ]);
        }

        // Self-approval check: creator cannot approve their own transfer (unless manager)
        $roleName = strtolower((string) ($request->user()?->role?->name ?? ''));
        $isManager = str_contains($roleName, 'manager') || str_contains($roleName, 'manajer') || str_contains($roleName, 'admin gudang');

        if (! $isManager && $stockTransfer->created_by === $request->user()->id) {
            throw ValidationException::withMessages([
                'status' => 'Anda tidak dapat menyetujui transfer yang Anda sendiri buat. Harus disetujui oleh supervisor/manager lain.',
            ]);
        }

        $warehouse = Warehouse::findOrFail($stockTransfer->from_warehouse_id);

        DB::transaction(function () use ($request, $stockTransfer, $warehouse) {
            $this->applyTransferItems($stockTransfer, $warehouse, $request);
            $stockTransfer->update(['status' => 'completed']);
        });

        return redirect()->route('rack.allocation')->with('status', 'Transfer disetujui dan stok sudah dipindahkan.');
    }

    public function reject(Request $request, StockTransfer $stockTransfer): RedirectResponse
    {
        Gate::authorize('approve-stockTransfer');

        if ($stockTransfer->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => 'Transfer sudah diproses sebelumnya.',
            ]);
        }

        $stockTransfer->update(['status' => 'rejected']);

        return redirect()->route('rack.allocation')->with('status', 'Transfer ditolak.');
    }

    private function applyTransferItems(StockTransfer $transfer, Warehouse $warehouse, Request $request): void
    {
        $transfer->load('items.fromRack', 'items.toRack', 'items.product');

        foreach ($transfer->items as $item) {
            $productId = (int) $item->product_id;
            $quantity = (int) $item->quantity;
            $fromRack = $item->fromRack;
            $toRack = $item->toRack;

            $stockBefore = (int) (ProductStock::where('warehouse_id', $warehouse->id)
                ->where('product_id', $productId)
                ->value('current_stock') ?? 0);

            // Decrement source rack
            if ($fromRack) {
                $sourceStock = RackStock::where('rack_id', $fromRack->id)
                    ->where('product_id', $productId)
                    ->first();

                $availableQuantity = max(0, (int) ($sourceStock?->quantity ?? 0) - (int) ($sourceStock?->reserved_quantity ?? 0));
                if (! $sourceStock || $availableQuantity < $quantity) {
                    throw ValidationException::withMessages([
                        'quantity' => "Stok tersedia di rack {$fromRack->code} tidak cukup. Tersedia: {$availableQuantity}",
                    ]);
                }

                $sourceStock->decrement('quantity', $quantity);
                $sourceStock->forceFill(['last_updated_at' => now()])->save();
            } else {
                // Put-away moves from floating/unplaced stock into rack.
                $productStock = ProductStock::where('warehouse_id', $warehouse->id)
                    ->where('product_id', $productId)
                    ->first();
                $unplacedStock = max(0, (int) ($productStock?->current_stock ?? 0) - (int) ($productStock?->rack_stock ?? 0));
                if (! $productStock || $unplacedStock < $quantity) {
                    throw ValidationException::withMessages([
                        'quantity' => "Stok unplaced tidak cukup untuk put-away. Tersedia: {$unplacedStock}",
                    ]);
                }
                $productStock->decrement('current_stock', $quantity);
                $productStock->forceFill(['last_updated_at' => now()])->save();
            }

            // Increment target rack
            $targetStock = RackStock::firstOrNew([
                'rack_id' => $toRack->id,
                'product_id' => $productId,
            ]);
            $targetStock->quantity = (int) $targetStock->quantity + $quantity;
            $targetStock->reserved_quantity = (int) ($targetStock->reserved_quantity ?? 0);
            $targetStock->last_updated_at = now();
            $targetStock->save();

            $this->syncProductStock((int) $warehouse->id, $productId);

            $stockAfter = (int) (ProductStock::where('warehouse_id', $warehouse->id)
                ->where('product_id', $productId)
                ->value('current_stock') ?? 0);

            $isPutaway = !$fromRack;
            $this->recordMovement(
                request: $request,
                productId: $productId,
                warehouseId: (int) $warehouse->id,
                type: $isPutaway ? 'putaway' : 'transfer',
                referenceType: 'stock_transfer',
                referenceId: (int) $transfer->id,
                quantity: $quantity,
                stockBefore: $stockBefore,
                stockAfter: $stockAfter,
                notes: ($transfer->notes ?? '').' [' . ($fromRack?->code ?? 'Unplaced') . ' -> ' . $toRack->code . ']',
            );
        }
    }
}
