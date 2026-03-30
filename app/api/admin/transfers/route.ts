import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';
import { TransferType, TransferStatus } from '@/lib/prisma-types';

const createTransferSchema = z.object({
  type: z.nativeEnum(TransferType),
  from: z.string().min(1),
  to: z.string().min(1),
  date: z.string().datetime(),
  time: z.string().optional(),
  vehicle: z.string().optional(),
  driver: z.string().optional(),
  guests: z.string().optional(),
  status: z.nativeEnum(TransferStatus).optional(),
  notes: z.string().optional(),
});

const updateTransferSchema = createTransferSchema.partial();

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (type) {
      where.type = type as TransferType;
    }
    if (status) {
      where.status = status as TransferStatus;
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [transfers, total] = await Promise.all([
      prisma.transfer.findMany({
        where,
        orderBy: {
          date: 'asc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.transfer.count({ where }),
    ]);

    return apiResponse({
      transfers,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get transfers error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = createTransferSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;
    const transfer = await prisma.transfer.create({
      data: {
        ...data,
        date: new Date(data.date),
        status: data.status || TransferStatus.SCHEDULED,
      },
    });

    return apiResponse(transfer, 201, 'Transfer created successfully');
  } catch (error) {
    console.error('Create transfer error:', error);
    return apiError('Internal server error', 500);
  }
}

