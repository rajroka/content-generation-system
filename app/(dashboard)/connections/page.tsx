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
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
    scope: "instagram_basic,instagram_content_publish",
    authUrl: "/api/auth/instagram",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-600",
    scope: "pages_manage_posts,pages_read_engagement",
    authUrl: "/api/auth/facebook",
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: Twitter,
    color: "bg-black",
    scope: "tweet.read,tweet.write,users.read,offline.access",
    authUrl: "/api/auth/twitter",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "bg-red-600",
    scope: "https://www.googleapis.com/auth/youtube.upload",
    authUrl: "/api/auth/youtube",
  },
];

export default function ConnectionsPage() {
  const { user } = useUser();
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
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setConnectedAccounts(data);
      } else {
        console.error("Expected array but got:", data);
        setConnectedAccounts([]);
      }
    } catch (error) {
      console.error("Failed to fetch connections:", error);
      setConnectedAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: string, authUrl: string) => {
    setConnecting(platform);
    
    // Open OAuth window
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      authUrl,
      `Connect ${platform}`,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Listen for message from popup
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "SOCIAL_CONNECTED") {
        toast.success(`Successfully connected ${platform}`);
        fetchConnections();
        popup?.close();
        window.removeEventListener("message", handleMessage);
      } else if (event.data.type === "SOCIAL_CONNECT_ERROR") {
        toast.error(`Failed to connect ${platform}: ${event.data.error}`);
        popup?.close();
        window.removeEventListener("message", handleMessage);
      }
    };

    window.addEventListener("message", handleMessage);
    
    // Check if popup was closed
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        setConnecting(null);
        window.removeEventListener("message", handleMessage);
      }
    }, 500);
  };

  const handleDisconnect = async (platform: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platform}?`)) return;

    try {
      const response = await fetch("/api/social/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platform.toUpperCase() }),
      });

      if (response.ok) {
        toast.success(`Disconnected ${platform}`);
        fetchConnections();
      } else {
        throw new Error("Failed to disconnect");
      }
    } catch (error) {
      toast.error("Failed to disconnect account");
    }
  };

  const handleToggleActive = async (platform: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/social/toggle-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platform.toUpperCase(), isActive }),
      });

      if (response.ok) {
        toast.success(`${platform} ${isActive ? "activated" : "deactivated"}`);
        fetchConnections();
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      toast.error("Failed to update connection");
    }
  };

  const getConnectedAccount = (platformId: string) => {
    // Ensure connectedAccounts is an array before calling find
    if (!Array.isArray(connectedAccounts)) {
      return null;
    }
    return connectedAccounts.find(acc => acc.platform === platformId.toUpperCase());
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Connected Accounts</h1>
        <p className="text-muted-foreground mt-1">
          Connect your social media accounts to post directly from BanamSathi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => {
          const connected = getConnectedAccount(platform.id);
          const Icon = platform.icon;
          const isConnecting = connecting === platform.id;

          return (
            <Card key={platform.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${platform.color}`} />
              
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`w-12 h-12 rounded-xl ${platform.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">{platform.name}</CardTitle>
                  <CardDescription>
                    {connected
                      ? `Connected as ${connected.accountName || platform.name}`
                      : "Not connected"}
                  </CardDescription>
                </div>
                {connected && (
                  <Badge variant={connected.isActive ? "default" : "secondary"}>
                    {connected.isActive ? "Active" : "Inactive"}
                  </Badge>
                )}
              </CardHeader>

              <CardContent>
                {connected ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-muted-foreground">Connected since</span>
                        <span className="font-medium">
                          {new Date(connected.connectedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`active-${platform.id}`} className="text-sm">
                          Auto-post enabled
                        </Label>
                        <Switch
                          id={`active-${platform.id}`}
                          checked={connected.isActive}
                          onCheckedChange={(checked) =>
                            handleToggleActive(platform.id, checked)
                          }
                        />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(platform.id)}
                      >
                        <Unlink className="w-4 h-4 mr-2" />
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleConnect(platform.name, platform.authUrl)}
                    disabled={isConnecting}
                    className="w-full"
                    variant="outline"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4 mr-2" />
                        Connect {platform.name}
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