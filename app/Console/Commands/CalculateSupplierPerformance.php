<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Supplier;
use App\Models\SupplierPerformance;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CalculateSupplierPerformance extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'supplier:calculate-performance {--month=} {--year=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically calculates and stores supplier performance based on physical Purchase Orders and Goods Receipts.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $month = $this->option('month') ?: now()->subMonth()->month;
        $year = $this->option('year') ?: now()->subMonth()->year;

        $this->info("Calculating supplier performance for {$month}-{$year}...");

        $suppliers = Supplier::all();

        foreach ($suppliers as $supplier) {
            // Find all goods receipts linked to purchase orders for this supplier that arrived in target month
            $receipts = DB::table('goods_receipts')
                ->join('purchase_orders', 'goods_receipts.purchase_order_id', '=', 'purchase_orders.id')
                ->where('goods_receipts.supplier_id', $supplier->id)
                ->whereMonth('goods_receipts.receipt_date', $month)
                ->whereYear('goods_receipts.receipt_date', $year)
                ->select(
                    'goods_receipts.receipt_date', 
                    'purchase_orders.order_date', 
                    'purchase_orders.expected_date'
                )
                ->get();

            if ($receipts->isEmpty()) {
                $this->info("Skipped {$supplier->code}: No receipts found for this period.");
                continue;
            }

            $totalOrders = $receipts->count();
            $onTimeCount = 0;
            $lateCount = 0;
            $totalLeadTimeDays = 0;

            foreach ($receipts as $receipt) {
                // Lead Time Calculation
                $orderDate = Carbon::parse($receipt->order_date);
                $receivedDate = Carbon::parse($receipt->receipt_date);
                
                // Diff in days (if arrived same day, lead time is 0 or 1, let's use 1 as minimum)
                $leadTimeDiff = max(1, $orderDate->diffInDays($receivedDate));
                $totalLeadTimeDays += $leadTimeDiff;

                // Lateness Calculation
                if ($receipt->expected_date) {
                    $expected = Carbon::parse($receipt->expected_date);
                    if ($receivedDate->lte($expected)) {
                        $onTimeCount++;
                    } else {
                        $lateCount++;
                    }
                } else {
                    // Assume on time if no promise date
                    $onTimeCount++;
                }
            }

            $avgLeadTime = $totalLeadTimeDays / $totalOrders;
            $performanceScore = ($onTimeCount / $totalOrders) * 100;

            // Save or Update Performance directly through Eloquent relationship
            $supplier->performances()->updateOrCreate(
                [
                    'period_month' => $month,
                    'period_year' => $year,
                ],
                [
                    'total_orders' => $totalOrders,
                    'on_time_deliveries' => $onTimeCount,
                    'late_deliveries' => $lateCount,
                    'avg_lead_time_days' => round($avgLeadTime, 1),
                    'performance_score' => round($performanceScore, 1),
                ]
            );

            $this->info("Calculated for {$supplier->code}: Score " . round($performanceScore, 1) . "% (Lead Time: " . round($avgLeadTime, 1) . "d)");
        }

        $this->info('Supplier performance calculation completed successfully.');
    }
}
