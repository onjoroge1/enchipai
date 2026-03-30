import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';
import { PaymentMethod, TransactionPaymentStatus } from '@/lib/prisma-types';
import { InvoiceStatus } from '@/lib/prisma-types';

const createPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.number().min(0.01),
  method: z.nativeEnum(PaymentMethod),
  transactionId: z.string().optional(),
  status: z.nativeEnum(TransactionPaymentStatus).default(TransactionPaymentStatus.PENDING),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoiceId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (invoiceId) {
      where.invoiceId = invoiceId;
    }
    if (status) {
      where.status = status;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          invoice: {
            include: {
              booking: {
                include: {
                  tent: true,
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.payment.count({ where }),
    ]);

    return apiResponse({
      payments,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get payments error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = createPaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const { invoiceId, amount, method, transactionId, status } = validationResult.data;

    // Get invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        payments: true,
      },
    });

    if (!invoice) {
      return apiError('Invoice not found', 404);
    }

    // Calculate total paid
    const totalPaid = invoice.payments.reduce(
      (sum, p) => sum + (p.status === TransactionPaymentStatus.COMPLETED ? Number(p.amount) : 0),
      0
    );
    const remaining = Number(invoice.total) - totalPaid;

    if (amount > remaining) {
      return apiError(`Payment amount exceeds remaining balance. Remaining: $${remaining.toFixed(2)}`, 400);
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        method,
        transactionId: transactionId || undefined,
        status,
        processedAt: status === TransactionPaymentStatus.COMPLETED ? new Date() : null,
      },
      include: {
        invoice: true,
      },
    });

    // Update invoice status if fully paid
    const newTotalPaid = totalPaid + (status === TransactionPaymentStatus.COMPLETED ? amount : 0);
    if (newTotalPaid >= Number(invoice.total)) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.PAID,
          paidDate: new Date(),
        },
      });
    }

    return apiResponse(payment, 201, 'Payment recorded successfully');
  } catch (error) {
    console.error('Create payment error:', error);
    return apiError('Internal server error', 500);
  }
}

