# Quyền Hair Backend API

Complete backend system for customer database, authentication, comments, and bookings management.

## Features

- 🔐 **Authentication**: Email/password and OAuth (Google, Facebook, Instagram)
- 👤 **User Management**: Profile, password change, account deletion
- 💬 **Comments System**: CRUD operations, replies, helpful votes
- 📅 **Bookings Management**: Create, view, update, cancel appointments
- 🔒 **Security**: JWT tokens, bcrypt hashing, rate limiting, input validation
- 📊 **Database**: MySQL with connection pooling
- 📧 **Email**: Verification and password reset (optional)

## Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js 4.18+
- **Database**: MySQL 8.0+
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator
- **Security**: Helmet, CORS, rate-limiting

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=quyenhair_db

# JWT Secrets (change these!)
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_token_secret

# Client URL
CLIENT_URL=http://localhost:5500
```

### 3. Set Up Database

Create the database and tables:

```bash
mysql -u root -p < database/schema.sql
```

Or manually:

```sql
CREATE DATABASE quyenhair_db;
USE quyenhair_db;
-- Then run the schema.sql file
```

### 4. Start Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password/:token` | Reset password | No |
| GET | `/api/auth/verify-email/:token` | Verify email | No |
| GET | `/api/auth/google` | Google OAuth | No |
| GET | `/api/auth/google/callback` | Google callback | No |
| GET | `/api/auth/facebook` | Facebook OAuth | No |
| GET | `/api/auth/facebook/callback` | Facebook callback | No |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get user profile | Yes |
| PUT | `/api/users/profile` | Update profile | Yes |
| PUT | `/api/users/change-password` | Change password | Yes |
| DELETE | `/api/users/account` | Delete account | Yes |

### Comments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/comments` | Get all comments | No |
| GET | `/api/comments/:id` | Get comment by ID | No |
| POST | `/api/comments` | Create comment | Yes |
| PUT | `/api/comments/:id` | Update comment | Yes (owner) |
| DELETE | `/api/comments/:id` | Delete comment | Yes (owner) |
| POST | `/api/comments/:id/helpful` | Mark helpful | No |
| POST | `/api/comments/:id/reply` | Reply to comment | Yes |
| GET | `/api/comments/user/my-comments` | Get user's comments | Yes |

### Bookings

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/bookings` | Create booking | Optional |
| GET | `/api/bookings/my-bookings` | Get user's bookings | Yes |
| GET | `/api/bookings/:id` | Get booking by ID | Yes |
| PATCH | `/api/bookings/:id/status` | Update booking status | Yes |
| DELETE | `/api/bookings/:id` | Cancel booking | Yes |

## Request/Response Examples

### Register User

**Request:**
```json
POST /api/auth/register
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "provider": "email",
    "verified": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Create Comment

**Request:**
```json
POST /api/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Dịch vụ rất tốt, nhân viên nhiệt tình và chuyên nghiệp!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "rating": 5,
    "comment": "Dịch vụ rất tốt...",
    "helpful": 0,
    "user_name": "Nguyễn Văn A",
    "user_avatar": "https://...",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Create Booking

**Request:**
```json
POST /api/bookings
Content-Type: application/json

{
  "name": "Nguyễn Thị B",
  "phone": "0966856191",
  "email": "nguyenthib@example.com",
  "booking_date": "2024-02-01",
  "booking_time": "14:00",
  "service_type": "Tạo kiểu tóc giả",
  "message": "Muốn tư vấn kiểu tóc phù hợp cho khuôn mặt tròn"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 1
  }
}
```

## Authentication

### JWT Tokens

The API uses JWT tokens for authentication. Include the token in requests:

**Header:**
```
Authorization: Bearer <your_token>
```

**Cookie:**
```
token=<your_token>
```

### Token Lifecycle

1. **Access Token**: Expires in 24 hours (configurable)
2. **Refresh Token**: Expires in 7 days (configurable)
3. Use `/api/auth/refresh` to get new access token

## Database Schema

### Users Table
- Stores user accounts (email and OAuth)
- Fields: id, name, email, password, provider, verified, avatar

### Comments Table
- User reviews and ratings
- Fields: id, user_id, rating, comment, helpful, status

### Comment Replies Table
- Replies to comments
- Fields: id, comment_id, user_id, reply

### Bookings Table
- Appointment bookings
- Fields: id, user_id, name, phone, email, booking_date, status

### Refresh Tokens Table
- JWT refresh tokens
- Fields: id, user_id, token, expires_at

## Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Tokens**: Signed with secret keys
3. **Rate Limiting**: 100 requests per 15 minutes
4. **Input Validation**: express-validator
5. **SQL Injection Prevention**: Parameterized queries
6. **XSS Protection**: Helmet middleware
7. **CORS**: Configurable origins

## Development

### Run Tests

```bash
npm test
```

### Database Migration

```bash
npm run migrate
```

### Seed Database

```bash
npm run seed
```

## Deployment

### Production Checklist

- [ ] Change JWT_SECRET and JWT_REFRESH_SECRET
- [ ] Set NODE_ENV=production
- [ ] Configure production database
- [ ] Set up SSL/TLS certificates
- [ ] Configure OAuth redirect URIs
- [ ] Set up email service
- [ ] Enable rate limiting
- [ ] Set up logging
- [ ] Configure CORS for production domain

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=3000

DB_HOST=your-production-db-host
DB_USER=your-db-user
DB_PASSWORD=strong-password
DB_NAME=quyenhair_db

JWT_SECRET=very-long-random-secret-key
JWT_REFRESH_SECRET=another-very-long-secret-key

CLIENT_URL=https://quyenhair.vn
ALLOWED_ORIGINS=https://quyenhair.vn,https://www.quyenhair.vn

# OAuth credentials
GOOGLE_CLIENT_ID=your-google-client-id
FACEBOOK_APP_ID=your-facebook-app-id
INSTAGRAM_CLIENT_ID=your-instagram-client-id
```

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `http://localhost:3000/api/auth/google/callback`
5. Copy Client ID and Secret to `.env`

### Facebook Login

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create app → Add Facebook Login
3. Configure OAuth redirect URIs
4. Copy App ID and Secret to `.env`

### Instagram Basic Display

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create app → Add Instagram Basic Display
3. Configure redirect URIs
4. Copy Client ID and Secret to `.env`

## Troubleshooting

### Database Connection Failed

```bash
# Check MySQL is running
mysql -u root -p

# Verify credentials in .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
```

### Port Already in Use

```bash
# Change port in .env
PORT=3001

# Or kill process using port 3000
lsof -ti:3000 | xargs kill
```

### JWT Token Invalid

- Check JWT_SECRET matches between requests
- Ensure token hasn't expired
- Verify Authorization header format: `Bearer <token>`

## API Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **Auth endpoints**: Separate stricter limits
- Customize in `.env`: `RATE_LIMIT_MAX_REQUESTS=100`

## Support

For issues or questions:
- Email: tech@quyenhair.com
- Documentation: https://docs.quyenhair.vn
- GitHub: https://github.com/quyenhair/backend

## License

Proprietary - All rights reserved © 2024 Quyền Hair
