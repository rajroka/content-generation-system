"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { format, startOfToday } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar as DatePickerCalendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wand2, Plus, X, ImageIcon, Loader2, MoreHorizontal, Calendar, Check, Send, Film } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { PLATFORMS } from "@/lib/platforms";

const PREVIEW_OPTIONS: { value: PreviewType; label: string; platform: string }[] = [
  { value: "facebook-post", label: "Facebook post preview", platform: "FACEBOOK" },
  { value: "instagram",     label: "Instagram preview",     platform: "INSTAGRAM" },
  { value: "tiktok",        label: "TikTok preview",        platform: "TIKTOK"    },
  { value: "youtube",       label: "YouTube preview",       platform: "YOUTUBE"   },
];

const formatDate = (date: Date) => format(date, "MMM d, yyyy");

// ── Component ────────────────────────────────────────────────────────────────

type PreviewType = "facebook-post" | "instagram" | "tiktok" | "youtube";

interface ConnectedAccount {
  platform: string;
  accountName: string | null;
  profilePicture?: string;
}

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
  const [caption, setCaption] = useState("");
  const [mediaFiles, setMediaFiles] = useState<{ localUrl: string; cdnUrl?: string; file?: File; type: "image" | "video" }[]>([]);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [isSchedulePickerOpen, setIsSchedulePickerOpen] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");
  const [usage, setUsage] = useState({ captions: 0, schedules: 0, plan: "FREE", captionLimit: 10 as number | null, scheduleLimit: 15 as number | null });
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [previewType, setPreviewType] = useState<PreviewType>("facebook-post");
  const [fbPhoto, setFbPhoto] = useState<string | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  const searchParams = useSearchParams();
  useEffect(() => {
    const p = searchParams.get("preview");
    if (p === "facebook") setPreviewType("facebook-post");
    else if (p === "instagram") setPreviewType("instagram");
    else if (p === "tiktok") setPreviewType("tiktok");
    else if (p === "youtube") setPreviewType("youtube");
  }, [searchParams]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/user/usage")
      .then((r) => r.json())
      .then((d) => setUsage(d))
      .catch(() => {});

    // Fetch Facebook profile photo from connections
    fetch("/api/social/connections")
      .then((r) => r.json())
      .then((data: ConnectedAccount[]) => {
        if (!Array.isArray(data)) return;
        const platforms = data.map((a) => a.platform.toUpperCase());
        setConnectedPlatforms(platforms);
        const fb = data.find((a) => a.platform.toUpperCase() === "FACEBOOK");
        if (fb?.profilePicture) setFbPhoto(fb.profilePicture);
        // Auto-set preview to first connected platform
        if (platforms.includes("FACEBOOK")) setPreviewType("facebook-post");
        else if (platforms.includes("INSTAGRAM")) setPreviewType("instagram");
        else if (platforms.includes("TIKTOK")) setPreviewType("tiktok");
        else if (platforms.includes("YOUTUBE")) setPreviewType("youtube");
      })
      .catch(() => {});
  }, []);

  // reset preview index if images removed
  useEffect(() => {
    if (activePreviewIndex >= mediaFiles.length) setActivePreviewIndex(0);
  }, [mediaFiles]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handlePostNow = async () => {
    if (!caption.trim() && mediaFiles.length === 0) return toast.error("Add a caption or media before posting!");
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
          toast.success(`Published to ${succeeded.join(", ")}`);
          toast(`Instagram: posted as a Story (your image was too tall for a feed post). Stories disappear after 24h.`, {
            icon: "ℹ️",
            duration: 6000,
          });
        } else {
          toast.success(`Published to ${succeeded.join(", ")}`);
        }
        setCaption("");
        setMediaFiles([]);
      }
      if (failed.length > 0) {
        toast.error(`Failed on: ${failed.join(", ")}`);
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

  const handleSchedule = async () => {
    if (!caption.trim() && mediaFiles.length === 0) return toast.error("Add a caption or media before scheduling");
    if (selectedPlatforms.length === 0) return toast.error("Select at least one platform");
    if (mediaFiles.some((m) => !m.cdnUrl)) return toast.error("Please wait for all files to finish uploading.");
    if (!scheduleDate || !scheduleTime) return toast.error("Please select a date and time");
    const [hours, minutes] = scheduleTime.split(":").map(Number);
    const selectedDate = new Date(scheduleDate);
    selectedDate.setHours(hours || 0, minutes || 0, 0, 0);
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
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scheduling failed");
      toast.success(`Post scheduled for ${selectedDate.toLocaleString()}`);
      setUsage((prev) => ({ ...prev, schedules: prev.schedules + 1 }));
      setCaption("");
      setMediaFiles([]);
      setScheduleDate(undefined);
      setScheduleTime("");
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

      // If hashtags are already embedded in the caption, don't append them again
      const hashtags: string[] = data.hashtags ?? [];
      const captionAlreadyHasHashtags =
        hashtags.length > 0 &&
        hashtags.some((tag: string) =>
          data.caption.includes(tag.startsWith("#") ? tag : `#${tag}`)
        );

      const tags = !captionAlreadyHasHashtags && hashtags.length > 0
        ? `\n\n${hashtags.join(" ")}`
        : "";
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

  const activeMedia = mediaFiles[activePreviewIndex];

  const renderPreviewMedia = (className: string) => {
    if (!activeMedia) return null;
    if (activeMedia.type === "video") {
      return (
        <video
          src={activeMedia.localUrl}
          controls
          muted
          playsInline
          className={className}
        />
      );
    }

    return <img src={activeMedia.localUrl} alt="Preview" className={className} />;
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto p-4 md:p-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-xl font-bold tracking-tight">Generate & Compose</h1>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* LEFT: Composer */}
          <div className="lg:col-span-7 space-y-6">

            {/* Platform Selector */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">Publish to</Label>
              <div className="flex flex-wrap gap-3">
                {PLATFORMS.map(({ id, name, Icon }) => {
                  const isActive = selectedPlatforms.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => togglePlatform(id)}
                      title={name}
                      className={cn(
                        "group relative flex items-center justify-center w-11 h-11 rounded-xl border-2 transition-all",
                        isActive
                          ? "border-primary bg-primary/10 scale-105"
                          : "border-muted hover:border-muted-foreground"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {isActive && (
                        <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-0.5 shadow-lg">
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
                <Label className="text-sm font-medium text-muted-foreground">Caption & hashtags</Label>
                <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                  {caption.length} chars
                </span>
              </div>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's on your mind? AI can help with the caption and hashtags..."
                className="min-h-[250px] rounded-2xl border-muted bg-card p-6 text-base focus-visible:ring-primary transition-all shadow-sm resize-none"
              />
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Topic: e.g., AI fitness app features"
                  className="w-full h-10 px-4 bg-card border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="h-10 px-5 rounded-xl bg-primary hover:opacity-90 text-white font-semibold flex gap-2 w-full sm:w-auto shrink-0"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  Generate
                </Button>
              </div>
            </div>

            {/* Media Upload — images & videos */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <Label className="text-sm font-medium text-muted-foreground">Media</Label>
                {mediaFiles.length > 0 && (
                  <span className="text-xs text-muted-foreground">
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
                      activePreviewIndex === i ? "border-primary scale-105" : "border-transparent"
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
                      <div className="absolute bottom-1 left-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Preview
                      </div>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="aspect-square rounded-xl border-2 border-dashed border-muted hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
                >
                  <Plus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Add</span>
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
                <p className="text-xs text-muted-foreground">
                  Click a thumbnail to switch the preview. All {mediaFiles.length} files will be saved.
                </p>
              )}
            </div>

            {/* Publish actions */}
            <div className="space-y-4 rounded-[8px] border bg-card p-4 shadow-sm">
              <Label className="text-sm font-medium text-muted-foreground">Schedule & publish</Label>
              <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                <Popover open={isSchedulePickerOpen} onOpenChange={setIsSchedulePickerOpen}>
                  <PopoverTrigger
                    render={
                      <button className="h-11 w-full flex items-center gap-2 rounded-[8px] border-2 border-primary/40 bg-primary/5 px-3 text-sm text-left hover:bg-primary/10 hover:border-primary transition-colors">
                        <Calendar className="size-4 text-primary shrink-0" />
                        <span className={scheduleDate ? "text-foreground font-medium" : "text-muted-foreground"}>
                          {scheduleDate ? formatDate(scheduleDate) : "Pick a date"}
                        </span>
                      </button>
                    }
                  />
                  <PopoverContent align="start" className="w-auto p-0">
                    <DatePickerCalendar
                      mode="single"
                      selected={scheduleDate}
                      onSelect={(date) => {
                        setScheduleDate(date);
                        if (date) setIsSchedulePickerOpen(false);
                      }}
                      disabled={{ before: startOfToday() }}
                      className="[--primary:var(--color-primary)] [--primary-foreground:#ffffff]"
                    />
                  </PopoverContent>
                </Popover>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="h-11 rounded-[8px] border-2 border-primary/40 bg-primary/5 px-3 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary hover:border-primary dark:[color-scheme:dark]"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  onClick={handleSchedule}
                  disabled={isScheduling}
                  className="h-10 rounded-[8px] bg-primary text-white hover:bg-primary/90 font-bold"
                >
                  {isScheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Schedule"}
                </Button>
                <Button
                  className="h-10 rounded-[8px] bg-primary text-white hover:bg-primary/90 font-bold gap-2"
                  onClick={handlePostNow}
                  disabled={isPosting}
                >
                  {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Post Now
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="min-w-0 lg:col-span-5">
            <div className="space-y-2 lg:sticky lg:top-8">

              {/* Platform selector */}
              <div className="flex items-center px-1">
                <Select
                  value={previewType}
                  onValueChange={(value) => setPreviewType(value as PreviewType)}
                >
                  <SelectTrigger className="h-9 w-full rounded-[8px] bg-background font-bold sm:w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PREVIEW_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ── TikTok Preview ── */}
              {previewType === "tiktok" && (
                <div className="relative w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-black shadow-xl" style={{ aspectRatio: "9/16" }}>
                  {activeMedia ? (
                    renderPreviewMedia("absolute inset-0 w-full h-full object-cover opacity-80")
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-black" />
                  )}
                  {/* Top bar */}
                  <div className="absolute top-0 left-0 right-0 px-3 pt-4 flex items-center justify-center z-10">
                    <span className="text-white text-xs font-semibold opacity-80">Following</span>
                    <span className="text-white/40 mx-2 text-xs">|</span>
                    <span className="text-white text-xs font-bold border-b-2 border-white pb-0.5">For You</span>
                  </div>
                  {/* Right action bar */}
                  <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4 z-10">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white bg-zinc-700">
                        {userImage ? <img src={userImage} alt={userName} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center bg-zinc-600"><span className="text-white text-xs font-bold">{userName.charAt(0)}</span></div>}
                      </div>
                      <div className="w-4 h-4 rounded-full bg-[#FE2C55] flex items-center justify-center -mt-2 ring-1 ring-black">
                        <span className="text-white text-[8px] font-black">+</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-2xl">❤️</span>
                      <span className="text-white text-[10px]">0</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-2xl">💬</span>
                      <span className="text-white text-[10px]">0</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-2xl">↗</span>
                      <span className="text-white text-[10px]">Share</span>
                    </div>
                  </div>
                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-10 px-3 pb-4 z-10">
                    <p className="text-white text-xs font-bold mb-1">@{userName.replace(/\s+/g, "").toLowerCase()}</p>
                    <p className="text-white text-xs leading-relaxed line-clamp-3 opacity-90">
                      {caption || <span className="text-white/50">Your caption will appear here...</span>}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-white text-[10px]">🎵</span>
                      <span className="text-white text-[10px] opacity-70">Original sound · {userName}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── YouTube Preview ── */}
              {previewType === "youtube" && (
                <div className="mx-auto w-full max-w-[420px] rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
                  {/* Thumbnail */}
                  {activeMedia ? (
                    renderPreviewMedia("w-full aspect-video object-cover bg-black")
                  ) : (
                    <div className="aspect-video bg-zinc-900 flex items-center justify-center">
                      <svg className="w-12 h-12 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                  )}
                  {/* Video info */}
                  <div className="p-3 flex gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-red-600/10 ring-1 ring-border">
                      {userImage ? <img src={userImage} alt={userName} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center bg-red-600"><span className="text-white text-xs font-bold">{userName.charAt(0)}</span></div>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                        {caption || <span className="text-muted-foreground">Your video title / caption...</span>}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{userName}</p>
                      <p className="text-xs text-muted-foreground">0 views · Just now</p>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                </div>
              )}

              {/* ── Facebook Post Preview ── */}
              {previewType === "facebook-post" && (
                <div className="mx-auto w-full max-w-[420px] rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
                  <div className="px-3 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-border shrink-0 bg-[#1877F2]/10">
                        {fbPhoto ? <img src={fbPhoto} alt={userName} className="w-full h-full object-cover" />
                          : userImage ? <img src={userImage} alt={userName} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center bg-[#1877F2]"><span className="text-white text-xs font-bold">{userName.charAt(0)}</span></div>}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground leading-none">{userName}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Just now · 🌍</p>
                      </div>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="px-3 pb-2">
                    <p className="text-xs leading-relaxed whitespace-pre-wrap text-foreground">
                      {caption || <span className="text-muted-foreground">Your caption will appear here...</span>}
                    </p>
                  </div>
                  {activeMedia ? (
                    renderPreviewMedia("w-full aspect-square object-contain bg-black")
                  ) : (
                    <div className="aspect-square bg-muted/40 flex items-center justify-center border-y border-border/50">
                      <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="px-3 py-2 border-t border-border/50 flex items-center justify-between text-muted-foreground">
                    <div className="flex gap-4">
                      <span className="text-[11px] font-semibold">👍 Like</span>
                      <span className="text-[11px] font-semibold">💬 Comment</span>
                    </div>
                    <span className="text-[11px] font-semibold">↗ Share</span>
                  </div>
                </div>
              )}

              {/* ── Instagram Preview ── */}
              {previewType === "instagram" && (
                <div className="mx-auto w-full max-w-[420px] rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
                  <div className="px-3 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shrink-0">
                        <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-zinc-900">
                          {userImage ? <img src={userImage} alt={userName} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center bg-pink-100"><span className="text-xs font-bold text-pink-600">{userName.charAt(0)}</span></div>}
                        </div>
                      </div>
                      <p className="text-xs font-bold text-foreground">{userName}</p>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </div>
                  {activeMedia ? (
                    renderPreviewMedia("w-full aspect-square object-contain bg-black")
                  ) : (
                    <div className="aspect-square bg-muted/40 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="px-3 py-2 flex gap-3 text-muted-foreground">
                    <span className="text-lg">🤍</span><span className="text-lg">💬</span><span className="text-lg">↗</span>
                  </div>
                  <div className="px-3 pb-2">
                    <p className="text-xs leading-relaxed text-foreground line-clamp-3">
                      <span className="font-bold mr-1">{userName}</span>
                      {caption || <span className="text-muted-foreground">Your caption...</span>}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
