import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse, apiError } from '@/lib/api-utils';

/**
 * GET /api/experiences - Public endpoint to fetch available experiences
 * Used by the booking form to show add-on options
 */
export async function GET(request: NextRequest) {
  try {
    const experiences = await prisma.experience.findMany({
      where: { available: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        duration: true,
        image: true,
      },
      orderBy: { name: 'asc' },
    });

    return apiResponse(experiences);
  } catch (error) {
    console.error('Get experiences error:', error);
    return apiError('Internal server error', 500);
  }
}
