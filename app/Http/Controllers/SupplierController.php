<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Models\SupplierPerformance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = (int) ($request->user()?->tenant_id ?? 0);
        $selectedYear = $request->input('year', now()->year);
        $filterCategory = $request->input('category');
        $filterStatus = $request->input('status');

        // Available categories for filter
        $categories = Supplier::query()
            ->when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');
        $availableYears = SupplierPerformance::query()
            ->whereIn('supplier_id', Supplier::query()->when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))->pluck('id'))
            ->select('period_year')
            ->distinct()
            ->orderBy('period_year', 'desc')
            ->pluck('period_year');

        // Query suppliers with optional filters
        $suppliers = Supplier::query()
            ->with('latestPerformance')
            ->when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))
            ->when($filterCategory, function ($query, $category) {
                return $query->where('category', $category);
            })
            ->when($filterStatus, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->get();

        // Calculate global stats for current month (stats are usually global or based on filtered set? 
        // User asked to make features functional in 'suppliers' (directory). Usually directory filter affects the list.
        // Let's keep stats based on the FILTERED suppliers for consistency.
        $supplierIds = $suppliers->pluck('id');

        $currentMonth = now()->month;
        $currentYear = now()->year;

        $lastMonthDate = now()->subMonth();
        $lastMonth = $lastMonthDate->month;
        $lastYear = $lastMonthDate->year;

        $currentPerformances = SupplierPerformance::whereIn('supplier_id', $supplierIds)
            ->where('period_month', $currentMonth)
            ->where('period_year', $currentYear)
            ->get();

        $lastPerformances = SupplierPerformance::whereIn('supplier_id', $supplierIds)
            ->where('period_month', $lastMonth)
            ->where('period_year', $lastYear)
            ->get();

        // current stats
        $currentTotalOrders = $currentPerformances->sum('total_orders') ?: 1;
        $currentOnTime = $currentPerformances->sum('on_time_deliveries');
        $currentLate = $currentPerformances->sum('late_deliveries');
        $currentAvgLead = $currentPerformances->avg('avg_lead_time_days') ?: 0;
        $currentOnTimePct = ($currentOnTime / $currentTotalOrders) * 100;

        // last stats
        $lastTotalOrders = $lastPerformances->sum('total_orders') ?: 1;
        $lastOnTime = $lastPerformances->sum('on_time_deliveries');
        $lastLate = $lastPerformances->sum('late_deliveries');
        $lastAvgLead = $lastPerformances->avg('avg_lead_time_days') ?: 0;
        $lastOnTimePct = ($lastOnTime / $lastTotalOrders) * 100;

        // variance
        $leadVariance = $currentAvgLead - $lastAvgLead;
        $onTimeVariancePct = $currentOnTimePct - $lastOnTimePct;
        $lateVariance = $currentLate - $lastLate;

        $stats = [
            'avgLeadTime' => [
                'value' => number_format($currentAvgLead, 1),
                'trend' => abs($leadVariance),
                'direction' => $leadVariance > 0 ? 'up' : 'down',
                'text' => number_format(abs($leadVariance), 1) . 'd vs last month'
            ],
            'onTimeDelivery' => [
                'value' => number_format($currentOnTimePct, 1),
                'trend' => abs($onTimeVariancePct),
                'direction' => $onTimeVariancePct > 0 ? 'up' : 'down',
                'text' => number_format(abs($onTimeVariancePct), 1) . '% ' . ($onTimeVariancePct > 0 ? 'increase' : 'decrease')
            ],
            'lateDeliveries' => [
                'value' => $currentLate,
                'trend' => abs($lateVariance),
                'direction' => $lateVariance > 0 ? 'up' : 'down',
                'text' => abs($lateVariance) . ' units ' . ($lateVariance > 0 ? 'above' : 'below') . ' last month'
            ]
        ];

        // Chart data - stay based on GLOBAL suppliers or FILTERED?
        // Usually chart is global trend, but directory is filtered. 
        // We'll filter chart as well to see competition within the category.
        $allPerformances = SupplierPerformance::with('supplier')
            ->whereIn('supplier_id', $supplierIds)
            ->where('period_year', $selectedYear)
            ->get();

        $chartData = [];
        for ($month = 1; $month <= 12; $month++) {
            $date = \Carbon\Carbon::create($selectedYear, $month, 1);
            $node = ['name' => $date->format('M')];
            foreach ($suppliers as $sup) {
                $perf = $allPerformances->where('supplier_id', $sup->id)
                    ->where('period_month', $month)
                    ->first();
                $node[$sup->code] = $perf ? (float) $perf->avg_lead_time_days : null;
            }
            $chartData[] = $node;
        }

        return Inertia::render('Supplier', [
            'suppliers' => $suppliers,
            'stats' => $stats,
            'chartData' => $chartData,
            'availableYears' => $availableYears,
            'selectedYear' => (int) $selectedYear,
            'categories' => $categories,
            'filters' => [
                'category' => $filterCategory,
                'status' => $filterStatus,
            ]
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create-supplier');
        $tenantId = (int) ($request->user()?->tenant_id ?? 0);
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:30',
                Rule::unique('suppliers', 'code')->where(fn ($q) => $q->where('tenant_id', $tenantId)),
            ],
            'name' => 'required|string|max:100',
            'category' => 'nullable|string|max:50',
            'contact_person' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
        ]);

        $validated['status'] = 'active';

        $supplier = Supplier::create([
            'tenant_id' => $tenantId,
            ...$validated,
        ]);

        return redirect()->back()->with('success', 'Pemasok berhasil ditambahkan.');
    }

    public function show(Request $request, Supplier $supplier)
    {
        abort_unless((int) $supplier->tenant_id === (int) ($request->user()?->tenant_id ?? 0), 403);

        $supplier->load([
            'performances' => function ($query) {
                $query->orderBy('period_year', 'desc')->orderBy('period_month', 'desc');
            }
        ]);

        return Inertia::render('SupplierDetail', [
            'supplier' => $supplier,
        ]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        Gate::authorize('create-supplier');
        abort_unless((int) $supplier->tenant_id === (int) ($request->user()?->tenant_id ?? 0), 403);

        $tenantId = (int) ($request->user()?->tenant_id ?? 0);
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:30',
                Rule::unique('suppliers', 'code')
                    ->where(fn ($q) => $q->where('tenant_id', $tenantId))
                    ->ignore($supplier->id),
            ],
            'name' => 'required|string|max:100',
            'category' => 'nullable|string|max:50',
            'contact_person' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
        ]);

        $supplier->update($validated);

        return redirect()->back()->with('success', 'Data pemasok berhasil diperbarui.');
    }

    public function storePerformance(Request $request, Supplier $supplier)
    {
        Gate::authorize('create-supplierPerformance');
        abort_unless((int) $supplier->tenant_id === (int) ($request->user()?->tenant_id ?? 0), 403);
        $validated = $request->validate([
            'period_month' => 'required|integer|min:1|max:12',
            'period_year' => 'required|integer|min:2000|max:' . (now()->year + 1),
            'total_orders' => 'required|integer|min:0',
            'on_time_deliveries' => 'required|integer|min:0|lte:total_orders',
            'late_deliveries' => 'required|integer|min:0|lte:total_orders',
            'avg_lead_time_days' => 'required|numeric|min:0',
            'manual_adjustment' => 'nullable|numeric|min:-10|max:10',
        ]);

        $autoScore = $this->calculateAutoScore(
            (int) $validated['total_orders'],
            (int) $validated['on_time_deliveries'],
            (float) $validated['avg_lead_time_days']
        );
        $manualAdjustment = (float) ($validated['manual_adjustment'] ?? 0);
        $finalScore = max(0, min(100, round($autoScore + $manualAdjustment, 2)));

        $supplier->performances()->updateOrCreate(
            [
                'period_month' => $validated['period_month'],
                'period_year' => $validated['period_year'],
            ],
            [
                ...$validated,
                'auto_score' => $autoScore,
                'manual_adjustment' => $manualAdjustment,
                'performance_score' => $finalScore,
            ]
        );

        return redirect()->back()->with('success', 'Penilaian performa berhasil diperbarui.');
    }

    private function calculateAutoScore(int $totalOrders, int $onTimeDeliveries, float $avgLeadTimeDays): float
    {
        $onTimeRate = $totalOrders > 0 ? ($onTimeDeliveries / $totalOrders) * 100 : 0;
        $leadTimeScore = max(0, min(100, 100 - ($avgLeadTimeDays * 4)));

        // 70% ketepatan waktu + 30% kecepatan lead time.
        return round(($onTimeRate * 0.7) + ($leadTimeScore * 0.3), 2);
    }

    public function destroy(Request $request, Supplier $supplier)
    {
        Gate::authorize('create-supplier');
        abort_unless((int) $supplier->tenant_id === (int) ($request->user()?->tenant_id ?? 0), 403);

        $supplier->delete();

        return redirect()->back()->with('success', 'Pemasok berhasil dihapus.');
    }
}
