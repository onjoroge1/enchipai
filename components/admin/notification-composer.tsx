"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  MessageSquare,
  Phone,
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const quickTemplates = [
  { id: "checkin", label: "Check-in Reminder", message: "Reminder: Your stay at Enchipai begins tomorrow. Check-in is at 2:00 PM. We look forward to welcoming you!" },
  { id: "payment", label: "Payment Reminder", message: "Friendly reminder: Your booking balance is due soon. Please complete payment to confirm your booking." },
  { id: "thankyou", label: "Thank You", message: "Thank you for staying with us at Enchipai Mara Camp! We hope you had an unforgettable safari experience." },
  { id: "weather", label: "Weather Alert", message: "Weather update: Please dress accordingly for your game drive today. Ask your guide for details." },
];

const recipientGroups = [
  { id: "all-guests", label: "All Current Guests" },
  { id: "arriving-today", label: "Arriving Today" },
  { id: "departing-today", label: "Departing Today" },
  { id: "all-staff", label: "All Staff" },
];

interface ServiceStatus {
  sms: { configured: boolean; provider: string };
  whatsapp: { configured: boolean; provider: string };
}

interface SendResult {
  sent: number;
  failed: number;
  totalRecipients: number;
  errors?: string[];
}

export function NotificationComposer() {
  const [channel, setChannel] = useState("whatsapp");
  const [recipient, setRecipient] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // Fetch service status on mount
  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch("/api/admin/messaging");
        if (response.ok) {
          const data = await response.json();
          setServiceStatus(data.data?.services || null);
        }
      } catch {
        // Silently fail - status will show as unknown
      }
    }
    fetchStatus();
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    const template = quickTemplates.find(t => t.id === templateId);
    if (template) {
      setMessage(template.message);
    }
  };

  const handleSend = async () => {
    setSending(true);
    setSendResult(null);
    setSendError(null);

    try {
      const payload: { channel: string; message: string; recipientGroup?: string; recipientPhone?: string } = {
        channel,
        message,
      };

      if (recipient === "custom") {
        payload.recipientPhone = customPhone;
      } else {
        payload.recipientGroup = recipient;
      }

      const response = await fetch("/api/admin/messaging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSendResult(data.data);
        setMessage("");
        setRecipient("");
        setCustomPhone("");
      } else {
        setSendError(data.error || "Failed to send message");
      }
    } catch {
      setSendError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const charCount = message.length;
  const maxChars = channel === "sms" ? 160 : 1000;

  const smsConfigured = serviceStatus?.sms?.configured ?? false;
  const whatsappConfigured = serviceStatus?.whatsapp?.configured ?? false;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Send Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Channel Selection */}
          <div className="space-y-2">
            <Label>Channel</Label>
            <div className="flex gap-2">
              <Button
                variant={channel === "whatsapp" ? "default" : "outline"}
                size="sm"
                onClick={() => setChannel("whatsapp")}
                className="flex-1"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                variant={channel === "sms" ? "default" : "outline"}
                size="sm"
                onClick={() => setChannel("sms")}
                className="flex-1"
              >
                <Phone className="w-4 h-4 mr-2" />
                SMS
              </Button>
            </div>
          </div>

          {/* Recipient */}
          <div className="space-y-2">
            <Label>Recipients</Label>
            <Select value={recipient} onValueChange={setRecipient}>
              <SelectTrigger>
                <SelectValue placeholder="Select recipients" />
              </SelectTrigger>
              <SelectContent>
                {recipientGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {group.label}
                    </span>
                  </SelectItem>
                ))}
                <SelectItem value="custom">
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Custom Number
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            {recipient === "custom" && (
              <input
                type="tel"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="+254 7XX XXX XXX"
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
              />
            )}
          </div>

          {/* Quick Templates */}
          <div className="space-y-2">
            <Label>Quick Templates</Label>
            <div className="flex flex-wrap gap-2">
              {quickTemplates.map((template) => (
                <Badge
                  key={template.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  {template.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Message</Label>
              <span className={`text-xs ${charCount > maxChars ? "text-red-500" : "text-muted-foreground"}`}>
                {charCount}/{maxChars}
              </span>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Schedule Option */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="schedule"
              checked={scheduleEnabled}
              onCheckedChange={(checked) => setScheduleEnabled(checked as boolean)}
            />
            <Label htmlFor="schedule" className="text-sm font-normal cursor-pointer">
              Schedule for later
            </Label>
          </div>

          {scheduleEnabled && (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              />
              <input
                type="time"
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              />
            </div>
          )}

          {/* Send Result */}
          {sendResult && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">
                  {sendResult.sent} of {sendResult.totalRecipients} messages sent
                </span>
              </div>
              {sendResult.failed > 0 && (
                <p className="mt-1 text-green-700">{sendResult.failed} failed</p>
              )}
            </div>
          )}

          {sendError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm">
              <div className="flex items-center gap-2 text-red-800">
                <XCircle className="w-4 h-4" />
                <span>{sendError}</span>
              </div>
            </div>
          )}

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!recipient || !message || sending || charCount > maxChars || (recipient === "custom" && !customPhone)}
            className="w-full"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {scheduleEnabled ? "Schedule Message" : "Send Now"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* SMS/WhatsApp Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className={`flex items-center justify-between p-3 rounded-lg border ${
            whatsappConfigured ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
          }`}>
            <div className="flex items-center gap-2">
              <MessageSquare className={`w-5 h-5 ${whatsappConfigured ? "text-green-600" : "text-amber-600"}`} />
              <div>
                <span className={`text-sm font-medium ${whatsappConfigured ? "text-green-800" : "text-amber-800"}`}>
                  WhatsApp Cloud API
                </span>
              </div>
            </div>
            <Badge className={whatsappConfigured ? "bg-green-600" : "bg-amber-600"}>
              {whatsappConfigured ? "Connected" : "Not Configured"}
            </Badge>
          </div>
          <div className={`flex items-center justify-between p-3 rounded-lg border ${
            smsConfigured ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
          }`}>
            <div className="flex items-center gap-2">
              <Phone className={`w-5 h-5 ${smsConfigured ? "text-green-600" : "text-amber-600"}`} />
              <div>
                <span className={`text-sm font-medium ${smsConfigured ? "text-green-800" : "text-amber-800"}`}>
                  SMS (Africa&apos;s Talking)
                </span>
              </div>
            </div>
            <Badge className={smsConfigured ? "bg-green-600" : "bg-amber-600"}>
              {smsConfigured ? "Active" : "Not Configured"}
            </Badge>
          </div>
          {!smsConfigured && !whatsappConfigured && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              Configure AT_API_KEY for SMS or WHATSAPP_TOKEN for WhatsApp in your environment variables.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
