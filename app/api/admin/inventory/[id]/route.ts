import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const updateInventoryItemSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  unit: z.string().optional(),
  quantity: z.number().min(0).optional(),
  minStock: z.number().min(0).optional(),
  cost: z.number().min(0).optional(),
  supplier: z.string().optional(),
  description: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = await params;
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!item) {
      return apiError('Inventory item not found', 404);
    }

    const isLowStock = item.quantity <= item.minStock;

    return apiResponse({
      ...item,
      isLowStock,
    });
  } catch (error) {
    console.error('Get inventory item error:', error);
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

    const validationResult = updateInventoryItemSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: validationResult.data,
    });

    return apiResponse(item, 200, 'Inventory item updated successfully');
  } catch (error) {
    console.error('Update inventory item error:', error);
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
    await prisma.inventoryItem.delete({
      where: { id },
    });

    return apiResponse(null, 200, 'Inventory item deleted successfully');
  } catch (error) {
    console.error('Delete inventory item error:', error);
    return apiError('Internal server error', 500);
  }
}

