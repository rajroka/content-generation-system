"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Link2, Unlink, Loader2 } from "lucide-react";
import { PLATFORMS } from "@/lib/platforms";

interface ConnectedAccount {
  platform:    string;
  accountName: string | null;
  isActive:    boolean;
  connectedAt: string;
}

export default function ConnectionsPage() {
  const [accounts, setAccounts]     = useState<ConnectedAccount[]>([]);
  const [loading, setLoading]       = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  const accountsRef = useRef<ConnectedAccount[]>([]);
  accountsRef.current = accounts;

  const fetchConnections = useCallback(async (): Promise<ConnectedAccount[]> => {
    try {
      const res = await fetch("/api/social/connections", { cache: "no-store" });
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

    const wasConnected = accountsRef.current.some(
      (a) => a.platform === platformId.toUpperCase(),
    );

    const onMessage = (e: MessageEvent) => {
      if (e.data?.platform?.toLowerCase() !== platformId.toLowerCase()) return;

      if (e.data.type === "SOCIAL_CONNECT_ERROR") {
        cleanup();
        toast.error(e.data.error || `Failed to connect ${platformName}`);
        setConnecting(null);
      } else if (e.data.type === "SOCIAL_CONNECTED") {
        cleanup();
        setTimeout(async () => {
          const fresh = await fetchConnections();
          const nowConnected = fresh.some((a) => a.platform === platformId.toUpperCase());
          setConnecting(null);
          if (!wasConnected && nowConnected) toast.success(`${platformName} connected`);
        }, 600);
      }
    };
    window.addEventListener("message", onMessage);

    let retries = 0;
    const MAX_RETRIES = 8;

    const popupPoll = setInterval(() => {
      if (!popup.closed) return;
      clearInterval(popupPoll);
      window.removeEventListener("message", onMessage);

      const retryPoll = setInterval(async () => {
        retries++;
        const fresh = await fetchConnections();
        const nowConnected = fresh.some((a) => a.platform === platformId.toUpperCase());

        if (nowConnected || retries >= MAX_RETRIES) {
          clearInterval(retryPoll);
          setConnecting(null);
          if (!wasConnected && nowConnected) toast.success(`${platformName} connected`);
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

      setAccounts((prev) => prev.filter((a) => a.platform !== platformId.toUpperCase()));
      toast.success(`${platformName} disconnected`);
      await fetchConnections();
    } catch {
      toast.dismiss(tid);
      toast.error("Network error — please try again");
    }
  }, [fetchConnections]);

  const getAccount = (platformId: string) =>
    accounts.find((a) => a.platform === platformId.toUpperCase());

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-3">
        {Array.from({ length: PLATFORMS.length }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Connections</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your social accounts to publish directly from PostSathi.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PLATFORMS.map((platform) => {
          const account      = getAccount(platform.id);
          const Icon         = platform.Icon;
          const isConnecting = connecting === platform.id;

          return (
            <Card key={platform.id} className="border shadow-sm rounded-xl">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 px-4 py-3">
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className={`w-4 h-4 ${platform.colorClass}`} />
                  </div>

                  {/* Name + account */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{platform.name}</p>
                    {account ? (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {account.accountName || "Connected"}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-0.5">Not connected</p>
                    )}
                  </div>

                  {/* Action */}
                  {account ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 text-xs font-semibold h-8 px-3 shrink-0"
                      onClick={() => handleDisconnect(platform.slug, platform.name)}
                    >
                      <Unlink className="w-3 h-3 mr-1.5" />
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleConnect(platform.slug, platform.name, platform.authUrl)}
                      disabled={isConnecting}
                      className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold h-8 px-3 shrink-0"
                    >
                      {isConnecting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <Link2 className="w-3 h-3 mr-1.5" />
                          Connect
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
