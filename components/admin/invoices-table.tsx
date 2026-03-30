"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, Plus, MoreHorizontal, Download, Send, Eye, Loader2, ArrowUpDown, ArrowUp, ArrowDown, X } from "lucide-react";
import { InvoiceStatus } from "@/lib/prisma-types";
import { InvoiceGenerateDialog } from "./invoice-generate-dialog";
import { DataTablePagination } from "./data-table-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortField = "invoiceNumber" | "guestName" | "total" | "dueDate" | "status" | "createdAt";
type SortDirection = "asc" | "desc" | null;

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
  paidDate: string | null;
  booking: {
    bookingNumber: string | null;
    tent: {
      name: string;
    };
    addOns: Array<{ name: string }>;
  };
  user: {
    name: string | null;
    email: string;
  };
  payments: Array<{
    id: string;
    amount: number;
    status: string;
  }>;
}

const statusColors: Record<InvoiceStatus, string> = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

export function InvoicesTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    setOffset(0); // Reset to first page when filters change
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [offset, limit, statusFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) {
        setOffset(0);
        fetchInvoices();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  async function fetchInvoices() {
    try {
      setLoading(true);
      const url = new URL("/api/admin/invoices", window.location.origin);
      if (statusFilter !== "all") {
        url.searchParams.set("status", statusFilter);
      }
      if (searchQuery) {
        url.searchParams.set("search", searchQuery);
      }
      url.searchParams.set("limit", limit.toString());
      url.searchParams.set("offset", offset.toString());

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch invoices");
      const data = await response.json();
      setInvoices(data.data?.invoices || []);
      setTotal(data.data?.total || 0);
    } catch (err) {
      console.error("Invoices fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortField("createdAt");
        setSortDirection("desc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="w-3 h-3 ml-1" />;
    }
    if (sortDirection === "desc") {
      return <ArrowDown className="w-3 h-3 ml-1" />;
    }
    return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
  };

  const sortedInvoices = [...invoices].sort((a, b) => {
    if (!sortDirection) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case "invoiceNumber":
        aValue = a.invoiceNumber;
        bValue = b.invoiceNumber;
        break;
      case "guestName":
        aValue = a.user.name || "";
        bValue = b.user.name || "";
        break;
      case "total":
        aValue = Number(a.total);
        bValue = Number(b.total);
        break;
      case "dueDate":
        aValue = new Date(a.dueDate).getTime();
        bValue = new Date(b.dueDate).getTime();
        break;
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      case "createdAt":
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleExport = () => {
    const headers = [
      "Invoice Number",
      "Guest Name",
      "Guest Email",
      "Items",
      "Amount",
      "Tax",
      "Total",
      "Status",
      "Due Date",
      "Created At",
      "Paid Date",
    ];

    const rows = invoices.map((invoice) => {
      const items = `${invoice.booking.tent.name}${invoice.booking.addOns.length > 0 ? ` + ${invoice.booking.addOns.length} add-ons` : ""}`;
      return [
        invoice.invoiceNumber,
        invoice.user.name || "",
        invoice.user.email,
        items,
        Number(invoice.amount).toFixed(2),
        Number(invoice.tax).toFixed(2),
        Number(invoice.total).toFixed(2),
        invoice.status,
        new Date(invoice.dueDate).toLocaleDateString(),
        new Date(invoice.createdAt).toLocaleDateString(),
        invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : "",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `invoices-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg font-serif">All Invoices</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-9 w-64 bg-secondary border-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              className="bg-primary text-primary-foreground"
              onClick={() => setIsGenerateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("invoiceNumber")}
                    className="flex items-center hover:text-foreground transition-colors"
                  >
                    Invoice
                    {getSortIcon("invoiceNumber")}
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                  <button
                    onClick={() => handleSort("guestName")}
                    className="flex items-center hover:text-foreground transition-colors"
                  >
                    Guest
                    {getSortIcon("guestName")}
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Items</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("total")}
                    className="flex items-center hover:text-foreground transition-colors"
                  >
                    Amount
                    {getSortIcon("total")}
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                  <button
                    onClick={() => handleSort("dueDate")}
                    className="flex items-center hover:text-foreground transition-colors"
                  >
                    Due Date
                    {getSortIcon("dueDate")}
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  <button
                    onClick={() => handleSort("status")}
                    className="flex items-center hover:text-foreground transition-colors"
                  >
                    Status
                    {getSortIcon("status")}
                  </button>
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                  </td>
                </tr>
              ) : sortedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No invoices found
                  </td>
                </tr>
              ) : (
                sortedInvoices.map((invoice) => {
                  const items = `${invoice.booking.tent.name}${invoice.booking.addOns.length > 0 ? ` + ${invoice.booking.addOns.length} add-ons` : ""}`;
                  const totalPaid = invoice.payments
                    .filter((p) => p.status === "COMPLETED")
                    .reduce((sum, p) => sum + Number(p.amount), 0);
                  const remaining = Number(invoice.total) - totalPaid;

                  return (
                    <tr key={invoice.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-foreground">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(invoice.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell">
                        <div>
                          <p className="font-medium text-foreground">{invoice.user.name || "Guest"}</p>
                          <p className="text-sm text-muted-foreground">{invoice.user.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden lg:table-cell">
                        <p className="text-sm text-foreground">{items}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <span className="font-semibold text-foreground">
                            ${Number(invoice.total).toLocaleString()}
                          </span>
                          {remaining > 0 && invoice.status !== InvoiceStatus.PAID && (
                            <p className="text-xs text-muted-foreground">
                              ${remaining.toFixed(2)} remaining
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden sm:table-cell">
                        <span className="text-sm text-foreground">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={statusColors[invoice.status] || statusColors.PENDING}>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="w-4 h-4 mr-2" />
                              Send Reminder
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {sortedInvoices.length > 0 && (
          <DataTablePagination
            total={total}
            limit={limit}
            offset={offset}
            onPageChange={setOffset}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setOffset(0);
            }}
          />
        )}
      </CardContent>
      <InvoiceGenerateDialog
        open={isGenerateDialogOpen}
        onOpenChange={setIsGenerateDialogOpen}
        onSuccess={fetchInvoices}
      />
    </Card>
  );
}
