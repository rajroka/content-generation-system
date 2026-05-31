"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Sparkles, Trash2, Search, X } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/componentss/shared/CopyButton";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface Generation {
  id: string;
  platform: string;
  topic: string;
  caption: string;
  hashtags: string[];
  createdAt: string;
}

export default function LibraryPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [query, setQuery]             = useState("");
  const [deleting, setDeleting]       = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/generations", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setGenerations(data);
        } else {
          setError(data?.error || "Failed to load history");
          setGenerations([]);
        }
      })
      .catch(() => setError("Network error — could not load history"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return generations;
    return generations.filter(
      (g) =>
        g.topic.toLowerCase().includes(q) ||
        g.caption.toLowerCase().includes(q),
    );
  }, [generations, query]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    setDeleting(id);
    try {
      const res = await fetch("/api/user/generations/delete", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
      setGenerations((prev) => prev.filter((g) => g.id !== id));
      toast.success("Entry deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="mb-6 h-8 w-40 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-destructive" />
        </div>
        <h3 className="font-semibold text-lg text-foreground">Failed to load history</h3>
        <p className="text-muted-foreground text-sm max-w-sm">{error}</p>
        <button
          onClick={() => { setError(null); setLoading(true); fetch("/api/user/generations", { cache: "no-store" }).then(r => r.json()).then(data => setGenerations(Array.isArray(data) ? data : [])).catch(() => setError("Network error")).finally(() => setLoading(false)); }}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-foreground">Library</h1>

        {/* Live search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search captions or topics…"
            className="w-full rounded-lg border border-border bg-card pl-8 pr-8 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Count */}
      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground mb-4">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          {query && ` for "${query}"`}
        </p>
      )}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 gap-4 text-center px-4"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-semibold text-lg text-foreground">
            {query ? "No results found" : "Your library is empty"}
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            {query
              ? "Try a different search term."
              : "Every caption and hashtag set you generate will be saved here automatically."}
          </p>
          {!query && (
            <Link
              href="/user/generate"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate your first post
            </Link>
          )}
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((gen, i) => {
              // Caption already contains hashtags appended during generation.
              // Only show the separate hashtag row if not already in caption.
              const captionHasHashtags =
                gen.hashtags.length > 0 &&
                gen.hashtags.some((tag) =>
                  gen.caption.includes(tag.startsWith("#") ? tag : `#${tag}`)
                );

              return (
                <motion.div
                  key={gen.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                >
                  <Card className="border border-border bg-card shadow-sm rounded-xl flex flex-col h-full">
                    <CardContent className="flex flex-col gap-3 p-4 flex-1">
                      {/* Top row: date + delete */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          <span className="text-foreground font-semibold">Topic:</span> {gen.topic}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {format(new Date(gen.createdAt), "MMM d, yyyy")}
                          </span>
                          <button
                            onClick={() => handleDelete(gen.id)}
                            disabled={deleting === gen.id}
                            className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Caption — already includes hashtags */}
                      <p className="text-sm text-foreground leading-relaxed flex-1 whitespace-pre-wrap">
                        {gen.caption}
                      </p>

                      {/* Hashtag row — only if NOT already in caption */}
                      {!captionHasHashtags && gen.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border">
                          {gen.hashtags.map((tag, idx) => (
                            <span key={idx} className="text-xs font-medium text-primary">
                              {tag.startsWith("#") ? tag : `#${tag}`}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Copy button */}
                      <CopyButton text={gen.caption} />
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
