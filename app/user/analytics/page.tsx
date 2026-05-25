"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  postStatusDistribution: { status: string; count: number }[];
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
  DRAFT:     { label: "Draft",     color: "#A78BFA" },
};

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
      <CardContent className="p-5">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-2 text-3xl font-bold text-foreground tabular-nums">
          {value === null ? "..." : value}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
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
    <Card className="border-none shadow-sm rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    setError(null);

    fetch(`/api/dashboard/analytics?range=${dateRange}`)
      .then((response) => response.json())
      .then((payload) => {
        if (payload.error) throw new Error(payload.error);
        if (!ignore) setData(payload);
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
    "& .MuiChartsAxis-tickLabel": { fill: "hsl(var(--muted-foreground)) !important", fontSize: 11 },
    "& .MuiChartsAxis-line": { stroke: "hsl(var(--border)) !important" },
    "& .MuiChartsAxis-tick": { stroke: "hsl(var(--border)) !important" },
    "& .MuiChartsGrid-line": { stroke: "hsl(var(--border))", strokeDasharray: "4 4" },
    "& .MuiChartsLegend-label": { fill: "hsl(var(--foreground)) !important", fontSize: 12 },
  };

  const selectedRange = DATE_RANGES.find((range) => range.value === dateRange) ?? DATE_RANGES[1];
  const totalPlatformCount = data?.platformBreakdown.reduce((sum, entry) => sum + entry.count, 0) ?? 0;
  const platformPieData = data?.platformBreakdown.map((entry, index) => {
    const meta = platformMeta(entry.platform);
    return {
      id: entry.platform,
      value: entry.count,
      label: formatPlatform(entry.platform),
      color: meta?.color ?? ["#64748b", "#94a3b8", "#cbd5e1"][index % 3],
    };
  }) ?? [];
  const statusChartData = data?.postStatusDistribution
    .filter((entry) => entry.count > 0)
    .map((entry) => ({
      id: entry.status,
      value: entry.count,
      label: formatStatus(entry.status),
      color: STATUS_META[entry.status]?.color ?? "#64748b",
    })) ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
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
              value={data?.totals.totalCaptionsGenerated ?? null}
              description={selectedRange.label}
            />
            <StatCard
              title="Posts Published"
              value={data?.totals.postsPublished ?? null}
              description={selectedRange.label}
            />
            <StatCard
              title="Scheduled Posts"
              value={data?.totals.scheduledPosts ?? null}
              description={`Next ${selectedRange.shortLabel}`}
            />
            <StatCard
              title="Connected Accounts"
              value={data?.totals.connectedAccounts ?? null}
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
                {data.captionTrend.every((entry) => entry.count === 0) ? (
                  <EmptyChart message="No captions generated in this range." />
                ) : (
                  <LineChart
                    height={300}
                    dataset={data.captionTrend}
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
                )}
              </ChartCard>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <ChartCard title="Publishing Activity">
                  {data.publishingActivity.every(
                    (entry) => entry.captionsGenerated === 0 && entry.postsPublished === 0
                  ) ? (
                    <EmptyChart message="No publishing activity in this range." />
                  ) : (
                    <BarChart
                      height={300}
                      dataset={data.publishingActivity}
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
                  )}
                </ChartCard>

                <ChartCard title="Platform Breakdown">
                  {platformPieData.length === 0 ? (
                    <EmptyChart message="No posts by platform in this range." />
                  ) : (
                    <div className="grid gap-6 md:grid-cols-[minmax(220px,280px)_1fr] md:items-center">
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
                        {data.platformBreakdown.map((entry) => {
                          const pct = totalPlatformCount > 0
                            ? Math.round((entry.count / totalPlatformCount) * 100)
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
                              <span className="text-xs tabular-nums text-muted-foreground">{entry.count}</span>
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
                  <EmptyChart message="No post status data in this range." />
                ) : (
                  <div className="grid gap-6 md:grid-cols-[minmax(220px,300px)_1fr] md:items-center">
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
                      {data.postStatusDistribution.map((entry) => {
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
