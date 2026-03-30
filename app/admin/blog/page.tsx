"use client";

import { useState, useEffect } from "react";
import { BlogStats } from "@/components/admin/blog-stats";
import { BlogPostsTable } from "@/components/admin/blog-posts-table";
import { BlogEditorRich } from "@/components/admin/blog-editor-rich";

export default function AdminBlogPage() {
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleOpenEditor = (event: CustomEvent) => {
      setEditingPostId(event.detail.postId || null);
    };

    window.addEventListener('openBlogEditor', handleOpenEditor as EventListener);
    return () => {
      window.removeEventListener('openBlogEditor', handleOpenEditor as EventListener);
    };
  }, []);

  const handleSuccess = () => {
    setEditingPostId(null);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-foreground">Blog Management</h1>
        <p className="text-muted-foreground">Create, edit, and manage your blog posts</p>
      </div>

      <BlogStats />
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BlogPostsTable key={refreshKey} />
        </div>
        <div>
          <BlogEditorRich postId={editingPostId || undefined} onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
