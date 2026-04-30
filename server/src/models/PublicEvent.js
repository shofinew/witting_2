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
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
            match: /^([01]\d|2[0-3]):([0-5]\d)$/,
        },
    },
    {
        timestamps: true,
        collection: 'PublicEvent',
        versionKey: '__v',
    }
);

module.exports = mongoose.model('PublicEvent', publicEventSchema);
