import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    // Get all items grouped by category
    const allItems = await prisma.inventoryItem.findMany({
      select: {
        category: true,
        quantity: true,
        minStock: true,
        cost: true,
      },
    });

    // Group by category
    const categoryMap = new Map<string, {
      items: number;
      totalValue: number;
      totalQuantity: number;
      totalMinStock: number;
    }>();

    allItems.forEach((item) => {
      const existing = categoryMap.get(item.category) || {
        items: 0,
        totalValue: 0,
        totalQuantity: 0,
        totalMinStock: 0,
      };

      existing.items += 1;
      existing.totalQuantity += item.quantity;
      existing.totalMinStock += item.minStock;
      
      if (item.cost) {
        existing.totalValue += Number(item.cost) * item.quantity;
      }

      categoryMap.set(item.category, existing);
    });

    // Calculate stock level percentage for each category
    const categories = Array.from(categoryMap.entries()).map(([name, data]) => {
      // Stock level = (total quantity / total min stock) * 100, capped at 100%
      const stockLevel = data.totalMinStock > 0
        ? Math.min(100, Math.round((data.totalQuantity / data.totalMinStock) * 100))
        : 100;

      return {
        name,
        items: data.items,
        value: data.totalValue,
        stockLevel,
      };
    });

    return apiResponse({ categories });
  } catch (error) {
    console.error('Get inventory categories error:', error);
    return apiError('Internal server error', 500);
  }
}

