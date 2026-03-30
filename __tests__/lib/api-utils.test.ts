// Mock lib/auth before any imports
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
  handlers: {},
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock Next.js server components
jest.mock('next/server', () => ({
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

import { apiResponse, apiError, handleValidationError } from '@/lib/api-utils';
import { ZodError } from 'zod';

describe('API Utils', () => {
  describe('apiResponse', () => {
    it('should create a successful response', () => {
      const response = apiResponse({ data: 'test' }, 200, 'Success');
      expect(response.status).toBe(200);
    });

    it('should include success flag', async () => {
      const response = apiResponse({ data: 'test' });
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual({ data: 'test' });
    });

    it('should include message when provided', async () => {
      const response = apiResponse({}, 201, 'Created');
      const body = await response.json();
      expect(body.message).toBe('Created');
    });
  });

  describe('apiError', () => {
    it('should create an error response', () => {
      const response = apiError('Test error', 400);
      expect(response.status).toBe(400);
    });

    it('should include success flag as false', async () => {
      const response = apiError('Test error');
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.message).toBe('Test error');
    });

    it('should include errors when provided', async () => {
      const errors = [{ field: 'email', message: 'Invalid email' }];
      const response = apiError('Validation failed', 400, errors);
      const body = await response.json();
      expect(body.errors).toEqual(errors);
    });
  });

  describe('handleValidationError', () => {
    it('should format Zod validation errors', async () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['email'],
          message: 'Expected string, received number',
        },
      ]);

      const response = handleValidationError(zodError);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.message).toBe('Validation failed');
      expect(body.errors).toHaveLength(1);
      expect(body.errors[0].path).toBe('email');
    });
  });
});

