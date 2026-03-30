"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  UtensilsCrossed,
  AlertTriangle,
  Heart,
  Gift,
  Plus,
  Search,
  Edit,
  Cake,
  Loader2,
  Leaf,
  X,
} from "lucide-react";

interface GuestPreference {
  id: string;
  name: string | null;
  email: string;
  dietary: string[];
  allergies: string[];
  specialOccasion: string | null;
  preferences: string | null;
  roomPreference: string | null;
  preferencesRecord: any;
}

const dietaryOptions = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Halal",
  "Kosher",
  "No Pork",
  "No Beef",
  "Pescatarian",
  "Keto",
  "Low Sodium",
];

const commonAllergies = [
  "Nuts",
  "Peanuts",
  "Shellfish",
  "Fish",
  "Dairy",
  "Eggs",
  "Soy",
  "Wheat",
  "Sesame",
  "Sulfites",
  "Penicillin",
];

const occasionTypes = [
  "Birthday",
  "Anniversary",
  "Honeymoon",
  "Engagement",
  "Graduation",
  "Retirement",
  "Family Reunion",
  "Other",
];

export function GuestPreferences() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState("");
  const [guests, setGuests] = useState<GuestPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    specialOccasion: "",
    occasionDate: "",
    roomPreference: "",
    notes: "",
    notifyKitchen: true,
    notifyHousekeeping: true,
    notifyGuide: false,
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  async function fetchPreferences() {
    try {
      setLoading(true);
      const url = searchQuery
        ? `/api/admin/guests/preferences?search=${encodeURIComponent(searchQuery)}`
        : "/api/admin/guests/preferences";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch preferences");
      const data = await response.json();
      setGuests(data.data?.guests || []);
    } catch (err) {
      console.error("Preferences fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPreferences();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const filteredGuests = guests.filter((guest) =>
    guest.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleDietary = (item: string) => {
    setSelectedDietary((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleAllergy = (item: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSave = async () => {
    if (!selectedGuestId) return;

    try {
      setSaving(true);
      setError(null);

      const preferences = {
        dietary: selectedDietary,
        allergies: selectedAllergies,
        specialOccasion: formData.specialOccasion || null,
        occasionDate: formData.occasionDate || null,
        roomPreference: formData.roomPreference || null,
        notifyKitchen: formData.notifyKitchen,
        notifyHousekeeping: formData.notifyHousekeeping,
        notifyGuide: formData.notifyGuide,
      };

      const response = await fetch("/api/admin/guests/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedGuestId,
          preferences,
          notes: formData.notes || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to save preferences");
      }

      setIsDialogOpen(false);
      fetchPreferences();
      // Reset form
      setSelectedGuestId("");
      setSelectedDietary([]);
      setSelectedAllergies([]);
      setFormData({
        specialOccasion: "",
        occasionDate: "",
        roomPreference: "",
        notes: "",
        notifyKitchen: true,
        notifyHousekeeping: true,
        notifyGuide: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-serif">Dietary & Special Requirements</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage guest allergies, dietary preferences, and special occasions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search guests..."
                className="pl-9 w-48 bg-secondary border-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Requirements
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-serif">Add Guest Requirements</DialogTitle>
                </DialogHeader>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label>Select Guest</Label>
                    <Select
                      value={selectedGuestId}
                      onValueChange={setSelectedGuestId}
                      disabled={saving}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a guest" />
                      </SelectTrigger>
                      <SelectContent>
                        {guests.map((guest) => (
                          <SelectItem key={guest.id} value={guest.id}>
                            {guest.name || guest.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      Dietary Requirements
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {dietaryOptions.map((item) => (
                        <Badge
                          key={item}
                          variant={selectedDietary.includes(item) ? "default" : "outline"}
                          className="cursor-pointer transition-colors"
                          onClick={() => toggleDietary(item)}
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Allergies (Critical)
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {commonAllergies.map((item) => (
                        <Badge
                          key={item}
                          variant={selectedAllergies.includes(item) ? "destructive" : "outline"}
                          className="cursor-pointer transition-colors"
                          onClick={() => toggleAllergy(item)}
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-primary" />
                        Special Occasion
                      </Label>
                      <Select
                        value={formData.specialOccasion}
                        onValueChange={(value) => setFormData({ ...formData, specialOccasion: value })}
                        disabled={saving}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select occasion" />
                        </SelectTrigger>
                        <SelectContent>
                          {occasionTypes.map((type) => (
                            <SelectItem key={type} value={type.toLowerCase()}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Occasion Date</Label>
                      <Input
                        type="date"
                        value={formData.occasionDate}
                        onChange={(e) => setFormData({ ...formData, occasionDate: e.target.value })}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Room/Tent Preference</Label>
                    <Select
                      value={formData.roomPreference}
                      onValueChange={(value) => setFormData({ ...formData, roomPreference: value })}
                      disabled={saving}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred tent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">No Preference</SelectItem>
                        <SelectItem value="ndovu">Ndovu Tent (Elephant)</SelectItem>
                        <SelectItem value="chui">Chui Tent (Leopard)</SelectItem>
                        <SelectItem value="kifaru">Kifaru Tent (Rhino)</SelectItem>
                        <SelectItem value="simba">Simba Tent (Lion)</SelectItem>
                        <SelectItem value="twiga">Twiga Tent (Giraffe)</SelectItem>
                        <SelectItem value="kiboko">Kiboko Tent (Hippo)</SelectItem>
                        <SelectItem value="nyati">Nyati Tent (Buffalo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Additional Notes & Preferences</Label>
                    <Textarea
                      placeholder="Any other preferences, medical conditions, or special requests..."
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Notification Preferences</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="notify-kitchen"
                          checked={formData.notifyKitchen}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, notifyKitchen: checked as boolean })
                          }
                          disabled={saving}
                        />
                        <label htmlFor="notify-kitchen" className="text-sm">
                          Notify kitchen staff of dietary requirements
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="notify-housekeeping"
                          checked={formData.notifyHousekeeping}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, notifyHousekeeping: checked as boolean })
                          }
                          disabled={saving}
                        />
                        <label htmlFor="notify-housekeeping" className="text-sm">
                          Notify housekeeping of special occasions
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="notify-guide"
                          checked={formData.notifyGuide}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, notifyGuide: checked as boolean })
                          }
                          disabled={saving}
                        />
                        <label htmlFor="notify-guide" className="text-sm">
                          Notify guide of mobility or health concerns
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-primary text-primary-foreground"
                      onClick={handleSave}
                      disabled={saving || !selectedGuestId}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Requirements"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? "No guests found matching your search" : "No guest preferences found"}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredGuests.map((guest) => (
              <div
                key={guest.id}
                className="p-4 rounded-xl bg-secondary/50 border border-border/50"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        {guest.name
                          ? guest.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : "GU"}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{guest.name || guest.email}</h3>
                        <p className="text-sm text-muted-foreground">
                          Preferred: {guest.roomPreference || "No preference"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        {guest.dietary.length > 0 && (
                          <div className="flex items-center gap-2">
                            <UtensilsCrossed className="w-4 h-4 text-green-600" />
                            <div className="flex gap-1">
                              {guest.dietary.map((d) => (
                                <Badge
                                  key={d}
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200"
                                >
                                  {d}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {guest.allergies.length > 0 && (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <div className="flex gap-1">
                              {guest.allergies.map((a) => (
                                <Badge key={a} variant="destructive">
                                  {a}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {guest.specialOccasion && (
                          <div className="flex items-center gap-2">
                            {guest.specialOccasion.includes("birthday") ? (
                              <Cake className="w-4 h-4 text-pink-500" />
                            ) : guest.specialOccasion.includes("anniversary") ? (
                              <Heart className="w-4 h-4 text-red-500" />
                            ) : (
                              <Gift className="w-4 h-4 text-primary" />
                            )}
                            <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                              {guest.specialOccasion}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {guest.preferences && (
                        <p className="text-sm text-muted-foreground">{guest.preferences}</p>
                      )}
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="flex-shrink-0 bg-transparent">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
