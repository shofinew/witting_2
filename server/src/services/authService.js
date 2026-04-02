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
        });

        await user.save();
        return user;
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
        };
    },

    // Get all users
    getAllUsers: async () => {
        const users = await User.find({}, '-password').sort({ createdAt: -1 }).lean();
        return users;
    },
};

module.exports = authService;
