"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsForm } from "./settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Building2, 
  Users, 
  Bell, 
  CreditCard, 
  Shield,
  Plus,
  MoreVertical,
  Pencil,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const teamMembers = [
  { id: 1, name: "James Ochieng", email: "james@enchipai.com", role: "Admin", avatar: null, status: "active" },
  { id: 2, name: "Sarah Wanjiku", email: "sarah@enchipai.com", role: "Manager", avatar: null, status: "active" },
  { id: 3, name: "David Kimani", email: "david@enchipai.com", role: "Guide", avatar: null, status: "active" },
  { id: 4, name: "Grace Akinyi", email: "grace@enchipai.com", role: "Receptionist", avatar: null, status: "active" },
  { id: 5, name: "Peter Mutua", email: "peter@enchipai.com", role: "Guide", avatar: null, status: "inactive" },
];

const roles = [
  { id: "admin", label: "Admin", description: "Full access to all features and settings" },
  { id: "manager", label: "Manager", description: "Manage bookings, guests, and staff" },
  { id: "receptionist", label: "Receptionist", description: "Handle bookings and guest check-in/out" },
  { id: "guide", label: "Guide", description: "View schedules and log wildlife sightings" },
  { id: "accountant", label: "Accountant", description: "Access invoices and financial reports" },
];

export function SettingsTabs() {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
        <TabsTrigger value="general" className="gap-2">
          <Building2 className="w-4 h-4 hidden sm:block" />
          General
        </TabsTrigger>
        <TabsTrigger value="team" className="gap-2">
          <Users className="w-4 h-4 hidden sm:block" />
          Team
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-2">
          <Bell className="w-4 h-4 hidden sm:block" />
          Alerts
        </TabsTrigger>
        <TabsTrigger value="billing" className="gap-2">
          <CreditCard className="w-4 h-4 hidden sm:block" />
          Billing
        </TabsTrigger>
        <TabsTrigger value="security" className="gap-2">
          <Shield className="w-4 h-4 hidden sm:block" />
          Security
        </TabsTrigger>
      </TabsList>

      {/* General Settings */}
      <TabsContent value="general">
        <SettingsForm />
      </TabsContent>

      {/* Team Settings */}
      <TabsContent value="team">
        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage staff access and roles</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={member.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {member.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{member.name}</p>
                        {member.status === "inactive" && (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <Badge variant="outline">{member.role}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                        <DropdownMenuItem>Reset Password</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>Define what each role can access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="font-medium text-foreground">{role.label}</p>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Notification Settings */}
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Alert Preferences</CardTitle>
            <CardDescription>Choose how you want to be notified</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Booking Alerts</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">New Booking</p>
                    <p className="text-xs text-muted-foreground">When a new reservation is made</p>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch defaultChecked /> Email
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch defaultChecked /> SMS
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Booking Cancelled</p>
                    <p className="text-xs text-muted-foreground">When a guest cancels</p>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch defaultChecked /> Email
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch /> SMS
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Check-in Reminder</p>
                    <p className="text-xs text-muted-foreground">24 hours before guest arrival</p>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch defaultChecked /> Email
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch defaultChecked /> SMS
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Payment Alerts</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Payment Received</p>
                    <p className="text-xs text-muted-foreground">When payment is successful</p>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch defaultChecked /> Email
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch /> SMS
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Payment Overdue</p>
                    <p className="text-xs text-muted-foreground">When invoice is past due</p>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch defaultChecked /> Email
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch defaultChecked /> SMS
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-foreground">System Alerts</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Channel Sync Issues</p>
                    <p className="text-xs text-muted-foreground">When OTA sync fails</p>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch defaultChecked /> Email
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch /> SMS
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Daily Summary</p>
                    <p className="text-xs text-muted-foreground">End of day report</p>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch defaultChecked /> Email
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch /> SMS
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Billing Settings */}
      <TabsContent value="billing">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Configure how you receive payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-white text-xs font-bold">
                    STRIPE
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Stripe</p>
                    <p className="text-sm text-muted-foreground">Connected - ****4242</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 rounded bg-gradient-to-r from-yellow-500 to-yellow-400 flex items-center justify-center text-blue-900 text-xs font-bold">
                    PP
                  </div>
                  <div>
                    <p className="font-medium text-foreground">PayPal</p>
                    <p className="text-sm text-muted-foreground">reservations@enchipai.com</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 rounded bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center text-white text-xs font-bold">
                    M-PESA
                  </div>
                  <div>
                    <p className="font-medium text-foreground">M-Pesa</p>
                    <p className="text-sm text-muted-foreground">Paybill: 123456</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax Settings</CardTitle>
              <CardDescription>Configure tax rates and rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vat">VAT Rate (%)</Label>
                  <Input id="vat" type="number" defaultValue="16" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tourism-levy">Tourism Levy (%)</Label>
                  <Input id="tourism-levy" type="number" defaultValue="2" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Include Tax in Displayed Prices</p>
                  <p className="text-sm text-muted-foreground">Show prices with tax included</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Security Settings */}
      <TabsContent value="security">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to admin accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Require 2FA for Admins</p>
                  <p className="text-sm text-muted-foreground">All admin accounts must use 2FA</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Require 2FA for All Staff</p>
                  <p className="text-sm text-muted-foreground">Everyone must use 2FA</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Settings</CardTitle>
              <CardDescription>Control login session behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input id="session-timeout" type="number" defaultValue="60" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Force Logout on Browser Close</p>
                  <p className="text-sm text-muted-foreground">End session when browser is closed</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Single Device Login</p>
                  <p className="text-sm text-muted-foreground">Only allow one active session per user</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
              <CardDescription>Set requirements for user passwords</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="min-length">Minimum Password Length</Label>
                <Input id="min-length" type="number" defaultValue="12" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Require Special Characters</p>
                  <p className="text-sm text-muted-foreground">At least one symbol required</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Password Expiration</p>
                  <p className="text-sm text-muted-foreground">Force password change every 90 days</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
