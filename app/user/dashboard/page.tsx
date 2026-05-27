import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PenLine, Calendar, ArrowRight, Zap,
  BarChart3, FileText,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { UpgradeNotifier } from "@/componentss/dashboard/UpgradeNotifier";

const DEFAULT_LIMITS = {
  FREE: { dailyCaptions: 10, monthlySchedules: 15 },
  PRO:  { dailyCaptions: Infinity, monthlySchedules: Infinity },
};

// Real brand SVG icons for platforms
const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform.toUpperCase()) {
    case "INSTAGRAM":
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="url(#ig)">
          <defs>
            <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F58529"/>
              <stop offset="50%" stopColor="#DD2A7B"/>
              <stop offset="100%" stopColor="#8134AF"/>
            </linearGradient>
          </defs>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      );
    case "FACEBOOK":
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#1877F2">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.883v2.258h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
        </svg>
      );
    case "TIKTOK":
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
        </svg>
      );
    case "YOUTUBE":
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#FF0000">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case "TWITTER":
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.903-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case "LINKEDIN":
      return (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#0A66C2">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      );
    default:
      return <span className="text-[9px] font-bold">{platform.slice(0, 2)}</span>;
  }
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

  if (user) {
    await prisma.scheduledPost.updateMany({
      where: {
        userId: user.id,
        status: "SCHEDULED",
        scheduledFor: { lte: new Date() },
      },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  }

  const isUnlimited = plan === "PRO";

  const [
    recentPosts,
    upcomingPosts,
  ] = user
    ? await Promise.all([
        prisma.scheduledPost.findMany({
          where: { userId: user.id, status: { in: ["PUBLISHED", "SCHEDULED"] } },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.scheduledPost.findMany({
          where: { userId: user.id, status: "SCHEDULED", scheduledFor: { gte: new Date() } },
          orderBy: { scheduledFor: "asc" },
          take: 3,
        }),
      ])
    : [[], []];

  const quickActions = [
    { label: "Create Post",   icon: PenLine,   href: "/user/generate"  },
    { label: "View Calendar", icon: Calendar,  href: "/user/calendar"  },
    { label: "Analytics",     icon: BarChart3, href: "/user/analytics" },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <UpgradeNotifier upgraded={upgraded} />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-xl font-bold">Welcome, {clerkUser?.firstName} 👋</h1>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Card className="border-none shadow-sm rounded-lg hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg shrink-0">
                    <action.icon size={16} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-bold text-foreground">{action.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-bold text-foreground mb-3">Recent Posts</h2>
          <Card className="border-none shadow-sm rounded-lg overflow-hidden">
            <CardContent className="p-0">
              {(recentPosts as any[]).length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No posts yet.{" "}
                  <Link href="/user/generate" className="text-foreground font-semibold hover:underline">
                    Create your first post
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  <div className="grid grid-cols-[36px_1fr_auto_auto_auto] gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground">
                    <span></span>
                    <span>Post</span>
                    <span>Status</span>
                    <span>Platform</span>
                    <span>Date</span>
                  </div>
                  {(recentPosts as any[]).map((post) => {
                    const platforms: string[] = Array.isArray(post.platforms) ? post.platforms : [];
                    const thumb = post.imageUrl ?? (Array.isArray(post.imageUrls) && post.imageUrls[0]) ?? null;
                    return (
                      <div key={post.id} className="grid grid-cols-[36px_1fr_auto_auto_auto] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors">
                        {/* Thumbnail */}
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
                          {thumb ? (
                            <img src={thumb} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <FileText size={14} className="text-muted-foreground/50" />
                          )}
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">
                          {post.caption ? post.caption.slice(0, 50) + (post.caption.length > 50 ? "…" : "") : "Untitled post"}
                        </p>
                        <Badge
                          className={
                            post.status === "PUBLISHED"
                              ? "bg-emerald-700 text-white text-[10px] font-bold border-0"
                              : post.status === "SCHEDULED"
                              ? "bg-blue-700 text-white text-[10px] font-bold border-0"
                              : "bg-slate-600 text-white text-[10px] font-bold border-0"
                          }
                        >
                          {post.status === "PUBLISHED" ? "Published" : "Scheduled"}
                        </Badge>
                        <div className="flex gap-1">
                          {platforms.slice(0, 2).map((p: string) => (
                            <span key={p} className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-muted">
                              <PlatformIcon platform={p} />
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {post.scheduledFor
                            ? format(new Date(post.scheduledFor), "MMM d, yyyy")
                            : format(new Date(post.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">

          {/* Upcoming Posts */}
          <div>
            <h2 className="text-base font-bold text-foreground mb-3">Upcoming Posts</h2>
            <Card className="border-none shadow-sm rounded-lg">
              <CardContent className="p-0">
                {(upcomingPosts as any[]).length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No upcoming posts.
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
                              {post.scheduledFor ? format(new Date(post.scheduledFor), "MMM d, h:mm a") : "—"}
                            </p>
                          </div>
                          {firstPlatform && (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-muted shrink-0">
                              <PlatformIcon platform={firstPlatform} />
                            </span>
                          )}
                        </div>
                      );
                    })}
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
                  {isUnlimited ? `${plan} Plan` : "Free Plan"}
                </p>
                {isUnlimited ? (
                  <a href="/api/billing-portal">
                    <Button size="sm" className="mt-3 bg-[#0d7c8a] hover:bg-[#0b6a75] text-white text-xs font-bold h-8 px-4 rounded-lg">
                      Manage Plan
                    </Button>
                  </a>
                ) : (
                  <a href="/api/checkout">
                    <Button size="sm" className="mt-3 bg-[#0d7c8a] hover:bg-[#0b6a75] text-white text-xs font-bold h-8 px-4 rounded-lg">
                      Upgrade Now
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
