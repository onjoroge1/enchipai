# Offline Support & Caching Setup

This application is optimized for use in remote areas with unreliable internet connectivity (e.g., rural Kenya). All admin pages and essential resources are cached for offline access.

## Features

### 1. **Service Worker Caching**
- Automatically caches all admin pages
- Caches static assets (images, fonts, CSS, JS)
- Network-first strategy for API calls (falls back to cache when offline)
- Cache-first strategy for static assets

### 2. **PWA (Progressive Web App)**
- Installable as a native app
- Works offline after installation
- Appears in app launcher/home screen

### 3. **Offline Detection**
- Visual indicator when connection is lost
- Automatic sync when connection is restored
- Graceful degradation of features

### 4. **Bulk Page Preloading**
- Manual cache manager in Settings page
- Preloads all admin pages when you have good connection
- Useful before going to areas with poor connectivity

## How to Use

### For Users in Remote Areas

1. **First Time Setup (When You Have Internet)**
   - Visit the admin dashboard
   - Go to Settings → Offline Cache Manager
   - Click "Preload All Pages"
   - Wait for all pages to cache
   - Install the app (if prompted) for better offline experience

2. **Using Offline**
   - All cached pages work without internet
   - View bookings, guests, tents, etc. from cache
   - New data will sync when connection is restored
   - Offline banner shows connection status

3. **When Connection Returns**
   - Data automatically syncs
   - "Back Online" notification appears
   - Fresh data loads from server

### For Developers

#### Service Worker
- Located at: `public/sw.js`
- Automatically registered in production
- Caches pages, assets, and API responses
- Updates automatically when new version is deployed

#### Cache Strategy
- **Static Assets**: Cache First (images, fonts, CSS)
- **Pages**: Network First, Cache Fallback
- **API Calls**: Network First, Cache Fallback (with longer TTL)

#### Manual Cache Management
- Component: `components/admin/cache-manager.tsx`
- Accessible from Settings page
- Allows manual preloading and cache clearing

## Cached Resources

### Pages (Preloaded)
- `/admin` - Dashboard
- `/admin/bookings` - Bookings management
- `/admin/guests` - Guest management
- `/admin/tents` - Tent management
- `/admin/invoices` - Invoice management
- `/admin/analytics` - Analytics
- `/admin/experiences` - Experiences
- `/admin/inventory` - Inventory
- `/admin/settings` - Settings
- `/admin/wildlife` - Wildlife sightings
- `/admin/transfers` - Transfers
- `/admin/channels` - Channel management
- `/admin/emails` - Email management
- `/admin/notifications` - Notifications
- `/admin/reports` - Reports
- `/admin/blog` - Blog management

### Assets
- All images in `/images/`
- Icons and logos
- Fonts and CSS
- JavaScript bundles

## Browser Support

- ✅ Chrome/Edge (Full support)
- ✅ Firefox (Full support)
- ✅ Safari (Full support on iOS 11.3+)
- ✅ Opera (Full support)

## Testing Offline Mode

1. Open browser DevTools
2. Go to Application/Storage tab
3. Check "Offline" checkbox
4. Navigate to admin pages - they should load from cache
5. Uncheck "Offline" to restore connection

## Cache Versioning

- Cache version is in `public/sw.js` (`CACHE_VERSION`)
- Increment version to force cache refresh
- Old caches are automatically cleaned up

## Notes

- Service Worker only works over HTTPS (or localhost for development)
- First visit requires internet connection
- After initial cache, works fully offline
- API data is cached but may be stale when offline
- Form submissions are queued and sync when online

