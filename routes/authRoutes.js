const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.post('/resend-code', authController.resendCode);
router.post('/verify-code', authController.verifyCode);
router.post('/reset-password', authController.resetPassword);
router.post('/google-login', authController.googleLogin); // <-- Add this


module.exports = router;
