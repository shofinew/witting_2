const bcrypt = require('bcrypt');
const User = require('../models/User');

const authService = {
    // Register a new user
    register: async (name, email, password) => {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            const error = new Error('Email already in use.');
            error.statusCode = 409;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            memberSince: new Date(),
        });

        await user.save();
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            country: user.country,
            dateOfBirth: user.dateOfBirth,
            specialistAt: user.specialistAt,
            profession: user.profession,
            chamber: user.chamber,
            createdAt: user.createdAt,
            memberSince: user.memberSince,
        };
    },

    // Login user
    login: async (email, password) => {
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            const error = new Error('Invalid email or password.');
            error.statusCode = 401;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const error = new Error('Invalid email or password.');
            error.statusCode = 401;
            throw error;
        }

        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            country: user.country,
            dateOfBirth: user.dateOfBirth,
            specialistAt: user.specialistAt,
            profession: user.profession,
            chamber: user.chamber,
            createdAt: user.createdAt,
            memberSince: user.memberSince,
        };
    },

    // Get all users
    getAllUsers: async () => {
        const users = await User.find({}, '-password').sort({ createdAt: -1 }).lean();
        return users;
    },

    // Get single user
    getUserById: async (userId) => {
        const user = await User.findById(userId, '-password').lean();
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        return user;
    },

    // Update user profile
    updateProfile: async (userId, updates) => {
        const allowedFields = ['phone', 'country', 'dateOfBirth', 'specialistAt', 'profession', 'chamber'];
        const filteredUpdates = {};

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        }

        const user = await User.findByIdAndUpdate(userId, filteredUpdates, { new: true, runValidators: true });
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            country: user.country,
            dateOfBirth: user.dateOfBirth,
            specialistAt: user.specialistAt,
            profession: user.profession,
            chamber: user.chamber,
            createdAt: user.createdAt,
        };
    },
};

module.exports = authService;
