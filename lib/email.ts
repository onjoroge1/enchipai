import { Resend } from 'resend';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!resend) {
    console.warn('Email service not configured. RESEND_API_KEY is missing.');
    // In development, log the email instead
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would be sent:', {
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      return true;
    }
    return false;
  }

  try {
    await resend.emails.send({
      from: options.from || process.env.EMAIL_FROM || 'Enchipai Mara Camp <noreply@enchipai.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

// Email templates
export async function sendBookingConfirmationEmail(
  email: string,
  booking: {
    bookingNumber: string | null;
    tentName: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
  }
) {
  const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const checkOutDate = new Date(booking.checkOut).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a472a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Dear Guest,</p>
          <p>Thank you for choosing Enchipai Mara Camp. Your booking has been confirmed!</p>
          
          <div class="booking-details">
            <h2>Booking Details</h2>
            <p><strong>Booking Number:</strong> ${booking.bookingNumber || 'N/A'}</p>
            <p><strong>Tent:</strong> ${booking.tentName}</p>
            <p><strong>Check-in:</strong> ${checkInDate}</p>
            <p><strong>Check-out:</strong> ${checkOutDate}</p>
            <p><strong>Total Amount:</strong> $${Number(booking.totalAmount).toLocaleString()}</p>
          </div>
          
          <p>We look forward to welcoming you to the Masai Mara!</p>
          <p>If you have any questions, please contact us at bookings@enchipai.com or +254 700 123 456.</p>
        </div>
        <div class="footer">
          <p>Enchipai Mara Camp | Masai Mara, Kenya</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Booking Confirmation - ${booking.bookingNumber || 'Enchipai Mara Camp'}`,
    html,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a472a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #1a472a; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email</h1>
        </div>
        <div class="content">
          <p>Thank you for registering with Enchipai Mara Camp!</p>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" class="button">Verify Email</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>Enchipai Mara Camp | Masai Mara, Kenya</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - Enchipai Mara Camp',
    html,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a472a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #1a472a; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>You requested to reset your password for your Enchipai Mara Camp account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>Enchipai Mara Camp | Masai Mara, Kenya</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - Enchipai Mara Camp',
    html,
  });
}

