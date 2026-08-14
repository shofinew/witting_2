const mongoose = require('mongoose');

const publicArchivedSchema = new mongoose.Schema(
    {
        originalPublicEventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PublicEvent',
            required: true,
        },
        creatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            trim: true,
            required: true,
        },
        description: {
            type: String,
            trim: true,
            required: true,
        },
        location: {
            type: String,
            trim: true,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
            min: 1,
        },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
            match: /^([01]\d|2[0-3]):([0-5]\d)$/,
        },
        endDate: {
            type: Date,
            required: true,
        },
        endTime: {
            type: String,
            required: true,
            match: /^([01]\d|2[0-3]):([0-5]\d)$/,
        },
        likedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        archivedAt: {
            type: Date,
            default: Date.now,
        },
        createdAt: {
            type: Date,
            required: true,
        },
        updatedAt: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['archived'],
            default: 'archived',
        },
    },
    {
        timestamps: false,
        collection: 'PublicArchivedEvent',
        versionKey: '__v',
    }
);

module.exports = mongoose.model('PublicArchived', publicArchivedSchema);
