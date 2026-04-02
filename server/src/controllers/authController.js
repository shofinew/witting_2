const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');

// Register Controller
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    try {
        await authService.register(name, email, password);
        return res.status(201).json({ message: 'User registered successfully.' });
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

module.exports = {
    register,
    login,
    getAllUsers,
};
