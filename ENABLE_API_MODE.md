# Enable Backend API Integration - Quick Guide

## Current Status

✅ **Frontend Code Updated** - All necessary code for API integration is in place  
⚠️ **API Mode Disabled** - Currently using localStorage (demo mode)  
🎯 **Goal** - Connect frontend to your backend API

---

## Step 1: Start Your Backend Server

```bash
cd server
npm install
npm run dev
```

The server should start on `http://localhost:3001`

---

## Step 2: Enable API Mode

Open `/script.js` and find the `CommentsHandler` class (around line 506):

```javascript
class CommentsHandler {
    constructor() {
        // API Configuration - Change to your backend URL
        this.API_BASE_URL = 'http://localhost:3001/api';
        this.USE_API = false; // ⬅️ CHANGE THIS TO TRUE
```

**Change to:**

```javascript
this.USE_API = true; // ✅ Enable API mode
```

---

## Step 3: Test the Connection

1. Open your website in a browser
2. Navigate to the Comments section (#comments)
3. Open browser DevTools (F12) → Console tab
4. Look for any errors

**Expected behavior:**
- Rating statistics load from API
- Featured reviews display from database
- Filter buttons work with API endpoints

---

## What Will Change?

### Before (localStorage mode):
- Static demo data
- No real database
- Reviews reset on browser clear
- No admin moderation

### After (API mode):
- Live data from MySQL database
- Real user authentication
- Persistent reviews across devices
- Admin moderation panel
- Advanced filtering and statistics

---

## Verify It's Working

### Check Statistics Display:

**Look for these elements updating:**
- Average rating number
- Total review count
- Rating breakdown bars with percentages
- "Recent reviews this month" count
- "Verified reviews" count

### Check Featured Reviews:

**Should display 3 cards showing:**
- User avatar or initial
- User name with verification badge
- 5-star rating display
- Review comment text
- Helpful vote count
- Date posted

### Test Filter Buttons:

Click these buttons and watch the results update:
- **All** - Shows all approved reviews
- **5 stars** - Only 5-star reviews
- **4 stars** - Only 4-star reviews
- **Verified** - Only from verified users
- **Recent** - Last 30 days

---

## Troubleshooting

### Error: "Failed to fetch"

**Problem:** Backend not running or wrong URL

**Solution:**
```bash
# Make sure backend is running
cd server
npm run dev

# Check it's on port 3001
curl http://localhost:3001/api/comments/stats
```

### Error: "CORS policy"

**Problem:** Backend not allowing frontend requests

**Solution:** Backend already has CORS enabled for `http://localhost:5500`
If using different port, update `server/server.js`:

```javascript
app.use(cors({
    origin: 'http://localhost:YOUR_PORT',  // Change port
    credentials: true
}));
```

### No data showing

**Problem:** Database is empty

**Solution:** Add test data to database:

```sql
-- Connect to MySQL
mysql -u root -p quyenhair_db

-- Insert test review
INSERT INTO comments (user_id, rating, comment, status, helpful) 
VALUES (1, 5, 'Amazing service! Highly recommended.', 'approved', 15);
```

### Statistics show 0

**Problem:** No approved reviews in database

**Solution:** Reviews must have `status = 'approved'` to be counted

```sql
UPDATE comments SET status = 'approved' WHERE status = 'pending';
```

---

## Testing Checklist

Once enabled, verify these features:

- [ ] Statistics display (average rating, total count)
- [ ] Rating breakdown bars animate correctly
- [ ] Featured reviews section shows 3 reviews
- [ ] Filter buttons change active state
- [ ] "5 stars" filter shows only 5-star reviews
- [ ] "Verified" filter shows only verified users
- [ ] "Recent" filter shows last 30 days
- [ ] No console errors
- [ ] Page loads without delays

---

## Production Deployment

When deploying to production:

### 1. Update API URL

```javascript
this.API_BASE_URL = 'https://your-domain.com/api';  // Your production URL
this.USE_API = true;
```

### 2. Enable HTTPS

Ensure your backend uses HTTPS in production for security.

### 3. Update CORS

Update backend CORS to allow your production domain:

```javascript
app.use(cors({
    origin: 'https://your-frontend-domain.com',
    credentials: true
}));
```

### 4. Environment Variables

Set production environment variables in server:

```env
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
DB_HOST=your-production-db-host
```

---

## Performance Tips

### 1. Cache Statistics

The `/api/comments/stats` endpoint can be cached:

```javascript
// Cache for 5 minutes
let statsCache = null;
let statsCacheTime = 0;

async loadStatisticsFromAPI() {
    const now = Date.now();
    if (statsCache && (now - statsCacheTime) < 300000) {
        this.displayStatistics(statsCache);
        return;
    }
    
    const response = await fetch(`${this.API_BASE_URL}/comments/stats`);
    const { data } = await response.json();
    
    statsCache = data;
    statsCacheTime = now;
    this.displayStatistics(data);
}
```

### 2. Lazy Load Featured Reviews

Only load when scrolled into view:

```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            this.loadFeaturedReviewsFromAPI();
            observer.disconnect();
        }
    });
});

const section = document.getElementById('featuredReviewsGrid');
if (section) observer.observe(section);
```

---

## Advanced: Search Reviews

The backend also supports search. To add search:

### 1. Add HTML Search Box

```html
<div class="review-search" style="margin-bottom: 2rem;">
    <input 
        type="text" 
        id="reviewSearchInput" 
        placeholder="Tìm kiếm đánh giá..."
        style="width: 100%; padding: 1rem; border-radius: 8px; border: 2px solid #ddd;"
    >
</div>
```

### 2. Add Search Method to Script

```javascript
async searchReviews(query) {
    if (!this.USE_API || !query.trim()) return;
    
    try {
        const response = await fetch(
            `${this.API_BASE_URL}/comments/search?query=${encodeURIComponent(query)}`
        );
        const { data } = await response.json();
        this.displayCommentsList(data);
    } catch (error) {
        console.error('Error searching reviews:', error);
    }
}
```

### 3. Add Event Listener

```javascript
const searchInput = document.getElementById('reviewSearchInput');
if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            this.searchReviews(e.target.value);
        }, 500); // Debounce 500ms
    });
}
```

---

## Summary

**To see the new features:**

1. Start backend: `cd server && npm run dev`
2. Change `USE_API` to `true` in script.js
3. Refresh your browser
4. View the Comments section

**You'll see:**
- ✨ Live rating statistics
- ⭐ Featured 5-star reviews
- 🔍 Advanced filtering options
- 📊 Real-time data from database

**Still in demo mode?**
- Keep `USE_API = false`
- Features work with localStorage
- No backend needed for testing UI

---

## Need Help?

**Check these docs:**
- API Endpoints: [REVIEWS_ANALYTICS.md](REVIEWS_ANALYTICS.md)
- Backend Setup: [server/README.md](server/README.md)
- Quick Reference: [REVIEWS_QUICKSTART.md](REVIEWS_QUICKSTART.md)

**Or test with cURL:**
```bash
# Test if backend is responding
curl http://localhost:3001/api/comments/stats | json_pp
```

Good luck! 🚀
