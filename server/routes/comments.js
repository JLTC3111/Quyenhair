/**
 * Comments Routes
 */

const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentsController');
const { authenticate, optionalAuth, isAdmin } = require('../middleware/auth');
const { validateComment } = require('../middleware/validators');

// ==========================================
// Public Routes - Statistics & Analytics
// ==========================================

// Get review statistics (rating breakdown, averages, counts)
router.get('/stats', commentsController.getReviewsStats);

// Get featured reviews (5-star with most helpful votes)
router.get('/featured', commentsController.getFeaturedReviews);

// Get recent reviews (last 30 days)
router.get('/recent', commentsController.getRecentReviews);

// Get top reviewers leaderboard
router.get('/top-reviewers', commentsController.getTopReviewers);

// Get verified reviews only
router.get('/verified', commentsController.getVerifiedReviews);

// Get reviews by specific rating (1-5)
router.get('/by-rating', commentsController.getReviewsByRating);

// Search reviews by text
router.get('/search', commentsController.searchReviews);

// ==========================================
// Public Routes - CRUD
// ==========================================

// Get all comments (public)
router.get('/', optionalAuth, commentsController.getAllComments);

// Get comment by ID
router.get('/:id', commentsController.getCommentById);

// ==========================================
// Authenticated Routes
// ==========================================

// Create comment (authenticated users only)
router.post('/', authenticate, validateComment, commentsController.createComment);

// Update comment (owner only)
router.put('/:id', authenticate, commentsController.updateComment);

// Delete comment (owner or admin)
router.delete('/:id', authenticate, commentsController.deleteComment);

// Mark comment as helpful
router.post('/:id/helpful', optionalAuth, commentsController.markHelpful);

// Reply to comment
router.post('/:id/reply', authenticate, commentsController.replyToComment);

// Get user's comments
router.get('/user/my-comments', authenticate, commentsController.getUserComments);

// ==========================================
// Admin Routes - Moderation
// ==========================================

// Moderate review (approve/reject/pending)
router.patch('/:id/moderate', authenticate, isAdmin, commentsController.moderateReview);

// Get pending reviews for moderation
router.get('/admin/pending', authenticate, isAdmin, commentsController.getPendingReviews);

module.exports = router;
