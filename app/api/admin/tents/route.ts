import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const createTentSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  tagline: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  price: z.number().min(0),
  size: z.string().optional(),
  bed: z.string().optional(),
  guests: z.number().min(1).default(2),
  amenities: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  displayOrder: z.number().default(0),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'UNAVAILABLE']).default('AVAILABLE'),
});

const updateTentSchema = createTentSchema.partial();

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const tents = await prisma.tent.findMany({
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        bookings: {
          where: {
            status: {
              notIn: ['CANCELLED', 'CHECKED_OUT'],
            },
          },
          select: {
            id: true,
            checkIn: true,
            checkOut: true,
            status: true,
          },
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

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = createTentSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    // Check if slug exists
    const existingTent = await prisma.tent.findUnique({
      where: { slug: validationResult.data.slug },
    });

    if (existingTent) {
      return apiError('Tent with this slug already exists', 409);
    }

    const tent = await prisma.tent.create({
      data: validationResult.data,
      include: {
        images: true,
      },
    });

    return apiResponse(tent, 201, 'Tent created successfully');
  } catch (error) {
    console.error('Create tent error:', error);
    return apiError('Internal server error', 500);
  }
}

