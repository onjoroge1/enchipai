/**
 * Integration tests for booking flow
 * These tests verify the complete booking process from tent selection to confirmation
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
    booking: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    tent: {
      findUnique: jest.fn(),
    },
    guestInfo: {
      create: jest.fn(),
    },
    addOn: {
      createMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/email-templates', () => ({
  sendBookingConfirmationTemplate: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/lib/notifications', () => ({
  createNotification: jest.fn().mockResolvedValue({}),
}));

jest.mock('next-auth', () => ({
  default: jest.fn(),
}));

import { POST as createBooking } from '@/app/api/bookings/route';
import { GET as getBookings } from '@/app/api/bookings/route';
import { NextRequest } from 'next/server';

describe('Booking Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Booking Flow', () => {
    it('should create a booking and return confirmation', async () => {
      const { prisma } = require('@/lib/prisma');

      // Mock tent lookup
      prisma.tent.findUnique.mockResolvedValue({
        id: 'tent-123',
        name: 'Ndovu Tent',
        price: 650,
      });

      // Mock no conflicting bookings
      prisma.booking.findMany.mockResolvedValue([]);

      // Mock booking creation
      prisma.booking.create.mockResolvedValue({
        id: 'booking-123',
        bookingNumber: 'BK-123',
        tentId: 'tent-123',
        userId: 'user-123',
        checkIn: new Date('2026-02-01'),
        checkOut: new Date('2026-02-05'),
        totalAmount: 2600,
        status: 'PENDING',
      });

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          cookie: 'next-auth.session-token=valid-token',
        },
        body: JSON.stringify({
          tentId: 'tent-123',
          checkIn: '2026-02-01',
          checkOut: '2026-02-05',
          adults: 2,
          children: 0,
          guestInfo: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '+1234567890',
          },
        }),
      });

      // Mock authentication
      const { requireAuth } = require('@/lib/api-utils');
      requireAuth.mockResolvedValue({
        user: { id: 'user-123', email: 'john@example.com' },
        session: {},
      });

      const response = await createBooking(request);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('id');
    });

    it('should prevent double booking', async () => {
      const { prisma } = require('@/lib/prisma');

      prisma.tent.findUnique.mockResolvedValue({
        id: 'tent-123',
        name: 'Ndovu Tent',
        price: 650,
      });

      // Mock existing booking
      prisma.booking.findMany.mockResolvedValue([
        {
          id: 'existing-booking',
          checkIn: new Date('2026-02-01'),
          checkOut: new Date('2026-02-05'),
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          cookie: 'next-auth.session-token=valid-token',
        },
        body: JSON.stringify({
          tentId: 'tent-123',
          checkIn: '2026-02-01',
          checkOut: '2026-02-05',
          adults: 2,
          children: 0,
          guestInfo: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          },
        }),
      });

      const { requireAuth } = require('@/lib/api-utils');
      requireAuth.mockResolvedValue({
        user: { id: 'user-123' },
        session: {},
      });

      const response = await createBooking(request);
      const body = await response.json();

      expect(response.status).toBe(409);
      expect(body.success).toBe(false);
      expect(body.message).toContain('not available');
    });
  });

  describe('Get User Bookings', () => {
    it('should retrieve user bookings', async () => {
      const { prisma } = require('@/lib/prisma');

      prisma.booking.findMany.mockResolvedValue([
        {
          id: 'booking-1',
          bookingNumber: 'BK-001',
          tent: {
            id: 'tent-123',
            name: 'Ndovu Tent',
          },
          checkIn: new Date('2026-02-01'),
          checkOut: new Date('2026-02-05'),
          totalAmount: 2600,
          status: 'CONFIRMED',
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/bookings', {
        method: 'GET',
        headers: {
          cookie: 'next-auth.session-token=valid-token',
        },
      });

      const { requireAuth } = require('@/lib/api-utils');
      requireAuth.mockResolvedValue({
        user: { id: 'user-123' },
        session: {},
      });

      const response = await getBookings(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });
});

