import { NextRequest } from 'next/server';
import { requireAdmin, apiResponse, apiError } from '@/lib/api-utils';
import { publishScheduledPosts } from '@/lib/blog-scheduler';

/**
 * Manual trigger to publish scheduled posts
 * In production, this should be called via a cron job
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const result = await publishScheduledPosts();
    return apiResponse(result, 200, `Published ${result.published} scheduled post(s)`);
  } catch (error) {
    console.error('Publish scheduled posts error:', error);
    return apiError('Internal server error', 500);
  }
}

