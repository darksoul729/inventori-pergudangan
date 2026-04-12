<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Supplier extends Model
{
    protected $fillable = [
        'code',
        'name',
        'contact_person',
        'phone',
        'email',
        'address',
        'city',
        'category',
        'status',
    ];

    public function performances(): HasMany
    {
        return $this->hasMany(SupplierPerformance::class);
    }

    public function latestPerformance(): HasOne
    {
        return $this->hasOne(SupplierPerformance::class)->latestOfMany();
    }
}
