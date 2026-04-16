<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\StockMovement;
use App\Models\Product;
use App\Models\Rack;
use App\Models\RackStock;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class ReportController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $startDate = $now->copy()->startOfDay()->subDays(29);

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

        // 4. Efficiency Score (Rack occupancy)
        $totalCapacity = Rack::sum('capacity');
        $currentStock = RackStock::sum('quantity');
        $efficiencyScore = $totalCapacity > 0 ? round(($currentStock / $totalCapacity) * 100, 1) : 0;

        // 5. Category Distribution (for Cost Analysis & Distribution viz)
        $distribution = DB::table('categories')
            ->leftJoin('products', 'categories.id', '=', 'products.category_id')
            ->leftJoin('rack_stocks', 'products.id', '=', 'rack_stocks.product_id')
            ->select(
                'categories.name',
                DB::raw('SUM(COALESCE(rack_stocks.quantity, 0)) as total_qty'),
                DB::raw('SUM(COALESCE(rack_stocks.quantity, 0) * COALESCE(products.purchase_price, 0)) as total_value')
            )
            ->groupBy('categories.id', 'categories.name')
            ->get();

        // 6. Shipment Stats (Placeholder for Vehicle Fleet)
        $shipmentStats = [
            'total' => DB::table('shipments')->count(),
            'transit' => DB::table('shipments')->where('status', 'in-transit')->count(),
            'delivered' => DB::table('shipments')->where('status', 'delivered')->count(),
        ];

        // 7. Recent Reports
        $reports = Report::with('user')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'by' => $r->user->name,
                'status' => strtoupper($r->status),
                'date' => $r->created_at->format('M d, Y'),
                'type' => $r->type,
                'file_path' => $r->file_path
            ]);

        return Inertia::render('Reports', [
            'data' => [
                'throughput' => $movementTrends,
                'fast_moving' => $fastMoving,
                'slow_moving' => $slowMoving,
                'efficiency' => $efficiencyScore,
                'total_products' => Product::count(),
                'total_stock' => (int) $currentStock,
                'distribution' => $distribution,
                'shipment_stats' => $shipmentStats,
            ],
            'reports' => $reports
        ]);
    }

    public function generatePdf(Request $request)
    {
        $now = Carbon::now();
        
        // Data for PDF
        $products = Product::withSum('rackStocks as total_qty', 'quantity')->get();
        $racks = Rack::withSum('rackStocks as total_qty', 'quantity')->with('zone')->get();
        $movements = StockMovement::with('product')->orderByDesc('movement_date')->limit(50)->get();
        
        $stats = [
            'total_inventory' => RackStock::sum('quantity'),
            'total_value' => Product::join('rack_stocks', 'products.id', '=', 'rack_stocks.product_id')
                ->sum(DB::raw('rack_stocks.quantity * products.purchase_price')),
            'efficiency' => round((RackStock::sum('quantity') / max(1, Rack::sum('capacity'))) * 100, 1),
            'generated_at' => $now->format('Y-m-d H:i:s'),
        ];

        $reportName = 'Warehouse_Status_' . $now->format('Ymd_His') . '.pdf';
        
        $pdf = Pdf::loadView('reports.warehouse_status', compact('products', 'racks', 'movements', 'stats'));
        
        $filePath = 'reports/' . $reportName;
        Storage::disk('public')->put($filePath, $pdf->output());

        Report::create([
            'name' => $reportName,
            'type' => 'PDF',
            'file_path' => $filePath,
            'user_id' => auth()->id(),
            'status' => 'completed',
            'metadata' => $stats
        ]);

        return redirect()->back()->with('success', 'Report generated successfully.');
    }

    public function download(Report $report)
    {
        if (!Storage::disk('public')->exists($report->file_path)) {
            return redirect()->back()->with('error', 'File not found.');
        }

        return Storage::disk('public')->download($report->file_path);
    }
}
