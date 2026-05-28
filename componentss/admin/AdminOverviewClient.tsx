"use client";

import type React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, ArrowRight, CreditCard, Users } from "lucide-react";

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
      <div>
        <h1 className="text-xl font-bold">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform health at a glance.</p>
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
          icon={Activity}
          href="/admin/analytics"
        />
        <StatCard
          title="Published Posts"
          value={data.totals.publishedPosts}
          icon={Activity}
          href="/admin/analytics"
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
