"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Search, 
  Send, 
  Users, 
  CheckCircle2, 
  Filter,
  Mail,
  Calendar,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Guest = {
  id: number;
  name: string;
  email: string;
  country: string;
  status: "vip" | "returning" | "new";
  lastVisit: string;
  totalStays: number;
};

const guests: Guest[] = [
  { id: 1, name: "Sarah Johnson", email: "sarah.johnson@email.com", country: "United States", status: "vip", lastVisit: "Jan 2026", totalStays: 5 },
  { id: 2, name: "Michael Chen", email: "m.chen@email.com", country: "Singapore", status: "returning", lastVisit: "Dec 2025", totalStays: 2 },
  { id: 3, name: "Emma Williams", email: "emma.w@email.com", country: "United Kingdom", status: "vip", lastVisit: "Jan 2026", totalStays: 4 },
  { id: 4, name: "James Okonkwo", email: "james.o@email.com", country: "Nigeria", status: "new", lastVisit: "Jan 2026", totalStays: 1 },
  { id: 5, name: "Maria Garcia", email: "maria.garcia@email.com", country: "Spain", status: "returning", lastVisit: "Nov 2025", totalStays: 2 },
  { id: 6, name: "Hans Mueller", email: "h.mueller@email.com", country: "Germany", status: "vip", lastVisit: "Dec 2025", totalStays: 6 },
  { id: 7, name: "Aisha Patel", email: "aisha.p@email.com", country: "India", status: "new", lastVisit: "Jan 2026", totalStays: 1 },
  { id: 8, name: "Robert Smith", email: "r.smith@email.com", country: "Australia", status: "returning", lastVisit: "Oct 2025", totalStays: 3 },
  { id: 9, name: "Yuki Tanaka", email: "yuki.t@email.com", country: "Japan", status: "new", lastVisit: "Jan 2026", totalStays: 1 },
  { id: 10, name: "Pierre Dubois", email: "p.dubois@email.com", country: "France", status: "vip", lastVisit: "Dec 2025", totalStays: 4 },
  { id: 11, name: "Olga Petrova", email: "olga.p@email.com", country: "Russia", status: "returning", lastVisit: "Sep 2025", totalStays: 2 },
  { id: 12, name: "David Kim", email: "d.kim@email.com", country: "South Korea", status: "new", lastVisit: "Jan 2026", totalStays: 1 },
];

const templates = [
  { value: "welcome", label: "Welcome Email" },
  { value: "confirmation", label: "Booking Confirmation" },
  { value: "payment", label: "Payment Receipt" },
  { value: "pre-arrival", label: "Pre-Arrival Information" },
  { value: "thank-you", label: "Post-Stay Thank You" },
  { value: "special-offer", label: "Special Offer" },
  { value: "group", label: "Group Booking Inquiry" },
  { value: "reminder", label: "Payment Reminder" },
  { value: "custom", label: "Custom Email" },
];

export function EmailCampaign() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuests, setSelectedGuests] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [customSubject, setCustomSubject] = useState("");
  const [customContent, setCustomContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch = 
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || guest.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedGuests.length === filteredGuests.length) {
      setSelectedGuests([]);
    } else {
      setSelectedGuests(filteredGuests.map((g) => g.id));
    }
  };

  const handleSelectGuest = (id: number) => {
    if (selectedGuests.includes(id)) {
      setSelectedGuests(selectedGuests.filter((gId) => gId !== id));
    } else {
      setSelectedGuests([...selectedGuests, id]);
    }
  };

  const handleSendCampaign = async () => {
    setIsSending(true);
    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSending(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedGuests([]);
      setSelectedTemplate("");
      setCustomSubject("");
      setCustomContent("");
    }, 3000);
  };

  const statusColors: Record<string, string> = {
    vip: "bg-amber-100 text-amber-700",
    returning: "bg-blue-100 text-blue-700",
    new: "bg-green-100 text-green-700",
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <span>Send Campaign</span>
          {selectedGuests.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedGuests.length} selected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Selection */}
        <div className="space-y-2">
          <Label>Select Template</Label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an email template..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.value} value={template.value}>
                  {template.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Email Fields */}
        {selectedTemplate === "custom" && (
          <div className="space-y-3 p-4 bg-secondary/30 rounded-lg border border-border">
            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Enter email subject..."
              />
            </div>
            <div className="space-y-2">
              <Label>Email Content</Label>
              <Textarea
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Write your email content here... Use {{guest_name}} for personalization."
                rows={6}
              />
            </div>
          </div>
        )}

        {/* Guest Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Select Recipients</Label>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={handleSelectAll}
            >
              {selectedGuests.length === filteredGuests.length ? "Deselect All" : "Select All"}
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search guests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="returning">Returning</SelectItem>
                <SelectItem value="new">New</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Guest List */}
          <div className="border border-border rounded-lg divide-y divide-border max-h-[300px] overflow-y-auto">
            {filteredGuests.map((guest) => (
              <div
                key={guest.id}
                className={cn(
                  "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                  selectedGuests.includes(guest.id) ? "bg-primary/5" : "hover:bg-secondary/50"
                )}
                onClick={() => handleSelectGuest(guest.id)}
              >
                <Checkbox
                  checked={selectedGuests.includes(guest.id)}
                  onCheckedChange={() => handleSelectGuest(guest.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-foreground truncate">
                      {guest.name}
                    </p>
                    <Badge variant="secondary" className={`text-xs ${statusColors[guest.status]}`}>
                      {guest.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3" />
                      {guest.email}
                    </span>
                    <span className="flex items-center gap-1 hidden sm:flex">
                      <Globe className="w-3 h-3" />
                      {guest.country}
                    </span>
                    <span className="flex items-center gap-1 hidden md:flex">
                      <Calendar className="w-3 h-3" />
                      {guest.lastVisit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview and Send */}
        <div className="flex gap-2 pt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="flex-1 bg-transparent"
                disabled={!selectedTemplate || selectedGuests.length === 0}
              >
                <Mail className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Email Preview</DialogTitle>
              </DialogHeader>
              <div className="mt-4 bg-secondary/50 rounded-lg p-4 border border-border">
                <div className="flex justify-center mb-4">
                  <Image
                    src="/images/enchipai-logo.webp"
                    alt="Enchipai Mara Camp"
                    width={120}
                    height={60}
                    className="object-contain"
                  />
                </div>
                <div className="bg-background rounded-lg p-4 text-sm">
                  <p className="text-muted-foreground mb-2">
                    To: {selectedGuests.length} recipient(s)
                  </p>
                  <p className="font-medium mb-3">
                    Subject: {selectedTemplate === "custom" ? customSubject : templates.find(t => t.value === selectedTemplate)?.label}
                  </p>
                  <div className="border-t border-border pt-3">
                    {selectedTemplate === "custom" ? (
                      <p className="whitespace-pre-wrap">{customContent || "No content yet..."}</p>
                    ) : (
                      <p className="text-muted-foreground italic">
                        Template content will be loaded from the template library
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            className="flex-1"
            disabled={!selectedTemplate || selectedGuests.length === 0 || isSending}
            onClick={handleSendCampaign}
          >
            {showSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Sent Successfully!
              </>
            ) : isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send to {selectedGuests.length || 0}
              </>
            )}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
          <div className="text-center p-2">
            <p className="text-lg font-semibold text-foreground">{guests.filter(g => g.status === "vip").length}</p>
            <p className="text-xs text-muted-foreground">VIP Guests</p>
          </div>
          <div className="text-center p-2">
            <p className="text-lg font-semibold text-foreground">{guests.filter(g => g.status === "returning").length}</p>
            <p className="text-xs text-muted-foreground">Returning</p>
          </div>
          <div className="text-center p-2">
            <p className="text-lg font-semibold text-foreground">{guests.filter(g => g.status === "new").length}</p>
            <p className="text-xs text-muted-foreground">New Guests</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
