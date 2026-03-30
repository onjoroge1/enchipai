import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export default async function middleware(req: any) {
  // Use getToken instead of auth() to avoid Prisma import in edge runtime
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth');
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');

  // Allow public routes
  if (!isAdminRoute && !isDashboardRoute && !isAuthRoute && !isApiRoute) {
    return NextResponse.next();
  }

  // Allow auth routes
  if (isAuthRoute) {
    return NextResponse.next();
  }

  // Protect admin routes - strict check
  if (isAdminRoute) {
    // Check if token exists and is valid
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin?error=Unauthorized', req.url));
    }
    
    // Check if token has required role
    const role = token.role as string;
    if (role !== 'ADMIN' && role !== 'STAFF') {
      return NextResponse.redirect(new URL('/auth/signin?error=Unauthorized', req.url));
    }
  }

  // Protect dashboard routes
  if (isDashboardRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/api/:path*',
  ],
};

