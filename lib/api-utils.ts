import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from './auth';
import { UserRole } from './prisma-types';
import { ZodError } from 'zod';

/**
 * API Response helper
 */
export function apiResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): NextResponse {
  return NextResponse.json(
    {
      success: status >= 200 && status < 300,
      message,
      data,
    },
    { status }
  );
}

/**
 * API Error helper
 */
export function apiError(
  message: string,
  status: number = 400,
  errors?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  );
}

/**
 * Handle validation errors
 */
export function handleValidationError(error: ZodError): NextResponse {
  const errors = error.errors.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
  }));

  return apiError('Validation failed', 400, errors);
}

/**
 * Require authentication middleware
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: any; session: any } | NextResponse> {
  const session = await auth();

  if (!session || !session.user) {
    return apiError('Unauthorized', 401);
  }

  return { user: session.user, session };
}

/**
 * Require admin role middleware
 */
export async function requireAdmin(
  request: NextRequest
): Promise<{ user: any; session: any } | NextResponse> {
  const authResult = await requireAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (authResult.user.role !== UserRole.ADMIN && authResult.user.role !== UserRole.STAFF) {
    return apiError('Forbidden: Admin access required', 403);
  }

  return authResult;
}

/**
 * Require specific role middleware
 */
export async function requireRole(
  request: NextRequest,
  roles: UserRole[]
): Promise<{ user: any; session: any } | NextResponse> {
  const authResult = await requireAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (!roles.includes(authResult.user.role)) {
    return apiError('Forbidden: Insufficient permissions', 403);
  }

  return authResult;
}

/**
 * Require admin-only role middleware (ADMIN only, not STAFF)
 * Use this for destructive operations like delete
 */
export async function requireAdminOnly(
  request: NextRequest
): Promise<{ user: any; session: any } | NextResponse> {
  const authResult = await requireAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (authResult.user.role !== UserRole.ADMIN) {
    return apiError('Forbidden: Admin-only operation', 403);
  }

  return authResult;
}

/**
 * Parse JSON body with error handling
 */
export async function parseJsonBody<T>(
  request: NextRequest
): Promise<T | NextResponse> {
  try {
    const body = await request.json();
    return body;
  } catch (error) {
    return apiError('Invalid JSON body', 400);
  }
}

