<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LayoutSnapshot extends Model
{
    protected $fillable = [
        'warehouse_id',
        'user_id',
        'name',
        'snapshot_data',
        'action_type',
    ];

    protected function casts(): array
    {
        return [
            'snapshot_data' => 'array',
        ];
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
