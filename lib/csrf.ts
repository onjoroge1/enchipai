import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(
  request: NextRequest,
  token?: string
): boolean {
  // Get token from header or body
  const headerToken = request.headers.get('x-csrf-token');
  const bodyToken = token;
  const requestToken = headerToken || bodyToken;

  if (!requestToken) {
    return false;
  }

  // Get session token from cookie
  const sessionToken = request.cookies.get('csrf-token')?.value;

  if (!sessionToken) {
    return false;
  }

  // Compare tokens using constant-time comparison
  return crypto.timingSafeEqual(
    Buffer.from(requestToken),
    Buffer.from(sessionToken)
  );
}

/**
 * CSRF protection middleware
 */
export function csrfProtection() {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return null;
    }

    // Skip CSRF for NextAuth routes (they handle their own CSRF)
    if (request.nextUrl.pathname.startsWith('/api/auth/')) {
      return null;
    }

    // Validate CSRF token
    const isValid = validateCSRFToken(request);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid CSRF token',
          error: 'CSRF token validation failed',
        },
        { status: 403 }
      );
    }

    return null; // Allow request
  };
}

/**
 * Set CSRF token in response
 */
export function setCSRFToken(response: NextResponse, token: string): NextResponse {
  response.cookies.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
  });
  return response;
}

