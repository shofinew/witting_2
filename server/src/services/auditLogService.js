const AuditLog = require('../models/AuditLog');
const { getBrowserName, getOperatingSystem } = require('../utils/userAgent');

const auditLogService = {
    create: async ({ userId = null, email = '', action, status = 'info', ipAddress = '', userAgent = '', details = '' }) => {
        await AuditLog.create({
            user: userId,
            email: email ? email.toLowerCase().trim() : undefined,
            action,
            status,
            ipAddress,
            userAgent,
            browserName: getBrowserName(userAgent),
            operatingSystem: getOperatingSystem(userAgent),
            details,
        });
    },

    getUserLogs: async (userId) => {
        const logs = await AuditLog.find({ user: userId }).sort({ createdAt: -1 }).limit(50).lean();

        // Older records only have userAgent. Enrich them without requiring a data migration.
        return logs.map((log) => ({
            ...log,
            browserName: log.browserName || getBrowserName(log.userAgent),
            operatingSystem: log.operatingSystem || getOperatingSystem(log.userAgent),
        }));
    },
};

module.exports = auditLogService;
