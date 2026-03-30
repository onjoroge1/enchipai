import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse, apiError } from '@/lib/api-utils';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

// Generate verification token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Request verification email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return apiError('Email is required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists for security
      return apiResponse({ message: 'If the email exists, a verification link has been sent.' });
    }

    if (user.emailVerified) {
      return apiResponse({ message: 'Email is already verified.' });
    }

    // Generate token
    const token = generateToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hours

    // Delete old tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Store new token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, token);

    return apiResponse({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Verify email error:', error);
    return apiError('Internal server error', 500);
  }
}

// Verify email with token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return apiError('Token is required', 400);
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!verificationToken) {
      return apiError('Invalid or expired token', 400);
    }

    // Verify user email
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Delete used token (token is unique, so we can delete by token)
    await prisma.verificationToken.deleteMany({
      where: {
        token: verificationToken.token,
      },
    });

    return apiResponse({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    return apiError('Internal server error', 500);
  }
}

