"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addMonths,
  isSameDay,
  isSameMonth,
  parseISO,
  isToday,
} from "date-fns";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Calendar as CalendarIcon,
  Eye,
  X,
  Trash2,
  Pencil,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { FaFacebookF, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiInstagram, SiTiktok } from "react-icons/si";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ScheduledPost {
  id:           string;
  caption:      string | null;
  platforms:    string[];
  scheduledFor: string | null;
  status:       "DRAFT" | "SCHEDULED" | "PUBLISHED" | "FAILED" | "CANCELLED";
  imageUrl:     string | null;
  imageUrls:    string[];
  hashtags:     string[];
  createdAt:    string;
  publishedAt:  string | null;
  failureReason: string | null;
}

interface Stats {
  scheduled: number;
  drafts:    number;
  published: number;
}

type CalendarView = "week" | "month";

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: "bg-[#0d7c8a] text-white",
  DRAFT:     "bg-amber-500 text-white",
  PUBLISHED: "bg-emerald-600 text-white",
  FAILED:    "bg-red-500 text-white",
  CANCELLED: "bg-zinc-400 text-white",
};

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Scheduled",
  DRAFT:     "Draft Post",
  PUBLISHED: "Published",
  FAILED:    "Failed",
  CANCELLED: "Cancelled",
};

const STATUS_TEXT: Record<string, string> = {
  SCHEDULED: "text-[#0d7c8a]",
  DRAFT:     "text-amber-500",
  PUBLISHED: "text-emerald-600",
  FAILED:    "text-red-500",
  CANCELLED: "text-zinc-500",
};

const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM: "#E1306C",
  FACEBOOK:  "#1877F2",
  TWITTER:   "#111827",
  LINKEDIN:  "#0A66C2",
  TIKTOK:    "#111827",
  YOUTUBE:   "#FF0000",
};

function PlatformIcon({
  platform,
  className = "size-3",
}: {
  platform: string;
  className?: string;
}) {
  const normalized = platform.toUpperCase();
  const color = PLATFORM_COLORS[normalized] || "#64748b";

  if (normalized === "INSTAGRAM") return <SiInstagram className={className} style={{ color }} />;
  if (normalized === "FACEBOOK") return <FaFacebookF className={className} style={{ color }} />;
  if (normalized === "TWITTER" || normalized === "X") return <FaXTwitter className={className} style={{ color }} />;
  if (normalized === "LINKEDIN") return <FaLinkedinIn className={className} style={{ color }} />;
  if (normalized === "TIKTOK") return <SiTiktok className={className} style={{ color }} />;
  if (normalized === "YOUTUBE") return <FaYoutube className={className} style={{ color }} />;

  return (
    <span className="flex size-3 items-center justify-center rounded-full bg-muted-foreground/20 text-[7px] font-bold text-muted-foreground">
      {normalized.slice(0, 1)}
    </span>
  );
}

function PlatformIcons({ platforms }: { platforms: string[] }) {
  const visible = platforms.slice(0, 3);
  const extra = platforms.length - visible.length;

  return (
    <span className="flex items-center gap-1">
      {visible.map((platform) => (
        <span
          key={platform}
          className="flex size-4 items-center justify-center rounded-[4px] bg-background shadow-sm ring-1 ring-border"
          title={platform}
        >
          <PlatformIcon platform={platform} />
        </span>
      ))}
      {extra > 0 && (
        <span className="text-[10px] font-semibold text-muted-foreground">+{extra}</span>
      )}
    </span>
  );
}

// ── Post detail drawer ────────────────────────────────────────────────────────

function PostDrawer({
  post,
  onClose,
  onDeleted,
  onUpdated,
}: {
  post: ScheduledPost;
  onClose: () => void;
  onDeleted: (id: string) => void;
  onUpdated: (post: ScheduledPost) => void;
}) {
  const [isEditing,   setIsEditing]   = useState(false);
  const [isDeleting,  setIsDeleting]  = useState(false);
  const [isSaving,    setIsSaving]    = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [caption,     setCaption]     = useState(post.caption || "");
  const [scheduledFor, setScheduledFor] = useState(
    post.scheduledFor
      ? format(parseISO(post.scheduledFor), "yyyy-MM-dd'T'HH:mm")
      : ""
  );

  const canEdit   = post.status === "DRAFT" || post.status === "SCHEDULED";
  const canDelete = post.status !== "PUBLISHED";
  const canPublish = post.status === "DRAFT" || post.status === "SCHEDULED";

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/social/posts/${post.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          caption,
          scheduledFor: scheduledFor || null,
          isDraft:      scheduledFor ? false : post.status === "DRAFT",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      toast.success("Post updated");
      onUpdated(data.post);
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/social/posts/${post.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      toast.success("Post deleted");
      onDeleted(post.id);
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublishNow = async () => {
    if (!confirm("Publish this post now?")) return;
    setIsPublishing(true);
    try {
      const res = await fetch(`/api/social/posts/${post.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ publishNow: true, caption }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish");
      toast.success("Post published");
      onUpdated(data.post);
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 flex max-h-[92vh] w-[calc(100vw-24px)] max-w-[560px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[8px] border bg-background shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide", STATUS_STYLES[post.status])}>
              {post.status}
            </span>
            {post.scheduledFor && (
              <span className="text-xs text-muted-foreground">
                {format(parseISO(post.scheduledFor), "MMM d, h:mm a")}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Platforms */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Platforms</p>
            <div className="flex flex-wrap gap-1.5">
              {post.platforms.map((p) => (
                <span key={p} className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-muted px-2.5 py-1 rounded-lg">
                  <PlatformIcon platform={p} className="size-3.5" />
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Caption</p>
            {isEditing ? (
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="min-h-[140px] text-sm resize-none focus-visible:ring-[#0d7c8a]"
                placeholder="Write your caption..."
              />
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground bg-muted/40 rounded-xl p-3">
                {post.caption || <span className="text-muted-foreground italic">No caption</span>}
              </p>
            )}
          </div>

          {/* Hashtags */}
          {post.hashtags?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Hashtags</p>
              <div className="flex flex-wrap gap-1.5">
                {post.hashtags.map((tag, i) => (
                  <span key={i} className="text-[11px] text-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Media */}
          {post.imageUrls?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Media</p>
              <div className="grid grid-cols-3 gap-2">
                {post.imageUrls.map((url, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-muted">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule time (editable) */}
          {isEditing && canEdit && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Reschedule for</p>
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="w-full h-10 px-3 bg-muted/50 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0d7c8a]/30 dark:[color-scheme:dark]"
              />
            </div>
          )}

          {/* Failure reason */}
          {post.status === "FAILED" && post.failureReason && (
            <div className="flex gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-0.5">Failure reason</p>
                <p className="text-xs text-red-600 dark:text-red-400">{post.failureReason}</p>
              </div>
            </div>
          )}

          {/* Published info */}
          {post.status === "PUBLISHED" && post.publishedAt && (
            <div className="flex gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Published on {format(parseISO(post.publishedAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          )}

          {/* Created at */}
          <p className="text-[11px] text-muted-foreground">
            Created {format(parseISO(post.createdAt), "MMM d, yyyy")}
          </p>
        </div>

        {/* Footer actions */}
        <div className="border-t p-4">
          {isEditing ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#0d7c8a] hover:bg-[#0b6b78] text-white"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save changes"}
              </Button>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {canEdit && (
                <Button
                  variant="outline"
                  className="w-full gap-2 justify-center"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit / Reschedule
                </Button>
              )}
              {canPublish && (
                <Button
                  className="w-full gap-2 justify-center bg-[#0d7c8a] text-white hover:bg-[#0b6b78]"
                  onClick={handlePublishNow}
                  disabled={isPublishing}
                >
                  {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Post now
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="outline"
                  className="w-full gap-2 justify-center text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 sm:col-span-2"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete post
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Post card ─────────────────────────────────────────────────────────────────

function PostCard({
  post,
  onClick,
}: {
  post: ScheduledPost;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full rounded-[6px] border bg-background px-2 py-1.5 text-left shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:border-[#0d7c8a]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7c8a]/30",
        post.status === "PUBLISHED" && "bg-emerald-50/60 dark:bg-emerald-950/20",
        post.status === "DRAFT" && "bg-amber-50/70 dark:bg-amber-950/20",
        post.status === "FAILED" && "bg-red-50/70 dark:bg-red-950/20"
      )}
    >
      <div className="mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span className="size-2 rounded-full border border-muted-foreground/30" />
        <span className="truncate">
          {post.scheduledFor
            ? format(parseISO(post.scheduledFor), "h:mm a")
            : "No time"}
        </span>
      </div>
      <p className="line-clamp-1 text-[11px] font-semibold leading-snug text-foreground">
        {post.caption || "No caption"}
      </p>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className={cn("truncate text-[10px] font-bold", STATUS_TEXT[post.status] || "text-muted-foreground")}>
            {STATUS_LABELS[post.status] || post.status}
          </span>
          {post.imageUrls?.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <ImageIcon className="size-3" />
              {post.imageUrls.length}
            </span>
          )}
        </div>
        <PlatformIcons platforms={post.platforms} />
      </div>
    </button>
  );
}

// ── Main calendar ─────────────────────────────────────────────────────────────

export default function ContentCalendar() {
  const [posts,      setPosts]      = useState<ScheduledPost[]>([]);
  const [stats,      setStats]      = useState<Stats>({ scheduled: 0, drafts: 0, published: 0 });
  const [isLoading,  setIsLoading]  = useState(true);
  const [showAll,    setShowAll]    = useState(false);
  const [selected,   setSelected]   = useState<ScheduledPost | null>(null);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [viewMode, setViewMode] = useState<CalendarView>("month");
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const fetchPosts = async (all = showAll) => {
    setIsLoading(true);
    try {
      const res  = await fetch(`/api/social/scheduled?all=${all}`);
      const data = await res.json();
      setPosts(Array.isArray(data.posts) ? data.posts : []);
      if (data.stats) setStats(data.stats);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(showAll);
    const interval = window.setInterval(() => fetchPosts(showAll), 60_000);
    return () => window.clearInterval(interval);
  }, [showAll]);

  const calendarDays = useMemo(() => {
    const firstCalendarDay = viewMode === "month"
      ? startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 })
      : startOfWeek(currentMonth, { weekStartsOn: 0 });
    const lastCalendarDay = viewMode === "month"
      ? endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
      : endOfWeek(currentMonth, { weekStartsOn: 0 });
    const days: Date[] = [];

    for (let day = firstCalendarDay; day <= lastCalendarDay; day = addDays(day, 1)) {
      days.push(day);
    }

    return days;
  }, [currentMonth, viewMode]);

  const getPostsForDay = (date: Date) =>
    posts.filter((p) => {
      if (!p.scheduledFor) return false;
      try { return isSameDay(parseISO(p.scheduledFor), date); }
      catch { return false; }
    });

  const handleToggleAll = () => {
    const next = !showAll;
    setShowAll(next);
    fetchPosts(next);
  };

  const toggleExpandedDay = (key: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background p-3 text-foreground transition-colors duration-300 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1600px]">

        {/* Header */}
        <header className="mb-5 rounded-[8px] border bg-card/95 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <Badge variant="secondary" className="mb-2 gap-1.5 px-2.5 text-[11px]">
                <CalendarIcon className="size-3" />
                Weekly planner
              </Badge>
              <h1 className="text-2xl font-bold leading-tight sm:text-3xl">Content Calendar</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Click any post to view, edit, or delete it.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Link href="/user/generate" className="w-full sm:w-auto">
                <Button className="h-9 w-full gap-2 bg-[#0d7c8a] text-white shadow-sm hover:bg-[#0b6b78] sm:w-auto">
                  <Plus className="size-4" /> New Post
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <section className="overflow-hidden rounded-[8px] border bg-card shadow-sm">
          <div className="flex flex-col gap-3 border-b p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex rounded-[8px] bg-muted p-1">
                {[
                  { label: "Week", value: "week" as CalendarView },
                  { label: "Month", value: "month" as CalendarView },
                ].map(({ label, value }) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setViewMode(value)}
                    className={cn(
                      "rounded-[6px] px-3 py-1.5 text-xs font-medium text-muted-foreground",
                      viewMode === value && "bg-background text-foreground shadow-sm"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 lg:justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 border"
                onClick={() => setCurrentMonth(viewMode === "month" ? addMonths(currentMonth, -1) : addDays(currentMonth, -7))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 min-w-[160px] text-sm font-semibold"
                onClick={() => setCurrentMonth(startOfMonth(new Date()))}
              >
                {viewMode === "month"
                  ? format(currentMonth, "MMMM yyyy")
                  : `${format(startOfWeek(currentMonth, { weekStartsOn: 0 }), "MMM d")} - ${format(endOfWeek(currentMonth, { weekStartsOn: 0 }), "MMM d, yyyy")}`}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 border"
                onClick={() => setCurrentMonth(viewMode === "month" ? addMonths(currentMonth, 1) : addDays(currentMonth, 7))}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 text-xs"
              onClick={handleToggleAll}
            >
              <Eye className="size-3.5" />
              {showAll ? "Hide failed" : "Show failed"}
            </Button>
          </div>

          <div className="hidden grid-cols-7 border-b bg-muted/30 lg:grid">
            {WEEKDAYS.map((day) => (
              <div key={day} className="border-r px-3 py-3 text-center text-[11px] font-bold uppercase text-muted-foreground last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7">
            {calendarDays.map((day) => {
              const dayPosts = getPostsForDay(day);
              const dayKey = format(day, "yyyy-MM-dd");
              const expanded = expandedDays.has(dayKey);
              const visiblePosts = expanded ? dayPosts : dayPosts.slice(0, 3);
              const overflowCount = dayPosts.length - visiblePosts.length;
              const today = isToday(day);
              const outsideMonth = !isSameMonth(day, currentMonth);

              return (
                <div
                  key={dayKey}
                  className={cn(
                    "min-h-[190px] border-b border-r bg-background p-2.5 lg:min-h-[150px]",
                    outsideMonth && "bg-muted/20 text-muted-foreground",
                    today && "bg-[#0d7c8a]/10"
                  )}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground lg:hidden">
                      {format(day, "EEEE")}
                    </span>
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-[6px] text-sm font-bold",
                        today ? "bg-[#0d7c8a] text-white" : "text-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {isLoading ? (
                      <div className="h-12 animate-pulse rounded-[6px] bg-muted" />
                    ) : (
                      visiblePosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onClick={() => setSelected(post)}
                        />
                      ))
                    )}

                    {!isLoading && overflowCount > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleExpandedDay(dayKey)}
                        className="w-full rounded-[6px] border bg-background px-2 py-1.5 text-center text-[11px] font-semibold hover:bg-muted"
                      >
                        See All (+{overflowCount})
                      </button>
                    )}

                    {!isLoading && today && dayPosts.length === 0 && (
                      <Link href="/user/generate" className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold text-[#0d7c8a]">
                        <Plus className="size-3.5" />
                        Create Post
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Post detail drawer */}
      {selected && (
        <PostDrawer
          post={selected}
          onClose={() => setSelected(null)}
          onDeleted={(id) => {
            setPosts((prev) => prev.filter((p) => p.id !== id));
            setStats((prev) => ({
              ...prev,
              scheduled: selected.status === "SCHEDULED" ? prev.scheduled - 1 : prev.scheduled,
              drafts:    selected.status === "DRAFT"     ? prev.drafts - 1     : prev.drafts,
            }));
          }}
          onUpdated={(updated) => {
            const nextPost = updated as ScheduledPost;
            const previousStatus = selected.status;
            const nextStatus = nextPost.status;

            setPosts((prev) => prev.map((p) => (p.id === nextPost.id ? nextPost : p)));
            setSelected(nextPost);
            setStats((prev) => ({
              ...prev,
              scheduled: prev.scheduled
                + (nextStatus === "SCHEDULED" ? 1 : 0)
                - (previousStatus === "SCHEDULED" ? 1 : 0),
              drafts: prev.drafts
                + (nextStatus === "DRAFT" ? 1 : 0)
                - (previousStatus === "DRAFT" ? 1 : 0),
              published: prev.published
                + (nextStatus === "PUBLISHED" ? 1 : 0)
                - (previousStatus === "PUBLISHED" ? 1 : 0),
            }));
          }}
        />
      )}
    </div>
  );
}
