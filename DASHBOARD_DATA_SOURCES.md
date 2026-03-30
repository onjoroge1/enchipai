# Dashboard Data Sources - Database Verification

## ✅ Confirmation: All Dashboard Items Come From Database

**Yes, absolutely!** Once you have guests (users) and bookings in the database, **ALL** dashboard components will automatically display that real data.

---

## Data Flow Breakdown

### 1. StatsCards Component

**API Endpoint**: `/api/admin/analytics?period=month`

**Database Queries**:
```typescript
// Queries these tables:
- prisma.booking.findMany()     // Gets all bookings
- prisma.payment.findMany()      // Gets all payments
- prisma.invoice.findMany()      // Gets all invoices
- prisma.tent.count()            // Gets tent count
```

**What It Shows** (from database):
- **Total Bookings**: Count from `bookings` table
- **Active Guests**: Count of `CHECKED_IN` bookings from `bookings` table
- **Revenue (MTD)**: Sum from `payments` table (status = COMPLETED)
- **Occupancy Rate**: Calculated from `bookings` and `tents` tables

**When Data Appears**: ✅ As soon as bookings exist in database

---

### 2. RevenueChart Component

**API Endpoint**: `/api/admin/analytics?period=${period}`

**Database Queries**:
```typescript
// Queries these tables:
- prisma.booking.findMany()     // Gets bookings with date range
- prisma.payment.findMany()     // Gets payments with date range
- prisma.invoice.findMany()     // Gets invoices with date range
```

**What It Shows** (from database):
- **Revenue Over Time**: From `payments` table
- **Bookings Over Time**: From `bookings` table
- **Occupancy Over Time**: Calculated from `bookings` and `tents` tables

**When Data Appears**: ✅ As soon as bookings/payments exist in database

---

### 3. AvailabilityCalendar Component

**API Endpoints**:
- `/api/admin/tents` (gets all tents)
- `/api/admin/bookings?startDate&endDate` (gets bookings for month)

**Database Queries**:
```typescript
// Queries these tables:
- prisma.tent.findMany()        // Gets all tents
- prisma.booking.findMany()     // Gets bookings for selected month
```

**What It Shows** (from database):
- **Tent List**: From `tents` table
- **Availability**: Calculated from `bookings` table
  - Green = No booking conflicts
  - Red = Booking exists (not cancelled/checked-out)

**When Data Appears**: ✅ As soon as tents exist (shows available), bookings show as red

---

### 4. RecentBookings Component

**API Endpoint**: `/api/admin/bookings?limit=5`

**Database Queries**:
```typescript
// Queries these tables:
- prisma.booking.findMany()     // Gets 5 most recent bookings
  - Includes: user, tent, guestInfo, addOns, invoice
```

**What It Shows** (from database):
- **Booking Number**: From `bookings` table
- **Guest Name/Email**: From `users` table (via booking.user relation)
- **Tent Name**: From `tents` table (via booking.tent relation)
- **Dates**: From `bookings.checkIn` and `bookings.checkOut`
- **Amount**: From `bookings.totalAmount`
- **Status**: From `bookings.status`

**When Data Appears**: ✅ As soon as bookings exist in database

---

## Database Tables Used

### Primary Tables:
1. **`bookings`** - All booking records
2. **`users`** - Guest/user accounts (linked to bookings)
3. **`tents`** - Tent/accommodation data
4. **`payments`** - Payment transactions
5. **`invoices`** - Invoice records

### Related Tables:
- `guestInfo` - Guest details per booking
- `addOns` - Booking add-ons
- `invoice` - Linked to bookings

---

## What Happens When You Add Data

### Scenario 1: Add a Guest (User)
1. User registers → Creates record in `users` table
2. Dashboard **doesn't show** until they make a booking
3. Once booking is created → Appears in RecentBookings ✅

### Scenario 2: Add a Booking
1. Booking created → Record in `bookings` table
2. **Immediately appears in**:
   - ✅ RecentBookings (if in top 5)
   - ✅ StatsCards (Total Bookings count increases)
   - ✅ RevenueChart (if payment exists)
   - ✅ AvailabilityCalendar (tent shows as booked/red)

### Scenario 3: Add a Payment
1. Payment recorded → Record in `payments` table
2. **Immediately appears in**:
   - ✅ StatsCards (Revenue increases)
   - ✅ RevenueChart (revenue line updates)

### Scenario 4: Add a Tent
1. Tent created → Record in `tents` table
2. **Immediately appears in**:
   - ✅ AvailabilityCalendar (shows as new row)

---

## Current State (Empty Database)

If your database is empty:
- **StatsCards**: Shows `0` for all metrics ✅ (correct - no data)
- **RevenueChart**: Shows "No data available" ✅ (correct - no data)
- **AvailabilityCalendar**: Shows tents if they exist, all green if no bookings ✅ (correct)
- **RecentBookings**: Shows "No bookings found" ✅ (correct - no data)

**This is expected behavior!** All components are working correctly and will populate as soon as data exists.

---

## Verification Checklist

✅ **StatsCards**: Queries `bookings`, `payments`, `invoices`, `tents` tables  
✅ **RevenueChart**: Queries `bookings`, `payments`, `invoices` tables  
✅ **AvailabilityCalendar**: Queries `tents` and `bookings` tables  
✅ **RecentBookings**: Queries `bookings` table with relations  

**All components**: ✅ Connected to database  
**All components**: ✅ Will show data when it exists  
**No static data**: ✅ Confirmed  

---

## Summary

**YES - All dashboard items come from the database!**

Once you have:
- ✅ Guests (users) in the database
- ✅ Bookings in the database
- ✅ Payments in the database (optional, for revenue)

**Everything will automatically populate and display real data.**

The dashboard is **100% database-driven** - no hardcoded values, no static data. Everything is live and real-time from your database.

