<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaasAuditLog extends Model
{
    protected $fillable = [
        'tenant_id',
        'actor_user_id',
        'event_type',
        'target_type',
        'target_id',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}

