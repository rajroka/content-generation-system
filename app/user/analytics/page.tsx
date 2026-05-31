"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { FaFacebook, FaYoutube } from "react-icons/fa";
import { SiInstagram, SiTiktok } from "react-icons/si";
import { toast } from "react-hot-toast";
import {
  LineChart,
  Line,
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
  postStatusDistribution: { status: string; count: number }[];
}

const TEAL = "var(--color-primary)";
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

interface UsageData {
  captions: number;
  captionLimit: number | null;
  schedules: number;
  scheduleLimit: number | null;
  plan: string;
}

// ── Circular gauge ────────────────────────────────────────────────────────────
function CircularGauge({
  used,
  limit,
  color,
  isPro,
  label,
}: {
  used: number;
  limit: number | null;
  color: string;
  isPro: boolean;
  label: string;
}) {
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const fullCirc = 2 * Math.PI * radius;

  const gapDeg = 60;
  const sweepDeg = 360 - gapDeg;
  const arcLen = (sweepDeg / 360) * fullCirc;

  const pct = isPro ? 1 : limit ? Math.min(used / limit, 1) : 0;
  const filledArc = pct * arcLen;

  const svgRotation = 150;

  const dotAngleRad = ((svgRotation + pct * sweepDeg) * Math.PI) / 180;
  const dotCx = size / 2 + radius * Math.cos(dotAngleRad);
  const dotCy = size / 2 + radius * Math.sin(dotAngleRad);

  const centerLabel = isPro ? "∞" : String(used);
  const subLabel = isPro ? "Unlimited" : limit !== null ? `/ ${limit}` : "";

  return (
    <div className="flex flex-col items-center gap-2 min-w-0">
      <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: `rotate(${svgRotation}deg)` }}
          className="absolute inset-0"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLen} ${fullCirc}`}
            strokeLinecap="round"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${filledArc} ${fullCirc}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1)" }}
          />
          {filledArc > 2 && (
            <circle cx={dotCx} cy={dotCy} r={strokeWidth / 2 + 1} fill={color} />
          )}
        </svg>

        <div className="flex flex-col items-center z-10 select-none">
          <span className="text-xl font-bold leading-none text-foreground tabular-nums">
            {centerLabel}
          </span>
          {subLabel && (
            <span className="text-xs text-muted-foreground mt-1 tabular-nums leading-none">
              {subLabel}
            </span>
          )}
        </div>
      </div>

      <span className="text-xs text-muted-foreground text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track whether we've already shown the limit-hit toast this session
  const captionLimitToastShown = useRef(false);
  const scheduleLimitToastShown = useRef(false);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/dashboard/analytics?range=${dateRange}`, { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/user/usage", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([analyticsPayload, usagePayload]) => {
        if (analyticsPayload.error) throw new Error(analyticsPayload.error);
        if (!ignore) {
          setData(analyticsPayload);
          if (!usagePayload.error) {
            setUsage(usagePayload);

            // Fire toast if caption limit is hit (FREE plan only)
            if (
              usagePayload.plan === "FREE" &&
              usagePayload.captionLimit !== null &&
              usagePayload.captions >= usagePayload.captionLimit &&
              !captionLimitToastShown.current
            ) {
              captionLimitToastShown.current = true;
              toast.error(
                `Daily caption limit reached (${usagePayload.captionLimit}/day). Upgrade to Pro for unlimited captions.`,
                {
                  duration: 6000,
                  icon: "🚫",
                }
              );
            }

            // Fire toast if schedule limit is hit (FREE plan only)
            if (
              usagePayload.plan === "FREE" &&
              usagePayload.scheduleLimit !== null &&
              usagePayload.schedules >= usagePayload.scheduleLimit &&
              !scheduleLimitToastShown.current
            ) {
              scheduleLimitToastShown.current = true;
              toast.error(
                `Monthly schedule limit reached (${usagePayload.scheduleLimit}/month). Upgrade to Pro for unlimited scheduling.`,
                {
                  duration: 6000,
                  icon: "📅",
                }
              );
            }
          }
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

  const publishingActivity = data?.publishingActivity ?? [];
  const tickInterval = publishingActivity.length > 14 ? Math.ceil(publishingActivity.length / 10) : 1;
  const hasAnyActivity = publishingActivity.some(
    (d) => d.captionsGenerated > 0 || d.postsPublished > 0
  );

  const platformPieData = (() => {
    const breakdown = data?.platformBreakdown ?? [];
    const countMap: Record<string, number> = {};
    for (const entry of breakdown) {
      countMap[entry.platform.toUpperCase()] = entry.count;
    }
    // Always show all 4 platforms, even with 0 count
    return (["INSTAGRAM", "FACEBOOK", "TIKTOK", "YOUTUBE"] as const).map((platform) => {
      const meta = platformMeta(platform);
      return {
        name: formatPlatform(platform),
        value: countMap[platform] ?? 0,
        color: meta?.color ?? "#64748b",
        platform,
      };
    });
  })();
  const totalPlatformCount = platformPieData.reduce((sum, e) => sum + e.value, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-xl font-bold text-foreground">Analytics</h1>

        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          {DATE_RANGES.map((range) => (
            <button
              key={range.value}
              type="button"
              onClick={() => setDateRange(range.value)}
              className={[
                "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap",
                dateRange === range.value
                  ? "bg-primary text-white"
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
              value={isLoading ? null : data?.totals.totalCaptionsGenerated ?? 0}
            />
            <StatCard
              title="Posts Published"
              value={isLoading ? null : data?.totals.postsPublished ?? 0}
            />
            <StatCard
              title="Scheduled Posts"
              value={isLoading ? null : data?.totals.scheduledPosts ?? 0}
            />
            <StatCard
              title="Connected Accounts"
              value={isLoading ? null : data?.totals.connectedAccounts ?? 0}
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
                {publishingActivity.length === 0 ? (
                  <EmptyChart message="No activity data available." />
                ) : (
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={360}>
                      <LineChart
                        data={publishingActivity}
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
                    {!hasAnyActivity && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-sm text-muted-foreground bg-card/80 px-3 py-1.5 rounded-md">
                          No activity yet in this range
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </ChartCard>

              {/* Popular Platforms + Caption Limit — side by side */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Popular Platforms */}
                <ChartCard title="Popular Platforms">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <div className="flex-shrink-0 flex justify-center">
                      <ResponsiveContainer width={220} height={220}>
                        <PieChart>
                          <Pie
                            data={
                              totalPlatformCount === 0
                                ? [{ name: "No data", value: 1, color: "var(--color-muted)" }]
                                : platformPieData
                            }
                            cx="50%"
                            cy="50%"
                            innerRadius={58}
                            outerRadius={95}
                            paddingAngle={totalPlatformCount === 0 ? 0 : 3}
                            dataKey="value"
                          >
                            {(totalPlatformCount === 0
                              ? [{ color: "var(--color-muted)" }]
                              : platformPieData
                            ).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          {totalPlatformCount > 0 && <Tooltip content={<PieTooltip />} />}
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex-1 space-y-3 min-w-0">
                      {platformPieData.map((entry) => (
                        <div
                          key={entry.platform}
                          className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3 text-sm"
                        >
                          <PlatformIcon platform={entry.platform} />
                          <span className="min-w-0 truncate text-foreground">
                            {entry.name}
                          </span>
                          <span
                            className="min-w-[46px] rounded-md border px-2 py-0.5 text-center text-xs font-semibold tabular-nums"
                            style={
                              entry.value > 0
                                ? {
                                    color: entry.color,
                                    borderColor: `${entry.color}55`,
                                    backgroundColor: `${entry.color}12`,
                                  }
                                : undefined
                            }
                          >
                            {entry.value}
                          </span>
                        </div>
                      ))}
                      {totalPlatformCount === 0 && (
                        <p className="text-xs text-muted-foreground pt-1">
                          Publish posts to see platform breakdown
                        </p>
                      )}
                    </div>
                  </div>
                </ChartCard>

                {/* Caption Limit */}
                <ChartCard title="Caption Limit">
                  <div className="flex flex-col gap-4">
                    {/* Two gauges side by side */}
                    <div className="grid grid-cols-2 gap-2 divide-x divide-border">
                      {/* Daily Caption gauge */}
                      <div className="flex flex-col items-center py-4 px-2">
                        <CircularGauge
                          used={usage?.captions ?? 0}
                          limit={usage?.captionLimit ?? null}
                          color="var(--color-primary)"
                          isPro={usage?.plan === "PRO"}
                          label="Daily captions"
                        />
                        {usage?.plan === "FREE" &&
                          usage.captionLimit !== null &&
                          usage.captions >= usage.captionLimit && (
                            <button
                              onClick={() => window.location.href = "/pricing"}
                              className="mt-2 text-[10px] font-semibold text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
                            >
                              Upgrade →
                            </button>
                          )}
                      </div>

                      {/* Monthly Schedule gauge */}
                      <div className="flex flex-col items-center py-4 px-2">
                        <CircularGauge
                          used={usage?.schedules ?? 0}
                          limit={usage?.scheduleLimit ?? null}
                          color="#4F86C6"
                          isPro={usage?.plan === "PRO"}
                          label="Monthly schedules"
                        />
                        {usage?.plan === "FREE" &&
                          usage.scheduleLimit !== null &&
                          usage.schedules >= usage.scheduleLimit && (
                            <button
                              onClick={() => window.location.href = "/pricing"}
                              className="mt-2 text-[10px] font-semibold text-[#4F86C6] underline underline-offset-2 hover:opacity-80 transition-opacity"
                            >
                              Upgrade →
                            </button>
                          )}
                      </div>
                    </div>

                    {/* Reset note */}
                    {usage?.plan === "FREE" && (
                      <p className="text-center text-xs text-muted-foreground border-t border-border pt-3">
                        Captions reset every 24h · Schedules reset monthly
                      </p>
                    )}
                  </div>
                </ChartCard>
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
