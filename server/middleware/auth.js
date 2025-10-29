/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

const jwt = require('jsonwebtoken');
const db = require('../config/database');

exports.authenticate = async (req, res, next) => {
    try {
        // Get token from header or cookie
        let token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const [users] = await db.query(
            'SELECT id, name, email, provider, verified, avatar FROM users WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        next(error);
    }
};

exports.optionalAuth = async (req, res, next) => {
    try {
        let token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const [users] = await db.query(
                'SELECT id, name, email, provider, verified, avatar FROM users WHERE id = ?',
                [decoded.id]
            );
            if (users.length > 0) {
                req.user = users[0];
            }
        }
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

exports.isAdmin = async (req, res, next) => {
    try {
        // Check if user is admin (you can add an is_admin column to users table)
        const [users] = await db.query(
            'SELECT is_admin FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0 || !users[0].is_admin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};
