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
    validateObjectIdParam,
} = require('../middleware/validation');

const router = express.Router();

// Auth Routes
router.post('/register', authRateLimiter, validateRegisterRequest, authController.register);
router.post('/login', authRateLimiter, validateLoginRequest, authController.login);
router.post('/forgot-password', authRateLimiter, validateForgotPasswordRequest, authController.requestPasswordReset);
router.post('/reset-password', authRateLimiter, validateResetPasswordRequest, authController.resetPassword);
router.post('/session/validate', authRateLimiter, validateSessionRequest, authController.validateSession);
router.post('/follow', validateFollowRequest, authController.toggleFollow);
router.get('/users', authController.getAllUsers);
router.get('/users/:userId', validateObjectIdParam('userId'), authController.getUserById);
router.put('/profile/:userId', validateObjectIdParam('userId'), authController.updateProfile);
router.get('/audit-logs/:userId', validateObjectIdParam('userId'), authController.getAuditLogs);

module.exports = router;
