import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const createSpecialDateSchema = z.object({
  name: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  multiplier: z.number().min(0).max(10),
  active: z.boolean().optional(),
});

const updateSpecialDateSchema = createSpecialDateSchema.partial();

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const year = searchParams.get('year');

    const where: any = {};
    if (active !== null) {
      where.active = active === 'true';
    }
    if (year) {
      const yearNum = parseInt(year);
      where.startDate = {
        gte: new Date(yearNum, 0, 1),
        lt: new Date(yearNum + 1, 0, 1),
      };
    }

    const specialDates = await prisma.specialDate.findMany({
      where,
      orderBy: {
        startDate: 'asc',
      },
    });

    return apiResponse({ specialDates });
  } catch (error) {
    console.error('Get special dates error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = createSpecialDateSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;
    const specialDate = await prisma.specialDate.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        active: data.active ?? true,
      },
    });

    return apiResponse(specialDate, 201, 'Special date created successfully');
  } catch (error) {
    console.error('Create special date error:', error);
    return apiError('Internal server error', 500);
  }
}

