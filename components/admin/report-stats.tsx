"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet, Download, TrendingUp, Calendar, Loader2 } from "lucide-react";

export function ReportStats() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalInvoices: 0,
    currentYear: new Date().getFullYear(),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      
      // Get current year date range
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59);

      // Fetch financial data
      const financialResponse = await fetch(
        `/api/admin/reports/financial?startDate=${startOfYear.toISOString()}&endDate=${endOfYear.toISOString()}`
      );
      
      if (financialResponse.ok) {
        const financialData = await financialResponse.json();
        const summary = financialData.data?.summary || {};
        
        // Fetch bookings count
        const bookingsResponse = await fetch(
          `/api/admin/bookings?startDate=${startOfYear.toISOString()}&endDate=${endOfYear.toISOString()}&limit=1`
        );
        
        let totalBookings = 0;
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          totalBookings = bookingsData.data?.total || 0;
        }

        setStats({
          totalRevenue: summary.totalRevenue || 0,
          totalBookings,
          totalInvoices: summary.invoiceCount || 0,
          currentYear: new Date().getFullYear(),
        });
      }
    } catch (err) {
      console.error("Failed to fetch report stats:", err);
    } finally {
      setLoading(false);
    }
  }

  const displayStats = [
    {
      label: "Total Revenue",
      value: loading ? "..." : `$${stats.totalRevenue.toLocaleString()}`,
      change: `${stats.currentYear} year to date`,
      icon: TrendingUp,
    },
    {
      label: "Total Bookings",
      value: loading ? "..." : stats.totalBookings.toString(),
      change: `${stats.currentYear} year to date`,
      icon: Calendar,
    },
    {
      label: "Total Invoices",
      value: loading ? "..." : stats.totalInvoices.toString(),
      change: `${stats.currentYear} year to date`,
      icon: FileSpreadsheet,
    },
    {
      label: "Reporting Period",
      value: stats.currentYear.toString(),
      change: "Current fiscal year",
      icon: Calendar,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {displayStats.map((stat) => (
        <Card key={stat.label} className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {loading ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <stat.icon className="w-5 h-5 text-primary" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
