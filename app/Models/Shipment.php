<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shipment extends Model
{
    protected $fillable = [
        'shipment_id',
        'origin',
        'origin_name',
        'destination',
        'destination_name',
        'status',
        'estimated_arrival',
        'load_type',
        'purchase_order_id',
        'goods_receipt_id',
    ];

    protected $casts = [
        'estimated_arrival' => 'datetime',
    ];

    // Relationships
    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function goodsReceipt()
    {
        return $this->belongsTo(GoodsReceipt::class);
    }
}
