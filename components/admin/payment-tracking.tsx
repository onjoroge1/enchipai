"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Loader2, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { PaymentMethod, TransactionPaymentStatus } from "@/lib/prisma-types";
import { PaymentRecordDialog } from "./payment-record-dialog";

interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  transactionId: string | null;
  status: TransactionPaymentStatus;
  processedAt: string | null;
  createdAt: string;
  invoice: {
    id: string;
    invoiceNumber: string;
    total: number;
    booking: {
      bookingNumber: string | null;
      tent: {
        name: string;
      };
    };
    user: {
      name: string | null;
      email: string;
    };
  };
}

export function PaymentTracking() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, methodFilter]);

  async function fetchPayments() {
    try {
      const url = new URL("/api/admin/payments", window.location.origin);
      if (statusFilter !== "all") {
        url.searchParams.set("status", statusFilter);
      }

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch payments");
      const data = await response.json();
      
      let filtered = data.data?.payments || [];
      
      if (methodFilter !== "all") {
        filtered = filtered.filter((p: Payment) => p.method === methodFilter);
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (p: Payment) =>
            p.invoice.invoiceNumber.toLowerCase().includes(query) ||
            p.invoice.booking.bookingNumber?.toLowerCase().includes(query) ||
            p.invoice.user.email.toLowerCase().includes(query) ||
            p.transactionId?.toLowerCase().includes(query)
        );
      }

      setPayments(filtered);
    } catch (err) {
      console.error("Payments fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) fetchPayments();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const getStatusBadge = (status: TransactionPaymentStatus) => {
    switch (status) {
      case TransactionPaymentStatus.COMPLETED:
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case TransactionPaymentStatus.PROCESSING:
        return <Badge className="bg-blue-100 text-blue-700">Processing</Badge>;
      case TransactionPaymentStatus.PENDING:
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case TransactionPaymentStatus.FAILED:
        return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
      case TransactionPaymentStatus.REFUNDED:
        return <Badge className="bg-gray-100 text-gray-700">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodLabel = (method: PaymentMethod) => {
    return method.replace(/_/g, " ");
  };

  const handleReconcile = async (paymentId: string, status: TransactionPaymentStatus) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update payment");
      fetchPayments();
    } catch (err) {
      console.error("Reconcile error:", err);
      alert("Failed to update payment status");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="font-serif text-xl">Payment Tracking</CardTitle>
              <CardDescription>Track and reconcile all payments</CardDescription>
            </div>
            <Button
              className="bg-primary text-primary-foreground"
              onClick={() => {
                setSelectedInvoiceId(null);
                setIsRecordDialogOpen(true);
              }}
            >
              Record Payment
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice, booking, transaction ID..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{payment.invoice.invoiceNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {payment.invoice.booking.bookingNumber || "N/A"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-foreground">
                            {payment.invoice.user.name || "Guest"}
                          </p>
                          <p className="text-xs text-muted-foreground">{payment.invoice.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-foreground">
                          ${Number(payment.amount).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getMethodLabel(payment.method)}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground font-mono">
                          {payment.transactionId || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-foreground">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                          {payment.processedAt && (
                            <p className="text-xs text-muted-foreground">
                              Processed: {new Date(payment.processedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.status === TransactionPaymentStatus.PENDING && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReconcile(payment.id, TransactionPaymentStatus.COMPLETED)}
                              title="Mark as Completed"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReconcile(payment.id, TransactionPaymentStatus.FAILED)}
                              title="Mark as Failed"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {payment.status === TransactionPaymentStatus.PROCESSING && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReconcile(payment.id, TransactionPaymentStatus.COMPLETED)}
                            title="Mark as Completed"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <PaymentRecordDialog
        open={isRecordDialogOpen}
        onOpenChange={setIsRecordDialogOpen}
        invoiceId={selectedInvoiceId}
        onSuccess={fetchPayments}
      />
    </>
  );
}

