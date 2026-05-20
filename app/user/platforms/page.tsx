"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Instagram, Facebook, Youtube,
  Link2, Unlink, Loader2, CheckCircle2, Music2, Eye,
} from "lucide-react";

interface ConnectedAccount {
  platform:    string;
  accountName: string | null;
  isActive:    boolean;
  connectedAt: string;
}

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: Instagram, authUrl: "/api/auth/instagram", color: "text-pink-600" },
  { id: "facebook",  name: "Facebook",  icon: Facebook,  authUrl: "/api/auth/facebook",  color: "text-blue-600" },
  { id: "tiktok",    name: "TikTok",    icon: Music2,    authUrl: "/api/auth/tiktok",    color: "text-foreground" },
  { id: "youtube",   name: "YouTube",   icon: Youtube,   authUrl: "/api/auth/youtube",   color: "text-red-600"  },
];

export default function ConnectionsPage() {
  const [accounts, setAccounts]     = useState<ConnectedAccount[]>([]);
  const [loading, setLoading]       = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [toggling, setToggling]     = useState<string | null>(null);
  const router = useRouter();

  // Keep a ref so interval callbacks always see the latest accounts list
  const accountsRef = useRef<ConnectedAccount[]>([]);
  accountsRef.current = accounts;

  const fetchConnections = useCallback(async (): Promise<ConnectedAccount[]> => {
    try {
      const res = await fetch("/api/social/connections");
      if (!res.ok) return accountsRef.current;
      const data = await res.json();
      const list: ConnectedAccount[] = Array.isArray(data) ? data : [];
      setAccounts(list);
      return list;
    } catch {
      return accountsRef.current;
    }
  }, []);

  useEffect(() => {
    fetchConnections().finally(() => setLoading(false));
  }, [fetchConnections]);

  // ─── Connect ────────────────────────────────────────────────────────────────
  const handleConnect = useCallback((platformId: string, platformName: string, authUrl: string) => {
    setConnecting(platformId);

    const width  = 600;
    const height = 700;
    const left   = Math.round(window.screen.width  / 2 - width  / 2);
    const top    = Math.round(window.screen.height / 2 - height / 2);
    const popup  = window.open(
      authUrl,
      `Connect ${platformName}`,
      `width=${width},height=${height},left=${left},top=${top},noopener=0`,
    );

    if (!popup) {
      toast.error("Popup was blocked. Please allow popups for this site.");
      setConnecting(null);
      return;
    }

    // Snapshot connected state BEFORE the OAuth flow starts (using ref — always fresh)
    const wasConnected = accountsRef.current.some(
      (a) => a.platform === platformId.toUpperCase(),
    );

    // postMessage listener — fires if the callback page can reach window.opener
    const onMessage = (e: MessageEvent) => {
      if (e.data?.platform?.toLowerCase() !== platformId) return;

      if (e.data.type === "SOCIAL_CONNECT_ERROR") {
        cleanup();
        toast.error(e.data.error || `Failed to connect ${platformName}`);
        setConnecting(null);
      } else if (e.data.type === "SOCIAL_CONNECTED") {
        cleanup();
        // Give the DB write a moment to settle, then refresh once
        setTimeout(async () => {
          const fresh = await fetchConnections();
          const nowConnected = fresh.some((a) => a.platform === platformId.toUpperCase());
          setConnecting(null);
          if (!wasConnected && nowConnected) toast.success(`${platformName} connected`);
        }, 600);
      }
    };
    window.addEventListener("message", onMessage);

    // Popup-closed poller — reliable fallback when opener is cleared by redirects
    let retries = 0;
    const MAX_RETRIES = 8;

    const popupPoll = setInterval(() => {
      if (!popup.closed) return; // popup still open — keep waiting
      clearInterval(popupPoll);
      window.removeEventListener("message", onMessage);

      // Retry fetching until the platform appears or we give up
      const retryPoll = setInterval(async () => {
        retries++;
        const fresh = await fetchConnections();
        const nowConnected = fresh.some((a) => a.platform === platformId.toUpperCase());

        if (nowConnected || retries >= MAX_RETRIES) {
          clearInterval(retryPoll);
          setConnecting(null);
          if (!wasConnected && nowConnected) toast.success(`${platformName} connected`);
          else if (!nowConnected && retries >= MAX_RETRIES) {
            // Don't show an error — user may have just closed the popup
          }
        }
      }, 800);
    }, 500);

    function cleanup() {
      clearInterval(popupPoll);
      window.removeEventListener("message", onMessage);
    }
  }, [fetchConnections]);

  // ─── Disconnect ─────────────────────────────────────────────────────────────
  const handleDisconnect = useCallback(async (platformId: string, platformName: string) => {
    if (!confirm(`Disconnect ${platformName}?`)) return;

    const tid = toast.loading(`Disconnecting ${platformName}…`);
    try {
      const res  = await fetch("/api/social/disconnect", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ platform: platformId }),
      });
      const data = await res.json();
      toast.dismiss(tid);

      if (!res.ok) {
        toast.error(data.error || "Failed to disconnect");
        return;
      }

      // Optimistically remove from state immediately, then confirm with server
      setAccounts((prev) => prev.filter((a) => a.platform !== platformId.toUpperCase()));
      toast.success(`${platformName} disconnected`);
      await fetchConnections(); // sync with server
    } catch {
      toast.dismiss(tid);
      toast.error("Network error — please try again");
    }
  }, [fetchConnections]);

  // ─── Toggle active ──────────────────────────────────────────────────────────
  const handleToggle = useCallback(async (platformId: string, currentActive: boolean) => {
    setToggling(platformId);
    // Optimistic update
    setAccounts((prev) =>
      prev.map((a) =>
        a.platform === platformId.toUpperCase() ? { ...a, isActive: !currentActive } : a,
      ),
    );
    try {
      const res = await fetch("/api/social/toggle-active", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ platform: platformId.toUpperCase(), isActive: !currentActive }),
      });
      if (!res.ok) {
        // Revert on failure
        setAccounts((prev) =>
          prev.map((a) =>
            a.platform === platformId.toUpperCase() ? { ...a, isActive: currentActive } : a,
          ),
        );
        toast.error("Failed to update setting");
      } else {
        toast.success(`Auto-publishing ${!currentActive ? "enabled" : "disabled"}`);
      }
    } catch {
      setAccounts((prev) =>
        prev.map((a) =>
          a.platform === platformId.toUpperCase() ? { ...a, isActive: currentActive } : a,
        ),
      );
      toast.error("Network error — please try again");
    } finally {
      setToggling(null);
    }
  }, []);

  const getAccount = (platformId: string) =>
    accounts.find((a) => a.platform === platformId.toUpperCase());

  // ─── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Connections</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your linked social media accounts to publish directly.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLATFORMS.map((platform) => {
          const account      = getAccount(platform.id);
          const Icon         = platform.icon;
          const isConnecting = connecting === platform.id;

          return (
            <Card key={platform.id} className="border-none shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-4">
                {/* Platform header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className={`w-4 h-4 ${platform.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{platform.name}</h3>
                    {account ? (
                      <p className="text-[11px] text-[#0d7c8a] flex items-center gap-1 font-medium mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        {account.accountName || "Connected"}
                      </p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground mt-0.5">Not connected</p>
                    )}
                  </div>
                </div>

                {/* Action area */}
                <div className="bg-muted/30 rounded-lg p-3">
                  {account ? (
                    <div className="flex flex-col gap-3">
                      {/* Auto-publish toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-foreground">Auto-Publishing</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Allow system to post on your behalf
                          </p>
                        </div>
                        <Switch
                          id={`active-${platform.id}`}
                          checked={account.isActive}
                          disabled={toggling === platform.id}
                          onCheckedChange={() => handleToggle(platform.id, account.isActive)}
                          className="data-[state=checked]:bg-[#0d7c8a]"
                        />
                      </div>

                      <div className="h-px bg-border" />

                      {/* Change Preview */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#0d7c8a] hover:bg-[#0d7c8a]/10 text-xs font-bold w-full h-8"
                        onClick={() => router.push(`/user/generate?preview=${platform.id}`)}
                      >
                        <Eye className="w-3 h-3 mr-2" />
                        Change Preview
                      </Button>

                      <div className="h-px bg-border" />

                      {/* Disconnect */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 text-xs font-bold w-full h-8"
                        onClick={() => handleDisconnect(platform.id, platform.name)}
                      >
                        <Unlink className="w-3 h-3 mr-2" />
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    /* Connect */
                    <Button
                      onClick={() => handleConnect(platform.id, platform.name, platform.authUrl)}
                      disabled={isConnecting}
                      className="w-full bg-foreground hover:bg-foreground/80 text-background font-bold text-xs h-9"
                    >
                      {isConnecting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Link2 className="w-3 h-3 mr-2" />
                          Connect {platform.name}
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
