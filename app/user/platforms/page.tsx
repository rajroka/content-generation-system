"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";
import { Instagram, Facebook, Twitter, Youtube, Link2, Unlink, Loader2, CheckCircle2, Linkedin } from "lucide-react";

interface ConnectedAccount {
  platform: string;
  accountName: string | null;
  isActive: boolean;
  connectedAt: string;
}

const platforms = [
  { id: "instagram", name: "Instagram", icon: Instagram, authUrl: "/api/auth/instagram", color: "text-pink-600" },
  { id: "facebook",  name: "Facebook",  icon: Facebook,  authUrl: "/api/auth/facebook",  color: "text-blue-600" },
  { id: "twitter",   name: "Twitter/X", icon: Twitter,   authUrl: "/api/auth/twitter",   color: "text-blue-400" },
  { id: "linkedin",  name: "LinkedIn",  icon: Linkedin,  authUrl: "/api/auth/linkedin",  color: "text-blue-700" },
  { id: "youtube",   name: "YouTube",   icon: Youtube,   authUrl: "/api/auth/youtube",   color: "text-red-600"  },
];

export default function ConnectionsPage() {
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading]       = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => { fetchConnections(); }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/social/connections");
      if (response.ok) {
        const data = await response.json();
        setConnectedAccounts(Array.isArray(data) ? data : []);
      }
    } catch {
      console.error("Failed to fetch connections");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (platformId: string, platformName: string, authUrl: string) => {
    setConnecting(platformId);
    const width = 600, height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top  = window.screen.height / 2 - height / 2;
    const popup = window.open(authUrl, `Connect ${platformName}`, `width=${width},height=${height},left=${left},top=${top}`);

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
    
    // Fallback if popup blocker or user closes window
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        if (connecting === platformId) {
          setConnecting(null);
        }
      }
    }, 1000);
  };

  const handleDisconnect = async (platform: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platform}?`)) return;
    try {
      const res = await fetch("/api/social/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platform.toUpperCase() }),
      });
      if (res.ok) { 
        toast.success("Disconnected successfully"); 
        fetchConnections(); 
      }
    } catch { 
      toast.error("Failed to disconnect"); 
    }
  };

  const getConnectedAccount = (platformId: string) =>
    connectedAccounts.find((acc) => acc.platform === platformId.toUpperCase());

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 min-h-screen">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen">
      <header className="mb-8">
        <h1 className="text-xl font-bold text-foreground">Connections</h1>
        <p className="text-[12px] text-muted-foreground mt-1">Manage your linked social media accounts to publish directly.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => {
          const connected   = getConnectedAccount(platform.id);
          const Icon        = platform.icon;
          const isConnecting = connecting === platform.id;

          return (
            <Card key={platform.id} className="border-none shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${platform.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm">{platform.name}</h3>
                      {connected ? (
                        <p className="text-[11px] text-[#0d7c8a] flex items-center gap-1 font-medium mt-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Connected as {connected.accountName || "User"}
                        </p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground mt-0.5">Not connected</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                  {connected ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-foreground">Auto-Publishing</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Allow system to post on your behalf</p>
                        </div>
                        <Switch id={`active-${platform.id}`} checked={connected.isActive} className="data-[state=checked]:bg-[#0d7c8a]" />
                      </div>
                      <div className="h-px bg-border" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 text-xs font-bold w-full"
                        onClick={() => handleDisconnect(platform.id)}
                      >
                        <Unlink className="w-3 h-3 mr-2" /> Disconnect {platform.name}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleConnect(platform.id, platform.name, platform.authUrl)}
                      disabled={isConnecting}
                      className="w-full bg-foreground hover:bg-foreground/80 text-background font-bold text-xs h-9"
                    >
                      {isConnecting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Link2 className="w-3 h-3 mr-2" /> Connect {platform.name}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}