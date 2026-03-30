import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Total guests
    const totalGuests = await prisma.user.count({
      where: { role: 'GUEST' },
    });

    // Active this month (guests with bookings this month)
    const activeThisMonth = await prisma.user.count({
      where: {
        role: 'GUEST',
        bookings: {
          some: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        },
      },
    });

    // Returning guests (guests with 2+ bookings)
    const allGuests = await prisma.user.findMany({
      where: { role: 'GUEST' },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    const returningGuests = allGuests.filter((g) => g._count.bookings >= 2).length;

    // Average rating (if you have a rating system, otherwise calculate from reviews/feedback)
    // For now, we'll calculate a mock rating based on returning guest percentage
    const avgRating = totalGuests > 0 
      ? (4.5 + (returningGuests / totalGuests) * 0.5).toFixed(1)
      : '0.0';

    // Calculate percentage changes (mock for now, could be improved with historical data)
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const previousMonthActive = await prisma.user.count({
      where: {
        role: 'GUEST',
        bookings: {
          some: {
            createdAt: {
              gte: previousMonthStart,
              lte: previousMonthEnd,
            },
          },
        },
      },
    });

    const activeChange = previousMonthActive > 0
      ? `+${((activeThisMonth - previousMonthActive) / previousMonthActive * 100).toFixed(0)}%`
      : activeThisMonth > 0 ? `+${activeThisMonth}` : '0';

    const returningPercentage = totalGuests > 0
      ? ((returningGuests / totalGuests) * 100).toFixed(0)
      : '0';

    return apiResponse({
      totalGuests,
      activeThisMonth,
      activeChange,
      returningGuests,
      returningPercentage: `${returningPercentage}%`,
      avgRating,
    });
  } catch (error) {
    console.error('Get guest stats error:', error);
    return apiError('Internal server error', 500);
  }
}

