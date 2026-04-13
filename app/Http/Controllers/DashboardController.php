<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Rack;
use App\Models\RackStock;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $now = Carbon::now();
        $twentyFourHoursAgo = $now->copy()->subDay();
        $twoDaysAgo = $now->copy()->subDays(2);
        $sevenDaysAgo = $now->copy()->subDays(7);

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
            'racks' => $racks
        ]);
    }
}

