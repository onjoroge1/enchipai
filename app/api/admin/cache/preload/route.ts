import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-utils';

/**
 * Preload endpoint to cache admin pages in bulk
 * Call this when user has good connection to pre-cache all admin pages
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const adminPages = [
      '/admin',
      '/admin/bookings',
      '/admin/guests',
      '/admin/tents',
      '/admin/invoices',
      '/admin/analytics',
      '/admin/experiences',
      '/admin/inventory',
      '/admin/settings',
      '/admin/wildlife',
      '/admin/transfers',
      '/admin/channels',
      '/admin/emails',
      '/admin/notifications',
      '/admin/reports',
      '/admin/blog',
    ];

    // Return list of pages to preload
    // The client-side will handle the actual caching via service worker
    return NextResponse.json({
      success: true,
      pages: adminPages,
      message: 'Pages queued for preloading',
    });
  } catch (error) {
    console.error('Preload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to queue preload' },
      { status: 500 }
    );
  }
}

