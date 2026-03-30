import { InvoicesTable } from "@/components/admin/invoices-table";
import { InvoiceStats } from "@/components/admin/invoice-stats";
import { PaymentTracking } from "@/components/admin/payment-tracking";

export default function InvoicesPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-foreground">Invoice Management</h1>
        <p className="text-muted-foreground">Track payments, generate invoices, and manage billing</p>
      </div>

      <InvoiceStats />

      <div className="mt-8">
        <InvoicesTable />
      </div>

      <div className="mt-8">
        <PaymentTracking />
      </div>
    </>
  );
}
