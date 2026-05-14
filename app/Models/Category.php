<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use BelongsToTenant;

    protected $fillable = ['tenant_id', 'name', 'description'];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
