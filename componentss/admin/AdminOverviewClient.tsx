"use client";

import type React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, ArrowRight, CreditCard, Crown, Users } from "lucide-react";
import { format } from "date-fns";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AdminAnalytics = Awaited<ReturnType<typeof import("@/lib/admin-analytics").getAdminAnalytics>>;

const TEAL = "var(--color-primary)";
const BLUE = "#4F86C6";
const AMBER = "#F59E0B";

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

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export function AdminOverviewClient({ data }: { data: AdminAnalytics }) {
  const tickInterval =
    data.dailyActivity.length > 14
      ? Math.ceil(data.dailyActivity.length / 10)
      : 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">Platform health at a glance.</p>
        </div>
        <Link
          href="/admin/analytics"
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          Full analytics
          <ArrowRight className="h-4 w-4" />
        </Link>
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

      <Card className="border-none shadow-sm rounded-lg">
        <CardContent className="p-4">
          <p className="text-sm font-semibold mb-4">Business Activity</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={data.dailyActivity}
              margin={{ top: 8, right: 12, bottom: 4, left: 0 }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)" }}
                interval={tickInterval}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={24}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="generations"
                name="Generations"
                stroke={TEAL}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: TEAL }}
              />
              <Line
                type="monotone"
                dataKey="newUsers"
                name="New Users"
                stroke={BLUE}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: BLUE }}
              />
              <Line
                type="monotone"
                dataKey="publishedPosts"
                name="Published"
                stroke={AMBER}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: AMBER }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* New Pro Users */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-3">
          New Pro Users
          {data.newProUsers.length > 0 && (
            <span className="ml-2 text-xs font-semibold text-muted-foreground">
              ({data.newProUsers.length} this period)
            </span>
          )}
        </h2>
        <Card className="border-none shadow-sm rounded-lg">
          <CardContent className="p-0">
            {data.newProUsers.length === 0 ? (
              <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
                No new Pro upgrades in this period.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {data.newProUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/40">
                      <Crown className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {u.name || u.email.split("@")[0]}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(u.upgradedAt), "MMM d, yyyy")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── New Pro Users section appended to AdminOverviewClient ────────────────────
// (This is a standalone export used inside the same file's JSX above)
