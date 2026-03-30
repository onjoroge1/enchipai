import Image from "next/image";
import Link from "next/link";
import { Search, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const popularPosts = [
  {
    id: 1,
    title: "Witnessing the Great Migration",
    image: "/images/blog-migration.jpg",
    date: "Jan 15, 2026",
  },
  {
    id: 2,
    title: "The Elusive Leopard",
    image: "/images/blog-leopard.jpg",
    date: "Jan 8, 2026",
  },
  {
    id: 3,
    title: "Embracing Maasai Culture",
    image: "/images/blog-maasai.jpg",
    date: "Dec 28, 2025",
  },
];

const tags = [
  "Safari",
  "Wildlife",
  "Big Five",
  "Migration",
  "Photography",
  "Maasai",
  "Conservation",
  "Travel Tips",
  "Bird Watching",
  "Night Safari",
];

export function BlogSidebar() {
  return (
    <div className="space-y-8 lg:sticky lg:top-8">
      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-serif">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search articles..." 
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Popular Posts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-serif">Popular Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {popularPosts.map((post) => (
            <Link 
              href={`/blog/${post.id}`} 
              key={post.id}
              className="flex gap-3 group"
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">{post.date}</p>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-serif">Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                href={`/blog?tag=${tag.toLowerCase()}`}
                key={tag}
                className="px-3 py-1.5 bg-secondary text-secondary-foreground text-xs rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Newsletter */}
      <Card className="bg-primary text-primary-foreground">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Newsletter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-primary-foreground/80 mb-4">
            Subscribe to receive safari tips, wildlife updates, and exclusive offers.
          </p>
          <div className="space-y-3">
            <Input 
              placeholder="Your email address" 
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
            />
            <Button variant="secondary" className="w-full">
              Subscribe
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About the Camp */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-serif">About Enchipai</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Enchipai, meaning &ldquo;a place of happiness&rdquo; in Maa, is a boutique 5-tent luxury camp 
            nestled under the indigenous canopy of the Esoit Oloololo escarpment with breathtaking 
            views of the Masai Mara.
          </p>
          <Link 
            href="/" 
            className="text-sm text-primary font-medium mt-3 inline-block hover:underline"
          >
            Learn more about us
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
