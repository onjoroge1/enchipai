// Mock lib/auth before any imports
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
  handlers: {},
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

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

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    verificationToken: {
      create: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

jest.mock('@/lib/email', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/lib/rate-limit', () => ({
  authRateLimit: jest.fn().mockResolvedValue(null),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

jest.mock('next-auth', () => ({
  default: jest.fn(),
}));

import { POST } from '@/app/api/auth/register/route';
import { NextRequest } from 'next/server';

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    const { prisma } = require('@/lib/prisma');
    const bcrypt = require('bcryptjs');
    
    prisma.user.findUnique.mockResolvedValue(null); // User doesn't exist
    prisma.user.create.mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'GUEST',
      createdAt: new Date(),
    });
    prisma.verificationToken.create.mockResolvedValue({
      identifier: 'test@example.com',
      token: 'verification-token',
      expires: new Date(),
    });
    bcrypt.hash.mockResolvedValue('hashed_password');

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('should reject invalid email', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('should reject short password', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'short',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('should reject duplicate email', async () => {
    const { prisma } = require('@/lib/prisma');
    prisma.user.findUnique.mockResolvedValue({
      id: 'existing-user',
      email: 'test@example.com',
    });

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.success).toBe(false);
    expect(body.message).toContain('already exists');
  });
});

