import { sendEmail } from './email';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  variables: string[];
}

export interface TemplateVariables {
  [key: string]: string | number | Date | null | undefined;
}

/**
 * Base email template with consistent styling
 */
function getBaseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f4f4f4;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
        }
        .header { 
          background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%); 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 24px; 
          font-weight: 600;
        }
        .content { 
          padding: 30px 20px; 
          background: #ffffff;
        }
        .content p { 
          margin: 0 0 15px 0;
        }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background: #1a472a; 
          color: white; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 20px 0; 
          font-weight: 500;
        }
        .button:hover {
          background: #2d5a3d;
        }
        .footer { 
          text-align: center; 
          padding: 20px; 
          color: #666; 
          font-size: 12px; 
          background: #f9f9f9;
          border-top: 1px solid #e5e5e5;
        }
        .footer a {
          color: #1a472a;
          text-decoration: none;
        }
        .details-box {
          background: #f9f9f9;
          border-left: 4px solid #1a472a;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .details-box p {
          margin: 5px 0;
        }
        .details-box strong {
          color: #1a472a;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Enchipai Mara Camp</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p><strong>Enchipai Mara Camp</strong></p>
          <p>Masai Mara, Kenya</p>
          <p>
            <a href="${process.env.NEXTAUTH_URL || 'https://enchipai.com'}">Visit our website</a> | 
            <a href="mailto:bookings@enchipai.com">Contact us</a>
          </p>
          <p style="margin-top: 15px; font-size: 11px; color: #999;">
            This email was sent to you because you have an account or booking with Enchipai Mara Camp.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Replace template variables in a string
 */
function replaceVariables(template: string, variables: TemplateVariables): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    const stringValue = value instanceof Date 
      ? value.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : value?.toString() || '';
    result = result.replace(regex, stringValue);
  });
  return result;
}

/**
 * Booking Confirmation Email Template
 */
export async function sendBookingConfirmationTemplate(
  email: string,
  variables: {
    bookingNumber: string;
    guestName: string;
    tentName: string;
    checkIn: Date | string;
    checkOut: Date | string;
    nights: number;
    totalAmount: number;
    addOns?: string;
    specialRequests?: string;
    bookingId?: string;
  }
) {
  const checkInDate = typeof variables.checkIn === 'string' 
    ? new Date(variables.checkIn) 
    : variables.checkIn;
  const checkOutDate = typeof variables.checkOut === 'string' 
    ? new Date(variables.checkOut) 
    : variables.checkOut;

  const content = `
    <p>Dear {{guestName}},</p>
    <p>Thank you for choosing Enchipai Mara Camp! We're delighted to confirm your booking.</p>
    
    <div class="details-box">
      <h2 style="margin-top: 0; color: #1a472a;">Booking Details</h2>
      <p><strong>Booking Number:</strong> {{bookingNumber}}</p>
      <p><strong>Tent:</strong> {{tentName}}</p>
      <p><strong>Check-in:</strong> ${checkInDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</p>
      <p><strong>Check-out:</strong> ${checkOutDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</p>
      <p><strong>Duration:</strong> {{nights}} night(s)</p>
      <p><strong>Total Amount:</strong> $${Number(variables.totalAmount).toLocaleString()}</p>
      ${variables.addOns ? `<p><strong>Add-ons:</strong> ${variables.addOns}</p>` : ''}
      ${variables.specialRequests ? `<p><strong>Special Requests:</strong> ${variables.specialRequests}</p>` : ''}
    </div>

    ${variables.bookingId ? `
    <p style="text-align: center; margin: 25px 0;">
      <a href="${process.env.NEXTAUTH_URL || 'https://enchipai.com'}/bookings/${variables.bookingId}/confirmation" class="button">
        Complete Payment
      </a>
    </p>
    <p style="text-align: center; font-size: 14px; color: #666;">
      Secure your booking by completing payment via M-Pesa, Visa, or Mastercard.
    </p>
    ` : ''}

    <p>We look forward to welcoming you to the Masai Mara! If you have any questions or special requests, please don't hesitate to contact us.</p>
    
    <p>Best regards,<br>The Enchipai Mara Camp Team</p>
  `;

  const html = getBaseTemplate(content);
  const subject = `Booking Confirmation - ${variables.bookingNumber}`;

  return sendEmail({
    to: email,
    subject,
    html,
  });
}

/**
 * Booking Cancellation Email Template
 */
export async function sendBookingCancellationTemplate(
  email: string,
  variables: {
    bookingNumber: string;
    guestName: string;
    tentName: string;
    checkIn: Date | string;
    refundAmount?: number;
  }
) {
  const checkInDate = typeof variables.checkIn === 'string' 
    ? new Date(variables.checkIn) 
    : variables.checkIn;

  const content = `
    <p>Dear {{guestName}},</p>
    <p>We're sorry to see you go. Your booking has been cancelled as requested.</p>
    
    <div class="details-box">
      <h2 style="margin-top: 0; color: #1a472a;">Cancelled Booking</h2>
      <p><strong>Booking Number:</strong> {{bookingNumber}}</p>
      <p><strong>Tent:</strong> {{tentName}}</p>
      <p><strong>Check-in Date:</strong> ${checkInDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</p>
      ${variables.refundAmount ? `<p><strong>Refund Amount:</strong> $${Number(variables.refundAmount).toLocaleString()}</p>` : ''}
    </div>
    
    ${variables.refundAmount ? '<p>Your refund will be processed within 5-7 business days.</p>' : ''}
    <p>We hope to welcome you to Enchipai Mara Camp in the future!</p>
    
    <p>Best regards,<br>The Enchipai Mara Camp Team</p>
  `;

  const html = getBaseTemplate(content);
  const subject = `Booking Cancelled - ${variables.bookingNumber}`;

  return sendEmail({
    to: email,
    subject,
    html,
  });
}

/**
 * Payment Confirmation Email Template
 */
export async function sendPaymentConfirmationTemplate(
  email: string,
  variables: {
    guestName: string;
    bookingNumber: string;
    amount: number;
    paymentMethod: string;
    transactionId?: string;
  }
) {
  const content = `
    <p>Dear {{guestName}},</p>
    <p>We've received your payment. Thank you!</p>
    
    <div class="details-box">
      <h2 style="margin-top: 0; color: #1a472a;">Payment Details</h2>
      <p><strong>Booking Number:</strong> {{bookingNumber}}</p>
      <p><strong>Amount Paid:</strong> $${Number(variables.amount).toLocaleString()}</p>
      <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
      ${variables.transactionId ? `<p><strong>Transaction ID:</strong> {{transactionId}}</p>` : ''}
    </div>
    
    <p>Your payment has been successfully processed. You can view your booking details in your dashboard.</p>
    
    <p>Best regards,<br>The Enchipai Mara Camp Team</p>
  `;

  const html = getBaseTemplate(content);
  const subject = `Payment Confirmed - ${variables.bookingNumber}`;

  return sendEmail({
    to: email,
    subject,
    html,
  });
}

/**
 * Welcome Email Template (for new users)
 */
export async function sendWelcomeTemplate(
  email: string,
  variables: {
    guestName: string;
  }
) {
  const content = `
    <p>Dear {{guestName}},</p>
    <p>Welcome to Enchipai Mara Camp! We're thrilled to have you join our community.</p>
    
    <p>As a member, you can:</p>
    <ul>
      <li>Book your stay at our luxury tents</li>
      <li>Manage your bookings and preferences</li>
      <li>Receive exclusive offers and updates</li>
      <li>Access special experiences and activities</li>
    </ul>
    
    <p>Ready to start your adventure? <a href="${process.env.NEXTAUTH_URL || 'https://enchipai.com'}/tents" class="button">Explore Our Tents</a></p>
    
    <p>If you have any questions, our team is here to help!</p>
    
    <p>Best regards,<br>The Enchipai Mara Camp Team</p>
  `;

  const html = getBaseTemplate(content);
  const subject = 'Welcome to Enchipai Mara Camp';

  return sendEmail({
    to: email,
    subject,
    html,
  });
}

/**
 * Reminder Email Template (for upcoming bookings)
 */
export async function sendBookingReminderTemplate(
  email: string,
  variables: {
    guestName: string;
    bookingNumber: string;
    tentName: string;
    checkIn: Date | string;
    daysUntil: number;
  }
) {
  const checkInDate = typeof variables.checkIn === 'string' 
    ? new Date(variables.checkIn) 
    : variables.checkIn;

  const content = `
    <p>Dear {{guestName}},</p>
    <p>We're excited to welcome you to Enchipai Mara Camp in just {{daysUntil}} day(s)!</p>
    
    <div class="details-box">
      <h2 style="margin-top: 0; color: #1a472a;">Your Upcoming Stay</h2>
      <p><strong>Booking Number:</strong> {{bookingNumber}}</p>
      <p><strong>Tent:</strong> {{tentName}}</p>
      <p><strong>Check-in:</strong> ${checkInDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</p>
    </div>
    
    <p><strong>What to expect:</strong></p>
    <ul>
      <li>Check-in time: 2:00 PM</li>
      <li>Check-out time: 11:00 AM</li>
      <li>Complimentary breakfast included</li>
      <li>Game drives available upon request</li>
    </ul>
    
    <p>If you have any questions or special requests, please contact us at bookings@enchipai.com or +254 700 123 456.</p>
    
    <p>We can't wait to see you!</p>
    <p>Best regards,<br>The Enchipai Mara Camp Team</p>
  `;

  const html = getBaseTemplate(content);
  const subject = `Reminder: Your Stay at Enchipai Mara Camp - ${variables.bookingNumber}`;

  return sendEmail({
    to: email,
    subject,
    html,
  });
}

/**
 * Generic template renderer
 */
export function renderTemplate(template: string, variables: TemplateVariables): string {
  return replaceVariables(template, variables);
}

