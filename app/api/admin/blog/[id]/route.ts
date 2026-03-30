import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';
import { BlogPostStatus } from '@/lib/prisma-types';

const updateBlogPostSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1).optional(),
  image: z.string().url().optional().or(z.literal('')),
  category: z.string().min(1).optional(),
  readTime: z.string().optional(),
  featured: z.boolean().optional(),
  status: z.nativeEnum(BlogPostStatus).optional(),
  authorName: z.string().min(1).optional(),
  authorRole: z.string().optional(),
  authorAvatar: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  publishedAt: z.string().datetime().optional().transform((str) => str ? new Date(str) : undefined),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      return apiError('Blog post not found', 404);
    }

    return apiResponse(post);
  } catch (error) {
    console.error('Get blog post error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = await params;
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = updateBlogPostSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;

    // Check if slug is being updated and if it conflicts
    if (data.slug) {
      const existingPost = await prisma.blogPost.findUnique({
        where: { slug: data.slug },
      });

      if (existingPost && existingPost.id !== id) {
        return apiError('Blog post with this slug already exists', 409);
      }
    }

    // Calculate read time if content is updated
    let readTime = data.readTime;
    if (data.content && !readTime) {
      const wordCount = data.content.split(/\s+/).length;
      readTime = `${Math.ceil(wordCount / 200)} min`;
    }

    // Handle publishedAt based on status
    let publishedAt = data.publishedAt;
    if (data.status === BlogPostStatus.PUBLISHED && !publishedAt) {
      const currentPost = await prisma.blogPost.findUnique({
        where: { id },
      });
      publishedAt = currentPost?.publishedAt || new Date();
    } else if (data.status && data.status !== BlogPostStatus.PUBLISHED) {
      publishedAt = null;
    }

    const updateData: any = { ...data };
    if (readTime) updateData.readTime = readTime;
    if (publishedAt !== undefined) updateData.publishedAt = publishedAt;

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
    });

    return apiResponse(post, 200, 'Blog post updated successfully');
  } catch (error) {
    console.error('Update blog post error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { id } = await params;
    await prisma.blogPost.delete({
      where: { id },
    });

    return apiResponse(null, 200, 'Blog post deleted successfully');
  } catch (error) {
    console.error('Delete blog post error:', error);
    return apiError('Internal server error', 500);
  }
}

