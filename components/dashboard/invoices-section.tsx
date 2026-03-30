"use client";

import { FileText, Download, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const invoices = [
  {
    id: "INV-2026-001",
    date: "Mar 15, 2026",
    amount: "$2,450.00",
    status: "pending",
  },
  {
    id: "INV-2025-042",
    date: "Dec 15, 2025",
    amount: "$1,890.00",
    status: "paid",
  },
  {
    id: "INV-2025-038",
    date: "Oct 20, 2025",
    amount: "$3,200.00",
    status: "paid",
  },
];

export function InvoicesSection() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-serif text-xl">Invoices</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          View All <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{invoice.id}</p>
                <p className="text-xs text-muted-foreground">{invoice.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{invoice.amount}</p>
                <Badge
                  variant={invoice.status === "paid" ? "secondary" : "default"}
                  className={`text-xs ${invoice.status === "pending" ? "bg-accent text-accent-foreground" : ""}`}
                >
                  {invoice.status === "paid" ? "Paid" : "Pending"}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
