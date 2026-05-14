<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class StockAdjustment extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'adjustment_number',
        'warehouse_id',
        'stock_opname_id',
        'adjustment_date',
        'status',
        'reason',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'adjustment_date' => 'date',
        ];
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function stockOpname()
    {
        return $this->belongsTo(StockOpname::class);
    }

    public function items()
    {
        return $this->hasMany(StockAdjustmentItem::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
