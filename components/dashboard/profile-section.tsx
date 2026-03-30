"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Edit2, Loader2, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt?: string;
}

export function ProfileSection() {
  const { data: session, update: updateSession } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/user/profile");
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        setProfile(data.data);
        setEditName(data.data?.name || "");
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const data = await response.json();
      setProfile(data.data);
      setEditing(false);
      setSaveMessage({ type: "success", text: "Profile updated successfully!" });

      // Update the session so the header reflects the new name
      await updateSession({ name: editName });

      setTimeout(() => setSaveMessage(null), 3000);
    } catch {
      setSaveMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditName(profile?.name || "");
    setSaveMessage(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const displayName = profile?.name || session?.user?.name || "User";
  const displayEmail = profile?.email || session?.user?.email || "";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-serif text-xl">Profile</CardTitle>
        {!editing ? (
          <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
            <Edit2 className="w-4 h-4" />
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={handleCancel} disabled={saving}>
              <X className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-primary" />}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {saveMessage && (
          <div
            className={`mb-4 px-3 py-2 rounded-lg text-sm ${
              saveMessage.type === "success"
                ? "bg-green-500/10 text-green-700 border border-green-200"
                : "bg-red-500/10 text-red-700 border border-red-200"
            }`}
          >
            {saveMessage.text}
          </div>
        )}

        <div className="flex flex-col items-center mb-6">
          {profile?.image ? (
            <img
              src={profile.image}
              alt={displayName}
              className="w-20 h-20 rounded-full object-cover mb-3"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-3">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
          )}

          {editing ? (
            <div className="w-full max-w-xs mt-2">
              <label htmlFor="edit-name" className="text-xs text-muted-foreground mb-1 block">
                Display Name
              </label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                className="text-center"
              />
            </div>
          ) : (
            <>
              <h3 className="font-semibold text-foreground">{displayName}</h3>
              <p className="text-sm text-muted-foreground capitalize">{profile?.role?.toLowerCase() || "Guest"}</p>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{displayEmail}</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">Member Since</h4>
          <p className="text-xs text-muted-foreground">
            {profile?.createdAt
              ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              : "Recently"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
