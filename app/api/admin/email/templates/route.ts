import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const createTemplateSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  html: z.string().min(1),
  variables: z.array(z.string()).optional(),
  category: z.string().optional(),
});

const updateTemplateSchema = createTemplateSchema.partial();

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (category) {
      where.category = category;
    }

    const [templates, total] = await Promise.all([
      prisma.emailTemplate.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.emailTemplate.count({ where }),
    ]);

    return apiResponse({
      templates,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get email templates error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = createTemplateSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const template = await prisma.emailTemplate.create({
      data: validationResult.data,
    });

    return apiResponse(template, 201, 'Email template created successfully');
  } catch (error) {
    console.error('Create email template error:', error);
    return apiError('Internal server error', 500);
  }
}

