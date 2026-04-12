<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupplierPerformance extends Model
{
    protected $fillable = [
        'supplier_id',
        'period_month',
        'period_year',
        'total_orders',
        'on_time_deliveries',
        'late_deliveries',
        'avg_lead_time_days',
        'performance_score',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}
