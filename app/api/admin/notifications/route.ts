import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';
import { NotificationType } from '@/lib/prisma-types';

const createNotificationSchema = z.object({
  userId: z.string().optional(),
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1),
  message: z.string().min(1),
  link: z.string().url().optional().or(z.literal('')),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (userId) where.userId = userId;
    if (type) where.type = type as NotificationType;
    if (unreadOnly) where.read = false;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
    ]);

    return apiResponse({
      notifications,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = createNotificationSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;

    // If userId is not provided, send to all users
    if (!data.userId) {
      const users = await prisma.user.findMany({
        select: { id: true },
      });

      const notifications = await Promise.all(
        users.map((user) =>
          prisma.notification.create({
            data: {
              userId: user.id,
              type: data.type,
              title: data.title,
              message: data.message,
              link: data.link || null,
            },
          })
        )
      );

      return apiResponse(notifications, 201, `Notification sent to ${notifications.length} users`);
    }

    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link || null,
      },
    });

    return apiResponse(notification, 201, 'Notification created successfully');
  } catch (error) {
    console.error('Create notification error:', error);
    return apiError('Internal server error', 500);
  }
}

