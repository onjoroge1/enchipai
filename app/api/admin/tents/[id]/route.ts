import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, requireAdminOnly, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const updateTentSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  price: z.number().min(0).optional(),
  size: z.string().optional(),
  bed: z.string().optional(),
  guests: z.number().min(1).optional(),
  amenities: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  displayOrder: z.number().optional(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'UNAVAILABLE']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = await params;
    const tent = await prisma.tent.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!tent) {
      return apiError('Tent not found', 404);
    }

    return apiResponse(tent);
  } catch (error) {
    console.error('Get tent error:', error);
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

    const validationResult = updateTentSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    // Check if slug is being updated and if it conflicts
    if (validationResult.data.slug) {
      const existingTent = await prisma.tent.findUnique({
        where: { slug: validationResult.data.slug },
      });

      if (existingTent && existingTent.id !== id) {
        return apiError('Tent with this slug already exists', 409);
      }
    }

    const tent = await prisma.tent.update({
      where: { id },
      data: validationResult.data,
      include: {
        images: true,
      },
    });

    return apiResponse(tent, 200, 'Tent updated successfully');
  } catch (error) {
    console.error('Update tent error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Only ADMIN can delete tents (destructive operation)
  const authResult = await requireAdminOnly(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = await params;
    // Check if tent has active bookings
    const activeBookings = await prisma.booking.findFirst({
      where: {
        tentId: id,
        status: {
          notIn: ['CANCELLED', 'CHECKED_OUT'],
        },
      },
    });

    if (activeBookings) {
      return apiError('Cannot delete tent with active bookings', 409);
    }

    await prisma.tent.delete({
      where: { id },
    });

    return apiResponse(null, 200, 'Tent deleted successfully');
  } catch (error) {
    console.error('Delete tent error:', error);
    return apiError('Internal server error', 500);
  }
}

