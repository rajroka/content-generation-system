"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface AnalyticsData {
  total: number;
  platformCount: Record<string, number>;
  toneCount: Record<string, number>;
  topHashtags: { tag: string; count: number }[];
  last7Days: Record<string, number>;
}

const PIE_COLORS = ["#a855f7", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
        <p className="text-white text-sm">{label}</p>
        <p className="text-purple-400 text-sm font-bold">{payload[0].value} posts</p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Loading analytics...
      </div>
    );
  }

  const activityData = data
    ? Object.entries(data.last7Days).map(([day, count]) => ({ day, count }))
    : [];

  const platformData = data
    ? Object.entries(data.platformCount).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const toneData = data
    ? Object.entries(data.toneCount).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
      <p className="text-slate-400 text-sm mb-8">
        Your content creation patterns and insights
      </p>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Content Generated", value: data?.total || 0, color: "text-purple-400" },
          { label: "Platforms Used", value: Object.keys(data?.platformCount || {}).length, color: "text-blue-400" },
          { label: "Unique Hashtags Used", value: data?.topHashtags?.length || 0, color: "text-pink-400" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-2">{s.label}</p>
            <p className={`text-4xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Activity Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-1">
            Content Activity (Last 7 Days)
          </h3>
          <p className="text-slate-500 text-xs mb-5">Posts generated per day</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activityData} barSize={28}>
              <XAxis
                dataKey="day"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#a855f7" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-1">Platform Distribution</h3>
          <p className="text-slate-500 text-xs mb-5">Content by platform</p>
          {platformData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
              No data yet — start generating content
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="40%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {platformData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  formatter={(value) => (
                    <span style={{ color: "#94a3b8", fontSize: 12, textTransform: "capitalize" }}>
                      {value}
                    </span>
                  )}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "none",
                    borderRadius: 8,
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tone Usage */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-5">
        <h3 className="text-white font-semibold mb-1">Tone Usage</h3>
        <p className="text-slate-500 text-xs mb-5">Which tones you use most</p>
        {toneData.length === 0 ? (
          <p className="text-slate-500 text-sm">No data yet</p>
        ) : (
          <div className="space-y-3">
            {toneData
              .sort((a, b) => b.value - a.value)
              .map((t, i) => {
                const maxVal = Math.max(...toneData.map((d) => d.value));
                const pct = Math.round((t.value / maxVal) * 100);
                return (
                  <div key={t.name} className="flex items-center gap-4">
                    <span className="text-slate-400 text-sm capitalize w-28 shrink-0">
                      {t.name}
                    </span>
                    <div className="flex-1 bg-slate-800 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-slate-400 text-sm w-8 text-right">
                      {t.value}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Top Hashtags */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-1">Most Used Hashtags</h3>
        <p className="text-slate-500 text-xs mb-5">
          Your most frequently generated hashtags
        </p>
        {!data?.topHashtags?.length ? (
          <p className="text-slate-500 text-sm">
            Generate some content to see hashtag analytics
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.topHashtags.map((h) => (
              <div
                key={h.tag}
                className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg"
              >
                <span className="text-purple-300 text-sm">{h.tag}</span>
                <span className="text-slate-500 text-xs bg-slate-700 px-1.5 py-0.5 rounded">
                  {h.count}x
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
