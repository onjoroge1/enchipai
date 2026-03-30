import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';
import { BookingStatus } from '@/lib/prisma-types';

const updateExperienceBookingSchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  participants: z.number().min(1).optional(),
  date: z.string().datetime().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = await params;
    const booking = await prisma.experienceBooking.findUnique({
      where: { id },
      include: {
        experience: true,
      },
    });

    if (!booking) {
      return apiError('Experience booking not found', 404);
    }

    return apiResponse(booking);
  } catch (error) {
    console.error('Get experience booking error:', error);
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

    const validationResult = updateExperienceBookingSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;
    const updateData: any = {};

    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.participants !== undefined) {
      updateData.participants = data.participants;
    }
    if (data.date !== undefined) {
      updateData.date = new Date(data.date);
    }

    const booking = await prisma.experienceBooking.update({
      where: { id },
      data: updateData,
      include: {
        experience: true,
      },
    });

    return apiResponse(booking, 200, 'Experience booking updated successfully');
  } catch (error) {
    console.error('Update experience booking error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = await params;
    
    // Instead of deleting, set status to CANCELLED
    const booking = await prisma.experienceBooking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
      },
    });

    return apiResponse(booking, 200, 'Experience booking cancelled successfully');
  } catch (error) {
    console.error('Cancel experience booking error:', error);
    return apiError('Internal server error', 500);
  }
}

