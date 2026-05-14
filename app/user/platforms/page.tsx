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
  const [toggling, setToggling]     = useState<string | null>(null);

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

  const handleToggleActive = async (platformId: string, currentActive: boolean) => {
    setToggling(platformId);
    try {
      const res = await fetch("/api/social/toggle-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platformId.toUpperCase(), isActive: !currentActive }),
      });

      if (!res.ok) {
        toast.error("Failed to update setting");
        setToggling(null);
        return;
      }

      toast.success(`Auto-publishing ${!currentActive ? "enabled" : "disabled"}`);
      setToggling(null);
      await fetchConnections();
    } catch {
      toast.error("Network error — please try again");
      setToggling(null);
    }
  };

  const handleConnect = (platformId: string, platformName: string, authUrl: string) => {
    setConnecting(platformId);
    const width = 600, height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top  = window.screen.height / 2 - height / 2;
    const popup = window.open(authUrl, `Connect ${platformName}`, `width=${width},height=${height},left=${left},top=${top}`);

    // Listen for postMessage from the callback page (works when opener is preserved)
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SOCIAL_CONNECT_ERROR") {
        toast.error(event.data.error || `Failed to connect ${platformName}`);
        setConnecting(null);
        clearInterval(poll);
        window.removeEventListener("message", handleMessage);
      }
    };
    window.addEventListener("message", handleMessage);

    // Poll until the popup closes, then refresh connections.
    // Zernio's multi-hop OAuth redirect clears window.opener in most browsers,
    // so we can't rely solely on postMessage — polling is the reliable fallback.
    const poll = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(poll);
        window.removeEventListener("message", handleMessage);

        // Snapshot whether this platform was connected BEFORE the OAuth flow
        const wasConnectedBefore = connectedAccounts.some(
          (a) => a.platform === platformId.toUpperCase()
        );

        // Retry fetching connections up to 5 times with 1s gaps.
        // The callback DB write may still be in-flight when the popup closes.
        let attempts = 0;
        const retry = setInterval(async () => {
          attempts++;
          try {
            const res = await fetch("/api/social/connections");
            if (res.ok) {
              const data: ConnectedAccount[] = await res.json();
              const nowConnected = data.some(
                (a) => a.platform === platformId.toUpperCase()
              );

              if (nowConnected || attempts >= 5) {
                clearInterval(retry);
                setConnecting(null);
                setConnectedAccounts(Array.isArray(data) ? data : []);
                if (!wasConnectedBefore && nowConnected) {
                  toast.success(`${platformName} connected successfully`);
                }
              }
            } else if (attempts >= 5) {
              clearInterval(retry);
              setConnecting(null);
            }
          } catch {
            if (attempts >= 5) {
              clearInterval(retry);
              setConnecting(null);
            }
          }
        }, 1000);
      }
    }, 800);
  };

  const handleDisconnect = async (platformId: string, platformName: string) => {
    if (!confirm(`Disconnect ${platformName}?`)) return;
    const disconnectToast = toast.loading(`Disconnecting ${platformName}...`);
    try {
      const res = await fetch("/api/social/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platformId }),
      });
      const data = await res.json();
      toast.dismiss(disconnectToast);
      if (!res.ok) {
        toast.error(data.error || "Failed to disconnect");
        return;
      }
      toast.success(`${platformName} disconnected`);
      await fetchConnections();
    } catch {
      toast.dismiss(disconnectToast);
      toast.error("Network error — please try again");
    }
  };

  const getConnectedAccount = (platformId: string) =>
    connectedAccounts.find((acc) => acc.platform === platformId.toUpperCase());

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-36 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Connections</h1>
        <p className="text-xs text-muted-foreground mt-1">Manage your linked social media accounts to publish directly.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {platforms.map((platform) => {
          const connected   = getConnectedAccount(platform.id);
          const Icon        = platform.icon;
          const isConnecting = connecting === platform.id;

          return (
            <Card key={platform.id} className="border-none shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className={`w-4 h-4 ${platform.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm">{platform.name}</h3>
                      {connected ? (
                        <p className="text-[11px] text-[#0d7c8a] flex items-center gap-1 font-medium mt-0.5">
                          <CheckCircle2 className="w-3 h-3" /> {connected.accountName || "Connected"}
                        </p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground mt-0.5">Not connected</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-3">
                  {connected ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-foreground">Auto-Publishing</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Allow system to post on your behalf</p>
                        </div>
                        <Switch 
                          id={`active-${platform.id}`} 
                          checked={connected.isActive}
                          disabled={toggling === platform.id}
                          onCheckedChange={() => handleToggleActive(platform.id, connected.isActive)}
                          className="data-[state=checked]:bg-[#0d7c8a]"
                        />
                      </div>
                      <div className="h-px bg-border" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 text-xs font-bold w-full h-8"
                        onClick={() => handleDisconnect(platform.id, platform.name)}
                      >
                        <Unlink className="w-3 h-3 mr-2" /> Disconnect
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