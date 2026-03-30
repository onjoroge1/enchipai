/**
 * Integration tests for admin workflows
 * Tests CRUD operations for admin features
 */

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

// Mock api-utils functions
jest.mock('@/lib/api-utils', () => {
  const actual = jest.requireActual('@/lib/api-utils');
  return {
    ...actual,
    requireAuth: jest.fn(),
    requireAdmin: jest.fn(),
  };
});

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    tent: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    blogPost: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('next-auth', () => ({
  default: jest.fn(),
}));

import { POST as createTent } from '@/app/api/admin/tents/route';
import { GET as getTents } from '@/app/api/admin/tents/route';
import { POST as createBlog } from '@/app/api/admin/blog/route';
import { NextRequest } from 'next/server';

describe('Admin Workflows Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Tent Management', () => {
    it('should create a new tent', async () => {
      const { prisma } = require('@/lib/prisma');

      prisma.tent.findUnique.mockResolvedValue(null); // Slug doesn't exist
      prisma.tent.create.mockResolvedValue({
        id: 'tent-123',
        name: 'New Tent',
        slug: 'new-tent',
        price: 500,
      });

      const request = new NextRequest('http://localhost:3000/api/admin/tents', {
        method: 'POST',
        headers: {
          cookie: 'next-auth.session-token=admin-token',
        },
        body: JSON.stringify({
          name: 'New Tent',
          slug: 'new-tent',
          description: 'A beautiful tent',
          price: 500,
          capacity: 2,
        }),
      });

      const { requireAdmin } = require('@/lib/api-utils');
      requireAdmin.mockResolvedValue({
        user: { id: 'admin-123', role: 'ADMIN' },
        session: {},
      });

      const response = await createTent(request);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('New Tent');
    });

    it('should list all tents with pagination', async () => {
      const { prisma } = require('@/lib/prisma');

      prisma.tent.findMany.mockResolvedValue([
        { id: 'tent-1', name: 'Tent 1' },
        { id: 'tent-2', name: 'Tent 2' },
      ]);
      prisma.tent.count.mockResolvedValue(2);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/tents?limit=10&offset=0',
        {
          method: 'GET',
          headers: {
            cookie: 'next-auth.session-token=admin-token',
          },
        }
      );

      const { requireAdmin } = require('@/lib/api-utils');
      requireAdmin.mockResolvedValue({
        user: { id: 'admin-123', role: 'ADMIN' },
        session: {},
      });

      const response = await getTents(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toHaveLength(2);
    });
  });

  describe('Blog Management', () => {
    it('should create a blog post', async () => {
      const { prisma } = require('@/lib/prisma');

      prisma.blogPost.findUnique.mockResolvedValue(null); // Slug doesn't exist
      prisma.blogPost.create.mockResolvedValue({
        id: 'post-123',
        title: 'New Post',
        slug: 'new-post',
        content: 'Content here',
        status: 'DRAFT',
      });

      const request = new NextRequest('http://localhost:3000/api/admin/blog', {
        method: 'POST',
        headers: {
          cookie: 'next-auth.session-token=admin-token',
        },
        body: JSON.stringify({
          title: 'New Post',
          slug: 'new-post',
          content: 'Content here',
          category: 'News',
          authorName: 'Admin',
        }),
      });

      const { requireAdmin } = require('@/lib/api-utils');
      requireAdmin.mockResolvedValue({
        user: { id: 'admin-123', role: 'ADMIN' },
        session: {},
      });

      const response = await createBlog(request);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('New Post');
    });
  });
});

