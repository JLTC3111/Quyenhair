/**
 * Users Routes
 */

const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticate } = require('../middleware/auth');

// Get user profile
router.get('/profile', authenticate, usersController.getProfile);

// Update user profile
router.put('/profile', authenticate, usersController.updateProfile);

// Change password
router.put('/change-password', authenticate, usersController.changePassword);

// Delete account
router.delete('/account', authenticate, usersController.deleteAccount);

module.exports = router;
