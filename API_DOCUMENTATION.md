# Enchipai Mara Camp - API Documentation

## Base URL
```
Development: http://localhost:3000
Production: https://enchipai.com
```

## Authentication

Most API endpoints require authentication. Include the session cookie in requests, or use the `Authorization` header for API tokens.

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user-123",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "GUEST"
  }
}
```

#### POST /api/auth/signin
Sign in to an existing account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST /api/auth/signout
Sign out from the current session.

---

## Public APIs

### Tents

#### GET /api/tents
Get list of tents.

**Query Parameters:**
- `featured` (boolean): Filter featured tents
- `slug` (string): Get specific tent by slug
- `limit` (number): Limit results (default: 50)
- `offset` (number): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "tent-123",
      "name": "Savannah Suite",
      "slug": "savannah-suite",
      "description": "...",
      "price": 650,
      "capacity": 2,
      "image": "/images/tent.jpg",
      "featured": true
    }
  ]
}
```

#### GET /api/tents/availability
Check tent availability for dates.

**Query Parameters:**
- `tentId` (string, required)
- `checkIn` (string, ISO date, required)
- `checkOut` (string, ISO date, required)

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "conflicts": []
  }
}
```

### Blog

#### GET /api/blog
Get published blog posts.

**Query Parameters:**
- `slug` (string): Get specific post by slug
- `featured` (boolean): Filter featured posts
- `category` (string): Filter by category
- `limit` (number): Limit results
- `offset` (number): Pagination offset

---

## User APIs (Requires Authentication)

### Bookings

#### GET /api/bookings
Get user's bookings.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "booking-123",
      "bookingNumber": "BK-001",
      "tent": {
        "name": "Savannah Suite",
        "image": "/images/tent.jpg"
      },
      "checkIn": "2026-02-01T00:00:00Z",
      "checkOut": "2026-02-05T00:00:00Z",
      "totalAmount": 2600,
      "status": "CONFIRMED"
    }
  ]
}
```

#### POST /api/bookings
Create a new booking.

**Request Body:**
```json
{
  "tentId": "tent-123",
  "checkIn": "2026-02-01",
  "checkOut": "2026-02-05",
  "guests": 2,
  "guestInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "addOns": []
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "booking-123",
    "bookingNumber": "BK-001",
    "totalAmount": 2600,
    "status": "PENDING"
  }
}
```

### Profile

#### GET /api/user/profile
Get user profile.

#### PATCH /api/user/profile
Update user profile.

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "preferences": {
    "newsletter": true
  }
}
```

---

## Admin APIs (Requires Admin Role)

### Tents Management

#### GET /api/admin/tents
Get all tents (admin).

**Query Parameters:**
- `search` (string): Search tents
- `status` (string): Filter by status
- `limit` (number): Limit results
- `offset` (number): Pagination offset

#### POST /api/admin/tents
Create a new tent.

**Request Body:**
```json
{
  "name": "New Tent",
  "slug": "new-tent",
  "description": "Tent description",
  "price": 500,
  "capacity": 2,
  "amenities": ["WiFi", "AC"],
  "status": "AVAILABLE",
  "featured": false
}
```

#### PATCH /api/admin/tents/[id]
Update a tent.

#### DELETE /api/admin/tents/[id]
Delete a tent.

### Bookings Management

#### GET /api/admin/bookings
Get all bookings (admin).

**Query Parameters:**
- `status` (string): Filter by status
- `search` (string): Search bookings
- `limit` (number): Limit results
- `offset` (number): Pagination offset

#### PATCH /api/admin/bookings/[id]
Update booking status.

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

### Blog Management

#### GET /api/admin/blog
Get all blog posts (admin).

#### POST /api/admin/blog
Create a blog post.

**Request Body:**
```json
{
  "title": "New Post",
  "slug": "new-post",
  "content": "<p>Content here</p>",
  "excerpt": "Short excerpt",
  "category": "News",
  "status": "DRAFT",
  "featured": false
}
```

#### PATCH /api/admin/blog/[id]
Update a blog post.

#### DELETE /api/admin/blog/[id]
Delete a blog post.

### Financial Management

#### GET /api/admin/invoices
Get all invoices.

#### POST /api/admin/invoices
Generate an invoice.

**Request Body:**
```json
{
  "bookingId": "booking-123",
  "taxRate": 0.16
}
```

#### GET /api/admin/payments
Get all payments.

#### POST /api/admin/payments
Record a payment.

**Request Body:**
```json
{
  "invoiceId": "invoice-123",
  "amount": 1000,
  "method": "CARD",
  "status": "COMPLETED"
}
```

### Analytics

#### GET /api/admin/analytics
Get analytics data.

**Query Parameters:**
- `period` (string): day, week, month, year
- `startDate` (string, ISO date)
- `endDate` (string, ISO date)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalBookings": 150,
      "totalRevenue": 125000,
      "occupancyRate": 87.5,
      "avgBookingValue": 833.33
    },
    "timeSeries": [
      {
        "date": "2026-01",
        "revenue": 15000,
        "bookings": 12,
        "occupancy": 85
      }
    ]
  }
}
```

### Settings

#### GET /api/admin/settings
Get settings.

**Query Parameters:**
- `category` (string): Filter by category

#### PATCH /api/admin/settings
Update settings.

**Request Body:**
```json
{
  "category": "general",
  "settings": {
    "campName": "Enchipai Mara Camp",
    "contactEmail": "reservations@enchipai.com"
  }
}
```

### Season Pricing

#### GET /api/admin/seasons
Get all seasons.

#### POST /api/admin/seasons
Create a season.

**Request Body:**
```json
{
  "name": "Peak Season",
  "startDate": "2026-07-01T00:00:00Z",
  "endDate": "2026-10-31T00:00:00Z",
  "type": "HIGH",
  "multiplier": 1.5,
  "active": true
}
```

### Email Management

#### GET /api/admin/email/templates
Get email templates.

#### POST /api/admin/email/templates
Create email template.

#### GET /api/admin/email/campaigns
Get email campaigns.

#### POST /api/admin/email/campaigns
Create email campaign.

#### POST /api/admin/email/campaigns/[id]
Send campaign emails.

### Notifications

#### GET /api/notifications
Get user notifications.

#### PATCH /api/notifications/[id]
Mark notification as read.

#### GET /api/admin/notifications
Get all notifications (admin).

#### POST /api/admin/notifications
Create notification.

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "path": "email",
      "message": "Invalid email address"
    }
  ]
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Rate Limiting

Some endpoints have rate limiting:
- **Auth endpoints**: 5 requests per 15 minutes
- **General API**: 60 requests per minute
- **Sensitive endpoints**: 10 requests per minute

Rate limit headers:
- `X-RateLimit-Limit`: Maximum requests
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time
- `Retry-After`: Seconds until retry

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `limit` (number): Results per page (default: 50)
- `offset` (number): Skip N results (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

---

## File Upload

#### POST /api/upload
Upload files (admin only).

**Request:**
- Content-Type: `multipart/form-data`
- Field: `files` (File[])

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "originalName": "image.jpg",
        "secureName": "1234567890-abc123.jpg",
        "size": 102400,
        "type": "image/jpeg",
        "url": "/uploads/1234567890-abc123.jpg"
      }
    ],
    "count": 1
  }
}
```

**Validation:**
- Max file size: 10MB
- Allowed types: image/jpeg, image/png, image/webp, image/gif
- Max files: 5

---

## Webhooks

### Payment Webhooks

#### POST /api/webhooks/stripe
Handle Stripe webhook events.

**Headers:**
- `stripe-signature`: Stripe signature for verification

---

## Changelog

### Version 1.0.0 (2026-01)
- Initial API release
- All core endpoints implemented
- Authentication and authorization
- Admin management features
- Financial management
- Analytics and reporting

