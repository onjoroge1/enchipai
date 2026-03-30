# Admin Bookings Page - Issues & Fixes Required

## Page: `/admin/bookings`

## Current Status: ⚠️ 30% Functional (Display Only)

---

## ❌ Critical Issues

### 1. "New Booking" Button Not Responsive
**Location**: `app/admin/bookings/page.tsx:26-29`

**Current Code**:
```tsx
<Button size="sm">
  <Plus className="w-4 h-4 mr-2" />
  New Booking
</Button>
```

**Problem**: No `onClick` handler - button does nothing

**Fix Required**:
- Add state for dialog open/close
- Create `BookingCreateDialog` component
- Wire button to open dialog
- Dialog should allow admin to create booking for any guest

---

### 2. Filter Button Not Functional
**Location**: `app/admin/bookings/page.tsx:18-21`

**Current Code**:
```tsx
<Button variant="outline" size="sm">
  <Filter className="w-4 h-4 mr-2" />
  Filter
</Button>
```

**Problem**: No filter functionality

**Fix Required**:
- Add filter state (status, date range, tent)
- Create filter dropdown/menu
- Pass filters to API as query params
- Update bookings list when filters change

---

### 3. Export Button Not Functional
**Location**: `app/admin/bookings/page.tsx:22-25`

**Current Code**:
```tsx
<Button variant="outline" size="sm">
  <Download className="w-4 h-4 mr-2" />
  Export
</Button>
```

**Problem**: No export functionality

**Fix Required**:
- Create export function to convert bookings to CSV
- Trigger download on button click
- Include all booking fields in export

---

### 4. Search Input Not Functional
**Location**: `app/admin/bookings/page.tsx:43-48`

**Current Code**:
```tsx
<Input
  placeholder="Search bookings..."
  className="pl-9 w-64"
/>
```

**Problem**: No search functionality

**Fix Required**:
- Add search state
- Add `onChange` handler
- Add search query param to API call
- Update API to support search by guest name, email, booking number

---

### 5. Action Menu Items Not Functional
**Location**: `components/admin/bookings-table.tsx:195-207`

**Current Code**:
```tsx
<DropdownMenuItem>View Details</DropdownMenuItem>
<DropdownMenuItem>Edit Booking</DropdownMenuItem>
<DropdownMenuItem>Cancel Booking</DropdownMenuItem>
```

**Problem**: No onClick handlers

**Fix Required**:
- **View Details**: Create `BookingDetailsDialog` component
- **Edit Booking**: Create `BookingEditDialog` component  
- **Cancel Booking**: Call PATCH API to update status to CANCELLED

---

## ⚠️ Additional Issues

### 6. BookingsTable Component Issues
**Location**: `components/admin/bookings-table.tsx`

**Problems**:
- Has duplicate "New Booking" button (line 112-114)
- Wrapped in Card (redundant - page already has Card)
- Title says "Recent Bookings" (should be "All Bookings")
- No pagination
- No sorting

**Fix Required**:
- Remove duplicate button
- Remove Card wrapper (use table directly)
- Fix title
- Add pagination component
- Add sorting functionality

---

## ✅ What Works

1. **Data Fetching**: ✅
   - Fetches from `/api/admin/bookings`
   - Displays in table
   - Loading/error/empty states

2. **Table Display**: ✅
   - Shows all booking fields
   - Responsive design
   - Status badges

3. **API Endpoints**: ✅
   - `GET /api/admin/bookings` - Working
   - `GET /api/admin/bookings/[id]` - Working
   - `PATCH /api/admin/bookings/[id]` - Working

---

## Required Components to Create

### 1. BookingCreateDialog
**Purpose**: Admin form to create new bookings

**Fields Needed**:
- Guest selection (dropdown from `/api/admin/guests`)
- Tent selection (dropdown from `/api/admin/tents`)
- Check-in date
- Check-out date
- Adults count
- Children count
- Add-ons (optional)
- Special requests (optional)

**API**: `POST /api/bookings` (or create admin endpoint)

---

### 2. BookingDetailsDialog
**Purpose**: View full booking information

**Display**:
- Booking number
- Guest information
- Tent details
- Dates
- Guest count
- Add-ons
- Total amount
- Status
- Payment information
- Invoice link

**API**: `GET /api/admin/bookings/[id]`

---

### 3. BookingEditDialog
**Purpose**: Edit booking details

**Editable Fields**:
- Status
- Payment status
- Dates (with availability check)
- Guest count
- Add-ons

**API**: `PATCH /api/admin/bookings/[id]`

---

## API Enhancements Needed

### 1. Search Support
**Endpoint**: `GET /api/admin/bookings`

**Add Query Param**: `search` (string)

**Search Fields**:
- Guest name
- Guest email
- Booking number
- Tent name

**Implementation**:
```typescript
if (search) {
  where.OR = [
    { bookingNumber: { contains: search, mode: 'insensitive' } },
    { user: { name: { contains: search, mode: 'insensitive' } } },
    { user: { email: { contains: search, mode: 'insensitive' } } },
    { tent: { name: { contains: search, mode: 'insensitive' } } },
  ];
}
```

---

## Implementation Priority

### Priority 1: Critical (Must Have)
1. ✅ Fix "New Booking" button
2. ✅ Create BookingCreateDialog
3. ✅ Wire up action menu items
4. ✅ Add search functionality

### Priority 2: Important (Should Have)
5. ✅ Add filter functionality
6. ✅ Create BookingDetailsDialog
7. ✅ Create BookingEditDialog
8. ✅ Add export functionality

### Priority 3: Nice to Have
9. ✅ Add pagination
10. ✅ Add sorting
11. ✅ Clean up BookingsTable component

---

## Summary

**Current State**: Page displays bookings but has no interactive functionality

**Main Issue**: All buttons and inputs are non-functional

**Fix Required**: Create dialogs, wire up buttons, add search/filter/export

**Estimated Effort**: 
- Priority 1: 2-3 hours
- Priority 2: 2-3 hours
- Priority 3: 1 hour

**Total**: ~5-7 hours to make fully functional

