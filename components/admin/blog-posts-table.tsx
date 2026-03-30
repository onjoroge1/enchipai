"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Copy,
  Calendar,
  Loader2,
  CheckSquare,
  Square,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BlogPostStatus } from "@/lib/prisma-types";
import { Checkbox } from "@/components/ui/checkbox";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image: string | null;
  category: string;
  date: string;
  readTime: string | null;
  status: BlogPostStatus;
  authorName: string;
  views: number;
  featured: boolean;
}

export function BlogPostsTable() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      setLoading(true);
      const url = new URL("/api/admin/blog", window.location.origin);
      if (statusFilter !== "all") {
        url.searchParams.set("status", statusFilter);
      }
      if (searchQuery) {
        url.searchParams.set("search", searchQuery);
      }

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data.data?.posts || []);
      setSelectedPosts(new Set()); // Clear selection on fetch
    } catch (err) {
      console.error("Posts fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPosts();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, statusFilter]);

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/admin/blog/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete post");
      fetchPosts();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete post");
    }
  };

  const handleSelectAll = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(posts.map((p) => p.id)));
    }
  };

  const handleSelectPost = (postId: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  const handleBulkAction = async (action: 'delete' | 'publish' | 'unpublish' | 'archive') => {
    if (selectedPosts.size === 0) {
      alert("Please select at least one post");
      return;
    }

    const actionText = {
      delete: "delete",
      publish: "publish",
      unpublish: "unpublish",
      archive: "archive",
    }[action];

    if (action === 'delete' && !confirm(`Are you sure you want to ${actionText} ${selectedPosts.size} post(s)?`)) {
      return;
    }

    try {
      setBulkActionLoading(true);
      const response = await fetch("/api/admin/blog/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postIds: Array.from(selectedPosts),
          action,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to ${actionText} posts`);
      }

      const data = await response.json();
      alert(data.message || `Successfully ${actionText}ed ${selectedPosts.size} post(s)`);
      setSelectedPosts(new Set());
      fetchPosts();
    } catch (err) {
      console.error("Bulk action error:", err);
      alert(err instanceof Error ? err.message : `Failed to ${actionText} posts`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const filteredPosts = posts;

  const getStatusBadge = (status: BlogPostStatus) => {
    switch (status) {
      case BlogPostStatus.PUBLISHED:
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Published</Badge>;
      case BlogPostStatus.DRAFT:
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Draft</Badge>;
      case BlogPostStatus.SCHEDULED:
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Scheduled</Badge>;
      case BlogPostStatus.ARCHIVED:
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg">All Posts</CardTitle>
            {selectedPosts.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedPosts.size} selected
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={bulkActionLoading}>
                      Bulk Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkAction('publish')}>
                      Publish
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('unpublish')}>
                      Unpublish
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('archive')}>
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleBulkAction('delete')}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPosts(new Set())}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <Button 
            className="bg-primary text-primary-foreground"
            onClick={() => {
              // This will be handled by parent component or dialog
              const event = new CustomEvent('openBlogEditor', { detail: { postId: null } });
              window.dispatchEvent(event);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {["all", "PUBLISHED", "DRAFT", "SCHEDULED", "ARCHIVED"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "capitalize",
                  statusFilter === status && "bg-primary text-primary-foreground"
                )}
              >
                {status.toLowerCase()}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedPosts.size === posts.length && posts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[400px]">Post</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Views</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No blog posts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post) => (
                  <TableRow 
                    key={post.id}
                    className={selectedPosts.has(post.id) ? "bg-primary/5" : ""}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedPosts.has(post.id)}
                        onCheckedChange={() => handleSelectPost(post.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 rounded-lg overflow-hidden relative flex-shrink-0">
                          <Image
                            src={post.image || "/placeholder.svg"}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate max-w-[280px]">
                            {post.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {post.readTime || "N/A"} - {post.authorName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {post.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(post.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(post.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {post.views}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const event = new CustomEvent('openBlogEditor', { detail: { postId: post.id } });
                              window.dispatchEvent(event);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
