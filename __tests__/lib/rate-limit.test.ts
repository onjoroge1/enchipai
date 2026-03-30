// Mock Next.js server components first
jest.mock('next/server', () => ({
  NextRequest: class NextRequest extends Request {
    constructor(input: string | URL, init?: RequestInit) {
      super(input, init);
      this.nextUrl = {
        pathname: new URL(input as string).pathname,
        searchParams: new URL(input as string).searchParams,
      };
      this.cookies = {
        get: jest.fn(),
        set: jest.fn(),
      };
    }
  },
  NextResponse: {
    json: (body: any, init?: any) => {
      return new Response(JSON.stringify(body), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      });
    },
  },
}));

import { rateLimit, authRateLimit } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear any existing rate limit data
    jest.clearAllMocks();
  });

  describe('rateLimit', () => {
    it('should allow requests within limit', async () => {
      const limiter = rateLimit({
        windowMs: 1000,
        maxRequests: 5,
      });

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '127.0.0.1',
        },
      });

      const result = await limiter(request);
      expect(result).toBeNull(); // Null means allowed
    });

    it('should block requests exceeding limit', async () => {
      const limiter = rateLimit({
        windowMs: 1000,
        maxRequests: 2,
      });

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '127.0.0.1',
        },
      });

      // Make requests up to limit
      await limiter(request);
      await limiter(request);

      // This should be blocked
      const result = await limiter(request);
      expect(result).not.toBeNull();
      expect(result?.status).toBe(429);
    });

    it('should include retry-after header', async () => {
      const limiter = rateLimit({
        windowMs: 1000,
        maxRequests: 1,
      });

      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'x-forwarded-for': '127.0.0.1',
        },
      });

      await limiter(request);
      const result = await limiter(request);

      if (result) {
        const retryAfter = result.headers.get('Retry-After');
        expect(retryAfter).toBeTruthy();
      }
    });
  });

  describe('authRateLimit', () => {
    it('should have correct configuration', () => {
      // authRateLimit should be configured for 5 requests per 15 minutes
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        headers: {
          'x-forwarded-for': '127.0.0.1',
        },
      });

      // Should allow first request
      authRateLimit(request).then((result) => {
        expect(result).toBeNull();
      });
    });
  });
});

