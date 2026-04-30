const mongoose = require('mongoose');

const passwordResetOtpSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    otpHash: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    consumedAt: {
        type: Date,
        default: null,
    },
    attempts: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
    versionKey: '__v',
});

passwordResetOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PasswordResetOtp', passwordResetOtpSchema);
