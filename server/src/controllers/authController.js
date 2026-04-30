const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');

const getRequestContext = (req) => ({
    ipAddress: req.ip,
    userAgent: req.get('user-agent') || '',
});

// Register Controller
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const user = await authService.register(name, email, password, getRequestContext(req));
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
        const user = await authService.login(email, password, getRequestContext(req));
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
    const { viewerUserId } = req.query;

    try {
        const users = await authService.getAllUsers(viewerUserId);
        return res.status(200).json({ users });
    } catch (error) {
        console.error('Fetch users error:', error);
        return res.status(500).json({ message: 'Server error while fetching users.' });
    }
});

const requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;

    try {
        const result = await authService.requestPasswordReset(email, getRequestContext(req));
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error during password reset request.';
        return res.status(statusCode).json({ message });
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, password } = req.body;

    try {
        const result = await authService.resetPasswordWithOtp(email, otp, password, getRequestContext(req));
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error during password reset.';
        return res.status(statusCode).json({ message });
    }
});

const validateSession = asyncHandler(async (req, res) => {
    const { userId, sessionVersion } = req.body;

    try {
        const result = await authService.validateSession(userId, sessionVersion);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error during session validation.';
        return res.status(statusCode).json({ message });
    }
});

// Get Single User Controller
const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { viewerUserId } = req.query;

    try {
        const user = await authService.getUserById(userId, viewerUserId);
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

const getAuditLogs = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    try {
        const logs = await authService.getAuditLogs(userId);
        return res.status(200).json({ logs });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while fetching audit logs.';
        return res.status(statusCode).json({ message });
    }
});

const toggleFollow = asyncHandler(async (req, res) => {
    const { followerUserId, followeeUserId } = req.body;

    try {
        const result = await authService.toggleFollow(followerUserId, followeeUserId);
        return res.status(200).json({
            message: result.isFollowing ? 'User followed successfully.' : 'User unfollowed successfully.',
            ...result,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while updating follow status.';
        return res.status(statusCode).json({ message });
    }
});

module.exports = {
    register,
    login,
    requestPasswordReset,
    resetPassword,
    validateSession,
    getAllUsers,
    getUserById,
    updateProfile,
    getAuditLogs,
    toggleFollow,
};
