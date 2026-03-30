import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';
import { BlogPostStatus } from '@/lib/prisma-types';

const bulkActionSchema = z.object({
  postIds: z.array(z.string()).min(1),
  action: z.enum(['delete', 'publish', 'unpublish', 'archive']),
});

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = bulkActionSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const { postIds, action } = validationResult.data;

    let result;
    switch (action) {
      case 'delete':
        result = await prisma.blogPost.deleteMany({
          where: {
            id: { in: postIds },
          },
        });
        return apiResponse(
          { deleted: result.count },
          200,
          `Successfully deleted ${result.count} post(s)`
        );

      case 'publish':
        result = await prisma.blogPost.updateMany({
          where: {
            id: { in: postIds },
          },
          data: {
            status: BlogPostStatus.PUBLISHED,
            publishedAt: new Date(),
          },
        });
        return apiResponse(
          { updated: result.count },
          200,
          `Successfully published ${result.count} post(s)`
        );

      case 'unpublish':
        result = await prisma.blogPost.updateMany({
          where: {
            id: { in: postIds },
          },
          data: {
            status: BlogPostStatus.DRAFT,
          },
        });
        return apiResponse(
          { updated: result.count },
          200,
          `Successfully unpublished ${result.count} post(s)`
        );

      case 'archive':
        result = await prisma.blogPost.updateMany({
          where: {
            id: { in: postIds },
          },
          data: {
            status: BlogPostStatus.ARCHIVED,
          },
        });
        return apiResponse(
          { updated: result.count },
          200,
          `Successfully archived ${result.count} post(s)`
        );

      default:
        return apiError('Invalid action', 400);
    }
  } catch (error) {
    console.error('Bulk action error:', error);
    return apiError('Internal server error', 500);
  }
}

