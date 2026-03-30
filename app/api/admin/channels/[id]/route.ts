import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const updateChannelSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['BOOKING_COM', 'AIRBNB', 'EXPEDIA', 'CUSTOM']).optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  webhookUrl: z.string().url().optional().or(z.literal('')),
  syncEnabled: z.boolean().optional(),
  settings: z.any().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = await params;
    const channel = await prisma.channel.findUnique({
      where: { id },
    });

    if (!channel) {
      return apiError('Channel not found', 404);
    }

    return apiResponse(channel);
  } catch (error) {
    console.error('Get channel error:', error);
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

    const validationResult = updateChannelSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const channel = await prisma.channel.update({
      where: { id },
      data: validationResult.data,
    });

    return apiResponse(channel, 200, 'Channel updated successfully');
  } catch (error) {
    console.error('Update channel error:', error);
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
    await prisma.channel.delete({
      where: { id },
    });

    return apiResponse(null, 200, 'Channel deleted successfully');
  } catch (error) {
    console.error('Delete channel error:', error);
    return apiError('Internal server error', 500);
  }
}

/**
 * Sync availability with channel
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = await params;
    const channel = await prisma.channel.findUnique({
      where: { id },
    });

    if (!channel) {
      return apiError('Channel not found', 404);
    }

    if (!channel.syncEnabled) {
      return apiError('Channel sync is not enabled', 400);
    }

    // Get all available tents and their availability
    const tents = await prisma.tent.findMany({
      where: {
        status: {
          notIn: ['UNAVAILABLE'],
        },
      },
      include: {
        bookings: {
          where: {
            status: {
              notIn: ['CANCELLED'],
            },
          },
          select: {
            checkIn: true,
            checkOut: true,
          },
        },
      },
    });

    // Calculate availability for next 365 days
    const availability: Array<{
      tentId: string;
      tentName: string;
      dates: Array<{ date: string; available: boolean }>;
    }> = [];

    const today = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 365);

    for (const tent of tents) {
      const dates: Array<{ date: string; available: boolean }> = [];
      const bookedDates = new Set<string>();

      // Mark booked dates
      tent.bookings.forEach((booking) => {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
          bookedDates.add(d.toISOString().split('T')[0]);
        }
      });

      // Generate availability for each date
      for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dates.push({
          date: dateStr,
          available: !bookedDates.has(dateStr),
        });
      }

      availability.push({
        tentId: tent.id,
        tentName: tent.name,
        dates,
      });
    }

    // Update last sync time
    await prisma.channel.update({
      where: { id },
      data: { lastSyncAt: new Date() },
    });

    // In a real implementation, you would send this data to the channel's API
    // For now, we'll just return the availability data
    return apiResponse({
      channelId: id,
      channelName: channel.name,
      syncedAt: new Date(),
      availability,
      summary: {
        totalTents: tents.length,
        totalDates: availability[0]?.dates.length || 0,
        availableDates: availability.reduce(
          (sum, tent) => sum + tent.dates.filter((d) => d.available).length,
          0
        ),
      },
    }, 200, 'Availability synced successfully');
  } catch (error) {
    console.error('Sync channel error:', error);
    return apiError('Internal server error', 500);
  }
}

