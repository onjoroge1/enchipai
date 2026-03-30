import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';
import { TransferType, TransferStatus } from '@/lib/prisma-types';

const updateTransferSchema = z.object({
  type: z.nativeEnum(TransferType).optional(),
  from: z.string().min(1).optional(),
  to: z.string().min(1).optional(),
  date: z.string().datetime().optional(),
  time: z.string().optional(),
  vehicle: z.string().optional(),
  driver: z.string().optional(),
  guests: z.string().optional(),
  status: z.nativeEnum(TransferStatus).optional(),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = await params;
    const transfer = await prisma.transfer.findUnique({
      where: { id },
    });

    if (!transfer) {
      return apiError('Transfer not found', 404);
    }

    return apiResponse(transfer);
  } catch (error) {
    console.error('Get transfer error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = await params;
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = updateTransferSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;
    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    const transfer = await prisma.transfer.update({
      where: { id },
      data: updateData,
    });

    return apiResponse(transfer, 200, 'Transfer updated successfully');
  } catch (error) {
    console.error('Update transfer error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = await params;
    await prisma.transfer.delete({
      where: { id },
    });

    return apiResponse(null, 200, 'Transfer deleted successfully');
  } catch (error) {
    console.error('Delete transfer error:', error);
    return apiError('Internal server error', 500);
  }
}

