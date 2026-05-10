"use client";

import { useEffect, useMemo, useState } from "react";
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
  _count: {
    generations: number;
    scheduledPosts: number;
  };
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

export default function AdminSubscriptionsPage() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/admin/subscriptions");
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to fetch subscriptions");
      }

      setData(payload);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch subscriptions");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get("q");
    if (query) setSearch(query);
    fetchSubscriptions();
  }, []);

  const subscriptions = data?.subscriptions || [];
  const filteredSubscriptions = useMemo(() => {
    const query = search.toLowerCase();

    return subscriptions.filter(
      (subscription) =>
        subscription.email.toLowerCase().includes(query) ||
        subscription.name?.toLowerCase().includes(query) ||
        subscription.plan.toLowerCase().includes(query) ||
        subscription.stripeCustomerId?.toLowerCase().includes(query)
    );
  }, [search, subscriptions]);

  const updatePlan = async (userId: string, plan: "FREE" | "PRO") => {
    setUpdatingId(userId);
    try {
      const response = await fetch("/api/admin/users/update-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan }),
      });

      if (!response.ok) throw new Error("Failed to update subscription plan");

      toast.success(`Plan updated to ${plan}`);
      await fetchSubscriptions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update plan");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-1/4 rounded bg-muted" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 rounded bg-muted" />
            ))}
          </div>
          <div className="h-80 rounded bg-muted" />
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalUsers: 0,
    proUsers: 0,
    freeUsers: 0,
    monthlyRevenue: 0,
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="mt-1 text-muted-foreground">Manage user billing status and subscription plans</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{summary.totalUsers}</p>
            </div>
            <Users className="h-5 w-5 text-[#0d7c8a]" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Pro Users</p>
              <p className="text-2xl font-bold">{summary.proUsers}</p>
            </div>
            <Crown className="h-5 w-5 text-[#0d7c8a]" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Free Users</p>
              <p className="text-2xl font-bold">{summary.freeUsers}</p>
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Projected MRR</p>
              <p className="text-2xl font-bold">${summary.monthlyRevenue.toFixed(0)}</p>
            </div>
            <CreditCard className="h-5 w-5 text-[#0d7c8a]" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Billing Accounts ({filteredSubscriptions.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search billing..."
                className="w-full pl-9 sm:w-72"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
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
                <TableHead>Billing</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{subscription.name || "Anonymous"}</p>
                      <p className="text-xs text-muted-foreground">{subscription.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={subscription.plan === "PRO" ? "default" : "secondary"}>{subscription.plan}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={subscription.billingStatus === "Active" ? "default" : "secondary"}>
                        {subscription.billingStatus}
                      </Badge>
                      <p className="max-w-[220px] truncate text-xs text-muted-foreground">
                        {subscription.stripeSubscriptionId || subscription.stripeCustomerId || "No Stripe record"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {subscription._count.generations} generations, {subscription._count.scheduledPosts} scheduled
                  </TableCell>
                  <TableCell className="text-sm">{new Date(subscription.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant={subscription.plan === "PRO" ? "secondary" : "default"}
                        disabled={updatingId === subscription.id || subscription.plan === "PRO"}
                        onClick={() => updatePlan(subscription.id, "PRO")}
                      >
                        Upgrade
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingId === subscription.id || subscription.plan === "FREE"}
                        onClick={() => updatePlan(subscription.id, "FREE")}
                      >
                        Downgrade
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSubscriptions.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <p className="font-medium">No billing accounts found</p>
              <p className="text-sm">Try another search term.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
