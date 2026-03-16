"use client";
import { useEffect, useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { toast } from "sonner";

interface Content {
  id: string;
  topic: string;
  platform: string;
  tone: string;
  titles: string[];
  captions: string[];
  hashtags: string[];
  imageUrl?: string;
  createdAt: string;
}

const platformEmoji: Record<string, string> = {
  instagram: "📸",
  twitter: "🐦",
  linkedin: "💼",
  facebook: "👥",
  tiktok: "🎵",
};

export default function HistoryPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((data) => {
        setContents(data.contents || []);
        setLoading(false);
      });
  }, []);

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied!");
  };

  const platforms = ["all", ...new Set(contents.map((c) => c.platform))];
  const filtered =
    filter === "all" ? contents : contents.filter((c) => c.platform === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Loading history...
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Content History</h1>
      <p className="text-slate-400 text-sm mb-6">
        All your saved content — {contents.length} total
      </p>

      {/* Platform Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {platforms.map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition ${
              filter === p
                ? "bg-purple-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {p !== "all" && platformEmoji[p]} {p}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <FileText size={40} className="mx-auto mb-4 opacity-30" />
          <p>No content found.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
          >
            {/* Header Row */}
            <button
              className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/50 transition"
              onClick={() => setExpanded(expanded === c.id ? null : c.id)}
            >
              <div className="flex items-center gap-4">
                {c.imageUrl ? (
                  <img
                    src={c.imageUrl}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-slate-500" />
                  </div>
                )}
                <div>
                  <p className="text-white font-medium text-sm">{c.topic}</p>
                  <p className="text-slate-400 text-xs mt-0.5 capitalize">
                    {platformEmoji[c.platform]} {c.platform} • {c.tone} •{" "}
                    {new Date(c.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="text-slate-400">
                {expanded === c.id ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </div>
            </button>

            {/* Expanded Content */}
            {expanded === c.id && (
              <div className="px-5 pb-5 border-t border-slate-800 pt-5 space-y-5">
                {/* Titles */}
                <div>
                  <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                    Titles ({c.titles.length})
                  </h4>
                  <div className="space-y-2">
                    {c.titles.map((t, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between gap-3 p-3 bg-slate-800 rounded-lg"
                      >
                        <p className="text-white text-sm flex-1">{t}</p>
                        <button
                          onClick={() => copy(t, `ht-${c.id}-${i}`)}
                          className="text-slate-500 hover:text-white shrink-0"
                        >
                          {copied === `ht-${c.id}-${i}` ? (
                            <Check size={14} className="text-green-400" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Best Caption */}
                <div>
                  <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                    Captions ({c.captions.length})
                  </h4>
                  <div className="space-y-2">
                    {c.captions.map((cap, i) => (
                      <div key={i} className="p-3 bg-slate-800 rounded-lg">
                        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap mb-2">
                          {cap}
                        </p>
                        <button
                          onClick={() => copy(cap, `hc-${c.id}-${i}`)}
                          className="flex items-center gap-1.5 text-slate-500 hover:text-white text-xs transition"
                        >
                          {copied === `hc-${c.id}-${i}` ? (
                            <Check size={12} className="text-green-400" />
                          ) : (
                            <Copy size={12} />
                          )}
                          Copy
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hashtags */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      Hashtags ({c.hashtags.length})
                    </h4>
                    <button
                      onClick={() =>
                        copy(c.hashtags.join(" "), `hh-all-${c.id}`)
                      }
                      className="flex items-center gap-1 text-slate-400 hover:text-white text-xs"
                    >
                      {copied === `hh-all-${c.id}` ? (
                        <Check size={12} className="text-green-400" />
                      ) : (
                        <Copy size={12} />
                      )}
                      Copy all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.hashtags.map((h, i) => (
                      <span
                        key={i}
                        className="bg-purple-600/15 text-purple-300 border border-purple-600/20 px-2.5 py-1 rounded-full text-xs"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Image if exists */}
                {c.imageUrl && (
                  <div>
                    <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                      AI Image
                    </h4>
                    <img
                      src={c.imageUrl}
                      alt="Generated"
                      className="w-full max-w-xs rounded-xl border border-slate-700"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
