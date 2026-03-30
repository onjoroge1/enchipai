import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';
import { TransactionPaymentStatus, InvoiceStatus } from '@/lib/prisma-types';

const updatePaymentSchema = z.object({
  status: z.nativeEnum(TransactionPaymentStatus).optional(),
  transactionId: z.string().optional(),
  processedAt: z.string().datetime().optional().nullable(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = updatePaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;
    const updateData: any = {};

    if (data.status) {
      updateData.status = data.status;
      if (data.status === TransactionPaymentStatus.COMPLETED && !data.processedAt) {
        updateData.processedAt = new Date();
      }
    }

    if (data.transactionId !== undefined) {
      updateData.transactionId = data.transactionId || null;
    }

    if (data.processedAt !== undefined) {
      updateData.processedAt = data.processedAt ? new Date(data.processedAt) : null;
    }

    const payment = await prisma.payment.update({
      where: { id: params.id },
      data: updateData,
      include: {
        invoice: {
          include: {
            payments: true,
          },
        },
      },
    });

    // Recalculate invoice status
    const totalPaid = payment.invoice.payments.reduce(
      (sum, p) => sum + (p.status === TransactionPaymentStatus.COMPLETED ? Number(p.amount) : 0),
      0
    );

    if (totalPaid >= Number(payment.invoice.total)) {
      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          status: InvoiceStatus.PAID,
          paidDate: new Date(),
        },
      });
    } else if (payment.invoice.status === InvoiceStatus.PAID) {
      // If payment was reversed, update invoice back to PENDING
      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          status: InvoiceStatus.PENDING,
          paidDate: null,
        },
      });
    }

    return apiResponse(payment, 200, 'Payment updated successfully');
  } catch (error) {
    console.error('Update payment error:', error);
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
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        invoice: true,
      },
    });

    if (!payment) {
      return apiError('Payment not found', 404);
    }

    await prisma.payment.delete({
      where: { id: params.id },
    });

    // Recalculate invoice status
    const invoice = await prisma.invoice.findUnique({
      where: { id: payment.invoiceId },
      include: {
        payments: true,
      },
    });

    if (invoice) {
      const totalPaid = invoice.payments.reduce(
        (sum, p) => sum + (p.status === TransactionPaymentStatus.COMPLETED ? Number(p.amount) : 0),
        0
      );

      if (totalPaid >= Number(invoice.total)) {
        await prisma.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            status: InvoiceStatus.PAID,
            paidDate: new Date(),
          },
        });
      } else {
        await prisma.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            status: InvoiceStatus.PENDING,
            paidDate: null,
          },
        });
      }
    }

    return apiResponse(null, 200, 'Payment deleted successfully');
  } catch (error) {
    console.error('Delete payment error:', error);
    return apiError('Internal server error', 500);
  }
}

