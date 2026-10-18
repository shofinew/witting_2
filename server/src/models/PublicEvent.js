const mongoose = require('mongoose');

const publicEventSchema = new mongoose.Schema(
    {
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
        note: {
            type: String,
            trim: true,
            default: '',
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
        startTimeEnabled: {
            type: Boolean,
            default: true,
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
        endTimeEnabled: {
            type: Boolean,
            default: true,
        },
        likedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
        collection: 'PublicEvent',
        versionKey: '__v',
    }
);

module.exports = mongoose.model('PublicEvent', publicEventSchema);
