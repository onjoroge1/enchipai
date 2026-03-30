"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";

const categories = [
  { label: "All", value: "all" },
  { label: "Wildlife", value: "wildlife" },
  { label: "Culture", value: "culture" },
  { label: "Travel Tips", value: "tips" },
  { label: "Conservation", value: "conservation" },
];

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  featured?: boolean;
  author?: {
    name: string;
    role?: string;
    avatar?: string;
  };
  tags?: string[];
}

interface BlogGridProps {
  posts: BlogPost[];
}

export function BlogGrid({ posts }: BlogGridProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  
  const filteredPosts = activeCategory === "all" 
    ? posts 
    : posts.filter(post => post.category === activeCategory);
  
  const featuredPost = filteredPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setActiveCategory(category.value)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeCategory === category.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Featured Post */}
      {featuredPost && (
        <Link href={`/blog/${featuredPost.slug}`} className="group block mb-12">
          <article className="relative rounded-2xl overflow-hidden">
            <div className="aspect-[16/9] relative">
              <Image
                src={featuredPost.image || "/placeholder.svg"}
                alt={featuredPost.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <Badge className="bg-accent text-accent-foreground mb-3">Featured</Badge>
              <h2 className="font-serif text-2xl sm:text-3xl text-white mb-3 group-hover:text-accent transition-colors text-balance">
                {featuredPost.title}
              </h2>
              <p className="text-white/80 mb-4 line-clamp-2 max-w-2xl">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center gap-4 text-white/60 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(featuredPost.date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {featuredPost.readTime}
                </span>
              </div>
            </div>
          </article>
        </Link>
      )}

      {/* Regular Posts Grid */}
      <div className="grid sm:grid-cols-2 gap-8">
        {regularPosts.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.id} className="group">
            <article>
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <Badge variant="outline" className="mb-3 capitalize">
                {post.category}
              </Badge>
              <h3 className="font-serif text-xl text-foreground mb-2 group-hover:text-primary transition-colors text-balance">
                {post.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-muted-foreground text-xs">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                  </span>
                </div>
                <span className="text-primary text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Read <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
