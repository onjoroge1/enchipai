"use client";

import React from "react"

import { useState } from "react";
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
} from "lucide-react";

const seasons = [
  {
    id: 1,
    name: "Peak Migration Season",
    startDate: "Jul 1",
    endDate: "Oct 31",
    type: "high",
    multiplier: 1.5,
    description: "Great Migration river crossings",
    active: true,
  },
  {
    id: 2,
    name: "Green Season",
    startDate: "Nov 1",
    endDate: "Dec 15",
    type: "low",
    multiplier: 0.75,
    description: "Short rains, fewer tourists, great for bird watching",
    active: true,
  },
  {
    id: 3,
    name: "Dry Season",
    startDate: "Jan 1",
    endDate: "Mar 15",
    type: "mid",
    multiplier: 1.0,
    description: "Excellent wildlife viewing, calving season",
    active: true,
  },
  {
    id: 4,
    name: "Long Rains",
    startDate: "Mar 16",
    endDate: "May 31",
    type: "low",
    multiplier: 0.65,
    description: "Heavy rainfall, lowest rates",
    active: true,
  },
  {
    id: 5,
    name: "Pre-Migration",
    startDate: "Jun 1",
    endDate: "Jun 30",
    type: "mid",
    multiplier: 1.2,
    description: "Build-up to migration season",
    active: true,
  },
];

const specialDates = [
  {
    id: 1,
    name: "Christmas & New Year",
    startDate: "Dec 20",
    endDate: "Jan 5",
    type: "premium",
    multiplier: 1.75,
    active: true,
  },
  {
    id: 2,
    name: "Easter Holiday",
    startDate: "Apr 10",
    endDate: "Apr 20",
    type: "premium",
    multiplier: 1.25,
    active: true,
  },
  {
    id: 3,
    name: "Valentine's Weekend",
    startDate: "Feb 13",
    endDate: "Feb 15",
    type: "premium",
    multiplier: 1.3,
    active: true,
  },
];

const tentBaseRates = [
  { name: "Ndovu Tent", baseRate: 396 },
  { name: "Chui Tent", baseRate: 396 },
  { name: "Kifaru Tent", baseRate: 396 },
  { name: "Simba Tent", baseRate: 396 },
  { name: "Twiga Tent", baseRate: 1426 },
  { name: "Kiboko Tent", baseRate: 1584 },
  { name: "Nyati Tent", baseRate: 356 },
];

const typeStyles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  high: { bg: "bg-orange-100", text: "text-orange-700", icon: <Sun className="w-4 h-4" /> },
  mid: { bg: "bg-blue-100", text: "text-blue-700", icon: <Cloud className="w-4 h-4" /> },
  low: { bg: "bg-green-100", text: "text-green-700", icon: <CloudRain className="w-4 h-4" /> },
  premium: { bg: "bg-purple-100", text: "text-purple-700", icon: <TrendingUp className="w-4 h-4" /> },
};

// This component is deprecated - use SeasonRatesManaged instead
export function SeasonRates() {
  const [isSeasonDialogOpen, setIsSeasonDialogOpen] = useState(false);
  const [isSpecialDateDialogOpen, setIsSpecialDateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
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
            <Dialog open={isSeasonDialogOpen} onOpenChange={setIsSeasonDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Season
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-serif">Add New Season</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Season Name</Label>
                    <Input placeholder="e.g., Peak Migration Season" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Season Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High Season</SelectItem>
                          <SelectItem value="mid">Mid Season</SelectItem>
                          <SelectItem value="low">Low Season</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Price Multiplier</Label>
                      <div className="relative">
                        <Input type="number" step="0.05" placeholder="1.0" />
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input placeholder="Brief description of the season" />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsSeasonDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-primary text-primary-foreground"
                      onClick={() => setIsSeasonDialogOpen(false)}
                    >
                      Save Season
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
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
                        <p className="text-xs text-muted-foreground">{season.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        {season.startDate} - {season.endDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${typeStyles[season.type].bg} ${typeStyles[season.type].text}`}>
                        <span className="mr-1">{typeStyles[season.type].icon}</span>
                        {season.type === "high" ? "High" : season.type === "mid" ? "Mid" : "Low"}
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
                      <Switch checked={season.active} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
            <Dialog open={isSpecialDateDialogOpen} onOpenChange={setIsSpecialDateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Special Date
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-serif">Add Special Date Pricing</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Event Name</Label>
                    <Input placeholder="e.g., Christmas Holiday" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Price Multiplier</Label>
                    <div className="relative">
                      <Input type="number" step="0.05" placeholder="1.5" />
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsSpecialDateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-primary text-primary-foreground"
                      onClick={() => setIsSpecialDateDialogOpen(false)}
                    >
                      Save Special Date
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {specialDates.map((date) => (
              <div
                key={date.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg ${typeStyles.premium.bg} flex items-center justify-center`}>
                    {typeStyles.premium.icon}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{date.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {date.startDate} - {date.endDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-purple-100 text-purple-700">
                    {date.multiplier}x rate
                  </Badge>
                  <Switch checked={date.active} />
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rate Calculator */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-serif">Current Rate Preview</CardTitle>
          <p className="text-sm text-muted-foreground">
            Calculated rates based on current season (Peak Migration Season - 1.5x)
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tent</TableHead>
                  <TableHead>Base Rate</TableHead>
                  <TableHead>Season Multiplier</TableHead>
                  <TableHead>Current Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tentBaseRates.map((tent) => (
                  <TableRow key={tent.name}>
                    <TableCell className="font-medium">{tent.name}</TableCell>
                    <TableCell>${tent.baseRate}/night</TableCell>
                    <TableCell>
                      <Badge className="bg-orange-100 text-orange-700">1.5x</Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      ${Math.round(tent.baseRate * 1.5)}/night
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
