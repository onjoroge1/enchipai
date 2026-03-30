"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { BlogPost } from "@/lib/blog-data";

interface BlogPostContentProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export function BlogPostContent({ post, relatedPosts }: BlogPostContentProps) {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="relative h-[50vh] min-h-[400px]">
        <Image
          src={post.image || "/placeholder.svg"}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        {/* Back Link */}
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Article Header */}
        <article className="bg-card rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-10">
            {/* Category Badge */}
            <Badge className="bg-accent text-accent-foreground mb-4 capitalize">
              {post.category}
            </Badge>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground mb-6 text-balance leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-border">
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden relative">
                  <Image
                    src={post.author.avatar || "/placeholder.svg"}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">{post.author.name}</p>
                  <p className="text-sm text-muted-foreground">{post.author.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-muted-foreground text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </span>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground mr-2">Share:</span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none mt-8 
              prose-headings:font-serif prose-headings:text-foreground
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-strong:text-foreground
              prose-ul:text-muted-foreground prose-li:marker:text-primary
              prose-ol:text-muted-foreground
              prose-blockquote:border-l-primary prose-blockquote:bg-secondary/30 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
              prose-table:text-sm
              prose-th:bg-secondary prose-th:text-foreground prose-th:font-medium prose-th:py-3 prose-th:px-4
              prose-td:py-3 prose-td:px-4 prose-td:border-border
            ">
              <div dangerouslySetInnerHTML={{ __html: formatContent(post.content) }} />
            </div>

            {/* Tags */}
            <div className="mt-10 pt-8 border-t border-border">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground mr-2">Tags:</span>
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 mb-20">
            <h2 className="font-serif text-2xl text-foreground mb-8">Related Articles</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link href={`/blog/${relatedPost.slug}`} key={relatedPost.id} className="group">
                  <Card className="overflow-hidden h-full">
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={relatedPost.image || "/placeholder.svg"}
                        alt={relatedPost.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <Badge variant="outline" className="mb-2 capitalize text-xs">
                        {relatedPost.category}
                      </Badge>
                      <h3 className="font-serif text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2">{relatedPost.date}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function formatContent(content: string): string {
  // Convert markdown-like content to HTML
  return content
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^\*\*(.*)\*\*$/gim, '<strong>$1</strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)\n(?=<li>)/gim, '$1')
    .replace(/(<li>.*<\/li>)(?!\n<li>)/gis, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/gim, '')
    .replace(/\n\n/gim, '</p><p>')
    .replace(/^\| (.*) \|$/gim, (match) => {
      const cells = match.slice(1, -1).split('|').map(cell => cell.trim());
      const isHeader = cells.some(cell => cell.includes('---'));
      if (isHeader) return '';
      return `<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
    })
    .replace(/\*([^*]+)\*/gim, '<em>$1</em>');
}
