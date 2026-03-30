"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShoppingCart, Package, Loader2 } from "lucide-react";

interface LowStockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string | null;
  isLowStock: boolean;
}

const urgencyStyles: Record<string, { bg: string; text: string }> = {
  critical: { bg: "bg-red-100", text: "text-red-700" },
  warning: { bg: "bg-yellow-100", text: "text-yellow-700" },
};

export function LowStockAlerts() {
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  async function fetchLowStockItems() {
    try {
      const response = await fetch("/api/admin/inventory?lowStock=true");
      if (!response.ok) throw new Error("Failed to fetch low stock items");
      const data = await response.json();
      setItems(data.data?.items || []);
    } catch (err) {
      console.error("Low stock fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const getUrgency = (item: LowStockItem) => {
    if (item.quantity <= item.minStock * 0.5) return "critical";
    if (item.quantity <= item.minStock) return "warning";
    return null;
  };

  const lowStockItems = items.filter((item) => item.isLowStock).map((item) => ({
    ...item,
    urgency: getUrgency(item),
  })).filter((item) => item.urgency !== null);
  return (
    <Card className="border-border/50 border-l-4 border-l-red-500">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <CardTitle className="text-lg font-serif">Low Stock Alerts</CardTitle>
          </div>
          <Button className="bg-primary text-primary-foreground">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Create Order
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : lowStockItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>All items are well stocked!</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border ${
                  item.urgency === "critical" ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className={`w-4 h-4 ${item.urgency === "critical" ? "text-red-500" : "text-yellow-500"}`} />
                    <span className="font-medium text-foreground">{item.name}</span>
                  </div>
                  <Badge className={`${urgencyStyles[item.urgency!].bg} ${urgencyStyles[item.urgency!].text} text-xs`}>
                    {item.urgency}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
                <div className="flex items-center justify-between text-sm">
                  <span>
                    <span className={item.urgency === "critical" ? "text-red-600 font-semibold" : "text-yellow-600 font-semibold"}>
                      {item.quantity}
                    </span>
                    <span className="text-muted-foreground"> / {item.minStock} {item.unit || ""}</span>
                  </span>
                  <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                    Reorder
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
