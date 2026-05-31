"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { CreditCard, Crown, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SubscriptionUser {
  id: string;
  email: string;
  name: string | null;
  plan: "FREE" | "PRO";
  isActive: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
  billingStatus: string;
  _count: { generations: number; scheduledPosts: number };
}

interface SubscriptionData {
  summary: {
    totalUsers: number;
    proUsers: number;
    freeUsers: number;
    monthlyRevenue: number;
  };
  subscriptions: SubscriptionUser[];
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
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

export default function AdminSubscriptionsPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch("/api/admin/subscriptions", { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to fetch");
      setData(payload);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubscriptions(); }, []);
  useEffect(() => { setSearch(searchParams.get("q") || ""); }, [searchParams]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (data?.subscriptions || []).filter(
      (s) =>
        s.email.toLowerCase().includes(q) ||
        s.name?.toLowerCase().includes(q) ||
        s.plan.toLowerCase().includes(q)
    );
  }, [data?.subscriptions, search]);

  const updatePlan = async (userId: string, plan: "FREE" | "PRO") => {
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/admin/users/update-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Plan updated to ${plan}`);
      await fetchSubscriptions();
    } catch {
      toast.error("Failed to update plan");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 animate-pulse">
        <div className="h-7 w-32 rounded bg-muted" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 rounded-lg bg-muted" />)}
        </div>
        <div className="h-80 rounded-lg bg-muted" />
      </div>
    );
  }

  const summary = data?.summary ?? { totalUsers: 0, proUsers: 0, freeUsers: 0, monthlyRevenue: 0 };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Subscription plans and revenue.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard title="Total Users" value={summary.totalUsers} icon={Users} />
        <StatCard title="Pro Users" value={summary.proUsers} icon={Crown} />
        <StatCard title="Free Users" value={summary.freeUsers} icon={Users} />
        <StatCard title="MRR" value={`$${summary.monthlyRevenue}`} icon={CreditCard} />
      </div>

      <Card className="border-none shadow-sm rounded-lg">
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base font-semibold">
              Accounts ({filtered.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="w-full pl-9 sm:w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Since</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{s.name || "Anonymous"}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.plan === "PRO" ? "default" : "secondary"}>{s.plan}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        disabled={updatingId === s.id || s.plan === "PRO"}
                        onClick={() => updatePlan(s.id, "PRO")}
                      >
                        Upgrade
                      </Button>
                      <Button
                        size="sm"
                        disabled={updatingId === s.id || s.plan === "FREE"}
                        onClick={() => updatePlan(s.id, "FREE")}
                        className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                      >
                        Downgrade
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <p className="font-medium">No accounts found</p>
              <p className="text-sm">Try a different search term.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
