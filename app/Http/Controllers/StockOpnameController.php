<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductStock;
use App\Models\Rack;
use App\Models\RackStock;
use App\Models\StockAdjustment;
use App\Models\StockAdjustmentItem;
use App\Models\StockOpname;
use App\Models\StockOpnameItem;
use App\Models\Warehouse;
use App\Traits\HandlesStockSync;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StockOpnameController extends Controller
{
    use HandlesStockSync;

    public function index(): Response
    {
        $warehouse = Warehouse::with('zones.racks.rackStocks')->orderBy('id')->firstOrFail();

        $products = Product::query()
            ->with([
                'category:id,name',
                'unit:id,name',
                'productStocks' => fn ($query) => $query->where('warehouse_id', $warehouse->id),
                'rackStocks.rack.zone',
            ])
            ->orderBy('name')
            ->get()
            ->map(function (Product $product) use ($warehouse) {
                $systemStock = (int) ($product->productStocks->first()?->current_stock ?? 0);

                return [
                    'id' => $product->id,
                    'sku' => $product->sku,
                    'name' => $product->name,
                    'category' => $product->category?->name ?? 'Uncategorized',
                    'unit' => $product->unit?->name ?? 'unit',
                    'system_stock' => $systemStock,
                    'rack_count' => $product->rackStocks
                        ->filter(fn (RackStock $stock) => (int) $stock->rack?->zone?->warehouse_id === (int) $warehouse->id && $stock->quantity > 0)
                        ->count(),
                ];
            });

        $recentOpnames = StockOpname::query()
            ->with(['items.product:id,sku,name', 'creator:id,name'])
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (StockOpname $opname) => [
                'id' => $opname->id,
                'number' => $opname->opname_number,
                'date' => $opname->opname_date?->format('d M Y'),
                'status' => $opname->status ?? 'completed',
                'created_by' => $opname->created_by,
                'operator' => $opname->creator?->name ?? 'System',
                'notes' => $opname->notes,
                'items_count' => $opname->items->count(),
                'variance_count' => $opname->items->where('difference', '!=', 0)->count(),
                'total_variance' => $opname->items->sum(fn ($item) => abs((int) $item->difference)),
            ]);

        return Inertia::render('StockOpname', [
            'warehouse' => [
                'id' => $warehouse->id,
                'name' => $warehouse->name,
                'location' => $warehouse->location,
            ],
            'products' => $products,
            'recentOpnames' => $recentOpnames,
            'can_create' => Gate::check('create-stockOpname'),
            'can_approve' => Gate::check('approve-stockOpname'),
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create-stockOpname');
        $warehouse = Warehouse::orderBy('id')->firstOrFail();

        $data = $request->validate([
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.physical_stock' => ['required', 'integer', 'min:0'],
            'items.*.note' => ['nullable', 'string', 'max:255'],
        ]);

        $isManager = in_array(true, [
            str_contains(strtolower($request->user()?->role?->name ?? ''), 'manager'),
            str_contains(strtolower($request->user()?->role?->name ?? ''), 'admin gudang'),
            str_contains(strtolower($request->user()?->role?->name ?? ''), 'manajer'),
        ]);

        DB::transaction(function () use ($request, $warehouse, $data, $isManager) {
            $opname = StockOpname::create([
                'opname_number' => 'OPN-' . now()->format('Ymd-His') . '-' . strtoupper(Str::random(4)),
                'warehouse_id' => $warehouse->id,
                'opname_date' => now()->toDateString(),
                'status' => $isManager ? 'completed' : 'pending',
                'notes' => $data['notes'] ?? null,
                'created_by' => $request->user()->id,
                'approved_by' => $isManager ? $request->user()->id : null,
            ]);

            foreach ($data['items'] as $itemData) {
                $productId = (int) $itemData['product_id'];
                $physicalStock = (int) $itemData['physical_stock'];
                $systemStock = (int) (ProductStock::where('warehouse_id', $warehouse->id)
                    ->where('product_id', $productId)
                    ->value('current_stock') ?? 0);
                $difference = $physicalStock - $systemStock;

                StockOpnameItem::create([
                    'stock_opname_id' => $opname->id,
                    'product_id' => $productId,
                    'system_stock' => $systemStock,
                    'physical_stock' => $physicalStock,
                    'difference' => $difference,
                    'note' => $itemData['note'] ?? null,
                ]);
            }

            // Auto-apply adjustments for manager-created opnames
            if ($isManager) {
                $this->applyOpnameAdjustments($opname, $warehouse, $request);
            }
        });

        $statusMsg = $isManager ? 'Stock opname disimpan dan adjustment diterapkan.' : 'Stock opname disimpan. Menunggu persetujuan supervisor/manager.';
        return redirect()->route('stock-opname.index')->with('status', $statusMsg);
    }

    public function approve(Request $request, StockOpname $stockOpname): RedirectResponse
    {
        Gate::authorize('approve-stockOpname');

        $roleName = strtolower((string) ($request->user()?->role?->name ?? ''));
        $isManager = str_contains($roleName, 'manager') || str_contains($roleName, 'manajer') || str_contains($roleName, 'admin gudang');

        if (! $isManager && $stockOpname->created_by === $request->user()->id) {
            throw ValidationException::withMessages([
                'status' => 'Anda tidak dapat menyetujui opname yang Anda sendiri buat. Harus disetujui oleh supervisor/manager lain.',
            ]);
        }

        if ($stockOpname->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => 'Opname sudah diproses sebelumnya.',
            ]);
        }

        $warehouse = Warehouse::findOrFail($stockOpname->warehouse_id);

        DB::transaction(function () use ($request, $stockOpname, $warehouse) {
            $stockOpname->update([
                'status' => 'completed',
                'approved_by' => $request->user()->id,
            ]);

            $this->applyOpnameAdjustments($stockOpname, $warehouse, $request);
        });

        return redirect()->route('stock-opname.index')->with('status', 'Stock opname disetujui dan adjustment diterapkan.');
    }

    public function reject(Request $request, StockOpname $stockOpname): RedirectResponse
    {
        Gate::authorize('approve-stockOpname');

        if ($stockOpname->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => 'Opname sudah diproses sebelumnya.',
            ]);
        }

        $stockOpname->update(['status' => 'rejected']);

        return redirect()->route('stock-opname.index')->with('status', 'Stock opname ditolak.');
    }

    public function show(StockOpname $stockOpname): Response
    {
        $stockOpname->load([
            'warehouse:id,name,location',
            'items.product:id,sku,name',
            'creator:id,name,email',
            'approver:id,name,email',
        ]);

        $adjustment = StockAdjustment::query()
            ->with(['items.product:id,sku,name', 'creator:id,name,email'])
            ->when(
                Schema::hasColumn('stock_adjustments', 'stock_opname_id'),
                fn ($query) => $query->where(function ($nestedQuery) use ($stockOpname) {
                    $nestedQuery->where('stock_opname_id', $stockOpname->id)
                        ->orWhere('notes', 'like', '%'.$stockOpname->opname_number.'%');
                }),
                fn ($query) => $query->where('notes', 'like', '%'.$stockOpname->opname_number.'%'),
            )
            ->latest()
            ->first();

        return Inertia::render('StockOpnameDetail', [
            'opname' => [
                'id' => $stockOpname->id,
                'number' => $stockOpname->opname_number,
                'date' => $stockOpname->opname_date?->format('Y-m-d'),
                'date_label' => $stockOpname->opname_date?->format('d M Y'),
                'status' => $stockOpname->status ?? 'completed',
                'created_by' => $stockOpname->created_by,
                'notes' => $stockOpname->notes,
                'warehouse' => $stockOpname->warehouse,
                'operator' => $stockOpname->creator,
                'approver' => $stockOpname->approver,
                'items' => $stockOpname->items->map(fn (StockOpnameItem $item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'sku' => $item->product?->sku,
                    'name' => $item->product?->name,
                    'system_stock' => $item->system_stock,
                    'physical_stock' => $item->physical_stock,
                    'difference' => $item->difference,
                    'note' => $item->note,
                ]),
                'items_count' => $stockOpname->items->count(),
                'variance_count' => $stockOpname->items->where('difference', '!=', 0)->count(),
                'total_variance' => $stockOpname->items->sum(fn ($item) => abs((int) $item->difference)),
            ],
            'adjustment' => $adjustment ? [
                'id' => $adjustment->id,
                'number' => $adjustment->adjustment_number,
                'date_label' => $adjustment->adjustment_date?->format('d M Y'),
                'reason' => $adjustment->reason,
                'notes' => $adjustment->notes,
                'operator' => $adjustment->creator,
                'items' => $adjustment->items->map(fn (StockAdjustmentItem $item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'sku' => $item->product?->sku,
                    'name' => $item->product?->name,
                    'adjustment_type' => $item->adjustment_type,
                    'quantity' => $item->quantity,
                    'note' => $item->note,
                ]),
            ] : null,
            'can_approve' => Gate::check('approve-stockOpname'),
        ]);
    }

    public function downloadPdf(StockOpname $stockOpname)
    {
        $document = $this->documentPayload($stockOpname);

        $pdf = Pdf::loadView('wms_documents.document_pdf', [
            'document' => $document,
            'generatedAt' => now(),
        ])->setPaper('a4', 'portrait');

        return $pdf->download('Stock_Opname_'.$stockOpname->opname_number.'.pdf');
    }

    private function documentPayload(StockOpname $stockOpname): array
    {
        $stockOpname->loadMissing([
            'warehouse:id,name,location',
            'items.product:id,sku,name',
            'creator:id,name,email',
            'approver:id,name,email',
        ]);

        return [
            'title' => 'Stock Opname',
            'subtitle' => 'Dokumen hasil hitung fisik stok gudang',
            'number' => $stockOpname->opname_number,
            'status' => $stockOpname->items->sum('difference') == 0 ? 'Balanced' : 'Variance',
            'stats' => [
                ['label' => 'Tanggal Opname', 'value' => $stockOpname->opname_date?->format('d M Y') ?? '-'],
                ['label' => 'SKU Dihitung', 'value' => number_format($stockOpname->items->count(), 0, ',', '.')],
                ['label' => 'Total Selisih', 'value' => number_format((float) $stockOpname->items->sum('difference'), 0, ',', '.')],
                ['label' => 'Operator', 'value' => $stockOpname->creator?->name ?? 'Sistem'],
            ],
            'details' => [
                ['label' => 'Warehouse', 'value' => $stockOpname->warehouse?->name],
                ['label' => 'Lokasi', 'value' => $stockOpname->warehouse?->location],
                ['label' => 'Dibuat Oleh', 'value' => $stockOpname->creator?->name],
                ['label' => 'Disetujui Oleh', 'value' => $stockOpname->approver?->name],
                ['label' => 'Catatan', 'value' => $stockOpname->notes],
            ],
            'columns' => [
                ['key' => 'product', 'label' => 'Produk'],
                ['key' => 'sku', 'label' => 'SKU'],
                ['key' => 'system_stock', 'label' => 'Sistem', 'align' => 'right'],
                ['key' => 'physical_stock', 'label' => 'Fisik', 'align' => 'right'],
                ['key' => 'difference', 'label' => 'Selisih', 'align' => 'right'],
                ['key' => 'note', 'label' => 'Catatan'],
            ],
            'rows' => $stockOpname->items->map(fn (StockOpnameItem $item) => [
                'product' => $item->product?->name,
                'sku' => $item->product?->sku,
                'system_stock' => number_format((float) $item->system_stock, 0, ',', '.'),
                'physical_stock' => number_format((float) $item->physical_stock, 0, ',', '.'),
                'difference' => ((int) $item->difference > 0 ? '+' : '').number_format((float) $item->difference, 0, ',', '.'),
                'note' => $item->note ?: '-',
            ])->all(),
        ];
    }

    private function increasePhysicalStock(int $warehouseId, int $productId, int $quantity): void
    {
        $rack = $this->findRackForPositiveAdjustment($warehouseId, $productId, $quantity);

        if (! $rack) {
            throw ValidationException::withMessages([
                'items' => 'No active rack has enough capacity for positive stock adjustment.',
            ]);
        }

        $rackStock = RackStock::firstOrNew([
            'rack_id' => $rack->id,
            'product_id' => $productId,
        ]);
        $rackStock->quantity = (int) $rackStock->quantity + $quantity;
        $rackStock->reserved_quantity = (int) ($rackStock->reserved_quantity ?? 0);
        $rackStock->last_updated_at = now();
        $rackStock->save();
    }

    private function decreasePhysicalStock(int $warehouseId, int $productId, int $quantity): void
    {
        $remaining = $quantity;
        $rackStocks = RackStock::query()
            ->where('product_id', $productId)
            ->whereHas('rack.zone', fn ($query) => $query->where('warehouse_id', $warehouseId))
            ->where('quantity', '>', 0)
            ->with('rack')
            ->orderByDesc('quantity')
            ->get();

        foreach ($rackStocks as $rackStock) {
            if ($remaining <= 0) {
                break;
            }

            $available = max(0, (int) $rackStock->quantity - (int) $rackStock->reserved_quantity);
            $reduction = min($available, $remaining);

            if ($reduction <= 0) {
                continue;
            }

            $rackStock->decrement('quantity', $reduction);
            $rackStock->forceFill(['last_updated_at' => now()])->save();
            $remaining -= $reduction;
        }

        if ($remaining > 0) {
            throw ValidationException::withMessages([
                'items' => 'Unable to reduce stock because part of the stock is reserved or missing from racks.',
            ]);
        }
    }

    private function findRackForPositiveAdjustment(int $warehouseId, int $productId, int $quantity): ?Rack
    {
        return Rack::query()
            ->where('status', 'active')
            ->whereHas('zone', fn ($query) => $query->where('warehouse_id', $warehouseId))
            ->with(['zone', 'rackStocks'])
            ->orderByRaw(
                'exists(select 1 from rack_stocks where rack_stocks.rack_id = racks.id and rack_stocks.product_id = ?) desc',
                [$productId],
            )
            ->orderBy('id')
            ->get()
            ->first(function (Rack $rack) use ($productId, $quantity) {
                $existingProductQuantity = (int) $rack->rackStocks
                    ->where('product_id', $productId)
                    ->sum('quantity');

                try {
                    $this->ensureRackCapacity($rack, $existingProductQuantity + $quantity, $productId);
                    return true;
                } catch (ValidationException) {
                    return false;
                }
            });
    }

    protected function applyOpnameAdjustments(StockOpname $stockOpname, Warehouse $warehouse, Request $request): void
    {
        $adjustment = null;

        foreach ($stockOpname->items as $item) {
            $productId = (int) $item->product_id;
            $difference = (int) $item->difference;

            if ($difference === 0) {
                continue;
            }

            if (! $adjustment) {
                $adjustmentData = [
                    'adjustment_number' => 'ADJ-' . now()->format('Ymd-His') . '-' . strtoupper(Str::random(4)),
                    'warehouse_id' => $warehouse->id,
                    'adjustment_date' => now()->toDateString(),
                    'status' => 'completed',
                    'reason' => 'stock_opname',
                    'notes' => 'Auto adjustment from '.$stockOpname->opname_number,
                    'created_by' => $request->user()->id,
                ];

                if (Schema::hasColumn('stock_adjustments', 'stock_opname_id')) {
                    $adjustmentData['stock_opname_id'] = $stockOpname->id;
                }

                $adjustment = StockAdjustment::create($adjustmentData);
            }

            StockAdjustmentItem::create([
                'stock_adjustment_id' => $adjustment->id,
                'product_id' => $productId,
                'adjustment_type' => $difference > 0 ? 'in' : 'out',
                'quantity' => abs($difference),
                'note' => $item->note ?? 'Adjustment from stock opname',
            ]);

            if ($difference > 0) {
                $this->increasePhysicalStock($warehouse->id, $productId, $difference);
            } else {
                $this->decreasePhysicalStock($warehouse->id, $productId, abs($difference));
            }

            $this->syncProductStock($warehouse->id, $productId);

            $this->recordMovement(
                request: $request,
                productId: $productId,
                warehouseId: $warehouse->id,
                type: 'adjustment',
                referenceType: 'stock_adjustment',
                referenceId: $adjustment->id,
                quantity: abs($difference),
                stockBefore: (int) $item->system_stock,
                stockAfter: (int) $item->physical_stock,
                notes: 'Stock opname '.$stockOpname->opname_number.' variance '.($difference > 0 ? '+' : '').$difference,
            );
        }
    }
}
