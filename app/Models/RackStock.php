<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class RackStock extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'rack_id',
        'product_id',
        'quantity',
        'reserved_quantity',
        'batch_number',
        'expired_date',
        'last_updated_at',
    ];

    protected function casts(): array
    {
        return [
            'expired_date' => 'date',
            'last_updated_at' => 'datetime',
        ];
    }

    public function rack()
    {
        return $this->belongsTo(Rack::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
