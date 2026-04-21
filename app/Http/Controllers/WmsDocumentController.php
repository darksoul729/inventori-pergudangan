<?php

namespace App\Http\Controllers;

use App\Models\GoodsReceipt;
use App\Models\StockAdjustment;
use App\Models\StockOpname;
use App\Models\StockOut;
use App\Models\StockTransfer;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class WmsDocumentController extends Controller
{
    public function index(): Response
    {
        $documents = $this->documents();

        return Inertia::render('WmsDocuments', [
            'documents' => $documents,
            'stats' => [
                'total' => $documents->count(),
                'goods_receipt' => $documents->where('type', 'goods_receipt')->count(),
                'stock_out' => $documents->where('type', 'stock_out')->count(),
                'stock_transfer' => $documents->where('type', 'stock_transfer')->count(),
                'stock_opname' => $documents->where('type', 'stock_opname')->count(),
                'stock_adjustment' => $documents->where('type', 'stock_adjustment')->count(),
            ],
        ]);
    }

    public function export(Request $request)
    {
        $documents = $this->filterDocuments($this->documents(), $request);

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="wms_documents_'.now()->format('Ymd_His').'.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($documents) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($file, [
                'Document Number',
                'Document Type',
                'Date',
                'Status',
                'Party / Source',
                'Warehouse',
                'Item Count',
                'Total Quantity',
                'Operator',
                'Summary',
            ]);

            foreach ($documents as $document) {
                fputcsv($file, [
                    $document['number'],
                    $document['type_label'],
                    $document['date'],
                    $document['status'],
                    $document['party'],
                    $document['warehouse'],
                    $document['item_count'],
                    $document['total_quantity'],
                    $document['operator'],
                    $document['summary'],
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function downloadPdf(Request $request)
    {
        $documents = $this->filterDocuments($this->documents(), $request);

        $pdf = Pdf::loadView('wms_documents.export_pdf', [
            'documents' => $documents,
            'generatedAt' => now(),
            'filters' => [
                'type' => $request->input('type', 'all'),
                'search' => $request->input('search', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to' => $request->input('date_to', ''),
            ],
        ])->setPaper('a4', 'landscape');

        return $pdf->download('Dokumen_WMS_'.now()->format('Ymd_His').'.pdf');
    }

    private function documents(): Collection
    {
        return collect()
            ->merge($this->goodsReceipts())
            ->merge($this->stockOuts())
            ->merge($this->stockTransfers())
            ->merge($this->stockOpnames())
            ->merge($this->stockAdjustments())
            ->sortByDesc('sort_date')
            ->values()
            ->take(120)
            ->map(fn (array $document) => collect($document)->except('sort_date')->all());
    }

    private function filterDocuments(Collection $documents, Request $request): Collection
    {
        $type = $request->input('type', 'all');
        $search = strtolower(trim((string) $request->input('search', '')));
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        return $documents
            ->filter(function (array $document) use ($type, $search, $dateFrom, $dateTo) {
                $matchesType = $type === 'all' || $document['type'] === $type;
                $matchesDateFrom = ! $dateFrom || ($document['date'] ?? '') >= $dateFrom;
                $matchesDateTo = ! $dateTo || ($document['date'] ?? '') <= $dateTo;
                $haystack = strtolower(implode(' ', array_filter([
                    $document['number'] ?? '',
                    $document['type_label'] ?? '',
                    $document['party'] ?? '',
                    $document['warehouse'] ?? '',
                    $document['operator'] ?? '',
                    $document['summary'] ?? '',
                    $document['status'] ?? '',
                ])));

                return $matchesType
                    && $matchesDateFrom
                    && $matchesDateTo
                    && ($search === '' || str_contains($haystack, $search));
            })
            ->values();
    }

    private function goodsReceipts(): Collection
    {
        return GoodsReceipt::query()
            ->with(['supplier', 'warehouse', 'creator', 'items'])
            ->latest('receipt_date')
            ->latest('id')
            ->limit(40)
            ->get()
            ->map(fn (GoodsReceipt $receipt) => [
                'id' => 'goods_receipt-'.$receipt->id,
                'type' => 'goods_receipt',
                'type_label' => 'Goods Receipt',
                'number' => $receipt->receipt_number,
                'date' => optional($receipt->receipt_date)->format('Y-m-d') ?? optional($receipt->created_at)->format('Y-m-d'),
                'date_label' => optional($receipt->receipt_date)->format('d M Y') ?? optional($receipt->created_at)->format('d M Y'),
                'sort_date' => $receipt->receipt_date ?? $receipt->created_at,
                'status' => ucfirst($receipt->status ?? 'completed'),
                'party' => $receipt->supplier?->name ?? 'Pemasok tidak tercatat',
                'warehouse' => $receipt->warehouse?->name ?? 'Gudang utama',
                'operator' => $receipt->creator?->name ?? 'Sistem',
                'item_count' => $receipt->items->count(),
                'total_quantity' => (float) $receipt->items->sum('quantity_received'),
                'summary' => 'Penerimaan barang dari purchase order',
                'url' => route('goods-receipts.show', $receipt),
                'pdf_url' => route('goods-receipts.pdf', $receipt),
            ]);
    }

    private function stockOuts(): Collection
    {
        return StockOut::query()
            ->with(['customer', 'warehouse', 'creator', 'items'])
            ->latest('out_date')
            ->latest('id')
            ->limit(40)
            ->get()
            ->map(fn (StockOut $stockOut) => [
                'id' => 'stock_out-'.$stockOut->id,
                'type' => 'stock_out',
                'type_label' => 'Stock Out',
                'number' => $stockOut->stock_out_number,
                'date' => optional($stockOut->out_date)->format('Y-m-d') ?? optional($stockOut->created_at)->format('Y-m-d'),
                'date_label' => optional($stockOut->out_date)->format('d M Y') ?? optional($stockOut->created_at)->format('d M Y'),
                'sort_date' => $stockOut->out_date ?? $stockOut->created_at,
                'status' => ucfirst($stockOut->status ?? 'completed'),
                'party' => $stockOut->customer?->name ?? 'Umum',
                'warehouse' => $stockOut->warehouse?->name ?? 'Gudang utama',
                'operator' => $stockOut->creator?->name ?? 'Sistem',
                'item_count' => $stockOut->items->count(),
                'total_quantity' => (float) $stockOut->items->sum('quantity'),
                'summary' => $stockOut->purpose ?: 'Pengeluaran barang',
                'url' => route('stock-outs.show', $stockOut),
                'pdf_url' => route('stock-outs.pdf', $stockOut),
            ]);
    }

    private function stockTransfers(): Collection
    {
        return StockTransfer::query()
            ->with(['fromWarehouse', 'toWarehouse', 'creator', 'items'])
            ->latest('transfer_date')
            ->latest('id')
            ->limit(40)
            ->get()
            ->map(fn (StockTransfer $transfer) => [
                'id' => 'stock_transfer-'.$transfer->id,
                'type' => 'stock_transfer',
                'type_label' => 'Transfer Rack',
                'number' => $transfer->transfer_number,
                'date' => optional($transfer->transfer_date)->format('Y-m-d') ?? optional($transfer->created_at)->format('Y-m-d'),
                'date_label' => optional($transfer->transfer_date)->format('d M Y') ?? optional($transfer->created_at)->format('d M Y'),
                'sort_date' => $transfer->transfer_date ?? $transfer->created_at,
                'status' => ucfirst($transfer->status ?? 'completed'),
                'party' => 'Internal warehouse',
                'warehouse' => trim(($transfer->fromWarehouse?->name ?? 'Gudang utama').' -> '.($transfer->toWarehouse?->name ?? 'Gudang utama')),
                'operator' => $transfer->creator?->name ?? 'Sistem',
                'item_count' => $transfer->items->count(),
                'total_quantity' => (float) $transfer->items->sum('quantity'),
                'summary' => 'Perpindahan stok antar rack/bin',
                'url' => route('rack.allocation.transfers.show', $transfer),
                'pdf_url' => route('rack.allocation.transfers.pdf', $transfer),
            ]);
    }

    private function stockOpnames(): Collection
    {
        return StockOpname::query()
            ->with(['warehouse', 'creator', 'items'])
            ->latest('opname_date')
            ->latest('id')
            ->limit(40)
            ->get()
            ->map(fn (StockOpname $opname) => [
                'id' => 'stock_opname-'.$opname->id,
                'type' => 'stock_opname',
                'type_label' => 'Stock Opname',
                'number' => $opname->opname_number,
                'date' => optional($opname->opname_date)->format('Y-m-d') ?? optional($opname->created_at)->format('Y-m-d'),
                'date_label' => optional($opname->opname_date)->format('d M Y') ?? optional($opname->created_at)->format('d M Y'),
                'sort_date' => $opname->opname_date ?? $opname->created_at,
                'status' => $opname->items->sum('difference') == 0 ? 'Balanced' : 'Variance',
                'party' => 'Audit stok fisik',
                'warehouse' => $opname->warehouse?->name ?? 'Gudang utama',
                'operator' => $opname->creator?->name ?? 'Sistem',
                'item_count' => $opname->items->count(),
                'total_quantity' => (float) $opname->items->sum('physical_stock'),
                'summary' => 'Selisih bersih: '.number_format((float) $opname->items->sum('difference'), 0, ',', '.'),
                'url' => route('stock-opname.show', $opname),
                'pdf_url' => route('stock-opname.pdf', $opname),
            ]);
    }

    private function stockAdjustments(): Collection
    {
        $hasStockOpnameColumn = Schema::hasColumn('stock_adjustments', 'stock_opname_id');
        $relations = ['warehouse', 'creator', 'items'];

        if ($hasStockOpnameColumn) {
            $relations[] = 'stockOpname';
        }

        return StockAdjustment::query()
            ->with($relations)
            ->latest('adjustment_date')
            ->latest('id')
            ->limit(40)
            ->get()
            ->map(fn (StockAdjustment $adjustment) => [
                'id' => 'stock_adjustment-'.$adjustment->id,
                'type' => 'stock_adjustment',
                'type_label' => 'Stock Adjustment',
                'number' => $adjustment->adjustment_number,
                'date' => optional($adjustment->adjustment_date)->format('Y-m-d') ?? optional($adjustment->created_at)->format('Y-m-d'),
                'date_label' => optional($adjustment->adjustment_date)->format('d M Y') ?? optional($adjustment->created_at)->format('d M Y'),
                'sort_date' => $adjustment->adjustment_date ?? $adjustment->created_at,
                'status' => ucfirst($adjustment->reason ?? 'adjustment'),
                'party' => $hasStockOpnameColumn && $adjustment->stockOpname?->opname_number
                    ? 'Dari '.$adjustment->stockOpname->opname_number
                    : 'Koreksi stok',
                'warehouse' => $adjustment->warehouse?->name ?? 'Gudang utama',
                'operator' => $adjustment->creator?->name ?? 'Sistem',
                'item_count' => $adjustment->items->count(),
                'total_quantity' => (float) $adjustment->items->sum('quantity'),
                'summary' => 'Penyesuaian stok otomatis/manual',
                'url' => route('stock-adjustments.show', $adjustment),
                'pdf_url' => route('stock-adjustments.pdf', $adjustment),
            ]);
    }
}
