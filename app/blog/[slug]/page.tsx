import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogPostContent } from "@/components/blog/blog-post-content";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";
import { BlogPostStatus } from "@/lib/prisma-types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post || post.status !== BlogPostStatus.PUBLISHED) {
      return {
        title: "Post Not Found | Enchipai Mara Camp",
      };
    }

    return {
      title: `${post.title} | Enchipai Mara Camp Blog`,
      description: post.excerpt || undefined,
      openGraph: {
        title: post.title,
        description: post.excerpt || undefined,
        images: post.image ? [post.image] : undefined,
        type: "article",
        publishedTime: post.publishedAt?.toISOString(),
        authors: [post.authorName],
      },
    };
  } catch {
    return {
      title: "Post Not Found | Enchipai Mara Camp",
    };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post || post.status !== BlogPostStatus.PUBLISHED) {
      notFound();
    }

    // Get related posts (same category, different slug)
    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        category: post.category,
        slug: { not: slug },
        status: BlogPostStatus.PUBLISHED,
      },
      take: 3,
      orderBy: {
        publishedAt: 'desc',
      },
    });

    // Transform to match component interface
    const transformedPost = {
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content,
      image: post.image || "",
      category: post.category,
      date: post.publishedAt?.toISOString() || post.date.toISOString(),
      readTime: post.readTime || "5 min",
      featured: post.featured,
      author: {
        name: post.authorName,
        role: post.authorRole || "",
        avatar: post.authorAvatar || "",
      },
      tags: post.tags,
      status: post.status,
    };

    const transformedRelated = relatedPosts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt || "",
      image: p.image || "",
      category: p.category,
      date: p.publishedAt?.toISOString() || p.date.toISOString(),
      readTime: p.readTime || "5 min",
      author: {
        name: p.authorName,
        role: p.authorRole || "",
        avatar: p.authorAvatar || "",
      },
    }));

    return (
      <>
        <Header />
        <BlogPostContent post={transformedPost} relatedPosts={transformedRelated} />
        <Footer />
      </>
    );
  } catch (error) {
    console.error("Blog post fetch error:", error);
    notFound();
  }
}
