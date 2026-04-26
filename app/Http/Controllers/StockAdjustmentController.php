<?php

namespace App\Http\Controllers;

use App\Models\StockMovement;
use App\Models\ProductStock;
use App\Models\Rack;
use App\Models\RackStock;
use App\Models\StockAdjustment;
use App\Models\StockAdjustmentItem;
use App\Traits\HandlesStockSync;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StockAdjustmentController extends Controller
{
    use HandlesStockSync;

    public function show(StockAdjustment $stockAdjustment): Response
    {
        $relations = [
            'warehouse:id,name,location',
            'creator:id,name,email',
            'items.product:id,sku,name',
        ];

        if (Schema::hasColumn('stock_adjustments', 'stock_opname_id')) {
            $relations[] = 'stockOpname:id,opname_number,opname_date';
        }

        $stockAdjustment->load($relations);

        $inQuantity = $stockAdjustment->items
            ->where('adjustment_type', 'in')
            ->sum('quantity');
        $outQuantity = $stockAdjustment->items
            ->where('adjustment_type', 'out')
            ->sum('quantity');

        return Inertia::render('StockAdjustmentDetail', [
            'adjustment' => [
                'id' => $stockAdjustment->id,
                'number' => $stockAdjustment->adjustment_number,
                'date' => $stockAdjustment->adjustment_date?->format('Y-m-d'),
                'date_label' => $stockAdjustment->adjustment_date?->format('d M Y'),
                'status' => $stockAdjustment->status ?? 'completed',
                'reason' => $stockAdjustment->reason,
                'notes' => $stockAdjustment->notes,
                'warehouse' => $stockAdjustment->warehouse,
                'operator' => $stockAdjustment->creator,
                'stock_opname' => Schema::hasColumn('stock_adjustments', 'stock_opname_id') && $stockAdjustment->stockOpname ? [
                    'id' => $stockAdjustment->stockOpname->id,
                    'number' => $stockAdjustment->stockOpname->opname_number,
                    'date_label' => $stockAdjustment->stockOpname->opname_date?->format('d M Y'),
                    'url' => route('stock-opname.show', $stockAdjustment->stockOpname),
                ] : null,
                'items' => $stockAdjustment->items->map(fn (StockAdjustmentItem $item) => [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'sku' => $item->product?->sku,
                    'name' => $item->product?->name,
                    'adjustment_type' => $item->adjustment_type,
                    'quantity' => $item->quantity,
                    'note' => $this->presentAdjustmentItemNote($item),
                ]),
                'items_count' => $stockAdjustment->items->count(),
                'in_quantity' => (int) $inQuantity,
                'out_quantity' => (int) $outQuantity,
                'net_quantity' => (int) $inQuantity - (int) $outQuantity,
                'total_quantity' => (int) $stockAdjustment->items->sum('quantity'),
                'can_approve' => Gate::check('approve-stockAdjustment'),
            ],
        ]);
    }

    public function approve(Request $request, StockAdjustment $stockAdjustment): RedirectResponse
    {
        Gate::authorize('approve-stockAdjustment');

        if (($stockAdjustment->status ?? 'completed') !== 'pending') {
            throw ValidationException::withMessages([
                'status' => 'Adjustment sudah diproses sebelumnya.',
            ]);
        }

        if ((int) $stockAdjustment->created_by === (int) $request->user()->id) {
            throw ValidationException::withMessages([
                'status' => 'Adjustment tidak bisa disetujui oleh pembuat dokumen yang sama.',
            ]);
        }

        DB::transaction(function () use ($request, $stockAdjustment) {
            if ($stockAdjustment->reason === 'manual_rack_stock') {
                $stockAdjustment->loadMissing('items');
                $this->applyManualRackAdjustment($request, $stockAdjustment);
            }

            $stockAdjustment->update(['status' => 'completed']);

            StockMovement::where('reference_type', 'stock_adjustment')
                ->where('reference_id', $stockAdjustment->id)
                ->update([
                    'verification_status' => 'verified',
                    'verified_at' => now(),
                    'verified_by' => $request->user()->id,
                    'verification_notes' => $request->input('notes', 'Approved from stock adjustment detail.'),
                ]);
        });

        return back()->with('status', 'Stock adjustment disetujui.');
    }

    public function reject(Request $request, StockAdjustment $stockAdjustment): RedirectResponse
    {
        Gate::authorize('approve-stockAdjustment');

        if (($stockAdjustment->status ?? 'completed') !== 'pending') {
            throw ValidationException::withMessages([
                'status' => 'Adjustment sudah diproses sebelumnya.',
            ]);
        }

        DB::transaction(function () use ($request, $stockAdjustment) {
            $stockAdjustment->update(['status' => 'rejected']);

            StockMovement::where('reference_type', 'stock_adjustment')
                ->where('reference_id', $stockAdjustment->id)
                ->update([
                    'verification_status' => 'rejected',
                    'verified_at' => now(),
                    'verified_by' => $request->user()->id,
                    'verification_notes' => $request->input('notes', 'Rejected from stock adjustment detail.'),
                ]);
        });

        return back()->with('status', 'Stock adjustment ditolak.');
    }

    public function downloadPdf(StockAdjustment $stockAdjustment)
    {
        $document = $this->documentPayload($stockAdjustment);

        $pdf = Pdf::loadView('wms_documents.document_pdf', [
            'document' => $document,
            'generatedAt' => now(),
        ])->setPaper('a4', 'portrait');

        return $pdf->download('Stock_Adjustment_'.$stockAdjustment->adjustment_number.'.pdf');
    }

    private function documentPayload(StockAdjustment $stockAdjustment): array
    {
        $relations = [
            'warehouse:id,name,location',
            'creator:id,name,email',
            'items.product:id,sku,name',
        ];

        if (Schema::hasColumn('stock_adjustments', 'stock_opname_id')) {
            $relations[] = 'stockOpname:id,opname_number,opname_date';
        }

        $stockAdjustment->loadMissing($relations);

        $inQuantity = $stockAdjustment->items
            ->where('adjustment_type', 'in')
            ->sum('quantity');
        $outQuantity = $stockAdjustment->items
            ->where('adjustment_type', 'out')
            ->sum('quantity');

        return [
            'title' => 'Stock Adjustment',
            'subtitle' => 'Dokumen koreksi stok hasil adjustment',
            'number' => $stockAdjustment->adjustment_number,
            'status' => ucfirst($stockAdjustment->reason ?? 'adjustment'),
            'stats' => [
                ['label' => 'Tanggal Adjustment', 'value' => $stockAdjustment->adjustment_date?->format('d M Y') ?? '-'],
                ['label' => 'Qty Masuk', 'value' => number_format((float) $inQuantity, 0, ',', '.')],
                ['label' => 'Qty Keluar', 'value' => number_format((float) $outQuantity, 0, ',', '.')],
                ['label' => 'Net', 'value' => number_format((float) $inQuantity - (float) $outQuantity, 0, ',', '.')],
            ],
            'details' => [
                ['label' => 'Warehouse', 'value' => $stockAdjustment->warehouse?->name],
                ['label' => 'Lokasi', 'value' => $stockAdjustment->warehouse?->location],
                ['label' => 'Operator', 'value' => $stockAdjustment->creator?->name],
                ['label' => 'Dokumen Opname', 'value' => Schema::hasColumn('stock_adjustments', 'stock_opname_id') ? $stockAdjustment->stockOpname?->opname_number : null],
                ['label' => 'Alasan', 'value' => $stockAdjustment->reason],
                ['label' => 'Catatan', 'value' => $stockAdjustment->notes],
            ],
            'columns' => [
                ['key' => 'product', 'label' => 'Produk'],
                ['key' => 'sku', 'label' => 'SKU'],
                ['key' => 'type', 'label' => 'Tipe'],
                ['key' => 'quantity', 'label' => 'Qty', 'align' => 'right'],
                ['key' => 'note', 'label' => 'Catatan'],
            ],
            'rows' => $stockAdjustment->items->map(fn (StockAdjustmentItem $item) => [
                'product' => $item->product?->name,
                'sku' => $item->product?->sku,
                'type' => $item->adjustment_type === 'in' ? 'Masuk' : 'Keluar',
                'quantity' => number_format((float) $item->quantity, 0, ',', '.'),
                'note' => $this->presentAdjustmentItemNote($item) ?: '-',
            ])->all(),
        ];
    }

    private function applyManualRackAdjustment(Request $request, StockAdjustment $stockAdjustment): void
    {
        foreach ($stockAdjustment->items as $item) {
            $payload = $this->extractManualRackPayload($item);
            if (! $payload) {
                continue;
            }

            $rackId = (int) ($payload['rack_id'] ?? 0);
            $productId = (int) ($payload['product_id'] ?? $item->product_id);
            $fromQuantity = (int) ($payload['from_quantity'] ?? 0);
            $toQuantity = (int) ($payload['to_quantity'] ?? 0);
            $reservedQuantity = max(0, min((int) ($payload['reserved_quantity'] ?? 0), $toQuantity));

            if ($rackId <= 0 || $productId <= 0) {
                throw ValidationException::withMessages([
                    'status' => 'Payload adjustment manual tidak valid.',
                ]);
            }

            $rack = Rack::with('rackStocks')->findOrFail($rackId);
            $warehouseId = (int) $rack->zone->warehouse_id;

            if ($toQuantity > 0) {
                $this->ensureRackCapacity($rack, $toQuantity, $productId, 'status');
            }

            $stockBefore = (int) (ProductStock::where('warehouse_id', $warehouseId)
                ->where('product_id', $productId)
                ->value('current_stock') ?? 0);

            $rackStock = RackStock::firstOrNew([
                'rack_id' => $rackId,
                'product_id' => $productId,
            ]);

            if ($toQuantity <= 0) {
                $rackStock->exists && $rackStock->delete();
            } else {
                $rackStock->quantity = $toQuantity;
                $rackStock->reserved_quantity = $reservedQuantity;
                $rackStock->batch_number = $payload['batch_number'] ?? null;
                $rackStock->expired_date = $payload['expired_date'] ?? null;
                $rackStock->last_updated_at = now();
                $rackStock->save();
            }

            $this->syncProductStock($warehouseId, $productId);

            $stockAfter = (int) (ProductStock::where('warehouse_id', $warehouseId)
                ->where('product_id', $productId)
                ->value('current_stock') ?? 0);

            $delta = $toQuantity - $fromQuantity;
            $this->recordMovement(
                request: $request,
                productId: $productId,
                warehouseId: $warehouseId,
                type: 'adjustment',
                referenceType: 'stock_adjustment',
                referenceId: $stockAdjustment->id,
                quantity: abs($delta),
                stockBefore: $stockBefore,
                stockAfter: $stockAfter,
                notes: 'Manual rack stock correction approved on '.$rack->code,
            );
        }
    }

    private function presentAdjustmentItemNote(StockAdjustmentItem $item): ?string
    {
        $payload = $this->extractManualRackPayload($item);
        if (! $payload) {
            return $item->note;
        }

        $action = strtolower((string) ($payload['action'] ?? 'set'));
        $rackId = $payload['rack_id'] ?? '-';
        $fromQty = $payload['from_quantity'] ?? 0;
        $toQty = $payload['to_quantity'] ?? 0;

        return match ($action) {
            'delete' => "Manual request hapus stok rack #{$rackId} ({$fromQty} -> 0)",
            default => "Manual request update stok rack #{$rackId} ({$fromQty} -> {$toQty})",
        };
    }

    private function extractManualRackPayload(StockAdjustmentItem $item): ?array
    {
        $raw = (string) ($item->note ?? '');
        $prefix = 'MANUAL_RACK_STOCK::';
        if (!str_starts_with($raw, $prefix)) {
            return null;
        }

        $json = substr($raw, strlen($prefix));
        $payload = json_decode($json, true);
        return is_array($payload) ? $payload : null;
    }
}
