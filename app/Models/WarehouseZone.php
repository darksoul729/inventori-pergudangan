<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WarehouseZone extends Model
{
    protected $fillable = [
        'warehouse_id',
        'code',
        'name',
        'type',
        'capacity',
        'is_active',
        'description',
        'pos_x',
        'pos_y',
        'width',
        'height',
        'rotation',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function racks()
    {
        return $this->hasMany(Rack::class);
    }
}
