"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, RefreshCcw, Users, ShieldCheck, UserX } from "lucide-react";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  plan: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { generations: number };
}

function isNewUser(user: User, now: number): boolean {
  return now - new Date(user.createdAt).getTime() < 24 * 60 * 60 * 1000;
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <Card className="border-none shadow-sm rounded-lg">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1.5 text-2xl font-bold tabular-nums">{value}</p>
        </div>
        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [updatingPlanId, setUpdatingPlanId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  // Ticks every minute so the "New" badge disappears in real-time once 24h passes
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Silently sync Clerk → DB first, then fetch the updated list
    const init = async () => {
      await silentSync();
      await fetchUsers();
    };
    init();

    // Re-sync every 5 minutes to catch any new signups automatically
    const syncInterval = setInterval(async () => {
      await silentSync();
      await fetchUsers();
    }, 5 * 60_000);

    // Tick "now" every 60 seconds so badge expiry is accurate
    const nowInterval = setInterval(() => setNow(Date.now()), 60_000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(nowInterval);
    };
  }, []);

  useEffect(() => { setSearch(searchParams.get("q") || ""); }, [searchParams]);

  // Silent background sync — no toast, no loading state
  const silentSync = async () => {
    try {
      await fetch("/api/admin/users/sync", { method: "POST" });
    } catch {
      // silently ignore — fetchUsers will still show whatever is in DB
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const syncFromClerk = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/users/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const msg = data.removed > 0
        ? `Synced ${data.synced} users, removed ${data.removed} deleted`
        : `Synced ${data.synced} users from Clerk`;
      toast.success(msg);
      await fetchUsers();
    } catch {
      toast.error("Sync failed");
    } finally {
      setSyncing(false);
    }
  };
  const handleUpdatePlan = async (userId: string, plan: "FREE" | "PRO") => {
    setUpdatingPlanId(userId);
    try {
      const res = await fetch("/api/admin/users/update-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan }),
      });
      if (!res.ok) throw new Error();
      toast.success(plan === "PRO" ? "User upgraded to PRO" : "User downgraded to FREE");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, plan } : u))
      );
    } catch {
      toast.error("Failed to update plan");
    } finally {
      setUpdatingPlanId(null);
    }
  };

  const handleToggleActive = async (userId: string, currentlyActive: boolean) => {
    setTogglingId(userId);
    try {
      const res = await fetch("/api/admin/users/toggle-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: !currentlyActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(currentlyActive ? "User suspended" : "User activated");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !currentlyActive } : u))
      );
    } catch {
      toast.error("Failed to update user");
    } finally {
      setTogglingId(null);
    }
  };

  const safeUsers = useMemo(() => (Array.isArray(users) ? users : []), [users]);
  const activeCount = safeUsers.filter((u) => u.isActive).length;
  const adminCount = safeUsers.filter((u) => u.role === "ADMIN").length;
  const suspendedCount = safeUsers.length - activeCount;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return safeUsers.filter(
      (u) =>
        u.email?.toLowerCase().includes(q) ||
        u.name?.toLowerCase().includes(q) ||
        u.plan?.toLowerCase().includes(q)
    );
  }, [safeUsers, search]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 animate-pulse">
        <div className="h-7 w-32 rounded bg-muted" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-20 rounded-lg bg-muted" />)}
        </div>
        <div className="h-64 rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage account access and status.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard title="Total Users" value={safeUsers.length} icon={Users} />
        <StatCard title="Admins" value={adminCount} icon={ShieldCheck} />
        <StatCard title="Suspended" value={suspendedCount} icon={UserX} />
      </div>

      <Card className="border-none shadow-sm rounded-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base font-semibold">
              All Users ({filtered.length})
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-9 w-full sm:w-60"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={syncFromClerk} disabled={syncing} aria-label="Sync from Clerk">
                <RefreshCcw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Badge</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name || "Anonymous"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.plan === "PRO" ? "default" : "secondary"}>
                      {user.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "destructive"}>
                      {user.isActive ? "Active" : "Suspended"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isNewUser(user, now) ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        New
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Downgrade — only shown for PRO users */}
                      {user.plan === "PRO" && (
                        <Button
                          size="sm"
                          disabled={updatingPlanId === user.id}
                          onClick={() => handleUpdatePlan(user.id, "FREE")}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Downgrade
                        </Button>
                      )}
                      {/* Suspend / Activate */}
                      <Button
                        size="sm"
                        variant={user.isActive ? "destructive" : "outline"}
                        disabled={togglingId === user.id}
                        onClick={() => handleToggleActive(user.id, user.isActive)}
                      >
                        {user.isActive ? "Suspend" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <p className="font-medium">No users found</p>
              <p className="text-sm">Try a different search term.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
