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
        const result = await authService.register(name, email, password, getRequestContext(req));
        return res.status(201).json({
            message: 'User registered successfully.',
            ...result,
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
        const result = await authService.login(email, password, getRequestContext(req));
        return res.status(200).json({
            message: 'Login successful.',
            ...result,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error during login.';
        return res.status(statusCode).json({ message });
    }
});

// Get All Users Controller
const getAllUsers = asyncHandler(async (req, res) => {
    const viewerUserId = req.auth.userId;

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
    const { sessionVersion } = req.body;

    try {
        const result = await authService.validateSession(req.auth.userId, sessionVersion);
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
    const viewerUserId = req.auth.userId;

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
        if (String(userId) !== req.auth.userId) return res.status(403).json({ message: 'You can only update your own profile.' });
        const updatedUser = await authService.updateProfile(req.auth.userId, updates);
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

const setUserPaused = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { paused } = req.body;

    try {
        const user = await authService.setUserPaused(req.auth.userId, userId, paused);
        return res.status(200).json({
            message: user.isPaused ? 'Account paused successfully.' : 'Account resumed successfully.',
            user,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while updating account status.';
        return res.status(statusCode).json({ message });
    }
});

const getAuditLogs = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    try {
        const canViewAnotherUser = ['admin', 'superAdmin'].includes(req.auth.role);
        if (String(userId) !== req.auth.userId && !canViewAnotherUser) {
            return res.status(403).json({ message: 'You can only view your own audit logs.' });
        }
        const logs = await authService.getAuditLogs(userId);
        return res.status(200).json({ logs });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while fetching audit logs.';
        return res.status(statusCode).json({ message });
    }
});

const getBlockedUsers = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    try {
        const canViewAnotherUser = ['admin', 'superAdmin'].includes(req.auth.role);
        if (String(userId) !== req.auth.userId && !canViewAnotherUser) {
            return res.status(403).json({ message: 'You can only view your own blocked users.' });
        }
        const blockedUsers = await authService.getBlockedUsers(userId);
        return res.status(200).json({ blockedUsers });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while fetching blocked users.';
        return res.status(statusCode).json({ message });
    }
});

const toggleFollow = asyncHandler(async (req, res) => {
    const { followeeUserId } = req.body;

    try {
        const result = await authService.toggleFollow(req.auth.userId, followeeUserId);
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

const toggleBlock = asyncHandler(async (req, res) => {
    const { blockedUserId } = req.body;

    try {
        const result = await authService.toggleBlock(req.auth.userId, blockedUserId);
        return res.status(200).json({
            message: result.isBlocked ? 'User blocked successfully.' : 'User unblocked successfully.',
            ...result,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Server error while updating block status.';
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
    setUserPaused,
    getAuditLogs,
    getBlockedUsers,
    toggleFollow,
    toggleBlock,
};
