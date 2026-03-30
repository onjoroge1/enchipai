import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const updateSightingSchema = z.object({
  species: z.string().min(1).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  date: z.string().datetime().optional(),
  guideName: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const sighting = await prisma.wildlifeSighting.findUnique({
      where: { id: params.id },
    });

    if (!sighting) {
      return apiError('Wildlife sighting not found', 404);
    }

    return apiResponse(sighting);
  } catch (error) {
    console.error('Get wildlife sighting error:', error);
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

    const validationResult = updateSightingSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;
    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    const sighting = await prisma.wildlifeSighting.update({
      where: { id: params.id },
      data: updateData,
    });

    return apiResponse(sighting, 200, 'Wildlife sighting updated successfully');
  } catch (error) {
    console.error('Update wildlife sighting error:', error);
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
    await prisma.wildlifeSighting.delete({
      where: { id: params.id },
    });

    return apiResponse(null, 200, 'Wildlife sighting deleted successfully');
  } catch (error) {
    console.error('Delete wildlife sighting error:', error);
    return apiError('Internal server error', 500);
  }
}

