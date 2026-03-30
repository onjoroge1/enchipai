import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['ADMIN', 'STAFF', 'GUEST']).optional(),
  phone: z.string().optional().nullable(),
});

/**
 * GET /api/admin/users/[id] - Get user details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        bookings: {
          select: {
            id: true,
            checkIn: true,
            checkOut: true,
            status: true,
            totalAmount: true,
            tent: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      return apiError('User not found', 404);
    }

    return apiResponse(user);
  } catch (error) {
    console.error('Get user error:', error);
    return apiError('Internal server error', 500);
  }
}

/**
 * PATCH /api/admin/users/[id] - Update user role/details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const { id } = await params;

  const body = await parseJsonBody(request);
  if (body instanceof Response) return body;

  const validation = updateUserSchema.safeParse(body);
  if (!validation.success) {
    return apiError('Validation failed', 400, validation.error.errors);
  }

  try {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return apiError('User not found', 404);
    }

    const data: Record<string, unknown> = {};
    if (validation.data.name !== undefined) data.name = validation.data.name;
    if (validation.data.role !== undefined) data.role = validation.data.role;
    if (validation.data.phone !== undefined) data.phone = validation.data.phone;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    return apiResponse(user, 200, 'User updated successfully');
  } catch (error) {
    console.error('Update user error:', error);
    return apiError('Internal server error', 500);
  }
}

/**
 * DELETE /api/admin/users/[id] - Delete a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const { id } = await params;

  try {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return apiError('User not found', 404);
    }

    // Don't allow deleting yourself
    if (existing.email === authResult.user.email) {
      return apiError('You cannot delete your own account', 400);
    }

    await prisma.user.delete({ where: { id } });

    return apiResponse(null, 200, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    return apiError('Internal server error', 500);
  }
}
