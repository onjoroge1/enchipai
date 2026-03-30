import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const createBookingSchema = z.object({
  userId: z.string(),
  tentId: z.string(),
  checkIn: z.string().transform((str) => new Date(str)),
  checkOut: z.string().transform((str) => new Date(str)),
  adults: z.number().min(1),
  children: z.number().min(0).default(0),
  specialRequests: z.string().optional(),
  addOns: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
    quantity: z.number().min(1).default(1),
  })).optional(),
  guestInfo: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    nationality: z.string().optional(),
    age: z.number().min(1).max(120).optional(),
    travelPurpose: z.string().optional(),
    passportNumber: z.string().optional(),
    dietaryRequirements: z.string().optional(),
    medicalInfo: z.string().optional(),
    emergencyContact: z.string().optional(),
  }),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { bookingNumber: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { tent: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (startDate || endDate) {
      // Find bookings that overlap with the date range
      // A booking overlaps if: checkIn <= endDate AND checkOut >= startDate
      if (startDate && endDate) {
        where.OR = [
          {
            AND: [
              { checkIn: { lte: new Date(endDate) } },
              { checkOut: { gte: new Date(startDate) } },
            ],
          },
        ];
      } else if (startDate) {
        where.checkOut = { gte: new Date(startDate) };
      } else if (endDate) {
        where.checkIn = { lte: new Date(endDate) };
      }
    }

    // Build include object
    const include: any = {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      tent: {
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
        },
      },
      guestInfo: true,
      addOns: true,
      invoice: true,
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.booking.count({ where }),
    ]);

    return apiResponse({
      bookings,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = createBookingSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      return apiError('User not found', 404);
    }

    // Check tent availability
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        tentId: data.tentId,
        status: {
          notIn: ['CANCELLED'],
        },
        OR: [
          {
            checkIn: { lte: data.checkOut },
            checkOut: { gte: data.checkIn },
          },
        ],
      },
    });

    if (conflictingBookings.length > 0) {
      return apiError('Tent is not available for the selected dates', 409);
    }

    // Get tent price
    const tent = await prisma.tent.findUnique({
      where: { id: data.tentId },
    });

    if (!tent) {
      return apiError('Tent not found', 404);
    }

    // Calculate total
    const nights = Math.ceil(
      (data.checkOut.getTime() - data.checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    const tentTotal = Number(tent.price) * nights;
    const addOnsTotal = (data.addOns || []).reduce(
      (sum, addOn) => sum + addOn.price * addOn.quantity,
      0
    );
    const totalAmount = tentTotal + addOnsTotal;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: data.userId,
        tentId: data.tentId,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        guests: data.adults + data.children,
        adults: data.adults,
        children: data.children,
        totalAmount,
        specialRequests: data.specialRequests,
        addOns: {
          create: data.addOns || [],
        },
        guestInfo: {
          create: data.guestInfo,
        },
      },
      include: {
        tent: true,
        guestInfo: true,
        addOns: true,
        user: true,
      },
    });

    // Send booking confirmation email
    try {
      const { sendBookingConfirmationTemplate } = await import('@/lib/email-templates');
      await sendBookingConfirmationTemplate(data.guestInfo.email, {
        bookingNumber: booking.bookingNumber || booking.id.slice(0, 8).toUpperCase(),
        guestName: `${data.guestInfo.firstName} ${data.guestInfo.lastName}`,
        tentName: booking.tent.name,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights,
        totalAmount: Number(booking.totalAmount),
      });
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    // Create notification for the user
    try {
      const { createNotification } = await import('@/lib/notifications');
      await createNotification({
        userId: data.userId,
        type: 'BOOKING_CONFIRMED',
        title: 'Booking Confirmed',
        message: `Your booking for ${booking.tent.name} has been confirmed.`,
        bookingId: booking.id,
      });
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Don't fail the booking if notification fails
    }

    return apiResponse(booking, 201, 'Booking created successfully');
  } catch (error) {
    console.error('Create booking error:', error);
    return apiError('Internal server error', 500);
  }
}
