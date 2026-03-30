import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';
import { InvoiceStatus } from '@/lib/prisma-types';

const updateInvoiceSchema = z.object({
  status: z.nativeEnum(InvoiceStatus).optional(),
  dueDate: z.string().datetime().optional(),
  paidDate: z.string().datetime().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        booking: {
          include: {
            tent: true,
            guestInfo: true,
            addOns: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!invoice) {
      return apiError('Invoice not found', 404);
    }

    return apiResponse(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
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

    const validationResult = updateInvoiceSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;
    const updateData: any = {};

    if (data.status) {
      updateData.status = data.status;
      // Auto-set paidDate when status changes to PAID
      if (data.status === InvoiceStatus.PAID && !data.paidDate) {
        updateData.paidDate = new Date();
      }
    }

    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    if (data.paidDate !== undefined) {
      updateData.paidDate = data.paidDate ? new Date(data.paidDate) : null;
    }

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData,
      include: {
        booking: true,
        user: true,
        payments: true,
      },
    });

    return apiResponse(invoice, 200, 'Invoice updated successfully');
  } catch (error) {
    console.error('Update invoice error:', error);
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
    // Only allow deletion of PENDING invoices
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
    });

    if (!invoice) {
      return apiError('Invoice not found', 404);
    }

    if (invoice.status !== InvoiceStatus.PENDING) {
      return apiError('Can only delete pending invoices', 400);
    }

    await prisma.invoice.delete({
      where: { id: params.id },
    });

    return apiResponse(null, 200, 'Invoice deleted successfully');
  } catch (error) {
    console.error('Delete invoice error:', error);
    return apiError('Internal server error', 500);
  }
}

