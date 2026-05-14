<?php

namespace App\Support;

class RoleCapability
{
    public static function normalize(?string $roleName): string
    {
        return strtolower((string) $roleName);
    }

    public static function isManager(?string $roleName): bool
    {
        $role = self::normalize($roleName);
        return str_contains($role, 'manager') || str_contains($role, 'manajer') || str_contains($role, 'admin gudang');
    }

    public static function isSupervisor(?string $roleName): bool
    {
        $role = self::normalize($roleName);
        return str_contains($role, 'supervisor') || str_contains($role, 'spv');
    }

    public static function isStaff(?string $roleName): bool
    {
        $role = self::normalize($roleName);
        return str_contains($role, 'staff') || str_contains($role, 'staf');
    }

    public static function isOperational(?string $roleName): bool
    {
        return self::isManager($roleName) || self::isSupervisor($roleName) || self::isStaff($roleName);
    }
}

