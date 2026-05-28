"use client";

import type React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, ArrowRight, CreditCard, Users } from "lucide-react";
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

const TEAL = "#169B7F";
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
    </div>
  );
}
