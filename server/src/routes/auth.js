const express = require('express');
const authController = require('../controllers/authController');
const { validateRegisterRequest, validateLoginRequest, validateObjectIdParam } = require('../middleware/validation');

const router = express.Router();

// Auth Routes
router.post('/register', validateRegisterRequest, authController.register);
router.post('/login', validateLoginRequest, authController.login);
router.get('/users', authController.getAllUsers);
router.get('/users/:userId', validateObjectIdParam('userId'), authController.getUserById);
router.put('/profile/:userId', validateObjectIdParam('userId'), authController.updateProfile);

module.exports = router;
