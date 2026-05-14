<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderEmailLog extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'purchase_order_id',
        'supplier_id',
        'sent_by',
        'recipient_email',
        'subject',
        'attachment_name',
        'sent_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sent_by');
    }
}

