import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PARTIAL', 'PAID', 'REFUNDED', 'FAILED']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        tent: true,
        guestInfo: true,
        addOns: true,
        invoice: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!booking) {
      return apiError('Booking not found', 404);
    }

    return apiResponse(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = await params;
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = updateBookingSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: validationResult.data,
      include: {
        user: true,
        tent: true,
        guestInfo: true,
        addOns: true,
        invoice: true,
      },
    });

    return apiResponse(booking, 200, 'Booking updated successfully');
  } catch (error) {
    console.error('Update booking error:', error);
    return apiError('Internal server error', 500);
  }
}

