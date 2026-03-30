import { StatsCards } from "@/components/admin/stats-cards";
import { RecentBookings } from "@/components/admin/recent-bookings";
import { AvailabilityCalendar } from "@/components/admin/availability-calendar";
import { RevenueChart } from "@/components/admin/revenue-chart";

export default function AdminPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage bookings, guests, and camp operations</p>
      </div>

      <StatsCards />

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <AvailabilityCalendar />
        </div>
      </div>

      <div className="mt-8">
        <RecentBookings />
      </div>
    </>
  );
}
