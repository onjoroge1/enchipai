import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { getToken } from 'next-auth/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  try {
    const token = await getToken({ req: request });
    if (!token?.sub) {
      return apiError('Unauthorized', 401);
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        userId: token.sub,
      },
    });

    if (!notification) {
      return apiError('Notification not found', 404);
    }

    // Mark as read when viewed
    if (!notification.read) {
      await prisma.notification.update({
        where: { id: params.id },
        data: { read: true },
      });
    }

    return apiResponse({
      ...notification,
      read: true,
    });
  } catch (error) {
    console.error('Get notification error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  try {
    const token = await getToken({ req: request });
    if (!token?.sub) {
      return apiError('Unauthorized', 401);
    }

    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const notification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        userId: token.sub,
      },
    });

    if (!notification) {
      return apiError('Notification not found', 404);
    }

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: {
        read: body.read !== undefined ? body.read : notification.read,
      },
    });

    return apiResponse(updated, 200, 'Notification updated successfully');
  } catch (error) {
    console.error('Update notification error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  try {
    const token = await getToken({ req: request });
    if (!token?.sub) {
      return apiError('Unauthorized', 401);
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        userId: token.sub,
      },
    });

    if (!notification) {
      return apiError('Notification not found', 404);
    }

    await prisma.notification.delete({
      where: { id: params.id },
    });

    return apiResponse(null, 200, 'Notification deleted successfully');
  } catch (error) {
    console.error('Delete notification error:', error);
    return apiError('Internal server error', 500);
  }
}

