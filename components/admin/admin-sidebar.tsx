"use client";

import { LayoutDashboard, CalendarDays, Users, UserCog, BedDouble, FileText, BarChart3, Settings, HelpCircle, ExternalLink, PenSquare, Mail, FileSpreadsheet, Share2, Bell, Binary as Binoculars, Compass, Car, Package } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: CalendarDays, label: "Bookings", href: "/admin/bookings" },
  { icon: Users, label: "Guests", href: "/admin/guests" },
  { icon: UserCog, label: "Users", href: "/admin/users" },
  { icon: BedDouble, label: "Tents", href: "/admin/tents" },
  { icon: Compass, label: "Experiences", href: "/admin/experiences" },
  { icon: Car, label: "Transfers", href: "/admin/transfers" },
  { icon: Package, label: "Inventory", href: "/admin/inventory" },
  { icon: FileText, label: "Invoices", href: "/admin/invoices" },
  { icon: Mail, label: "Emails", href: "/admin/emails" },
  { icon: PenSquare, label: "Blog", href: "/admin/blog" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: FileSpreadsheet, label: "Reports", href: "/admin/reports" },
  { icon: Share2, label: "Channels", href: "/admin/channels" },
  { icon: Bell, label: "Notifications", href: "/admin/notifications" },
  { icon: Binoculars, label: "Wildlife", href: "/admin/wildlife" },
];

const bottomItems = [
  { icon: Settings, label: "Settings", href: "/admin/settings" },
  { icon: HelpCircle, label: "Help", href: "/admin/help" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-4rem)] bg-card border-r border-border">
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Quick Links
          </p>
          <div className="space-y-1">
            {bottomItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View Live Site
        </Link>
      </div>
    </aside>
  );
}
