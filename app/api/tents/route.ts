import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse, apiError } from '@/lib/api-utils';
import { withCache, cacheKey } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const slug = searchParams.get('slug');

    if (slug) {
      const tent = await prisma.tent.findUnique({
        where: { slug },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!tent) {
        return apiError('Tent not found', 404);
      }

      return apiResponse(tent);
    }

    const where: any = {};
    if (featured === 'true') {
      where.featured = true;
    }

    const tents = await prisma.tent.findMany({
      where,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    return apiResponse(tents);
  } catch (error) {
    console.error('Get tents error:', error);
    return apiError('Internal server error', 500);
  }
}

