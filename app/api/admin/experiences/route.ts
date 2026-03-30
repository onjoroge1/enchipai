import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const createExperienceSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  price: z.number().min(0),
  duration: z.string().optional(),
  capacity: z.number().min(1).optional(),
  available: z.boolean().default(true),
});

const updateExperienceSchema = createExperienceSchema.partial();

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const available = searchParams.get('available');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (available !== null) {
      where.available = available === 'true';
    }

    const [experiences, total] = await Promise.all([
      prisma.experience.findMany({
        where,
        include: {
          bookings: {
            select: {
              id: true,
              date: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.experience.count({ where }),
    ]);

    return apiResponse({
      experiences,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get experiences error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = createExperienceSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;

    // Generate slug if not provided
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Check if slug exists
    const existingExperience = await prisma.experience.findUnique({
      where: { slug },
    });

    if (existingExperience) {
      return apiError('Experience with this slug already exists', 409);
    }

    const experience = await prisma.experience.create({
      data: {
        ...data,
        slug,
      },
    });

    return apiResponse(experience, 201, 'Experience created successfully');
  } catch (error) {
    console.error('Create experience error:', error);
    return apiError('Internal server error', 500);
  }
}

