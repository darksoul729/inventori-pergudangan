<?php

namespace App\Http\Controllers;

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
            'recentTransfers' => $recentTransfers,
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $warehouse = Warehouse::orderBy('id')->firstOrFail();

        $data = $request->validate([
            'from_rack_id' => ['required', 'exists:racks,id', 'different:to_rack_id'],
            'to_rack_id' => ['required', 'exists:racks,id'],
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($request, $warehouse, $data) {
            $fromRack = Rack::with(['zone.warehouse', 'rackStocks'])->findOrFail($data['from_rack_id']);
            $toRack = Rack::with(['zone.warehouse', 'rackStocks'])->findOrFail($data['to_rack_id']);

            if ((int) $fromRack->zone->warehouse_id !== (int) $warehouse->id || (int) $toRack->zone->warehouse_id !== (int) $warehouse->id) {
                throw ValidationException::withMessages([
                    'from_rack_id' => 'Rack transfer must stay inside the operational warehouse.',
                ]);
            }

            $sourceStock = RackStock::where('rack_id', $fromRack->id)
                ->where('product_id', $data['product_id'])
                ->first();

            $availableQuantity = max(0, (int) ($sourceStock?->quantity ?? 0) - (int) ($sourceStock?->reserved_quantity ?? 0));

            if (! $sourceStock || $availableQuantity < (int) $data['quantity']) {
                throw ValidationException::withMessages([
                    'quantity' => 'Insufficient available stock in source rack. Available: '.$availableQuantity.' units.',
                ]);
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

            $transfer = StockTransfer::create([
                'transfer_number' => 'TRF-' . now()->format('Ymd-His') . '-' . strtoupper(Str::random(4)),
                'from_warehouse_id' => $warehouse->id,
                'to_warehouse_id' => $warehouse->id,
                'transfer_date' => now()->toDateString(),
                'status' => 'completed',
                'notes' => $data['notes'] ?? 'Rack transfer '.$fromRack->code.' to '.$toRack->code,
                'created_by' => $request->user()->id,
            ]);

            StockTransferItem::create([
                'stock_transfer_id' => $transfer->id,
                'product_id' => (int) $data['product_id'],
                'quantity' => (int) $data['quantity'],
            ]);

            $sourceStock->decrement('quantity', (int) $data['quantity']);
            $sourceStock->forceFill(['last_updated_at' => now()])->save();

            $targetStock = RackStock::firstOrNew([
                'rack_id' => $toRack->id,
                'product_id' => (int) $data['product_id'],
            ]);
            $targetStock->quantity = (int) $targetStock->quantity + (int) $data['quantity'];
            $targetStock->reserved_quantity = (int) ($targetStock->reserved_quantity ?? 0);
            $targetStock->last_updated_at = now();
            $targetStock->save();

            $this->syncProductStock((int) $warehouse->id, (int) $data['product_id']);

            $this->recordMovement(
                request: $request,
                productId: (int) $data['product_id'],
                warehouseId: (int) $warehouse->id,
                type: 'transfer',
                referenceType: 'stock_transfer',
                referenceId: (int) $transfer->id,
                quantity: (int) $data['quantity'],
                stockBefore: $stockBefore,
                stockAfter: $stockBefore,
                notes: ($data['notes'] ?? 'Internal rack transfer').' ['.$fromRack->code.' -> '.$toRack->code.']',
            );
        });

        return redirect()->route('rack.allocation')->with('status', 'Stock transfer completed.');
    }

    public function show(StockTransfer $stockTransfer): Response
    {
        $stockTransfer->load([
            'fromWarehouse:id,name,location',
            'toWarehouse:id,name,location',
            'items.product:id,sku,name',
            'creator:id,name,email',
        ]);

        return Inertia::render('StockTransferDetail', [
            'transfer' => [
                'id' => $stockTransfer->id,
                'number' => $stockTransfer->transfer_number,
                'date' => $stockTransfer->transfer_date?->format('Y-m-d'),
                'date_label' => $stockTransfer->transfer_date?->format('d M Y'),
                'status' => $stockTransfer->status,
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
                ]),
                'total_quantity' => $stockTransfer->items->sum('quantity'),
            ],
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
                ['key' => 'quantity', 'label' => 'Qty', 'align' => 'right'],
            ],
            'rows' => $stockTransfer->items->map(fn (StockTransferItem $item) => [
                'product' => $item->product?->name,
                'sku' => $item->product?->sku,
                'quantity' => number_format((float) $item->quantity, 0, ',', '.'),
            ])->all(),
        ];
    }
}
