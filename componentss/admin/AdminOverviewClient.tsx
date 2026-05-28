"use client";

import type React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, AlertTriangle, ArrowRight, CreditCard, FileText, Users } from "lucide-react";

type AdminAnalytics = Awaited<ReturnType<typeof import("@/lib/admin-analytics").getAdminAnalytics>>;

function StatCard({
  title,
  value,
  icon: Icon,
  href,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full border-none shadow-sm rounded-lg hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1.5 text-2xl font-bold tabular-nums">{value}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function AdminOverviewClient({ data }: { data: AdminAnalytics }) {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">Platform health at a glance.</p>
        </div>
        {data.totals.flaggedContent > 0 && (
          <Link
            href="/admin/content"
            className="inline-flex h-8 items-center gap-2 rounded-lg bg-destructive/10 px-3 text-xs font-semibold text-destructive hover:bg-destructive/20"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            {data.totals.flaggedContent} flagged
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={data.totals.totalUsers}
          icon={Users}
          href="/admin/users"
        />
        <StatCard
          title="Generations"
          value={data.totals.totalGenerations}
          icon={FileText}
          href="/admin/content"
        />
        <StatCard
          title="Published Posts"
          value={data.totals.publishedPosts}
          icon={Activity}
          href="/admin/content"
        />
        <StatCard
          title="MRR"
          value={`$${data.totals.monthlyRevenue}`}
          icon={CreditCard}
          href="/admin/subscriptions"
        />
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">Operational Health</h2>
        <Card className="border-none shadow-sm rounded-lg">
          <CardContent className="p-4 space-y-4">
            {data.systemHealth.map((item) => {
              const percent = Math.round((item.value / Math.max(item.total, 1)) * 100);
              return (
                <div key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-xs tabular-nums font-medium">{percent}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="border-t border-border pt-4">
              <Link
                href="/admin/analytics"
                className="flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Full analytics
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
