import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';
import { EmailCampaignStatus } from '@/lib/prisma-types';

const createCampaignSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  html: z.string().min(1),
  recipientType: z.enum(['ALL_GUESTS', 'BOOKED_GUESTS', 'SPECIFIC_USERS']),
  recipientFilter: z.any().optional(),
  scheduledAt: z.string().datetime().optional(),
});

const updateCampaignSchema = createCampaignSchema.partial().extend({
  status: z.nativeEnum(EmailCampaignStatus).optional(),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (status) {
      where.status = status as EmailCampaignStatus;
    }

    const [campaigns, total] = await Promise.all([
      prisma.emailCampaign.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.emailCampaign.count({ where }),
    ]);

    return apiResponse({
      campaigns,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get email campaigns error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = createCampaignSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;
    const campaign = await prisma.emailCampaign.create({
      data: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        status: EmailCampaignStatus.DRAFT,
      },
    });

    return apiResponse(campaign, 201, 'Email campaign created successfully');
  } catch (error) {
    console.error('Create email campaign error:', error);
    return apiError('Internal server error', 500);
  }
}

