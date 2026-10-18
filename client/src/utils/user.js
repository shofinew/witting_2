export function getUserUniqueId(user) {
    const uniqueId = user?.uniqueID ?? user?.uniqueId ?? user?.unique_id;

    if (uniqueId === null || uniqueId === undefined || uniqueId === '') {
        return 'Not available';
    }

    return String(uniqueId);
}

export function normalizeUserUniqueId(value) {
    return String(value || '')
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
}

export function matchesUserUniqueId(user, query) {
    const uniqueId = normalizeUserUniqueId(user?.uniqueID ?? user?.uniqueId ?? user?.unique_id);
    const normalizedQuery = normalizeUserUniqueId(query);

    return Boolean(uniqueId && normalizedQuery && uniqueId.includes(normalizedQuery));
}

export function canManageUsers(user) {
    const normalizedRole = String(user?.role || '').trim().toLowerCase();
    return normalizedRole === 'admin' || normalizedRole === 'superadmin';
}
