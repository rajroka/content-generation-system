import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PenLine, Send, History, Calendar, ArrowRight, Zap,
  ImageUp, BarChart3, FileText, Clock,
} from "lucide-react";
import Link from "next/link";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, format } from "date-fns";
import { UpgradeNotifier } from "@/componentss/dashboard/UpgradeNotifier";

const DEFAULT_LIMITS = {
  FREE: { dailyCaptions: 10, monthlySchedules: 15 },
  PRO:  { dailyCaptions: Infinity, monthlySchedules: Infinity },
};

const PLATFORM_COLORS: Record<string, string> = {
  INSTAGRAM: "bg-pink-500",
  FACEBOOK:  "bg-blue-600",
  TWITTER:   "bg-zinc-900",
  LINKEDIN:  "bg-sky-600",
  YOUTUBE:   "bg-red-600",
  TIKTOK:    "bg-zinc-900",
};

const PLATFORM_LABELS: Record<string, string> = {
  INSTAGRAM: "IG",
  FACEBOOK:  "FB",
  TWITTER:   "X",
  LINKEDIN:  "IN",
  YOUTUBE:   "YT",
  TIKTOK:    "TT",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params  = await searchParams;
  const upgraded = params.upgraded === "true";
  const clerkUser = await currentUser();

  let user = await prisma.user.findUnique({ where: { clerkId: userId } });
  let plan = user?.plan ?? "FREE";

  if (upgraded && user && plan !== "PRO") {
    user = await prisma.user.update({ where: { id: user.id }, data: { plan: "PRO" } });
    plan = "PRO";
  }

  const today      = startOfDay(new Date());
  const todayEnd   = endOfDay(new Date());
  const monthStart = startOfMonth(new Date());
  const monthEnd   = endOfMonth(new Date());

  const planLimitRecord = await prisma.planLimit.findUnique({
    where: { plan: plan as "FREE" | "PRO" },
  });

  const limits = {
    dailyCaptions:    planLimitRecord?.dailyCaptions    ?? DEFAULT_LIMITS[plan as keyof typeof DEFAULT_LIMITS]?.dailyCaptions    ?? 10,
    monthlySchedules: planLimitRecord ? Infinity : DEFAULT_LIMITS[plan as keyof typeof DEFAULT_LIMITS]?.monthlySchedules ?? 15,
  };

  const isUnlimited = plan === "PRO";

  const [
    captionsToday,
    postsPublished,
    totalGenerations,
    scheduledCount,
    monthlyScheduleCount,
    recentPosts,
    upcomingPosts,
    recentDrafts,
  ] = user
    ? await Promise.all([
        prisma.generation.count({
          where: { userId: user.id, createdAt: { gte: today, lte: todayEnd }, isDeleted: false },
        }),
        prisma.scheduledPost.count({ where: { userId: user.id, status: "PUBLISHED" } }),
        prisma.generation.count({ where: { userId: user.id, isDeleted: false } }),
        prisma.scheduledPost.count({ where: { userId: user.id, status: "SCHEDULED" } }),
        prisma.scheduledPost.count({
          where: {
            userId: user.id,
            status: { in: ["SCHEDULED", "PUBLISHED"] },
            createdAt: { gte: monthStart, lte: monthEnd },
          },
        }),
        prisma.scheduledPost.findMany({
          where: { userId: user.id, status: { in: ["PUBLISHED", "SCHEDULED", "DRAFT"] } },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.scheduledPost.findMany({
          where: { userId: user.id, status: "SCHEDULED", scheduledFor: { gte: new Date() } },
          orderBy: { scheduledFor: "asc" },
          take: 3,
        }),
        prisma.scheduledPost.findMany({
          where: { userId: user.id, status: "DRAFT" },
          orderBy: { updatedAt: "desc" },
          take: 3,
        }),
      ])
    : [0, 0, 0, 0, 0, [], [], []];

  const stats = [
    { title: "Posts Created",    value: totalGenerations, icon: PenLine,  description: "All time"                                                                    },
    { title: "Posts Published",  value: postsPublished,   icon: Send,     description: "All time"                                                                    },
    { title: "Scheduled Posts",  value: scheduledCount,   icon: Calendar, description: "Upcoming"                                                                    },
    { title: "Captions Today",   value: captionsToday,    icon: History,  description: isUnlimited ? "Unlimited" : `${captionsToday} / ${limits.dailyCaptions}`      },
  ];

  const captionLimitDisplay   = isUnlimited ? "∞" : limits.dailyCaptions;
  const scheduleLimitDisplay  = isUnlimited ? "∞" : 15;
  const captionProgressWidth  = isUnlimited ? "100%" : `${Math.min((captionsToday / (limits.dailyCaptions || 10)) * 100, 100)}%`;
  const scheduleProgressWidth = isUnlimited ? "100%" : `${Math.min((monthlyScheduleCount / 15) * 100, 100)}%`;

  const quickActions = [
    { label: "Create Post",   desc: "Generate content with AI",     icon: PenLine,   href: "/user/generate"  },
    { label: "View Calendar", desc: "See your content schedule",    icon: Calendar,  href: "/user/calendar"  },
    { label: "Analytics",     desc: "Track performance and growth", icon: BarChart3, href: "/user/analytics" },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <UpgradeNotifier upgraded={upgraded} />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-xl font-bold">Welcome, {clerkUser?.firstName} 👋</h1>
        {/* <p className="text-muted-foreground mt-1 text-sm">
          You have {scheduledCount} post{scheduledCount !== 1 ? "s" : ""} currently in queue
        </p> */}
      </div>

      {/* Quick Actions */}
      <div>
        {/* <h2 className="text-base font-bold text-foreground mb-3">Quick Actions</h2> */}
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Card className="border-none shadow-sm rounded-lg hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg shrink-0">
                    <action.icon size={16} className="text-[#0d7c8a]" />
                  </div>
                  <p className="text-sm font-bold text-foreground">{action.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Posts + Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground">Recent Posts</h2>
            <Link href="/user/history" className="text-xs font-semibold text-[#0d7c8a] flex items-center gap-1 hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <Card className="border-none shadow-sm rounded-lg overflow-hidden">
            <CardContent className="p-0">
              {(recentPosts as any[]).length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No posts yet.{" "}
                  <Link href="/user/generate" className="text-[#0d7c8a] font-semibold hover:underline">
                    Create your first post
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground">
                    <span>Post</span>
                    <span>Status</span>
                    <span>Platform</span>
                    <span>Date</span>
                  </div>
                  {(recentPosts as any[]).map((post) => {
                    const platforms: string[] = Array.isArray(post.platforms) ? post.platforms : [];
                    return (
                      <div key={post.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors">
                        <p className="text-sm font-medium text-foreground truncate">
                          {post.caption ? post.caption.slice(0, 50) + (post.caption.length > 50 ? "…" : "") : "Untitled post"}
                        </p>
                        <Badge
                          variant="secondary"
                          className={
                            post.status === "PUBLISHED"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold"
                              : post.status === "SCHEDULED"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold"
                              : "bg-muted text-muted-foreground text-[10px] font-bold"
                          }
                        >
                          {post.status === "PUBLISHED" ? "Published" : post.status === "SCHEDULED" ? "Scheduled" : "Draft"}
                        </Badge>
                        <div className="flex gap-1">
                          {platforms.slice(0, 2).map((p: string) => (
                            <span key={p} className={`inline-flex items-center justify-center w-5 h-5 rounded text-white text-[9px] font-bold ${PLATFORM_COLORS[p] ?? "bg-slate-500"}`}>
                              {PLATFORM_LABELS[p] ?? p.slice(0, 2)}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {post.scheduledFor
                            ? format(new Date(post.scheduledFor), "MMM d, yyyy")
                            : post.status === "DRAFT"
                            ? "—"
                            : format(new Date(post.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="mt-2 text-center">
            <Link href="/user/history" className="text-xs font-semibold text-[#0d7c8a] hover:underline">
              View all posts →
            </Link>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">

          {/* Upcoming Posts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-foreground">Upcoming Posts</h2>
              <Link href="/user/calendar" className="text-xs font-semibold text-[#0d7c8a] flex items-center gap-1 hover:underline">
                View calendar <ArrowRight size={12} />
              </Link>
            </div>
            <Card className="border-none shadow-sm rounded-lg">
              <CardContent className="p-0">
                {(upcomingPosts as any[]).length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No upcoming posts.{" "}
                    <Link href="/user/generate" className="text-[#0d7c8a] font-semibold hover:underline">Schedule one</Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {(upcomingPosts as any[]).map((post) => {
                      const platforms: string[] = Array.isArray(post.platforms) ? post.platforms : [];
                      const firstPlatform = platforms[0] ?? "";
                      return (
                        <div key={post.id} className="flex items-center gap-3 px-4 py-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                            {post.imageUrl ? (
                              <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <FileText size={16} className="text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {post.caption ? post.caption.slice(0, 30) + (post.caption.length > 30 ? "…" : "") : "Untitled"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {post.scheduledFor ? format(new Date(post.scheduledFor), "MMM d, yyyy 'at' h:mm a") : "—"}
                            </p>
                          </div>
                          {firstPlatform && (
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-white text-[9px] font-bold shrink-0 ${PLATFORM_COLORS[firstPlatform] ?? "bg-slate-500"}`}>
                              {PLATFORM_LABELS[firstPlatform] ?? firstPlatform.slice(0, 2)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="px-4 py-2 border-t border-border">
                  <Link href="/user/calendar" className="text-xs font-semibold text-[#0d7c8a] hover:underline">
                    View all scheduled →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Drafts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-foreground">Recent Drafts</h2>
              <Link href="/user/history" className="text-xs font-semibold text-[#0d7c8a] flex items-center gap-1 hover:underline">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <Card className="border-none shadow-sm rounded-lg">
              <CardContent className="p-0">
                {(recentDrafts as any[]).length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">No drafts yet.</div>
                ) : (
                  <div className="divide-y divide-border">
                    {(recentDrafts as any[]).map((draft) => (
                      <div key={draft.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="p-1.5 bg-muted rounded-lg shrink-0">
                          <FileText size={14} className="text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {draft.caption ? draft.caption.slice(0, 35) + (draft.caption.length > 35 ? "…" : "") : "Untitled draft"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock size={10} />
                            {draft.updatedAt ? `Updated ${format(new Date(draft.updatedAt), "MMM d")}` : "—"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Plan Banner */}
          <Card className="border-none shadow-sm rounded-lg">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-9 h-9 bg-[#0d7c8a] rounded-lg flex items-center justify-center text-white shrink-0">
                <Zap size={16} fill="white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">
                  {isUnlimited ? `You're on ${plan} Plan` : "You're on Free Plan"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isUnlimited ? "Enjoy unlimited posts, AI credits & more." : "Upgrade for unlimited posts & AI credits."}
                </p>
                <Link href={isUnlimited ? "/api/billing-portal" : "/pricing"}>
                  <Button size="sm" className="mt-3 bg-[#0d7c8a] hover:bg-[#0b6a75] text-white text-xs font-bold h-8 px-4 rounded-lg">
                    {isUnlimited ? "Manage Plan →" : "Upgrade Now →"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
