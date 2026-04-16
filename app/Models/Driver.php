<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $fillable = [
        'user_id',
        'license_number',
        'phone',
        'photo_id_card',
        'status',
        'latitude',
        'longitude',
        'is_active',
        'last_location_mock',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shipments()
    {
        return $this->hasMany(Shipment::class);
    }

    public function hasActiveShipment()
    {
        return $this->shipments()
            ->whereIn('status', ['in-transit', 'on-time', 'delayed'])
            ->whereNotIn('tracking_stage', ['delivered'])
            ->exists();
    }

    public function getActiveShipment()
    {
        return $this->shipments()
            ->whereIn('status', ['in-transit', 'on-time', 'delayed'])
            ->whereNotIn('tracking_stage', ['delivered'])
            ->first();
    }
}
