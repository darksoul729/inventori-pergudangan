<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
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
