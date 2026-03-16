"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, FileText, Hash, Image, TrendingUp } from "lucide-react";

interface AnalyticsData {
  total: number;
  platformCount: Record<string, number>;
  toneCount: Record<string, number>;
  recentContents: Array<{
    id: string;
    topic: string;
    platform: string;
    tone: string;
    createdAt: string;
    imageUrl?: string;
  }>;
}

const platformEmoji: Record<string, string> = {
  instagram: "📸",
  twitter: "🐦",
  linkedin: "💼",
  facebook: "👥",
  tiktok: "🎵",
};

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const topPlatform =
    analytics?.platformCount
      ? Object.entries(analytics.platformCount).sort(([, a], [, b]) => b - a)[0]?.[0]
      : null;

  const stats = [
    {
      label: "Total Generated",
      value: analytics?.total || 0,
      icon: FileText,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Platforms Used",
      value: Object.keys(analytics?.platformCount || {}).length,
      icon: TrendingUp,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      label: "Top Platform",
      value: topPlatform ? platformEmoji[topPlatform] + " " + topPlatform : "—",
      icon: Hash,
      color: "text-pink-400",
      bg: "bg-pink-400/10",
      isText: true,
    },
    {
      label: "Recent (5)",
      value: analytics?.recentContents?.length || 0,
      icon: Image,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-slate-400 text-sm mt-1">
            Your content generation summary
          </p>
        </div>
        <Link
          href="/dashboard/generate"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <PlusCircle size={16} />
          New Content
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                {stat.label}
              </span>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={stat.color} size={16} />
              </div>
            </div>
            <span
              className={`font-bold text-white ${
                stat.isText ? "text-lg capitalize" : "text-3xl"
              }`}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            href: "/dashboard/generate",
            label: "Generate New Content",
            desc: "Create captions, hashtags & images",
            icon: PlusCircle,
            color: "bg-purple-600/20 border-purple-600/30 hover:bg-purple-600/30",
            iconColor: "text-purple-400",
          },
          {
            href: "/dashboard/history",
            label: "View History",
            desc: "Browse all your saved content",
            icon: FileText,
            color: "bg-blue-600/20 border-blue-600/30 hover:bg-blue-600/30",
            iconColor: "text-blue-400",
          },
          {
            href: "/dashboard/plan",
            label: "Posting Plan",
            desc: "Best times to post per platform",
            icon: TrendingUp,
            color: "bg-green-600/20 border-green-600/30 hover:bg-green-600/30",
            iconColor: "text-green-400",
          },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`${action.color} border rounded-xl p-5 transition block`}
          >
            <action.icon className={`${action.iconColor} mb-3`} size={22} />
            <p className="text-white font-semibold text-sm mb-1">
              {action.label}
            </p>
            <p className="text-slate-400 text-xs">{action.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold">Recent Content</h2>
          <Link
            href="/dashboard/history"
            className="text-purple-400 text-xs hover:text-purple-300"
          >
            View all →
          </Link>
        </div>

        {!analytics?.recentContents?.length ? (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-3">No content generated yet.</p>
            <Link
              href="/dashboard/generate"
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              Create your first post →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {analytics.recentContents.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-4 p-3 bg-slate-800 rounded-lg"
              >
                {c.imageUrl ? (
                  <img
                    src={c.imageUrl}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-slate-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {c.topic}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5 capitalize">
                    {platformEmoji[c.platform]} {c.platform} • {c.tone}
                  </p>
                </div>
                <span className="text-slate-500 text-xs shrink-0">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
