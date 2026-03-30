import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';
import { SeasonType } from '@/lib/prisma-types';

const updateSeasonSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.nativeEnum(SeasonType).optional(),
  multiplier: z.number().min(0).max(10).optional(),
  active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const season = await prisma.season.findUnique({
      where: { id: params.id },
    });

    if (!season) {
      return apiError('Season not found', 404);
    }

    return apiResponse(season);
  } catch (error) {
    console.error('Get season error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = updateSeasonSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;
    const updateData: any = { ...data };
    
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    // Check for overlapping seasons if dates are being updated
    if (data.startDate || data.endDate) {
      const currentSeason = await prisma.season.findUnique({
        where: { id: params.id },
      });

      const startDate = data.startDate ? new Date(data.startDate) : currentSeason!.startDate;
      const endDate = data.endDate ? new Date(data.endDate) : currentSeason!.endDate;

      const overlapping = await prisma.season.findFirst({
        where: {
          id: { not: params.id },
          active: true,
          OR: [
            {
              startDate: { lte: endDate },
              endDate: { gte: startDate },
            },
          ],
        },
      });

      if (overlapping && (data.active !== false && currentSeason?.active !== false)) {
        return apiError('Season overlaps with existing active season', 409);
      }
    }

    const season = await prisma.season.update({
      where: { id: params.id },
      data: updateData,
    });

    return apiResponse(season, 200, 'Season updated successfully');
  } catch (error) {
    console.error('Update season error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    await prisma.season.delete({
      where: { id: params.id },
    });

    return apiResponse(null, 200, 'Season deleted successfully');
  } catch (error) {
    console.error('Delete season error:', error);
    return apiError('Internal server error', 500);
  }
}

