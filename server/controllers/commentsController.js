/**
 * Comments Controller
 * Handles comment CRUD operations
 */

const db = require('../config/database');

exports.getAllComments = async (req, res, next) => {
    try {
        const { 
            rating, 
            status = 'approved', 
            page = 1, 
            limit = 10,
            sort = 'created_at',
            order = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;

        // Build query
        let query = `
            SELECT 
                c.*,
                u.name as user_name,
                u.email as user_email,
                u.avatar as user_avatar,
                u.provider as user_provider
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.status = ?
        `;
        const params = [status];

        if (rating) {
            query += ' AND c.rating = ?';
            params.push(rating);
        }

        query += ` ORDER BY c.${sort} ${order} LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [comments] = await db.query(query, params);

        // Get replies for each comment
        for (let comment of comments) {
            const [replies] = await db.query(
                `SELECT 
                    cr.*,
                    u.name as user_name,
                    u.avatar as user_avatar
                FROM comment_replies cr
                JOIN users u ON cr.user_id = u.id
                WHERE cr.comment_id = ?
                ORDER BY cr.created_at ASC`,
                [comment.id]
            );
            comment.replies = replies;
        }

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM comments WHERE status = ?';
        const countParams = [status];
        if (rating) {
            countQuery += ' AND rating = ?';
            countParams.push(rating);
        }
        const [countResult] = await db.query(countQuery, countParams);

        res.json({
            success: true,
            data: comments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getCommentById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [comments] = await db.query(
            `SELECT 
                c.*,
                u.name as user_name,
                u.email as user_email,
                u.avatar as user_avatar
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?`,
            [id]
        );

        if (comments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Get replies
        const [replies] = await db.query(
            `SELECT 
                cr.*,
                u.name as user_name,
                u.avatar as user_avatar
            FROM comment_replies cr
            JOIN users u ON cr.user_id = u.id
            WHERE cr.comment_id = ?
            ORDER BY cr.created_at ASC`,
            [id]
        );

        comments[0].replies = replies;

        res.json({
            success: true,
            data: comments[0]
        });
    } catch (error) {
        next(error);
    }
};

exports.createComment = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const userId = req.user.id;

        // Check if user already commented
        const [existing] = await db.query(
            'SELECT id FROM comments WHERE user_id = ?',
            [userId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted a review'
            });
        }

        const [result] = await db.query(
            'INSERT INTO comments (user_id, rating, comment, status) VALUES (?, ?, ?, ?)',
            [userId, rating, comment, 'approved'] // Auto-approve or set to 'pending' for moderation
        );

        const [newComment] = await db.query(
            `SELECT 
                c.*,
                u.name as user_name,
                u.email as user_email,
                u.avatar as user_avatar
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            data: newComment[0]
        });
    } catch (error) {
        next(error);
    }
};

exports.updateComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        // Check ownership
        const [existing] = await db.query(
            'SELECT user_id FROM comments WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        if (existing[0].user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this comment'
            });
        }

        await db.query(
            'UPDATE comments SET rating = ?, comment = ? WHERE id = ?',
            [rating, comment, id]
        );

        const [updated] = await db.query(
            `SELECT 
                c.*,
                u.name as user_name,
                u.email as user_email,
                u.avatar as user_avatar
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?`,
            [id]
        );

        res.json({
            success: true,
            message: 'Comment updated successfully',
            data: updated[0]
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check ownership
        const [existing] = await db.query(
            'SELECT user_id FROM comments WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        if (existing[0].user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        await db.query('DELETE FROM comments WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.markHelpful = async (req, res, next) => {
    try {
        const { id } = req.params;

        await db.query(
            'UPDATE comments SET helpful = helpful + 1 WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Marked as helpful'
        });
    } catch (error) {
        next(error);
    }
};

exports.replyToComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;
        const userId = req.user.id;

        // Check if comment exists
        const [comments] = await db.query(
            'SELECT id FROM comments WHERE id = ?',
            [id]
        );

        if (comments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        const [result] = await db.query(
            'INSERT INTO comment_replies (comment_id, user_id, reply) VALUES (?, ?, ?)',
            [id, userId, reply]
        );

        const [newReply] = await db.query(
            `SELECT 
                cr.*,
                u.name as user_name,
                u.avatar as user_avatar
            FROM comment_replies cr
            JOIN users u ON cr.user_id = u.id
            WHERE cr.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Reply added successfully',
            data: newReply[0]
        });
    } catch (error) {
        next(error);
    }
};

exports.getUserComments = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const [comments] = await db.query(
            `SELECT 
                c.*,
                u.name as user_name,
                u.email as user_email,
                u.avatar as user_avatar
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: comments
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// Reviews Statistics & Analytics
// ==========================================

exports.getReviewsStats = async (req, res, next) => {
    try {
        // Get overall rating statistics
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total_reviews,
                AVG(rating) as average_rating,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star_count,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star_count,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star_count,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star_count,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star_count,
                SUM(helpful) as total_helpful_votes
            FROM comments 
            WHERE status = 'approved'
        `);

        const totalReviews = parseInt(stats[0].total_reviews);
        const avgRating = parseFloat(stats[0].average_rating).toFixed(1);

        // Calculate percentages
        const ratingBreakdown = {
            5: {
                count: parseInt(stats[0].five_star_count),
                percentage: totalReviews > 0 ? ((stats[0].five_star_count / totalReviews) * 100).toFixed(1) : 0
            },
            4: {
                count: parseInt(stats[0].four_star_count),
                percentage: totalReviews > 0 ? ((stats[0].four_star_count / totalReviews) * 100).toFixed(1) : 0
            },
            3: {
                count: parseInt(stats[0].three_star_count),
                percentage: totalReviews > 0 ? ((stats[0].three_star_count / totalReviews) * 100).toFixed(1) : 0
            },
            2: {
                count: parseInt(stats[0].two_star_count),
                percentage: totalReviews > 0 ? ((stats[0].two_star_count / totalReviews) * 100).toFixed(1) : 0
            },
            1: {
                count: parseInt(stats[0].one_star_count),
                percentage: totalReviews > 0 ? ((stats[0].one_star_count / totalReviews) * 100).toFixed(1) : 0
            }
        };

        // Get recent trend (last 30 days)
        const [recentStats] = await db.query(`
            SELECT 
                COUNT(*) as recent_reviews,
                AVG(rating) as recent_average
            FROM comments 
            WHERE status = 'approved' 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);

        // Get verified reviews count
        const [verifiedCount] = await db.query(`
            SELECT COUNT(*) as verified_reviews
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.status = 'approved' AND u.verified = TRUE
        `);

        res.json({
            success: true,
            data: {
                totalReviews,
                averageRating: parseFloat(avgRating),
                ratingBreakdown,
                totalHelpfulVotes: parseInt(stats[0].total_helpful_votes),
                recentTrend: {
                    last30Days: parseInt(recentStats[0].recent_reviews),
                    recentAverage: recentStats[0].recent_average ? parseFloat(recentStats[0].recent_average).toFixed(1) : 0
                },
                verifiedReviews: parseInt(verifiedCount[0].verified_reviews)
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getFeaturedReviews = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 3;

        // Get featured reviews (5-star with most helpful votes)
        const [reviews] = await db.query(`
            SELECT 
                c.*,
                u.name as user_name,
                u.avatar as user_avatar,
                u.verified as user_verified
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.status = 'approved' AND c.rating = 5
            ORDER BY c.helpful DESC, c.created_at DESC
            LIMIT ?
        `, [limit]);

        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        next(error);
    }
};

exports.getRecentReviews = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const days = parseInt(req.query.days) || 30;

        const [reviews] = await db.query(`
            SELECT 
                c.*,
                u.name as user_name,
                u.avatar as user_avatar,
                u.verified as user_verified
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.status = 'approved' 
            AND c.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            ORDER BY c.created_at DESC
            LIMIT ?
        `, [days, limit]);

        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        next(error);
    }
};

exports.getTopReviewers = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const [reviewers] = await db.query(`
            SELECT 
                u.id,
                u.name,
                u.avatar,
                u.verified,
                COUNT(c.id) as review_count,
                AVG(c.rating) as average_rating,
                SUM(c.helpful) as total_helpful_received
            FROM users u
            JOIN comments c ON u.id = c.user_id
            WHERE c.status = 'approved'
            GROUP BY u.id
            ORDER BY review_count DESC, total_helpful_received DESC
            LIMIT ?
        `, [limit]);

        res.json({
            success: true,
            data: reviewers
        });
    } catch (error) {
        next(error);
    }
};

exports.getVerifiedReviews = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const [reviews] = await db.query(`
            SELECT 
                c.*,
                u.name as user_name,
                u.avatar as user_avatar,
                u.verified as user_verified
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.status = 'approved' AND u.verified = TRUE
            ORDER BY c.created_at DESC
            LIMIT ? OFFSET ?
        `, [parseInt(limit), parseInt(offset)]);

        // Get total count
        const [countResult] = await db.query(`
            SELECT COUNT(*) as total 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.status = 'approved' AND u.verified = TRUE
        `);

        res.json({
            success: true,
            data: reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getReviewsByRating = async (req, res, next) => {
    try {
        const { rating, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Valid rating (1-5) required'
            });
        }

        const [reviews] = await db.query(`
            SELECT 
                c.*,
                u.name as user_name,
                u.avatar as user_avatar,
                u.verified as user_verified
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.status = 'approved' AND c.rating = ?
            ORDER BY c.created_at DESC
            LIMIT ? OFFSET ?
        `, [parseInt(rating), parseInt(limit), parseInt(offset)]);

        const [countResult] = await db.query(
            'SELECT COUNT(*) as total FROM comments WHERE status = ? AND rating = ?',
            ['approved', parseInt(rating)]
        );

        res.json({
            success: true,
            data: reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.searchReviews = async (req, res, next) => {
    try {
        const { query, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query required'
            });
        }

        const searchTerm = `%${query}%`;

        const [reviews] = await db.query(`
            SELECT 
                c.*,
                u.name as user_name,
                u.avatar as user_avatar,
                u.verified as user_verified
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.status = 'approved' 
            AND (c.comment LIKE ? OR u.name LIKE ?)
            ORDER BY c.created_at DESC
            LIMIT ? OFFSET ?
        `, [searchTerm, searchTerm, parseInt(limit), parseInt(offset)]);

        const [countResult] = await db.query(`
            SELECT COUNT(*) as total 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.status = 'approved' 
            AND (c.comment LIKE ? OR u.name LIKE ?)
        `, [searchTerm, searchTerm]);

        res.json({
            success: true,
            data: reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// Review Moderation (Admin)
// ==========================================

exports.moderateReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: approved, rejected, or pending'
            });
        }

        await db.query(
            'UPDATE comments SET status = ? WHERE id = ?',
            [status, id]
        );

        // Log moderation action (if audit_logs table exists)
        if (req.user) {
            await db.query(
                `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values) 
                 VALUES (?, ?, ?, ?, ?)`,
                [req.user.id, 'moderate_review', 'comments', id, JSON.stringify({ status, notes })]
            ).catch(() => {}); // Ignore if table doesn't exist
        }

        res.json({
            success: true,
            message: `Review ${status} successfully`
        });
    } catch (error) {
        next(error);
    }
};

exports.getPendingReviews = async (req, res, next) => {
    try {
        const [reviews] = await db.query(`
            SELECT 
                c.*,
                u.name as user_name,
                u.email as user_email,
                u.avatar as user_avatar
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.status = 'pending'
            ORDER BY c.created_at DESC
        `);

        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        next(error);
    }
};
