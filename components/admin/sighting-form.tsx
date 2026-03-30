"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  MapPin,
  Camera,
  Loader2
} from "lucide-react";

const animals = [
  { value: "lion", label: "Lion", icon: "🦁" },
  { value: "elephant", label: "Elephant", icon: "🐘" },
  { value: "leopard", label: "Leopard", icon: "🐆" },
  { value: "rhino", label: "Rhino", icon: "🦏" },
  { value: "buffalo", label: "Buffalo", icon: "🐃" },
  { value: "cheetah", label: "Cheetah", icon: "🐆" },
  { value: "wildebeest", label: "Wildebeest", icon: "🦬" },
  { value: "zebra", label: "Zebra", icon: "🦓" },
  { value: "giraffe", label: "Giraffe", icon: "🦒" },
  { value: "hippo", label: "Hippo", icon: "🦛" },
  { value: "crocodile", label: "Crocodile", icon: "🐊" },
  { value: "hyena", label: "Hyena", icon: "🐕" },
  { value: "other", label: "Other", icon: "🐾" },
];

const locations = [
  "Paradise Plains",
  "Mara River Crossing",
  "Fig Tree Ridge",
  "Open Savannah",
  "Musiara Marsh",
  "Hippo Pool",
  "Rhino Valley",
  "Northern Border",
  "Near Camp",
  "Other",
];

const guides = [
  { id: "david", name: "David Kimani" },
  { id: "peter", name: "Peter Mutua" },
  { id: "grace", name: "Grace Akinyi" },
  { id: "james", name: "James Ochieng" },
];

export function SightingForm() {
  const [submitting, setSubmitting] = useState(false);
  const [animal, setAnimal] = useState("");
  const [count, setCount] = useState("");
  const [location, setLocation] = useState("");
  const [guide, setGuide] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setAnimal("");
      setCount("");
      setLocation("");
      setGuide("");
      setNotes("");
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Log New Sighting</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Animal Selection */}
        <div className="space-y-2">
          <Label>Animal</Label>
          <Select value={animal} onValueChange={setAnimal}>
            <SelectTrigger>
              <SelectValue placeholder="Select animal" />
            </SelectTrigger>
            <SelectContent>
              {animals.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  <span className="flex items-center gap-2">
                    <span>{a.icon}</span>
                    {a.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Count */}
        <div className="space-y-2">
          <Label>Number Spotted</Label>
          <Input 
            type="number" 
            placeholder="e.g. 5"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label>Location</Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc.toLowerCase().replace(/\s+/g, "-")}>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    {loc}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Guide */}
        <div className="space-y-2">
          <Label>Spotted By</Label>
          <Select value={guide} onValueChange={setGuide}>
            <SelectTrigger>
              <SelectValue placeholder="Select guide" />
            </SelectTrigger>
            <SelectContent>
              {guides.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea 
            placeholder="Describe the sighting..."
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="resize-none"
          />
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
          <Label>Photo (Optional)</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-secondary/30 transition-colors cursor-pointer">
            <Camera className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Click to upload photo</p>
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          disabled={!animal || !count || !location || !guide || submitting}
          className="w-full"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Log Sighting
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
