import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({ success: true });
    
    // Clear all possible NextAuth session cookies
    const cookieNames = [
      'authjs.session-token',
      '__Secure-authjs.session-token',
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'authjs.csrf-token',
      '__Host-authjs.csrf-token',
    ];
    
    // Get all cookies from the request
    const allCookies = request.cookies.getAll();
    
    // Clear all cookies that might be related to auth
    allCookies.forEach((cookie) => {
      const name = cookie.name;
      // Delete the cookie
      response.cookies.delete(name);
      // Also set it to expire immediately
      response.cookies.set(name, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    });
    
    // Explicitly clear known NextAuth cookie names
    cookieNames.forEach((name) => {
      response.cookies.delete(name);
      response.cookies.set(name, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain: undefined, // Clear for current domain
      });
    });
    
    return response;
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}

