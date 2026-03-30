"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowUp, ArrowDown, Save } from "lucide-react";

interface Tent {
  id: string;
  name: string;
  featured: boolean;
  displayOrder: number;
}

export function TentDisplayControl() {
  const [tents, setTents] = useState<Tent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchTents();
  }, []);

  async function fetchTents() {
    try {
      const response = await fetch("/api/admin/tents");
      if (!response.ok) throw new Error("Failed to fetch tents");
      const data = await response.json();
      const sortedTents = (data.data || []).sort((a: Tent, b: Tent) => a.displayOrder - b.displayOrder);
      setTents(sortedTents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tents");
    } finally {
      setLoading(false);
    }
  }

  const handleToggleFeatured = async (tentId: string, featured: boolean) => {
    try {
      const response = await fetch(`/api/admin/tents/${tentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured }),
      });

      if (!response.ok) throw new Error("Failed to update tent");
      fetchTents();
    } catch (err) {
      console.error("Toggle featured error:", err);
    }
  };

  const handleOrderChange = (tentId: string, newOrder: number) => {
    setTents((prev) =>
      prev.map((t) => (t.id === tentId ? { ...t, displayOrder: newOrder } : t))
    );
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updates = tents.map((tent, index) => ({
        id: tent.id,
        displayOrder: index,
      }));

      await Promise.all(
        updates.map((update) =>
          fetch(`/api/admin/tents/${update.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ displayOrder: update.displayOrder }),
          })
        )
      );

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save order");
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
        <CardTitle className="font-serif text-xl">Tent Display Control</CardTitle>
        <CardDescription>
          Control which tents appear on the homepage and their display order
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertDescription>Display order saved successfully!</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {tents.map((tent, index) => (
            <div
              key={tent.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleOrderChange(tent.id, Math.max(0, index - 1))}
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleOrderChange(tent.id, Math.min(tents.length - 1, index + 1))}
                    disabled={index === tents.length - 1}
                  >
                    <ArrowDown className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{tent.name}</span>
                    <span className="text-xs text-muted-foreground">Order: {tent.displayOrder}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`featured-${tent.id}`} className="text-sm">
                    Featured
                  </Label>
                  <Switch
                    id={`featured-${tent.id}`}
                    checked={tent.featured}
                    onCheckedChange={(checked) => handleToggleFeatured(tent.id, checked)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button onClick={handleSaveOrder} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Order
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

