/**
 * SMS Service using Africa's Talking
 *
 * Supports sending SMS to Kenyan and international numbers.
 * Uses Africa's Talking sandbox in development.
 *
 * Required env vars:
 *   AT_API_KEY - Africa's Talking API key
 *   AT_USERNAME - Africa's Talking username (use 'sandbox' for testing)
 *   AT_SENDER_ID - Optional sender ID (e.g., 'ENCHIPAI')
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const AfricasTalking = require('africastalking');

interface SMSResult {
  success: boolean;
  messageId?: string;
  cost?: string;
  error?: string;
}

interface BulkSMSResult {
  success: boolean;
  sent: number;
  failed: number;
  results: SMSResult[];
}

function getClient() {
  const apiKey = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME || 'sandbox';

  if (!apiKey) {
    return null;
  }

  const credentials = { apiKey, username };
  return AfricasTalking(credentials);
}

/**
 * Send SMS to a single recipient
 */
export async function sendSMS(
  to: string,
  message: string
): Promise<SMSResult> {
  const client = getClient();

  if (!client) {
    console.warn('SMS service not configured. AT_API_KEY is missing.');
    if (process.env.NODE_ENV === 'development') {
      console.log('📱 SMS would be sent:', { to, message });
      return { success: true, messageId: 'dev-' + Date.now() };
    }
    return { success: false, error: 'SMS service not configured' };
  }

  try {
    const sms = client.SMS;
    const options: { to: string[]; message: string; from?: string } = {
      to: [to],
      message,
    };

    // Only set sender ID in production (sandbox doesn't support custom sender IDs)
    if (process.env.AT_USERNAME !== 'sandbox' && process.env.AT_SENDER_ID) {
      options.from = process.env.AT_SENDER_ID;
    }

    const result = await sms.send(options);
    const recipient = result.SMSMessageData?.Recipients?.[0];

    if (recipient?.statusCode === 101 || recipient?.status === 'Success') {
      return {
        success: true,
        messageId: recipient.messageId,
        cost: recipient.cost,
      };
    }

    return {
      success: false,
      error: recipient?.status || 'Unknown error',
    };
  } catch (error) {
    console.error('SMS send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'SMS send failed',
    };
  }
}

/**
 * Send SMS to multiple recipients
 */
export async function sendBulkSMS(
  recipients: string[],
  message: string
): Promise<BulkSMSResult> {
  const client = getClient();

  if (!client) {
    console.warn('SMS service not configured. AT_API_KEY is missing.');
    if (process.env.NODE_ENV === 'development') {
      console.log('📱 Bulk SMS would be sent:', { recipients, message });
      return {
        success: true,
        sent: recipients.length,
        failed: 0,
        results: recipients.map((to) => ({
          success: true,
          messageId: 'dev-' + Date.now(),
        })),
      };
    }
    return { success: false, sent: 0, failed: recipients.length, results: [] };
  }

  try {
    const sms = client.SMS;
    const options: { to: string[]; message: string; from?: string } = {
      to: recipients,
      message,
    };

    if (process.env.AT_USERNAME !== 'sandbox' && process.env.AT_SENDER_ID) {
      options.from = process.env.AT_SENDER_ID;
    }

    const result = await sms.send(options);
    const messageData = result.SMSMessageData?.Recipients || [];

    const results: SMSResult[] = messageData.map((r: { statusCode: number; status: string; messageId: string; cost: string }) => ({
      success: r.statusCode === 101 || r.status === 'Success',
      messageId: r.messageId,
      cost: r.cost,
      error: r.statusCode !== 101 ? r.status : undefined,
    }));

    return {
      success: true,
      sent: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  } catch (error) {
    console.error('Bulk SMS error:', error);
    return {
      success: false,
      sent: 0,
      failed: recipients.length,
      results: [],
    };
  }
}

/**
 * Check if SMS service is configured
 */
export function isSMSConfigured(): boolean {
  return !!process.env.AT_API_KEY;
}

/**
 * Send booking confirmation SMS
 */
export async function sendBookingConfirmationSMS(
  phone: string,
  booking: { bookingNumber: string; tentName: string; checkIn: string; checkOut: string }
): Promise<SMSResult> {
  const checkIn = new Date(booking.checkIn).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
  const checkOut = new Date(booking.checkOut).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });

  const message = `Enchipai Mara Camp: Booking ${booking.bookingNumber} confirmed! ${booking.tentName}, ${checkIn} - ${checkOut}. We look forward to welcoming you!`;
  return sendSMS(phone, message);
}

/**
 * Send payment confirmation SMS
 */
export async function sendPaymentConfirmationSMS(
  phone: string,
  payment: { amount: number; bookingNumber: string }
): Promise<SMSResult> {
  const message = `Enchipai Mara Camp: Payment of $${payment.amount.toLocaleString()} received for booking ${payment.bookingNumber}. Thank you!`;
  return sendSMS(phone, message);
}
