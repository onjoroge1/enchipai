/**
 * WhatsApp Service using WhatsApp Cloud API (Meta)
 *
 * Uses the official WhatsApp Business Cloud API for sending messages.
 * Requires a Meta Business account with WhatsApp Business API access.
 *
 * Required env vars:
 *   WHATSAPP_TOKEN - WhatsApp Cloud API access token
 *   WHATSAPP_PHONE_NUMBER_ID - WhatsApp Business phone number ID
 *   WHATSAPP_BUSINESS_ACCOUNT_ID - Optional, for template management
 */

const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';

interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface WhatsAppBulkResult {
  success: boolean;
  sent: number;
  failed: number;
  results: WhatsAppResult[];
}

function getConfig() {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return null;
  }

  return { token, phoneNumberId };
}

/**
 * Send a text message via WhatsApp
 */
export async function sendWhatsApp(
  to: string,
  message: string
): Promise<WhatsAppResult> {
  const config = getConfig();

  if (!config) {
    console.warn('WhatsApp service not configured. WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID missing.');
    if (process.env.NODE_ENV === 'development') {
      console.log('💬 WhatsApp would be sent:', { to, message });
      return { success: true, messageId: 'dev-wa-' + Date.now() };
    }
    return { success: false, error: 'WhatsApp service not configured' };
  }

  // Normalize phone number (remove spaces, dashes, ensure + prefix)
  const normalizedTo = normalizePhone(to);

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizedTo,
          type: 'text',
          text: { body: message },
        }),
      }
    );

    const data = await response.json();

    if (response.ok && data.messages?.[0]?.id) {
      return {
        success: true,
        messageId: data.messages[0].id,
      };
    }

    return {
      success: false,
      error: data.error?.message || `HTTP ${response.status}`,
    };
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'WhatsApp send failed',
    };
  }
}

/**
 * Send a WhatsApp template message (for notifications outside 24-hour window)
 */
export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  languageCode: string = 'en',
  components?: Array<{
    type: 'body' | 'header';
    parameters: Array<{ type: 'text'; text: string }>;
  }>
): Promise<WhatsAppResult> {
  const config = getConfig();

  if (!config) {
    console.warn('WhatsApp service not configured.');
    if (process.env.NODE_ENV === 'development') {
      console.log('💬 WhatsApp template would be sent:', { to, templateName, components });
      return { success: true, messageId: 'dev-wa-tpl-' + Date.now() };
    }
    return { success: false, error: 'WhatsApp service not configured' };
  }

  const normalizedTo = normalizePhone(to);

  try {
    const templatePayload: {
      name: string;
      language: { code: string };
      components?: Array<{
        type: 'body' | 'header';
        parameters: Array<{ type: 'text'; text: string }>;
      }>;
    } = {
      name: templateName,
      language: { code: languageCode },
    };

    if (components) {
      templatePayload.components = components;
    }

    const response = await fetch(
      `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: normalizedTo,
          type: 'template',
          template: templatePayload,
        }),
      }
    );

    const data = await response.json();

    if (response.ok && data.messages?.[0]?.id) {
      return { success: true, messageId: data.messages[0].id };
    }

    return {
      success: false,
      error: data.error?.message || `HTTP ${response.status}`,
    };
  } catch (error) {
    console.error('WhatsApp template send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'WhatsApp template send failed',
    };
  }
}

/**
 * Send WhatsApp to multiple recipients
 */
export async function sendBulkWhatsApp(
  recipients: string[],
  message: string
): Promise<WhatsAppBulkResult> {
  const results: WhatsAppResult[] = [];

  for (const to of recipients) {
    const result = await sendWhatsApp(to, message);
    results.push(result);
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return {
    success: true,
    sent: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  };
}

/**
 * Check if WhatsApp service is configured
 */
export function isWhatsAppConfigured(): boolean {
  return !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

/**
 * Normalize phone number for WhatsApp API (digits only, no + prefix)
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');
}

/**
 * Send booking confirmation via WhatsApp
 */
export async function sendBookingConfirmationWhatsApp(
  phone: string,
  booking: { bookingNumber: string; tentName: string; checkIn: string; checkOut: string; guestName: string }
): Promise<WhatsAppResult> {
  const checkIn = new Date(booking.checkIn).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const checkOut = new Date(booking.checkOut).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const message = `Hello ${booking.guestName}! 🌿

Your booking at *Enchipai Mara Camp* is confirmed!

📋 *Booking:* ${booking.bookingNumber}
🏕️ *Tent:* ${booking.tentName}
📅 *Check-in:* ${checkIn}
📅 *Check-out:* ${checkOut}

We look forward to welcoming you to the Masai Mara! 🦁

For questions, reply to this message or email bookings@enchipai.com`;

  return sendWhatsApp(phone, message);
}

/**
 * Send payment confirmation via WhatsApp
 */
export async function sendPaymentConfirmationWhatsApp(
  phone: string,
  payment: { amount: number; bookingNumber: string; guestName: string }
): Promise<WhatsAppResult> {
  const message = `Hello ${payment.guestName}! ✅

Payment of *$${payment.amount.toLocaleString()}* received for booking *${payment.bookingNumber}*.

Your stay is now confirmed. See you at Enchipai Mara Camp! 🌅`;

  return sendWhatsApp(phone, message);
}
