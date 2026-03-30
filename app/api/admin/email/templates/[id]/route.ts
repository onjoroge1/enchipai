import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  html: z.string().min(1).optional(),
  variables: z.array(z.string()).optional(),
  category: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return apiError('Email template not found', 404);
    }

    return apiResponse(template);
  } catch (error) {
    console.error('Get email template error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = updateTemplateSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const template = await prisma.emailTemplate.update({
      where: { id: params.id },
      data: validationResult.data,
    });

    return apiResponse(template, 200, 'Email template updated successfully');
  } catch (error) {
    console.error('Update email template error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    await prisma.emailTemplate.delete({
      where: { id: params.id },
    });

    return apiResponse(null, 200, 'Email template deleted successfully');
  } catch (error) {
    console.error('Delete email template error:', error);
    return apiError('Internal server error', 500);
  }
}

