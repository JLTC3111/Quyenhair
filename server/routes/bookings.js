/**
 * Bookings Routes
 */

const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookingsController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validators');

// Create booking
router.post('/', optionalAuth, validateBooking, bookingsController.createBooking);

// Get user's bookings (authenticated)
router.get('/my-bookings', authenticate, bookingsController.getUserBookings);

// Get booking by ID
router.get('/:id', authenticate, bookingsController.getBookingById);

// Update booking status
router.patch('/:id/status', authenticate, bookingsController.updateBookingStatus);

// Cancel booking
router.delete('/:id', authenticate, bookingsController.cancelBooking);

module.exports = router;
