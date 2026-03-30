"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  UtensilsCrossed, 
  Wine, 
  Bed, 
  Sparkles, 
  Wrench, 
  ShoppingBag,
  Loader2,
  Package,
} from "lucide-react";

interface CategoryData {
  name: string;
  items: number;
  value: number;
  stockLevel: number;
}

const categoryIcons: Record<string, any> = {
  "Food & Kitchen": UtensilsCrossed,
  "Beverages": Wine,
  "Linens & Bedding": Bed,
  "Toiletries": Sparkles,
  "Maintenance": Wrench,
  "Guest Amenities": ShoppingBag,
};

const categoryColors: Record<string, { color: string; bgColor: string }> = {
  "Food & Kitchen": { color: "text-orange-600", bgColor: "bg-orange-100" },
  "Beverages": { color: "text-purple-600", bgColor: "bg-purple-100" },
  "Linens & Bedding": { color: "text-blue-600", bgColor: "bg-blue-100" },
  "Toiletries": { color: "text-pink-600", bgColor: "bg-pink-100" },
  "Maintenance": { color: "text-gray-600", bgColor: "bg-gray-100" },
  "Guest Amenities": { color: "text-green-600", bgColor: "bg-green-100" },
};

export function InventoryCategories() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/inventory/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data.data?.categories || []);
    } catch (err) {
      console.error("Categories fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-12 text-center text-muted-foreground">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (categories.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-serif">Inventory by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No inventory categories found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-serif">Inventory by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = categoryIcons[category.name] || Package;
            const colors = categoryColors[category.name] || { color: "text-gray-600", bgColor: "bg-gray-100" };
            
            return (
              <div
                key={category.name}
                className="p-4 rounded-xl bg-secondary/50 border border-border/50 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${colors.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${colors.color}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.items} items</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    ${category.value.toLocaleString()}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Stock Level</span>
                    <span className={`font-medium ${
                      category.stockLevel < 50 ? "text-red-500" : 
                      category.stockLevel < 70 ? "text-yellow-500" : "text-green-500"
                    }`}>
                      {category.stockLevel}%
                    </span>
                  </div>
                  <Progress 
                    value={category.stockLevel} 
                    className={`h-2 ${
                      category.stockLevel < 50 ? "[&>div]:bg-red-500" : 
                      category.stockLevel < 70 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
