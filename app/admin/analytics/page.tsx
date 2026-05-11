"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  FileText,
  DollarSign,
  RefreshCw,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";

interface AnalyticsData {
  dailyGenerations: Array<{ date: string; count: number }>;
  platformDistribution: Array<{ platform: string; count: number }>;
  toneDistribution: Array<{ tone: string; count: number }>;
  userGrowth: Array<{ date: string; users: number }>;
  revenueData: Array<{ month: string; revenue: number }>;
  totalStats: {
    totalUsers: number;
    totalGenerations: number;
    totalImages: number;
    proUsers: number;
    monthlyRevenue: number;
  };
}

// Flat accent colors — no gradients
const CHART_COLORS = {
  blue: "#3b82f6",
  purple: "#8b5cf6",
  green: "#22c55e",
  amber: "#f59e0b",
  pie: ["#3b82f6", "#8b5cf6", "#ef4444", "#22c55e", "#f59e0b", "#ec4899"],
};

// Shared tooltip style — adapts via CSS vars set on :root / .dark
const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  color: "hsl(var(--popover-foreground))",
  fontSize: "12px",
};

const axisStyle = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };
const gridStyle = { stroke: "hsl(var(--border))", strokeDasharray: "3 3" };

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/analytics");
      const analyticsData = await response.json();
      if (!response.ok) {
        throw new Error(analyticsData?.error || "Failed to fetch analytics");
      }
      setData(analyticsData);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch analytics"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-1/4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 md:p-6">
        <Card>
          <CardContent className="py-16 text-center">
            <p className="font-medium">Analytics could not be loaded</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Refresh the page or try again in a moment.
            </p>
            <Button className="mt-4" onClick={fetchAnalytics}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Users",
      value: data.totalStats.totalUsers.toLocaleString(),
      icon: Users,
      description: "Registered accounts",
      accent: "text-blue-500",
      bg: "",
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
    },
    {
      title: "Total Generations",
      value: data.totalStats.totalGenerations.toLocaleString(),
      icon: FileText,
      description: "Non-deleted generations",
      accent: "text-purple-500",
      bg: "",
      iconBg: "bg-purple-100 dark:bg-purple-900/50",
    },
    {
      title: "Monthly Revenue",
      value: `$${data.totalStats.monthlyRevenue.toFixed(0)}`,
      icon: DollarSign,
      description: `${data.totalStats.proUsers} Pro users`,
      accent: "text-amber-500",
      bg: "",
      iconBg: "bg-amber-100 dark:bg-amber-900/50",
    },
  ] as const;

  // Chart card config — colors match stat cards
  const chartCards = [
    {
      title: "Daily Generations",
      subtitle: "Last 30 days",
      icon: TrendingUp,
      accent: "text-blue-500",
      bg: "",
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
      color: CHART_COLORS.blue,
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.dailyGenerations}
            margin={{ top: 5, right: 8, left: -20, bottom: 5 }}
          >
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="count"
              stroke={CHART_COLORS.blue}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: CHART_COLORS.blue }}
            />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "Platform Distribution",
      subtitle: "Content breakdown",
      icon: PieChartIcon,
      accent: "text-purple-500",
      bg: "",
      iconBg: "bg-purple-100 dark:bg-purple-900/50",
      color: CHART_COLORS.purple,
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.platformDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ platform, percent }) =>
                `${platform} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius="70%"
              innerRadius="35%"
              dataKey="count"
            >
              {data.platformDistribution.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS.pie[index % CHART_COLORS.pie.length]}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "User Growth",
      subtitle: "Last 30 days",
      icon: Users,
      accent: "text-green-500",
      bg: "",
      iconBg: "bg-green-100 dark:bg-green-900/50",
      color: CHART_COLORS.green,
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.userGrowth}
            margin={{ top: 5, right: 8, left: -20, bottom: 5 }}
          >
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar
              dataKey="users"
              fill={CHART_COLORS.green}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "Revenue (MRR)",
      subtitle: "Monthly recurring revenue",
      icon: Activity,
      accent: "text-amber-500",
      bg: "",
      iconBg: "bg-amber-100 dark:bg-amber-900/50",
      color: CHART_COLORS.amber,
      chart: (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.revenueData}
            margin={{ top: 5, right: 8, left: -20, bottom: 5 }}
          >
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke={CHART_COLORS.amber}
              strokeWidth={2}
              dot={{ r: 4, fill: CHART_COLORS.amber, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: CHART_COLORS.amber }}
            />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
  ] as const;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Platform metrics and performance insights
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAnalytics} className="w-fit">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className={`border-0 shadow-sm ${stat.bg} transition-shadow hover:shadow-md`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`w-4 h-4 ${stat.accent}`} />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chartCards.map((card) => (
          <Card
            key={card.title}
            className={`border-0 shadow-sm ${card.bg} transition-shadow hover:shadow-md`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <div>
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {card.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{card.subtitle}</p>
              </div>
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <card.icon className={`w-4 h-4 ${card.accent}`} />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {/* Fixed height container — charts scale within */}
              <div className="h-56 sm:h-64 w-full">
                {card.chart}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}