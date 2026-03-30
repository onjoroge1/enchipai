# Admin Tents Page Analysis

**Page URL:** `/admin/tents`  
**Analysis Date:** Current  
**Status:** Partially Functional

---

## Overview

The admin tents page consists of 4 main components:
1. **TentsList** - Grid view of all tents with CRUD operations
2. **TentDisplayControl** - Manage featured status and display order
3. **TentCalendar** - Availability calendar view
4. **SeasonRatesManaged** - Season-based pricing management

---

## Component Analysis

### 1. TentsList Component ✅ Mostly Functional

**Status:** Working with minor issues

**What's Working:**
- ✅ Fetches tents from `/api/admin/tents`
- ✅ Displays tents in grid layout with images
- ✅ Shows status badges (AVAILABLE, OCCUPIED, MAINTENANCE, UNAVAILABLE)
- ✅ "Add Tent" button opens create dialog
- ✅ "Edit Tent" menu item opens edit dialog
- ✅ "Delete Tent" menu item deletes tent (with confirmation)
- ✅ Displays current bookings for each tent
- ✅ Shows price and guest capacity

**Issues Found:**

#### Priority 1: Critical
1. **"View Details" menu item not functional** (Line 189-192)
   - Menu item exists but has no `onClick` handler
   - Should open a details dialog showing:
     - Full tent information
     - All bookings (past and future)
     - Images gallery
     - Amenities list
     - Booking history

2. **Field name mismatch** (Line 26, 175)
   - Component interface uses `maxGuests` but API returns `guests` (schema field name)
   - Line 175 displays `tent.maxGuests` which will be undefined
   - Should map `guests` to `maxGuests` in the component or update interface

#### Priority 2: Important
3. **Missing tent images support**
   - Only shows single `image` field
   - Schema supports `TentImage[]` relation but not displayed/editable
   - Should show image gallery in details view

4. **No search/filter functionality**
   - Cannot filter by status, featured, or search by name
   - Should add search bar and status filters

5. **No export functionality**
   - Cannot export tent list to CSV
   - Should match functionality of bookings/guests pages

---

### 2. TentFormDialog Component ⚠️ Missing Fields

**Status:** Functional but incomplete

**What's Working:**
- ✅ Create new tent
- ✅ Edit existing tent
- ✅ All basic fields (name, slug, description, price, size, bed, guests, amenities, status, image, featured, displayOrder)

**Issues Found:**

#### Priority 1: Critical
1. **Missing `tagline` field** (Schema has it, form doesn't)
   - Schema includes `tagline: String?` but form doesn't have input for it
   - Should add tagline field between name and description

2. **Field name mismatch** (Line 22, 64, 103)
   - Form uses `beds` but schema/API expects `bed`
   - Form uses `maxGuests` but schema/API expects `guests`
   - This causes data inconsistency

#### Priority 2: Important
3. **No image gallery management**
   - Only single image URL
   - Should allow adding/removing/reordering multiple images
   - Should use `TentImage` relation

4. **No validation feedback**
   - Doesn't show specific field errors
   - Should display Zod validation errors per field

---

### 3. TentCalendar Component ❌ Static/Mock Data

**Status:** Not functional - uses hardcoded data

**What's Working:**
- ✅ UI layout and styling
- ✅ Calendar grid display

**Issues Found:**

#### Priority 1: Critical
1. **Hardcoded tent names** (Line 8)
   - Uses static array: `["Savannah Suite", "Escarpment View", ...]`
   - Should fetch real tents from API

2. **Hardcoded booking data** (Line 13-19)
   - Uses mock `bookings` object
   - Should fetch real bookings from `/api/admin/bookings` with date filtering

3. **Month navigation not functional** (Line 43-49)
   - Previous/Next buttons don't change the displayed month
   - Should implement month navigation with state management

4. **Fixed date range** (Line 10, 46)
   - Always shows February 2026, 28 days
   - Should show current month with proper day count (28-31 days)
   - Should handle year transitions

#### Priority 2: Important
5. **No date range selection**
   - Cannot select custom date ranges
   - Should allow selecting start/end dates for calendar view

6. **No booking details on hover/click**
   - Cannot see booking details when clicking on booked dates
   - Should show booking details dialog

---

### 4. TentDisplayControl Component ✅ Fully Functional

**Status:** Working correctly

**What's Working:**
- ✅ Fetches tents from API
- ✅ Toggle featured status
- ✅ Reorder tents with up/down arrows
- ✅ Save display order
- ✅ Shows success/error messages

**No Issues Found**

---

### 5. SeasonRatesManaged Component ✅ Functional

**Status:** Working (assumed based on previous implementation)

**What's Working:**
- ✅ Manages season-based pricing
- ✅ Manages special dates pricing
- ✅ Full CRUD operations

**Note:** This component was implemented in Phase 6 and should be functional.

---

## API Route Issues

### `/api/admin/tents/[id]/route.ts`

#### Priority 1: Critical
1. **Next.js 16 params issue** (Line 24, 63, 105)
   - Uses `{ params }: { params: { id: string } }`
   - Should be `{ params }: { params: Promise<{ id: string }> }`
   - Must await params: `const { id } = await params;`
   - Same issue as we fixed in guests/bookings routes

---

## Missing Features

### High Priority
1. **Tent Details Dialog**
   - View all tent information
   - View all bookings (past, current, future)
   - View image gallery
   - View booking statistics

2. **Image Gallery Management**
   - Add/remove/reorder tent images
   - Upload images (if upload endpoint exists)
   - Set primary image

3. **Search and Filter**
   - Search by tent name
   - Filter by status
   - Filter by featured status

4. **Export Functionality**
   - Export tent list to CSV
   - Include all tent details

### Medium Priority
5. **Bulk Operations**
   - Bulk status update
   - Bulk featured toggle
   - Bulk delete (with safety checks)

6. **Advanced Calendar Features**
   - Month/year navigation
   - Date range selection
   - Booking details on click
   - Maintenance scheduling

7. **Tent Statistics**
   - Occupancy rate
   - Revenue per tent
   - Average booking duration
   - Most popular tent

---

## Data Flow Issues

1. **TentsList Interface vs API Response**
   - Interface expects `maxGuests` but API returns `guests`
   - Interface expects `beds` but API returns `bed` (in form)
   - Need to align field names

2. **TentCalendar Data Source**
   - Currently uses mock data
   - Should fetch from:
     - `/api/admin/tents` for tent list
     - `/api/admin/bookings` for booking data with date filters

---

## Summary

### ✅ Fully Functional Components
- TentDisplayControl
- SeasonRatesManaged

### ⚠️ Partially Functional Components
- TentsList (missing "View Details" functionality)
- TentFormDialog (missing `tagline` field, field name mismatches)

### ❌ Non-Functional Components
- TentCalendar (completely static, needs full rewrite)

### 🔧 API Issues
- `/api/admin/tents/[id]` needs Next.js 16 params fix

---

## Recommended Implementation Order

1. **Fix API route params** (Quick fix)
2. **Implement Tent Details Dialog** (High value)
3. **Fix TentCalendar to use real data** (High value)
4. **Add missing `tagline` field to form** (Quick fix)
5. **Fix field name mismatches** (Quick fix)
6. **Add search/filter to TentsList** (Medium value)
7. **Add export functionality** (Medium value)
8. **Implement image gallery management** (Medium value)

---

## Test Checklist

- [ ] Create new tent
- [ ] Edit existing tent
- [ ] Delete tent (with active bookings should fail)
- [ ] View tent details
- [ ] Toggle featured status
- [ ] Reorder tents
- [ ] Calendar shows real bookings
- [ ] Calendar month navigation works
- [ ] Search/filter tents
- [ ] Export tent list

