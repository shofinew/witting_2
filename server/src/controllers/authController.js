const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');

// Register Controller
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const user = await authService.register(name, email, password);
        return res.status(201).json({
            message: 'User registered successfully.',
            user,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error during registration.';
        return res.status(statusCode).json({ message });
    }
});

// Login Controller
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await authService.login(email, password);
        return res.status(200).json({
            message: 'Login successful.',
            user,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error during login.';
        return res.status(statusCode).json({ message });
    }
});

// Get All Users Controller
const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const users = await authService.getAllUsers();
        return res.status(200).json({ users });
    } catch (error) {
        console.error('Fetch users error:', error);
        return res.status(500).json({ message: 'Server error while fetching users.' });
    }
});

// Get Single User Controller
const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await authService.getUserById(userId);
        return res.status(200).json({ user });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while fetching user.';
        return res.status(statusCode).json({ message });
    }
});

// Update Profile Controller
const updateProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const updates = req.body;

    try {
        const updatedUser = await authService.updateProfile(userId, updates);
        return res.status(200).json({
            message: 'Profile updated successfully.',
            user: updatedUser,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error during profile update.';
        return res.status(statusCode).json({ message });
    }
});

module.exports = {
    register,
    login,
    getAllUsers,
    getUserById,
    updateProfile,
};
