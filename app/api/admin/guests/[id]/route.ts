import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const updateGuestSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  preferenceNotes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = await params;
    const guest = await prisma.user.findUnique({
      where: { id, role: 'GUEST' },
      include: {
        bookings: {
          include: {
            tent: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            guestInfo: true,
            addOns: true,
            invoice: {
              include: {
                payments: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        preferences: true,
      },
    });

    if (!guest) {
      return apiError('Guest not found', 404);
    }

    return apiResponse(guest);
  } catch (error) {
    console.error('Get guest error:', error);
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

    const validationResult = updateGuestSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const { preferenceNotes, ...userData } = validationResult.data;

    // Filter out undefined values
    const updateData = Object.fromEntries(
      Object.entries(userData).filter(([_, value]) => value !== undefined)
    );

    // Update user data
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id, role: 'GUEST' },
        data: updateData,
      });
    }

    // Update preference notes if provided
    if (preferenceNotes !== undefined) {
      await prisma.guestPreference.upsert({
        where: { userId: id },
        create: {
          userId: id,
          notes: preferenceNotes || null,
        },
        update: {
          notes: preferenceNotes || null,
        },
      });
    }

    // Fetch updated guest with preferences
    const updatedGuest = await prisma.user.findUnique({
      where: { id, role: 'GUEST' },
      include: {
        bookings: {
          include: {
            tent: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        preferences: true,
      },
    });

    return apiResponse(updatedGuest, 200, 'Guest updated successfully');
  } catch (error) {
    console.error('Update guest error:', error);
    return apiError('Internal server error', 500);
  }
}

