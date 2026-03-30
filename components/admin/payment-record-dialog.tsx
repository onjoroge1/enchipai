"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { PaymentMethod, TransactionPaymentStatus } from "@/lib/prisma-types";

interface Invoice {
  id: string;
  invoiceNumber: string;
  total: number;
  booking: {
    bookingNumber: string | null;
  };
  payments: Array<{
    amount: number;
    status: string;
  }>;
}

interface PaymentRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string | null;
  onSuccess: () => void;
}

export function PaymentRecordDialog({
  open,
  onOpenChange,
  invoiceId,
  onSuccess,
}: PaymentRecordDialogProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    method: PaymentMethod.CREDIT_CARD,
    transactionId: "",
    status: TransactionPaymentStatus.COMPLETED,
  });

  useEffect(() => {
    if (open && invoiceId) {
      fetchInvoice();
    } else if (open && !invoiceId) {
      setInvoice(null);
      setFormData({
        amount: "",
        method: PaymentMethod.CREDIT_CARD,
        transactionId: "",
        status: TransactionPaymentStatus.COMPLETED,
      });
    }
  }, [open, invoiceId]);

  async function fetchInvoice() {
    try {
      setFetching(true);
      const response = await fetch(`/api/admin/invoices/${invoiceId}`);
      if (!response.ok) throw new Error("Failed to fetch invoice");
      const data = await response.json();
      setInvoice(data.data);
      
      // Calculate remaining amount
      const totalPaid = data.data.payments
        .filter((p: any) => p.status === TransactionPaymentStatus.COMPLETED)
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
      const remaining = Number(data.data.total) - totalPaid;
      setFormData((prev) => ({ ...prev, amount: remaining.toString() }));
    } catch (err) {
      console.error("Invoice fetch error:", err);
      setError("Failed to load invoice");
    } finally {
      setFetching(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: parseFloat(formData.amount),
          method: formData.method,
          transactionId: formData.transactionId || undefined,
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to record payment");
      }

      onSuccess();
      onOpenChange(false);
      setFormData({
        amount: "",
        method: PaymentMethod.CREDIT_CARD,
        transactionId: "",
        status: TransactionPaymentStatus.COMPLETED,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  if (!invoice && invoiceId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          {fetching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertDescription>Invoice not found</AlertDescription>
            </Alert>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  const totalPaid = invoice
    ? invoice.payments
        .filter((p) => p.status === TransactionPaymentStatus.COMPLETED)
        .reduce((sum, p) => sum + Number(p.amount), 0)
    : 0;
  const remaining = invoice ? Number(invoice.total) - totalPaid : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Record Payment</DialogTitle>
          <DialogDescription>
            {invoice ? `Record payment for ${invoice.invoiceNumber}` : "Record a new payment"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {invoice && (
          <div className="bg-secondary rounded-lg p-4 mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Invoice Total:</span>
              <span className="text-foreground font-medium">${Number(invoice.total).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Total Paid:</span>
              <span className="text-foreground font-medium">${totalPaid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-border">
              <span className="text-foreground font-semibold">Remaining:</span>
              <span className="text-foreground font-semibold">${remaining.toLocaleString()}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {invoice && (
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                max={remaining}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                disabled={loading || !invoice}
              />
              <p className="text-xs text-muted-foreground">
                Maximum: ${remaining.toLocaleString()}
              </p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method *</Label>
              <Select
                value={formData.method}
                onValueChange={(value) => setFormData({ ...formData, method: value as PaymentMethod })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentMethod.CREDIT_CARD}>Credit Card</SelectItem>
                  <SelectItem value={PaymentMethod.DEBIT_CARD}>Debit Card</SelectItem>
                  <SelectItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</SelectItem>
                  <SelectItem value={PaymentMethod.MOBILE_MONEY}>Mobile Money</SelectItem>
                  <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as TransactionPaymentStatus })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TransactionPaymentStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={TransactionPaymentStatus.PROCESSING}>Processing</SelectItem>
                  <SelectItem value={TransactionPaymentStatus.COMPLETED}>Completed</SelectItem>
                  <SelectItem value={TransactionPaymentStatus.FAILED}>Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID (optional)</Label>
            <Input
              id="transactionId"
              value={formData.transactionId}
              onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
              placeholder="e.g., txn_1234567890"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !invoice || !formData.amount}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                "Record Payment"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

