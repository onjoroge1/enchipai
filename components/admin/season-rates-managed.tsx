"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Sun,
  Cloud,
  CloudRain,
  TrendingUp,
  TrendingDown,
  Percent,
  Loader2,
} from "lucide-react";
import { SeasonType } from "@/lib/prisma-types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Season {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  type: SeasonType;
  multiplier: number;
  active: boolean;
}

interface SpecialDate {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  multiplier: number;
  active: boolean;
}

const typeStyles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  HIGH: { bg: "bg-orange-100", text: "text-orange-700", icon: <Sun className="w-4 h-4" /> },
  MID: { bg: "bg-blue-100", text: "text-blue-700", icon: <Cloud className="w-4 h-4" /> },
  LOW: { bg: "bg-green-100", text: "text-green-700", icon: <CloudRain className="w-4 h-4" /> },
  PREMIUM: { bg: "bg-purple-100", text: "text-purple-700", icon: <TrendingUp className="w-4 h-4" /> },
};

export function SeasonRatesManaged() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeasonDialogOpen, setIsSeasonDialogOpen] = useState(false);
  const [isSpecialDateDialogOpen, setIsSpecialDateDialogOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [editingSpecialDate, setEditingSpecialDate] = useState<SpecialDate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [seasonForm, setSeasonForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    type: "MID" as SeasonType,
    multiplier: 1.0,
    active: true,
  });

  const [specialDateForm, setSpecialDateForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    multiplier: 1.5,
    active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [seasonsRes, specialDatesRes] = await Promise.all([
        fetch("/api/admin/seasons"),
        fetch("/api/admin/special-dates"),
      ]);

      if (!seasonsRes.ok || !specialDatesRes.ok) throw new Error("Failed to fetch data");

      const seasonsData = await seasonsRes.json();
      const specialDatesData = await specialDatesRes.json();

      setSeasons(seasonsData.data?.seasons || []);
      setSpecialDates(specialDatesData.data?.specialDates || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load season rates");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSeason() {
    try {
      const url = editingSeason
        ? `/api/admin/seasons/${editingSeason.id}`
        : "/api/admin/seasons";
      const method = editingSeason ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...seasonForm,
          startDate: new Date(seasonForm.startDate).toISOString(),
          endDate: new Date(seasonForm.endDate).toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to save season");
      setIsSeasonDialogOpen(false);
      setEditingSeason(null);
      setSeasonForm({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        type: "MID",
        multiplier: 1.0,
        active: true,
      });
      fetchData();
    } catch (err) {
      setError("Failed to save season");
      console.error("Save error:", err);
    }
  }

  async function handleSaveSpecialDate() {
    try {
      const url = editingSpecialDate
        ? `/api/admin/special-dates/${editingSpecialDate.id}`
        : "/api/admin/special-dates";
      const method = editingSpecialDate ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...specialDateForm,
          startDate: new Date(specialDateForm.startDate).toISOString(),
          endDate: new Date(specialDateForm.endDate).toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to save special date");
      setIsSpecialDateDialogOpen(false);
      setEditingSpecialDate(null);
      setSpecialDateForm({
        name: "",
        startDate: "",
        endDate: "",
        multiplier: 1.5,
        active: true,
      });
      fetchData();
    } catch (err) {
      setError("Failed to save special date");
      console.error("Save error:", err);
    }
  }

  async function handleDeleteSeason(id: string) {
    if (!confirm("Are you sure you want to delete this season?")) return;

    try {
      const response = await fetch(`/api/admin/seasons/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete season");
      fetchData();
    } catch (err) {
      setError("Failed to delete season");
      console.error("Delete error:", err);
    }
  }

  async function handleDeleteSpecialDate(id: string) {
    if (!confirm("Are you sure you want to delete this special date?")) return;

    try {
      const response = await fetch(`/api/admin/special-dates/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete special date");
      fetchData();
    } catch (err) {
      setError("Failed to delete special date");
      console.error("Delete error:", err);
    }
  }

  function openEditSeason(season: Season) {
    setEditingSeason(season);
    setSeasonForm({
      name: season.name,
      description: season.description || "",
      startDate: season.startDate.split("T")[0],
      endDate: season.endDate.split("T")[0],
      type: season.type,
      multiplier: season.multiplier,
      active: season.active,
    });
    setIsSeasonDialogOpen(true);
  }

  function openEditSpecialDate(specialDate: SpecialDate) {
    setEditingSpecialDate(specialDate);
    setSpecialDateForm({
      name: specialDate.name,
      startDate: specialDate.startDate.split("T")[0],
      endDate: specialDate.endDate.split("T")[0],
      multiplier: specialDate.multiplier,
      active: specialDate.active,
    });
    setIsSpecialDateDialogOpen(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Season Management */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-serif">Season Rate Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure seasonal pricing multipliers
              </p>
            </div>
            <Dialog
              open={isSeasonDialogOpen}
              onOpenChange={(open) => {
                setIsSeasonDialogOpen(open);
                if (!open) {
                  setEditingSeason(null);
                  setSeasonForm({
                    name: "",
                    description: "",
                    startDate: "",
                    endDate: "",
                    type: "MID",
                    multiplier: 1.0,
                    active: true,
                  });
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Season
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-serif">
                    {editingSeason ? "Edit Season" : "Add New Season"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Season Name</Label>
                    <Input
                      placeholder="e.g., Peak Migration Season"
                      value={seasonForm.name}
                      onChange={(e) => setSeasonForm({ ...seasonForm, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={seasonForm.startDate}
                        onChange={(e) =>
                          setSeasonForm({ ...seasonForm, startDate: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={seasonForm.endDate}
                        onChange={(e) =>
                          setSeasonForm({ ...seasonForm, endDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Season Type</Label>
                      <Select
                        value={seasonForm.type}
                        onValueChange={(value) =>
                          setSeasonForm({ ...seasonForm, type: value as SeasonType })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HIGH">High Season</SelectItem>
                          <SelectItem value="MID">Mid Season</SelectItem>
                          <SelectItem value="LOW">Low Season</SelectItem>
                          <SelectItem value="PREMIUM">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Price Multiplier</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.05"
                          min="0"
                          max="10"
                          placeholder="1.0"
                          value={seasonForm.multiplier}
                          onChange={(e) =>
                            setSeasonForm({
                              ...seasonForm,
                              multiplier: parseFloat(e.target.value) || 1.0,
                            })
                          }
                        />
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="Brief description of the season"
                      value={seasonForm.description}
                      onChange={(e) =>
                        setSeasonForm({ ...seasonForm, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={seasonForm.active}
                      onCheckedChange={(checked) =>
                        setSeasonForm({ ...seasonForm, active: checked })
                      }
                    />
                    <Label>Active</Label>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsSeasonDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-primary text-primary-foreground"
                      onClick={handleSaveSeason}
                    >
                      {editingSeason ? "Update Season" : "Save Season"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {seasons.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No seasons configured</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Season</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Multiplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seasons.map((season) => (
                    <TableRow key={season.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{season.name}</p>
                          {season.description && (
                            <p className="text-xs text-muted-foreground">{season.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          {new Date(season.startDate).toLocaleDateString()} -{" "}
                          {new Date(season.endDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${typeStyles[season.type]?.bg || "bg-gray-100"} ${typeStyles[season.type]?.text || "text-gray-700"}`}
                        >
                          <span className="mr-1">{typeStyles[season.type]?.icon}</span>
                          {season.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {season.multiplier > 1 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : season.multiplier < 1 ? (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          ) : null}
                          <span className="font-semibold">{season.multiplier}x</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch checked={season.active} disabled />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditSeason(season)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteSeason(season.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Special Dates */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-serif">Special Date Pricing</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Premium rates for holidays and special events
              </p>
            </div>
            <Dialog
              open={isSpecialDateDialogOpen}
              onOpenChange={(open) => {
                setIsSpecialDateDialogOpen(open);
                if (!open) {
                  setEditingSpecialDate(null);
                  setSpecialDateForm({
                    name: "",
                    startDate: "",
                    endDate: "",
                    multiplier: 1.5,
                    active: true,
                  });
                }
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Special Date
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-serif">
                    {editingSpecialDate ? "Edit Special Date" : "Add Special Date Pricing"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Event Name</Label>
                    <Input
                      placeholder="e.g., Christmas Holiday"
                      value={specialDateForm.name}
                      onChange={(e) =>
                        setSpecialDateForm({ ...specialDateForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={specialDateForm.startDate}
                        onChange={(e) =>
                          setSpecialDateForm({ ...specialDateForm, startDate: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={specialDateForm.endDate}
                        onChange={(e) =>
                          setSpecialDateForm({ ...specialDateForm, endDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Price Multiplier</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.05"
                        min="0"
                        max="10"
                        placeholder="1.5"
                        value={specialDateForm.multiplier}
                        onChange={(e) =>
                          setSpecialDateForm({
                            ...specialDateForm,
                            multiplier: parseFloat(e.target.value) || 1.5,
                          })
                        }
                      />
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={specialDateForm.active}
                      onCheckedChange={(checked) =>
                        setSpecialDateForm({ ...specialDateForm, active: checked })
                      }
                    />
                    <Label>Active</Label>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsSpecialDateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-primary text-primary-foreground"
                      onClick={handleSaveSpecialDate}
                    >
                      {editingSpecialDate ? "Update Special Date" : "Save Special Date"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {specialDates.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No special dates configured</p>
          ) : (
            <div className="grid gap-3">
              {specialDates.map((date) => (
                <div
                  key={date.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg ${typeStyles.PREMIUM.bg} flex items-center justify-center`}
                    >
                      {typeStyles.PREMIUM.icon}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{date.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(date.startDate).toLocaleDateString()} -{" "}
                        {new Date(date.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-purple-100 text-purple-700">
                      {date.multiplier}x rate
                    </Badge>
                    <Switch checked={date.active} disabled />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditSpecialDate(date)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteSpecialDate(date.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

