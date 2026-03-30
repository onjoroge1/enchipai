# Admin Guests Page Analysis

## Page: `/admin/guests`

## Current Status: ⚠️ 40% Functional (Display Only)

---

## ✅ What Works

### 1. GuestsTable Component
**Status**: ✅ Mostly Functional

**Working Features**:
- ✅ Fetches guests from `/api/admin/guests`
- ✅ Search functionality (real-time search)
- ✅ Displays guest name, email
- ✅ Shows booking count
- ✅ Calculates total spent from bookings
- ✅ Shows last visit date
- ✅ Status badges (VIP, Returning, New) based on visit count
- ✅ Loading states
- ✅ Empty states

**Data Source**: ✅ Real API (`/api/admin/guests`)

---

## ❌ Issues Found

### 1. Filter Button Not Functional
**Location**: `components/admin/guests-table.tsx:95-97`

**Current Code**:
```tsx
<Button variant="outline" size="icon">
  <Filter className="w-4 h-4" />
</Button>
```

**Problem**: No `onClick` handler - button does nothing

**Fix Required**:
- Add filter dropdown/menu
- Filter by status (VIP, Returning, New)
- Filter by visit count
- Filter by total spent range

---

### 2. Export Button Not Functional
**Location**: `components/admin/guests-table.tsx:98-100`

**Current Code**:
```tsx
<Button variant="outline" size="icon">
  <Download className="w-4 h-4" />
</Button>
```

**Problem**: No `onClick` handler - button does nothing

**Fix Required**:
- Export guests to CSV
- Include all guest data and booking history

---

### 3. Action Menu Items Not Functional
**Location**: `components/admin/guests-table.tsx:186-191`

**Current Code**:
```tsx
<DropdownMenuItem>View Profile</DropdownMenuItem>
<DropdownMenuItem>Send Email</DropdownMenuItem>
<DropdownMenuItem>View Bookings</DropdownMenuItem>
<DropdownMenuItem>Add Note</DropdownMenuItem>
```

**Problem**: No `onClick` handlers - all menu items do nothing

**Fix Required**:
- **View Profile**: Create `GuestDetailsDialog` component
- **Send Email**: Create email dialog or link to email system
- **View Bookings**: Navigate to bookings page filtered by guest
- **Add Note**: Create note dialog/form

---

### 4. Country Field Shows "N/A"
**Location**: `components/admin/guests-table.tsx:162-166`

**Current Code**:
```tsx
<td className="py-4 px-4 hidden lg:table-cell">
  <div className="flex items-center gap-1 text-sm text-foreground">
    <MapPin className="w-3 h-3 text-muted-foreground" />
    N/A
  </div>
</td>
```

**Problem**: Hardcoded "N/A" - no country data

**Fix Required**:
- Add country field to User model (if not exists)
- Fetch country from guest info or user profile
- Display actual country or hide column if not available

---

### 5. GuestStats Component
**Location**: `components/admin/guest-stats.tsx`

**Status**: Need to check if it's static or functional

---

### 6. GuestPreferences Component
**Location**: `components/admin/guest-preferences.tsx`

**Status**: Need to check if it's static or functional

---

## ⚠️ Missing API Endpoints

### No CRUD Operations for Guests
**Current**: Only `GET /api/admin/guests` exists

**Missing**:
- ❌ `GET /api/admin/guests/[id]` - Get single guest details
- ❌ `PATCH /api/admin/guests/[id]` - Update guest info
- ❌ `DELETE /api/admin/guests/[id]` - Delete guest (if needed)
- ❌ `POST /api/admin/guests/[id]/notes` - Add note to guest
- ❌ `GET /api/admin/guests/[id]/bookings` - Get all bookings for guest

---

## Required Components to Create

### 1. GuestDetailsDialog
**Purpose**: View full guest profile

**Display**:
- Guest name, email, phone
- Country/location
- Total bookings count
- Total spent
- Booking history
- Preferences
- Notes
- Last visit date

**API**: `GET /api/admin/guests/[id]` (needs to be created)

---

### 2. GuestEditDialog
**Purpose**: Edit guest information

**Editable Fields**:
- Name
- Email
- Phone
- Country
- Preferences

**API**: `PATCH /api/admin/guests/[id]` (needs to be created)

---

### 3. GuestNoteDialog
**Purpose**: Add/view notes for guest

**Features**:
- Add note
- View note history
- Edit/delete notes

**API**: `POST /api/admin/guests/[id]/notes` (needs to be created)

---

### 4. GuestEmailDialog
**Purpose**: Send email to guest

**Features**:
- Select email template
- Compose custom email
- Send email

**API**: Use existing email system

---

## Additional Issues

### 1. No Pagination
**Location**: `components/admin/guests-table.tsx`

**Problem**: Only shows first 50 guests (from API limit)

**Fix Required**: Add pagination component

---

### 2. No Sorting
**Location**: `components/admin/guests-table.tsx`

**Problem**: Cannot sort by name, visits, total spent, etc.

**Fix Required**: Add sorting functionality

---

### 3. Country Data Missing
**Problem**: Country field shows "N/A" for all guests

**Possible Solutions**:
- Add country to User model
- Get country from GuestInfo (if available)
- Get country from bookings' guestInfo
- Hide column if data not available

---

## Summary

**Current Functionality**: 40% (Display and search only)

**Missing Functionality**: 60%
- Filter functionality
- Export functionality
- View/Edit guest details
- Action menu items
- Country data
- Pagination
- Sorting

**Main Issues**:
1. All action menu items are non-functional
2. Filter and Export buttons do nothing
3. Country field is hardcoded to "N/A"
4. No API endpoints for guest CRUD operations
5. No guest detail view/edit dialogs

---

## Priority Fixes

### Priority 1: Critical
1. ✅ Create `GET /api/admin/guests/[id]` endpoint
2. ✅ Create `GuestDetailsDialog` component
3. ✅ Wire up "View Profile" action
4. ✅ Wire up "View Bookings" action

### Priority 2: Important
5. ✅ Create `PATCH /api/admin/guests/[id]` endpoint
6. ✅ Create `GuestEditDialog` component
7. ✅ Wire up filter functionality
8. ✅ Wire up export functionality
9. ✅ Fix country field (or hide if not available)

### Priority 3: Nice to Have
10. ✅ Add pagination
11. ✅ Add sorting
12. ✅ Create guest notes system
13. ✅ Wire up "Send Email" action

