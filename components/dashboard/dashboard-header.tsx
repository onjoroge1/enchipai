"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardHeader() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // First, call the signOut API to clear the session cookie
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      // Then use NextAuth signOut
      await signOut({ 
        redirect: false,
        callbackUrl: "/"
      });
      
      // Clear any local storage/cache
      localStorage.clear();
      sessionStorage.clear();
      
      // Force a hard redirect to ensure everything is cleared
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
      // Fallback: clear everything and force redirect
      localStorage.clear();
      sessionStorage.clear();
      // Clear NextAuth cookies manually
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      window.location.href = "/";
    }
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/enchipai-logo.webp"
              alt="Enchipai Mara Camp"
              width={100}
              height={50}
              className="h-10 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-foreground">
              Dashboard
            </Link>
            <Link href="/dashboard#bookings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              My Bookings
            </Link>
            <Link href="/dashboard#experiences" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Experiences
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Site
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    {session?.user?.name || session?.user?.email || "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
