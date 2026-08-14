const express = require('express');
const authController = require('../controllers/authController');
const { authRateLimiter } = require('../middleware/rateLimit');
const {
    validateRegisterRequest,
    validateLoginRequest,
    validateForgotPasswordRequest,
    validateResetPasswordRequest,
    validateSessionRequest,
    validateFollowRequest,
    validateBlockRequest,
    validateObjectIdParam,
} = require('../middleware/validation');

const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// Auth Routes
router.post('/register', authRateLimiter, validateRegisterRequest, authController.register);
router.post('/login', authRateLimiter, validateLoginRequest, authController.login);
router.post('/forgot-password', authRateLimiter, validateForgotPasswordRequest, authController.requestPasswordReset);
router.post('/reset-password', authRateLimiter, validateResetPasswordRequest, authController.resetPassword);
router.use(requireAuth);
// This endpoint validates an already authenticated token. It must not consume
// the public login/register attempt bucket.
router.post('/session/validate', validateSessionRequest, authController.validateSession);
router.post('/follow', validateFollowRequest, authController.toggleFollow);
router.post('/block', validateBlockRequest, authController.toggleBlock);
router.get('/users', authController.getAllUsers);
router.get('/users/:userId', validateObjectIdParam('userId'), authController.getUserById);
router.put('/profile/:userId', validateObjectIdParam('userId'), authController.updateProfile);
router.patch('/users/:userId/pause', validateObjectIdParam('userId'), authController.setUserPaused);
router.get('/audit-logs/:userId', validateObjectIdParam('userId'), authController.getAuditLogs);
router.get('/blocked-users/:userId', validateObjectIdParam('userId'), authController.getBlockedUsers);

module.exports = router;
