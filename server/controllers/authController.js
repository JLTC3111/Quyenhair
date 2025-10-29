/**
 * Authentication Controller
 * Handles user registration, login, OAuth, and token management
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const db = require('../config/database');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

// ==========================================
// Helper Functions
// ==========================================

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '24h'
    });
};

const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
    });
};

const setTokenCookie = (res, token) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };
    res.cookie('token', token, cookieOptions);
};

// ==========================================
// Email/Password Authentication
// ==========================================

exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const [existingUsers] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Create user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, provider, verification_token) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, 'email', verificationToken]
        );

        const userId = result.insertId;

        // Send verification email (optional - can be disabled for demo)
        if (process.env.EMAIL_ENABLED === 'true') {
            await sendVerificationEmail(email, verificationToken);
        }

        // Generate tokens
        const token = generateToken(userId);
        const refreshToken = generateRefreshToken(userId);

        // Store refresh token
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await db.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [userId, refreshToken, expiresAt]
        );

        // Set cookie
        setTokenCookie(res, token);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: {
                id: userId,
                name,
                email,
                provider: 'email',
                verified: false
            },
            token,
            refreshToken
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password, remember } = req.body;

        // Find user
        const [users] = await db.query(
            'SELECT id, name, email, password, provider, verified, avatar FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];

        // Check if user registered with OAuth
        if (user.provider !== 'email' || !user.password) {
            return res.status(400).json({
                success: false,
                message: `Please login with ${user.provider}`
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        // Generate tokens
        const token = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        // Store refresh token
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await db.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [user.id, refreshToken, expiresAt]
        );

        // Set cookie
        setTokenCookie(res, token);

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                provider: user.provider,
                verified: Boolean(user.verified),
                avatar: user.avatar
            },
            token,
            refreshToken
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Delete refresh tokens
        await db.query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);

        // Clear cookie
        res.clearCookie('token');

        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// Token Management
// ==========================================

exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Check if refresh token exists in database
        const [tokens] = await db.query(
            'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ? AND expires_at > NOW()',
            [refreshToken, decoded.id]
        );

        if (tokens.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }

        // Generate new access token
        const newToken = generateToken(decoded.id);

        res.json({
            success: true,
            token: newToken
        });
    } catch (error) {
        next(error);
    }
};

exports.getCurrentUser = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const [users] = await db.query(
            'SELECT id, name, email, provider, verified, avatar, created_at, last_login FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// Password Reset
// ==========================================

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            // Don't reveal if email exists
            return res.json({
                success: true,
                message: 'If email exists, password reset link has been sent'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

        await db.query(
            'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
            [resetToken, resetTokenExpires, users[0].id]
        );

        // Send reset email
        if (process.env.EMAIL_ENABLED === 'true') {
            await sendPasswordResetEmail(email, resetToken);
        }

        res.json({
            success: true,
            message: 'Password reset link sent to email'
        });
    } catch (error) {
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const [users] = await db.query(
            'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password and clear reset token
        await db.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
            [hashedPassword, users[0].id]
        );

        res.json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// Email Verification
// ==========================================

exports.verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;

        const [users] = await db.query(
            'SELECT id FROM users WHERE verification_token = ?',
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification token'
            });
        }

        await db.query(
            'UPDATE users SET verified = TRUE, verification_token = NULL WHERE id = ?',
            [users[0].id]
        );

        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.resendVerification = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Generate new token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        await db.query(
            'UPDATE users SET verification_token = ? WHERE id = ?',
            [verificationToken, userId]
        );

        // Send email
        if (process.env.EMAIL_ENABLED === 'true') {
            const [users] = await db.query('SELECT email FROM users WHERE id = ?', [userId]);
            await sendVerificationEmail(users[0].email, verificationToken);
        }

        res.json({
            success: true,
            message: 'Verification email sent'
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// OAuth Authentication
// ==========================================

exports.googleAuth = (req, res) => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}` +
        `&response_type=code` +
        `&scope=profile email`;
    
    res.redirect(authUrl);
};

exports.googleCallback = async (req, res, next) => {
    try {
        const { code } = req.query;

        // Exchange code for tokens
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code'
        });

        const { access_token } = tokenResponse.data;

        // Get user info
        const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const { id: providerId, email, name, picture } = userResponse.data;

        // Find or create user
        let [users] = await db.query(
            'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
            ['google', providerId]
        );

        let userId;
        if (users.length === 0) {
            // Create new user
            const [result] = await db.query(
                'INSERT INTO users (name, email, provider, provider_id, avatar, verified) VALUES (?, ?, ?, ?, ?, ?)',
                [name, email, 'google', providerId, picture, true]
            );
            userId = result.insertId;
        } else {
            userId = users[0].id;
            // Update last login
            await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [userId]);
        }

        // Generate tokens
        const token = generateToken(userId);
        const refreshToken = generateRefreshToken(userId);

        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL}?token=${token}&refreshToken=${refreshToken}`);
    } catch (error) {
        next(error);
    }
};

exports.facebookAuth = (req, res) => {
    const authUrl = `https://www.facebook.com/v12.0/dialog/oauth?` +
        `client_id=${process.env.FACEBOOK_APP_ID}` +
        `&redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}` +
        `&scope=email,public_profile`;
    
    res.redirect(authUrl);
};

exports.facebookCallback = async (req, res, next) => {
    try {
        const { code } = req.query;

        // Exchange code for access token
        const tokenResponse = await axios.get(`https://graph.facebook.com/v12.0/oauth/access_token`, {
            params: {
                client_id: process.env.FACEBOOK_APP_ID,
                client_secret: process.env.FACEBOOK_APP_SECRET,
                redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
                code
            }
        });

        const { access_token } = tokenResponse.data;

        // Get user info
        const userResponse = await axios.get(`https://graph.facebook.com/me`, {
            params: {
                fields: 'id,name,email,picture',
                access_token
            }
        });

        const { id: providerId, email, name, picture } = userResponse.data;

        // Find or create user (similar to Google)
        let [users] = await db.query(
            'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
            ['facebook', providerId]
        );

        let userId;
        if (users.length === 0) {
            const [result] = await db.query(
                'INSERT INTO users (name, email, provider, provider_id, avatar, verified) VALUES (?, ?, ?, ?, ?, ?)',
                [name, email, 'facebook', providerId, picture?.data?.url, true]
            );
            userId = result.insertId;
        } else {
            userId = users[0].id;
            await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [userId]);
        }

        const token = generateToken(userId);
        const refreshToken = generateRefreshToken(userId);

        res.redirect(`${process.env.CLIENT_URL}?token=${token}&refreshToken=${refreshToken}`);
    } catch (error) {
        next(error);
    }
};

exports.instagramAuth = (req, res) => {
    const authUrl = `https://api.instagram.com/oauth/authorize?` +
        `client_id=${process.env.INSTAGRAM_CLIENT_ID}` +
        `&redirect_uri=${process.env.INSTAGRAM_REDIRECT_URI}` +
        `&scope=user_profile,user_media` +
        `&response_type=code`;
    
    res.redirect(authUrl);
};

exports.instagramCallback = async (req, res, next) => {
    try {
        const { code } = req.query;

        // Exchange code for access token
        const tokenResponse = await axios.post(`https://api.instagram.com/oauth/access_token`, {
            client_id: process.env.INSTAGRAM_CLIENT_ID,
            client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
            code
        });

        const { access_token, user_id } = tokenResponse.data;

        // Get user info
        const userResponse = await axios.get(`https://graph.instagram.com/me`, {
            params: {
                fields: 'id,username',
                access_token
            }
        });

        const { id: providerId, username } = userResponse.data;

        // Find or create user
        let [users] = await db.query(
            'SELECT * FROM users WHERE provider = ? AND provider_id = ?',
            ['instagram', providerId]
        );

        let userId;
        if (users.length === 0) {
            const [result] = await db.query(
                'INSERT INTO users (name, email, provider, provider_id, verified) VALUES (?, ?, ?, ?, ?)',
                [username, `${username}@instagram.com`, 'instagram', providerId, true]
            );
            userId = result.insertId;
        } else {
            userId = users[0].id;
            await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [userId]);
        }

        const token = generateToken(userId);
        const refreshToken = generateRefreshToken(userId);

        res.redirect(`${process.env.CLIENT_URL}?token=${token}&refreshToken=${refreshToken}`);
    } catch (error) {
        next(error);
    }
};
