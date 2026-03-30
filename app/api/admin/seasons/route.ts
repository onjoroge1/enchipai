import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';
import { SeasonType } from '@/lib/prisma-types';

const createSeasonSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  type: z.nativeEnum(SeasonType),
  multiplier: z.number().min(0).max(10),
  active: z.boolean().optional(),
});

const updateSeasonSchema = createSeasonSchema.partial();

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const type = searchParams.get('type');

    const where: any = {};
    if (active !== null) {
      where.active = active === 'true';
    }
    if (type) {
      where.type = type as SeasonType;
    }

    const seasons = await prisma.season.findMany({
      where,
      orderBy: {
        startDate: 'asc',
      },
    });

    return apiResponse({ seasons });
  } catch (error) {
    console.error('Get seasons error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = createSeasonSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;

    // Check for overlapping seasons
    const overlapping = await prisma.season.findFirst({
      where: {
        active: true,
        OR: [
          {
            startDate: { lte: new Date(data.endDate) },
            endDate: { gte: new Date(data.startDate) },
          },
        ],
      },
    });

    if (overlapping && data.active !== false) {
      return apiError('Season overlaps with existing active season', 409);
    }

    const season = await prisma.season.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        active: data.active ?? true,
      },
    });

    return apiResponse(season, 201, 'Season created successfully');
  } catch (error) {
    console.error('Create season error:', error);
    return apiError('Internal server error', 500);
  }
}

