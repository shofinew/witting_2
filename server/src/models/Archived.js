const mongoose = require('mongoose');

const archivedSchema = new mongoose.Schema(
    {
        originalEventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
        },
        creatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        date: {
            type: Date,
            required: true,
        },
        timeDuration: {
            type: Number,
            required: true,
            min: 10,
            max: 60,
        },
        remainingSeconds: {
            type: Number,
            min: 0,
        },
        archivedAt: {
            type: Date,
            default: Date.now,
        },
        eventCreatedAt: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['archived'],
            default: 'archived',
        },
        createdAt: {
            type: Date,
            required: true,
        },
        updatedAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: false,
        collection: 'Archived',
        versionKey: '__v',
    }
);

module.exports = mongoose.model('Archived', archivedSchema);
