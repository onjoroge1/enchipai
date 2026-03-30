import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';
import { InvoiceStatus } from '@/lib/prisma-types';

const generateInvoiceSchema = z.object({
  bookingId: z.string().min(1),
  taxRate: z.number().min(0).max(1).default(0.16), // 16% VAT for Kenya
  dueDate: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { booking: { bookingNumber: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          booking: {
            include: {
              tent: true,
              guestInfo: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          payments: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.invoice.count({ where }),
    ]);

    // Update overdue status
    const now = new Date();
    for (const invoice of invoices) {
      if (
        invoice.status === InvoiceStatus.PENDING &&
        new Date(invoice.dueDate) < now
      ) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: InvoiceStatus.OVERDUE },
        });
        invoice.status = InvoiceStatus.OVERDUE;
      }
    }

    return apiResponse({
      invoices,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = generateInvoiceSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const { bookingId, taxRate, dueDate } = validationResult.data;

    // Check if invoice already exists for this booking
    const existingInvoice = await prisma.invoice.findUnique({
      where: { bookingId },
    });

    if (existingInvoice) {
      return apiError('Invoice already exists for this booking', 409);
    }

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        tent: true,
        addOns: true,
        user: true,
      },
    });

    if (!booking) {
      return apiError('Booking not found', 404);
    }

    // Calculate amounts
    const subtotal = Number(booking.totalAmount);
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // Generate invoice number (format: INV-YYYYMMDD-XXXX)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await prisma.invoice.count({
      where: {
        invoiceNumber: {
          startsWith: `INV-${dateStr}`,
        },
      },
    });
    const invoiceNumber = `INV-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    // Set due date (default: 30 days from now)
    const invoiceDueDate = dueDate ? new Date(dueDate) : new Date();
    invoiceDueDate.setDate(invoiceDueDate.getDate() + 30);

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        bookingId,
        userId: booking.userId,
        invoiceNumber,
        amount: subtotal,
        tax,
        total,
        dueDate: invoiceDueDate,
        status: InvoiceStatus.PENDING,
      },
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
          },
        },
      },
    });

    return apiResponse(invoice, 201, 'Invoice generated successfully');
  } catch (error) {
    console.error('Generate invoice error:', error);
    return apiError('Internal server error', 500);
  }
}

