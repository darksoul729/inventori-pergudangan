<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rack extends Model
{
    protected $fillable = [
        'warehouse_zone_id',
        'code',
        'name',
        'rack_type',
        'capacity',
        'status',
        'notes',
        'pos_x',
        'pos_y',
        'width',
        'height',
        'rotation',
    ];

    public function zone()
    {
        return $this->belongsTo(WarehouseZone::class, 'warehouse_zone_id');
    }

    public function rackStocks()
    {
        return $this->hasMany(RackStock::class);
    }
}
