<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Module extends Model
{
    protected $fillable = [
        'code',
        'name',
        'category',
        'is_core',
        'metadata',
    ];

    protected $casts = [
        'is_core' => 'boolean',
        'metadata' => 'array',
    ];

    public function tenantModules(): HasMany
    {
        return $this->hasMany(TenantModule::class);
    }
}

