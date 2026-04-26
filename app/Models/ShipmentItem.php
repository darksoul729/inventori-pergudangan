<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShipmentItem extends Model
{
    public $timestamps = true;

    protected $fillable = [
        'shipment_id',
        'product_id',
        'product_name',
        'sku',
        'quantity',
        'unit',
        'weight_kg',
        'notes',
    ];

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
