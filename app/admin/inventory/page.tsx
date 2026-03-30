import { InventoryStats } from "@/components/admin/inventory-stats";
import { InventoryList } from "@/components/admin/inventory-list";
import { LowStockAlerts } from "@/components/admin/low-stock-alerts";
import { InventoryCategories } from "@/components/admin/inventory-categories";

export default function InventoryPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-foreground">Inventory & Supplies</h1>
        <p className="text-muted-foreground">
          Track food, beverages, linens, toiletries, and camp supplies
        </p>
      </div>

      <InventoryStats />

      <div className="mt-8">
        <LowStockAlerts />
      </div>

      <div className="mt-8">
        <InventoryCategories />
      </div>

      <div className="mt-8">
        <InventoryList />
      </div>
    </>
  );
}
