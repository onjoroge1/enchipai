import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';
import { BookingStatus, InvoiceStatus, TransactionPaymentStatus } from '@/lib/prisma-types';

const generateReportSchema = z.object({
  reportType: z.enum(['revenue', 'occupancy', 'bookings', 'guests', 'invoices', 'wildlife']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  format: z.enum(['csv', 'xlsx', 'pdf']).default('csv'),
  fields: z.array(z.string()).optional(),
});

function getDateRange(dateRange: string): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (dateRange) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'this-week':
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - now.getDay() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'this-month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'last-month':
      start.setMonth(now.getMonth() - 1);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth());
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'this-quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      start.setMonth(quarter * 3);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth((quarter + 1) * 3);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'this-year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
    case 'last-year':
      start.setFullYear(now.getFullYear() - 1);
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setFullYear(now.getFullYear() - 1);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      start.setMonth(now.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = generateReportSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const { reportType, startDate, endDate, format, fields } = validationResult.data;

    // Determine date range
    let dateRange: { start: Date; end: Date };
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    } else {
      dateRange = getDateRange(body.dateRange as string || 'this-month');
    }

    let reportData: any[] = [];
    let headers: string[] = [];

    switch (reportType) {
      case 'revenue': {
        const invoices = await prisma.invoice.findMany({
          where: {
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
          include: {
            booking: {
              include: {
                tent: true,
                user: true,
                addOns: true,
              },
            },
            payments: true,
          },
        });

        headers = ['Date', 'Invoice Number', 'Guest Name', 'Email', 'Tent', 'Amount', 'Tax', 'Total', 'Status', 'Payment Status'];
        reportData = invoices.map((inv) => [
          new Date(inv.createdAt).toLocaleDateString(),
          inv.invoiceNumber,
          inv.booking.user.name || 'N/A',
          inv.booking.user.email,
          inv.booking.tent.name,
          Number(inv.amount).toFixed(2),
          Number(inv.tax).toFixed(2),
          Number(inv.total).toFixed(2),
          inv.status,
          inv.booking.paymentStatus,
        ]);
        break;
      }

      case 'bookings': {
        const bookings = await prisma.booking.findMany({
          where: {
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
          include: {
            tent: true,
            user: true,
            addOns: true,
            guestInfo: true,
          },
        });

        headers = ['Booking Number', 'Guest Name', 'Email', 'Phone', 'Country', 'Tent', 'Check-in', 'Check-out', 'Nights', 'Guests', 'Rate', 'Total', 'Status'];
        reportData = bookings.map((booking) => {
          const checkIn = new Date(booking.checkIn);
          const checkOut = new Date(booking.checkOut);
          const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
          const rate = Number(booking.totalAmount) / nights;

          return [
            booking.bookingNumber || booking.id.slice(0, 8),
            booking.user.name || booking.guestInfo?.firstName || 'N/A',
            booking.user.email,
            booking.guestInfo?.phone || 'N/A',
            booking.guestInfo?.nationality || 'N/A',
            booking.tent.name,
            checkIn.toLocaleDateString(),
            checkOut.toLocaleDateString(),
            nights,
            booking.guests,
            rate.toFixed(2),
            Number(booking.totalAmount).toFixed(2),
            booking.status,
          ];
        });
        break;
      }

      case 'guests': {
        const bookings = await prisma.booking.findMany({
          where: {
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
          include: {
            user: {
              include: {
                bookings: {
                  include: {
                    tent: true,
                  },
                },
              },
            },
            guestInfo: true,
          },
        });

        // Group by user to get guest analytics
        const guestMap = new Map();
        bookings.forEach((booking) => {
          const userId = booking.userId;
          if (!guestMap.has(userId)) {
            guestMap.set(userId, {
              name: booking.user.name || booking.guestInfo?.firstName || 'N/A',
              email: booking.user.email,
              phone: booking.guestInfo?.phone || 'N/A',
              country: booking.guestInfo?.nationality || 'N/A',
              totalBookings: 0,
              totalSpent: 0,
              lastVisit: booking.checkIn,
            });
          }
          const guest = guestMap.get(userId);
          guest.totalBookings += 1;
          guest.totalSpent += Number(booking.totalAmount);
          if (new Date(booking.checkIn) > new Date(guest.lastVisit)) {
            guest.lastVisit = booking.checkIn;
          }
        });

        headers = ['Guest Name', 'Email', 'Phone', 'Country', 'Total Bookings', 'Total Spent', 'Last Visit'];
        reportData = Array.from(guestMap.values()).map((guest) => [
          guest.name,
          guest.email,
          guest.phone,
          guest.country,
          guest.totalBookings,
          Number(guest.totalSpent).toFixed(2),
          new Date(guest.lastVisit).toLocaleDateString(),
        ]);
        break;
      }

      case 'occupancy': {
        const bookings = await prisma.booking.findMany({
          where: {
            checkIn: {
              lte: dateRange.end,
            },
            checkOut: {
              gte: dateRange.start,
            },
            status: {
              notIn: [BookingStatus.CANCELLED],
            },
          },
          include: {
            tent: true,
          },
        });

        // Calculate occupancy by tent and date
        const tentMap = new Map();
        bookings.forEach((booking) => {
          const tentId = booking.tentId;
          if (!tentMap.has(tentId)) {
            tentMap.set(tentId, {
              tentName: booking.tent.name,
              bookedNights: 0,
              totalNights: 0,
            });
          }
          const tent = tentMap.get(tentId);
          const checkIn = new Date(booking.checkIn);
          const checkOut = new Date(booking.checkOut);
          const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
          tent.bookedNights += nights;
        });

        // Get all tents and calculate total available nights
        const allTents = await prisma.tent.findMany();
        const daysInRange = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));

        headers = ['Tent Name', 'Booked Nights', 'Available Nights', 'Total Nights', 'Occupancy Rate'];
        reportData = allTents.map((tent) => {
          const tentData = tentMap.get(tent.id) || { tentName: tent.name, bookedNights: 0 };
          const availableNights = daysInRange - tentData.bookedNights;
          const occupancyRate = daysInRange > 0 ? (tentData.bookedNights / daysInRange) * 100 : 0;

          return [
            tent.name,
            tentData.bookedNights,
            availableNights,
            daysInRange,
            `${occupancyRate.toFixed(2)}%`,
          ];
        });
        break;
      }

      case 'invoices': {
        const invoices = await prisma.invoice.findMany({
          where: {
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
          include: {
            booking: {
              include: {
                tent: true,
                user: true,
              },
            },
            payments: true,
          },
        });

        headers = ['Invoice Number', 'Date', 'Guest Name', 'Email', 'Tent', 'Amount', 'Tax', 'Total', 'Status', 'Due Date', 'Paid Date', 'Payment Method'];
        reportData = invoices.map((inv) => [
          inv.invoiceNumber,
          new Date(inv.createdAt).toLocaleDateString(),
          inv.booking.user.name || 'N/A',
          inv.booking.user.email,
          inv.booking.tent.name,
          Number(inv.amount).toFixed(2),
          Number(inv.tax).toFixed(2),
          Number(inv.total).toFixed(2),
          inv.status,
          inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A',
          inv.paidDate ? new Date(inv.paidDate).toLocaleDateString() : 'N/A',
          inv.payments[0]?.method || 'N/A',
        ]);
        break;
      }

      case 'wildlife': {
        const sightings = await prisma.wildlifeSighting.findMany({
          where: {
            date: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
          orderBy: {
            date: 'desc',
          },
        });

        headers = ['Date', 'Time', 'Species', 'Location', 'Guide', 'Description'];
        reportData = sightings.map((sighting) => [
          new Date(sighting.date).toLocaleDateString(),
          new Date(sighting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sighting.species,
          sighting.location || 'N/A',
          sighting.guideName || 'N/A',
          sighting.description || 'N/A',
        ]);
        break;
      }
    }

    // Generate content based on format
    let content: string;
    let contentType: string;
    let fileExtension: string;

    if (format === 'csv') {
      // Convert to CSV format
      const csvRows = [
        headers.join(','),
        ...reportData.map((row) =>
          row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ];
      content = csvRows.join('\n');
      contentType = 'text/csv';
      fileExtension = 'csv';
    } else if (format === 'pdf') {
      // Generate HTML table for PDF (can be printed/saved as PDF by browser)
      const htmlRows = reportData.map((row) =>
        `<tr>${row.map((cell: any) => `<td>${String(cell).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`).join('')}</tr>`
      ).join('');

      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      color: #333;
    }
    h1 {
      color: #1a1a1a;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .report-info {
      margin-bottom: 20px;
      color: #666;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background-color: #f3f4f6;
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }
    td {
      border: 1px solid #ddd;
      padding: 10px;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    @media print {
      body { margin: 0; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>
  <h1>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h1>
  <div class="report-info">
    <p><strong>Period:</strong> ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Total Records:</strong> ${reportData.length}</p>
  </div>
  <table>
    <thead>
      <tr>
        ${headers.map((h) => `<th>${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${htmlRows}
    </tbody>
  </table>
</body>
</html>`;
      content = htmlContent;
      contentType = 'text/html';
      fileExtension = 'html'; // Browser can save/print as PDF
    } else {
      // XLSX format - for now, return CSV (XLSX requires additional library)
      const csvRows = [
        headers.join(','),
        ...reportData.map((row) =>
          row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ];
      content = csvRows.join('\n');
      contentType = 'text/csv';
      fileExtension = 'csv';
    }

    return apiResponse({
      reportType,
      format,
      data: content,
      contentType,
      fileExtension,
      headers,
      rowCount: reportData.length,
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    });
  } catch (error) {
    console.error('Generate report error:', error);
    return apiError('Internal server error', 500);
  }
}

