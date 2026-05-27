"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { Loader2 } from "lucide-react";
import { FaFacebook, FaYoutube } from "react-icons/fa";
import { SiInstagram, SiTiktok } from "react-icons/si";

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

const STATUS_META: Record<string, { label: string; color: string }> = {
  PUBLISHED: { label: "Published", color: "#169B7F" },
  SCHEDULED: { label: "Scheduled", color: "#4F86C6" },
};

const EMPTY_TOTALS: AnalyticsData["totals"] = {
  totalCaptionsGenerated: 0,
  postsPublished: 0,
  scheduledPosts: 0,
  connectedAccounts: 0,
};

const EMPTY_STATUS_DISTRIBUTION: AnalyticsData["postStatusDistribution"] = [
  { status: "PUBLISHED", count: 0 },
  { status: "SCHEDULED", count: 0 },
];

function platformMeta(platform: string) {
  return PLATFORM_META[platform.toUpperCase() as keyof typeof PLATFORM_META] ?? null;
}

function formatPlatform(platform: string) {
  const meta = platformMeta(platform);
  if (meta) return meta.label;
  return platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
}

function formatStatus(status: string) {
  return STATUS_META[status]?.label ?? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
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
  description,
}: {
  title: string;
  value: number | null;
  description: string;
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
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-1">{title}</h2>
      {subtitle && <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>}
      {!subtitle && <div className="mb-3" />}
      <Card className="border-none shadow-sm rounded-lg">
        <CardContent className="p-4">{children}</CardContent>
      </Card>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
      {message}
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
      fetch(`/api/dashboard/analytics?range=${dateRange}`).then((response) => response.json()),
      fetch("/api/social/connections").then((response) => response.json()),
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

    return () => {
      ignore = true;
    };
  }, [dateRange]);

  const chartSx = {
    "& .MuiChartsAxis-tickLabel": { fill: "var(--color-muted-foreground) !important", fontSize: 11 },
    "& .MuiChartsAxis-line": { stroke: "var(--color-border) !important" },
    "& .MuiChartsAxis-tick": { stroke: "var(--color-border) !important" },
    "& .MuiChartsGrid-line": { stroke: "var(--color-border)", strokeDasharray: "4 4" },
    "& .MuiChartsLegend-label": { fill: "var(--color-foreground) !important", fontSize: 12 },
  };

  const selectedRange = DATE_RANGES.find((range) => range.value === dateRange) ?? DATE_RANGES[1];
  const hasConnectedAccounts = connections.length > 0;
  const displayTotals = hasConnectedAccounts && data
    ? { ...data.totals, connectedAccounts: connections.length }
    : EMPTY_TOTALS;
  const displayCaptionTrend = hasConnectedAccounts ? data?.captionTrend ?? [] : [];
  const displayPublishingActivity = hasConnectedAccounts ? data?.publishingActivity ?? [] : [];
  const displayPostStatusDistribution = hasConnectedAccounts
    ? data?.postStatusDistribution ?? EMPTY_STATUS_DISTRIBUTION
    : EMPTY_STATUS_DISTRIBUTION;
  const platformEngagement = hasConnectedAccounts
    ? data?.platformEngagement ?? connections.map((account) => ({ platform: account.platform, engagement: 0 }))
    : [];
  const totalPlatformEngagement = platformEngagement.reduce((sum, entry) => sum + entry.engagement, 0);
  const platformPieData = platformEngagement.map((entry, index) => {
    const meta = platformMeta(entry.platform);
    return {
      id: entry.platform,
      value: entry.engagement,
      label: formatPlatform(entry.platform),
      color: meta?.color ?? ["#64748b", "#94a3b8", "#cbd5e1"][index % 3],
    };
  });
  const statusChartData = displayPostStatusDistribution
    .filter((entry) => entry.count > 0)
    .map((entry) => ({
      id: entry.status,
      value: entry.count,
      label: formatStatus(entry.status),
      color: STATUS_META[entry.status]?.color ?? "#64748b",
    })) ?? [];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Analytics</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track content output, publishing, platform mix, and scheduling health.
          </p>
        </div>

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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Captions Generated"
              value={isLoading ? null : displayTotals.totalCaptionsGenerated}
              description={selectedRange.label}
            />
            <StatCard
              title="Posts Published"
              value={isLoading ? null : displayTotals.postsPublished}
              description={selectedRange.label}
            />
            <StatCard
              title="Scheduled Posts"
              value={isLoading ? null : displayTotals.scheduledPosts}
              description={`Next ${selectedRange.shortLabel}`}
            />
            <StatCard
              title="Connected Accounts"
              value={isLoading ? null : displayTotals.connectedAccounts}
              description={selectedRange.label}
            />
          </div>

          {isLoading ? (
            <div className="flex h-[420px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : data ? (
            <>
              <ChartCard title="Caption Generation Trend">
                <LineChart
                  height={300}
                  dataset={displayCaptionTrend}
                  margin={{ top: 20, right: 24, bottom: 28, left: 28 }}
                  xAxis={[{ scaleType: "point", dataKey: "label" }]}
                  yAxis={[{ min: 0 }]}
                  series={[
                    {
                      dataKey: "count",
                      label: "Captions generated",
                      color: TEAL,
                      curve: "monotoneX",
                      showMark: false,
                    },
                  ]}
                  grid={{ horizontal: true }}
                  sx={chartSx}
                />
              </ChartCard>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <ChartCard title="Publishing Activity">
                  <BarChart
                    height={300}
                    dataset={displayPublishingActivity}
                    margin={{ top: 20, right: 24, bottom: 28, left: 28 }}
                    xAxis={[{ scaleType: "band", dataKey: "label" }]}
                    yAxis={[{ min: 0 }]}
                    series={[
                      { dataKey: "captionsGenerated", label: "Captions generated", color: TEAL },
                      { dataKey: "postsPublished", label: "Posts published", color: PUBLISHED_COLOR },
                    ]}
                    grid={{ horizontal: true }}
                    borderRadius={6}
                    sx={chartSx}
                  />
                </ChartCard>

                <ChartCard title="Platform Breakdown" subtitle="Engagement by platform">
                  {platformPieData.length === 0 || totalPlatformEngagement === 0 ? (
                    <EmptyChart message="No engagement by platform in this range." />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-[minmax(220px,280px)_1fr] md:items-center">
                      <PieChart
                        height={280}
                        series={[
                          {
                            data: platformPieData,
                            innerRadius: 58,
                            outerRadius: 104,
                            paddingAngle: 3,
                            cornerRadius: 4,
                          },
                        ]}
                        colors={platformPieData.map((entry) => entry.color)}
                        hideLegend
                      />

                      <div className="min-w-0 space-y-3">
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
                              <span className="min-w-0 truncate text-foreground">{formatPlatform(entry.platform)}</span>
                              <span className="text-xs tabular-nums text-muted-foreground">{entry.engagement}</span>
                              <span
                                className="min-w-[46px] rounded-md border px-2 py-0.5 text-center text-xs font-semibold tabular-nums"
                                style={{ color, borderColor: `${color}55`, backgroundColor: `${color}12` }}
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

              <ChartCard title="Post Status Distribution">
                {statusChartData.length === 0 ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {displayPostStatusDistribution.map((entry) => {
                      const meta = STATUS_META[entry.status] ?? { label: formatStatus(entry.status), color: "#64748b" };
                      return (
                        <div key={entry.status} className="rounded-lg border border-border bg-muted/30 p-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: meta.color }}
                            />
                            <p className="text-xs font-medium text-muted-foreground">{meta.label}</p>
                          </div>
                          <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">0</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-[minmax(220px,300px)_1fr] md:items-center">
                    <PieChart
                      height={280}
                      series={[
                        {
                          data: statusChartData,
                          innerRadius: 58,
                          outerRadius: 104,
                          paddingAngle: 3,
                          cornerRadius: 4,
                        },
                      ]}
                      colors={statusChartData.map((entry) => entry.color)}
                      hideLegend
                    />

                    <div className="grid gap-3 sm:grid-cols-3">
                      {displayPostStatusDistribution.map((entry) => {
                        const meta = STATUS_META[entry.status] ?? { label: formatStatus(entry.status), color: "#64748b" };
                        return (
                          <div key={entry.status} className="rounded-lg border border-border bg-muted/30 p-4">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: meta.color }}
                              />
                              <p className="text-xs font-medium text-muted-foreground">{meta.label}</p>
                            </div>
                            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{entry.count}</p>
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
