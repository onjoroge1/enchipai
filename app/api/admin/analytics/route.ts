import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError } from '@/lib/api-utils';
import { BookingStatus, TransactionPaymentStatus, InvoiceStatus } from '@/lib/prisma-types';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // day, week, month, year
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date range
    const now = new Date();
    let start: Date;
    let end: Date = now;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      switch (period) {
        case 'day':
          start = new Date(now);
          start.setDate(start.getDate() - 30);
          break;
        case 'week':
          start = new Date(now);
          start.setDate(start.getDate() - 12 * 7);
          break;
        case 'month':
          start = new Date(now);
          start.setMonth(start.getMonth() - 12);
          break;
        case 'year':
          start = new Date(now);
          start.setFullYear(start.getFullYear() - 5);
          break;
        default:
          start = new Date(now);
          start.setMonth(start.getMonth() - 12);
      }
    }

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        tent: true,
        addOns: true,
        user: true,
      },
    });

    // Get payments
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

    // Get invoices
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
          },
        },
      },
    });

    // Calculate booking statistics
    const totalBookings = bookings.length;
    const confirmedBookingsList = bookings.filter((b) => b.status === BookingStatus.CONFIRMED);
    const confirmedBookings = confirmedBookingsList.length;
    const cancelledBookings = bookings.filter((b) => b.status === BookingStatus.CANCELLED).length;
    const checkedInBookings = bookings.filter((b) => b.status === BookingStatus.CHECKED_IN).length;

    // Calculate revenue
    // Revenue from completed payments
    const revenueFromPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    
    // Revenue from bookings (CONFIRMED, PENDING, CHECKED_IN) that don't have payments yet
    // Exclude CANCELLED and CHECKED_OUT bookings
    // (to avoid double counting, we only count bookings without payments)
    const bookingsWithPaymentIds = new Set(
      payments
        .filter((p) => p.invoice?.bookingId)
        .map((p) => p.invoice!.bookingId)
    );
    
    const activeBookingsList = bookings.filter(
      (b) => 
        b.status !== BookingStatus.CANCELLED && 
        b.status !== BookingStatus.CHECKED_OUT
    );
    
    const revenueFromBookings = activeBookingsList
      .filter((b) => !bookingsWithPaymentIds.has(b.id))
      .reduce((sum, b) => sum + Number(b.totalAmount), 0);
    
    // Total revenue = payments + active bookings without payments
    const totalRevenue = revenueFromPayments + revenueFromBookings;
    
    const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const paidInvoices = invoices.filter((inv) => inv.status === InvoiceStatus.PAID);
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

    // Calculate average booking value
    const avgBookingValue = totalBookings > 0 
      ? bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0) / totalBookings 
      : 0;

    // Calculate average stay duration
    const avgStayDuration = bookings.length > 0
      ? bookings.reduce((sum, b) => {
          const nights = Math.ceil(
            (new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + nights;
        }, 0) / bookings.length
      : 0;

    // Calculate occupancy rate
    const totalTents = await prisma.tent.count({
      where: {
        status: {
          notIn: ['UNAVAILABLE'],
        },
      },
    });

    // Calculate total available nights in period
    const daysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalAvailableNights = totalTents * daysInPeriod;

    // Calculate booked nights
    const bookedNights = bookings
      .filter((b) => b.status !== BookingStatus.CANCELLED)
      .reduce((sum, b) => {
        const nights = Math.ceil(
          (new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + nights;
      }, 0);

    const occupancyRate = totalAvailableNights > 0 
      ? (bookedNights / totalAvailableNights) * 100 
      : 0;

    // Time series data for revenue and bookings
    const timeSeries: Record<string, { date: string; revenue: number; bookings: number; occupancy: number }> = {};

    // Group by period
    const getDateKey = (date: Date): string => {
      if (period === 'day') {
        return date.toISOString().split('T')[0];
      } else if (period === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().split('T')[0];
      } else if (period === 'month') {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        return String(date.getFullYear());
      }
    };

    // Process payments for revenue
    payments.forEach((p) => {
      const date = new Date(p.processedAt || p.createdAt);
      const key = getDateKey(date);
      if (!timeSeries[key]) {
        timeSeries[key] = { date: key, revenue: 0, bookings: 0, occupancy: 0 };
      }
      timeSeries[key].revenue += Number(p.amount);
    });

    // Process active bookings for revenue (if no payment exists)
    activeBookingsList.forEach((b) => {
      // Only count if booking doesn't have a payment
      if (!bookingsWithPaymentIds.has(b.id)) {
        const date = new Date(b.createdAt);
        const key = getDateKey(date);
        if (!timeSeries[key]) {
          timeSeries[key] = { date: key, revenue: 0, bookings: 0, occupancy: 0 };
        }
        timeSeries[key].revenue += Number(b.totalAmount);
      }
    });

    // Process bookings
    bookings.forEach((b) => {
      const date = new Date(b.createdAt);
      const key = getDateKey(date);
      if (!timeSeries[key]) {
        timeSeries[key] = { date: key, revenue: 0, bookings: 0, occupancy: 0 };
      }
      if (b.status !== BookingStatus.CANCELLED) {
        timeSeries[key].bookings += 1;
      }
    });

    // Calculate occupancy by period
    const occupancyByPeriod: Record<string, number> = {};
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = getDateKey(new Date(d));
      if (!occupancyByPeriod[key]) {
        occupancyByPeriod[key] = 0;
      }
      
      // Count bookings active on this date
      const activeBookings = bookings.filter((b) => {
        if (b.status === BookingStatus.CANCELLED) return false;
        const checkIn = new Date(b.checkIn);
        const checkOut = new Date(b.checkOut);
        return d >= checkIn && d < checkOut;
      });
      
      occupancyByPeriod[key] = activeBookings.length;
    }

    // Add occupancy to time series
    Object.keys(timeSeries).forEach((key) => {
      const periodOccupancy = occupancyByPeriod[key] || 0;
      const available = totalTents;
      timeSeries[key].occupancy = available > 0 ? (periodOccupancy / available) * 100 : 0;
    });

    const timeSeriesData = Object.values(timeSeries).sort((a, b) => 
      a.date.localeCompare(b.date)
    );

    // Revenue by tent
    const revenueByTent = payments.reduce((acc, p) => {
      const tentName = p.invoice.booking.tent.name;
      acc[tentName] = (acc[tentName] || 0) + Number(p.amount);
      return acc;
    }, {} as Record<string, number>);

    // Bookings by tent
    const bookingsByTent = bookings.reduce((acc, b) => {
      const tentName = b.tent.name;
      acc[tentName] = (acc[tentName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Booking trends
    const bookingTrends = {
      byStatus: {
        CONFIRMED: confirmedBookings,
        CANCELLED: cancelledBookings,
        CHECKED_IN: checkedInBookings,
        PENDING: bookings.filter((b) => b.status === BookingStatus.PENDING).length,
        CHECKED_OUT: bookings.filter((b) => b.status === BookingStatus.CHECKED_OUT).length,
      },
      byMonth: timeSeriesData.map((item) => ({
        period: item.date,
        count: item.bookings,
      })),
    };

    return apiResponse({
      summary: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        checkedInBookings,
        totalRevenue,
        totalInvoiced,
        totalPaid,
        avgBookingValue,
        avgStayDuration,
        occupancyRate,
        totalTents,
        bookedNights,
        totalAvailableNights,
      },
      timeSeries: timeSeriesData,
      revenueByTent,
      bookingsByTent,
      bookingTrends,
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
        type: period,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return apiError('Internal server error', 500);
  }
}

