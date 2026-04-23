<?php

namespace App\Policies;

use App\Models\Shipment;
use App\Models\User;

class ShipmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->hasOperationalRole($user);
    }

    public function view(User $user, Shipment $shipment): bool
    {
        return $this->hasOperationalRole($user);
    }

    public function create(User $user): bool
    {
        return $this->isManager($user) || $this->isSupervisor($user);
    }

    public function update(User $user, Shipment $shipment): bool
    {
        return $this->isManager($user) || $this->isSupervisor($user);
    }

    public function updateStatus(User $user, Shipment $shipment): bool
    {
        return $this->isManager($user) || $this->isSupervisor($user);
    }

    public function verifyProof(User $user, Shipment $shipment): bool
    {
        return $this->isManager($user) || $this->isSupervisor($user);
    }

    public function delete(User $user, Shipment $shipment): bool
    {
        return $this->isManager($user);
    }

    private function hasOperationalRole(User $user): bool
    {
        return in_array($this->normalizedRole($user), ['manager', 'supervisor', 'staff'], true);
    }

    private function isManager(User $user): bool
    {
        return $this->normalizedRole($user) === 'manager';
    }

    private function isSupervisor(User $user): bool
    {
        return $this->normalizedRole($user) === 'supervisor';
    }

    private function normalizedRole(User $user): ?string
    {
        $roleName = $user->role?->name;

        if (!$roleName) {
            return null;
        }

        $value = strtolower($roleName);

        if (str_contains($value, 'admin gudang') || str_contains($value, 'manager') || str_contains($value, 'manajer')) {
            return 'manager';
        }

        if (str_contains($value, 'supervisor') || str_contains($value, 'spv')) {
            return 'supervisor';
        }

        if (str_contains($value, 'staff') || str_contains($value, 'staf')) {
            return 'staff';
        }

        return $value;
    }
}
