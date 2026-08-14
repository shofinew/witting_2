export function getUserUniqueId(user) {
    const uniqueId = user?.uniqueID ?? user?.uniqueId ?? user?.unique_id;

    if (uniqueId === null || uniqueId === undefined || uniqueId === '') {
        return 'Not available';
    }

    return String(uniqueId);
}

export function canManageUsers(user) {
    const normalizedRole = String(user?.role || '').trim().toLowerCase();
    return normalizedRole === 'admin' || normalizedRole === 'superadmin';
}
