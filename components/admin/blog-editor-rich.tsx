"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ImagePlus, 
  Save, 
  Send, 
  X, 
  Loader2,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Heading1,
  Heading2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BlogPostStatus } from "@/lib/prisma-types";
import { useSession } from "next-auth/react";

const categories = [
  { value: "wildlife", label: "Wildlife" },
  { value: "culture", label: "Culture" },
  { value: "tips", label: "Travel Tips" },
  { value: "conservation", label: "Conservation" },
];

interface BlogEditorProps {
  postId?: string;
  onSuccess?: () => void;
}

export function BlogEditorRich({ postId, onSuccess }: BlogEditorProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    category: "",
    status: BlogPostStatus.DRAFT,
    image: "",
    featured: false,
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4",
      },
    },
  });

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  async function fetchPost() {
    try {
      const response = await fetch(`/api/admin/blog/${postId}`);
      if (!response.ok) throw new Error("Failed to fetch post");
      const data = await response.json();
      const post = data.data;
      
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        category: post.category,
        status: post.status,
        image: post.image || "",
        featured: post.featured,
        tags: post.tags || [],
      });
      
      if (editor && post.content) {
        editor.commands.setContent(post.content);
      }
    } catch (err) {
      console.error("Fetch post error:", err);
    }
  }

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const handleSubmit = async (publish: boolean) => {
    if (!editor || !formData.title || !formData.category) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const content = editor.getHTML();
      let status = publish ? BlogPostStatus.PUBLISHED : formData.status;
      let publishedAt: string | undefined;

      // Handle scheduling
      if (status === BlogPostStatus.SCHEDULED || (publish && scheduledDate && scheduledTime)) {
        status = BlogPostStatus.SCHEDULED;
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
        if (scheduledDateTime > new Date()) {
          publishedAt = scheduledDateTime.toISOString();
        } else {
          setError("Scheduled date must be in the future");
          setLoading(false);
          return;
        }
      } else if (status === BlogPostStatus.PUBLISHED) {
        publishedAt = new Date().toISOString();
      }

      const payload = {
        ...formData,
        content,
        status,
        authorName: session?.user?.name || "Admin",
        authorRole: session?.user?.role || "ADMIN",
        publishedAt,
      };

      const url = postId ? `/api/admin/blog/${postId}` : "/api/admin/blog";
      const method = postId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save post");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess();
        if (!postId) {
          // Reset form for new post
          setFormData({
            title: "",
            slug: "",
            excerpt: "",
            category: "",
            status: BlogPostStatus.DRAFT,
            image: "",
            featured: false,
            tags: [],
          });
          editor?.commands.clearContent();
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{postId ? "Edit Post" : "New Post"}</CardTitle>
        <CardDescription>Create or edit a blog post</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertDescription>Post saved successfully!</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (!postId && !formData.slug) {
                const slug = e.target.value
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "");
                setFormData((prev) => ({ ...prev, slug }));
              }
            }}
            placeholder="Enter post title..."
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="auto-generated"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder="Brief description of the post..."
            className="min-h-[80px] resize-none"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as BlogPostStatus })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BlogPostStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={BlogPostStatus.PUBLISHED}>Published</SelectItem>
                <SelectItem value={BlogPostStatus.SCHEDULED}>Scheduled</SelectItem>
                <SelectItem value={BlogPostStatus.ARCHIVED}>Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Content *</Label>
          <div className="border border-border rounded-lg">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-border bg-secondary/50">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={editor?.isActive("bold") ? "bg-primary/10" : ""}
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={editor?.isActive("italic") ? "bg-primary/10" : ""}
              >
                <Italic className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor?.isActive("heading", { level: 1 }) ? "bg-primary/10" : ""}
              >
                <Heading1 className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor?.isActive("heading", { level: 2 }) ? "bg-primary/10" : ""}
              >
                <Heading2 className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={editor?.isActive("bulletList") ? "bg-primary/10" : ""}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const url = window.prompt("Enter URL:");
                  if (url) {
                    editor?.chain().focus().setLink({ href: url }).run();
                  }
                }}
                className={editor?.isActive("link") ? "bg-primary/10" : ""}
              >
                <LinkIcon className="w-4 h-4" />
              </Button>
            </div>
            {/* Editor */}
            <EditorContent editor={editor} className="min-h-[300px]" />
          </div>
        </div>

          <div className="space-y-2">
            <Label>Featured Image URL</Label>
            <div className="flex gap-2">
              <Input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
                disabled={loading}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Open image upload dialog (placeholder for now)
                  const url = prompt("Enter image URL or upload (upload coming soon):");
                  if (url) setFormData({ ...formData, image: url });
                }}
                disabled={loading}
              >
                Upload
              </Button>
            </div>
            {formData.image && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {formData.status === BlogPostStatus.SCHEDULED || (
            <div className="space-y-2">
              <Label>Schedule Publication (optional)</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="scheduledDate" className="text-xs">Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="scheduledTime" className="text-xs">Time</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    disabled={loading || !scheduledDate}
                  />
                </div>
              </div>
              {scheduledDate && scheduledTime && (
                <p className="text-xs text-muted-foreground">
                  Will be published on {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
                </p>
              )}
            </div>
          )}

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className="flex-1"
              disabled={loading}
            />
            <Button variant="outline" size="sm" onClick={addTag} disabled={loading}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive"
                  disabled={loading}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              disabled={loading}
            />
            <Label htmlFor="featured">Featured Post</Label>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => handleSubmit(false)}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </>
            )}
          </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground"
              onClick={() => {
                if (scheduledDate && scheduledTime) {
                  setFormData({ ...formData, status: BlogPostStatus.SCHEDULED });
                  handleSubmit(false);
                } else {
                  handleSubmit(true);
                }
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {formData.status === BlogPostStatus.SCHEDULED ? "Scheduling..." : "Publishing..."}
                </>
              ) : scheduledDate && scheduledTime ? (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Schedule
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

