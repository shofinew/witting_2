const mongoose = require('mongoose');

const myNoticeSchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
    },
    {
        timestamps: true,
        collection: 'MyNotice',
        versionKey: '__v',
    }
);

myNoticeSchema.index({ ownerId: 1, createdAt: -1 });

module.exports = mongoose.model('MyNotice', myNoticeSchema);
