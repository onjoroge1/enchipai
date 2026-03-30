"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save } from "lucide-react";

interface HeroSettings {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
}

export function HeroEditor() {
  const [settings, setSettings] = useState<HeroSettings>({
    title: "",
    subtitle: "",
    ctaText: "",
    ctaLink: "",
    backgroundImage: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch("/api/admin/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();
      if (data.data?.hero) {
        setSettings(data.data.hero);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hero: settings }),
      });

      if (!response.ok) throw new Error("Failed to save settings");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-xl">Hero Section Editor</CardTitle>
        <CardDescription>Edit the homepage hero section content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertDescription>Settings saved successfully!</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Hero Title</Label>
            <Input
              id="title"
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              placeholder="Welcome to Enchipai Mara Camp"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Hero Subtitle</Label>
            <Textarea
              id="subtitle"
              value={settings.subtitle}
              onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
              placeholder="Experience the magic of the Masai Mara"
              rows={3}
              disabled={saving}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ctaText">CTA Button Text</Label>
              <Input
                id="ctaText"
                value={settings.ctaText}
                onChange={(e) => setSettings({ ...settings, ctaText: e.target.value })}
                placeholder="Book Your Stay"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ctaLink">CTA Button Link</Label>
              <Input
                id="ctaLink"
                value={settings.ctaLink}
                onChange={(e) => setSettings({ ...settings, ctaLink: e.target.value })}
                placeholder="/tents"
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backgroundImage">Background Image URL</Label>
            <Input
              id="backgroundImage"
              type="url"
              value={settings.backgroundImage}
              onChange={(e) => setSettings({ ...settings, backgroundImage: e.target.value })}
              placeholder="/images/hero-bg.jpg"
              disabled={saving}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

