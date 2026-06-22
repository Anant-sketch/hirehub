const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isRedirectIfAuthenticated } = require('../middleware/authMiddleware');

// Render Register Page
router.get('/register', isRedirectIfAuthenticated, authController.getRegister);
// Handle Register Post
router.post('/register', isRedirectIfAuthenticated, authController.postRegister);

// Render Login Page
router.get('/login', isRedirectIfAuthenticated, authController.getLogin);
// Handle Login Post
router.post('/login', isRedirectIfAuthenticated, authController.postLogin);

// Handle Logout
router.get('/logout', authController.logout);

module.exports = router;
