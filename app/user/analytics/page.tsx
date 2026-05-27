"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { FaFacebook, FaYoutube } from "react-icons/fa";
import { SiInstagram, SiTiktok } from "react-icons/si";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type DateRange = "7d" | "30d" | "90d";

interface AnalyticsData {
  range: DateRange;
  totals: {
    totalCaptionsGenerated: number;
    postsPublished: number;
    scheduledPosts: number;
    connectedAccounts: number;
  };
  captionTrend: { date: string; label: string; count: number }[];
  publishingActivity: {
    date: string;
    label: string;
    captionsGenerated: number;
    postsPublished: number;
  }[];
  platformBreakdown: { platform: string; count: number }[];
  platformEngagement?: PlatformEngagement[];
  postStatusDistribution: { status: string; count: number }[];
}

interface ConnectedAccount {
  platform: string;
  accountName: string | null;
  isActive: boolean;
  connectedAt: string;
}

interface PlatformEngagement {
  platform: string;
  engagement: number;
}

const TEAL = "#169B7F";
const PUBLISHED_COLOR = "#4F86C6";

const DATE_RANGES: { value: DateRange; label: string; shortLabel: string }[] = [
  { value: "7d", label: "Last 7 days", shortLabel: "7 days" },
  { value: "30d", label: "Last 30 days", shortLabel: "30 days" },
  { value: "90d", label: "Last 90 days", shortLabel: "90 days" },
];

const PLATFORM_META = {
  INSTAGRAM: { label: "Instagram", color: "#E1306C", Icon: SiInstagram },
  FACEBOOK:  { label: "Facebook",  color: "#1877F2", Icon: FaFacebook },
  TIKTOK:    { label: "TikTok",    color: "#69C9D0", Icon: SiTiktok },
  YOUTUBE:   { label: "YouTube",   color: "#FF0000", Icon: FaYoutube },
} as const;

const EMPTY_TOTALS: AnalyticsData["totals"] = {
  totalCaptionsGenerated: 0,
  postsPublished: 0,
  scheduledPosts: 0,
  connectedAccounts: 0,
};

function platformMeta(platform: string) {
  return PLATFORM_META[platform.toUpperCase() as keyof typeof PLATFORM_META] ?? null;
}

function formatPlatform(platform: string) {
  const meta = platformMeta(platform);
  if (meta) return meta.label;
  return platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
}

function PlatformIcon({ platform, className = "w-4 h-4" }: { platform: string; className?: string }) {
  const meta = platformMeta(platform);
  if (!meta) return <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/50" />;
  const Icon = meta.Icon;
  return <Icon className={className} style={{ color: meta.color }} />;
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number | null;
}) {
  return (
    <Card className="border-none shadow-sm rounded-lg">
      <CardContent className="p-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {value === null ? (
          <div className="mt-3 h-8 w-20 animate-pulse rounded-lg bg-muted" />
        ) : (
          <p className="mt-2 text-2xl font-bold text-foreground tabular-nums">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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

// Custom tooltip for recharts
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
      <p style={{ color: payload[0].payload.color }} className="font-semibold">
        {payload[0].name}
      </p>
      <p className="text-foreground font-bold">{payload[0].value} posts</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [connections, setConnections] = useState<ConnectedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/dashboard/analytics?range=${dateRange}`).then((r) => r.json()),
      fetch("/api/social/connections").then((r) => r.json()),
    ])
      .then(([analyticsPayload, connectionsPayload]) => {
        if (analyticsPayload.error) throw new Error(analyticsPayload.error);
        if (!ignore) {
          setData(analyticsPayload);
          setConnections(Array.isArray(connectionsPayload) ? connectionsPayload : []);
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => { ignore = true; };
  }, [dateRange]);

  const selectedRange = DATE_RANGES.find((r) => r.value === dateRange) ?? DATE_RANGES[1];
  const hasConnectedAccounts = connections.length > 0;

  const displayTotals = hasConnectedAccounts && data
    ? { ...data.totals, connectedAccounts: connections.length }
    : EMPTY_TOTALS;

  const displayPublishingActivity = hasConnectedAccounts ? data?.publishingActivity ?? [] : [];

  const platformEngagement = hasConnectedAccounts
    ? data?.platformEngagement ?? connections.map((a) => ({ platform: a.platform, engagement: 0 }))
    : [];

  const totalPlatformEngagement = platformEngagement.reduce((sum, e) => sum + e.engagement, 0);

  const platformPieData = platformEngagement.map((entry, index) => {
    const meta = platformMeta(entry.platform);
    return {
      name: formatPlatform(entry.platform),
      value: entry.engagement,
      color: meta?.color ?? ["#64748b", "#94a3b8", "#cbd5e1"][index % 3],
      platform: entry.platform,
    };
  });

  // Thinned x-axis labels for readability
  const activityLabels = displayPublishingActivity.map((d) => d.label);
  const tickInterval = activityLabels.length > 14 ? Math.ceil(activityLabels.length / 10) : 1;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-xl font-bold text-foreground">Analytics</h1>

        <div className="inline-flex w-full sm:w-auto rounded-lg border border-border bg-card p-1">
          {DATE_RANGES.map((range) => (
            <button
              key={range.value}
              type="button"
              onClick={() => setDateRange(range.value)}
              className={[
                "flex-1 sm:flex-none rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                dateRange === range.value
                  ? "bg-[#169B7F] text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              ].join(" ")}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
          Failed to load analytics. Try refreshing.
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatCard
              title="Total Captions Generated"
              value={isLoading ? null : displayTotals.totalCaptionsGenerated}
            />
            <StatCard
              title="Posts Published"
              value={isLoading ? null : displayTotals.postsPublished}
            />
            <StatCard
              title="Scheduled Posts"
              value={isLoading ? null : displayTotals.scheduledPosts}
            />
            <StatCard
              title="Connected Accounts"
              value={isLoading ? null : displayTotals.connectedAccounts}
            />
          </div>

          {isLoading ? (
            <div className="flex h-[420px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : data ? (
            <>
              {/* Publishing Activity — full width, large */}
              <ChartCard title="Publishing Activity">
                {displayPublishingActivity.length === 0 ? (
                  <EmptyChart message="No publishing activity in this range." />
                ) : (
                  <ResponsiveContainer width="100%" height={360}>
                    <LineChart
                      data={displayPublishingActivity}
                      margin={{ top: 10, right: 16, bottom: 8, left: 0 }}
                    >
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
                        dataKey="captionsGenerated"
                        name="Captions Generated"
                        stroke={TEAL}
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, fill: TEAL }}
                      />
                      <Line
                        type="monotone"
                        dataKey="postsPublished"
                        name="Posts Published"
                        stroke={PUBLISHED_COLOR}
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, fill: PUBLISHED_COLOR }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              {/* Platform Breakdown */}
              <ChartCard title="Platform Breakdown">
                {platformPieData.length === 0 || totalPlatformEngagement === 0 ? (
                  <EmptyChart message="No platform data in this range." />
                ) : (
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <div className="flex-shrink-0 flex justify-center">
                      <ResponsiveContainer width={260} height={260}>
                        <PieChart>
                          <Pie
                            data={platformPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={68}
                            outerRadius={110}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {platformPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<PieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex-1 space-y-3 min-w-0">
                      {platformEngagement.map((entry) => {
                        const pct = totalPlatformEngagement > 0
                          ? Math.round((entry.engagement / totalPlatformEngagement) * 100)
                          : 0;
                        const meta = platformMeta(entry.platform);
                        const color = meta?.color ?? "#64748b";

                        return (
                          <div
                            key={entry.platform}
                            className="grid grid-cols-[20px_minmax(0,1fr)_auto_auto] items-center gap-3 text-sm"
                          >
                            <PlatformIcon platform={entry.platform} />
                            <span className="min-w-0 truncate text-foreground">
                              {formatPlatform(entry.platform)}
                            </span>
                            <span className="text-xs tabular-nums text-muted-foreground">
                              {entry.engagement}
                            </span>
                            <span
                              className="min-w-[46px] rounded-md border px-2 py-0.5 text-center text-xs font-semibold tabular-nums"
                              style={{
                                color,
                                borderColor: `${color}55`,
                                backgroundColor: `${color}12`,
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
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
