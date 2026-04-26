<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockTransferItem extends Model
{
    protected $fillable = [
        'stock_transfer_id',
        'from_rack_id',
        'to_rack_id',
        'product_id',
        'quantity',
    ];

    public function stockTransfer()
    {
        return $this->belongsTo(StockTransfer::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function fromRack()
    {
        return $this->belongsTo(Rack::class, 'from_rack_id');
    }

    public function toRack()
    {
        return $this->belongsTo(Rack::class, 'to_rack_id');
    }
}
