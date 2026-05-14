<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait BelongsToTenant
{
    protected static function bootBelongsToTenant(): void
    {
        static::creating(function ($model) {
            if (!empty($model->tenant_id)) {
                return;
            }

            $tenantId = auth()->user()?->tenant_id;
            if ($tenantId) {
                $model->tenant_id = $tenantId;
            }
        });

        static::addGlobalScope('tenant', function (Builder $builder) {
            $tenantId = auth()->user()?->tenant_id;
            if ($tenantId) {
                $builder->where($builder->getModel()->getTable() . '.tenant_id', $tenantId);
            }
        });
    }
}

