"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";

const navLinks = [
  { href: "/#accommodation", label: "Accommodation", hash: true },
  { href: "/tents", label: "Our Tents", hash: false },
  { href: "/#experiences", label: "Experiences", hash: true },
  { href: "/blog", label: "Journal", hash: false },
  { href: "/contact", label: "Contact", hash: false },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "STAFF";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/enchipai-logo.webp"
              alt="Enchipai Mara Camp"
              width={120}
              height={60}
              className="h-12 lg:h-14 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Auth */}
          <div className="hidden md:flex items-center gap-3">
            {status === "authenticated" && session?.user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full border border-border hover:bg-secondary transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                    {session.user.name || session.user.email?.split("@")[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-background border border-border rounded-xl shadow-lg z-50 py-2">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium text-foreground truncate">
                          {session.user.name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {session.user.email}
                        </p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        My Dashboard
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-secondary transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-secondary animate-pulse" />
            ) : (
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm" className="rounded-full px-4 text-sm">
                  Sign In
                </Button>
              </Link>
            )}

            <Link href="/tents/book">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
                Book Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {status === "authenticated" && session?.user ? (
                <>
                  <div className="border-t border-border/50 pt-4 mt-2">
                    <p className="text-xs text-muted-foreground mb-2">
                      Signed in as {session.user.email}
                    </p>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 text-sm text-foreground py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      My Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 text-sm text-foreground py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex items-center gap-2 text-sm text-destructive py-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="text-primary hover:text-primary/80 transition-colors text-sm font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}

              <Link href="/tents/book" onClick={() => setIsMenuOpen(false)}>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full w-full mt-2">
                  Book Now
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
