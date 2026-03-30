import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <Link href="/" className="mb-8">
        <Image
          src="/images/enchipai-logo.webp"
          alt="Enchipai Mara Camp"
          width={160}
          height={80}
          className="h-16 w-auto"
        />
      </Link>

      <div className="text-center max-w-md">
        <h1 className="font-serif text-7xl font-medium text-primary mb-4">404</h1>
        <h2 className="font-serif text-2xl text-foreground mb-3">
          Trail Not Found
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          It seems you&apos;ve wandered off the safari trail.
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
              <Home className="w-4 h-4 mr-2" />
              Back to Camp
            </Button>
          </Link>
          <Link href="/tents">
            <Button variant="outline" className="rounded-full px-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent">
              Explore Our Tents
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
