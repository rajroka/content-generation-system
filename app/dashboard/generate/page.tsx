"use client";
import { useState } from "react";
import {
  Copy,
  Check,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Save,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const platforms = [
  { id: "instagram", emoji: "📸" },
  { id: "twitter", emoji: "🐦" },
  { id: "linkedin", emoji: "💼" },
  { id: "facebook", emoji: "👥" },
  { id: "tiktok", emoji: "🎵" },
];

const tones = [
  { id: "casual", desc: "Friendly & relaxed" },
  { id: "professional", desc: "Formal & authoritative" },
  { id: "humorous", desc: "Fun & witty" },
  { id: "inspirational", desc: "Motivating & uplifting" },
  { id: "educational", desc: "Informative & clear" },
];

interface GeneratedContent {
  titles: string[];
  captions: string[];
  hashtags: string[];
}

type TabType = "titles" | "captions" | "hashtags";

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [tone, setTone] = useState("casual");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("titles");

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic first");
      return;
    }
    setLoading(true);
    setContent(null);
    setImageUrl(null);
    setActiveTab("titles");
    try {
      const res = await fetch("/api/generate/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, tone }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setContent(data);
      toast.success("Content generated successfully!");
    } catch {
      toast.error("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    setImageLoading(true);
    try {
      const res = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setImageUrl(data.url);
      setImagePrompt(data.prompt);
      toast.success("Image generated!");
    } catch {
      toast.error("Image generation failed. Check your OpenAI credits.");
    } finally {
      setImageLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          platform,
          tone,
          titles: content.titles,
          captions: content.captions,
          hashtags: content.hashtags,
          imageUrl,
          imagePrompt,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Saved to history!");
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const tabCounts: Record<TabType, number> = {
    titles: content?.titles?.length || 0,
    captions: content?.captions?.length || 0,
    hashtags: content?.hashtags?.length || 0,
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-1">Generate Content</h1>
      <p className="text-slate-400 text-sm mb-8">
        Enter your topic and the AI will generate titles, captions, and hashtags
      </p>

      {/* Input Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-5">
        {/* Topic Input */}
        <div className="mb-5">
          <label className="text-slate-300 text-sm font-medium block mb-2">
            Topic / Keyword <span className="text-red-400">*</span>
          </label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="e.g. morning workout routine, travel in Nepal, healthy breakfast ideas..."
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-purple-500 placeholder:text-slate-500 transition"
          />
        </div>

        {/* Platform */}
        <div className="mb-5">
          <label className="text-slate-300 text-sm font-medium block mb-2">
            Platform
          </label>
          <div className="flex gap-2 flex-wrap">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                  platform === p.id
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                    : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {p.emoji} {p.id}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="mb-6">
          <label className="text-slate-300 text-sm font-medium block mb-2">
            Tone
          </label>
          <div className="flex gap-2 flex-wrap">
            {tones.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                title={t.desc}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                  tone === t.id
                    ? "bg-pink-600 text-white shadow-lg shadow-pink-600/20"
                    : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {t.id}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-lg font-semibold transition shadow-lg"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Sparkles size={18} />
          )}
          {loading ? "Generating..." : "Generate Content"}
        </button>
      </div>

      {/* Results */}
      {content && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-5">
          {/* Tab Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
              {(["titles", "captions", "hashtags"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition ${
                    activeTab === tab
                      ? "bg-purple-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab}
                  <span className="ml-1.5 text-xs opacity-70">
                    ({tabCounts[tab]})
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                disabled={loading}
                title="Regenerate"
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs px-3 py-2 rounded-lg hover:bg-slate-800 transition"
              >
                <RefreshCw size={13} />
                Regenerate
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 text-green-400 px-4 py-2 rounded-lg text-sm transition"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Save
              </button>
            </div>
          </div>

          {/* Titles Tab */}
          {activeTab === "titles" && (
            <div className="space-y-3">
              {content.titles.map((title, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-3 p-4 bg-slate-800 rounded-lg group hover:bg-slate-750 transition"
                >
                  <p className="text-white text-sm leading-relaxed flex-1">
                    {title}
                  </p>
                  <button
                    onClick={() => copy(title, `title-${i}`)}
                    className="text-slate-500 hover:text-white transition shrink-0 p-1"
                  >
                    {copied === `title-${i}` ? (
                      <Check size={15} className="text-green-400" />
                    ) : (
                      <Copy size={15} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Captions Tab */}
          {activeTab === "captions" && (
            <div className="space-y-4">
              {content.captions.map((caption, i) => (
                <div
                  key={i}
                  className="p-4 bg-slate-800 rounded-lg border border-slate-700"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-xs text-purple-400 font-medium bg-purple-400/10 px-2 py-0.5 rounded">
                      Option {i + 1}
                    </span>
                  </div>
                  <p className="text-white text-sm leading-relaxed whitespace-pre-wrap mb-3">
                    {caption}
                  </p>
                  <button
                    onClick={() => copy(caption, `cap-${i}`)}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs transition"
                  >
                    {copied === `cap-${i}` ? (
                      <Check size={13} className="text-green-400" />
                    ) : (
                      <Copy size={13} />
                    )}
                    Copy caption
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Hashtags Tab */}
          {activeTab === "hashtags" && (
            <div>
              <div className="flex flex-wrap gap-2 mb-5">
                {content.hashtags.map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => copy(tag, `tag-${i}`)}
                    className="bg-purple-600/15 hover:bg-purple-600/30 text-purple-300 border border-purple-600/25 px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1"
                  >
                    {tag}
                    {copied === `tag-${i}` && (
                      <Check size={10} className="text-green-400" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-3 border-t border-slate-700">
                <button
                  onClick={() =>
                    copy(content.hashtags.join(" "), "all-hashtags")
                  }
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs transition"
                >
                  {copied === "all-hashtags" ? (
                    <Check size={13} className="text-green-400" />
                  ) : (
                    <Copy size={13} />
                  )}
                  Copy all {content.hashtags.length} hashtags
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Generation — only shown after text generation */}
      {content && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
            <ImageIcon size={18} className="text-pink-400" />
            AI Image Generation
          </h2>
          <p className="text-slate-500 text-xs mb-5">
            Uses OpenAI DALL-E 3 • Stored permanently via ImageKit
          </p>

          {!imageUrl ? (
            <button
              onClick={handleGenerateImage}
              disabled={imageLoading}
              className="flex items-center gap-2 bg-pink-600/20 hover:bg-pink-600/30 border border-pink-600/30 text-pink-400 px-5 py-3 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {imageLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ImageIcon size={16} />
              )}
              {imageLoading
                ? "Generating image (20-30 sec)..."
                : "Generate Image with DALL-E 3"}
            </button>
          ) : (
            <div>
              <img
                src={imageUrl}
                alt="AI Generated"
                className="w-full max-w-sm rounded-xl border border-slate-700 mb-3"
              />
              <p className="text-slate-500 text-xs mb-3 max-w-sm">{imagePrompt}</p>
              <button
                onClick={handleGenerateImage}
                disabled={imageLoading}
                className="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 text-xs transition"
              >
                <RefreshCw size={12} />
                Regenerate image
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
