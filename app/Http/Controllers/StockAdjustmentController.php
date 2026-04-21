<?php

namespace App\Http\Controllers;

use App\Models\StockAdjustment;
use App\Models\StockAdjustmentItem;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class StockAdjustmentController extends Controller
{
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
                    'note' => $item->note,
                ]),
                'items_count' => $stockAdjustment->items->count(),
                'in_quantity' => (int) $inQuantity,
                'out_quantity' => (int) $outQuantity,
                'net_quantity' => (int) $inQuantity - (int) $outQuantity,
                'total_quantity' => (int) $stockAdjustment->items->sum('quantity'),
            ],
        ]);
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
                'note' => $item->note ?: '-',
            ])->all(),
        ];
    }
}
