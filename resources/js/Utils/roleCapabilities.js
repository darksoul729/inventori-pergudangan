export function normalizeRoleName(roleName) {
    return String(roleName || '').toLowerCase();
}

export function isManagerRole(roleName) {
    const role = normalizeRoleName(roleName);
    return role.includes('manager') || role.includes('manajer') || role.includes('admin gudang');
}

export function isSupervisorRole(roleName) {
    const role = normalizeRoleName(roleName);
    return role.includes('supervisor') || role.includes('spv');
}

export function isStaffRole(roleName) {
    const role = normalizeRoleName(roleName);
    return role.includes('staff') || role.includes('staf');
}

export function isOperationalRole(roleName) {
    return isManagerRole(roleName) || isSupervisorRole(roleName) || isStaffRole(roleName);
}

