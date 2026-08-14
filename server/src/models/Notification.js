const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        actorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            default: null,
        },
        type: {
            type: String,
            enum: ['event-created', 'stage-action', 'event-published', 'message-added'],
            required: true,
        },
        stage: {
            type: String,
            enum: ['stage3', 'stage2', 'stage1', 'published', 'archived'],
            default: null,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        creatorName: {
            type: String,
            required: true,
            trim: true,
        },
        targetName: {
            type: String,
            required: true,
            trim: true,
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
        sourceKey: {
            type: String,
            required: true,
            unique: true,
        },
    },
    {
        timestamps: true,
        collection: 'Notification',
        versionKey: '__v',
    }
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
