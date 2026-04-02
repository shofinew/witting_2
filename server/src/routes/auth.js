const express = require('express');
const authController = require('../controllers/authController');
const { validateRegisterRequest, validateLoginRequest } = require('../middleware/validation');

const router = express.Router();

// Auth Routes
router.post('/register', validateRegisterRequest, authController.register);
router.post('/login', validateLoginRequest, authController.login);
router.get('/users', authController.getAllUsers);

module.exports = router;
