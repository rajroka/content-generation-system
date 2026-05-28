"use client";

import type React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CreditCard,
  FileText,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AdminAnalytics = Awaited<ReturnType<typeof import("@/lib/admin-analytics").getAdminAnalytics>>;

const TEAL = "#169B7F";
const BLUE = "#4F86C6";
const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM: "#E1306C",
  FACEBOOK: "#1877F2",
  TIKTOK: "#69C9D0",
  YOUTUBE: "#FF0000",
};

function formatPlatform(platform: string) {
  return platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
}

function StatCard({
  title,
  value,
  note,
  icon: Icon,
  href,
}: {
  title: string;
  value: string | number;
  note: string;
  icon: React.ElementType;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full border-none shadow-sm rounded-lg hover:shadow-md transition-all">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-2xl font-bold text-foreground tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{note}</p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-3">{title}</h2>
      <Card className="border-none shadow-sm rounded-lg">
        <CardContent className="p-4">{children}</CardContent>
      </Card>
    </div>
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

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
      <p className="font-semibold" style={{ color: payload[0].payload.color }}>
        {payload[0].name}
      </p>
      <p className="text-foreground font-bold">{payload[0].value}</p>
    </div>
  );
}

export function AdminOverviewClient({ data }: { data: AdminAnalytics }) {
  const platformData = data.platformDistribution.map((entry, index) => ({
    name: formatPlatform(entry.platform),
    value: entry.count,
    color: PLATFORM_COLORS[entry.platform] ?? ["#64748b", "#94a3b8", "#cbd5e1"][index % 3],
  }));

  const totalPlatformCount = platformData.reduce((sum, item) => sum + item.value, 0);

  const quickActions = [
    { label: "Review Users", icon: Users, href: "/admin/users" },
    { label: "Moderate Content", icon: ShieldCheck, href: "/admin/content" },
    { label: "View Analytics", icon: BarChart3, href: "/admin/analytics" },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform health, moderation, billing, and growth at a glance.
          </p>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Card className="border-none shadow-sm rounded-lg hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg shrink-0">
                  <action.icon size={16} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-bold text-foreground">{action.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={data.totals.totalUsers}
          note={`${data.totals.activeUsers} active accounts`}
          icon={Users}
          href="/admin/users"
        />
        <StatCard
          title="Generated Content"
          value={data.totals.totalGenerations}
          note={`${data.totals.totalImages} with images`}
          icon={FileText}
          href="/admin/content"
        />
        <StatCard
          title="Published Posts"
          value={data.totals.publishedPosts}
          note={`${data.totals.scheduledPosts} currently scheduled`}
          icon={Activity}
          href="/admin/content"
        />
        <StatCard
          title="Projected MRR"
          value={`$${data.totals.monthlyRevenue}`}
          note={`${data.totals.proUsers} Pro users`}
          icon={CreditCard}
          href="/admin/subscriptions"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
        <ChartCard title="Platform Activity">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data.dailyActivity} margin={{ top: 10, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)" }}
                interval={data.dailyActivity.length > 14 ? Math.ceil(data.dailyActivity.length / 10) : 0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={28}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="generations"
                name="Generations"
                stroke={TEAL}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: TEAL }}
              />
              <Line
                type="monotone"
                dataKey="publishedPosts"
                name="Published"
                stroke={BLUE}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: BLUE }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Platform Mix">
          {platformData.length === 0 || totalPlatformCount === 0 ? (
            <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
              No platform activity yet.
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {platformData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3">
                {platformData.map((entry) => {
                  const pct = Math.round((entry.value / totalPlatformCount) * 100);
                  return (
                    <div key={entry.name} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm">
                      <span className="min-w-0 truncate text-foreground">{entry.name}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">{entry.value}</span>
                      <span
                        className="min-w-[46px] rounded-md border px-2 py-0.5 text-center text-xs font-semibold tabular-nums"
                        style={{
                          color: entry.color,
                          borderColor: `${entry.color}55`,
                          backgroundColor: `${entry.color}12`,
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div>
          <h2 className="text-base font-bold text-foreground mb-3">Recent Activity</h2>
          <Card className="border-none shadow-sm rounded-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {data.recentActivity.slice(0, 6).map((activity) => (
                  <Link
                    key={activity.id}
                    href={`/admin/content?q=${encodeURIComponent(activity.topic)}`}
                    className="grid grid-cols-[36px_1fr_auto] gap-3 px-4 py-3 items-center hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <FileText size={14} className="text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{activity.topic}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.userEmail} on {formatPlatform(String(activity.platform))}
                      </p>
                    </div>
                    {activity.isFlagged ? (
                      <Badge className="bg-red-600 text-white border-0 text-[10px]">Flagged</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Clear</Badge>
                    )}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-base font-bold text-foreground mb-3">Operational Health</h2>
          <Card className="border-none shadow-sm rounded-lg">
            <CardContent className="p-4 space-y-4">
              {data.systemHealth.map((item) => {
                const percent = Math.round((item.value / Math.max(item.total, 1)) * 100);
                return (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{item.label}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{percent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#169B7F]"
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="border-t border-border pt-4">
                <Link
                  href="/admin/analytics"
                  className="flex items-center justify-between text-sm font-semibold text-foreground hover:text-[#169B7F]"
                >
                  Open full analytics
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
