"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Sparkles, CalendarDays, CheckCircle2, Link2,
  TrendingUp, Loader2,
} from "lucide-react";

interface AnalyticsData {
  generationsOverTime: { date: string; count: number }[];
  platformBreakdown:   { platform: string; count: number }[];
  scheduledByStatus:   { status: string; count: number }[];
  usageOverTime:       { date: string; captions: number; schedules: number }[];
  totals: {
    generations: number;
    scheduled:   number;
    published:   number;
    connected:   number;
  };
}

const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM: "#e1306c",
  FACEBOOK:  "#1877f2",
  TWITTER:   "#1da1f2",
  LINKEDIN:  "#0a66c2",
  YOUTUBE:   "#ff0000",
};

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED:  "hsl(var(--primary))",
  DRAFT:      "#94a3b8",
  PUBLISHED:  "#22c55e",
  FAILED:     "#ef4444",
  CANCELLED:  "#f59e0b",
};

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-none shadow-sm rounded-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold mb-1 text-foreground">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground text-sm">
        Failed to load analytics. Try refreshing.
      </div>
    );
  }

  const totalPlatformCount = data.platformBreakdown.reduce((s, p) => s + p.count, 0);

  return (
    <div className="p-6 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your content performance and usage patterns
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Generations"
          value={data.totals.generations}
          description="All time"
          icon={<Sparkles className="w-4 h-4 text-primary" />}
        />
        <StatCard
          title="Scheduled Posts"
          value={data.totals.scheduled}
          description="Upcoming"
          icon={<CalendarDays className="w-4 h-4 text-primary" />}
        />
        <StatCard
          title="Published Posts"
          value={data.totals.published}
          description="All time"
          icon={<CheckCircle2 className="w-4 h-4 text-primary" />}
        />
        <StatCard
          title="Connected Accounts"
          value={data.totals.connected}
          description="Active"
          icon={<Link2 className="w-4 h-4 text-primary" />}
        />
      </div>

      {/* Generations Over Time */}
      <Card className="border-none shadow-sm rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Generations — Last 30 Days</CardTitle>
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {data.generationsOverTime.every((d) => d.count === 0) ? (
            <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
              No generations in the last 30 days.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.generationsOverTime} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="genGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  interval={4}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Generations"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#genGradient)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Weekly Usage + Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Weekly Usage */}
        <Card className="border-none shadow-sm rounded-lg">
          <CardHeader>
            <CardTitle>Usage — Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            {data.usageOverTime.every((d) => d.captions === 0 && d.schedules === 0) ? (
              <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                No usage data for the last 7 days.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.usageOverTime} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar dataKey="captions"  name="Captions"  fill="hsl(var(--primary))"    radius={[4, 4, 0, 0]} />
                  <Bar dataKey="schedules" name="Schedules" fill="hsl(var(--primary) / 0.35)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <Card className="border-none shadow-sm rounded-lg">
          <CardHeader>
            <CardTitle>Platform Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {data.platformBreakdown.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                No platform data yet.
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={data.platformBreakdown}
                      dataKey="count"
                      nameKey="platform"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {data.platformBreakdown.map((entry) => (
                        <Cell
                          key={entry.platform}
                          fill={PLATFORM_COLORS[entry.platform] ?? "#94a3b8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [value, name]}
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--background))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex flex-col gap-2 flex-1">
                  {data.platformBreakdown.map((entry) => {
                    const pct = totalPlatformCount > 0
                      ? Math.round((entry.count / totalPlatformCount) * 100)
                      : 0;
                    return (
                      <div key={entry.platform} className="flex items-center gap-3">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: PLATFORM_COLORS[entry.platform] ?? "#94a3b8" }}
                        />
                        <span className="text-sm text-foreground flex-1">{entry.platform}</span>
                        <span className="text-xs text-muted-foreground">{entry.count}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 min-w-[36px] justify-center">
                          {pct}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Posts by Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scheduled Posts by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {data.scheduledByStatus.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
              No scheduled posts yet.
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {data.scheduledByStatus.map((entry) => (
                <div
                  key={entry.status}
                  className="flex items-center gap-3 bg-muted/40 border border-border rounded-xl px-5 py-4 min-w-[140px]"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[entry.status] ?? "#94a3b8" }}
                  />
                  <div>
                    <p className="text-xs text-muted-foreground capitalize">{entry.status.toLowerCase()}</p>
                    <p className="text-xl font-bold">{entry.count}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}