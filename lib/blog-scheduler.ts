import { prisma } from './prisma';
import { BlogPostStatus } from './prisma-types';

/**
 * Check and publish scheduled blog posts
 * This should be run periodically (e.g., via cron job or scheduled task)
 */
export async function publishScheduledPosts() {
  try {
    const now = new Date();
    
    // Find all scheduled posts that should be published
    const scheduledPosts = await prisma.blogPost.findMany({
      where: {
        status: BlogPostStatus.SCHEDULED,
        publishedAt: {
          lte: now,
        },
      },
    });

    // Update status to PUBLISHED
    const updatePromises = scheduledPosts.map((post) =>
      prisma.blogPost.update({
        where: { id: post.id },
        data: {
          status: BlogPostStatus.PUBLISHED,
          publishedAt: post.publishedAt || now,
        },
      })
    );

    await Promise.all(updatePromises);

    return {
      published: scheduledPosts.length,
      posts: scheduledPosts.map((p) => ({ id: p.id, title: p.title })),
    };
  } catch (error) {
    console.error('Publish scheduled posts error:', error);
    throw error;
  }
}

