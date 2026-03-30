import { ReportStats } from "@/components/admin/report-stats";
import { ReportGenerator } from "@/components/admin/report-generator";
import { RecentReports } from "@/components/admin/recent-reports";

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Reports & Exports</h1>
          <p className="text-muted-foreground">Generate and download reports for accounting and analysis</p>
        </div>
      </div>

      <ReportStats />
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReportGenerator />
        </div>
        <div>
          <RecentReports />
        </div>
      </div>
    </div>
  );
}
