"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Plus, X, ImageIcon, Loader2, MoreHorizontal, Calendar, Check, Send, Film, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

// ── Brand SVG Icons ──────────────────────────────────────────────────────────

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.883v2.258h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#F58529"/>
        <stop offset="50%" stopColor="#DD2A7B"/>
        <stop offset="100%" stopColor="#8134AF"/>
      </linearGradient>
    </defs>
    <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#FF0000" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const PLATFORMS = [
  { id: "TWITTER",   label: "X",         Icon: XIcon        },
  { id: "FACEBOOK",  label: "Facebook",  Icon: FacebookIcon  },
  { id: "INSTAGRAM", label: "Instagram", Icon: InstagramIcon },
  { id: "LINKEDIN",  label: "LinkedIn",  Icon: LinkedInIcon  },
  { id: "YOUTUBE",   label: "YouTube",   Icon: YouTubeIcon   },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function GeneratePage() {
  const { user: clerkUser } = useUser();
  const userName  = clerkUser?.fullName || clerkUser?.firstName || "Your Brand";
  const userImage = clerkUser?.imageUrl || null;

  const [topic, setTopic] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["FACEBOOK"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [caption, setCaption] = useState("");
  // mediaFiles stores both local blob preview URL and the uploaded CDN URL
  const [mediaFiles, setMediaFiles] = useState<{ localUrl: string; cdnUrl?: string; file?: File; type: "image" | "video" }[]>([]);
  const [scheduledFor, setScheduledFor] = useState("");
  const [usage, setUsage] = useState({ captions: 2, schedules: 1, plan: "FREE" });
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/user/usage")
      .then((r) => r.json())
      .then((d) => setUsage(d))
      .catch(() => {});
  }, []);

  // reset preview index if images removed
  useEffect(() => {
    if (activePreviewIndex >= mediaFiles.length) setActivePreviewIndex(0);
  }, [mediaFiles]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handlePostNow = async () => {
    if (!caption.trim() && mediaFiles.length === 0) return toast.error("Add some content before posting!");
    if (selectedPlatforms.length === 0) return toast.error("Select at least one platform");

    // Ensure all files are uploaded to CDN first
    const unuploaded = mediaFiles.filter((m) => !m.cdnUrl);
    if (unuploaded.length > 0) {
      return toast.error("Please wait for all files to finish uploading.");
    }

    setIsPosting(true);
    const postingToast = toast.loading("Publishing your post...");
    try {
      const cdnUrls = mediaFiles.map((m) => m.cdnUrl!);
      const res = await fetch("/api/social/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption,
          platforms: selectedPlatforms,
          mediaUrl:  cdnUrls[0] || null,
          mediaUrls: cdnUrls,
        }),
      });
      const data = await res.json();
      toast.dismiss(postingToast);

      if (!res.ok) {
        toast.error(data.error || "Failed to publish");
        return;
      }

      // Show per-platform results
      const succeeded = (data.results as { platform: string; success: boolean }[])
        .filter((r) => r.success)
        .map((r) => r.platform);
      const failed = (data.results as { platform: string; success: boolean }[])
        .filter((r) => !r.success)
        .map((r) => r.platform);

      if (succeeded.length > 0) {
        if (data.instagramContentType === "story") {
          toast.success(`✅ Published to ${succeeded.join(", ")}`);
          toast(`📖 Instagram: posted as a Story (your image was too tall for a feed post). Stories disappear after 24h.`, {
            icon: "ℹ️",
            duration: 6000,
          });
        } else {
          toast.success(`✅ Published to ${succeeded.join(", ")}`);
        }
        setCaption("");
        setMediaFiles([]);
      }
      if (failed.length > 0) {
        toast.error(`❌ Failed on: ${failed.join(", ")}`);
      }
    } catch (err: any) {
      toast.dismiss(postingToast);
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsPosting(false);
    }
  };

  // Upload a single file to ImageKit and return the CDN URL
  const uploadFile = async (file: File): Promise<{ cdnUrl: string; type: "image" | "video" }> => {
    const isVideo = file.type.startsWith("video/");
    const endpoint = isVideo ? "/api/upload/video" : "/api/upload/image";
    const formData = new FormData();
    formData.append("file", file);
    const res  = await fetch(endpoint, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return { cdnUrl: data.url, type: isVideo ? "video" : "image" };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    setIsUploading(true);
    const uploadToast = toast.loading(`Uploading ${files.length} file${files.length > 1 ? "s" : ""}...`);

    try {
      await Promise.all(
        files.map(async (file) => {
          const isVideo = file.type.startsWith("video/");
          const localUrl = URL.createObjectURL(file);
          const tempEntry = { localUrl, cdnUrl: undefined, file, type: isVideo ? "video" as const : "image" as const };
          setMediaFiles((prev) => [...prev, tempEntry]);

          try {
            const { cdnUrl, type } = await uploadFile(file);
            setMediaFiles((prev) =>
              prev.map((m) => (m.localUrl === localUrl ? { ...m, cdnUrl, type } : m))
            );
          } catch (err: any) {
            toast.error(`Failed to upload ${file.name}: ${err.message}`);
            setMediaFiles((prev) => prev.filter((m) => m.localUrl !== localUrl));
          }
        })
      );
      toast.dismiss(uploadToast);
      toast.success("Upload complete!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!caption.trim()) return toast.error("Write something before saving a draft!");
    setIsSaving(true);
    try {
      const cdnUrls = mediaFiles.filter((m) => m.cdnUrl).map((m) => m.cdnUrl!);
      const res = await fetch("/api/social/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption,
          platforms: selectedPlatforms,
          imageUrl:  cdnUrls[0] || null,
          imageUrls: cdnUrls,
          isDraft:   true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save draft");
      toast.success("Draft saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Could not save draft.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSchedule = async () => {
    if (!caption.trim()) return toast.error("Content cannot be empty");
    if (selectedPlatforms.length === 0) return toast.error("Select at least one platform");
    if (!scheduledFor) return toast.error("Please select a date and time");
    const selectedDate = new Date(scheduledFor);
    if (selectedDate < new Date()) return toast.error("Cannot schedule in the past!");

    setIsScheduling(true);
    try {
      const cdnUrls = mediaFiles.filter((m) => m.cdnUrl).map((m) => m.cdnUrl!);
      const res = await fetch("/api/social/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption,
          platforms:    selectedPlatforms,
          scheduledFor: selectedDate.toISOString(),
          imageUrl:     cdnUrls[0] || null,
          imageUrls:    cdnUrls,
          isDraft:      false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scheduling failed");
      toast.success(`Post scheduled for ${selectedDate.toLocaleString()}`);
      setUsage((prev) => ({ ...prev, schedules: prev.schedules + 1 }));
      setCaption("");
      setMediaFiles([]);
      setScheduledFor("");
    } catch (err: any) {
      toast.error(err.message || "An error occurred while scheduling");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return toast.error("Please enter a topic first");
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform: selectedPlatforms[0] || "TWITTER" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      const tags = data.hashtags ? `\n\n${data.hashtags.join(" ")}` : "";
      setCaption(`${data.caption}${tags}`);
      setUsage((prev) => ({ ...prev, captions: prev.captions + 1 }));
      toast.success("Content generated!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlatform = (id: string) =>
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  const removeMedia = (idx: number) => {
    const m = mediaFiles[idx];
    if (m?.localUrl?.startsWith("blob:")) URL.revokeObjectURL(m.localUrl);
    setMediaFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto p-4 md:p-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Generate & Compose</h1>
            <p className="text-muted-foreground text-sm">Design your next viral post with AI.</p>
          </div>
          <div className="flex items-center w-full md:w-auto gap-3">
            <div className="hidden sm:flex flex-col items-end text-xs font-medium text-muted-foreground">
              <span>{usage.captions}/10 captions — {usage.schedules}/5 schedules</span>
              <div className="w-32 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-[#0D7C8A]" style={{ width: `${(usage.captions / 10) * 100}%` }} />
              </div>
            </div>
            <Button
              variant="outline"
              className="font-bold rounded-lg px-5 ml-auto md:ml-0"
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Draft
            </Button>
            <Button
              style={{ backgroundColor: "#0D7C8A" }}
              className="hover:opacity-90 text-white font-bold rounded-lg px-6 shadow-lg shadow-[#0D7C8A]/20 flex items-center gap-2"
              onClick={handlePostNow}
              disabled={isPosting}
            >
              {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Post Now
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT: Composer */}
          <div className="lg:col-span-7 space-y-6">

            {/* Platform Selector */}
            <div className="space-y-4">
              <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Publish to</Label>
              <div className="flex flex-wrap gap-3">
                {PLATFORMS.map(({ id, label, Icon }) => {
                  const isActive = selectedPlatforms.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => togglePlatform(id)}
                      title={label}
                      className={cn(
                        "group relative flex items-center justify-center w-11 h-11 rounded-xl border-2 transition-all",
                        isActive
                          ? "border-[#0D7C8A] bg-[#0D7C8A]/10 scale-105"
                          : "border-muted hover:border-muted-foreground"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {isActive && (
                        <div className="absolute -top-2 -right-2 bg-[#0D7C8A] text-white rounded-full p-0.5 shadow-lg">
                          <Check className="w-3 h-3 stroke-[3px]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caption */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Content & Hashtags</Label>
                <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                  {caption.length} chars
                </span>
              </div>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's on your mind? AI can help with the caption and hashtags..."
                className="min-h-[250px] rounded-2xl border-muted bg-card p-6 text-base focus-visible:ring-[#0D7C8A] transition-all shadow-sm resize-none"
              />
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Topic: e.g., AI fitness app features"
                  className="w-full h-12 px-5 bg-card border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0D7C8A]/20 transition-all"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  style={{ backgroundColor: "#0D7C8A" }}
                  className="h-12 px-8 rounded-xl hover:opacity-90 text-white font-bold flex gap-2 w-full sm:w-auto shrink-0 shadow-lg shadow-[#0D7C8A]/10"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate
                </Button>
              </div>
            </div>

            {/* Media Upload — images & videos */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Media Assets</Label>
                {mediaFiles.length > 0 && (
                  <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                    {mediaFiles.length} file{mediaFiles.length > 1 ? "s" : ""}
                    {isUploading && " · uploading..."}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {mediaFiles.map((media, i) => (
                  <div
                    key={i}
                    onClick={() => setActivePreviewIndex(i)}
                    className={cn(
                      "group relative aspect-square rounded-xl overflow-hidden border-2 bg-muted cursor-pointer transition-all",
                      activePreviewIndex === i ? "border-[#0D7C8A] scale-105" : "border-transparent"
                    )}
                  >
                    {media.type === "video" ? (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                        <Film className="w-6 h-6 text-white/70" />
                      </div>
                    ) : (
                      <Image src={media.localUrl} alt="Upload" fill className="object-cover" />
                    )}
                    {/* Upload progress overlay */}
                    {!media.cdnUrl && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeMedia(i); }}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {activePreviewIndex === i && media.cdnUrl && (
                      <div className="absolute bottom-1 left-1 bg-[#0D7C8A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Preview
                      </div>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="aspect-square rounded-xl border-2 border-dashed border-muted hover:border-[#0D7C8A] hover:bg-[#0D7C8A]/5 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
                >
                  <Plus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Add</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
                  hidden
                  onChange={handleFileChange}
                />
              </div>
              {mediaFiles.length > 1 && (
                <p className="text-[11px] text-muted-foreground">
                  Click a thumbnail to switch the preview. All {mediaFiles.length} files will be saved.
                </p>
              )}
              <p className="text-[10px] text-muted-foreground">
                Supports images (JPEG, PNG, WebP, GIF) and videos (MP4, MOV, WebM) · Max 20MB images / 100MB videos
              </p>
            </div>

            {/* Schedule */}
            <div className="pt-4 space-y-4">
              <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Schedule Posting</Label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-card border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0D7C8A]/20 dark:[color-scheme:dark]"
                  />
                </div>
                <Button
                  onClick={handleSchedule}
                  disabled={isScheduling}
                  className="h-12 px-10 rounded-xl bg-[#0D7C8A] text-white hover:opacity-90 font-bold w-full sm:w-auto shrink-0 transition-all active:scale-95"
                >
                  {isScheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Schedule"}
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-8 bg-muted/30 dark:bg-zinc-900/30 rounded-2xl overflow-hidden border border-border/50 shadow-sm">
              <div className="px-4 py-3 border-b bg-background/50 flex justify-between items-center">
                <h3 className="font-bold text-sm text-[#0D7C8A]">Live Preview</h3>
                <Badge variant="secondary" className="text-[10px] uppercase">Dynamic View</Badge>
              </div>

              <div className="p-3">
                <Card className="w-full rounded-xl shadow-sm border overflow-hidden bg-white dark:bg-zinc-900 transition-colors">
                  {/* Mockup Header */}
                  <div className="px-3 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#0D7C8A]/10 flex items-center justify-center overflow-hidden ring-1 ring-border shrink-0">
                        {userImage ? (
                          <img src={userImage} alt={userName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-[#0D7C8A]">
                            {userName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-xs font-bold leading-none truncate">{userName}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Just now · 🌍</p>
                      </div>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>

                  {/* Caption */}
                  <div className="px-3 pb-2">
                    <p className="text-xs leading-relaxed whitespace-pre-wrap text-foreground">
                      {caption || <span className="text-muted-foreground">Your generated content will appear here...</span>}
                    </p>
                  </div>

                  {/* Media Preview */}
                  {mediaFiles.length > 0 ? (
                    <div className="w-full">
                      <div className="relative w-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                        {mediaFiles[activePreviewIndex]?.type === "video" ? (
                          <video
                            src={mediaFiles[activePreviewIndex]?.localUrl}
                            className="w-full max-h-[280px] object-contain"
                            controls
                            muted
                          />
                        ) : (
                          <img
                            src={mediaFiles[activePreviewIndex]?.localUrl}
                            alt="Preview"
                            className="w-full h-auto max-h-[280px] object-contain"
                          />
                        )}
                        {mediaFiles.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {activePreviewIndex + 1}/{mediaFiles.length}
                          </div>
                        )}
                        {!mediaFiles[activePreviewIndex]?.cdnUrl && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                            <span className="text-white text-xs font-medium">Uploading...</span>
                          </div>
                        )}
                      </div>
                      {/* Thumbnail strip */}
                      {mediaFiles.length > 1 && (
                        <div className="flex gap-1.5 p-2 bg-zinc-50 dark:bg-zinc-800/50 overflow-x-auto">
                          {mediaFiles.map((m, i) => (
                            <button
                              key={i}
                              onClick={() => setActivePreviewIndex(i)}
                              className={cn(
                                "relative shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center bg-zinc-200 dark:bg-zinc-700",
                                activePreviewIndex === i ? "border-[#0D7C8A]" : "border-transparent opacity-60 hover:opacity-100"
                              )}
                            >
                              {m.type === "video" ? (
                                <Film className="w-4 h-4 text-zinc-500" />
                              ) : (
                                <img src={m.localUrl} alt="" className="w-full h-full object-cover" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted/40 flex flex-col items-center justify-center border-y border-border/50 gap-1.5">
                      <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                      <span className="text-[11px] text-muted-foreground/50">Media Preview</span>
                    </div>
                  )}

                  {/* Mockup Footer */}
                  <div className="px-3 py-2 border-t border-border/50 flex items-center justify-between text-muted-foreground">
                    <div className="flex gap-4">
                      <span className="text-[11px] font-semibold hover:text-[#0D7C8A] cursor-pointer transition-colors">Like</span>
                      <span className="text-[11px] font-semibold hover:text-[#0D7C8A] cursor-pointer transition-colors">Comment</span>
                    </div>
                    <span className="text-[11px] font-semibold hover:text-[#0D7C8A] cursor-pointer">Share</span>
                  </div>
                </Card>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}