import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse, apiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tentId = searchParams.get('tentId');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');

    if (!tentId || !checkIn || !checkOut) {
      return apiError('Missing required parameters: tentId, checkIn, checkOut', 400);
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Check for conflicting bookings
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        tentId,
        status: {
          notIn: ['CANCELLED'],
        },
        OR: [
          {
            checkIn: { lte: checkOutDate },
            checkOut: { gte: checkInDate },
          },
        ],
      },
    });

    const available = conflictingBookings.length === 0;

    return apiResponse({
      available,
      conflictingBookings: conflictingBookings.length,
    });
  } catch (error) {
    console.error('Check availability error:', error);
    return apiError('Internal server error', 500);
  }
}

