"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2 } from "lucide-react";

interface GeneralSettings {
  campName: string;
  tagline: string;
  description: string;
  contactEmail: string;
  phone: string;
  currency: string;
  timezone: string;
  language: string;
}

interface BookingSettings {
  instantBooking: boolean;
  requireDeposit: boolean;
  depositPercentage: number;
  autoConfirmOTA: boolean;
  checkInTime: string;
  checkOutTime: string;
}

export function SettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [general, setGeneral] = useState<GeneralSettings>({
    campName: "",
    tagline: "",
    description: "",
    contactEmail: "",
    phone: "",
    currency: "usd",
    timezone: "eat",
    language: "en",
  });
  const [booking, setBooking] = useState<BookingSettings>({
    instantBooking: true,
    requireDeposit: true,
    depositPercentage: 50,
    autoConfirmOTA: false,
    checkInTime: "14:00",
    checkOutTime: "10:00",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();
      
      if (data.data?.general) {
        setGeneral(data.data.general);
      }
      if (data.data?.booking) {
        setBooking(data.data.booking);
      }
    } catch (err) {
      console.error("Settings fetch error:", err);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Save general settings
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "general",
          settings: general,
        }),
      });

      // Save booking settings
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "booking",
          settings: booking,
        }),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save settings");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
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
      {success && (
        <Alert>
          <CheckCircle2 className="w-4 h-4" />
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Camp Information</CardTitle>
          <CardDescription>Basic details about your camp</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="camp-name">Camp Name</Label>
              <Input
                id="camp-name"
                value={general.campName}
                onChange={(e) => setGeneral({ ...general, campName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={general.tagline}
                onChange={(e) => setGeneral({ ...general, tagline: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={general.description}
              onChange={(e) => setGeneral({ ...general, description: e.target.value })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={general.contactEmail}
                onChange={(e) => setGeneral({ ...general, contactEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={general.phone}
                onChange={(e) => setGeneral({ ...general, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={general.currency}
                onValueChange={(value) => setGeneral({ ...general, currency: value })}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="kes">KES (KSh)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="gbp">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={general.timezone}
                onValueChange={(value) => setGeneral({ ...general, timezone: value })}
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eat">East Africa Time (EAT)</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="gmt">GMT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={general.language}
                onValueChange={(value) => setGeneral({ ...general, language: value })}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="sw">Swahili</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking Settings</CardTitle>
          <CardDescription>Configure how bookings are handled</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Instant Booking</p>
              <p className="text-sm text-muted-foreground">Allow guests to book without approval</p>
            </div>
            <Switch
              checked={booking.instantBooking}
              onCheckedChange={(checked) => setBooking({ ...booking, instantBooking: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Require Deposit</p>
              <p className="text-sm text-muted-foreground">Collect deposit at booking</p>
            </div>
            <Switch
              checked={booking.requireDeposit}
              onCheckedChange={(checked) => setBooking({ ...booking, requireDeposit: checked })}
            />
          </div>
          {booking.requireDeposit && (
            <div className="space-y-2">
              <Label htmlFor="deposit-percentage">Deposit Percentage</Label>
              <Input
                id="deposit-percentage"
                type="number"
                min="0"
                max="100"
                value={booking.depositPercentage}
                onChange={(e) =>
                  setBooking({ ...booking, depositPercentage: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Auto-confirm OTA Bookings</p>
              <p className="text-sm text-muted-foreground">Automatically confirm bookings from channels</p>
            </div>
            <Switch
              checked={booking.autoConfirmOTA}
              onCheckedChange={(checked) => setBooking({ ...booking, autoConfirmOTA: checked })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="checkin">Check-in Time</Label>
              <Input
                id="checkin"
                type="time"
                value={booking.checkInTime}
                onChange={(e) => setBooking({ ...booking, checkInTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout">Check-out Time</Label>
              <Input
                id="checkout"
                type="time"
                value={booking.checkOutTime}
                onChange={(e) => setBooking({ ...booking, checkOutTime: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}

