import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError } from '@/lib/api-utils';
import { TransferType, TransferStatus } from '@/lib/prisma-types';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get transfers today
    const transfersToday = await prisma.transfer.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          notIn: ['CANCELLED'],
        },
      },
    });

    // Get arrivals and departures today
    const arrivalsToday = await prisma.transfer.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        type: TransferType.AIRPORT_PICKUP,
        status: {
          notIn: ['CANCELLED'],
        },
      },
    });

    const departuresToday = await prisma.transfer.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        type: TransferType.AIRPORT_DROPOFF,
        status: {
          notIn: ['CANCELLED'],
        },
      },
    });

    // Get active vehicles (vehicles assigned to transfers today or in progress)
    const activeTransfers = await prisma.transfer.findMany({
      where: {
        vehicle: {
          not: null,
        },
        status: {
          in: [TransferStatus.SCHEDULED, TransferStatus.IN_PROGRESS],
        },
        date: {
          lte: tomorrow,
        },
      },
      select: {
        vehicle: true,
      },
      distinct: ['vehicle'],
    });

    const activeVehicles = activeTransfers.length;

    // Placeholder for fuel and maintenance (these would need separate tables)
    // For now, return 0 or placeholder values
    const fuelThisMonth = 0; // Would need a fuel tracking table
    const dueForService = 0; // Would need a vehicle maintenance table

    return apiResponse({
      transfersToday,
      arrivalsToday,
      departuresToday,
      activeVehicles,
      fuelThisMonth,
      dueForService,
    });
  } catch (error) {
    console.error('Get transfer stats error:', error);
    return apiError('Internal server error', 500);
  }
}

