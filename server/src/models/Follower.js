const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema({
    followerUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    followeeUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
}, {
    timestamps: true,
});

followerSchema.index({ followerUser: 1, followeeUser: 1 }, { unique: true });

module.exports = mongoose.model('Follower', followerSchema, 'follower');
