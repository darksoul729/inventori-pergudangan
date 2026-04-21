<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\GoodsReceipt;
use App\Models\Rack;
use App\Models\RackStock;
use App\Models\StockAdjustment;
use App\Models\StockMovement;
use App\Models\StockOpname;
use App\Models\StockOut;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $now = Carbon::now();
        $twentyFourHoursAgo = $now->copy()->subDay();
        $twoDaysAgo = $now->copy()->subDays(2);
        $sevenDaysAgo = $now->copy()->subDays(7);
        $today = $now->toDateString();
        $roleName = strtolower((string) ($request->user()?->role?->name ?? ''));
        $canViewOperationalDocs = str_contains($roleName, 'manager')
            || str_contains($roleName, 'supervisor');

        // 1. TOTAL INVENTORY
        $totalInventory = (int) RackStock::sum('quantity');

        // 2. OUTBOUND RATE (Average per hour for last 24h)
        $outboundLast24h = StockMovement::where('movement_type', 'out')
            ->where('movement_date', '>=', $twentyFourHoursAgo)
            ->sum('quantity');
        $outboundRate = round($outboundLast24h / 24, 1);

        // 3. SYSTEM ALERTS
        // Low stock count
        $lowStockCount = DB::table('products')
            ->leftJoin('rack_stocks', 'products.id', '=', 'rack_stocks.product_id')
            ->select('products.id')
            ->groupBy('products.id', 'products.minimum_stock')
            ->havingRaw('SUM(COALESCE(rack_stocks.quantity, 0)) < products.minimum_stock')
            ->get()
            ->count();
        
        // Recent adjustments/opnames count
        $recentAuditCount = StockMovement::whereIn('movement_type', ['adjustment', 'opname'])
            ->where('movement_date', '>=', $twoDaysAgo)
            ->count();
        
        $systemAlerts = $lowStockCount + $recentAuditCount;

        // 4. ACTIVE NODES
        $activeNodes = Rack::count();

        // Rack Visualization Data
        $racks = Rack::with(['zone'])
            ->withSum('rackStocks as total_qty', 'quantity')
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'code' => $r->code,
                'capacity' => $r->capacity,
                'current_qty' => (int) $r->total_qty,
                'is_occupied' => $r->total_qty > 0,
                'has_alert' => $r->total_qty > ($r->capacity * 0.9),
                'fill_percent' => $r->capacity > 0 ? round(($r->total_qty / $r->capacity) * 100, 1) : 0,
                'zone_name' => $r->zone?->name ?? 'Unassigned',
                'zone_id' => $r->warehouse_zone_id,
                'created_at' => $r->created_at->toIso8601String(),
            ]);



        // 5. STOCK MOVEMENT TREND (Last 7 Days)

        $trends = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i)->format('Y-m-d');
            $inbound = StockMovement::where('movement_type', 'in')
                ->whereDate('movement_date', $date)
                ->sum('quantity');
            $outbound = StockMovement::where('movement_type', 'out')
                ->whereDate('movement_date', $date)
                ->sum('quantity');
            
            $trends[] = [
                'date' => $date,
                'label' => $now->copy()->subDays($i)->format('D'),
                'inbound' => (int) $inbound,
                'outbound' => (int) $outbound,
            ];
        }

        // Efficiency Score (Simulated based on rack occupancy)
        $totalRacks = Rack::count();
        $occupiedRacks = RackStock::distinct('rack_id')->count();
        $efficiencyScore = $totalRacks > 0 ? round(($occupiedRacks / $totalRacks) * 100, 1) : 0;
        $rackCapacity = (int) Rack::sum('capacity');
        $rackUtilization = $rackCapacity > 0 ? round(($totalInventory / $rackCapacity) * 100, 1) : 0;
        $todayInbound = (int) StockMovement::where('movement_type', 'in')
            ->whereDate('movement_date', $today)
            ->sum('quantity');
        $todayOutbound = (int) StockMovement::where('movement_type', 'out')
            ->whereDate('movement_date', $today)
            ->sum('quantity');
        $todayVariance = (int) StockMovement::where('movement_type', 'adjustment')
            ->whereDate('movement_date', $today)
            ->sum('quantity');
        $todayDocuments = (int) (
            GoodsReceipt::whereDate('receipt_date', $today)->count()
            + StockOut::whereDate('out_date', $today)->count()
            + StockOpname::whereDate('opname_date', $today)->count()
            + StockAdjustment::whereDate('adjustment_date', $today)->count()
        );

        $wmsKpis = [
            'today_inbound' => $todayInbound,
            'today_outbound' => $todayOutbound,
            'today_variance' => $todayVariance,
            'today_documents' => $todayDocuments,
            'rack_utilization' => $rackUtilization,
            'rack_capacity' => $rackCapacity,
            'empty_racks' => max($totalRacks - $occupiedRacks, 0),
            'near_full_racks' => $racks->where('has_alert', true)->count(),
            'audit_queue' => StockMovement::whereIn('movement_type', ['adjustment', 'opname'])
                ->where('movement_date', '>=', $twoDaysAgo)
                ->count(),
            'can_view_wms_documents' => $canViewOperationalDocs,
            'latest_documents' => $this->latestWmsDocuments($canViewOperationalDocs),
        ];

        // Trends for KPI Cards (percentage change)
        $prevTwentyFourHoursAgo = $twentyFourHoursAgo->copy()->subDay();
        
        $prevInventory = (int) DB::table('stock_movements')
            ->where('movement_date', '<', $twentyFourHoursAgo)
            ->sum(DB::raw("CASE WHEN movement_type = 'in' THEN quantity WHEN movement_type = 'out' THEN -quantity ELSE 0 END"));
        // Simplified trend for inventory: just compare recent movements
        $inventoryChange = StockMovement::where('movement_date', '>=', $twentyFourHoursAgo)
            ->sum(DB::raw("CASE WHEN movement_type = 'in' THEN quantity WHEN movement_type = 'out' THEN -quantity ELSE 0 END"));
        $inventoryTrend = $totalInventory > 0 ? round(($inventoryChange / ($totalInventory - $inventoryChange + 1)) * 100, 1) : 0;

        $prevOutbound = StockMovement::where('movement_type', 'out')
            ->whereBetween('movement_date', [$prevTwentyFourHoursAgo, $twentyFourHoursAgo])
            ->sum('quantity');
        $outboundTrend = $prevOutbound > 0 ? round((($outboundLast24h - $prevOutbound) / $prevOutbound) * 100, 1) : 0;

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_inventory' => $totalInventory,
                'inventory_trend' => ($inventoryTrend >= 0 ? '+' : '') . $inventoryTrend . '%',
                'outbound_rate' => $outboundRate,
                'outbound_trend' => ($outboundTrend >= 0 ? '+' : '') . $outboundTrend . '%',
                'system_alerts' => $systemAlerts,
                'active_nodes' => $activeNodes,
                'efficiency_score' => $efficiencyScore,
            ],
            'trends' => $trends,
            'racks' => $racks,
            'wmsKpis' => $wmsKpis,
        ]);
    }

    private function latestWmsDocuments(bool $canViewOperationalDocs)
    {
        return collect()
            ->merge(GoodsReceipt::query()
                ->with('supplier:id,name')
                ->latest('receipt_date')
                ->limit(5)
                ->get()
                ->map(fn (GoodsReceipt $receipt) => [
                    'type' => 'Goods Receipt',
                    'number' => $receipt->receipt_number,
                    'date' => $receipt->receipt_date?->format('d M Y'),
                    'party' => $receipt->supplier?->name ?? 'Pemasok',
                    'url' => route('goods-receipts.show', $receipt),
                    'sort_date' => $receipt->receipt_date ?? $receipt->created_at,
                ]))
            ->merge(StockOut::query()
                ->with('customer:id,name')
                ->latest('out_date')
                ->limit(5)
                ->get()
                ->map(fn (StockOut $stockOut) => [
                    'type' => 'Stock Out',
                    'number' => $stockOut->stock_out_number,
                    'date' => $stockOut->out_date?->format('d M Y'),
                    'party' => $stockOut->customer?->name ?? 'Umum',
                    'url' => route('stock-outs.show', $stockOut),
                    'sort_date' => $stockOut->out_date ?? $stockOut->created_at,
                ]))
            ->merge(StockOpname::query()
                ->latest('opname_date')
                ->limit(5)
                ->get()
                ->map(fn (StockOpname $opname) => [
                    'type' => 'Stock Opname',
                    'number' => $opname->opname_number,
                    'date' => $opname->opname_date?->format('d M Y'),
                    'party' => 'Audit stok',
                    'url' => $canViewOperationalDocs ? route('stock-opname.show', $opname) : null,
                    'sort_date' => $opname->opname_date ?? $opname->created_at,
                ]))
            ->merge(StockAdjustment::query()
                ->latest('adjustment_date')
                ->limit(5)
                ->get()
                ->map(fn (StockAdjustment $adjustment) => [
                    'type' => 'Stock Adjustment',
                    'number' => $adjustment->adjustment_number,
                    'date' => $adjustment->adjustment_date?->format('d M Y'),
                    'party' => 'Koreksi stok',
                    'url' => $canViewOperationalDocs ? route('stock-adjustments.show', $adjustment) : null,
                    'sort_date' => $adjustment->adjustment_date ?? $adjustment->created_at,
                ]))
            ->sortByDesc('sort_date')
            ->values()
            ->take(6)
            ->map(fn (array $document) => collect($document)->except('sort_date')->all());
    }
}
