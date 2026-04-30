export function getUserUniqueId(user) {
    const uniqueId = user?.uniqueID ?? user?.uniqueId ?? user?.unique_id;

    if (uniqueId === null || uniqueId === undefined || uniqueId === '') {
        return 'Not available';
    }

    return String(uniqueId);
}
