"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { InvoiceStatus } from "@/lib/prisma-types";

interface Stats {
  total: number;
  paid: { amount: number; count: number };
  pending: { amount: number; count: number };
  overdue: { amount: number; count: number };
}

export function InvoiceStats() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    paid: { amount: 0, count: 0 },
    pending: { amount: 0, count: 0 },
    overdue: { amount: 0, count: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [allResponse, paidResponse, pendingResponse, overdueResponse] = await Promise.all([
        fetch("/api/admin/invoices"),
        fetch("/api/admin/invoices?status=PAID"),
        fetch("/api/admin/invoices?status=PENDING"),
        fetch("/api/admin/invoices?status=OVERDUE"),
      ]);

      const all = await allResponse.json();
      const paid = await paidResponse.json();
      const pending = await pendingResponse.json();
      const overdue = await overdueResponse.json();

      const paidAmount = paid.data?.invoices?.reduce(
        (sum: number, inv: any) => sum + Number(inv.total),
        0
      ) || 0;
      const pendingAmount = pending.data?.invoices?.reduce(
        (sum: number, inv: any) => sum + Number(inv.total),
        0
      ) || 0;
      const overdueAmount = overdue.data?.invoices?.reduce(
        (sum: number, inv: any) => sum + Number(inv.total),
        0
      ) || 0;

      setStats({
        total: all.data?.total || 0,
        paid: {
          amount: paidAmount,
          count: paid.data?.total || 0,
        },
        pending: {
          amount: pendingAmount,
          count: pending.data?.total || 0,
        },
        overdue: {
          amount: overdueAmount,
          count: overdue.data?.total || 0,
        },
      });
    } catch (err) {
      console.error("Stats fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const statsData = [
    {
      label: "Total Invoices",
      value: loading ? "..." : stats.total.toString(),
      subtext: "All time",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Paid",
      value: loading ? "..." : `$${stats.paid.amount.toLocaleString()}`,
      subtext: `${stats.paid.count} invoices`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Pending",
      value: loading ? "..." : `$${stats.pending.amount.toLocaleString()}`,
      subtext: `${stats.pending.count} invoices`,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      label: "Overdue",
      value: loading ? "..." : `$${stats.overdue.amount.toLocaleString()}`,
      subtext: `${stats.overdue.count} invoices`,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat) => (
        <Card key={stat.label} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                {loading ? (
                  <Loader2 className={`w-5 h-5 ${stat.color} animate-spin`} />
                ) : (
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                )}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
