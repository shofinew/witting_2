const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
    blockerUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    blockedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
}, {
    timestamps: true,
    versionKey: '__v',
});

blockSchema.index({ blockerUser: 1, blockedUser: 1 }, { unique: true });

module.exports = mongoose.model('Block', blockSchema);
