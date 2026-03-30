import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter
// For production, consider using Redis or a dedicated service
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  identifier?: (req: NextRequest) => string; // Custom identifier function
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, identifier } = options;

  return async (req: NextRequest): Promise<NextResponse | null> => {
    // Get identifier (IP address by default)
    const id = identifier
      ? identifier(req)
      : req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        'unknown';

    const now = Date.now();
    const record = rateLimitMap.get(id);

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      // 1% chance to clean up
      for (const [key, value] of rateLimitMap.entries()) {
        if (value.resetTime < now) {
          rateLimitMap.delete(key);
        }
      }
    }

    if (!record || record.resetTime < now) {
      // Create new record
      rateLimitMap.set(id, {
        count: 1,
        resetTime: now + windowMs,
      });
      return null; // Allow request
    }

    if (record.count >= maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
          },
        }
      );
    }

    // Increment count
    record.count++;
    return null; // Allow request
  };
}

// Pre-configured rate limiters
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 requests per 15 minutes
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
});

export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
});

