import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    // Get total active experiences
    const activeExperiences = await prisma.experience.count({
      where: { available: true },
    });

    // Get bookings this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const bookingsThisWeek = await prisma.experienceBooking.count({
      where: {
        date: {
          gte: startOfWeek,
        },
        status: {
          notIn: ['CANCELLED'],
        },
      },
    });

    // Get bookings last week for comparison
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    const bookingsLastWeek = await prisma.experienceBooking.count({
      where: {
        date: {
          gte: startOfLastWeek,
          lt: startOfWeek,
        },
        status: {
          notIn: ['CANCELLED'],
        },
      },
    });

    const bookingsChange = bookingsLastWeek > 0
      ? bookingsThisWeek - bookingsLastWeek
      : bookingsThisWeek;

    // Get total guests participating (sum of participants)
    const totalParticipants = await prisma.experienceBooking.aggregate({
      where: {
        status: {
          notIn: ['CANCELLED'],
        },
      },
      _sum: {
        participants: true,
      },
    });

    const guestsParticipating = totalParticipants._sum.participants || 0;

    // Get revenue this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueThisMonth = await prisma.experienceBooking.aggregate({
      where: {
        date: {
          gte: startOfMonth,
        },
        status: {
          notIn: ['CANCELLED'],
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Get revenue last month for comparison
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const revenueLastMonth = await prisma.experienceBooking.aggregate({
      where: {
        date: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
        status: {
          notIn: ['CANCELLED'],
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    const revenueThisMonthValue = Number(revenueThisMonth._sum.totalAmount || 0);
    const revenueLastMonthValue = Number(revenueLastMonth._sum.totalAmount || 0);
    const revenueChangePercent = revenueLastMonthValue > 0
      ? Math.round(((revenueThisMonthValue - revenueLastMonthValue) / revenueLastMonthValue) * 100)
      : revenueThisMonthValue > 0 ? 100 : 0;

    return apiResponse({
      activeExperiences,
      bookingsThisWeek,
      bookingsChange,
      guestsParticipating,
      revenueThisMonth: revenueThisMonthValue,
      revenueChangePercent,
    });
  } catch (error) {
    console.error('Get experience stats error:', error);
    return apiError('Internal server error', 500);
  }
}

