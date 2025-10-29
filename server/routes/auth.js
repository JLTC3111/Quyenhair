/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validators');

// Email/Password Authentication
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authenticate, authController.logout);

// Token Management
router.post('/refresh', authController.refreshToken);
router.get('/me', authenticate, authController.getCurrentUser);

// Password Reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Email Verification
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authenticate, authController.resendVerification);

// OAuth Routes
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

router.get('/facebook', authController.facebookAuth);
router.get('/facebook/callback', authController.facebookCallback);

router.get('/instagram', authController.instagramAuth);
router.get('/instagram/callback', authController.instagramCallback);

module.exports = router;
