import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { sendPasswordResetEmail } from '@/lib/email';
import { authRateLimit } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Generate reset token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Request password reset
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await authRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const { email } = body;

    if (!email) {
      return apiError('Email is required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists for security
      return apiResponse({ message: 'If the email exists, a password reset link has been sent.' });
    }

    // Generate token
    const token = generateToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour

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

    // Send reset email
    await sendPasswordResetEmail(email, token);

    return apiResponse({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Password reset request error:', error);
    return apiError('Internal server error', 500);
  }
}

// Reset password with token
export async function PATCH(request: NextRequest) {
  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const { token, password } = body;

    if (!token || !password) {
      return apiError('Token and password are required', 400);
    }

    if (password.length < 8) {
      return apiError('Password must be at least 8 characters', 400);
    }

    // Find reset token
    const resetToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!resetToken) {
      return apiError('Invalid or expired token', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { email: resetToken.identifier },
      data: { password: hashedPassword },
    });

    // Delete used token (token is unique, so we can delete by token)
    await prisma.verificationToken.deleteMany({
      where: {
        token: resetToken.token,
      },
    });

    return apiResponse({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    return apiError('Internal server error', 500);
  }
}

