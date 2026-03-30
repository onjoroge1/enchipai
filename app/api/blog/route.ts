import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse, apiError } from '@/lib/api-utils';
import { BlogPostStatus } from '@/lib/prisma-types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (slug) {
      const post = await prisma.blogPost.findUnique({
        where: { slug },
      });

      if (!post || post.status !== BlogPostStatus.PUBLISHED) {
        return apiError('Blog post not found', 404);
      }

      // Increment views
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      });

      return apiResponse(post);
    }

    const where: any = {
      status: BlogPostStatus.PUBLISHED,
    };

    if (featured === 'true') {
      where.featured = true;
    }

    if (category) {
      where.category = category;
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: {
          publishedAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return apiResponse({
      posts,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    return apiError('Internal server error', 500);
  }
}

