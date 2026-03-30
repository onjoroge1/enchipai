import { AnalyticsOverview } from "@/components/admin/analytics-overview";
import { RevenueBreakdown } from "@/components/admin/revenue-breakdown";
import { OccupancyChart } from "@/components/admin/occupancy-chart";
import { GuestDemographics } from "@/components/admin/guest-demographics";
import { BookingStatistics } from "@/components/admin/booking-statistics";

export default function AnalyticsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Insights and performance metrics for your camp</p>
      </div>

      <AnalyticsOverview />

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <RevenueBreakdown />
        <OccupancyChart />
      </div>

      <div className="mt-8">
        <BookingStatistics />
      </div>

      <div className="mt-8">
        <GuestDemographics />
      </div>
    </>
  );
}
