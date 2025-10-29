# Authentication System Documentation

## Overview

The Quyền Hair website features a comprehensive authentication system that allows customers to log in using social media accounts (Google, Facebook, Instagram) or traditional email/password credentials. This system enhances user experience by enabling personalized features like saved preferences, comment management, and booking history.

## Features

### 1. **Social Media Login**
- **Google Authentication**: OAuth 2.0 integration with Google Sign-In
- **Facebook Authentication**: Facebook Login integration
- **Instagram Authentication**: Instagram Basic Display API integration
- One-click login with existing social accounts
- Automatic profile data retrieval (name, email, avatar)

### 2. **Email/Password Authentication**
- Traditional registration with email verification
- Secure password requirements (minimum 8 characters)
- Password confirmation validation
- Terms of service acceptance
- "Remember Me" functionality

### 3. **User Session Management**
- Persistent login using localStorage (Remember Me)
- Session-based login using sessionStorage
- Automatic session restoration on page load
- Secure logout with complete session cleanup

### 4. **User Interface**
- Modern modal-based authentication dialog
- Tab switching between Login and Register
- User profile dropdown with avatar
- Visual indicators for logged-in state
- Responsive design for all devices

### 5. **Integration Features**
- Auto-fill comment forms with user data
- User verification badges
- Profile picture display from social accounts
- Custom events for component communication

## Technical Implementation

### HTML Structure

The authentication system consists of:

1. **Auth Modal** (`#authModal`)
   - Login form
   - Registration form
   - Social login buttons
   - Tab navigation

2. **User Button** (`#userBtn`)
   - Login trigger (when logged out)
   - Profile dropdown trigger (when logged in)

3. **User Dropdown** (`#userDropdown`)
   - User profile display
   - Quick navigation links
   - Logout button

### CSS Styling

Key styling features:

```css
/* Auth Modal */
.auth-modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: var(--z-modal);
}

/* Social Buttons */
.social-btn--google { color: #DB4437; }
.social-btn--facebook { color: #4267B2; }
.social-btn--instagram { color: #E1306C; }

/* User Dropdown */
.user-dropdown {
    min-width: 280px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}
```

### JavaScript Architecture

#### AuthHandler Class

The `AuthHandler` class manages all authentication operations:

**Properties:**
- `currentUser`: Currently logged-in user object
- `authModal`: Reference to authentication modal
- `userBtn`: User button in navigation
- `userDropdown`: User profile dropdown
- `oauthConfig`: OAuth provider configuration

**Methods:**

##### Core Authentication
```javascript
loginUser(userData, rememberMe)
```
- Logs in a user with provided data
- Stores session in localStorage or sessionStorage
- Updates UI to reflect logged-in state
- Dispatches 'userLoggedIn' event

```javascript
logoutUser()
```
- Clears current user session
- Removes all stored data
- Resets UI to logged-out state
- Dispatches 'userLoggedOut' event

```javascript
loadUserSession()
```
- Checks for existing user session on page load
- Restores user state from storage
- Updates UI accordingly

##### Social Authentication
```javascript
handleSocialLogin(provider)
```
- Initiates OAuth flow for specified provider
- Shows loading state during authentication
- Creates user session on success
- Parameters: 'google', 'facebook', 'instagram'

```javascript
getOAuthUrl(provider)
```
- Generates OAuth authorization URL
- Includes client ID, redirect URI, and scopes
- Returns complete authorization URL

##### Email Authentication
```javascript
setupEmailLogin()
```
- Handles email/password login form submission
- Validates email and password fields
- Creates user session on successful login

```javascript
setupEmailRegister()
```
- Handles registration form submission
- Validates all required fields
- Checks password match and length
- Verifies terms acceptance

##### UI Management
```javascript
updateUserUI()
```
- Updates navigation button appearance
- Populates dropdown with user data
- Shows/hides verification badges
- Handles avatar display

```javascript
openModal() / closeModal()
```
- Shows/hides authentication modal
- Manages body scroll lock
- Resets form state

## OAuth Configuration

### Required Setup

To enable social media login in production, you need to:

#### 1. Google OAuth 2.0

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

**Configuration:**
```javascript
google: {
    clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    redirectUri: 'https://quyenhair.vn/auth/google/callback',
    scope: 'profile email'
}
```

**Scopes:**
- `profile`: User's basic profile information
- `email`: User's email address

#### 2. Facebook Login

**Steps:**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs
5. Submit app for review

**Configuration:**
```javascript
facebook: {
    appId: 'YOUR_FACEBOOK_APP_ID',
    redirectUri: 'https://quyenhair.vn/auth/facebook/callback',
    scope: 'email,public_profile'
}
```

**Permissions:**
- `email`: User's email address
- `public_profile`: Public profile information

#### 3. Instagram Basic Display

**Steps:**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create app with Instagram Basic Display
3. Configure redirect URIs
4. Add Instagram testers
5. Submit for review

**Configuration:**
```javascript
instagram: {
    clientId: 'YOUR_INSTAGRAM_CLIENT_ID',
    redirectUri: 'https://quyenhair.vn/auth/instagram/callback',
    scope: 'user_profile,user_media'
}
```

**Scopes:**
- `user_profile`: User's profile information
- `user_media`: User's media (optional)

## Backend Requirements

### API Endpoints

The authentication system requires the following backend endpoints:

#### 1. Email Authentication

**POST `/api/auth/register`**
```json
Request:
{
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "password": "securepassword123"
}

Response:
{
    "success": true,
    "user": {
        "id": 12345,
        "name": "Nguyễn Văn A",
        "email": "nguyenvana@example.com",
        "provider": "email",
        "verified": false
    },
    "token": "jwt_token_here"
}
```

**POST `/api/auth/login`**
```json
Request:
{
    "email": "nguyenvana@example.com",
    "password": "securepassword123"
}

Response:
{
    "success": true,
    "user": {
        "id": 12345,
        "name": "Nguyễn Văn A",
        "email": "nguyenvana@example.com",
        "provider": "email",
        "verified": true
    },
    "token": "jwt_token_here"
}
```

#### 2. OAuth Callbacks

**GET `/auth/google/callback`**
- Receives authorization code from Google
- Exchanges code for access token
- Retrieves user profile from Google API
- Creates or updates user in database
- Returns user data and JWT token

**GET `/auth/facebook/callback`**
- Receives authorization code from Facebook
- Exchanges code for access token
- Retrieves user profile from Facebook Graph API
- Creates or updates user in database
- Returns user data and JWT token

**GET `/auth/instagram/callback`**
- Receives authorization code from Instagram
- Exchanges code for access token
- Retrieves user profile from Instagram API
- Creates or updates user in database
- Returns user data and JWT token

#### 3. Session Management

**GET `/api/auth/me`**
```json
Response:
{
    "success": true,
    "user": {
        "id": 12345,
        "name": "Nguyễn Văn A",
        "email": "nguyenvana@example.com",
        "provider": "google",
        "avatar": "https://...",
        "verified": true
    }
}
```

**POST `/api/auth/logout`**
```json
Response:
{
    "success": true,
    "message": "Logged out successfully"
}
```

### Database Schema

**users table:**
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    provider ENUM('email', 'google', 'facebook', 'instagram') DEFAULT 'email',
    provider_id VARCHAR(255),
    avatar VARCHAR(500),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_provider_id ON users(provider, provider_id);
```

## Security Considerations

### 1. Password Security
- Hash passwords using bcrypt with salt rounds ≥ 10
- Never store plain text passwords
- Enforce minimum password length (8+ characters)
- Consider password strength requirements

### 2. OAuth Security
- Use HTTPS for all OAuth redirects
- Validate state parameter to prevent CSRF
- Store OAuth tokens securely
- Implement token refresh mechanism

### 3. Session Management
- Use secure, httpOnly cookies for JWT tokens
- Implement token expiration (e.g., 24 hours)
- Validate tokens on every protected request
- Clear sessions on logout

### 4. XSS Prevention
- Sanitize all user inputs
- Use Content Security Policy headers
- Escape HTML in user-generated content
- Validate email formats

### 5. Rate Limiting
- Limit login attempts (e.g., 5 per hour)
- Implement CAPTCHA after failed attempts
- Monitor for suspicious activity

## User Data Structure

```javascript
{
    id: 12345,                    // Unique user ID
    name: "Nguyễn Văn A",         // Full name
    email: "user@example.com",    // Email address
    provider: "google",           // Auth provider
    avatar: "https://...",        // Profile picture URL
    verified: true,               // Email verification status
    createdAt: "2024-01-15",      // Registration date
    lastLogin: "2024-01-20"       // Last login timestamp
}
```

## Integration with Comments System

The authentication system integrates seamlessly with the comments feature:

### Auto-fill User Data
```javascript
// Listen for login event
window.addEventListener('userLoggedIn', (e) => {
    const user = e.detail;
    document.getElementById('commentName').value = user.name;
    document.getElementById('commentEmail').value = user.email;
});
```

### Clear on Logout
```javascript
// Listen for logout event
window.addEventListener('userLoggedOut', () => {
    document.getElementById('commentName').value = '';
    document.getElementById('commentEmail').value = '';
});
```

### Display User Avatar
Comments from logged-in users can show their profile pictures:
```javascript
const avatar = user.avatar 
    ? `<img src="${user.avatar}" alt="${user.name}">`
    : `<div class="avatar-initials">${initials}</div>`;
```

## Testing Checklist

### Manual Testing

- [ ] **Login Modal**
  - [ ] Opens when clicking user button (logged out)
  - [ ] Closes when clicking X button
  - [ ] Closes when clicking outside modal
  - [ ] Prevents body scroll when open

- [ ] **Tab Switching**
  - [ ] Switches between Login and Register tabs
  - [ ] Shows correct form for each tab
  - [ ] Maintains active state styling

- [ ] **Social Login**
  - [ ] Google button triggers OAuth flow
  - [ ] Facebook button triggers OAuth flow
  - [ ] Instagram button triggers OAuth flow
  - [ ] Shows loading state during authentication
  - [ ] Creates user session on success

- [ ] **Email Login**
  - [ ] Validates required fields
  - [ ] Shows error for invalid email
  - [ ] Shows error for incorrect password
  - [ ] "Remember Me" persists across sessions
  - [ ] Redirects on successful login

- [ ] **Email Registration**
  - [ ] Validates all required fields
  - [ ] Checks password match
  - [ ] Enforces minimum password length
  - [ ] Requires terms acceptance
  - [ ] Creates account successfully

- [ ] **User Dropdown**
  - [ ] Opens when clicking user button (logged in)
  - [ ] Shows user name and email
  - [ ] Displays avatar/initials correctly
  - [ ] Shows verification badge if applicable
  - [ ] Navigation links work correctly

- [ ] **Logout**
  - [ ] Clears user session
  - [ ] Resets UI to logged-out state
  - [ ] Clears comment form data
  - [ ] Closes dropdown

- [ ] **Session Persistence**
  - [ ] Session persists with "Remember Me"
  - [ ] Session clears without "Remember Me" after browser close
  - [ ] Auto-restores session on page load
  - [ ] Handles expired sessions gracefully

- [ ] **Comments Integration**
  - [ ] Auto-fills name and email when logged in
  - [ ] Clears fields on logout
  - [ ] Shows user avatar in comments
  - [ ] Displays verification badge

- [ ] **Responsive Design**
  - [ ] Modal displays correctly on mobile
  - [ ] Forms are easy to fill on touch devices
  - [ ] Social buttons are touch-friendly (44px minimum)
  - [ ] Dropdown fits on small screens

### Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Troubleshooting

### Common Issues

**Issue: Social login buttons don't work**
- Check OAuth configuration in code
- Verify client IDs and redirect URIs
- Ensure backend OAuth endpoints are implemented
- Check browser console for errors

**Issue: Session not persisting**
- Verify localStorage is enabled in browser
- Check if "Remember Me" checkbox is working
- Ensure user data is being saved correctly
- Clear browser cache and cookies

**Issue: Modal doesn't close**
- Check event listeners are properly attached
- Verify closeModal() function is working
- Ensure body overflow is being reset
- Check for JavaScript errors in console

**Issue: User dropdown not showing**
- Verify user is actually logged in
- Check updateUserUI() is being called
- Ensure dropdown HTML is present in page
- Check z-index and positioning CSS

**Issue: Comment form not auto-filling**
- Verify custom events are being dispatched
- Check event listeners in CommentsHandler
- Ensure user data structure is correct
- Check browser console for errors

## Future Enhancements

### Planned Features

1. **Email Verification**
   - Send verification email on registration
   - Require verification before full access
   - Resend verification email option

2. **Password Reset**
   - Forgot password functionality
   - Email-based reset link
   - Secure token generation

3. **Profile Management**
   - Edit profile information
   - Change password
   - Upload custom avatar
   - Manage linked accounts

4. **Two-Factor Authentication**
   - SMS-based 2FA
   - Authenticator app support
   - Backup codes

5. **Social Features**
   - Link multiple social accounts
   - Share login across devices
   - Social profile import

6. **Account Security**
   - Login history
   - Active sessions management
   - Security alerts
   - Account deletion

## API Reference (Planned)

### Authentication Endpoints

```javascript
// Register new user
POST /api/auth/register
Body: { name, email, password }
Returns: { user, token }

// Login existing user
POST /api/auth/login
Body: { email, password }
Returns: { user, token }

// OAuth callback
GET /auth/{provider}/callback
Query: { code, state }
Returns: { user, token }

// Get current user
GET /api/auth/me
Headers: { Authorization: Bearer <token> }
Returns: { user }

// Logout user
POST /api/auth/logout
Headers: { Authorization: Bearer <token> }
Returns: { success }

// Refresh token
POST /api/auth/refresh
Body: { refreshToken }
Returns: { token }
```

## Support

For technical questions or issues with the authentication system:

- **Email**: tech@quyenhair.com
- **Documentation**: https://docs.quyenhair.vn/auth
- **GitHub Issues**: https://github.com/quyenhair/website/issues

## License

This authentication system is part of the Quyền Hair website and is proprietary software. All rights reserved.

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Author**: Quyền Hair Development Team
