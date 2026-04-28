<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'sku',
        'barcode',
        'name',
        'category_id',
        'unit_id',
        'default_supplier_id',
        'minimum_stock',
        'max_stock',
        'purchase_price',
        'selling_price',
        'lead_time_days',
        'is_active',
        'description',
        'volume_entry_mode',
        'dimension_unit',
        'dimension_length',
        'dimension_width',
        'dimension_height',
        'volume_m3_per_unit',
        'image',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'purchase_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
            'dimension_length' => 'decimal:3',
            'dimension_width' => 'decimal:3',
            'dimension_height' => 'decimal:3',
            'volume_m3_per_unit' => 'decimal:6',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function defaultSupplier()
    {
        return $this->belongsTo(Supplier::class, 'default_supplier_id');
    }

    public function rackStocks()
    {
        return $this->hasMany(RackStock::class);
    }

    public function productStocks()
    {
        return $this->hasMany(ProductStock::class);
    }
}
