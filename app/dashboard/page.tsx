"use client";

import { useSession } from "next-auth/react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BookingsSection } from "@/components/dashboard/bookings-section";
import { ProfileSection } from "@/components/dashboard/profile-section";
import { ExperiencesSection } from "@/components/dashboard/experiences-section";
import { InvoicesSection } from "@/components/dashboard/invoices-section";

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "Guest";

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-foreground">Welcome back, {userName}</h1>
          <p className="text-muted-foreground mt-1">Manage your reservations and explore new experiences</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <BookingsSection />
            <ExperiencesSection />
          </div>
          <div className="space-y-8">
            <ProfileSection />
            <InvoicesSection />
          </div>
        </div>
      </main>
    </div>
  );
}
