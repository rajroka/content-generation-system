"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DateRange = "7d" | "30d" | "90d";

interface AdminAnalyticsData {
  range: DateRange;
  totals: {
    totalUsers: number;
    activeUsers: number;
    proUsers: number;
    freeUsers: number;
    totalGenerations: number;
    publishedPosts: number;
    scheduledPosts: number;
    connectedAccounts: number;
    monthlyRevenue: number;
  };
  trends: {
    users: number;
    generations: number;
    scheduledPosts: number;
    revenue: number;
  };
  dailyActivity: {
    date: string;
    label: string;
    generations: number;
    newUsers: number;
    publishedPosts: number;
    scheduledPosts: number;
  }[];
  platformDistribution: { platform: string; count: number }[];
  planDistribution: { plan: string; count: number }[];
  revenueData: { month: string; revenue: number; proUsers: number }[];
  topUsers: {
    id: string;
    name: string | null;
    email: string;
    plan: string;
    generations: number;
    scheduledPosts: number;
    socialAccounts: number;
  }[];
}

const TEAL = "#169B7F";
const BLUE = "#4F86C6";
const AMBER = "#F59E0B";
const ROSE = "#E11D48";

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

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
}: {
  title: string;
  value: number | string | null;
}) {
  return (
    <Card className="border-none shadow-sm rounded-lg">
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        {value === null ? (
          <div className="mt-2 h-8 w-20 animate-pulse rounded-lg bg-muted" />
        ) : (
          <p className="mt-1.5 text-2xl font-bold tabular-nums">{value}</p>
        )}
      </CardContent>
    </Card>
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

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
      {message}
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

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (range: DateRange) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/analytics?range=${range}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to fetch analytics");
      }

      setData(payload);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Failed to fetch analytics";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(dateRange);
  }, [dateRange]);

  const platformData = useMemo(() => {
    return (data?.platformDistribution ?? []).map((entry, index) => ({
      name: formatPlatform(entry.platform),
      value: entry.count,
      color: PLATFORM_COLORS[entry.platform] ?? ["#64748b", "#94a3b8", "#cbd5e1"][index % 3],
    }));
  }, [data]);

  const planData = useMemo(() => {
    return (data?.planDistribution ?? []).map((entry) => ({
      name: entry.plan,
      value: entry.count,
      color: entry.plan === "PRO" ? TEAL : BLUE,
    }));
  }, [data]);

  const topAccountData = useMemo(() => {
    return (data?.topUsers ?? []).map((user) => ({
      ...user,
      account: user.name || user.email.split("@")[0],
    }));
  }, [data]);

  const tickInterval = data && data.dailyActivity.length > 14
    ? Math.ceil(data.dailyActivity.length / 10)
    : 1;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Growth, revenue, and publishing performance.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex w-full sm:w-auto rounded-lg border border-border bg-card p-1">
            {DATE_RANGES.map((range) => (
              <button
                key={range.value}
                type="button"
                onClick={() => setDateRange(range.value)}
                className={[
                  "flex-1 sm:flex-none rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                  dateRange === range.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => fetchAnalytics(dateRange)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <Card className="border-none shadow-sm rounded-lg">
          <CardContent className="flex h-[60vh] flex-col items-center justify-center text-center">
            <p className="text-sm font-semibold text-foreground">Analytics could not be loaded</p>
            <p className="mt-1 text-sm text-muted-foreground">Refresh the page or try again in a moment.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatCard title="Total Users" value={isLoading ? null : data?.totals.totalUsers ?? 0} />
            <StatCard title="Generations" value={isLoading ? null : data?.totals.totalGenerations ?? 0} />
            <StatCard title="Published Posts" value={isLoading ? null : data?.totals.publishedPosts ?? 0} />
            <StatCard title="MRR" value={isLoading ? null : `$${data?.totals.monthlyRevenue ?? 0}`} />
          </div>

          {isLoading ? (
            <div className="flex h-[420px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : data ? (
            <>
              <ChartCard title="Business Activity">
                <ResponsiveContainer width="100%" height={360}>
                  <LineChart data={data.dailyActivity} margin={{ top: 10, right: 16, bottom: 8, left: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      tickLine={false}
                      axisLine={{ stroke: "var(--color-border)" }}
                      interval={tickInterval - 1}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      width={28}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                      formatter={(value) => (
                        <span style={{ color: "var(--color-foreground)" }}>{value}</span>
                      )}
                    />
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
                      dataKey="newUsers"
                      name="New Users"
                      stroke={BLUE}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: BLUE }}
                    />
                    <Line
                      type="monotone"
                      dataKey="publishedPosts"
                      name="Published"
                      stroke={AMBER}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: AMBER }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ChartCard title="Platform Breakdown">
                  {platformData.length === 0 ? (
                    <EmptyChart message="No platform data in this range." />
                  ) : (
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                      <ResponsiveContainer width={220} height={220}>
                        <PieChart>
                          <Pie
                            data={platformData}
                            cx="50%"
                            cy="50%"
                            innerRadius={58}
                            outerRadius={95}
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

                      <div className="flex-1 space-y-3 min-w-0">
                        {platformData.map((entry) => (
                          <div key={entry.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-sm">
                            <span className="min-w-0 truncate text-foreground">{entry.name}</span>
                            <span
                              className="min-w-[46px] rounded-md border px-2 py-0.5 text-center text-xs font-semibold tabular-nums"
                              style={{
                                color: entry.color,
                                borderColor: `${entry.color}55`,
                                backgroundColor: `${entry.color}12`,
                              }}
                            >
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </ChartCard>

                <ChartCard title="Plan Mix">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <ResponsiveContainer width={220} height={220}>
                      <PieChart>
                        <Pie
                          data={planData}
                          cx="50%"
                          cy="50%"
                          innerRadius={58}
                          outerRadius={95}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {planData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="flex-1 space-y-4 min-w-0">
                      {planData.map((entry) => (
                        <div key={entry.name}>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="font-medium text-foreground">{entry.name}</span>
                            <span className="text-xs text-muted-foreground tabular-nums">{entry.value}</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.round((entry.value / Math.max(data.totals.totalUsers, 1)) * 100)}%`,
                                backgroundColor: entry.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ChartCard>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ChartCard title="Revenue">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.revenueData} margin={{ top: 10, right: 16, bottom: 8, left: 0 }}>
                      <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                        tickLine={false}
                        axisLine={{ stroke: "var(--color-border)" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                        width={36}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="MRR"
                        stroke={TEAL}
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: TEAL, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: TEAL }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Top Accounts">
                  {topAccountData.length === 0 ? (
                    <EmptyChart message="No accounts yet." />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topAccountData} margin={{ top: 10, right: 16, bottom: 8, left: 0 }}>
                        <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" />
                        <XAxis
                          dataKey="account"
                          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                          tickLine={false}
                          axisLine={{ stroke: "var(--color-border)" }}
                          interval={0}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                          width={28}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="generations" name="Generations" fill={BLUE} radius={[4, 4, 0, 0]} maxBarSize={34} />
                        <Bar dataKey="scheduledPosts" name="Scheduled" fill={ROSE} radius={[4, 4, 0, 0]} maxBarSize={34} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
