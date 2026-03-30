import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const createImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional().nullable(),
  order: z.number().int().min(0).default(0),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = await params;
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = createImageSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    // Verify tent exists
    const tent = await prisma.tent.findUnique({
      where: { id },
    });

    if (!tent) {
      return apiError('Tent not found', 404);
    }

    const image = await prisma.tentImage.create({
      data: {
        tentId: id,
        url: validationResult.data.url,
        alt: validationResult.data.alt,
        order: validationResult.data.order,
      },
    });

    return apiResponse(image, 201, 'Image added successfully');
  } catch (error) {
    console.error('Create tent image error:', error);
    return apiError('Internal server error', 500);
  }
}

