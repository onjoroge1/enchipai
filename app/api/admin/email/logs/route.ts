import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError } from '@/lib/api-utils';
import { EmailStatus } from '@/lib/prisma-types';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const templateId = searchParams.get('templateId');
    const status = searchParams.get('status');
    const to = searchParams.get('to');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (campaignId) where.campaignId = campaignId;
    if (templateId) where.templateId = templateId;
    if (status) where.status = status as EmailStatus;
    if (to) where.to = { contains: to, mode: 'insensitive' };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.emailLog.count({ where }),
    ]);

    // Calculate analytics
    const analytics = await prisma.emailLog.groupBy({
      by: ['status'],
      where: campaignId ? { campaignId } : templateId ? { templateId } : undefined,
      _count: true,
    });

    const openedCount = await prisma.emailLog.count({
      where: {
        ...where,
        openedAt: { not: null },
      },
    });

    const clickedCount = await prisma.emailLog.count({
      where: {
        ...where,
        clickedAt: { not: null },
      },
    });

    return apiResponse({
      logs,
      total,
      limit,
      offset,
      analytics: {
        byStatus: analytics.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
        openedCount,
        clickedCount,
      },
    });
  } catch (error) {
    console.error('Get email logs error:', error);
    return apiError('Internal server error', 500);
  }
}

