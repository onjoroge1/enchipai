"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Edit,
  Trash2,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import { InventoryItemDialog } from "./inventory-item-dialog";
import { DataTablePagination } from "./data-table-pagination";

type SortField = "name" | "category" | "quantity" | "minStock" | "cost";
type SortDirection = "asc" | "desc" | null;

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string | null;
  minStock: number;
  cost: number | null;
  supplier: string | null;
  description: string | null;
  isLowStock: boolean;
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  good: { bg: "bg-green-100", text: "text-green-700" },
  warning: { bg: "bg-yellow-100", text: "text-yellow-700" },
  critical: { bg: "bg-red-100", text: "text-red-700" },
};

export function InventoryList() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setOffset(0);
  }, [categoryFilter, searchQuery]);

  useEffect(() => {
    fetchItems();
  }, [offset, limit, categoryFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) {
        setOffset(0);
        fetchItems();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  async function fetchCategories() {
    try {
      const response = await fetch("/api/admin/inventory/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      const categoryNames = (data.data?.categories || []).map((cat: { name: string }) => cat.name);
      setCategories(categoryNames);
    } catch (err) {
      console.error("Categories fetch error:", err);
    }
  }

  async function fetchItems() {
    try {
      setLoading(true);
      const url = new URL("/api/admin/inventory", window.location.origin);
      if (categoryFilter !== "all") {
        url.searchParams.set("category", categoryFilter);
      }
      if (searchQuery) {
        url.searchParams.set("search", searchQuery);
      }
      url.searchParams.set("limit", limit.toString());
      url.searchParams.set("offset", offset.toString());

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch inventory");
      const data = await response.json();
      setItems(data.data?.items || []);
      setTotal(data.data?.total || 0);
    } catch (err) {
      console.error("Inventory fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/admin/inventory/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete item");
      fetchItems();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete item");
    }
  };

  const getStatus = (item: InventoryItem) => {
    if (item.quantity <= item.minStock * 0.5) return "critical";
    if (item.quantity <= item.minStock) return "warning";
    return "good";
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortField("name");
        setSortDirection("asc");
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

  const sortedItems = [...items].sort((a, b) => {
    if (!sortDirection) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "category":
        aValue = a.category.toLowerCase();
        bValue = b.category.toLowerCase();
        break;
      case "quantity":
        aValue = a.quantity;
        bValue = b.quantity;
        break;
      case "minStock":
        aValue = a.minStock;
        bValue = b.minStock;
        break;
      case "cost":
        aValue = a.cost || 0;
        bValue = b.cost || 0;
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
      "Name",
      "Category",
      "Quantity",
      "Unit",
      "Min Stock",
      "Cost",
      "Supplier",
      "Status",
    ];

    const rows = items.map((item) => {
      const status = getStatus(item);
      return [
        item.name,
        item.category,
        item.quantity.toString(),
        item.unit || "",
        item.minStock.toString(),
        item.cost ? Number(item.cost).toFixed(2) : "",
        item.supplier || "",
        status,
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
    link.setAttribute("download", `inventory-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg font-serif">All Inventory Items</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                className="pl-9 w-48 bg-secondary border-0"
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 bg-secondary border-0">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
            <InventoryItemDialog
              open={isAddDialogOpen}
              onOpenChange={(open) => {
                setIsAddDialogOpen(open);
                if (!open) setEditingItem(null);
              }}
              item={editingItem}
              onSuccess={fetchItems}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center hover:text-foreground transition-colors"
                  >
                    Item
                    {getSortIcon("name")}
                  </button>
                </TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("category")}
                    className="flex items-center hover:text-foreground transition-colors"
                  >
                    Category
                    {getSortIcon("category")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("quantity")}
                    className="flex items-center hover:text-foreground transition-colors"
                  >
                    Quantity
                    {getSortIcon("quantity")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("minStock")}
                    className="flex items-center hover:text-foreground transition-colors"
                  >
                    Min Stock
                    {getSortIcon("minStock")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("cost")}
                    className="flex items-center hover:text-foreground transition-colors"
                  >
                    Unit Price
                    {getSortIcon("cost")}
                  </button>
                </TableHead>
                <TableHead>Status</TableHead>
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
              ) : sortedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No inventory items found
                  </TableCell>
                </TableRow>
              ) : (
                sortedItems.map((item) => {
                  const status = getStatus(item);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          {item.supplier && (
                            <p className="text-xs text-muted-foreground">{item.supplier}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{item.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          status === "critical" ? "text-red-600" :
                          status === "warning" ? "text-yellow-600" : "text-foreground"
                        }`}>
                          {item.quantity}
                        </span>
                        {item.unit && (
                          <span className="text-muted-foreground text-sm"> {item.unit}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.minStock} {item.unit || ""}
                      </TableCell>
                      <TableCell>
                        {item.cost ? `$${Number(item.cost).toLocaleString()}` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusStyles[status].bg} ${statusStyles[status].text}`}>
                          {status === "critical" ? "Critical" : 
                           status === "warning" ? "Low" : "In Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingItem({ ...item, quantity: item.quantity + 10 });
                                setIsAddDialogOpen(true);
                              }}
                            >
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Add Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingItem({ ...item, quantity: Math.max(0, item.quantity - 1) });
                                setIsAddDialogOpen(true);
                              }}
                            >
                              <TrendingDown className="w-4 h-4 mr-2" />
                              Remove Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingItem(item);
                                setIsAddDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Item
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        {sortedItems.length > 0 && (
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
    </Card>
  );
}
