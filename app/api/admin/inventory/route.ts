import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const createInventoryItemSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  unit: z.string().optional(), // e.g., "kg", "liters", "pieces"
  quantity: z.number().min(0),
  minStock: z.number().min(0),
  cost: z.number().min(0).optional(),
  supplier: z.string().optional(),
  description: z.string().optional(),
});

const updateInventoryItemSchema = createInventoryItemSchema.partial();

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock') === 'true';
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (lowStock) {
      // Get all items and filter in memory for low stock
      // Prisma doesn't support comparing two fields directly in where clause easily
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { supplier: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [allItems, totalCount] = await Promise.all([
      prisma.inventoryItem.findMany({
        where: lowStock ? undefined : where, // Fetch all if lowStock filter
        orderBy: {
          name: 'asc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.inventoryItem.count({ where: lowStock ? undefined : where }),
    ]);

    // Calculate low stock status and filter
    let items = allItems.map((item) => ({
      ...item,
      isLowStock: item.quantity <= item.minStock,
      stockPercentage: null, // No maxStock in schema
    }));

    // Apply low stock filter if requested
    if (lowStock) {
      items = items.filter((item) => item.isLowStock);
    }

    // Apply search filter if needed (already in where clause, but handle lowStock case)
    if (lowStock && search) {
      items = items.filter((item) => {
        const searchLower = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower) ||
          (item.supplier && item.supplier.toLowerCase().includes(searchLower))
        );
      });
    }

    const total = lowStock ? items.length : totalCount;

    return apiResponse({
      items,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get inventory items error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = createInventoryItemSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const item = await prisma.inventoryItem.create({
      data: validationResult.data,
    });

    return apiResponse(item, 201, 'Inventory item created successfully');
  } catch (error) {
    console.error('Create inventory item error:', error);
    return apiError('Internal server error', 500);
  }
}

