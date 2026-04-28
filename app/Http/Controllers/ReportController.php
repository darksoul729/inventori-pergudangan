<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\StockMovement;
use App\Models\Product;
use App\Models\Rack;
use App\Models\RackStock;
use App\Models\ProductStock;
use App\Models\Warehouse;
use App\Models\Driver;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $statusFilter = $request->string('status')->toString();
        if (!in_array($statusFilter, ['all', 'completed', 'pending'], true)) {
            $statusFilter = 'all';
        }

        $now = Carbon::now();
        $startDate = $now->copy()->startOfDay()->subDays(29);
        $operationalWarehouse = Warehouse::orderBy('id')->firstOrFail();

        // 1. Throughput Trend (Last 30 Days)
        $movementTrendRows = StockMovement::select(
                DB::raw('DATE(movement_date) as date'),
                DB::raw('SUM(CASE WHEN movement_type = "in" THEN quantity ELSE 0 END) as inbound'),
                DB::raw('SUM(CASE WHEN movement_type = "out" THEN quantity ELSE 0 END) as outbound')
            )
            ->whereDate('movement_date', '>=', $startDate->toDateString())
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $movementTrendLookup = $movementTrendRows->keyBy('date');
        $movementTrends = collect(CarbonPeriod::create($startDate, $now->copy()->startOfDay()))
            ->map(function (Carbon $date) use ($movementTrendLookup) {
                $row = $movementTrendLookup->get($date->toDateString());
                $inbound = (int) ($row->inbound ?? 0);
                $outbound = (int) ($row->outbound ?? 0);

                return [
                    'date' => $date->toDateString(),
                    'inbound' => $inbound,
                    'outbound' => $outbound,
                    'total' => $inbound + $outbound,
                ];
            })
            ->values();

        // 2. Fast Moving Items
        $fastMoving = StockMovement::select('product_id', DB::raw('SUM(quantity) as total_out'))
            ->where('movement_type', 'out')
            ->where('movement_date', '>=', $now->copy()->subDays(7))
            ->groupBy('product_id')
            ->orderByDesc('total_out')
            ->limit(5)
            ->with('product')
            ->get()
            ->map(fn($item) => [
                'name' => $item->product->name . ' [' . $item->product->sku . ']',
                'val' => number_format($item->total_out) . ' Units',
                'pct' => 100 // We'll normalize this in frontend or keep as is
            ]);

        // 3. Slow Moving Items (Dead Stock - no movement for > 90 days)
        $ninetyDaysAgo = $now->copy()->subDays(90);
        $slowMoving = Product::whereDoesntHave('productStocks', function($query) use ($ninetyDaysAgo) {
                $query->where('updated_at', '>=', $ninetyDaysAgo);
            })
            ->limit(5)
            ->get()
            ->map(fn($product) => [
                'name' => $product->name . ' [' . $product->sku . ']',
                'val' => $now->diffInDays($product->updated_at) . ' Days',
                'pct' => 100
            ]);

        // 4. Efficiency Score (Rack occupancy — operational warehouse only)
        $totalCapacity = (int) Rack::whereHas('zone', fn($q) => $q->where('warehouse_id', $operationalWarehouse->id))->sum('capacity');
        $currentStock = (int) RackStock::whereHas('rack.zone', fn($q) => $q->where('warehouse_id', $operationalWarehouse->id))->sum('quantity');
        $totalWarehouseStock = (int) ProductStock::where('warehouse_id', $operationalWarehouse->id)
            ->sum('current_stock');
        $efficiencyScore = $totalCapacity > 0 ? round(($currentStock / $totalCapacity) * 100, 1) : 0;

        // 5. Category Distribution (operational warehouse only)
        $distribution = DB::table('categories')
            ->leftJoin('products', 'categories.id', '=', 'products.category_id')
            ->leftJoin('rack_stocks', 'products.id', '=', 'rack_stocks.product_id')
            ->leftJoin('racks', 'rack_stocks.rack_id', '=', 'racks.id')
            ->leftJoin('warehouse_zones', 'racks.warehouse_zone_id', '=', 'warehouse_zones.id')
            ->where(function ($q) use ($operationalWarehouse) {
                $q->where('warehouse_zones.warehouse_id', $operationalWarehouse->id)
                  ->orWhereNull('rack_stocks.id');
            })
            ->select(
                'categories.name',
                DB::raw('SUM(COALESCE(rack_stocks.quantity, 0)) as total_qty'),
                DB::raw('SUM(COALESCE(rack_stocks.quantity, 0) * COALESCE(products.purchase_price, 0)) as total_value'),
                DB::raw('SUM(CASE WHEN EXISTS (SELECT 1 FROM stock_movements WHERE stock_movements.product_id = products.id AND movement_type = "in") THEN 1 ELSE 0 END) as inbound_count'),
                DB::raw('SUM(CASE WHEN EXISTS (SELECT 1 FROM stock_movements WHERE stock_movements.product_id = products.id AND movement_type = "out") THEN 1 ELSE 0 END) as outbound_count')
            )
            ->groupBy('categories.id', 'categories.name')
            ->get();

        // 6. Shipment Stats & Trends (for Vehicle Fleet)
        $shipmentTrendRows = DB::table('shipments')
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->where('created_at', '>=', $startDate->toDateString())
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $fleetTrend = collect(CarbonPeriod::create($startDate, $now->copy()->startOfDay()))
            ->map(function (Carbon $date) use ($shipmentTrendRows) {
                return [
                    'date' => $date->toDateString(),
                    'count' => (int) ($shipmentTrendRows->get($date->toDateString())->count ?? 0),
                ];
            })
            ->values();

        $shipmentStats = [
            'total' => DB::table('shipments')->count(),
            'transit' => DB::table('shipments')->where('status', 'in-transit')->count(),
            'delivered' => DB::table('shipments')->where('status', 'delivered')->count(),
            'trend' => $fleetTrend
        ];

        // 7. Reports (server-side pagination + filter)
        $reportsQuery = Report::with('user')
            ->orderByDesc('created_at');

        if ($statusFilter === 'completed') {
            $reportsQuery->where('status', 'completed');
        } elseif ($statusFilter === 'pending') {
            $reportsQuery->where('status', '!=', 'completed');
        }

        $reports = $reportsQuery
            ->paginate(8)
            ->withQueryString()
            ->through(fn($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'by' => $r->user->name,
                'status' => strtoupper($r->status),
                'date' => $r->created_at->format('M d, Y'),
                'type' => $r->type,
                'file_path' => $r->file_path,
            ]);

        return Inertia::render('Reports', [
            'data' => [
                'throughput' => $movementTrends,
                'fast_moving' => $fastMoving,
                'slow_moving' => $slowMoving,
                'efficiency' => $efficiencyScore,
                'total_products' => Product::count(),
                'total_stock' => $totalWarehouseStock,
                'distribution' => $distribution,
                'shipment_stats' => $shipmentStats,
            ],
            'reports' => $reports,
            'filters' => [
                'status' => $statusFilter,
            ],
        ]);
    }

    public function generatePdf(Request $request)
    {
        $now = Carbon::now();
        $startDate = $now->copy()->subDays(29);
        $operationalWarehouse = Warehouse::orderBy('id')->firstOrFail();

        // Data for PDF
        $products = Product::with('category', 'unit')
            ->withSum('rackStocks as total_qty', 'quantity')
            ->get();
        $racks = Rack::withSum('rackStocks as total_qty', 'quantity')->with('zone')->get();
        $movements = StockMovement::with('product')
            ->orderByDesc('movement_date')
            ->limit(50)
            ->get();

        // Category distribution with valuations
        $categories = DB::table('categories')
            ->leftJoin('products', 'categories.id', '=', 'products.category_id')
            ->leftJoin('rack_stocks', 'products.id', '=', 'rack_stocks.product_id')
            ->select(
                'categories.name',
                DB::raw('COUNT(DISTINCT products.id) as product_count'),
                DB::raw('SUM(COALESCE(rack_stocks.quantity, 0)) as total_qty'),
                DB::raw('SUM(COALESCE(rack_stocks.quantity, 0) * COALESCE(products.purchase_price, 0)) as total_value')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total_value')
            ->get();

        // Shipment statistics
        $shipments = [
            'total'     => DB::table('shipments')->count(),
            'transit'   => DB::table('shipments')->where('status', 'in-transit')->count(),
            'delivered' => DB::table('shipments')->where('status', 'delivered')->count(),
            'delayed'   => DB::table('shipments')->where('status', 'delayed')->count(),
        ];

        $totalDrivers = Driver::where('status', 'approved')->count();

        // Movement summary last 30 days
        $movementSummary = [
            'inbound'  => StockMovement::where('movement_type', 'in')
                ->where('movement_date', '>=', $startDate->toDateString())->sum('quantity'),
            'outbound' => StockMovement::where('movement_type', 'out')
                ->where('movement_date', '>=', $startDate->toDateString())->sum('quantity'),
        ];

        $totalCapacity = (int) Rack::whereHas('zone', fn($q) => $q->where('warehouse_id', $operationalWarehouse->id))->sum('capacity');
        $currentStock  = (int) RackStock::whereHas('rack.zone', fn($q) => $q->where('warehouse_id', $operationalWarehouse->id))->sum('quantity');
        $totalWarehouseStock = (int) ProductStock::where('warehouse_id', $operationalWarehouse->id)
            ->sum('current_stock');

        $stats = [
            'total_inventory'  => $totalWarehouseStock,
            'total_products'   => Product::count(),
            'total_value'      => (float) DB::table('rack_stocks')
                ->join('products', 'rack_stocks.product_id', '=', 'products.id')
                ->join('racks', 'rack_stocks.rack_id', '=', 'racks.id')
                ->join('warehouse_zones', 'racks.warehouse_zone_id', '=', 'warehouse_zones.id')
                ->where('warehouse_zones.warehouse_id', $operationalWarehouse->id)
                ->sum(DB::raw('rack_stocks.quantity * products.purchase_price')),
            'total_capacity'   => $totalCapacity,
            'efficiency'       => $totalCapacity > 0
                ? round(($currentStock / $totalCapacity) * 100, 1) : 0,
            'generated_at'     => $now->format('Y-m-d H:i:s'),
            'generated_at_idn' => $now->locale('id')->isoFormat('dddd, D MMMM YYYY [pukul] HH:mm [WIB]'),
            'period'           => $now->locale('id')->isoFormat('MMMM YYYY'),
        ];

        $reportName = 'Laporan_Gudang_' . $now->format('Ymd_His') . '.pdf';

        $pdf = Pdf::loadView(
            'reports.warehouse_status',
            compact('products', 'racks', 'movements', 'stats', 'categories', 'shipments', 'totalDrivers', 'movementSummary')
        )->setPaper('a4', 'portrait');

        $filePath = 'reports/' . $reportName;
        Storage::disk('public')->put($filePath, $pdf->output());

        Report::create([
            'name'      => $reportName,
            'type'      => 'PDF',
            'file_path' => $filePath,
            'user_id'   => auth()->id(),
            'status'    => 'completed',
            'metadata'  => $stats,
        ]);

        return redirect()->back()->with('success', 'Laporan berhasil dibuat.');
    }

    public function download(Report $report)
    {
        if (!Storage::disk('public')->exists($report->file_path)) {
            return redirect()->back()->with('error', 'Berkas tidak ditemukan.');
        }

        return Storage::disk('public')->download($report->file_path);
    }
}
