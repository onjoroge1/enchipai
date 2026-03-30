import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';
import { BookingStatus } from '@/lib/prisma-types';

const createExperienceBookingSchema = z.object({
  experienceId: z.string().min(1),
  bookingId: z.string().optional(),
  guestName: z.string().min(1),
  guestEmail: z.string().email(),
  date: z.string().datetime(),
  participants: z.number().min(1).default(1),
  totalAmount: z.number().min(0),
  status: z.nativeEnum(BookingStatus).optional(),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('experienceId');
    const bookingId = searchParams.get('bookingId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (experienceId) where.experienceId = experienceId;
    if (bookingId) where.bookingId = bookingId;
    if (status) where.status = status as BookingStatus;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [bookings, total] = await Promise.all([
      prisma.experienceBooking.findMany({
        where,
        include: {
          experience: true,
        },
        orderBy: {
          date: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.experienceBooking.count({ where }),
    ]);

    return apiResponse({
      bookings,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get experience bookings error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = createExperienceBookingSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;
    const booking = await prisma.experienceBooking.create({
      data: {
        ...data,
        date: new Date(data.date),
        status: data.status || BookingStatus.PENDING,
      },
      include: {
        experience: true,
      },
    });

    return apiResponse(booking, 201, 'Experience booking created successfully');
  } catch (error) {
    console.error('Create experience booking error:', error);
    return apiError('Internal server error', 500);
  }
}

