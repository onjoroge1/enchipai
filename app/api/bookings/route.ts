import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { sendBookingConfirmationEmail } from '@/lib/email';
import { z } from 'zod';

const createBookingSchema = z.object({
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
    passportNumber: z.string().optional(),
    dietaryRequirements: z.string().optional(),
    medicalInfo: z.string().optional(),
    emergencyContact: z.string().optional(),
  }),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = { userId: authResult.user.id };
    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        tent: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            price: true,
          },
        },
        guestInfo: true,
        addOns: true,
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            total: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return apiResponse(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = createBookingSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;

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
        userId: authResult.user.id,
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
      },
    });

    // Send booking confirmation email using new template system
    try {
      const { sendBookingConfirmationTemplate } = await import('@/lib/email-templates');
      const nights = Math.ceil(
        (booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      await sendBookingConfirmationTemplate(data.guestInfo.email, {
        bookingNumber: booking.bookingNumber || booking.id.slice(0, 8).toUpperCase(),
        guestName: data.guestInfo.name || 'Guest',
        tentName: booking.tent.name,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights,
        totalAmount: Number(booking.totalAmount),
        bookingId: booking.id,
      });
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    // Create notification for the user
    try {
      const { createNotification } = await import('@/lib/notifications');
      if (authResult.user.id) {
        await createNotification({
          userId: authResult.user.id,
          type: 'BOOKING',
          title: 'Booking Confirmed',
          message: `Your booking for ${booking.tent.name} has been confirmed. Booking #${booking.bookingNumber || booking.id.slice(0, 8).toUpperCase()}`,
          link: `/bookings/${booking.id}/confirmation`,
        });
      }
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
      // Don't fail the booking if notification fails
    }

    return apiResponse(booking, 201, 'Booking created successfully');
  } catch (error) {
    console.error('Create booking error:', error);
    return apiError('Internal server error', 500);
  }
}

