# WEEV Platform Setup Guide

Complete API documentation and deployment guide for the WEEV brand community platform.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Authentication Flow](#authentication-flow)
5. [Deployment](#deployment)

---

## Environment Setup

### Required Secrets

Configure these secrets in your Mocha dashboard:

```bash
JWT_SECRET=<random-32-byte-base64-string>
JWT_REFRESH_SECRET=<random-32-byte-base64-string>
```

Generate secure secrets using:
```bash
openssl rand -base64 32
```

### Database Migrations

Migrations are automatically applied. The schema includes:

- **Users & Auth**: users, refresh_tokens, audit_logs
- **Brands**: brands, brand_members
- **Activations**: activations, wallet_cards, wallet_updates
- **Social**: posts, post_likes, comments, post_reports
- **Events**: events, event_rsvps
- **Analytics**: analytics_events

### Seed Data

To populate the database with sample data:

1. Open the Mocha SQL query interface
2. Copy contents from `seed-data.sql`
3. Execute the SQL

**Note**: The seed data uses a bcrypt hash for the password `Demo1234!` for all demo accounts.

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  city TEXT,
  role TEXT DEFAULT 'user',        -- user | brand_admin | superadmin
  status TEXT DEFAULT 'active',    -- active | suspended | deleted
  email_verified BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Brands Table
```sql
CREATE TABLE brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website_url TEXT,
  industry TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',   -- pending | verified | suspended
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Activations Table
```sql
CREATE TABLE activations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  brand_id TEXT NOT NULL,
  vin TEXT,
  license_plate TEXT,
  model TEXT,
  year INTEGER,
  verification_method TEXT NOT NULL,  -- vin | license_plate | qr_code
  status TEXT DEFAULT 'pending',      -- pending | verified | rejected
  verified_at TIMESTAMP,
  metadata TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints

### Authentication

#### POST `/api/auth/signup`
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "phone": "+598 99 123 456",
  "city": "Montevideo"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "refresh_...",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "status": "active"
  }
}
```

#### POST `/api/auth/login`
Authenticate a user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "refresh_...",
  "user": { ... }
}
```

#### POST `/api/auth/refresh`
Refresh an expired access token.

**Request:**
```json
{
  "refreshToken": "refresh_..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc..."
}
```

#### POST `/api/auth/logout`
Revoke refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
```

---

### User Management

#### GET `/api/users/me`
Get current user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "...",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+598 99 123 456",
  "city": "Montevideo",
  "role": "user",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### PATCH `/api/users/me`
Update user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "name": "Jane Doe",
  "phone": "+598 99 234 567",
  "city": "Punta del Este"
}
```

---

### Vehicle Activation

#### POST `/api/activations`
Activate a vehicle.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "brandId": "brand_id_here",
  "vin": "WDB123456789ABCDE",
  "model": "Omoda 5",
  "year": 2024,
  "verificationMethod": "vin"
}
```

**Response:**
```json
{
  "activation": { ... },
  "walletCard": {
    "id": "...",
    "member_id": "OMD-2024-001",
    "tier": "gold",
    "brand": { ... }
  }
}
```

#### GET `/api/activations`
Get user's activations.

**Headers:**
```
Authorization: Bearer <access_token>
```

---

### Wallet

#### GET `/api/wallet/card`
Get user's wallet card.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "card": {
    "id": "...",
    "member_id": "OMD-2024-001",
    "tier": "gold",
    "brand": {
      "name": "Omoda Jaecoo",
      "logo_url": "..."
    }
  }
}
```

#### GET `/api/wallet/updates`
Get wallet notifications.

**Query Params:**
- `limit` (default: 20)
- `offset` (default: 0)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "updates": [
    {
      "id": "...",
      "type": "benefit",
      "title": "New discount available",
      "description": "20% off maintenance",
      "action_url": "/wallet",
      "is_read": 0,
      "created_at": "..."
    }
  ],
  "hasMore": true
}
```

---

### Feed

#### GET `/api/feed`
Get social feed posts.

**Query Params:**
- `brandId` (optional)
- `limit` (default: 20)
- `offset` (default: 0)

**Response:**
```json
{
  "posts": [
    {
      "id": "...",
      "brand_name": "Omoda Jaecoo",
      "type": "announcement",
      "title": "Welcome!",
      "content": "...",
      "image_url": "...",
      "is_pinned": 1,
      "likes_count": 12,
      "comments_count": 3,
      "user_liked": 0,
      "created_at": "..."
    }
  ],
  "hasMore": true
}
```

#### POST `/api/feed/posts/:postId/like`
Toggle like on a post.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "liked": true
}
```

#### POST `/api/feed/posts/:postId/comments`
Add a comment.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "content": "Great post!"
}
```

#### GET `/api/feed/posts/:postId/comments`
Get post comments.

**Response:**
```json
{
  "comments": [
    {
      "id": "...",
      "user_name": "John Doe",
      "content": "Great post!",
      "created_at": "..."
    }
  ]
}
```

---

### Events

#### GET `/api/events`
Get events.

**Query Params:**
- `city` (optional)
- `type` (optional): event | service_clinic | test_drive | meetup
- `upcoming` (optional): true/false

**Response:**
```json
{
  "events": [
    {
      "id": "...",
      "brand_name": "Omoda Jaecoo",
      "type": "service_clinic",
      "title": "Service Clinic - Montevideo",
      "description": "...",
      "image_url": "...",
      "city": "Montevideo",
      "location_text": "Av. Italia 2050",
      "start_at": "2024-12-20T10:00:00Z",
      "end_at": "2024-12-20T13:00:00Z",
      "capacity": 50,
      "rsvp_count": 12,
      "user_rsvp_status": "going"
    }
  ]
}
```

#### POST `/api/events/:eventId/rsvp`
RSVP to an event.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "status": "going"  // going | interested | not_going
}
```

#### GET `/api/events/my-rsvps`
Get user's RSVPs.

**Headers:**
```
Authorization: Bearer <access_token>
```

---

### Brand Admin Endpoints

**Note:** Requires `brand_admin` or `brand_member` role.

#### GET `/api/brand/dashboard`
Get brand dashboard stats.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "stats": {
    "totalActivations": 150,
    "totalPosts": 24,
    "totalEvents": 8,
    "upcomingEvents": 3,
    "totalLikes": 456,
    "totalComments": 123
  }
}
```

#### GET `/api/brand/analytics`
Get analytics data.

**Query Params:**
- `days` (default: 30)

**Response:**
```json
{
  "eventsByType": {
    "page_view": 1234,
    "post_like": 456,
    "event_rsvp": 89
  },
  "eventsByDay": {
    "2024-12-01": 45,
    "2024-12-02": 67
  },
  "totalEvents": 1789
}
```

#### POST `/api/brand/posts`
Create a post.

**Request:**
```json
{
  "type": "announcement",
  "title": "New Update",
  "content": "Check out our latest features...",
  "imageUrl": "https://...",
  "isPinned": false
}
```

#### PATCH `/api/brand/posts/:id`
Update a post.

#### DELETE `/api/brand/posts/:id`
Delete a post.

#### POST `/api/brand/events`
Create an event.

**Request:**
```json
{
  "type": "service_clinic",
  "title": "Service Clinic",
  "description": "...",
  "city": "Montevideo",
  "locationText": "Av. Italia 2050",
  "startAt": "2024-12-20T10:00:00Z",
  "endAt": "2024-12-20T13:00:00Z",
  "capacity": 50
}
```

#### GET `/api/brand/activations`
Get brand activations.

**Response:**
```json
{
  "activations": [
    {
      "id": "...",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "model": "Omoda 5",
      "year": 2024,
      "status": "verified",
      "created_at": "..."
    }
  ]
}
```

---

### Super Admin Endpoints

**Note:** Requires `superadmin` role.

#### GET `/api/admin/stats`
Get system statistics.

**Response:**
```json
{
  "stats": {
    "totalUsers": 1234,
    "totalBrands": 5,
    "totalActivations": 567,
    "totalPosts": 89,
    "totalEvents": 23
  }
}
```

#### GET `/api/admin/users`
Get all users.

**Response:**
```json
{
  "users": [
    {
      "id": "...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "status": "active",
      "created_at": "..."
    }
  ]
}
```

#### POST `/api/admin/users`
Create a user.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "name": "New User",
  "role": "brand_admin"
}
```

#### PATCH `/api/admin/users/:id`
Update user role/status.

**Request:**
```json
{
  "role": "brand_admin",
  "status": "active"
}
```

#### GET `/api/admin/brands`
Get all brands.

#### POST `/api/admin/brands`
Create a brand.

**Request:**
```json
{
  "name": "New Brand",
  "slug": "new-brand",
  "websiteUrl": "https://newbrand.com",
  "logoUrl": "https://...",
  "industry": "automotive"
}
```

#### POST `/api/admin/brands/:brandId/members`
Add a brand member.

**Request:**
```json
{
  "userId": "user_id_here",
  "role": "brand_admin"
}
```

#### GET `/api/admin/audit-logs`
Get audit logs.

**Query Params:**
- `limit` (default: 50)
- `offset` (default: 0)

---

## Authentication Flow

### Token Lifecycle

1. **Login/Signup** → Receive access token (15min) + refresh token (7 days)
2. **API Requests** → Include access token in Authorization header
3. **Token Expired** → Use refresh token to get new access token
4. **Refresh Expired** → User must log in again

### Storage

- **Access Token**: `localStorage.accessToken`
- **Refresh Token**: `localStorage.refreshToken`

### Security

- Passwords hashed with bcrypt (cost factor 10)
- JWT tokens signed with HS256
- Refresh tokens hashed before storage
- All sensitive routes require authentication
- Role-based access control (RBAC)

---

## Deployment

### Pre-deployment Checklist

- [ ] Secrets configured (JWT_SECRET, JWT_REFRESH_SECRET)
- [ ] Database migrations applied
- [ ] Seed data loaded (optional, for demo)
- [ ] App tested in preview mode

### Publishing

Click "Publish" in the Mocha dashboard to deploy to production.

### Post-deployment

1. **Create Admin Account**: Use signup to create a user, then manually update role to `superadmin` in database
2. **Create Brand**: Use admin panel to create your brand
3. **Add Brand Members**: Assign users to brands as admins
4. **Test Features**: Verify activation, feed, events work correctly

### Monitoring

- Check Mocha logs for errors
- Monitor database query performance
- Review audit logs for security events

---

## User Roles

### User (default)
- View and interact with feed
- RSVP to events
- Activate vehicles
- Access wallet

### Brand Admin
- All user permissions
- Create/edit posts and events
- View brand analytics
- Manage activations
- Content moderation

### Super Admin
- All brand admin permissions
- Create and manage brands
- Manage all users
- View system analytics
- Access audit logs

---

## Common Workflows

### New User Onboarding
1. User signs up
2. User activates vehicle with VIN/license plate
3. Wallet card automatically created
4. User can access feed, events, and benefits

### Brand Content Creation
1. Brand admin logs in
2. Navigates to Brand dashboard
3. Creates post or event
4. Content appears in user feeds

### Event Management
1. Brand creates event
2. Users discover event in Events tab
3. Users RSVP
4. Brand views RSVP list in dashboard

---

## Troubleshooting

### "Unauthorized" errors
- Check access token is being sent
- Verify token hasn't expired
- Try refreshing with refresh token

### Brand dashboard shows "No brand access"
- User must be added to `brand_members` table
- Use admin panel to assign user to brand

### Database errors
- Check migration status
- Verify column types match schema
- Review SQL syntax (SQLite specific)

---

## API Best Practices

1. **Always handle errors**: All endpoints can return errors
2. **Use pagination**: Feed and events support limit/offset
3. **Cache when possible**: User profile, wallet card rarely change
4. **Refresh tokens proactively**: Refresh before expiry
5. **Log analytics events**: Track user behavior for insights

---

## Support & Contributing

For questions or issues:
- Review this documentation
- Check Mocha logs for errors
- Refer to code comments in source files

Built with ❤️ using Mocha, Hono, React, and Cloudflare D1.
