import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const updateImageSchema = z.object({
  url: z.string().url().optional(),
  alt: z.string().optional().nullable(),
  order: z.number().int().min(0).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id, imageId } = await params;
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = updateImageSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    // Verify image belongs to tent
    const image = await prisma.tentImage.findFirst({
      where: {
        id: imageId,
        tentId: id,
      },
    });

    if (!image) {
      return apiError('Image not found', 404);
    }

    const updatedImage = await prisma.tentImage.update({
      where: { id: imageId },
      data: validationResult.data,
    });

    return apiResponse(updatedImage, 200, 'Image updated successfully');
  } catch (error) {
    console.error('Update tent image error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id, imageId } = await params;

    // Verify image belongs to tent
    const image = await prisma.tentImage.findFirst({
      where: {
        id: imageId,
        tentId: id,
      },
    });

    if (!image) {
      return apiError('Image not found', 404);
    }

    await prisma.tentImage.delete({
      where: { id: imageId },
    });

    return apiResponse(null, 200, 'Image deleted successfully');
  } catch (error) {
    console.error('Delete tent image error:', error);
    return apiError('Internal server error', 500);
  }
}

