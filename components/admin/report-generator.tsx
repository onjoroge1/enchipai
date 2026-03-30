"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Download, 
  FileSpreadsheet, 
  FileText,
  Loader2,
  Calendar
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";

const reportTypes = [
  { id: "revenue", label: "Revenue Report", description: "Income breakdown by tent, experience, and period" },
  { id: "occupancy", label: "Occupancy Report", description: "Tent utilization and availability trends" },
  { id: "bookings", label: "Bookings Summary", description: "All reservations with guest details" },
  { id: "guests", label: "Guest Analytics", description: "Demographics, preferences, and history" },
  { id: "invoices", label: "Invoice Register", description: "All invoices for accounting/tax" },
  { id: "expenses", label: "Expense Report", description: "Operational costs and spending" },
  { id: "staff", label: "Staff Performance", description: "Guide ratings and activity logs" },
  { id: "wildlife", label: "Wildlife Sightings", description: "Animal encounters and trends" },
];

// Note: Fields are automatically determined by report type

export function ReportGenerator() {
  const [reportType, setReportType] = useState("");
  const [dateRange, setDateRange] = useState("this-month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [format, setFormat] = useState("csv");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!reportType) {
      setError("Please select a report type");
      return;
    }

    setError(null);
    setGenerating(true);

    try {
      const payload: any = {
        reportType,
        format,
      };

      // Handle custom date range
      if (dateRange === "custom") {
        if (!customStartDate || !customEndDate) {
          setError("Please select both start and end dates for custom range");
          setGenerating(false);
          return;
        }
        payload.startDate = new Date(customStartDate).toISOString();
        payload.endDate = new Date(customEndDate).toISOString();
      } else {
        payload.dateRange = dateRange;
      }

      const response = await fetch("/api/admin/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to generate report");
      }

      const data = await response.json();
      const reportData = data.data;

      // Determine content type and file extension
      const contentType = reportData.contentType || (format === "csv" ? "text/csv" : format === "pdf" ? "text/html" : "text/csv");
      const fileExtension = reportData.fileExtension || format;

      // Download the report
      const blob = new Blob([reportData.data], { type: contentType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const reportName = `${reportType}-report-${new Date().toISOString().split("T")[0]}.${fileExtension}`;
      link.download = reportName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // For PDF format, the file is HTML that can be printed/saved as PDF
      // The browser will handle opening it, and user can use Print > Save as PDF
    } catch (err) {
      console.error("Generate report error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Generate Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Report Type */}
        <div className="space-y-3">
          <Label>Report Type *</Label>
          <div className="grid sm:grid-cols-2 gap-2">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  reportType === type.id 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <p className="font-medium text-sm text-foreground">{type.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Date Range *</Label>
            <Select 
              value={dateRange} 
              onValueChange={(value) => {
                setDateRange(value);
                if (value !== "custom") {
                  setCustomStartDate("");
                  setCustomEndDate("");
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-quarter">This Quarter</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            {dateRange === "custom" && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="space-y-1">
                  <Label className="text-xs">Start Date</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">End Date</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    min={customStartDate}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel (.xlsx)
                  </span>
                </SelectItem>
                <SelectItem value="csv">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    CSV (.csv)
                  </span>
                </SelectItem>
                <SelectItem value="pdf">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    PDF (.html - Print to PDF)
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex gap-3 pt-2">
          <Button 
            onClick={handleGenerate}
            disabled={!reportType || generating || (dateRange === "custom" && (!customStartDate || !customEndDate))}
            className="flex-1"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate & Download
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
