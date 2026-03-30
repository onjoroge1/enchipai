import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const updateExperienceSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  price: z.number().min(0).optional(),
  duration: z.string().optional(),
  capacity: z.number().min(1).optional(),
  available: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = await params;
    const experience = await prisma.experience.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            experience: true,
          },
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    if (!experience) {
      return apiError('Experience not found', 404);
    }

    return apiResponse(experience);
  } catch (error) {
    console.error('Get experience error:', error);
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

    const validationResult = updateExperienceSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;

    // Check if slug is being updated and if it conflicts
    if (data.slug) {
      const existingExperience = await prisma.experience.findUnique({
        where: { slug: data.slug },
      });

      if (existingExperience && existingExperience.id !== id) {
        return apiError('Experience with this slug already exists', 409);
      }
    }

    const experience = await prisma.experience.update({
      where: { id },
      data,
    });

    return apiResponse(experience, 200, 'Experience updated successfully');
  } catch (error) {
    console.error('Update experience error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = await params;
    // Check if experience has bookings
    const bookings = await prisma.experienceBooking.findFirst({
      where: {
        experienceId: id,
      },
    });

    if (bookings) {
      return apiError('Cannot delete experience with existing bookings', 409);
    }

    await prisma.experience.delete({
      where: { id },
    });

    return apiResponse(null, 200, 'Experience deleted successfully');
  } catch (error) {
    console.error('Delete experience error:', error);
    return apiError('Internal server error', 500);
  }
}

