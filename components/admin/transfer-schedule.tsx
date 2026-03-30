"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Clock,
  MapPin,
  User,
  Car,
  Edit,
  Trash2,
  Loader2,
  Eye,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { TransferType, TransferStatus } from "@/lib/prisma-types";
import { TransferFormDialog } from "./transfer-form-dialog";

interface Transfer {
  id: string;
  type: TransferType;
  from: string;
  to: string;
  date: string;
  time: string | null;
  vehicle: string | null;
  driver: string | null;
  guests: string | null;
  status: TransferStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusStyles: Record<TransferStatus, { bg: string; text: string }> = {
  SCHEDULED: { bg: "bg-yellow-100", text: "text-yellow-700" },
  IN_PROGRESS: { bg: "bg-blue-100", text: "text-blue-700" },
  COMPLETED: { bg: "bg-gray-100", text: "text-gray-700" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-700" },
};

// Map TransferType to icons and colors
function getTransferIcon(type: TransferType) {
  switch (type) {
    case TransferType.AIRPORT_PICKUP:
      return { icon: PlaneLanding, color: "bg-green-100 text-green-600" };
    case TransferType.AIRPORT_DROPOFF:
      return { icon: PlaneTakeoff, color: "bg-blue-100 text-blue-600" };
    case TransferType.GAME_DRIVE:
      return { icon: Car, color: "bg-purple-100 text-purple-600" };
    case TransferType.EXCURSION:
      return { icon: MapPin, color: "bg-orange-100 text-orange-600" };
    default:
      return { icon: Car, color: "bg-gray-100 text-gray-600" };
  }
}

export function TransferSchedule() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);

  useEffect(() => {
    fetchTransfers();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) fetchTransfers();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  async function fetchTransfers() {
    try {
      setLoading(true);
      const url = new URL("/api/admin/transfers", window.location.origin);
      if (searchQuery) {
        // Note: API doesn't support search yet, but we can filter client-side
      }

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch transfers");
      const data = await response.json();
      setTransfers(data.data?.transfers || []);
    } catch (err) {
      console.error("Transfers fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (transferId: string) => {
    if (!confirm("Are you sure you want to delete this transfer?")) return;

    try {
      const response = await fetch(`/api/admin/transfers/${transferId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete transfer");
      }
      fetchTransfers();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete transfer");
    }
  };

  const filteredTransfers = transfers.filter((t) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.id.toLowerCase().includes(query) ||
      t.from.toLowerCase().includes(query) ||
      t.to.toLowerCase().includes(query) ||
      (t.guests && t.guests.toLowerCase().includes(query)) ||
      (t.driver && t.driver.toLowerCase().includes(query))
    );
  });

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-serif">Transfer Schedule</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search transfers..."
                  className="pl-9 w-48 bg-secondary border-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
              <Button onClick={() => {
                setEditingTransfer(null);
                setIsDialogOpen(true);
              }} className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Transfer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTransfers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {transfers.length === 0 ? "No transfers found" : "No transfers match your search"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransfers.map((transfer) => {
                const transferDate = new Date(transfer.date);
                const createdAt = new Date(transfer.createdAt);
                const { icon: Icon, color } = getTransferIcon(transfer.type);
                const statusStyle = statusStyles[transfer.status];

                return (
                  <div
                    key={transfer.id}
                    className="p-4 rounded-xl bg-secondary/50 border border-border/50"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm text-muted-foreground">{transfer.id.substring(0, 8)}</span>
                            <Badge className={`${statusStyle.bg} ${statusStyle.text}`}>
                              {transfer.status.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          {transfer.guests && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">{transfer.guests}</span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              {format(transferDate, "MMM d, yyyy")}
                              {transfer.time && ` at ${transfer.time}`}
                            </span>
                            {transfer.type === TransferType.AIRPORT_PICKUP || transfer.type === TransferType.AIRPORT_DROPOFF ? (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Plane className="w-4 h-4" />
                                {transfer.type === TransferType.AIRPORT_PICKUP ? "Arrival" : "Departure"}
                              </span>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{transfer.from}</span>
                            <span className="text-muted-foreground">to</span>
                            <span>{transfer.to}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>Logged: {format(createdAt, "MMM d, yyyy 'at' h:mm a")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          {transfer.vehicle && (
                            <div className="flex items-center gap-2 text-sm">
                              <Car className="w-4 h-4 text-muted-foreground" />
                              <span className={transfer.vehicle === "Unassigned" ? "text-yellow-600" : ""}>
                                {transfer.vehicle}
                              </span>
                            </div>
                          )}
                          {transfer.driver && (
                            <p className={`text-sm ${transfer.driver === "Unassigned" ? "text-yellow-600" : "text-muted-foreground"}`}>
                              {transfer.driver}
                            </p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingTransfer(transfer);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Transfer
                            </DropdownMenuItem>
                            {transfer.status !== TransferStatus.CANCELLED && (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(transfer.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Cancel Transfer
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <TransferFormDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingTransfer(null);
        }}
        transfer={editingTransfer}
        onSuccess={fetchTransfers}
      />
    </>
  );
}
