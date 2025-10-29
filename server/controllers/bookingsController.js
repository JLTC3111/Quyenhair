/**
 * Bookings Controller
 */

const db = require('../config/database');

exports.createBooking = async (req, res, next) => {
    try {
        const { name, phone, email, booking_date, booking_time, service_type, message } = req.body;
        const userId = req.user?.id || null;

        const [result] = await db.query(
            `INSERT INTO bookings (user_id, name, phone, email, booking_date, booking_time, service_type, message, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, name, phone, email, booking_date, booking_time, service_type, message, 'pending']
        );

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: { id: result.insertId }
        });
    } catch (error) {
        next(error);
    }
};

exports.getUserBookings = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const [bookings] = await db.query(
            'SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        next(error);
    }
};

exports.getBookingById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [bookings] = await db.query(
            'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            data: bookings[0]
        });
    } catch (error) {
        next(error);
    }
};

exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        const [bookings] = await db.query(
            'SELECT user_id FROM bookings WHERE id = ?',
            [id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (bookings[0].user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        await db.query(
            'UPDATE bookings SET status = ? WHERE id = ?',
            [status, id]
        );

        res.json({
            success: true,
            message: 'Booking updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.cancelBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [bookings] = await db.query(
            'SELECT user_id FROM bookings WHERE id = ?',
            [id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (bookings[0].user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        await db.query(
            'UPDATE bookings SET status = ? WHERE id = ?',
            ['cancelled', id]
        );

        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        next(error);
    }
};
