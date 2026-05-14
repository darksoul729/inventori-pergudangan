<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Product;
use App\Models\Category;
use App\Models\Unit;
use App\Models\WarehouseZone;
use App\Models\GoodsReceipt;
use App\Models\Rack;
use App\Models\RackStock;
use App\Models\StockAdjustment;
use App\Models\StockMovement;
use App\Models\StockOpname;
use App\Models\StockOut;
use App\Models\StockTransfer;
use App\Models\Shipment;
use App\Models\Invoice;
use App\Models\TenantSubscription;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function operationalPdf(Request $request)
    {
        $now = Carbon::now();
        $today = $now->toDateString();
        $tenantId = (int) ($request->user()?->tenant_id ?? 0);

        $warehouse = Warehouse::query()
            ->when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))
            ->orderBy('id')
            ->first();

        $totalInventory = 0;
        $rackCapacity = 0;
        $rackUtilization = 0;
        $todayInbound = 0;
        $todayOutbound = 0;

        if ($warehouse) {
            $totalInventory = (int) \App\Models\ProductStock::where('warehouse_id', $warehouse->id)->sum('current_stock');
            $rackCapacity = (int) Rack::whereHas('zone', fn ($q) => $q->where('warehouse_id', $warehouse->id))->sum('capacity');
            $rackOccupiedStock = (int) RackStock::whereHas('rack.zone', fn ($q) => $q->where('warehouse_id', $warehouse->id))->sum('quantity');
            $rackUtilization = $rackCapacity > 0 ? round(($rackOccupiedStock / $rackCapacity) * 100, 1) : 0;
        }

        $todayInbound = (int) StockMovement::where('movement_type', 'in')
            ->whereDate('movement_date', $today)
            ->sum('quantity');
        $todayOutbound = (int) StockMovement::where('movement_type', 'out')
            ->whereDate('movement_date', $today)
            ->sum('quantity');

        $lowStockCount = DB::table('products')
            ->leftJoin('product_stocks', function ($join) use ($warehouse) {
                $join->on('products.id', '=', 'product_stocks.product_id');
                if ($warehouse) {
                    $join->where('product_stocks.warehouse_id', '=', $warehouse->id);
                }
            })
            ->when($tenantId > 0, fn ($q) => $q->where('products.tenant_id', $tenantId))
            ->select('products.id')
            ->groupBy('products.id', 'products.minimum_stock')
            ->havingRaw('COALESCE(SUM(product_stocks.current_stock), 0) < products.minimum_stock')
            ->count();

        $delayedShipments = Shipment::where('status', '!=', 'delivered')
            ->whereNotNull('estimated_arrival')
            ->where('estimated_arrival', '<', $now)
            ->count();
        $unpaidInvoices = Invoice::whereIn('payment_status', ['belum_dibayar', 'pending', 'jatuh_tempo'])->count();

        $trendRows = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i)->format('Y-m-d');
            $trendRows->push([
                'date' => $date,
                'label' => $now->copy()->subDays($i)->translatedFormat('D'),
                'inbound' => (int) StockMovement::where('movement_type', 'in')->whereDate('movement_date', $date)->sum('quantity'),
                'outbound' => (int) StockMovement::where('movement_type', 'out')->whereDate('movement_date', $date)->sum('quantity'),
            ]);
        }

        $pdf = Pdf::loadView('reports.dashboard_operational_pdf', [
            'generatedAt' => $now,
            'warehouseName' => $warehouse?->name ?? 'Gudang Operasional',
            'warehouseLocation' => $warehouse?->location ?? 'Belum diatur',
            'stats' => [
                'today_inbound' => $todayInbound,
                'today_outbound' => $todayOutbound,
                'total_inventory' => $totalInventory,
                'rack_utilization' => $rackUtilization,
                'low_stock_count' => (int) $lowStockCount,
                'delayed_shipments' => (int) $delayedShipments,
                'unpaid_invoices' => (int) $unpaidInvoices,
            ],
            'trends' => $trendRows,
        ])->setPaper('a4');

        return $pdf->download('Laporan_Operasional_Gudang_' . $now->format('Ymd_His') . '.pdf');
    }

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

        $tenantId = (int) ($request->user()?->tenant_id ?? 0);
        $subscription = $tenantId > 0
            ? TenantSubscription::query()
                ->with('plan')
                ->where('tenant_id', $tenantId)
                ->latest('id')
                ->first()
            : null;

        $operationalWarehouse = \App\Models\Warehouse::query()
            ->when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))
            ->orderBy('id')
            ->first()
            ?? \App\Models\Warehouse::create([
                'tenant_id' => $tenantId ?: null,
                'code' => 'WH-DEFAULT',
                'name' => 'Gudang Operasional',
                'location' => 'Belum diatur',
            ]);

        // 1. TOTAL INVENTORY (operational warehouse stock, including unplaced)
        $totalInventory = (int) \App\Models\ProductStock::where('warehouse_id', $operationalWarehouse->id)->sum('current_stock');

        // 2. OUTBOUND RATE (Average per hour for last 24h)
        $outboundLast24h = StockMovement::where('movement_type', 'out')
            ->where('movement_date', '>=', $twentyFourHoursAgo)
            ->sum('quantity');
        $outboundRate = round($outboundLast24h / 24, 1);

        // 3. SYSTEM ALERTS
        // Low stock count (operational warehouse)
        $warehouseId = $operationalWarehouse->id;
        $lowStockCount = DB::table('products')
            ->leftJoin('product_stocks', function ($join) use ($warehouseId) {
                $join->on('products.id', '=', 'product_stocks.product_id')
                    ->where('product_stocks.warehouse_id', '=', $warehouseId);
            })
            ->when($tenantId > 0, fn ($q) => $q->where('products.tenant_id', $tenantId))
            ->select('products.id')
            ->groupBy('products.id', 'products.minimum_stock')
            ->havingRaw('COALESCE(SUM(product_stocks.current_stock), 0) < products.minimum_stock')
            ->get()
            ->count();
        
        // Recent adjustments/opnames count
        $recentAuditCount = StockMovement::whereIn('movement_type', ['adjustment', 'opname'])
            ->where('movement_date', '>=', $twoDaysAgo)
            ->count();
        
        $systemAlerts = $lowStockCount + $recentAuditCount;

        // 4. ACTIVE NODES (operational warehouse)
        $activeNodes = Rack::whereHas('zone', fn ($q) => $q->where('warehouse_id', $operationalWarehouse->id))->count();

        // Rack Visualization Data (operational warehouse only)
        $racks = Rack::with(['zone'])
            ->whereHas('zone', fn ($q) => $q->where('warehouse_id', $operationalWarehouse->id))
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
                'zone_name' => $r->zone?->name ?? 'Belum Ditentukan',
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

        // Efficiency Score (rack occupancy vs capacity — operational warehouse only)
        $totalRacks = Rack::whereHas('zone', fn ($q) => $q->where('warehouse_id', $operationalWarehouse->id))->count();
        $occupiedRacks = RackStock::whereHas('rack.zone', fn ($q) => $q->where('warehouse_id', $operationalWarehouse->id))->distinct('rack_id')->count();
        $efficiencyScore = $totalRacks > 0 ? round(($occupiedRacks / $totalRacks) * 100, 1) : 0;
        $rackCapacity = (int) Rack::whereHas('zone', fn ($q) => $q->where('warehouse_id', $operationalWarehouse->id))->sum('capacity');
        $rackOccupiedStock = (int) RackStock::whereHas('rack.zone', fn ($q) => $q->where('warehouse_id', $operationalWarehouse->id))->sum('quantity');
        $rackUtilization = $rackCapacity > 0 ? round(($rackOccupiedStock / $rackCapacity) * 100, 1) : 0;
        $warehouseUtilization = $rackCapacity > 0 ? round(($totalInventory / $rackCapacity) * 100, 1) : 0;
        $unplacedStock = max(0, $totalInventory - $rackOccupiedStock);
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
            'warehouse_utilization' => $warehouseUtilization,
            'rack_capacity' => $rackCapacity,
            'rack_occupied_stock' => $rackOccupiedStock,
            'unplaced_stock' => $unplacedStock,
            'empty_racks' => max($totalRacks - $occupiedRacks, 0),
            'near_full_racks' => $racks->where('has_alert', true)->count(),
            'audit_queue' => StockMovement::whereIn('movement_type', ['adjustment', 'opname'])
                ->where('movement_date', '>=', $twoDaysAgo)
                ->count(),
            'can_view_wms_documents' => $canViewOperationalDocs,
            'latest_documents' => $this->latestWmsDocuments($canViewOperationalDocs),
            'pending_opnames' => StockOpname::where('status', 'pending')->count(),
            'pending_transfers' => StockTransfer::where('status', 'pending')->count(),
            'expiring_soon' => RackStock::whereHas('rack.zone', fn ($q) => $q->where('warehouse_id', $operationalWarehouse->id))
                ->whereNotNull('expired_date')
                ->where('expired_date', '<=', $now->copy()->addDays(30)->toDateString())
                ->where('expired_date', '>=', $today)
                ->count(),
            'expired_stock' => RackStock::whereHas('rack.zone', fn ($q) => $q->where('warehouse_id', $operationalWarehouse->id))
                ->whereNotNull('expired_date')
                ->where('expired_date', '<', $today)
                ->count(),
            'low_stock_count' => $lowStockCount,
            'delayed_shipments' => Shipment::where('status', '!=', 'delivered')
                ->whereNotNull('estimated_arrival')
                ->where('estimated_arrival', '<', $now)
                ->count(),
            'unpaid_invoices' => Invoice::whereIn('payment_status', ['belum_dibayar', 'pending', 'jatuh_tempo'])
                ->count(),
        ];

        // Trends for KPI Cards (percentage change)
        $prevTwentyFourHoursAgo = $twentyFourHoursAgo->copy()->subDay();
        
        $prevInventory = (int) DB::table('stock_movements')
            ->when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))
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

        $nowDate = now();
        $trialEndsAt = $subscription?->trial_ends_at;
        $trialDaysLeft = $trialEndsAt ? max(0, $nowDate->startOfDay()->diffInDays($trialEndsAt->copy()->startOfDay(), false)) : null;
        $subscriptionStatus = (string) ($subscription?->status ?? 'trialing');
        $nextAction = match ($subscriptionStatus) {
            'past_due', 'canceled' => [
                'label' => 'Aktifkan kembali paket di Billing',
                'href' => '/settings/billing',
                'tone' => 'danger',
            ],
            'trialing' => [
                'label' => 'Lihat paket dan pilih rencana langganan',
                'href' => '/settings/billing',
                'tone' => 'warning',
            ],
            default => [
                'label' => 'Lanjutkan setup operasional gudang',
                'href' => '/mulai-di-sini',
                'tone' => 'info',
            ],
        };

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
            'onboarding' => [
                'show' => (bool) $request->session()->pull('auth_onboarding', false),
                'email_verified' => !is_null($request->user()?->email_verified_at),
                'subscription_status' => $subscriptionStatus,
                'subscription_plan' => $subscription?->plan?->name ?? 'Trial',
                'trial_ends_at' => optional($trialEndsAt)->format('d M Y'),
                'trial_days_left' => $trialDaysLeft,
                'next_action' => $nextAction,
                'setup' => [
                    'has_categories' => Category::when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))->exists(),
                    'has_units' => Unit::when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))->exists(),
                    'has_zones' => WarehouseZone::where('warehouse_id', $operationalWarehouse->id)->exists(),
                    'has_racks' => Rack::whereHas('zone', fn ($q) => $q->where('warehouse_id', $operationalWarehouse->id))->exists(),
                    'has_products' => Product::when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))->exists(),
                ],
            ],
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
                    'type' => 'Barang Masuk',
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
                    'type' => 'Barang Keluar',
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
                    'type' => 'Cek Stok Fisik',
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
                    'type' => 'Penyesuaian Stok',
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

    public function panduanSetup(Request $request): Response
    {
        $tenantId = (int) ($request->user()?->tenant_id ?? 0);
        $operationalWarehouse = Warehouse::query()
            ->when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))
            ->orderBy('id')->first();

        return Inertia::render('PanduanSetup', [
            'setup' => [
                'has_categories' => Category::when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))->exists(),
                'has_units' => Unit::when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))->exists(),
                'has_zones' => $operationalWarehouse ? WarehouseZone::where('warehouse_id', $operationalWarehouse->id)->exists() : false,
                'has_racks' => $operationalWarehouse ? Rack::whereHas('zone', fn ($q) => $q->where('warehouse_id', $operationalWarehouse->id))->exists() : false,
                'has_products' => Product::when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))->exists(),
            ],
        ]);
    }
}
