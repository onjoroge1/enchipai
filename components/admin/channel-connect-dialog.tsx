"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

interface ChannelConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelName: string;
  channelType: string;
  onSuccess: (apiKey: string, apiSecret?: string, webhookUrl?: string) => void;
}

export function ChannelConnectDialog({
  open,
  onOpenChange,
  channelName,
  channelType,
  onSuccess,
}: ChannelConnectDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!apiKey.trim()) {
      setError("API Key is required");
      return;
    }

    setLoading(true);
    try {
      // Validate credentials (in a real app, this would test the connection)
      // For now, we just require the API key to be provided
      if (apiKey.length < 10) {
        throw new Error("API Key appears to be invalid (too short)");
      }

      onSuccess(apiKey, apiSecret || undefined, webhookUrl || undefined);
      onOpenChange(false);
      // Reset form
      setApiKey("");
      setApiSecret("");
      setWebhookUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to validate credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Connect {channelName}</DialogTitle>
          <DialogDescription>
            Enter your API credentials to connect {channelName}. These credentials will be securely stored.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key *</Label>
            <Input
              id="apiKey"
              type="text"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Your API key from {channelName}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiSecret">API Secret</Label>
            <Input
              id="apiSecret"
              type="password"
              placeholder="Enter your API secret (if required)"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Optional: API secret for additional security
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              type="url"
              placeholder="https://your-domain.com/webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Optional: Webhook URL for receiving real-time updates
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setError(null);
                setApiKey("");
                setApiSecret("");
                setWebhookUrl("");
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !apiKey.trim()}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

