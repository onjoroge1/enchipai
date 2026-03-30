# Admin Bookings Page Analysis

## Page Location
`/admin/bookings` - `app/admin/bookings/page.tsx`

## Current Status: ⚠️ PARTIALLY FUNCTIONAL

---

## Issues Found

### ❌ Issue 1: "New Booking" Button Not Responsive
**Location**: `app/admin/bookings/page.tsx` (line 26-29)

**Problem**:
```tsx
<Button size="sm">
  <Plus className="w-4 h-4 mr-2" />
  New Booking
</Button>
```
- No `onClick` handler
- No dialog/form to create booking
- Button does nothing when clicked

**Impact**: Admin cannot create new bookings from this page

---

### ❌ Issue 2: "New Booking" Button in BookingsTable Component
**Location**: `components/admin/bookings-table.tsx` (line 112-114)

**Problem**:
```tsx
<Button size="sm" className="bg-primary text-primary-foreground">
  + New Booking
</Button>
```
- No `onClick` handler
- Duplicate button (also in page header)

**Impact**: Redundant non-functional button

---

### ❌ Issue 3: Filter Button Not Functional
**Location**: `app/admin/bookings/page.tsx` (line 18-21)

**Problem**:
```tsx
<Button variant="outline" size="sm">
  <Filter className="w-4 h-4 mr-2" />
  Filter
</Button>
```
- No `onClick` handler
- No filter dialog/menu
- No filter state management

**Impact**: Cannot filter bookings by status, date, tent, etc.

---

### ❌ Issue 4: Export Button Not Functional
**Location**: `app/admin/bookings/page.tsx` (line 22-25)

**Problem**:
```tsx
<Button variant="outline" size="sm">
  <Download className="w-4 h-4 mr-2" />
  Export
</Button>
```
- No `onClick` handler
- No export functionality (CSV, Excel, PDF)

**Impact**: Cannot export bookings data

---

### ❌ Issue 5: Search Input Not Functional
**Location**: `app/admin/bookings/page.tsx` (line 43-48)

**Problem**:
```tsx
<Input
  placeholder="Search bookings..."
  className="pl-9 w-64"
/>
```
- No `value` or `onChange` handler
- No search state
- No API integration for search

**Impact**: Cannot search bookings by guest name, email, booking number, etc.

---

### ❌ Issue 6: Action Menu Items Not Functional
**Location**: `components/admin/bookings-table.tsx` (lines 195-207)

**Problem**:
```tsx
<DropdownMenuItem>
  <Eye className="w-4 h-4 mr-2" />
  View Details
</DropdownMenuItem>
<DropdownMenuItem>
  <Edit className="w-4 h-4 mr-2" />
  Edit Booking
</DropdownMenuItem>
<DropdownMenuItem className="text-destructive">
  <Trash2 className="w-4 h-4 mr-2" />
  Cancel Booking
</DropdownMenuItem>
```
- No `onClick` handlers
- No dialogs/forms for viewing/editing
- No API calls for cancellation

**Impact**: Cannot view, edit, or cancel bookings

---

### ⚠️ Issue 7: BookingsTable Component Issues
**Location**: `components/admin/bookings-table.tsx`

**Problems**:
1. Component has its own "New Booking" button (duplicate)
2. Card wrapper is redundant (page already has Card)
3. Title says "Recent Bookings" but should say "All Bookings"
4. No pagination
5. No sorting
6. No status filtering

---

## What Works ✅

1. **Data Fetching**: ✅
   - Fetches bookings from `/api/admin/bookings`
   - Displays bookings in table
   - Shows loading state
   - Shows error state
   - Shows empty state

2. **Table Display**: ✅
   - Shows booking ID, guest, tent, dates, amount, status
   - Responsive design (hides columns on mobile)
   - Status badges with color coding
   - Proper date formatting

---

## Required Fixes

### Priority 1: Critical Functionality
1. ✅ **Create Booking Dialog** - Admin form to create bookings
2. ✅ **Wire "New Booking" Button** - Connect to dialog
3. ✅ **View Booking Details** - Dialog/modal to view full booking info
4. ✅ **Edit Booking** - Form to edit booking details
5. ✅ **Cancel Booking** - API call to cancel booking

### Priority 2: Search & Filter
6. ✅ **Search Functionality** - Search by guest name, email, booking number
7. ✅ **Filter Functionality** - Filter by status, date range, tent
8. ✅ **Export Functionality** - Export to CSV/Excel

### Priority 3: UX Improvements
9. ✅ **Pagination** - Handle large booking lists
10. ✅ **Sorting** - Sort by date, amount, status
11. ✅ **Remove Duplicate Button** - Clean up BookingsTable component

---

## API Endpoints Available

### ✅ GET `/api/admin/bookings`
- **Status**: Working
- **Supports**: `status`, `startDate`, `endDate`, `limit`, `offset`
- **Returns**: List of bookings with relations

### ✅ PATCH `/api/admin/bookings/[id]`
- **Status**: Should exist (need to verify)
- **Purpose**: Update booking

### ✅ DELETE `/api/admin/bookings/[id]`
- **Status**: Should exist (need to verify)
- **Purpose**: Cancel/delete booking

### ⚠️ POST `/api/admin/bookings`
- **Status**: Need to verify if exists
- **Purpose**: Create booking as admin (may need to use `/api/bookings`)

---

## Recommended Implementation

### 1. Create Booking Dialog Component
- Similar to `TentFormDialog` pattern
- Fields: Guest selection, Tent selection, Dates, Guests count, Add-ons
- API: Use `/api/bookings` or create `/api/admin/bookings` POST endpoint

### 2. Booking Details Dialog
- Show full booking information
- Include: Guest info, Tent details, Dates, Add-ons, Invoice, Payment status

### 3. Edit Booking Dialog
- Pre-fill form with existing booking data
- Allow editing: Dates, Guests, Add-ons, Status
- API: PATCH `/api/admin/bookings/[id]`

### 4. Search & Filter State
- Add state management for search query
- Add state for filters (status, date range, tent)
- Pass to API as query parameters

### 5. Export Function
- Convert bookings data to CSV
- Download as file
- Include all booking fields

---

## Summary

**Current Functionality**: 30% (Data display only)
**Missing Functionality**: 70% (CRUD operations, search, filter, export)

**Main Issue**: "New Booking" button and all action buttons are not connected to any functionality.

**Next Steps**: 
1. Create booking dialog component
2. Wire up all buttons
3. Implement search/filter
4. Add export functionality

