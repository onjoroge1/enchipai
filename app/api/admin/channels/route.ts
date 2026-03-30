import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';

const createChannelSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['BOOKING_COM', 'AIRBNB', 'EXPEDIA', 'CUSTOM']),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  webhookUrl: z.string().url().optional().or(z.literal('')),
  syncEnabled: z.boolean().default(false),
  settings: z.any().optional(),
});

const updateChannelSchema = createChannelSchema.partial();

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const syncEnabled = searchParams.get('syncEnabled');

    const where: any = {};
    if (type) where.type = type;
    if (syncEnabled !== null) where.syncEnabled = syncEnabled === 'true';

    const channels = await prisma.channel.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return apiResponse({ channels });
  } catch (error) {
    console.error('Get channels error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = createChannelSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const channel = await prisma.channel.create({
      data: validationResult.data,
    });

    return apiResponse(channel, 201, 'Channel created successfully');
  } catch (error) {
    console.error('Create channel error:', error);
    return apiError('Internal server error', 500);
  }
}

