const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
    },
    action: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'info'],
        default: 'info',
    },
    ipAddress: {
        type: String,
        trim: true,
    },
    userAgent: {
        type: String,
        trim: true,
    },
    details: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
    versionKey: '__v',
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
