import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Sparkles } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/componentss/shared/CopyButton";

export default async function HistoryPage({
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
        take: 50,
      })
    : [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Content History</h1>
        <p className="text-muted-foreground mt-1">All your generated content in one place.</p>
        {query && (
          <p className="text-sm text-primary mt-1">
            Showing results for: <strong>"{query}"</strong>{" "}
            <Link href="/user/history" className="underline text-muted-foreground">Clear</Link>
          </p>
        )}
      </div>

      {generations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <History className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">{query ? "No results found" : "No content yet"}</h3>
          <p className="text-muted-foreground text-sm text-center max-w-sm">
            {query
              ? "Try a different search term."
              : "Start generating captions and images. They'll all be saved here automatically."}
          </p>
          <Link href="/user/generate" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate your first post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {generations.map((gen) => (
            <Card key={gen.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{gen.platform}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(gen.createdAt).toLocaleDateString()}
                </span>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm font-medium text-muted-foreground">{gen.topic}</p>
                <p className="text-sm line-clamp-3">{gen.caption}</p>
                <div className="flex flex-wrap gap-1">
                  {gen.hashtags.slice(0, 5).map((tag, i) => (
                    <span key={i} className="text-xs text-primary">{tag}</span>
                  ))}
                  {gen.hashtags.length > 5 && (
                    <span className="text-xs text-muted-foreground">+{gen.hashtags.length - 5} more</span>
                  )}
                </div>
                <CopyButton text={`${gen.caption}\n\n${gen.hashtags.join(" ")}`} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}