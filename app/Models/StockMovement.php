<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    protected $fillable = [
        'product_id',
        'warehouse_id',
        'movement_type',
        'reference_type',
        'reference_id',
        'quantity',
        'stock_before',
        'stock_after',
        'movement_date',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'movement_date' => 'datetime',
        ];
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
