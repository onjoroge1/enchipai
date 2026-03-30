"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const recentReports = [
  {
    id: 1,
    name: "January Revenue Report",
    type: "Revenue",
    format: "xlsx",
    date: "Jan 31, 2026",
    size: "245 KB",
  },
  {
    id: 2,
    name: "Q4 2025 Occupancy",
    type: "Occupancy",
    format: "pdf",
    date: "Jan 15, 2026",
    size: "1.2 MB",
  },
  {
    id: 3,
    name: "Guest List Export",
    type: "Guests",
    format: "csv",
    date: "Jan 10, 2026",
    size: "89 KB",
  },
  {
    id: 4,
    name: "2025 Tax Invoice Register",
    type: "Invoices",
    format: "xlsx",
    date: "Jan 5, 2026",
    size: "512 KB",
  },
  {
    id: 5,
    name: "December Bookings",
    type: "Bookings",
    format: "pdf",
    date: "Jan 2, 2026",
    size: "890 KB",
  },
];

export function RecentReports() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Reports</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentReports.map((report) => (
          <div
            key={report.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {report.format === "xlsx" || report.format === "csv" ? (
                <FileSpreadsheet className="w-5 h-5 text-primary" />
              ) : (
                <FileText className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{report.name}</p>
              <p className="text-xs text-muted-foreground">
                {report.type} • {report.size} • {report.date}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem>Regenerate</DropdownMenuItem>
                <DropdownMenuItem>Share</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
