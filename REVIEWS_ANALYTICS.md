# Reviews Analytics & Statistics API

Complete documentation for the customer reviews, ratings, and analytics system.

## Table of Contents

1. [Overview](#overview)
2. [Statistics Endpoints](#statistics-endpoints)
3. [Featured & Filtered Reviews](#featured--filtered-reviews)
4. [Moderation System](#moderation-system)
5. [Frontend Integration](#frontend-integration)
6. [Example Responses](#example-responses)

---

## Overview

The reviews system provides comprehensive analytics including:

- **Rating Statistics**: Average ratings, total counts, rating breakdowns
- **Trending Data**: Recent reviews analysis and growth metrics
- **Featured Reviews**: Highlight best reviews with most helpful votes
- **Top Reviewers**: Leaderboard of most active and helpful reviewers
- **Search & Filter**: Advanced filtering by rating, verification status, date ranges
- **Admin Moderation**: Review approval workflow and management tools

All endpoints return JSON responses with standard format:
```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... }  // Only for paginated endpoints
}
```

---

## Statistics Endpoints

### Get Review Statistics

Get comprehensive statistics about all reviews including average rating, breakdown by stars, and trends.

**Endpoint:** `GET /api/comments/stats`  
**Authentication:** None (Public)  
**Rate Limit:** 100 requests per 15 minutes

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReviews": 1247,
    "averageRating": 4.8,
    "ratingBreakdown": {
      "5": {
        "count": 935,
        "percentage": "75.0"
      },
      "4": {
        "count": 249,
        "percentage": "20.0"
      },
      "3": {
        "count": 63,
        "percentage": "5.0"
      },
      "2": {
        "count": 0,
        "percentage": "0.0"
      },
      "1": {
        "count": 0,
        "percentage": "0.0"
      }
    },
    "totalHelpfulVotes": 3421,
    "recentTrend": {
      "last30Days": 47,
      "recentAverage": "4.9"
    },
    "verifiedReviews": 892
  }
}
```

**Use Cases:**
- Display overall rating on product/service pages
- Show rating distribution charts
- Display trending indicators ("47 reviews this month")
- Highlight verified review percentage

**Frontend Example:**
```javascript
async function displayReviewStats() {
    const response = await fetch('/api/comments/stats');
    const { data } = await response.json();
    
    // Display average rating
    document.querySelector('.average-rating').textContent = data.averageRating;
    document.querySelector('.total-reviews').textContent = 
        `${data.totalReviews} reviews`;
    
    // Display rating breakdown
    Object.entries(data.ratingBreakdown).forEach(([stars, info]) => {
        const bar = document.querySelector(`.rating-bar-${stars}`);
        bar.style.width = `${info.percentage}%`;
        bar.querySelector('.count').textContent = info.count;
    });
}
```

---

## Featured & Filtered Reviews

### Get Featured Reviews

Get top-rated reviews with most helpful votes (5-star reviews only).

**Endpoint:** `GET /api/comments/featured`  
**Authentication:** None (Public)  
**Query Parameters:**
- `limit` (optional): Number of reviews to return (default: 3, max: 20)

**Example Request:**
```
GET /api/comments/featured?limit=5
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "user_id": 15,
      "rating": 5,
      "comment": "Amazing service! The hair stylist was incredibly skilled...",
      "helpful": 127,
      "is_verified": true,
      "status": "approved",
      "created_at": "2024-01-15T10:30:00.000Z",
      "user_name": "Sarah Johnson",
      "user_avatar": "https://example.com/avatars/sarah.jpg",
      "user_verified": true
    }
    // ... more reviews
  ]
}
```

### Get Recent Reviews

Get most recent reviews from the last N days.

**Endpoint:** `GET /api/comments/recent`  
**Query Parameters:**
- `limit` (optional): Number of reviews (default: 5, max: 50)
- `days` (optional): Days to look back (default: 30)

**Example:**
```
GET /api/comments/recent?limit=10&days=7
```

### Get Top Reviewers

Get leaderboard of most active reviewers.

**Endpoint:** `GET /api/comments/top-reviewers`  
**Query Parameters:**
- `limit` (optional): Number of reviewers (default: 10, max: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "name": "Sarah Johnson",
      "avatar": "https://example.com/avatars/sarah.jpg",
      "verified": true,
      "review_count": 23,
      "average_rating": "4.8",
      "total_helpful_received": 456
    }
    // ... more reviewers
  ]
}
```

### Get Verified Reviews Only

Get reviews from verified users only.

**Endpoint:** `GET /api/comments/verified`  
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [ /* reviews array */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 892,
    "pages": 90
  }
}
```

### Get Reviews by Rating

Filter reviews by specific star rating (1-5).

**Endpoint:** `GET /api/comments/by-rating`  
**Query Parameters:**
- `rating` (required): Star rating 1-5
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:**
```
GET /api/comments/by-rating?rating=5&page=1&limit=20
```

### Search Reviews

Full-text search in review comments and reviewer names.

**Endpoint:** `GET /api/comments/search`  
**Query Parameters:**
- `query` (required): Search term
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:**
```
GET /api/comments/search?query=haircut&page=1
```

---

## Moderation System

### Moderate Review (Admin Only)

Approve, reject, or set review status back to pending.

**Endpoint:** `PATCH /api/comments/:id/moderate`  
**Authentication:** Required (Admin only)  
**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "status": "approved",  // or "rejected", "pending"
  "notes": "Approved after verification"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review approved successfully"
}
```

**Status Options:**
- `approved`: Review is visible to public
- `rejected`: Review is hidden from public view
- `pending`: Review awaiting moderation

### Get Pending Reviews (Admin Only)

Get all reviews awaiting moderation.

**Endpoint:** `GET /api/comments/admin/pending`  
**Authentication:** Required (Admin only)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 150,
      "user_id": 45,
      "rating": 5,
      "comment": "Great experience!",
      "status": "pending",
      "created_at": "2024-01-20T14:22:00.000Z",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "user_avatar": null
    }
    // ... more pending reviews
  ]
}
```

---

## Frontend Integration

### Display Rating Statistics Dashboard

```javascript
class ReviewStatsWidget {
    constructor(container) {
        this.container = container;
        this.init();
    }
    
    async init() {
        const stats = await this.fetchStats();
        this.render(stats);
    }
    
    async fetchStats() {
        const response = await fetch('/api/comments/stats');
        const { data } = await response.json();
        return data;
    }
    
    render(stats) {
        this.container.innerHTML = `
            <div class="review-stats">
                <div class="overall-rating">
                    <div class="rating-number">${stats.averageRating}</div>
                    <div class="stars">${this.renderStars(stats.averageRating)}</div>
                    <div class="total">${stats.totalReviews} reviews</div>
                </div>
                
                <div class="rating-breakdown">
                    ${Object.entries(stats.ratingBreakdown)
                        .reverse()
                        .map(([stars, info]) => `
                            <div class="rating-row">
                                <span class="stars">${stars} ★</span>
                                <div class="bar-container">
                                    <div class="bar" style="width: ${info.percentage}%"></div>
                                </div>
                                <span class="count">${info.count}</span>
                            </div>
                        `).join('')}
                </div>
                
                <div class="review-insights">
                    <div class="insight">
                        <strong>${stats.recentTrend.last30Days}</strong>
                        reviews this month
                    </div>
                    <div class="insight">
                        <strong>${stats.verifiedReviews}</strong>
                        verified reviews
                    </div>
                </div>
            </div>
        `;
    }
    
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + 
               (hasHalfStar ? '½' : '') + 
               '☆'.repeat(emptyStars);
    }
}

// Initialize
const widget = new ReviewStatsWidget(document.querySelector('#review-stats'));
```

### Featured Reviews Carousel

```javascript
async function loadFeaturedReviews() {
    const response = await fetch('/api/comments/featured?limit=3');
    const { data: reviews } = await response.json();
    
    const carousel = document.querySelector('.featured-reviews-carousel');
    carousel.innerHTML = reviews.map(review => `
        <div class="featured-review">
            <div class="review-header">
                <img src="${review.user_avatar || '/default-avatar.png'}" 
                     alt="${review.user_name}">
                <div>
                    <h4>${review.user_name}</h4>
                    ${review.user_verified ? '<span class="verified-badge">✓ Verified</span>' : ''}
                </div>
                <div class="rating">${'★'.repeat(review.rating)}</div>
            </div>
            <p class="review-text">${review.comment}</p>
            <div class="review-footer">
                <span class="helpful-count">👍 ${review.helpful} found this helpful</span>
                <span class="review-date">${new Date(review.created_at).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}
```

### Rating Filter Tabs

```javascript
class RatingFilter {
    constructor() {
        this.currentRating = null;
        this.setupFilters();
    }
    
    setupFilters() {
        document.querySelectorAll('.rating-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rating = e.target.dataset.rating;
                this.filterByRating(rating);
            });
        });
    }
    
    async filterByRating(rating) {
        const endpoint = rating === 'all' 
            ? '/api/comments?status=approved'
            : `/api/comments/by-rating?rating=${rating}`;
            
        const response = await fetch(endpoint);
        const { data: reviews, pagination } = await response.json();
        
        this.renderReviews(reviews);
        this.renderPagination(pagination);
    }
    
    renderReviews(reviews) {
        const container = document.querySelector('.reviews-list');
        container.innerHTML = reviews.map(review => `
            <div class="review-card">
                <!-- Review content -->
            </div>
        `).join('');
    }
    
    renderPagination(pagination) {
        // Pagination UI implementation
    }
}
```

### Admin Moderation Panel

```javascript
class ReviewModerationPanel {
    constructor() {
        this.loadPendingReviews();
    }
    
    async loadPendingReviews() {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/comments/admin/pending', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const { data: reviews } = await response.json();
        this.renderPendingReviews(reviews);
    }
    
    renderPendingReviews(reviews) {
        const container = document.querySelector('.pending-reviews');
        container.innerHTML = reviews.map(review => `
            <div class="pending-review" data-id="${review.id}">
                <div class="review-content">
                    <strong>${review.user_name}</strong> (${review.user_email})
                    <div class="rating">${'★'.repeat(review.rating)}</div>
                    <p>${review.comment}</p>
                    <small>${new Date(review.created_at).toLocaleString()}</small>
                </div>
                <div class="moderation-actions">
                    <button class="approve-btn" data-id="${review.id}">
                        ✓ Approve
                    </button>
                    <button class="reject-btn" data-id="${review.id}">
                        ✗ Reject
                    </button>
                </div>
            </div>
        `).join('');
        
        this.setupModerationActions();
    }
    
    setupModerationActions() {
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.moderateReview(id, 'approved');
            });
        });
        
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.moderateReview(id, 'rejected');
            });
        });
    }
    
    async moderateReview(id, status) {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/comments/${id}/moderate`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                status,
                notes: `${status} by admin` 
            })
        });
        
        if (response.ok) {
            // Remove from pending list
            document.querySelector(`[data-id="${id}"]`).remove();
            this.showNotification(`Review ${status} successfully`);
        }
    }
    
    showNotification(message) {
        // Toast notification implementation
    }
}
```

---

## Example Responses

### Complete Review Object

```json
{
  "id": 42,
  "user_id": 15,
  "rating": 5,
  "comment": "Absolutely wonderful experience! The salon is beautiful...",
  "helpful": 127,
  "is_verified": true,
  "is_admin": false,
  "status": "approved",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "user_name": "Sarah Johnson",
  "user_avatar": "https://example.com/avatars/sarah.jpg",
  "user_verified": true
}
```

### Top Reviewer Object

```json
{
  "id": 15,
  "name": "Sarah Johnson",
  "avatar": "https://example.com/avatars/sarah.jpg",
  "verified": true,
  "review_count": 23,
  "average_rating": "4.8",
  "total_helpful_received": 456
}
```

---

## Best Practices

### Performance Optimization

1. **Cache Statistics**: Cache `/api/comments/stats` response for 5-10 minutes
2. **Pagination**: Always use pagination for large result sets
3. **Lazy Loading**: Load featured reviews on viewport intersection
4. **CDN**: Cache public endpoints at CDN edge

### User Experience

1. **Loading States**: Show skeleton screens while fetching stats
2. **Error Handling**: Gracefully handle API failures with retry logic
3. **Optimistic Updates**: Update UI before API confirmation
4. **Real-time Updates**: Consider WebSocket for live review counts

### Security

1. **Rate Limiting**: All endpoints are rate-limited (100 req/15min)
2. **Input Sanitization**: All review content is sanitized before storage
3. **Admin Verification**: Moderation endpoints require admin JWT token
4. **CORS**: Configure CORS for your frontend domain

### SEO Optimization

1. **Schema.org**: Add AggregateRating structured data
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "LocalBusiness",
  "name": "Quyền Hair Salon",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "1247"
  }
}
</script>
```

2. **Meta Tags**: Update page meta with review stats
```html
<meta property="og:rating" content="4.8">
<meta property="og:rating_scale" content="5">
<meta property="og:rating_count" content="1247">
```

---

## Testing

### cURL Examples

**Get Statistics:**
```bash
curl http://localhost:3001/api/comments/stats
```

**Get Featured Reviews:**
```bash
curl http://localhost:3001/api/comments/featured?limit=5
```

**Filter by Rating:**
```bash
curl http://localhost:3001/api/comments/by-rating?rating=5&page=1
```

**Search Reviews:**
```bash
curl "http://localhost:3001/api/comments/search?query=haircut"
```

**Moderate Review (Admin):**
```bash
curl -X PATCH http://localhost:3001/api/comments/42/moderate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved", "notes": "Verified purchase"}'
```

---

## Database Queries

The system uses optimized SQL queries for performance:

### Statistics Query
```sql
SELECT 
    COUNT(*) as total_reviews,
    AVG(rating) as average_rating,
    SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star_count,
    -- ... other ratings
FROM comments 
WHERE status = 'approved';
```

### Featured Reviews Query
```sql
SELECT c.*, u.name, u.avatar, u.verified
FROM comments c
JOIN users u ON c.user_id = u.id
WHERE c.status = 'approved' AND c.rating = 5
ORDER BY c.helpful DESC, c.created_at DESC
LIMIT 3;
```

### Top Reviewers Query
```sql
SELECT 
    u.id, u.name, u.avatar, u.verified,
    COUNT(c.id) as review_count,
    AVG(c.rating) as average_rating,
    SUM(c.helpful) as total_helpful_received
FROM users u
JOIN comments c ON u.id = c.user_id
WHERE c.status = 'approved'
GROUP BY u.id
ORDER BY review_count DESC, total_helpful_received DESC
LIMIT 10;
```

---

## Next Steps

1. **Frontend Implementation**: Integrate these endpoints into your `script.js` CommentsHandler
2. **Admin Dashboard**: Create dedicated admin panel for moderation
3. **Analytics Dashboard**: Build visual charts using Chart.js or similar
4. **Email Notifications**: Notify users when their review is approved
5. **Review Incentives**: Award badges to top reviewers
6. **Spam Detection**: Implement automated spam filtering
7. **Sentiment Analysis**: Add AI-powered sentiment scoring
8. **Photo Reviews**: Allow users to upload photos with reviews

---

## Support

For issues or questions:
- Check the main [Backend README](server/README.md)
- Review [Backend Summary](BACKEND_SUMMARY.md)
- Check database connection and migrations
- Verify JWT tokens are being sent correctly
- Ensure `is_admin` column exists in users table

**Last Updated:** January 2024
