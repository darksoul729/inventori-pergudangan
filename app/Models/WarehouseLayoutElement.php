<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WarehouseLayoutElement extends Model
{
    protected $fillable = [
        'warehouse_id',
        'element_type',
        'name',
        'code',
        'pos_x',
        'pos_y',
        'width',
        'height',
        'rotation',
        'status',
        'metadata',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }
}
