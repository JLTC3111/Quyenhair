# Reviews System - Quick Start Guide

## What Was Added

Complete customer reviews analytics and statistics system with:

✅ **8 New API Endpoints** for reviews statistics and filtering  
✅ **2 Admin Endpoints** for review moderation  
✅ **Comprehensive Analytics** including rating breakdowns and trends  
✅ **Advanced Filtering** by rating, verification, date, and search  
✅ **Top Reviewers Leaderboard**  
✅ **Admin Moderation System** with approve/reject workflow

---

## Quick API Reference

### Public Endpoints (No Auth Required)

```bash
# Get complete review statistics
GET /api/comments/stats
→ Returns: averageRating, totalReviews, ratingBreakdown, trends

# Get featured reviews (5-star with most helpful votes)
GET /api/comments/featured?limit=3
→ Returns: Top 3 featured reviews

# Get recent reviews
GET /api/comments/recent?limit=5&days=30
→ Returns: Reviews from last 30 days

# Get top reviewers leaderboard
GET /api/comments/top-reviewers?limit=10
→ Returns: Most active reviewers with stats

# Get verified reviews only
GET /api/comments/verified?page=1&limit=10
→ Returns: Reviews from verified users

# Filter by rating
GET /api/comments/by-rating?rating=5&page=1
→ Returns: All 5-star reviews

# Search reviews
GET /api/comments/search?query=haircut
→ Returns: Reviews matching search term
```

### Admin Endpoints (Require Admin JWT Token)

```bash
# Get pending reviews
GET /api/comments/admin/pending
Authorization: Bearer <admin_token>
→ Returns: All reviews awaiting moderation

# Moderate a review
PATCH /api/comments/:id/moderate
Authorization: Bearer <admin_token>
Content-Type: application/json
{
  "status": "approved",  // or "rejected" or "pending"
  "notes": "Verified purchase"
}
→ Returns: Success message
```

---

## Frontend Integration Examples

### Display Overall Rating

```javascript
// Fetch and display review statistics
async function displayRating() {
    const res = await fetch('/api/comments/stats');
    const { data } = await res.json();
    
    document.querySelector('.rating-number').textContent = data.averageRating;
    document.querySelector('.review-count').textContent = 
        `${data.totalReviews} reviews`;
    
    // Display 5-star breakdown
    Object.entries(data.ratingBreakdown).forEach(([stars, info]) => {
        document.querySelector(`.bar-${stars}`).style.width = 
            `${info.percentage}%`;
    });
}
```

### Featured Reviews Carousel

```javascript
// Load top 3 featured reviews
async function loadFeaturedReviews() {
    const res = await fetch('/api/comments/featured?limit=3');
    const { data } = await res.json();
    
    const html = data.map(review => `
        <div class="featured-review">
            <div class="stars">${'★'.repeat(review.rating)}</div>
            <p>${review.comment}</p>
            <div class="author">${review.user_name}</div>
            <div class="helpful">👍 ${review.helpful} helpful</div>
        </div>
    `).join('');
    
    document.querySelector('.featured-reviews').innerHTML = html;
}
```

### Rating Filter

```javascript
// Filter reviews by star rating
async function filterByRating(rating) {
    const res = await fetch(
        `/api/comments/by-rating?rating=${rating}&page=1&limit=10`
    );
    const { data, pagination } = await res.json();
    
    displayReviews(data);
    displayPagination(pagination);
}

// Usage
document.querySelector('.filter-5-stars').onclick = () => filterByRating(5);
document.querySelector('.filter-4-stars').onclick = () => filterByRating(4);
```

### Search Reviews

```javascript
// Search reviews by keyword
async function searchReviews(query) {
    const res = await fetch(
        `/api/comments/search?query=${encodeURIComponent(query)}&page=1`
    );
    const { data } = await res.json();
    
    displaySearchResults(data);
}

// Usage
document.querySelector('#search-btn').onclick = () => {
    const query = document.querySelector('#search-input').value;
    searchReviews(query);
};
```

---

## Admin Moderation Panel

### Load Pending Reviews

```javascript
async function loadPendingReviews() {
    const token = localStorage.getItem('adminToken');
    
    const res = await fetch('/api/comments/admin/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const { data } = await res.json();
    
    const html = data.map(review => `
        <div class="pending-review">
            <div><strong>${review.user_name}</strong></div>
            <div class="rating">${'★'.repeat(review.rating)}</div>
            <p>${review.comment}</p>
            <button onclick="moderateReview(${review.id}, 'approved')">
                Approve
            </button>
            <button onclick="moderateReview(${review.id}, 'rejected')">
                Reject
            </button>
        </div>
    `).join('');
    
    document.querySelector('#pending-reviews').innerHTML = html;
}
```

### Moderate Review

```javascript
async function moderateReview(id, status) {
    const token = localStorage.getItem('adminToken');
    
    const res = await fetch(`/api/comments/${id}/moderate`, {
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
    
    if (res.ok) {
        alert(`Review ${status} successfully`);
        loadPendingReviews(); // Reload list
    }
}
```

---

## Response Format Examples

### Statistics Response

```json
{
  "success": true,
  "data": {
    "totalReviews": 1247,
    "averageRating": 4.8,
    "ratingBreakdown": {
      "5": { "count": 935, "percentage": "75.0" },
      "4": { "count": 249, "percentage": "20.0" },
      "3": { "count": 63, "percentage": "5.0" },
      "2": { "count": 0, "percentage": "0.0" },
      "1": { "count": 0, "percentage": "0.0" }
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

### Featured Review

```json
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
```

### Top Reviewer

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

## Database Setup

The system requires the `is_admin` column in the users table:

```sql
-- Add is_admin column to users table
ALTER TABLE users 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE,
ADD INDEX idx_is_admin (is_admin);

-- Make a user an admin
UPDATE users SET is_admin = TRUE WHERE email = 'admin@example.com';
```

Or recreate the database using the updated schema:

```bash
mysql -u root -p < server/database/schema.sql
```

---

## Testing with cURL

### Get Statistics
```bash
curl http://localhost:3001/api/comments/stats | json_pp
```

### Get Featured Reviews
```bash
curl "http://localhost:3001/api/comments/featured?limit=5" | json_pp
```

### Filter by Rating
```bash
curl "http://localhost:3001/api/comments/by-rating?rating=5&page=1" | json_pp
```

### Search Reviews
```bash
curl "http://localhost:3001/api/comments/search?query=haircut" | json_pp
```

### Moderate Review (Admin)
```bash
curl -X PATCH http://localhost:3001/api/comments/42/moderate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved", "notes": "Verified"}' | json_pp
```

---

## SEO Integration

Add structured data to your HTML for better SEO:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "LocalBusiness",
  "name": "Quyền Hair Salon",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "1247",
    "bestRating": "5",
    "worstRating": "1"
  }
}
</script>
```

---

## Rate Limiting

All endpoints are rate-limited:
- **Limit:** 100 requests per 15 minutes per IP
- **Response on limit:** 429 Too Many Requests
- **Headers:** 
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time until limit resets

---

## Next Steps

1. **Test the Endpoints**
   ```bash
   cd server
   npm run dev
   # Open another terminal
   curl http://localhost:3001/api/comments/stats | json_pp
   ```

2. **Create an Admin User**
   ```sql
   UPDATE users SET is_admin = TRUE WHERE email = 'your@email.com';
   ```

3. **Integrate into Frontend**
   - Update `script.js` CommentsHandler
   - Add rating statistics widget
   - Add featured reviews carousel
   - Add rating filter tabs

4. **Build Admin Dashboard**
   - Create admin login page
   - Add moderation panel
   - Display pending reviews
   - Add approve/reject buttons

---

## Complete Documentation

For full documentation with more examples and best practices:

- **API Documentation:** [REVIEWS_ANALYTICS.md](REVIEWS_ANALYTICS.md)
- **Backend Setup:** [server/README.md](server/README.md)
- **Backend Summary:** [BACKEND_SUMMARY.md](BACKEND_SUMMARY.md)
- **Comments Feature:** [COMMENTS_FEATURE.md](COMMENTS_FEATURE.md)
- **Authentication:** [AUTHENTICATION.md](AUTHENTICATION.md)

---

## Common Issues

**Issue:** Getting 403 Forbidden on admin endpoints  
**Solution:** Make sure user has `is_admin = TRUE` in database

**Issue:** Statistics showing 0 reviews  
**Solution:** Reviews must have `status = 'approved'` to be counted

**Issue:** Featured reviews empty  
**Solution:** Need at least one 5-star review in the database

**Issue:** Search not working  
**Solution:** Use URL encoding for search query: `encodeURIComponent(query)`

---

## Support

Need help? Check these resources:
1. Review the [REVIEWS_ANALYTICS.md](REVIEWS_ANALYTICS.md) documentation
2. Test endpoints with the cURL examples above
3. Check browser console for JavaScript errors
4. Verify database connection and schema
5. Ensure JWT tokens are valid and not expired

**Happy Reviewing! ⭐⭐⭐⭐⭐**
