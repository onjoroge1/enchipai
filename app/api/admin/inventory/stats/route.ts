import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    // Get total items count
    const totalItems = await prisma.inventoryItem.count();

    // Get low stock items count (quantity <= minStock)
    const allItems = await prisma.inventoryItem.findMany({
      select: {
        quantity: true,
        minStock: true,
      },
    });

    const lowStockCount = allItems.filter((item) => item.quantity <= item.minStock).length;

    // Get total categories count
    const categories = await prisma.inventoryItem.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
    });
    const totalCategories = categories.length;

    // Calculate monthly spend (sum of cost * quantity for items with cost)
    const itemsWithCost = await prisma.inventoryItem.findMany({
      where: {
        cost: {
          not: null,
        },
      },
      select: {
        cost: true,
        quantity: true,
      },
    });

    const monthlySpend = itemsWithCost.reduce((sum, item) => {
      const cost = Number(item.cost || 0);
      return sum + cost * item.quantity;
    }, 0);

    // Get items added this month (for "Orders Pending" - this is a placeholder metric)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const itemsThisMonth = await prisma.inventoryItem.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    return apiResponse({
      totalItems,
      lowStockCount,
      totalCategories,
      monthlySpend,
      itemsThisMonth,
    });
  } catch (error) {
    console.error('Get inventory stats error:', error);
    return apiError('Internal server error', 500);
  }
}

