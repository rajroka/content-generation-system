"use client";
import { useState } from "react";
import { Clock, Loader2, CalendarDays } from "lucide-react";

const platforms = ["instagram", "twitter", "linkedin", "facebook", "tiktok"];

const engagementColor: Record<string, string> = {
  "Very High": "text-green-400 bg-green-400/10 border-green-400/20",
  High: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  Medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  Low: "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

interface PlanItem {
  day: string;
  time: string;
  reason: string;
  engagement: string;
}

export default function PlanPage() {
  const [platform, setPlatform] = useState("instagram");
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      const data = await res.json();
      setPlan(data.plan || []);
      setGenerated(true);
    } catch {
      alert("Failed to generate plan. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Posting Plan</h1>
      <p className="text-slate-400 text-sm mb-8">
        AI-recommended best times to post for maximum engagement
      </p>

      {/* Platform Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <label className="text-slate-300 text-sm font-medium block mb-3">
          Select Platform
        </label>
        <div className="flex gap-2 flex-wrap mb-5">
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => { setPlatform(p); setGenerated(false); }}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition ${
                platform === p
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <CalendarDays size={16} />
          )}
          {loading ? "Generating plan..." : `Generate ${platform} Schedule`}
        </button>
      </div>

      {/* Plan Table */}
      {generated && plan.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800">
            <h2 className="text-white font-semibold capitalize">
              Best Posting Times for {platform}
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Based on platform engagement patterns
            </p>
          </div>

          <div className="divide-y divide-slate-800">
            {plan.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-5 hover:bg-slate-800/50 transition"
              >
                <div className="w-24 shrink-0">
                  <p className="text-white font-semibold text-sm">{item.day}</p>
                </div>
                <div className="flex items-center gap-2 w-24 shrink-0">
                  <Clock size={14} className="text-purple-400" />
                  <span className="text-purple-300 font-mono text-sm font-semibold">
                    {item.time}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-slate-300 text-sm">{item.reason}</p>
                </div>
                <div className="shrink-0">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                      engagementColor[item.engagement] ||
                      "text-slate-400 bg-slate-400/10 border-slate-400/20"
                    }`}
                  >
                    {item.engagement}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 border-t border-slate-800 bg-slate-800/30">
            <p className="text-slate-500 text-xs">
              💡 These times are in your local timezone. Adjust based on where your target audience is located.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
