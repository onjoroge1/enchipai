import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { sendSMS, sendBulkSMS, isSMSConfigured } from '@/lib/sms';
import { sendWhatsApp, sendBulkWhatsApp, isWhatsAppConfigured } from '@/lib/whatsapp';
import { z } from 'zod';

const sendMessageSchema = z.object({
  channel: z.enum(['sms', 'whatsapp']),
  recipientGroup: z.string().optional(),
  recipientPhone: z.string().optional(),
  message: z.string().min(1).max(1600),
});

/**
 * GET /api/admin/messaging - Get service status and recent messages
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const smsConfigured = isSMSConfigured();
  const whatsappConfigured = isWhatsAppConfigured();

  // Get recent message logs from notifications table
  const recentMessages = await prisma.notification.findMany({
    where: {
      type: 'SYSTEM',
      title: { startsWith: 'Message sent' },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      user: {
        select: { name: true, email: true, phone: true },
      },
    },
  });

  return apiResponse({
    services: {
      sms: {
        configured: smsConfigured,
        provider: 'Africa\'s Talking',
      },
      whatsapp: {
        configured: whatsappConfigured,
        provider: 'WhatsApp Cloud API',
      },
    },
    recentMessages,
  });
}

/**
 * POST /api/admin/messaging - Send SMS or WhatsApp message
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const body = await parseJsonBody(request);
  if (body instanceof Response) return body;

  const validation = sendMessageSchema.safeParse(body);
  if (!validation.success) {
    return apiError('Validation failed', 400, validation.error.errors);
  }

  const { channel, recipientGroup, recipientPhone, message } = validation.data;

  // Resolve recipients
  let phones: string[] = [];

  if (recipientPhone) {
    phones = [recipientPhone];
  } else if (recipientGroup) {
    phones = await resolveRecipientGroup(recipientGroup);
  }

  if (phones.length === 0) {
    return apiError('No recipients found', 400);
  }

  // Send messages
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  if (channel === 'sms') {
    if (!isSMSConfigured() && process.env.NODE_ENV !== 'development') {
      return apiError('SMS service not configured. Set AT_API_KEY and AT_USERNAME.', 503);
    }

    if (phones.length === 1) {
      const result = await sendSMS(phones[0], message);
      sent = result.success ? 1 : 0;
      failed = result.success ? 0 : 1;
      if (result.error) errors.push(result.error);
    } else {
      const result = await sendBulkSMS(phones, message);
      sent = result.sent;
      failed = result.failed;
    }
  } else {
    if (!isWhatsAppConfigured() && process.env.NODE_ENV !== 'development') {
      return apiError('WhatsApp service not configured. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID.', 503);
    }

    if (phones.length === 1) {
      const result = await sendWhatsApp(phones[0], message);
      sent = result.success ? 1 : 0;
      failed = result.success ? 0 : 1;
      if (result.error) errors.push(result.error);
    } else {
      const result = await sendBulkWhatsApp(phones, message);
      sent = result.sent;
      failed = result.failed;
    }
  }

  return apiResponse({
    channel,
    totalRecipients: phones.length,
    sent,
    failed,
    errors: errors.length > 0 ? errors : undefined,
  });
}

/**
 * Resolve a recipient group ID to an array of phone numbers
 */
async function resolveRecipientGroup(groupId: string): Promise<string[]> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  switch (groupId) {
    case 'all-guests': {
      // All guests with active bookings (checked in or confirmed)
      const bookings = await prisma.booking.findMany({
        where: {
          status: { in: ['CONFIRMED', 'CHECKED_IN'] },
          checkIn: { lte: endOfDay },
          checkOut: { gte: startOfDay },
        },
        include: { guestInfo: true },
      });
      return bookings
        .map((b) => b.guestInfo?.phone)
        .filter((p): p is string => !!p);
    }

    case 'arriving-today': {
      const bookings = await prisma.booking.findMany({
        where: {
          checkIn: { gte: startOfDay, lt: endOfDay },
          status: { in: ['CONFIRMED', 'PENDING'] },
        },
        include: { guestInfo: true },
      });
      return bookings
        .map((b) => b.guestInfo?.phone)
        .filter((p): p is string => !!p);
    }

    case 'departing-today': {
      const bookings = await prisma.booking.findMany({
        where: {
          checkOut: { gte: startOfDay, lt: endOfDay },
          status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        },
        include: { guestInfo: true },
      });
      return bookings
        .map((b) => b.guestInfo?.phone)
        .filter((p): p is string => !!p);
    }

    case 'all-staff': {
      const staff = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'STAFF'] }, phone: { not: null } },
        select: { phone: true },
      });
      return staff.map((s) => s.phone).filter((p): p is string => !!p);
    }

    default:
      return [];
  }
}
