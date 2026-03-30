import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const updateSpecialDateSchema = z.object({
  name: z.string().min(1).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
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
    const specialDate = await prisma.specialDate.findUnique({
      where: { id: params.id },
    });

    if (!specialDate) {
      return apiError('Special date not found', 404);
    }

    return apiResponse(specialDate);
  } catch (error) {
    console.error('Get special date error:', error);
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

    const validationResult = updateSpecialDateSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;
    const updateData: any = { ...data };
    
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    const specialDate = await prisma.specialDate.update({
      where: { id: params.id },
      data: updateData,
    });

    return apiResponse(specialDate, 200, 'Special date updated successfully');
  } catch (error) {
    console.error('Update special date error:', error);
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
    await prisma.specialDate.delete({
      where: { id: params.id },
    });

    return apiResponse(null, 200, 'Special date deleted successfully');
  } catch (error) {
    console.error('Delete special date error:', error);
    return apiError('Internal server error', 500);
  }
}

