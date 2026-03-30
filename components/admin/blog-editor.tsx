"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePlus, Save, Send, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const categories = [
  { value: "wildlife", label: "Wildlife" },
  { value: "culture", label: "Culture" },
  { value: "tips", label: "Travel Tips" },
  { value: "conservation", label: "Conservation" },
];

export function BlogEditor() {
  const [tags, setTags] = useState<string[]>(["Safari"]);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Quick Post</CardTitle>
        <p className="text-sm text-muted-foreground">Create a new blog post</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="Enter post title..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea 
            id="excerpt" 
            placeholder="Brief description of the post..."
            className="min-h-[80px] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select>
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
            <Select defaultValue="draft">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Featured Image</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <ImagePlus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload image</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input 
              placeholder="Add tag..." 
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={addTag}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" className="flex-1 bg-transparent">
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button className="flex-1 bg-primary text-primary-foreground">
            <Send className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
