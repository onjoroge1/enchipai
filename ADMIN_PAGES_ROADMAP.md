# Admin Pages Functional Roadmap

**Project**: Enchipai Mara Camp Management System  
**Date**: Current  
**Purpose**: Comprehensive roadmap to make all admin pages fully functional

---

## Executive Summary

While the project shows 100% completion in the main roadmap, there are functional gaps in the admin interface. This document outlines specific tasks needed to make each admin page fully operational.

**Total Admin Pages**: 16  
**Pages Needing Work**: ~12  
**Estimated Effort**: Medium to High

---

## Page-by-Page Analysis & Roadmap

### 1. Dashboard (`/admin`) ✅ **MOSTLY FUNCTIONAL**

**Status**: 85% Complete

**What Works**:
- ✅ Stats cards display real data
- ✅ Recent bookings table
- ✅ Revenue chart
- ✅ Availability calendar

**Issues to Fix**:
1. **Priority 2**: Verify all stats cards pull from real-time data
2. **Priority 3**: Add date range selector for revenue chart
3. **Priority 3**: Add refresh button for manual data updates

**Action Items**:
- [ ] Test all stats cards with empty database
- [ ] Add date range picker to revenue chart
- [ ] Add loading states for all components
- [ ] Add error handling for failed API calls

**Estimated Effort**: 2-3 hours

---

### 2. Bookings (`/admin/bookings`) ⚠️ **PARTIALLY FUNCTIONAL**

**Status**: 60% Complete

**What Works**:
- ✅ Bookings table displays data
- ✅ Search functionality (recently fixed)
- ✅ Status filter dropdown
- ✅ Booking details dialog
- ✅ Booking edit dialog
- ✅ Create booking dialog
- ✅ Export to CSV functionality

**Issues to Fix**:
1. **Priority 1**: Verify all action menu items are wired up
2. **Priority 2**: Add pagination (currently limited to 100 bookings)
3. **Priority 2**: Add sorting by column headers
4. **Priority 3**: Add date range filter
5. **Priority 3**: Add tent filter
6. **Priority 3**: Add guest name filter

**Action Items**:
- [ ] Verify "View Details" opens BookingDetailsDialog
- [ ] Verify "Edit Booking" opens BookingEditDialog
- [ ] Verify "Cancel Booking" updates status correctly
- [ ] Add pagination component with page size selector
- [ ] Add column sorting (date, amount, status, guest name)
- [ ] Add date range filter (check-in/check-out dates)
- [ ] Add tent dropdown filter
- [ ] Add advanced filter dialog
- [ ] Test export with large datasets
- [ ] Add loading skeleton for table

**Estimated Effort**: 6-8 hours

---

### 3. Guests (`/admin/guests`) ⚠️ **PARTIALLY FUNCTIONAL**

**Status**: 70% Complete

**What Works**:
- ✅ Guests table displays data
- ✅ Search functionality
- ✅ Guest details dialog
- ✅ Guest edit dialog
- ✅ Status filtering (VIP, Returning, New)
- ✅ View profile action

**Issues to Fix**:
1. **Priority 1**: Fix country field (currently shows "N/A")
2. **Priority 2**: Add export to CSV functionality
3. **Priority 2**: Add pagination
4. **Priority 2**: Add sorting
5. **Priority 3**: Wire up "Send Email" action
6. **Priority 3**: Wire up "View Bookings" action (filter bookings by guest)
7. **Priority 3**: Add "Add Note" functionality
8. **Priority 3**: Add guest notes display in details dialog

**Action Items**:
- [ ] Fix country field - get from GuestInfo or User model
- [ ] Add export button with CSV generation
- [ ] Add pagination component
- [ ] Add column sorting (name, email, visits, total spent)
- [ ] Create email dialog component for "Send Email"
- [ ] Add navigation to bookings page with guest filter
- [ ] Create guest notes API endpoint (`POST /api/admin/guests/[id]/notes`)
- [ ] Add notes section to GuestDetailsDialog
- [ ] Add note creation form
- [ ] Test with guests who have no bookings

**Estimated Effort**: 8-10 hours

---

### 4. Tents (`/admin/tents`) ⚠️ **PARTIALLY FUNCTIONAL**

**Status**: 75% Complete

**What Works**:
- ✅ Tents list displays data
- ✅ Create tent dialog
- ✅ Edit tent dialog
- ✅ Delete tent functionality
- ✅ Tent details dialog
- ✅ Featured status toggle
- ✅ Display order management
- ✅ Tent calendar view
- ✅ Season rates management

**Issues to Fix**:
1. **Priority 1**: Wire up "View Details" menu item (currently exists but may not be connected)
2. **Priority 2**: Add search functionality
3. **Priority 2**: Add status filter
4. **Priority 2**: Add featured filter
5. **Priority 2**: Add export to CSV
6. **Priority 3**: Add image gallery management (multiple images)
7. **Priority 3**: Add amenities management in tent form
8. **Priority 3**: Fix field name mismatch (`maxGuests` vs `guests`)

**Action Items**:
- [ ] Verify "View Details" opens TentDetailsDialog
- [ ] Add search bar to filter tents by name
- [ ] Add status filter dropdown (Available, Occupied, Maintenance, Unavailable)
- [ ] Add featured filter toggle
- [ ] Add export button with CSV generation
- [ ] Add image gallery upload/management in tent form
- [ ] Add image reordering functionality
- [ ] Add primary image selection
- [ ] Add amenities field to tent form (if not exists)
- [ ] Fix `maxGuests` vs `guests` field mapping
- [ ] Add pagination if tent count exceeds 50

**Estimated Effort**: 8-10 hours

---

### 5. Blog (`/admin/blog`) ✅ **FULLY FUNCTIONAL**

**Status**: 95% Complete

**What Works**:
- ✅ Blog posts table
- ✅ Rich text editor (Tiptap)
- ✅ Create/edit blog posts
- ✅ Delete blog posts
- ✅ Blog stats
- ✅ Image upload
- ✅ Scheduling

**Issues to Fix**:
1. **Priority 3**: Add bulk actions (delete multiple, publish multiple)
2. **Priority 3**: Add category filter
3. **Priority 3**: Add status filter (draft, published, scheduled)

**Action Items**:
- [ ] Add checkbox selection for bulk actions
- [ ] Add bulk delete functionality
- [ ] Add bulk publish
- [ ] Add category filter dropdown
- [ ] Add status filter dropdown
- [ ] Test with large number of blog posts

**Estimated Effort**: 3-4 hours

---

### 6. Invoices (`/admin/invoices`) ⚠️ **NEEDS VERIFICATION**

**Status**: Unknown (Needs Testing)

**What Works** (Assumed):
- ✅ Invoices table
- ✅ Invoice stats
- ✅ Payment tracking

**Issues to Verify**:
1. **Priority 1**: Test invoice generation
2. **Priority 1**: Test payment recording
3. **Priority 1**: Test invoice editing
4. **Priority 2**: Add export functionality
5. **Priority 2**: Add search/filter
6. **Priority 2**: Add pagination

**Action Items**:
- [ ] Test invoice creation from booking
- [ ] Test manual invoice creation
- [ ] Test payment recording
- [ ] Test invoice status updates
- [ ] Add export to PDF/CSV
- [ ] Add search by invoice number, guest name
- [ ] Add status filter (paid, pending, overdue)
- [ ] Add date range filter
- [ ] Add pagination
- [ ] Test invoice PDF generation

**Estimated Effort**: 6-8 hours

---

### 7. Analytics (`/admin/analytics`) ⚠️ **NEEDS VERIFICATION**

**Status**: Unknown (Needs Testing)

**What Works** (Assumed):
- ✅ Analytics overview
- ✅ Revenue breakdown chart
- ✅ Occupancy chart
- ✅ Booking statistics
- ✅ Guest demographics

**Issues to Verify**:
1. **Priority 1**: Test all charts with real data
2. **Priority 1**: Test with empty database
3. **Priority 2**: Add date range selector
4. **Priority 2**: Add export functionality
5. **Priority 3**: Add comparison periods (YoY, MoM)

**Action Items**:
- [ ] Test all charts render correctly
- [ ] Test with no data (empty states)
- [ ] Add date range picker (default: last 30 days, 90 days, 1 year)
- [ ] Add export charts as images
- [ ] Add export data as CSV
- [ ] Add year-over-year comparison
- [ ] Add month-over-month comparison
- [ ] Add loading states
- [ ] Add error handling

**Estimated Effort**: 6-8 hours

---

### 8. Experiences (`/admin/experiences`) ⚠️ **NEEDS VERIFICATION**

**Status**: Unknown (Needs Testing)

**What Works** (Assumed):
- ✅ Experiences list
- ✅ Experience stats
- ✅ Experience bookings

**Issues to Verify**:
1. **Priority 1**: Test experience CRUD operations
2. **Priority 1**: Test experience booking creation
3. **Priority 2**: Add search/filter
4. **Priority 2**: Add export
5. **Priority 3**: Add experience details view

**Action Items**:
- [ ] Test create experience
- [ ] Test edit experience
- [ ] Test delete experience
- [ ] Test create experience booking
- [ ] Test edit experience booking
- [ ] Add search by experience name
- [ ] Add category filter
- [ ] Add status filter
- [ ] Add export to CSV
- [ ] Add experience details dialog
- [ ] Add pagination

**Estimated Effort**: 6-8 hours

---

### 9. Inventory (`/admin/inventory`) ⚠️ **NEEDS VERIFICATION**

**Status**: Unknown (Needs Testing)

**What Works** (Assumed):
- ✅ Inventory list
- ✅ Inventory stats
- ✅ Low stock alerts
- ✅ Inventory categories

**Issues to Verify**:
1. **Priority 1**: Test inventory CRUD operations
2. **Priority 1**: Test low stock alerts trigger
3. **Priority 2**: Add search/filter
4. **Priority 2**: Add export
5. **Priority 3**: Add bulk update functionality

**Action Items**:
- [ ] Test create inventory item
- [ ] Test edit inventory item
- [ ] Test delete inventory item
- [ ] Test update stock levels
- [ ] Test low stock alert threshold
- [ ] Add search by item name
- [ ] Add category filter
- [ ] Add low stock filter
- [ ] Add export to CSV
- [ ] Add bulk stock update
- [ ] Add pagination
- [ ] Test with large inventory lists

**Estimated Effort**: 6-8 hours

---

### 10. Settings (`/admin/settings`) ⚠️ **NEEDS VERIFICATION**

**Status**: Unknown (Needs Testing)

**What Works** (Assumed):
- ✅ Settings tabs
- ✅ Hero editor

**Issues to Verify**:
1. **Priority 1**: Test all settings save correctly
2. **Priority 1**: Test settings load on page load
3. **Priority 2**: Add validation for settings
4. **Priority 2**: Add success/error messages
5. **Priority 3**: Add settings export/import

**Action Items**:
- [ ] Test general settings save
- [ ] Test booking settings save
- [ ] Test email settings save
- [ ] Test season rates save
- [ ] Test special dates save
- [ ] Test hero content save
- [ ] Add form validation
- [ ] Add success toast notifications
- [ ] Add error handling
- [ ] Add settings reset to defaults
- [ ] Test settings persistence

**Estimated Effort**: 4-6 hours

---

### 11. Wildlife (`/admin/wildlife`) ⚠️ **NEEDS VERIFICATION**

**Status**: Unknown (Needs Testing)

**What Works** (Assumed):
- ✅ Wildlife stats
- ✅ Sightings log
- ✅ Weather widget
- ✅ Sighting form

**Issues to Verify**:
1. **Priority 1**: Test sighting creation
2. **Priority 1**: Test sighting editing
3. **Priority 1**: Test weather widget integration
4. **Priority 2**: Add search/filter for sightings
5. **Priority 2**: Add export functionality
6. **Priority 3**: Add sighting images

**Action Items**:
- [ ] Test create sighting
- [ ] Test edit sighting
- [ ] Test delete sighting
- [ ] Test weather API integration
- [ ] Add search by animal type
- [ ] Add date range filter
- [ ] Add location filter
- [ ] Add export to CSV
- [ ] Add image upload for sightings
- [ ] Add pagination
- [ ] Test with large number of sightings

**Estimated Effort**: 5-7 hours

---

### 12. Transfers (`/admin/transfers`) ⚠️ **NEEDS VERIFICATION**

**Status**: Unknown (Needs Testing)

**What Works** (Assumed):
- ✅ Transfer stats
- ✅ Transfer schedule
- ✅ Vehicle fleet
- ✅ Vehicle maintenance

**Issues to Verify**:
1. **Priority 1**: Test transfer CRUD operations
2. **Priority 1**: Test vehicle CRUD operations
3. **Priority 1**: Test maintenance logging
4. **Priority 2**: Add search/filter
5. **Priority 2**: Add export
6. **Priority 3**: Add calendar view for transfers

**Action Items**:
- [ ] Test create transfer
- [ ] Test edit transfer
- [ ] Test delete transfer
- [ ] Test create vehicle
- [ ] Test edit vehicle
- [ ] Test delete vehicle
- [ ] Test maintenance log creation
- [ ] Add search by guest name, vehicle
- [ ] Add date range filter
- [ ] Add status filter
- [ ] Add export to CSV
- [ ] Add calendar view
- [ ] Add pagination

**Estimated Effort**: 6-8 hours

---

### 13. Channels (`/admin/channels`) ⚠️ **NEEDS VERIFICATION**

**Status**: Unknown (Needs Testing)

**What Works** (Assumed):
- ✅ Channel stats
- ✅ Channel list
- ✅ Channel sync

**Issues to Verify**:
1. **Priority 1**: Test channel creation
2. **Priority 1**: Test channel sync functionality
3. **Priority 1**: Test availability sync
4. **Priority 2**: Add channel configuration
5. **Priority 3**: Add sync logs/history

**Action Items**:
- [ ] Test create channel (Booking.com, Airbnb, etc.)
- [ ] Test edit channel
- [ ] Test delete channel
- [ ] Test manual sync trigger
- [ ] Test automatic sync (if implemented)
- [ ] Test availability sync
- [ ] Add channel API key configuration
- [ ] Add sync status indicator
- [ ] Add sync logs/history
- [ ] Add error handling for sync failures
- [ ] Test with actual OTA APIs (if available)

**Estimated Effort**: 8-10 hours (depends on OTA integration complexity)

---

### 14. Emails (`/admin/emails`) ⚠️ **NEEDS VERIFICATION**

**Status**: Unknown (Needs Testing)

**What Works** (Assumed):
- ✅ Email stats
- ✅ Email templates
- ✅ Email campaigns

**Issues to Verify**:
1. **Priority 1**: Test template creation
2. **Priority 1**: Test template editing
3. **Priority 1**: Test campaign creation
4. **Priority 1**: Test email sending
5. **Priority 2**: Add template preview
6. **Priority 2**: Add campaign scheduling
7. **Priority 3**: Add email logs viewer

**Action Items**:
- [ ] Test create email template
- [ ] Test edit email template
- [ ] Test delete email template
- [ ] Test create email campaign
- [ ] Test send email campaign
- [ ] Test email delivery
- [ ] Add template preview (HTML/text)
- [ ] Add campaign scheduling
- [ ] Add email logs table
- [ ] Add email open/click tracking
- [ ] Add recipient selection (filter guests)
- [ ] Test with Resend API

**Estimated Effort**: 6-8 hours

---

### 15. Notifications (`/admin/notifications`) ⚠️ **NEEDS VERIFICATION**

**Status**: Unknown (Needs Testing)

**What Works** (Assumed):
- ✅ Notification stats
- ✅ Notification center
- ✅ Notification composer

**Issues to Verify**:
1. **Priority 1**: Test notification creation
2. **Priority 1**: Test notification sending
3. **Priority 1**: Test notification delivery
4. **Priority 2**: Add notification templates
5. **Priority 2**: Add recipient selection
6. **Priority 3**: Add notification scheduling

**Action Items**:
- [ ] Test create notification
- [ ] Test send notification (SMS, WhatsApp, in-app)
- [ ] Test notification delivery
- [ ] Add notification templates
- [ ] Add recipient selection (all, specific guests, groups)
- [ ] Add notification scheduling
- [ ] Add notification history
- [ ] Add read/unread status
- [ ] Test with notification providers (if integrated)

**Estimated Effort**: 6-8 hours

---

### 16. Reports (`/admin/reports`) ⚠️ **NEEDS VERIFICATION**

**Status**: Unknown (Needs Testing)

**What Works** (Assumed):
- ✅ Report stats
- ✅ Report generator
- ✅ Recent reports

**Issues to Verify**:
1. **Priority 1**: Test report generation
2. **Priority 1**: Test report download
3. **Priority 1**: Test all report types
4. **Priority 2**: Add custom date ranges
5. **Priority 2**: Add report scheduling
6. **Priority 3**: Add report templates

**Action Items**:
- [ ] Test financial report generation
- [ ] Test booking report generation
- [ ] Test guest report generation
- [ ] Test occupancy report generation
- [ ] Test report PDF generation
- [ ] Test report CSV export
- [ ] Add custom date range selector
- [ ] Add report scheduling (daily, weekly, monthly)
- [ ] Add report email delivery
- [ ] Add report templates
- [ ] Add report customization options
- [ ] Test with large datasets

**Estimated Effort**: 8-10 hours

---

## Cross-Cutting Issues

### Common Functionality Needed Across Pages

1. **Pagination** (Priority 2)
   - Add pagination component to all list pages
   - Standardize page size (10, 25, 50, 100)
   - Add page number display

2. **Search** (Priority 2)
   - Standardize search input design
   - Add debouncing for search
   - Add clear search button

3. **Export** (Priority 2)
   - Add CSV export to all list pages
   - Standardize export format
   - Add export button design

4. **Loading States** (Priority 2)
   - Add skeleton loaders
   - Add loading spinners
   - Standardize loading patterns

5. **Error Handling** (Priority 1)
   - Add error boundaries
   - Add error messages
   - Add retry functionality

6. **Empty States** (Priority 2)
   - Add empty state components
   - Add helpful messages
   - Add action buttons for empty states

7. **Toast Notifications** (Priority 2)
   - Standardize success messages
   - Standardize error messages
   - Add toast component

---

## Implementation Priority

### Phase 1: Critical Fixes (Week 1)
**Estimated Effort**: 20-25 hours

1. ✅ Verify and fix all action menu items
2. ✅ Fix country field in guests table
3. ✅ Add pagination to bookings, guests, tents
4. ✅ Add export to bookings, guests, tents
5. ✅ Test all detail dialogs open correctly
6. ✅ Fix field name mismatches

### Phase 2: Important Features (Week 2)
**Estimated Effort**: 25-30 hours

1. ✅ Add search/filter to all list pages
2. ✅ Add sorting to all tables
3. ✅ Test and fix invoices page
4. ✅ Test and fix analytics page
5. ✅ Test and fix experiences page
6. ✅ Test and fix inventory page

### Phase 3: Enhanced Features (Week 3)
**Estimated Effort**: 20-25 hours

1. ✅ Add bulk actions where applicable
2. ✅ Add date range filters
3. ✅ Test and fix remaining pages (wildlife, transfers, channels, emails, notifications, reports)
4. ✅ Add image gallery management
5. ✅ Add advanced filtering

### Phase 4: Polish & Testing (Week 4)
**Estimated Effort**: 15-20 hours

1. ✅ Add loading states everywhere
2. ✅ Add error handling everywhere
3. ✅ Add empty states everywhere
4. ✅ Standardize toast notifications
5. ✅ End-to-end testing
6. ✅ Performance optimization

---

## Testing Checklist

For each page, verify:

- [ ] Page loads without errors
- [ ] Data displays correctly
- [ ] Create functionality works
- [ ] Edit functionality works
- [ ] Delete functionality works (with confirmation)
- [ ] Search works
- [ ] Filters work
- [ ] Export works
- [ ] Pagination works
- [ ] Sorting works
- [ ] Detail views open
- [ ] Forms validate correctly
- [ ] Success/error messages display
- [ ] Loading states show
- [ ] Empty states show
- [ ] Mobile responsive
- [ ] Works with empty database
- [ ] Works with large datasets

---

## Success Criteria

A page is considered "fully functional" when:

1. ✅ All CRUD operations work
2. ✅ All action buttons/menu items work
3. ✅ Search and filters work
4. ✅ Export works (if applicable)
5. ✅ Pagination works (if applicable)
6. ✅ Detail views open correctly
7. ✅ Forms validate and save correctly
8. ✅ Loading and error states work
9. ✅ Empty states display correctly
10. ✅ Mobile responsive

---

## Estimated Total Effort

**Total Hours**: 80-100 hours  
**With Testing**: 100-120 hours  
**Timeline**: 4-5 weeks (1 developer, full-time)

---

## Notes

- Many components exist but need to be connected/wired up
- API endpoints are mostly complete
- Focus on user experience and data flow
- Test with both empty and populated databases
- Ensure mobile responsiveness
- Follow existing code patterns and conventions

---

**Last Updated**: Current  
**Next Review**: After Phase 1 completion

