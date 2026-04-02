const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
    phone: {
        type: String,
        trim: true,
    },
    country: {
        type: String,
        trim: true,
    },
    dateOfBirth: {
        type: Date,
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
    memberSince: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);