import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { apiResponse, apiError, handleValidationError } from '@/lib/api-utils';
import { authRateLimit } from '@/lib/rate-limit';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * POST /api/auth/register
 *
 * Public registration is disabled. Only admin-invited users can register.
 * Flow: Admin creates user (no password) → User visits /auth/register → Sets their password.
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = await authRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();

    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return handleValidationError(validationResult.error);
    }

    const { name, email, password } = validationResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Already has a password — fully registered
    if (existingUser && existingUser.password) {
      return apiError('User with this email already exists', 409);
    }

    // Pre-created (invited) account exists — activate by setting password
    if (existingUser && !existingUser.password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.update({
        where: { email },
        data: {
          name,
          password: hashedPassword,
          emailVerified: new Date(),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      return apiResponse(
        {
          user,
          message: 'Account activated successfully. You can now sign in.',
        },
        201
      );
    }

    // No pre-created account — reject
    return apiError(
      'Registration is by invitation only. Please contact an administrator to create your account.',
      403
    );
  } catch (error) {
    console.error('Registration error:', error);
    return apiError('Internal server error', 500);
  }
}
