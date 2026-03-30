import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError } from '@/lib/api-utils';
import { InvoiceStatus, TransactionPaymentStatus } from '@/lib/prisma-types';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const groupBy = searchParams.get('groupBy') || 'day'; // day, week, month

    const start = startDate ? new Date(startDate) : new Date();
    start.setMonth(start.getMonth() - 1); // Default: last month
    const end = endDate ? new Date(endDate) : new Date();

    // Get all invoices in date range
    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        payments: true,
        booking: {
          include: {
            tent: true,
            addOns: true,
          },
        },
      },
    });

    // Get all payments in date range
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: TransactionPaymentStatus.COMPLETED,
      },
      include: {
        invoice: {
          include: {
            booking: {
              include: {
                tent: true,
              },
            },
          },
        },
      },
    });

    // Calculate totals
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const totalPaid = invoices
      .filter((inv) => inv.status === InvoiceStatus.PAID)
      .reduce((sum, inv) => sum + Number(inv.total), 0);
    const totalPending = invoices
      .filter((inv) => inv.status === InvoiceStatus.PENDING)
      .reduce((sum, inv) => sum + Number(inv.total), 0);
    const totalOverdue = invoices
      .filter((inv) => inv.status === InvoiceStatus.OVERDUE)
      .reduce((sum, inv) => sum + Number(inv.total), 0);

    // Revenue by payment method
    const revenueByMethod = payments.reduce((acc, p) => {
      const method = p.method;
      acc[method] = (acc[method] || 0) + Number(p.amount);
      return acc;
    }, {} as Record<string, number>);

    // Revenue by tent
    const revenueByTent = payments.reduce((acc, p) => {
      const tentName = p.invoice.booking.tent.name;
      acc[tentName] = (acc[tentName] || 0) + Number(p.amount);
      return acc;
    }, {} as Record<string, number>);

    // Time series data
    const timeSeries: Record<string, { date: string; revenue: number; invoices: number }> = {};
    
    payments.forEach((p) => {
      const date = new Date(p.processedAt || p.createdAt);
      let key: string;
      
      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!timeSeries[key]) {
        timeSeries[key] = { date: key, revenue: 0, invoices: 0 };
      }
      timeSeries[key].revenue += Number(p.amount);
    });

    invoices.forEach((inv) => {
      const date = new Date(inv.createdAt);
      let key: string;
      
      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!timeSeries[key]) {
        timeSeries[key] = { date: key, revenue: 0, invoices: 0 };
      }
      timeSeries[key].invoices += 1;
    });

    const timeSeriesData = Object.values(timeSeries).sort((a, b) => 
      a.date.localeCompare(b.date)
    );

    return apiResponse({
      summary: {
        totalRevenue,
        totalInvoiced,
        totalPaid,
        totalPending,
        totalOverdue,
        invoiceCount: invoices.length,
        paymentCount: payments.length,
      },
      revenueByMethod,
      revenueByTent,
      timeSeries: timeSeriesData,
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    });
  } catch (error) {
    console.error('Financial report error:', error);
    return apiError('Internal server error', 500);
  }
}

