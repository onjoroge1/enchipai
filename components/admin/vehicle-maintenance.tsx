"use client";

import React from "react"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Plus,
  Wrench,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  FileText,
} from "lucide-react";

const maintenanceRecords = [
  {
    id: 1,
    vehicle: "Land Cruiser #3",
    type: "Engine Overhaul",
    status: "in-progress",
    startDate: "Jan 28, 2026",
    estimatedCompletion: "Feb 3, 2026",
    mechanic: "Safari Garage Ltd",
    cost: "$2,500",
    notes: "Complete engine service and transmission check",
  },
  {
    id: 2,
    vehicle: "Land Cruiser #4",
    type: "Regular Service",
    status: "scheduled",
    startDate: "Jan 31, 2026",
    estimatedCompletion: "Jan 31, 2026",
    mechanic: "In-house",
    cost: "$350",
    notes: "Oil change, filter replacement, brake inspection",
  },
  {
    id: 3,
    vehicle: "Land Cruiser #1",
    type: "Tire Replacement",
    status: "completed",
    startDate: "Jan 15, 2026",
    estimatedCompletion: "Jan 15, 2026",
    mechanic: "In-house",
    cost: "$800",
    notes: "Replaced all 4 tires with new BF Goodrich",
  },
  {
    id: 4,
    vehicle: "Safari Van",
    type: "AC Repair",
    status: "completed",
    startDate: "Jan 20, 2026",
    estimatedCompletion: "Jan 21, 2026",
    mechanic: "Auto Cool Services",
    cost: "$450",
    notes: "Recharged AC system and replaced compressor",
  },
];

const fuelLogs = [
  { date: "Jan 30, 2026", vehicle: "Land Cruiser #1", liters: 80, cost: "$160", driver: "Joseph Mutua" },
  { date: "Jan 29, 2026", vehicle: "Land Cruiser #2", liters: 75, cost: "$150", driver: "Peter Kimani" },
  { date: "Jan 29, 2026", vehicle: "Safari Van", liters: 60, cost: "$120", driver: "John Oloo" },
  { date: "Jan 28, 2026", vehicle: "Land Rover Defender", liters: 55, cost: "$110", driver: "Joseph Mutua" },
  { date: "Jan 27, 2026", vehicle: "Land Cruiser #1", liters: 85, cost: "$170", driver: "Joseph Mutua" },
];

const statusStyles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  completed: {
    bg: "bg-green-100",
    text: "text-green-700",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  "in-progress": {
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: <Wrench className="w-3 h-3" />,
  },
  scheduled: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    icon: <Clock className="w-3 h-3" />,
  },
};

export function VehicleMaintenance() {
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [isFuelDialogOpen, setIsFuelDialogOpen] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Maintenance Records */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-serif">Maintenance Records</CardTitle>
            <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-1" />
                  Log Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-serif">Log Maintenance Service</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vehicle</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lc1">Land Cruiser #1</SelectItem>
                          <SelectItem value="lc2">Land Cruiser #2</SelectItem>
                          <SelectItem value="lc3">Land Cruiser #3</SelectItem>
                          <SelectItem value="lc4">Land Cruiser #4</SelectItem>
                          <SelectItem value="van">Safari Van</SelectItem>
                          <SelectItem value="defender">Land Rover Defender</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Service Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">Regular Service</SelectItem>
                          <SelectItem value="oil">Oil Change</SelectItem>
                          <SelectItem value="tires">Tire Service</SelectItem>
                          <SelectItem value="brakes">Brake Service</SelectItem>
                          <SelectItem value="engine">Engine Repair</SelectItem>
                          <SelectItem value="ac">AC Service</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Estimated Completion</Label>
                      <Input type="date" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Mechanic/Garage</Label>
                      <Input placeholder="e.g., In-house or garage name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Estimated Cost ($)</Label>
                      <Input type="number" placeholder="500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea placeholder="Describe the work to be done..." rows={3} />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsMaintenanceDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-primary text-primary-foreground"
                      onClick={() => setIsMaintenanceDialogOpen(false)}
                    >
                      Log Service
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {maintenanceRecords.map((record) => (
              <div
                key={record.id}
                className="p-3 rounded-lg bg-secondary/50 border border-border/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground">{record.vehicle}</p>
                    <p className="text-sm text-muted-foreground">{record.type}</p>
                  </div>
                  <Badge className={`${statusStyles[record.status].bg} ${statusStyles[record.status].text}`}>
                    <span className="mr-1">{statusStyles[record.status].icon}</span>
                    {record.status === "in-progress" ? "In Progress" : record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {record.startDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Wrench className="w-3 h-3" />
                    {record.mechanic}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {record.cost}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fuel Logs */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-serif">Fuel Log</CardTitle>
            <Dialog open={isFuelDialogOpen} onOpenChange={setIsFuelDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Log Fuel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-serif">Log Fuel Purchase</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vehicle</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lc1">Land Cruiser #1</SelectItem>
                          <SelectItem value="lc2">Land Cruiser #2</SelectItem>
                          <SelectItem value="lc3">Land Cruiser #3</SelectItem>
                          <SelectItem value="lc4">Land Cruiser #4</SelectItem>
                          <SelectItem value="van">Safari Van</SelectItem>
                          <SelectItem value="defender">Land Rover Defender</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Liters</Label>
                      <Input type="number" placeholder="80" />
                    </div>
                    <div className="space-y-2">
                      <Label>Cost ($)</Label>
                      <Input type="number" placeholder="160" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Driver</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="joseph">Joseph Mutua</SelectItem>
                        <SelectItem value="peter">Peter Kimani</SelectItem>
                        <SelectItem value="david">David Mwangi</SelectItem>
                        <SelectItem value="john">John Oloo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsFuelDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-primary text-primary-foreground"
                      onClick={() => setIsFuelDialogOpen(false)}
                    >
                      Log Fuel
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
                  <TableHead>Date</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Liters</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fuelLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm">{log.date}</TableCell>
                    <TableCell className="font-medium">{log.vehicle}</TableCell>
                    <TableCell>{log.liters}L</TableCell>
                    <TableCell className="font-semibold">{log.cost}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total this month:</span>
            <div className="text-right">
              <p className="font-semibold text-foreground">1,240 Liters</p>
              <p className="text-sm text-muted-foreground">$2,480</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
