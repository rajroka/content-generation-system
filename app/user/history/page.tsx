import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Sparkles, Hash } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/componentss/shared/CopyButton";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM: "#E1306C",
  FACEBOOK: "#1877F2",
  TIKTOK: "#69C9D0",
  YOUTUBE: "#FF0000",
};

function platformBadgeStyle(platform: string) {
  const color = PLATFORM_COLORS[platform.toUpperCase()] ?? "#169B7F";
  return {
    color,
    borderColor: `${color}55`,
    backgroundColor: `${color}12`,
  };
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  const query = searchParams.q ?? "";

  const generations = user
    ? await prisma.generation.findMany({
        where: {
          userId: user.id,
          isDeleted: false,
          ...(query
            ? {
                OR: [
                  { topic: { contains: query, mode: "insensitive" } },
                  { caption: { contains: query, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Library</h1>
        </div>

        {/* Search */}
        <form method="GET" className="w-full sm:w-72">
          <div className="relative">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search captions or topics…"
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#169B7F]/40 pr-16"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 rounded-md bg-[#169B7F] px-3 py-1 text-xs font-semibold text-white hover:bg-[#138a6e] transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {query && (
        <p className="text-sm text-[#169B7F] mb-4">
          Results for: <strong>"{query}"</strong>{" "}
          <Link href="/user/history" className="underline text-muted-foreground ml-2">
            Clear
          </Link>
        </p>
      )}

      {/* Count */}
      {generations.length > 0 && (
        <p className="text-xs text-muted-foreground mb-4">
          {generations.length} {generations.length === 1 ? "entry" : "entries"}
        </p>
      )}

      {generations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-4">
          <div className="w-14 h-14 rounded-full bg-[#169B7F]/10 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-[#169B7F]" />
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
              className="inline-flex items-center justify-center rounded-lg bg-[#169B7F] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#138a6e] transition-colors"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate your first post
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {generations.map((gen) => (
            <Card key={gen.id} className="border-none shadow-sm rounded-lg flex flex-col">
              <CardContent className="flex flex-col gap-3 p-4 flex-1">
                {/* Top row: platform badge + date */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold"
                    style={platformBadgeStyle(gen.platform)}
                  >
                    {gen.platform.charAt(0) + gen.platform.slice(1).toLowerCase()}
                  </span>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {format(new Date(gen.createdAt), "MMM d, yyyy")}
                  </span>
                </div>

                {/* Topic */}
                <p className="text-xs font-semibold text-[#169B7F] uppercase tracking-wide">
                  {gen.topic}
                </p>

                {/* Caption — full text */}
                <p className="text-sm text-foreground leading-relaxed flex-1">
                  {gen.caption}
                </p>

                {/* Hashtags */}
                {gen.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border">
                    <Hash className="w-3.5 h-3.5 text-[#169B7F] mt-0.5 shrink-0" />
                    {gen.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs font-medium text-[#169B7F]"
                      >
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                )}

                {/* Copy button */}
                <CopyButton text={`${gen.caption}\n\n${gen.hashtags.join(" ")}`} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
