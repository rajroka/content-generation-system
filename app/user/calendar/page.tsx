"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  parseISO,
  isToday,
} from "date-fns";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  X,
  Trash2,
  Pencil,
  Send,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
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

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: "bg-[#0d7c8a] text-white",
  DRAFT:     "bg-amber-500 text-white",
  PUBLISHED: "bg-emerald-600 text-white",
  FAILED:    "bg-red-500 text-white",
  CANCELLED: "bg-zinc-400 text-white",
};

const STATUS_CARD: Record<string, string> = {
  SCHEDULED: "bg-[#0d7c8a]/90 text-white",
  DRAFT:     "bg-amber-500/90 text-white",
  PUBLISHED: "bg-emerald-700/90 text-white",
  FAILED:    "bg-red-600/90 text-white",
  CANCELLED: "bg-zinc-500/90 text-white",
};

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
  const [caption,     setCaption]     = useState(post.caption || "");
  const [scheduledFor, setScheduledFor] = useState(
    post.scheduledFor
      ? format(parseISO(post.scheduledFor), "yyyy-MM-dd'T'HH:mm")
      : ""
  );

  const canEdit   = post.status === "DRAFT" || post.status === "SCHEDULED";
  const canDelete = post.status !== "PUBLISHED";

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/social/posts/${post.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          caption,
          scheduledFor: scheduledFor || null,
          isDraft:      post.status === "DRAFT",
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

  const handleConvertToDraft = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/social/posts/${post.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isDraft: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to convert");
      toast.success("Moved to drafts");
      onUpdated(data.post);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-background border-l border-border shadow-2xl z-50 flex flex-col overflow-hidden">

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
                <span key={p} className="text-[11px] font-semibold bg-muted px-2.5 py-1 rounded-lg">
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
                  <span key={i} className="text-[11px] text-[#0d7c8a] bg-[#0d7c8a]/10 px-2 py-0.5 rounded-full font-medium">
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
          {isEditing && post.status !== "DRAFT" && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Scheduled for</p>
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
        <div className="border-t p-4 space-y-2">
          {isEditing ? (
            <div className="flex gap-2">
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
            <>
              {canEdit && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit post
                </Button>
              )}
              {post.status === "SCHEDULED" && (
                <Button
                  variant="outline"
                  className="w-full gap-2 text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  onClick={handleConvertToDraft}
                  disabled={isSaving}
                >
                  <FileText className="w-3.5 h-3.5" /> Move to drafts
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="outline"
                  className="w-full gap-2 text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete post
                </Button>
              )}
              <Link href="/user/generate" className="block">
                <Button className="w-full gap-2 bg-[#0d7c8a] hover:bg-[#0b6b78] text-white">
                  <Plus className="w-3.5 h-3.5" /> Create new post
                </Button>
              </Link>
            </>
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
        "w-full text-left rounded-xl p-2.5 space-y-1.5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
        STATUS_CARD[post.status] || "bg-zinc-500/90 text-white"
      )}
    >
      <p className="text-[11px] font-bold leading-tight line-clamp-2">
        {post.caption || "No caption"}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-semibold opacity-80 uppercase tracking-wide">
          {post.status}
        </span>
        <span className="text-[9px] opacity-70 font-mono">
          {post.scheduledFor
            ? format(parseISO(post.scheduledFor), "HH:mm")
            : "—"}
        </span>
      </div>
      {post.imageUrls?.length > 0 && (
        <div className="flex items-center gap-1 opacity-70">
          <ImageIcon className="w-2.5 h-2.5" />
          <span className="text-[9px]">{post.imageUrls.length} media</span>
        </div>
      )}
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
  const [weekStart,  setWeekStart]  = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

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

  useEffect(() => { fetchPosts(); }, []);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

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

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 transition-colors duration-300">      <div className="max-w-[1600px] mx-auto">

        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Content Calendar</h1>
            <p className="text-muted-foreground text-sm mt-1">Click any post to view, edit, or delete it.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleToggleAll}
            >
              {showAll ? "Hide published" : "Show published"}
            </Button>
            <Link href="/user/generate">
              <Button className="bg-[#0d7c8a] hover:bg-[#0b6b78] text-white gap-2 shadow-sm">
                <Plus className="w-4 h-4" /> New Post
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Calendar */}
          <div className="xl:col-span-9 space-y-0">

            {/* Week nav */}
            <div className="flex items-center justify-between bg-card border border-b-0 rounded-t-xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <span>
                  {format(weekDays[0], "MMM d")} – {format(weekDays[6], "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                >
                  Today
                </Button>
                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none"
                    onClick={() => setWeekStart(addDays(weekStart, -7))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none"
                    onClick={() => setWeekStart(addDays(weekStart, 7))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Day columns — horizontal scroll on mobile */}
            <div className="overflow-x-auto">
              <div className="grid grid-cols-7 border rounded-b-xl bg-card shadow-sm min-w-[560px]">
              {weekDays.map((day, idx) => {
                const dayPosts = getPostsForDay(day);
                const today    = isToday(day);
                return (
                  <div
                    key={idx}
                    className={cn(
                      "min-h-[560px] border-r last:border-r-0 flex flex-col",
                      today && "bg-[#0d7c8a]/5"
                    )}
                  >
                    {/* Day header */}
                    <div className={cn(
                      "p-2 text-center border-b",
                      today ? "bg-[#0d7c8a]/10" : "bg-muted/30"
                    )}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {format(day, "EEE")}
                      </p>
                      <p className={cn(
                        "text-sm font-bold mt-0.5",
                        today ? "text-[#0d7c8a]" : "text-foreground"
                      )}>
                        {format(day, "d")}
                      </p>
                    </div>

                    {/* Posts */}
                    <div className="p-1.5 flex flex-col gap-1.5 flex-1 overflow-y-auto">
                      {isLoading ? (
                        <div className="h-14 bg-muted animate-pulse rounded-lg" />
                      ) : dayPosts.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-[10px] text-muted-foreground/40">—</span>
                        </div>
                      ) : (
                        dayPosts.map((post) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            onClick={() => setSelected(post)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="xl:col-span-3 space-y-3">

            {/* Scheduled */}
            <Card className="border-[#0d7c8a]/20 bg-[#0d7c8a]/5">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-[#0d7c8a]" />
                  <p className="text-sm font-semibold text-[#0d7c8a]">Scheduled</p>
                </div>
                <p className="text-3xl font-black text-foreground">{stats.scheduled}</p>
                <p className="text-xs text-muted-foreground mt-0.5">posts queued</p>
              </CardContent>
            </Card>

            {/* Drafts */}
            <Card className="border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/30">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Drafts</p>
                </div>
                <p className="text-3xl font-black text-foreground">{stats.drafts}</p>
                <p className="text-xs text-muted-foreground mt-0.5">saved drafts</p>
              </CardContent>
            </Card>

            {/* Published */}
            <Card className="border-emerald-200/50 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800/30">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Published</p>
                </div>
                <p className="text-3xl font-black text-foreground">{stats.published}</p>
                <p className="text-xs text-muted-foreground mt-0.5">posts live</p>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Legend</p>
                {[
                  { label: "Scheduled", color: "bg-[#0d7c8a]" },
                  { label: "Draft",     color: "bg-amber-500" },
                  { label: "Published", color: "bg-emerald-600" },
                  { label: "Failed",    color: "bg-red-500" },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", color)} />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

          </aside>
        </div>
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
            setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated as ScheduledPost : p)));
            setSelected(updated as ScheduledPost);
          }}
        />
      )}
    </div>
  );
}
