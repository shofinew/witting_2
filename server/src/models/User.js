const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uniqueID: {
        type: Number,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    sessionVersion: {
        type: Number,
        default: 0,
    },
    passwordChangedAt: {
        type: Date,
    },
    phone: {
        type: String,
        trim: true,
    },
    country: {
        type: String,
        enum: ['BGD', 'IND'],
        uppercase: true,
        trim: true,
    },
    dateOfBirth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'others'],
        trim: true,
    },
    specialistAt: {
        type: String,
        trim: true,
    },
    profession: {
        type: String,
        trim: true,
    },
    chamber: {
        type: String,
        trim: true,
    },
    designation: {
        type: String,
        trim: true,
    },
    achievement: {
        type: String,
        trim: true,
    },
    memberSince: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
    versionKey: '__v',
});

module.exports = mongoose.model('User', userSchema);
