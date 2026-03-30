import { BlogHero } from "@/components/blog/blog-hero";
import { BlogGrid } from "@/components/blog/blog-grid";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";
import { BlogPostStatus } from "@/lib/prisma-types";

export default async function BlogPage() {
  // Fetch published blog posts
  const posts = await prisma.blogPost.findMany({
    where: {
      status: BlogPostStatus.PUBLISHED,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 20,
  });

  // Transform to match component interface
  const transformedPosts = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
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
  }));

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <BlogHero />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            <BlogGrid posts={transformedPosts} />
          </div>
          <aside className="w-full lg:w-80 shrink-0">
            <BlogSidebar />
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  );
}
