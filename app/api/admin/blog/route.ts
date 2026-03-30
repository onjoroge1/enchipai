import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiResponse, apiError, parseJsonBody } from '@/lib/api-utils';
import { z } from 'zod';
import { BlogPostStatus } from '@/lib/prisma-types';

const createBlogPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  image: z.string().url().optional().or(z.literal('')),
  category: z.string().min(1),
  readTime: z.string().optional(),
  featured: z.boolean().default(false),
  status: z.nativeEnum(BlogPostStatus).default(BlogPostStatus.DRAFT),
  authorName: z.string().min(1),
  authorRole: z.string().optional(),
  authorAvatar: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  publishedAt: z.string().datetime().optional().transform((str) => str ? new Date(str) : undefined),
});

const updateBlogPostSchema = createBlogPostSchema.partial();

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
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

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await parseJsonBody(request);
    if (body instanceof Response) return body;

    const validationResult = createBlogPostSchema.safeParse(body);
    if (!validationResult.success) {
      return apiError('Validation failed', 400, validationResult.error.errors);
    }

    const data = validationResult.data;

    // Generate slug if not provided
    const slug = data.slug || data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Check if slug exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return apiError('Blog post with this slug already exists', 409);
    }

    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount = data.content.split(/\s+/).length;
    const readTime = data.readTime || `${Math.ceil(wordCount / 200)} min`;

    // Set publishedAt if status is PUBLISHED
    const publishedAt = data.status === BlogPostStatus.PUBLISHED 
      ? (data.publishedAt || new Date())
      : null;

    const post = await prisma.blogPost.create({
      data: {
        ...data,
        slug,
        readTime,
        publishedAt,
      },
    });

    return apiResponse(post, 201, 'Blog post created successfully');
  } catch (error) {
    console.error('Create blog post error:', error);
    return apiError('Internal server error', 500);
  }
}

