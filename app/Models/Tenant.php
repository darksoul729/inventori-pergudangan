<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    protected $fillable = [
        'code',
        'name',
        'slug',
        'status',
        'timezone',
        'locale',
        'invoice_email_on_partial',
        'invoice_email_on_paid',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(TenantSubscription::class);
    }

    public function modules(): HasMany
    {
        return $this->hasMany(TenantModule::class);
    }
}
