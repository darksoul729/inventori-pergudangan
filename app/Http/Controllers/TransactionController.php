<?php

namespace App\Http\Controllers;

use App\Models\StockMovement;
use App\Models\Warehouse;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = StockMovement::query()
            ->with(['product:id,sku,name', 'warehouse:id,name', 'user:id,name'])
            ->latest('movement_date');

        // Filter by Search (Transaction ID or SKU/Product Name)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhereHas('product', function($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by Type
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('movement_type', $request->type);
        }

        $movements = $query->paginate(15)->withQueryString();

        // Stats for Metric Cards
        $now = Carbon::now();
        $yesterday = $now->copy()->subDay();

        $inbound24h = StockMovement::where('movement_type', 'in')
            ->where('movement_date', '>=', $yesterday)
            ->sum('quantity');

        $outbound24h = StockMovement::where('movement_type', 'out')
            ->where('movement_date', '>=', $yesterday)
            ->sum('quantity');

        // Simulated "Pending Audits" - let's say any 'adjustment' or 'opname' in the last 48h that hasn't been "verified"
        // Since we don't have a 'status' field, we'll just count recent adjustments as "items to audit"
        $pendingAudits = StockMovement::whereIn('movement_type', ['adjustment', 'opname'])
            ->where('movement_date', '>=', $now->copy()->subDays(2))
            ->count();

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
                  });
            });
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('movement_type', $request->type);
        }

        $movements = $query->get();

        if ($request->format === 'json') {
            return response()->json([
                'movements' => $movements->map(fn($m) => [
                    'Log ID' => '#' . str_pad($m->id, 6, '0', STR_PAD_LEFT),
                    'Product Name' => $m->product?->name ?? 'N/A',
                    'SKU' => $m->product?->sku ?? 'N/A',
                    'Type' => ucfirst($m->movement_type),
                    'Quantity' => $m->quantity,
                    'Warehouse' => $m->warehouse?->name ?? 'N/A',
                    'Operator' => $m->user?->name ?? 'System',
                    'Timestamp' => $m->movement_date->format('Y-m-d H:i:s'),
                    'Notes' => $m->notes ?? ''
                ])
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
            fputcsv($file, ['Log ID', 'Product Name', 'SKU', 'Type', 'Quantity', 'Warehouse', 'Operator', 'Timestamp', 'Notes']);
            foreach ($movements as $m) {
                fputcsv($file, [
                    '#' . str_pad($m->id, 6, '0', STR_PAD_LEFT),
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
