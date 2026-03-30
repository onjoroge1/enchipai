import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {
      role: 'GUEST',
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [guests, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          bookings: {
            include: {
              tent: {
                select: {
                  id: true,
                  name: true,
                },
              },
              guestInfo: {
                select: {
                  nationality: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 5,
          },
          preferences: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ]);

    return apiResponse({
      guests,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get guests error:', error);
    return apiError('Internal server error', 500);
  }
}

