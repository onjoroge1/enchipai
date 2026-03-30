import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { sendEmail } from '@/lib/email';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'STAFF', 'GUEST']),
  phone: z.string().optional(),
});

/**
 * GET /api/admin/users - List all users
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          emailVerified: true,
          createdAt: true,
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Check if users have set passwords (are "activated")
    const usersWithPassword = await prisma.user.findMany({
      where: { id: { in: users.map((u) => u.id) } },
      select: { id: true, password: true },
    });

    const passwordMap = new Map(
      usersWithPassword.map((u) => [u.id, !!u.password])
    );

    const enrichedUsers = users.map((u) => ({
      ...u,
      activated: passwordMap.get(u.id) ?? false,
      bookingCount: u._count.bookings,
    }));

    return apiResponse({
      users: enrichedUsers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('List users error:', error);
    return apiError('Internal server error', 500);
  }
}

/**
 * POST /api/admin/users - Create/invite a new user
 * Creates a user without a password. The user sets their password via /auth/register.
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const body = await parseJsonBody(request);
  if (body instanceof Response) return body;

  const validation = createUserSchema.safeParse(body);
  if (!validation.success) {
    return apiError('Validation failed', 400, validation.error.errors);
  }

  const { name, email, role, phone } = validation.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError('A user with this email already exists', 409);
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        phone: phone || null,
        // No password — user will set it via the registration page
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    // Send invitation email
    const appUrl = process.env.NEXTAUTH_URL || 'https://enchipai.com';
    try {
      await sendEmail({
        to: email,
        subject: 'You\'re Invited to Enchipai Mara Camp',
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0;">Welcome to Enchipai Mara Camp</h1>
              </div>
              <div style="padding: 30px; background: #fff;">
                <p>Hello ${name},</p>
                <p>An account has been created for you at Enchipai Mara Camp with the role of <strong>${role}</strong>.</p>
                <p>To activate your account, please visit the link below and set your password:</p>
                <p style="text-align: center; margin: 25px 0;">
                  <a href="${appUrl}/auth/register" style="display: inline-block; padding: 12px 24px; background: #1a472a; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
                    Activate Your Account
                  </a>
                </p>
                <p>Use your email <strong>${email}</strong> when registering.</p>
                <p>Best regards,<br>The Enchipai Team</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
    }

    return apiResponse(user, 201, 'User created successfully');
  } catch (error) {
    console.error('Create user error:', error);
    return apiError('Internal server error', 500);
  }
}
