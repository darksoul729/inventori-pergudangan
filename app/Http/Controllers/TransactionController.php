<?php

namespace App\Http\Controllers;

use App\Models\StockMovement;
use App\Models\Warehouse;
use App\Models\Product;
use App\Models\GoodsReceipt;
use App\Models\StockOut;
use App\Models\StockAdjustment;
use App\Models\StockTransfer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = StockMovement::query()
            ->with(['product:id,sku,name', 'warehouse:id,name', 'user:id,name'])
            ->latest('movement_date');

        // Filter by Search (Transaction ID, SKU/Product Name, or Operator Name)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhereHas('product', function($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                  })
                  ->orWhereHas('user', function($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by Type
        if ($request->filled('type') && $request->type !== 'all') {
            $types = explode(',', $request->type);
            $query->whereIn('movement_type', $types);
        }

        $movements = $query->paginate(15)->withQueryString();
        $movements->through(function (StockMovement $movement) {
            $sourceDocument = $this->resolveSourceDocument($movement);
            $movement->setAttribute('source_document_number', $sourceDocument['number'] ?? null);
            $movement->setAttribute('source_document_label', $sourceDocument['label'] ?? null);

            return $movement;
        });

        // Stats for Metric Cards
        $now = Carbon::now();
        $yesterday = $now->copy()->subDay();

        $inbound24h = StockMovement::where('movement_type', 'in')
            ->where('movement_date', '>=', $yesterday)
            ->sum('quantity');

        $outbound24h = StockMovement::where('movement_type', 'out')
            ->where('movement_date', '>=', $yesterday)
            ->sum('quantity');

        // Use actual verification_status from database
        $pendingAudits = StockMovement::where('verification_status', 'pending')->count();

        // Stats for trends (comparison with previous 24h for the percentage)
        $prevYesterday = $yesterday->copy()->subDay();
        $prevInbound = StockMovement::where('movement_type', 'in')
            ->whereBetween('movement_date', [$prevYesterday, $yesterday])
            ->sum('quantity');
        $prevOutbound = StockMovement::where('movement_type', 'out')
            ->whereBetween('movement_date', [$prevYesterday, $yesterday])
            ->sum('quantity');

        $inboundTrend = $prevInbound > 0 ? round((($inbound24h - $prevInbound) / $prevInbound) * 100, 1) : 0;
        $outboundTrend = $prevOutbound > 0 ? round((($outbound24h - $prevOutbound) / $prevOutbound) * 100, 1) : 0;

        return Inertia::render('Transaction', [
            'movements' => $movements,
            'stats' => [
                'inbound_24h' => (int) $inbound24h,
                'inbound_trend' => $inboundTrend,
                'outbound_24h' => (int) $outbound24h,
                'outbound_trend' => $outboundTrend,
                'pending_audits' => $pendingAudits,
            ],
            'filters' => $request->only(['search', 'type']),
        ]);
    }

    
    public function show(StockMovement $transaction): Response
    {
        $transaction->load(['product', 'warehouse', 'user']);
        $sourceDocument = $this->resolveSourceDocument($transaction);

        return Inertia::render('TransactionDetail', [
            'transaction' => [
                'id' => $transaction->id,
                'movement_type' => $transaction->movement_type,
                'quantity' => $transaction->quantity,
                'stock_before' => $transaction->stock_before,
                'stock_after' => $transaction->stock_after,
                'reference_type' => $transaction->reference_type,
                'reference_id' => $transaction->reference_id,
                'movement_date' => $transaction->movement_date->format('Y-m-d H:i:s'),
                'notes' => $transaction->notes,
                'product' => $transaction->product ? [
                    'id' => $transaction->product->id,
                    'name' => $transaction->product->name,
                    'sku' => $transaction->product->sku,
                    'purchase_price' => $transaction->product->purchase_price,
                ] : null,
                'warehouse' => $transaction->warehouse ? [
                    'id' => $transaction->warehouse->id,
                    'name' => $transaction->warehouse->name,
                    'location' => $transaction->warehouse->location,
                ] : null,
                'user' => $transaction->user ? [
                    'id' => $transaction->user->id,
                    'name' => $transaction->user->name,
                    'email' => $transaction->user->email,
                ] : null,
                'source_document' => $sourceDocument,
                'verification_status' => $transaction->verification_status,
                'verified_at' => $transaction->verified_at ? $transaction->verified_at->format('Y-m-d H:i:s') : null,
                'verified_by_name' => $transaction->verifiedBy?->name,
                'verification_notes' => $transaction->verification_notes,
            ]
        ]);
    }

    public function verify(Request $request, StockMovement $transaction)
    {
        // Only adjustments and opnames can be verified (others are auto-verified)
        if (!in_array($transaction->movement_type, ['adjustment', 'opname'])) {
            return back()->withErrors(['message' => 'Transaksi ini tidak memerlukan verifikasi manual.']);
        }

        if ($transaction->verification_status === 'verified') {
            return back()->withErrors(['message' => 'Transaksi sudah diverifikasi sebelumnya.']);
        }

        $transaction->update([
            'verification_status' => 'verified',
            'verified_at' => now(),
            'verified_by' => auth()->id(),
            'verification_notes' => $request->notes,
        ]);

        return back()->with('success', 'Transaksi berhasil diverifikasi.');
    }

    private function resolveSourceDocument(StockMovement $transaction): ?array
    {
        if ($transaction->reference_type === 'goods_receipt') {
            $receipt = GoodsReceipt::find($transaction->reference_id);

            return $receipt ? [
                'label' => 'Goods Receipt',
                'number' => $receipt->receipt_number,
                'url' => route('goods-receipts.show', $receipt),
            ] : null;
        }

        if ($transaction->reference_type === 'stock_out') {
            $stockOut = StockOut::find($transaction->reference_id);

            return $stockOut ? [
                'label' => 'Stock Out',
                'number' => $stockOut->stock_out_number,
                'url' => route('stock-outs.show', $stockOut),
            ] : null;
        }

        if ($transaction->reference_type === 'stock_transfer') {
            $transfer = StockTransfer::find($transaction->reference_id);

            return $transfer ? [
                'label' => 'Transfer Rack',
                'number' => $transfer->transfer_number,
                'url' => route('rack.allocation.transfers.show', $transfer),
            ] : null;
        }

        if ($transaction->reference_type === 'stock_adjustment') {
            $adjustment = StockAdjustment::find($transaction->reference_id);

            return $adjustment ? [
                'label' => 'Stock Adjustment',
                'number' => $adjustment->adjustment_number,
                'url' => route('stock-adjustments.show', $adjustment),
            ] : null;
        }

        return null;
    }

    public function downloadPdf(StockMovement $transaction)
    {
        $transaction->load(['product', 'warehouse', 'user', 'verifiedBy']);

        $transactionNumber = 'TRX-' . str_pad($transaction->id, 6, '0', STR_PAD_LEFT);
        $documentNumber = 'BTPS/INV/' . $transaction->movement_date->format('Y') . '/' . str_pad($transaction->id, 6, '0', STR_PAD_LEFT);
        $sourceDocument = $this->resolveSourceDocument($transaction);
        $referenceNumber = $sourceDocument['number'] ?? ($transaction->reference_id
            ? 'REF-' . str_pad($transaction->reference_id, 5, '0', STR_PAD_LEFT)
            : $transactionNumber);

        $movementLabels = [
            'in' => 'Barang Masuk',
            'out' => 'Barang Keluar',
            'transfer' => 'Transfer Stok',
            'adjustment' => 'Penyesuaian',
            'opname' => 'Stock Opname',
        ];

        $movementLabel = $movementLabels[$transaction->movement_type] ?? 'Selesai';
        $unitPrice = (float) ($transaction->product?->purchase_price ?? 0);
        $totalValue = (int) $transaction->quantity * $unitPrice;
        $movementSign = match ($transaction->movement_type) {
            'in' => '+',
            'out', 'transfer' => '-',
            default => ((int) $transaction->stock_after >= (int) $transaction->stock_before ? '+' : '-'),
        };

        $pdf = Pdf::loadView('transactions.detail_pdf', [
            'transaction' => $transaction,
            'transactionNumber' => $transactionNumber,
            'documentNumber' => $documentNumber,
            'referenceNumber' => $referenceNumber,
            'movementLabel' => $movementLabel,
            'movementSign' => $movementSign,
            'unitPrice' => $unitPrice,
            'totalValue' => $totalValue,
            'generatedAt' => now(),
        ])->setPaper('a4', 'portrait');

        return $pdf->download("Bukti_Transaksi_{$transactionNumber}.pdf");
    }

    public function export(Request $request)
    {
        $query = StockMovement::query()
            ->with(['product:id,sku,name', 'warehouse:id,name', 'user:id,name'])
            ->latest('movement_date');

        // Apply filters (same as index)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhereHas('product', function($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                  })
                  ->orWhereHas('user', function($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('movement_type', $request->type);
        }

        $movements = $query->get();

        if ($request->format === 'json') {
            return response()->json([
                'movements' => $movements->map(function ($m) {
                    $sourceDocument = $this->resolveSourceDocument($m);

                    return [
                        'Log ID' => '#' . str_pad($m->id, 6, '0', STR_PAD_LEFT),
                        'Source Document' => $sourceDocument ? $sourceDocument['label'].' - '.$sourceDocument['number'] : '',
                        'Product Name' => $m->product?->name ?? 'N/A',
                        'SKU' => $m->product?->sku ?? 'N/A',
                        'Type' => ucfirst($m->movement_type),
                        'Quantity' => $m->quantity,
                        'Warehouse' => $m->warehouse?->name ?? 'N/A',
                        'Operator' => $m->user?->name ?? 'System',
                        'Timestamp' => $m->movement_date->format('Y-m-d H:i:s'),
                        'Notes' => $m->notes ?? ''
                    ];
                })
            ]);
        }

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="transactions_' . now()->format('Ymd_His') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function() use ($movements) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($file, ['Log ID', 'Source Document', 'Product Name', 'SKU', 'Type', 'Quantity', 'Warehouse', 'Operator', 'Timestamp', 'Notes']);
            foreach ($movements as $m) {
                $sourceDocument = $this->resolveSourceDocument($m);

                fputcsv($file, [
                    '#' . str_pad($m->id, 6, '0', STR_PAD_LEFT),
                    $sourceDocument ? $sourceDocument['label'].' - '.$sourceDocument['number'] : '',
                    $m->product?->name ?? 'N/A',
                    $m->product?->sku ?? 'N/A',
                    ucfirst($m->movement_type),
                    $m->quantity,
                    $m->warehouse?->name ?? 'N/A',
                    $m->user?->name ?? 'System',
                    $m->movement_date->format('Y-m-d H:i:s'),
                    $m->notes ?? ''
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
