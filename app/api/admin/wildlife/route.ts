import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const createSightingSchema = z.object({
  species: z.string().min(1),
  location: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  date: z.string().datetime().optional(),
  guideName: z.string().optional(),
});

const updateSightingSchema = createSightingSchema.partial();

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const species = searchParams.get('species');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (species) {
      where.species = { contains: species, mode: 'insensitive' };
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [sightings, total] = await Promise.all([
      prisma.wildlifeSighting.findMany({
        where,
        orderBy: {
          date: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.wildlifeSighting.count({ where }),
    ]);

    return apiResponse({
      sightings,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get wildlife sightings error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = createSightingSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;
    const sighting = await prisma.wildlifeSighting.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });

    return apiResponse(sighting, 201, 'Wildlife sighting created successfully');
  } catch (error) {
    console.error('Create wildlife sighting error:', error);
    return apiError('Internal server error', 500);
  }
}

