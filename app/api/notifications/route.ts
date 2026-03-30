import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, apiResponse, apiError } from '@/lib/api-utils';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  try {
    const token = await getToken({ req: request });
    if (!token?.sub) {
      return apiError('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {
      userId: token.sub,
    };

    if (unreadOnly) {
      where.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: token.sub,
          read: false,
        },
      }),
    ]);

    return apiResponse({
      notifications,
      total,
      unreadCount,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  try {
    const token = await getToken({ req: request });
    if (!token?.sub) {
      return apiError('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const markAllRead = searchParams.get('markAllRead') === 'true';

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: {
          userId: token.sub,
          read: false,
        },
        data: {
          read: true,
        },
      });

      return apiResponse(null, 200, 'All notifications marked as read');
    }

    return apiError('Invalid request', 400);
  } catch (error) {
    console.error('Update notifications error:', error);
    return apiError('Internal server error', 500);
  }
}

