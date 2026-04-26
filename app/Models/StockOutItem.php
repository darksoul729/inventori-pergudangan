<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockOutItem extends Model
{
    protected $fillable = [
        'stock_out_id',
        'product_id',
        'rack_id',
        'batch_number',
        'expired_date',
        'quantity',
        'unit_price',
        'subtotal',
    ];

    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'expired_date' => 'date',
        ];
    }

    public function stockOut()
    {
        return $this->belongsTo(StockOut::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function rack()
    {
        return $this->belongsTo(Rack::class);
    }
}
