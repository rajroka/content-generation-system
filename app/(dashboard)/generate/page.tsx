"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Instagram, Facebook, Twitter, Linkedin, Youtube,
  Sparkles, Plus, X, ImageIcon, Loader2, Send,
  MoreHorizontal, Save, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { id: "TWITTER",   label: "X",         icon: Twitter,   color: "bg-slate-900" },
  { id: "FACEBOOK",  label: "Facebook",  icon: Facebook,  color: "bg-blue-600"  },
  { id: "INSTAGRAM", label: "Instagram", icon: Instagram, color: "bg-pink-600"  },
  { id: "LINKEDIN",  label: "LinkedIn",  icon: Linkedin,  color: "bg-blue-700"  },
  { id: "YOUTUBE",   label: "YouTube",   icon: Youtube,   color: "bg-red-600"   },
];

export default function GeneratePage() {
  const [topic, setTopic]                       = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["TWITTER"]);
  const [isGenerating, setIsGenerating]         = useState(false);
  const [isScheduling, setIsScheduling]         = useState(false);
  const [isSaving, setIsSaving]                 = useState(false);
  const [caption, setCaption]                   = useState("");
  const [hashtags, setHashtags]                 = useState<string[]>([]);
  const [mediaFiles, setMediaFiles]             = useState<{ url: string; file?: File }[]>([]);
  const [scheduledFor, setScheduledFor]         = useState("");
  const [usage, setUsage]                       = useState({ captions: 0, schedules: 0, plan: "FREE" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/user/usage")
      .then((r) => r.json())
      .then((d) => setUsage(d))
      .catch(() => {});
  }, []);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return toast.error("Please enter a topic first");

    if (usage.plan === "FREE" && usage.captions >= 10) {
      toast.error("Daily caption limit reached (10/day). Upgrade to Pro for unlimited.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform: selectedPlatforms[0] || "TWITTER", tone: "CASUAL" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");

      setCaption(data.caption);
      const baseTags = data.hashtags || [];
      const fallbacks = ["#trending", "#viral", "#innovation", "#digital", "#creativity", "#future"];
      setHashtags(Array.from(new Set([...baseTags, ...fallbacks])).slice(0, 8));
      setUsage((prev) => ({ ...prev, captions: prev.captions + 1 }));
      toast.success("Content generated!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSchedule = async () => {
    if (!caption.trim()) return toast.error("Write or generate a caption first");
    if (!scheduledFor) return toast.error("Pick a date and time to schedule");
    if (selectedPlatforms.length === 0) return toast.error("Select at least one platform");

    if (usage.plan === "FREE" && usage.schedules >= 5) {
      toast.error("Daily schedule limit reached (5/day). Upgrade to Pro for unlimited.");
      return;
    }

    setIsScheduling(true);
    try {
      const res = await fetch("/api/social/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption,
          hashtags,
          platforms: selectedPlatforms,
          scheduledFor,
          imageUrl: mediaFiles[0]?.url ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule");
      setUsage((prev) => ({ ...prev, schedules: prev.schedules + 1 }));
      toast.success("Post scheduled! View it in your Calendar.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!caption.trim()) return toast.error("Nothing to save");
    setIsSaving(true);
    try {
      const res = await fetch("/api/social/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption,
          hashtags,
          platforms: selectedPlatforms,
          scheduledFor: null,
          imageUrl: mediaFiles[0]?.url ?? null,
          isDraft: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      toast.success("Draft saved!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      setMediaFiles((prev) => [...prev, { url, file }]);
    });
  };

  const captionLimitHit  = usage.plan === "FREE" && usage.captions  >= 10;
  const scheduleLimitHit = usage.plan === "FREE" && usage.schedules >= 5;

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 sm:p-12 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Generate & Compose</h1>
            <p className="text-slate-500 mt-1">Design your next viral post with AI.</p>
          </div>
          <div className="flex items-center gap-3">
            {usage.plan === "FREE" && (
              <div className="text-xs text-slate-500 text-right">
                <span className={cn(captionLimitHit && "text-red-500 font-semibold")}>
                  {usage.captions}/10 captions
                </span>
                {" · "}
                <span className={cn(scheduleLimitHit && "text-red-500 font-semibold")}>
                  {usage.schedules}/5 schedules
                </span>
              </div>
            )}
            <Button
              variant="outline"
              className="rounded-xl border-slate-200 h-11 px-6 font-semibold flex gap-2"
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Draft
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12">

          {/* LEFT: Editor */}
          <div className="space-y-8">

            {/* Platform Selection */}
            <div className="space-y-3">
              <Label className="text-[15px] font-bold text-slate-900">Publish to</Label>
              <div className="flex flex-wrap items-center gap-3">
                {PLATFORMS.map((p) => {
                  const isActive = selectedPlatforms.includes(p.id);
                  return (
                    <Badge
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={cn(
                        "cursor-pointer transition-all px-4 py-2.5 rounded-full flex items-center gap-2 border shadow-sm",
                        isActive
                          ? "bg-white border-slate-900 text-slate-900"
                          : "bg-slate-50 border-transparent text-slate-400 opacity-60 hover:opacity-100"
                      )}
                    >
                      <div className={cn("rounded-full p-1", isActive ? p.color : "bg-slate-300")}>
                        <p.icon className="w-3 h-3 text-white fill-current" />
                      </div>
                      <span className="font-medium text-sm">{p.label}</span>
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Caption Editor */}
            <div className="space-y-3">
              <Label className="text-[15px] font-bold text-slate-900">Content</Label>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's on your mind?"
                className="min-h-[200px] rounded-xl border-slate-200 bg-white p-6 text-slate-700 leading-relaxed text-sm focus-visible:ring-slate-200 transition-all shadow-sm"
              />

              {/* Generate Bar */}
              <div className="flex items-center gap-2 p-1.5 pl-5 border border-slate-200 rounded-xl bg-white shadow-sm mt-4 focus-within:ring-2 focus-within:ring-slate-100">
                <Sparkles className="w-4 h-4 text-slate-400" />
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="Topic: e.g. AI fitness app that tracks calories"
                  className="flex-1 bg-transparent border-none outline-none text-sm h-10 text-slate-700"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || captionLimitHit}
                  className="rounded-xl bg-slate-950 hover:bg-slate-800 h-10 px-6 gap-2 text-sm font-bold"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 fill-current" />}
                  Generate
                </Button>
              </div>
              {captionLimitHit && (
                <p className="text-xs text-red-500">Daily limit reached. <a href="/pricing" className="underline">Upgrade to Pro</a> for unlimited captions.</p>
              )}
            </div>

            {/* Media Assets */}
            <div className="space-y-3 pt-2">
              <Label className="text-[15px] font-bold text-slate-900">Media Assets</Label>
              <div className="flex flex-wrap gap-4">
                {mediaFiles.map((media, i) => (
                  <div key={i} className="group relative w-24 h-24 rounded-xl overflow-hidden border border-slate-100 shadow-md">
                    <Image src={media.url} alt="Upload" fill className="object-cover transition-transform group-hover:scale-105" />
                    <button
                      onClick={() => setMediaFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-slate-400 hover:bg-slate-50 transition-all"
                >
                  <Plus className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                </button>
                <input ref={fileInputRef} type="file" multiple hidden onChange={handleFileUpload} />
              </div>
            </div>

            {/* Schedule Section */}
            <div className="pt-6 border-t border-slate-100">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-xl shadow-sm">
                    <Calendar className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Schedule Posting</p>
                    <input
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      className="text-xs text-slate-500 mt-1 bg-transparent border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSchedule}
                  disabled={isScheduling || scheduleLimitHit}
                  className="w-full sm:w-auto rounded-xl bg-slate-900 hover:bg-slate-800 text-white h-11 px-8 font-bold flex gap-2"
                >
                  {isScheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Schedule Post
                </Button>
              </div>
              {scheduleLimitHit && (
                <p className="text-xs text-red-500 mt-2">Daily schedule limit reached (5/day). <a href="/pricing" className="underline">Upgrade to Pro</a>.</p>
              )}
            </div>
          </div>

          {/* RIGHT: Preview */}
          <div className="space-y-4">
            <div className="bg-slate-100/50 rounded-[32px] border border-slate-100 p-0 min-h-[500px] flex flex-col items-center justify-center overflow-hidden">
              {!caption && mediaFiles.length === 0 ? (
                <div className="max-w-[200px] text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium leading-snug">Post preview will appear here</p>
                </div>
              ) : (
                <Card className="w-full max-w-[360px] rounded-xl overflow-hidden border-none shadow-2xl bg-white m-4">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 relative overflow-hidden">
                        <Image src="https://github.com/shadcn.png" alt="User" fill />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">your_brand</p>
                        <p className="text-[11px] text-slate-400 uppercase font-bold tracking-tighter">
                          {selectedPlatforms[0] || "PREVIEW"}
                        </p>
                      </div>
                    </div>
                    <MoreHorizontal className="w-5 h-5 text-slate-400" />
                  </div>
                  {mediaFiles.length > 0 && (
                    <div className="aspect-square w-full relative">
                      <Image src={mediaFiles[0].url} alt="Post Content" fill className="object-cover" />
                    </div>
                  )}
                  <div className="p-4 text-left">
                    <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {caption || "Generate or write a caption to see the preview..."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {hashtags.map((tag, i) => (
                        <span key={i} className="text-blue-600 text-xs font-semibold">{tag}</span>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>
            <p className="text-center text-xs text-slate-400 font-medium italic">
              Preview adapts to your primary platform choice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}