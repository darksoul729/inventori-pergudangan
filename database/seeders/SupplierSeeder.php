<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Start 5 months ago
        $months = [];
        for ($i = 4; $i >= 0; $i--) {
            $months[] = now()->subMonths($i);
        }

        $suppliers = [
            [
                'code' => 'LC',
                'name' => 'LogiCorp Solutions',
                'category' => 'Tier 1 Primary',
                'status' => 'active',
                'contact_person' => 'John Doe',
                'phone' => '08111111111',
                'email' => 'john@logicorp.test',
                'performances' => [
                    // Month 1 (4 months ago)
                    ['period_month' => $months[0]->month, 'period_year' => $months[0]->year, 'total_orders' => 90, 'on_time_deliveries' => 80, 'late_deliveries' => 10, 'avg_lead_time_days' => 2.8, 'performance_score' => 88],
                    // Month 2
                    ['period_month' => $months[1]->month, 'period_year' => $months[1]->year, 'total_orders' => 95, 'on_time_deliveries' => 88, 'late_deliveries' => 7, 'avg_lead_time_days' => 3.0, 'performance_score' => 91],
                    // Month 3 
                    ['period_month' => $months[2]->month, 'period_year' => $months[2]->year, 'total_orders' => 105, 'on_time_deliveries' => 100, 'late_deliveries' => 5, 'avg_lead_time_days' => 3.1, 'performance_score' => 94],
                    // Month 4
                    ['period_month' => $months[3]->month, 'period_year' => $months[3]->year, 'total_orders' => 100, 'on_time_deliveries' => 93, 'late_deliveries' => 7, 'avg_lead_time_days' => 2.6, 'performance_score' => 93],
                    // Month 5 (Current)
                    ['period_month' => $months[4]->month, 'period_year' => $months[4]->year, 'total_orders' => 120, 'on_time_deliveries' => 118, 'late_deliveries' => 2, 'avg_lead_time_days' => 2.1, 'performance_score' => 96],
                ]
            ],
            [
                'code' => 'NX',
                'name' => 'Nexus Logistics',
                'category' => 'Global Distributor',
                'status' => 'active',
                'contact_person' => 'Jane Smith',
                'phone' => '08222222222',
                'email' => 'jane@nexus.test',
                'performances' => [
                    // Month 1
                    ['period_month' => $months[0]->month, 'period_year' => $months[0]->year, 'total_orders' => 70, 'on_time_deliveries' => 55, 'late_deliveries' => 15, 'avg_lead_time_days' => 3.9, 'performance_score' => 78],
                    // Month 2
                    ['period_month' => $months[1]->month, 'period_year' => $months[1]->year, 'total_orders' => 75, 'on_time_deliveries' => 55, 'late_deliveries' => 20, 'avg_lead_time_days' => 4.0, 'performance_score' => 73],
                    // Month 3
                    ['period_month' => $months[2]->month, 'period_year' => $months[2]->year, 'total_orders' => 85, 'on_time_deliveries' => 65, 'late_deliveries' => 20, 'avg_lead_time_days' => 4.5, 'performance_score' => 76],
                    // Month 4
                    ['period_month' => $months[3]->month, 'period_year' => $months[3]->year, 'total_orders' => 80, 'on_time_deliveries' => 60, 'late_deliveries' => 20, 'avg_lead_time_days' => 4.2, 'performance_score' => 75],
                    // Month 5
                    ['period_month' => $months[4]->month, 'period_year' => $months[4]->year, 'total_orders' => 90, 'on_time_deliveries' => 75, 'late_deliveries' => 15, 'avg_lead_time_days' => 3.4, 'performance_score' => 78],
                ]
            ],
            [
                'code' => 'SM',
                'name' => 'SwiftMv Express',
                'category' => 'Last Mile Specialist',
                'status' => 'active',
                'contact_person' => 'Mike Johnson',
                'phone' => '08333333333',
                'email' => 'mike@swiftmv.test',
                'performances' => [
                    // Month 1
                    ['period_month' => $months[0]->month, 'period_year' => $months[0]->year, 'total_orders' => 180, 'on_time_deliveries' => 100, 'late_deliveries' => 80, 'avg_lead_time_days' => 5.1, 'performance_score' => 55],
                    // Month 2
                    ['period_month' => $months[1]->month, 'period_year' => $months[1]->year, 'total_orders' => 190, 'on_time_deliveries' => 115, 'late_deliveries' => 75, 'avg_lead_time_days' => 4.9, 'performance_score' => 60],
                    // Month 3
                    ['period_month' => $months[2]->month, 'period_year' => $months[2]->year, 'total_orders' => 200, 'on_time_deliveries' => 135, 'late_deliveries' => 65, 'avg_lead_time_days' => 4.2, 'performance_score' => 67],
                    // Month 4
                    ['period_month' => $months[3]->month, 'period_year' => $months[3]->year, 'total_orders' => 200, 'on_time_deliveries' => 130, 'late_deliveries' => 70, 'avg_lead_time_days' => 3.9, 'performance_score' => 65],
                    // Month 5
                    ['period_month' => $months[4]->month, 'period_year' => $months[4]->year, 'total_orders' => 210, 'on_time_deliveries' => 140, 'late_deliveries' => 70, 'avg_lead_time_days' => 4.8, 'performance_score' => 62],
                ]
            ]
        ];

        foreach ($suppliers as $data) {
            $performances = $data['performances'];
            unset($data['performances']);
            
            $supplier = Supplier::create($data);
            foreach ($performances as $perf) {
                $supplier->performances()->create($perf);
            }
        }
    }
}
