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
  Mail,
  CreditCard,
  Calendar,
  Star,
  Bell,
  Gift,
  Users,
  Pencil,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";
import Image from "next/image";

type Template = {
  id: number;
  name: string;
  subject: string;
  category: string;
  icon: React.ElementType;
  status: "active" | "draft";
  lastEdited: string;
  content: string;
};

const defaultTemplates: Template[] = [
  {
    id: 1,
    name: "Welcome Email",
    subject: "Welcome to Enchipai Mara Camp - Your Safari Awaits!",
    category: "onboarding",
    icon: Mail,
    status: "active",
    lastEdited: "2 days ago",
    content: `Dear {{guest_name}},

Welcome to Enchipai Mara Camp! We are thrilled to have you join our family of adventurers.

Your upcoming stay promises to be an unforgettable journey into the heart of the Masai Mara. From the moment you arrive, you'll be immersed in the beauty of the African wilderness.

What to expect:
- Luxury tented accommodation under the stars
- Daily game drives with expert Maasai guides
- Authentic bush dining experiences
- Wildlife viewing from your private verandah

If you have any questions before your arrival, please don't hesitate to reach out.

Warm regards,
The Enchipai Team`,
  },
  {
    id: 2,
    name: "Booking Confirmation",
    subject: "Your Booking is Confirmed - Enchipai Mara Camp",
    category: "booking",
    icon: Calendar,
    status: "active",
    lastEdited: "1 week ago",
    content: `Dear {{guest_name}},

Great news! Your booking at Enchipai Mara Camp has been confirmed.

Booking Details:
- Check-in: {{check_in_date}}
- Check-out: {{check_out_date}}
- Tent: {{tent_name}}
- Guests: {{guest_count}}
- Total: {{total_amount}}

We look forward to welcoming you to our camp!

Best regards,
The Enchipai Team`,
  },
  {
    id: 3,
    name: "Payment Receipt",
    subject: "Payment Received - Thank You!",
    category: "payment",
    icon: CreditCard,
    status: "active",
    lastEdited: "3 days ago",
    content: `Dear {{guest_name}},

Thank you for your payment. This email confirms that we have received your payment.

Payment Details:
- Amount: {{payment_amount}}
- Date: {{payment_date}}
- Reference: {{payment_reference}}
- Booking: {{booking_reference}}

A detailed invoice is attached to this email.

Thank you for choosing Enchipai Mara Camp.

Warm regards,
The Enchipai Team`,
  },
  {
    id: 4,
    name: "Pre-Arrival Information",
    subject: "Getting Ready for Your Safari Adventure",
    category: "onboarding",
    icon: Bell,
    status: "active",
    lastEdited: "5 days ago",
    content: `Dear {{guest_name}},

Your adventure at Enchipai Mara Camp is just {{days_until_arrival}} days away!

Here's what you need to know:

Arrival Instructions:
- Airstrip pickup available from Keekorok or Mara North
- Road transfers can be arranged from Nairobi (approx. 5 hours)

What to Pack:
- Neutral-colored clothing (khaki, green, brown)
- Comfortable walking shoes
- Sunscreen and hat
- Binoculars and camera
- Light jacket for evening game drives

We can't wait to welcome you!

Safari greetings,
The Enchipai Team`,
  },
  {
    id: 5,
    name: "Post-Stay Thank You",
    subject: "Thank You for Staying with Us!",
    category: "feedback",
    icon: Star,
    status: "active",
    lastEdited: "1 day ago",
    content: `Dear {{guest_name}},

Thank you for choosing Enchipai Mara Camp for your safari adventure!

We hope your stay exceeded all expectations and that you created memories that will last a lifetime.

We would love to hear about your experience. Please take a moment to share your feedback:
{{review_link}}

We hope to welcome you back soon!

Warm regards,
The Enchipai Team`,
  },
  {
    id: 6,
    name: "Special Offer",
    subject: "Exclusive Offer Just for You - Return to the Mara",
    category: "marketing",
    icon: Gift,
    status: "active",
    lastEdited: "4 days ago",
    content: `Dear {{guest_name}},

As a valued member of the Enchipai family, we're excited to offer you an exclusive return guest discount!

Special Offer: 15% off your next stay
Valid until: {{offer_expiry}}
Promo Code: RETURN15

Whether you want to witness the Great Migration or simply escape to the tranquility of the bush, we'd love to welcome you back.

Book now and relive the magic!

Safari greetings,
The Enchipai Team`,
  },
  {
    id: 7,
    name: "Group Booking Inquiry",
    subject: "Your Group Safari Inquiry - Enchipai Mara Camp",
    category: "booking",
    icon: Users,
    status: "draft",
    lastEdited: "1 week ago",
    content: `Dear {{guest_name}},

Thank you for your interest in hosting your group at Enchipai Mara Camp!

We specialize in creating unforgettable experiences for groups, whether it's a family reunion, corporate retreat, or celebration.

Our 5 luxury tents can accommodate up to 10 guests, and we offer:
- Exclusive camp buyouts
- Customized itineraries
- Private dining experiences
- Special activities and excursions

Please let us know your preferred dates and group size, and we'll prepare a tailored proposal.

Best regards,
The Enchipai Team`,
  },
  {
    id: 8,
    name: "Payment Reminder",
    subject: "Friendly Reminder: Payment Due",
    category: "payment",
    icon: CreditCard,
    status: "active",
    lastEdited: "2 weeks ago",
    content: `Dear {{guest_name}},

This is a friendly reminder that your payment for booking {{booking_reference}} is due.

Payment Details:
- Amount Due: {{amount_due}}
- Due Date: {{due_date}}
- Booking: {{booking_reference}}

Please complete your payment to secure your reservation.

If you have any questions or need assistance, please don't hesitate to contact us.

Best regards,
The Enchipai Team`,
  },
];

export function EmailTemplates() {
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    category: "custom",
    content: "",
  });
  const [editedContent, setEditedContent] = useState("");

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setIsEditing(false);
  };

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    setEditedContent(template.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (selectedTemplate) {
      setTemplates(templates.map(t => 
        t.id === selectedTemplate.id 
          ? { ...t, content: editedContent, lastEdited: "Just now" }
          : t
      ));
      setSelectedTemplate({ ...selectedTemplate, content: editedContent });
      setIsEditing(false);
    }
  };

  const handleCreateTemplate = () => {
    const newId = Math.max(...templates.map(t => t.id)) + 1;
    const template: Template = {
      id: newId,
      name: newTemplate.name,
      subject: newTemplate.subject,
      category: newTemplate.category,
      icon: Mail,
      status: "draft",
      lastEdited: "Just now",
      content: newTemplate.content,
    };
    setTemplates([...templates, template]);
    setIsCreating(false);
    setNewTemplate({ name: "", subject: "", category: "custom", content: "" });
  };

  const handleDeleteTemplate = (id: number) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const categoryColors: Record<string, string> = {
    onboarding: "bg-blue-100 text-blue-700",
    booking: "bg-green-100 text-green-700",
    payment: "bg-amber-100 text-amber-700",
    feedback: "bg-purple-100 text-purple-700",
    marketing: "bg-pink-100 text-pink-700",
    custom: "bg-gray-100 text-gray-700",
  };

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Email Templates</CardTitle>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="e.g., Anniversary Greeting"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newTemplate.category}
                    onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="booking">Booking</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email Subject</Label>
                <Input
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                  placeholder="e.g., Happy Anniversary from Enchipai!"
                />
              </div>
              <div className="space-y-2">
                <Label>Email Content</Label>
                <Textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  placeholder="Write your email content here... Use {{variable_name}} for dynamic content."
                  rows={10}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <template.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-foreground">{template.name}</p>
                    <Badge variant="secondary" className={`text-xs ${categoryColors[template.category]}`}>
                      {template.category}
                    </Badge>
                    {template.status === "draft" && (
                      <Badge variant="outline" className="text-xs">
                        Draft
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Edited {template.lastEdited}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePreview(template)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {isEditing ? "Edit Template" : "Preview Template"}
                      </DialogTitle>
                    </DialogHeader>
                    {selectedTemplate && (
                      <div className="mt-4">
                        <div className="bg-secondary/50 rounded-lg p-6 border border-border">
                          <div className="flex justify-center mb-6">
                            <Image
                              src="/images/enchipai-logo.webp"
                              alt="Enchipai Mara Camp"
                              width={150}
                              height={80}
                              className="object-contain"
                            />
                          </div>
                          <div className="bg-background rounded-lg p-6 shadow-sm">
                            <p className="text-xs text-muted-foreground mb-1">Subject:</p>
                            <p className="font-medium text-foreground mb-4">{selectedTemplate.subject}</p>
                            <div className="border-t border-border pt-4">
                              {isEditing ? (
                                <Textarea
                                  value={editedContent}
                                  onChange={(e) => setEditedContent(e.target.value)}
                                  rows={15}
                                  className="font-mono text-sm"
                                />
                              ) : (
                                <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                                  {selectedTemplate.content}
                                </pre>
                              )}
                            </div>
                          </div>
                          <div className="mt-6 text-center text-xs text-muted-foreground">
                            <p>Enchipai Mara Camp</p>
                            <p>Esoit Oloololo Escarpment, Masai Mara, Kenya</p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          {isEditing ? (
                            <>
                              <Button variant="outline" onClick={() => setIsEditing(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleSaveEdit}>
                                Save Changes
                              </Button>
                            </>
                          ) : (
                            <Button onClick={() => {
                              setEditedContent(selectedTemplate.content);
                              setIsEditing(true);
                            }}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit Template
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(template)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
