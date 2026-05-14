<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'code',
        'name',
        'contact_person',
        'phone',
        'email',
        'address',
    ];

    public function stockOuts()
    {
        return $this->hasMany(StockOut::class);
    }
}
