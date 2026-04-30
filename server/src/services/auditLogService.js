const AuditLog = require('../models/AuditLog');

const auditLogService = {
    create: async ({ userId = null, email = '', action, status = 'info', ipAddress = '', userAgent = '', details = '' }) => {
        await AuditLog.create({
            user: userId,
            email: email ? email.toLowerCase().trim() : undefined,
            action,
            status,
            ipAddress,
            userAgent,
            details,
        });
    },

    getUserLogs: async (userId) => {
        return AuditLog.find({ user: userId }).sort({ createdAt: -1 }).limit(50).lean();
    },
};

module.exports = auditLogService;
