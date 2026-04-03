"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  CheckCircle2,
  Link2,
  Unlink,
  Loader2,
} from "lucide-react";

interface ConnectedAccount {
  platform: string;
  accountName: string | null;
  isActive: boolean;
  connectedAt: string;
}

const platforms = [
  { id: "instagram", name: "Instagram", icon: Instagram, authUrl: "/api/auth/instagram" },
  { id: "facebook", name: "Facebook", icon: Facebook, authUrl: "/api/auth/facebook" },
  { id: "twitter", name: "Twitter/X", icon: Twitter, authUrl: "/api/auth/twitter" },
  { id: "youtube", name: "YouTube", icon: Youtube, authUrl: "/api/auth/youtube" },
];

export default function ConnectionsPage() {
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/social/connections");
      const data = await response.json();
      setConnectedAccounts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platformId: string, platformName: string, authUrl: string) => {
    setConnecting(platformId);
    
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      authUrl,
      `Connect ${platformName}`,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "SOCIAL_CONNECTED") {
        toast.success(`Connected ${platformName}`);
        fetchConnections();
        setConnecting(null);
        popup?.close();
      } else if (event.data.type === "SOCIAL_CONNECT_ERROR") {
        toast.error(`Error: ${event.data.error}`);
        setConnecting(null);
        popup?.close();
      }
    };

    window.addEventListener("message", handleMessage, { once: true });
  };

  const handleDisconnect = async (platform: string) => {
    if (!confirm(`Disconnect ${platform}?`)) return;
    try {
      const res = await fetch("/api/social/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platform.toUpperCase() }),
      });
      if (res.ok) {
        toast.success("Disconnected");
        fetchConnections();
      }
    } catch (error) {
      toast.error("Failed to disconnect");
    }
  };

  const getConnectedAccount = (platformId: string) => {
    return connectedAccounts.find(acc => acc.platform === platformId.toUpperCase());
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-muted/50 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Connections</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Manage your linked social accounts.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => {
          const connected = getConnectedAccount(platform.id);
          const Icon = platform.icon;
          const isConnecting = connecting === platform.id;

          return (
            <Card key={platform.id} className="border border-border bg-card shadow-none hover:border-primary/30 transition-colors">
              <CardHeader className="flex flex-row items-center space-y-0 gap-4">
                <div className="p-3 bg-secondary rounded-lg">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{platform.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {connected ? connected.accountName : "Disconnected"}
                  </CardDescription>
                </div>
                {connected && (
                  <Badge variant={connected.isActive ? "default" : "outline"} className="rounded-full px-3">
                    {connected.isActive ? "Active" : "Paused"}
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="pt-2">
                {connected ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md border border-border/50">
                      <Label htmlFor={`active-${platform.id}`} className="text-sm font-medium cursor-pointer">
                        Sync status
                      </Label>
                      <Switch
                        id={`active-${platform.id}`}
                        checked={connected.isActive}
                        onCheckedChange={() => {/* existing logic */}}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive w-fit ml-auto"
                      onClick={() => handleDisconnect(platform.id)}
                    >
                      <Unlink className="w-3 h-3 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleConnect(platform.id, platform.name, platform.authUrl)}
                    disabled={isConnecting}
                    className="w-full bg-foreground text-background hover:bg-foreground/90"
                  >
                    {isConnecting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Link2 className="w-4 h-4 mr-2" />
                        Link {platform.name}
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}