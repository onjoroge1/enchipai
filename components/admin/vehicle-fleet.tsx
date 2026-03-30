"use client";

import React from "react"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
  Plus,
  MoreHorizontal,
  Car,
  Fuel,
  Gauge,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Wrench,
} from "lucide-react";

const vehicles = [
  {
    id: 1,
    name: "Land Cruiser #1",
    registration: "KDH 123A",
    type: "Safari Vehicle",
    capacity: 6,
    status: "active",
    fuelLevel: 85,
    mileage: "124,500 km",
    lastService: "Jan 15, 2026",
    nextService: "Feb 15, 2026",
    driver: "Joseph Mutua",
  },
  {
    id: 2,
    name: "Land Cruiser #2",
    registration: "KDH 456B",
    type: "Safari Vehicle",
    capacity: 6,
    status: "active",
    fuelLevel: 45,
    mileage: "98,200 km",
    lastService: "Jan 10, 2026",
    nextService: "Feb 10, 2026",
    driver: "Peter Kimani",
  },
  {
    id: 3,
    name: "Land Cruiser #3",
    registration: "KDH 789C",
    type: "Safari Vehicle",
    capacity: 6,
    status: "maintenance",
    fuelLevel: 20,
    mileage: "156,800 km",
    lastService: "Dec 20, 2025",
    nextService: "Overdue",
    driver: "David Mwangi",
  },
  {
    id: 4,
    name: "Land Rover Defender",
    registration: "KDJ 321D",
    type: "Transfer Vehicle",
    capacity: 4,
    status: "active",
    fuelLevel: 70,
    mileage: "67,300 km",
    lastService: "Jan 5, 2026",
    nextService: "Feb 5, 2026",
    driver: "Unassigned",
  },
  {
    id: 5,
    name: "Safari Van",
    registration: "KDK 654E",
    type: "Group Transport",
    capacity: 8,
    status: "active",
    fuelLevel: 90,
    mileage: "45,100 km",
    lastService: "Jan 20, 2026",
    nextService: "Feb 20, 2026",
    driver: "John Oloo",
  },
  {
    id: 6,
    name: "Land Cruiser #4",
    registration: "KDL 987F",
    type: "Safari Vehicle",
    capacity: 6,
    status: "service-due",
    fuelLevel: 55,
    mileage: "142,000 km",
    lastService: "Dec 1, 2025",
    nextService: "Jan 31, 2026",
    driver: "Samuel Njenga",
  },
];

const statusStyles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  active: {
    bg: "bg-green-100",
    text: "text-green-700",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  maintenance: {
    bg: "bg-red-100",
    text: "text-red-700",
    icon: <Wrench className="w-3 h-3" />,
  },
  "service-due": {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    icon: <AlertTriangle className="w-3 h-3" />,
  },
};

export function VehicleFleet() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg font-serif">Vehicle Fleet</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif">Add New Vehicle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vehicle Name</Label>
                    <Input placeholder="e.g., Land Cruiser #5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Registration</Label>
                    <Input placeholder="e.g., KDH 123A" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vehicle Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="safari">Safari Vehicle</SelectItem>
                        <SelectItem value="transfer">Transfer Vehicle</SelectItem>
                        <SelectItem value="group">Group Transport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Capacity</Label>
                    <Input type="number" placeholder="6" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Current Mileage (km)</Label>
                    <Input type="number" placeholder="50000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Assign Driver</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="joseph">Joseph Mutua</SelectItem>
                        <SelectItem value="peter">Peter Kimani</SelectItem>
                        <SelectItem value="david">David Mwangi</SelectItem>
                        <SelectItem value="none">Leave Unassigned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-primary text-primary-foreground"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Add Vehicle
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`p-4 rounded-xl border border-border/50 bg-card ${
                vehicle.status === "maintenance" ? "border-red-200" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Car className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{vehicle.name}</h3>
                    <p className="text-xs text-muted-foreground">{vehicle.registration}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Log Fuel</DropdownMenuItem>
                    <DropdownMenuItem>Schedule Service</DropdownMenuItem>
                    <DropdownMenuItem>Assign Driver</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Mark Out of Service</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{vehicle.type}</Badge>
                  <Badge className={`${statusStyles[vehicle.status].bg} ${statusStyles[vehicle.status].text}`}>
                    <span className="mr-1">{statusStyles[vehicle.status].icon}</span>
                    {vehicle.status === "service-due" ? "Service Due" : vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Fuel className="w-4 h-4" />
                      Fuel Level
                    </span>
                    <span className="font-medium">{vehicle.fuelLevel}%</span>
                  </div>
                  <Progress 
                    value={vehicle.fuelLevel} 
                    className={`h-2 ${vehicle.fuelLevel < 30 ? "[&>div]:bg-red-500" : vehicle.fuelLevel < 50 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Gauge className="w-4 h-4" />
                    <span>{vehicle.mileage}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className={vehicle.nextService === "Overdue" ? "text-red-500 font-medium" : ""}>
                      {vehicle.nextService}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Driver: </span>
                    <span className={vehicle.driver === "Unassigned" ? "text-yellow-600" : "font-medium"}>
                      {vehicle.driver}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
