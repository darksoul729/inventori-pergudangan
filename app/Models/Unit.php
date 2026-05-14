<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    use BelongsToTenant;

    protected $fillable = ['tenant_id', 'name', 'symbol'];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
