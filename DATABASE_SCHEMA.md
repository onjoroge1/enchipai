# Database Schema Documentation

## Overview

The Enchipai Mara Camp database uses PostgreSQL with Prisma ORM. This document describes all models, relationships, and enums.

---

## Models

### User

Represents system users (admins, staff, guests).

**Fields:**
- `id` (String, Primary Key): Unique identifier
- `name` (String): User's full name
- `email` (String, Unique): Email address
- `password` (String): Hashed password
- `role` (UserRole): User role (ADMIN, STAFF, GUEST)
- `emailVerified` (Boolean): Email verification status
- `phone` (String, Optional): Phone number
- `avatar` (String, Optional): Avatar URL
- `preferences` (JSON, Optional): User preferences
- `createdAt` (DateTime): Account creation date
- `updatedAt` (DateTime): Last update date

**Relations:**
- `bookings` (Booking[]): User's bookings
- `notifications` (Notification[]): User's notifications

**Indexes:**
- `email` (unique)

---

### Tent

Represents accommodation tents.

**Fields:**
- `id` (String, Primary Key)
- `name` (String): Tent name
- `slug` (String, Unique): URL-friendly identifier
- `description` (String, Optional): Tent description
- `image` (String, Optional): Main image URL
- `price` (Decimal): Base price per night
- `capacity` (Int): Maximum guests
- `amenities` (String[]): List of amenities
- `status` (TentStatus): Availability status
- `featured` (Boolean): Featured on homepage
- `displayOrder` (Int): Homepage display order
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- `bookings` (Booking[]): Tent bookings

**Indexes:**
- `slug` (unique)
- `featured`, `displayOrder` (for homepage queries)

---

### Booking

Represents guest bookings.

**Fields:**
- `id` (String, Primary Key)
- `bookingNumber` (String, Unique): Human-readable booking number
- `userId` (String, Foreign Key): User who made booking
- `tentId` (String, Foreign Key): Booked tent
- `checkIn` (DateTime): Check-in date
- `checkOut` (DateTime): Check-out date
- `guests` (Int): Number of guests
- `totalAmount` (Decimal): Total booking amount
- `status` (BookingStatus): Booking status
- `paymentStatus` (BookingPaymentStatus): Payment status
- `specialRequests` (String, Optional): Guest requests
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- `user` (User): Booking owner
- `tent` (Tent): Booked tent
- `guestInfo` (GuestInfo): Guest details
- `addOns` (AddOn[]): Booking add-ons
- `invoice` (Invoice, Optional): Associated invoice

**Indexes:**
- `bookingNumber` (unique)
- `userId`, `tentId` (foreign keys)
- `checkIn`, `checkOut` (for availability queries)
- `status` (for filtering)

---

### GuestInfo

Additional guest information for bookings.

**Fields:**
- `id` (String, Primary Key)
- `bookingId` (String, Foreign Key, Unique)
- `name` (String): Guest name
- `email` (String): Guest email
- `phone` (String, Optional): Phone number
- `nationality` (String, Optional)
- `passportNumber` (String, Optional)
- `dietaryRequirements` (String, Optional)
- `medicalConditions` (String, Optional)

**Relations:**
- `booking` (Booking): Associated booking

---

### AddOn

Additional services for bookings.

**Fields:**
- `id` (String, Primary Key)
- `bookingId` (String, Foreign Key)
- `name` (String): Add-on name
- `description` (String, Optional)
- `price` (Decimal): Add-on price
- `quantity` (Int): Quantity
- `total` (Decimal): Total price

**Relations:**
- `booking` (Booking): Associated booking

---

### Invoice

Invoices for bookings.

**Fields:**
- `id` (String, Primary Key)
- `invoiceNumber` (String, Unique): Invoice number
- `bookingId` (String, Foreign Key): Associated booking
- `userId` (String, Foreign Key): Invoice recipient
- `subtotal` (Decimal): Subtotal amount
- `tax` (Decimal): Tax amount
- `total` (Decimal): Total amount
- `status` (InvoiceStatus): Invoice status
- `dueDate` (DateTime, Optional): Payment due date
- `issuedAt` (DateTime): Invoice issue date
- `paidAt` (DateTime, Optional): Payment date
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- `booking` (Booking): Associated booking
- `user` (User): Invoice recipient
- `payments` (Payment[]): Invoice payments

**Indexes:**
- `invoiceNumber` (unique)
- `status`, `dueDate` (for filtering)

---

### Payment

Payment records.

**Fields:**
- `id` (String, Primary Key)
- `invoiceId` (String, Foreign Key): Associated invoice
- `amount` (Decimal): Payment amount
- `method` (PaymentMethod): Payment method
- `status` (TransactionPaymentStatus): Payment status
- `transactionId` (String, Optional): External transaction ID
- `processedAt` (DateTime, Optional): Processing date
- `notes` (String, Optional): Payment notes
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- `invoice` (Invoice): Associated invoice

**Indexes:**
- `invoiceId` (foreign key)
- `status` (for filtering)

---

### BlogPost

Blog posts.

**Fields:**
- `id` (String, Primary Key)
- `slug` (String, Unique): URL-friendly identifier
- `title` (String): Post title
- `excerpt` (String, Optional): Short excerpt
- `content` (String): Full content (HTML)
- `image` (String, Optional): Featured image
- `category` (String): Post category
- `date` (DateTime): Publication date
- `readTime` (String, Optional): Estimated read time
- `featured` (Boolean): Featured post
- `status` (BlogPostStatus): Post status
- `authorName` (String): Author name
- `authorRole` (String, Optional): Author role
- `authorAvatar` (String, Optional): Author avatar
- `tags` (String[]): Post tags
- `views` (Int): View count
- `publishedAt` (DateTime, Optional): Actual publication date
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Indexes:**
- `slug` (unique)
- `status`, `publishedAt` (for public queries)
- `featured` (for homepage)

---

### Experience

Guest experiences/activities.

**Fields:**
- `id` (String, Primary Key)
- `name` (String): Experience name
- `slug` (String, Unique): URL-friendly identifier
- `description` (String, Optional): Description
- `image` (String, Optional): Image URL
- `price` (Decimal): Experience price
- `duration` (String, Optional): Duration (e.g., "3 hours")
- `capacity` (Int, Optional): Maximum participants
- `available` (Boolean): Availability status
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- `bookings` (ExperienceBooking[]): Experience bookings

---

### ExperienceBooking

Bookings for experiences.

**Fields:**
- `id` (String, Primary Key)
- `experienceId` (String, Foreign Key)
- `bookingId` (String, Optional, Foreign Key): Link to tent booking
- `guestName` (String): Guest name
- `guestEmail` (String): Guest email
- `date` (DateTime): Experience date
- `participants` (Int): Number of participants
- `totalAmount` (Decimal): Total amount
- `status` (BookingStatus): Booking status
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- `experience` (Experience): Associated experience

---

### InventoryItem

Inventory items.

**Fields:**
- `id` (String, Primary Key)
- `name` (String): Item name
- `category` (String): Item category
- `description` (String, Optional): Description
- `quantity` (Int): Current stock
- `minStock` (Int): Minimum stock level
- `unit` (String, Optional): Unit of measurement
- `cost` (Decimal, Optional): Unit cost
- `supplier` (String, Optional): Supplier name
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Indexes:**
- `category` (for filtering)

---

### Invoice

(Already described above)

---

### Payment

(Already described above)

---

### Season

Season-based pricing.

**Fields:**
- `id` (String, Primary Key)
- `name` (String): Season name
- `description` (String, Optional): Description
- `startDate` (DateTime): Season start
- `endDate` (DateTime): Season end
- `type` (SeasonType): Season type
- `multiplier` (Decimal): Price multiplier
- `active` (Boolean): Active status
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Indexes:**
- `startDate`, `endDate` (for date range queries)
- `active` (for filtering)

---

### SpecialDate

Special date pricing (holidays, events).

**Fields:**
- `id` (String, Primary Key)
- `name` (String): Event name
- `startDate` (DateTime): Start date
- `endDate` (DateTime): End date
- `multiplier` (Decimal): Price multiplier
- `active` (Boolean): Active status
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

---

### WildlifeSighting

Wildlife sightings log.

**Fields:**
- `id` (String, Primary Key)
- `species` (String): Animal species
- `location` (String, Optional): Sighting location
- `description` (String, Optional): Description
- `image` (String, Optional): Image URL
- `date` (DateTime): Sighting date
- `guideName` (String, Optional): Guide name
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

---

### Transfer

Guest transfers.

**Fields:**
- `id` (String, Primary Key)
- `type` (TransferType): Transfer type
- `from` (String): Origin location
- `to` (String): Destination location
- `date` (DateTime): Transfer date
- `time` (String, Optional): Transfer time
- `vehicle` (String, Optional): Vehicle identifier
- `driver` (String, Optional): Driver name
- `guests` (String, Optional): Guest names
- `status` (TransferStatus): Transfer status
- `notes` (String, Optional): Additional notes
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

---

### Notification

User notifications.

**Fields:**
- `id` (String, Primary Key)
- `userId` (String, Optional, Foreign Key): Target user (null for broadcast)
- `type` (NotificationType): Notification type
- `title` (String): Notification title
- `message` (String): Notification message
- `read` (Boolean): Read status
- `link` (String, Optional): Related link
- `createdAt` (DateTime)

**Relations:**
- `user` (User, Optional): Target user

**Indexes:**
- `userId`, `read` (for user queries)

---

### Setting

System settings (key-value store).

**Fields:**
- `id` (String, Primary Key)
- `key` (String, Unique): Setting key
- `value` (String): Setting value (JSON string)
- `category` (String, Optional): Setting category
- `updatedAt` (DateTime)

**Indexes:**
- `key` (unique)
- `category` (for filtering)

---

### EmailTemplate

Email templates.

**Fields:**
- `id` (String, Primary Key)
- `name` (String): Template name
- `subject` (String): Email subject
- `html` (String): HTML content
- `variables` (String[]): Available variables
- `category` (String, Optional): Template category
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

---

### EmailCampaign

Email campaigns.

**Fields:**
- `id` (String, Primary Key)
- `name` (String): Campaign name
- `subject` (String): Email subject
- `html` (String): HTML content
- `recipientType` (String): Recipient type
- `recipientFilter` (JSON, Optional): Filter criteria
- `status` (EmailCampaignStatus): Campaign status
- `scheduledAt` (DateTime, Optional): Scheduled send time
- `sentAt` (DateTime, Optional): Actual send time
- `totalRecipients` (Int): Total recipients
- `sentCount` (Int): Successfully sent count
- `openedCount` (Int): Opened count
- `clickedCount` (Int): Clicked count
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

**Relations:**
- `logs` (EmailLog[]): Email logs

---

### EmailLog

Email sending logs.

**Fields:**
- `id` (String, Primary Key)
- `to` (String): Recipient email
- `subject` (String): Email subject
- `templateId` (String, Optional): Template used
- `campaignId` (String, Optional, Foreign Key): Campaign
- `status` (EmailStatus): Email status
- `openedAt` (DateTime, Optional): Opened timestamp
- `clickedAt` (DateTime, Optional): Clicked timestamp
- `error` (String, Optional): Error message
- `createdAt` (DateTime)

**Relations:**
- `campaign` (EmailCampaign, Optional): Associated campaign

**Indexes:**
- `to`, `templateId`, `campaignId`, `status` (for queries)

---

### Channel

OTA channel integrations.

**Fields:**
- `id` (String, Primary Key)
- `name` (String): Channel name
- `type` (String): Channel type
- `apiKey` (String, Optional): API key
- `apiSecret` (String, Optional): API secret
- `webhookUrl` (String, Optional): Webhook URL
- `syncEnabled` (Boolean): Sync enabled
- `settings` (JSON, Optional): Channel settings
- `lastSyncAt` (DateTime, Optional): Last sync time
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

---

## Enums

### UserRole
- `ADMIN`: Full system access
- `STAFF`: Limited admin access
- `GUEST`: Guest user

### BookingStatus
- `PENDING`: Awaiting confirmation
- `CONFIRMED`: Confirmed booking
- `CANCELLED`: Cancelled booking
- `CHECKED_IN`: Guest checked in
- `CHECKED_OUT`: Guest checked out

### BookingPaymentStatus
- `PENDING`: Payment pending
- `PARTIAL`: Partial payment
- `PAID`: Fully paid
- `REFUNDED`: Refunded

### TransactionPaymentStatus
- `PENDING`: Payment pending
- `PROCESSING`: Processing
- `COMPLETED`: Completed
- `FAILED`: Failed
- `REFUNDED`: Refunded

### TentStatus
- `AVAILABLE`: Available for booking
- `OCCUPIED`: Currently occupied
- `MAINTENANCE`: Under maintenance
- `UNAVAILABLE`: Not available

### InvoiceStatus
- `DRAFT`: Draft invoice
- `SENT`: Sent to customer
- `PAID`: Paid
- `OVERDUE`: Overdue
- `CANCELLED`: Cancelled

### PaymentMethod
- `CARD`: Credit/debit card
- `BANK_TRANSFER`: Bank transfer
- `CASH`: Cash payment
- `MOBILE_MONEY`: Mobile money
- `OTHER`: Other method

### BlogPostStatus
- `DRAFT`: Draft post
- `PUBLISHED`: Published
- `SCHEDULED`: Scheduled for publication
- `ARCHIVED`: Archived

### SeasonType
- `HIGH`: High season
- `MID`: Mid season
- `LOW`: Low season
- `PREMIUM`: Premium pricing

### TransferType
- `AIRPORT_PICKUP`: Airport pickup
- `AIRPORT_DROPOFF`: Airport dropoff
- `GAME_DRIVE`: Game drive
- `EXCURSION`: Excursion
- `OTHER`: Other transfer

### TransferStatus
- `SCHEDULED`: Scheduled
- `IN_PROGRESS`: In progress
- `COMPLETED`: Completed
- `CANCELLED`: Cancelled

### NotificationType
- `BOOKING`: Booking-related
- `PAYMENT`: Payment-related
- `SYSTEM`: System notification
- `REMINDER`: Reminder
- `ALERT`: Alert

### EmailCampaignStatus
- `DRAFT`: Draft campaign
- `SCHEDULED`: Scheduled
- `SENDING`: Currently sending
- `SENT`: Sent
- `CANCELLED`: Cancelled

### EmailStatus
- `PENDING`: Pending send
- `SENT`: Sent
- `DELIVERED`: Delivered
- `OPENED`: Opened
- `CLICKED`: Clicked
- `BOUNCED`: Bounced
- `FAILED`: Failed

---

## Relationships

### User → Bookings (One-to-Many)
A user can have multiple bookings.

### Tent → Bookings (One-to-Many)
A tent can have multiple bookings.

### Booking → GuestInfo (One-to-One)
Each booking has one guest info record.

### Booking → AddOns (One-to-Many)
A booking can have multiple add-ons.

### Booking → Invoice (One-to-One, Optional)
A booking can have one invoice.

### Invoice → Payments (One-to-Many)
An invoice can have multiple payments.

### User → Notifications (One-to-Many)
A user can have multiple notifications.

### Experience → ExperienceBookings (One-to-Many)
An experience can have multiple bookings.

### EmailCampaign → EmailLogs (One-to-Many)
A campaign can have multiple email logs.

---

## Indexes

Key indexes for performance:

1. **User.email** - Unique index for login
2. **Tent.slug** - Unique index for URLs
3. **Booking.bookingNumber** - Unique index
4. **Booking.checkIn, checkOut** - For availability queries
5. **Invoice.invoiceNumber** - Unique index
6. **BlogPost.slug** - Unique index for URLs
7. **BlogPost.status, publishedAt** - For public queries
8. **Season.startDate, endDate** - For date range queries
9. **EmailLog.campaignId, status** - For analytics

---

## Data Integrity

### Foreign Key Constraints
- All foreign keys have `onDelete` and `onUpdate` cascade rules
- Deletion of a user cascades to bookings and notifications
- Deletion of a booking cascades to guest info and add-ons

### Unique Constraints
- Email addresses are unique
- Slugs are unique within their model
- Booking numbers are unique
- Invoice numbers are unique

---

## Migration Strategy

The database uses Prisma migrations:

```bash
# Create a migration
npm run db:migrate

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

---

## Seed Data

Seed script creates:
- Admin user: `admin@enchipai.com` / `admin123`
- Guest user: `guest@example.com` / `guest123`
- Sample tents
- Sample blog posts

Run seed: `npm run db:seed`

