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
import { getPlatformIcon } from "@/lib/platforms";

const DEFAULT_LIMITS = {
  FREE: { dailyCaptions: 10, monthlySchedules: 15 },
  PRO:  { dailyCaptions: Infinity, monthlySchedules: Infinity },
};

// Renders the brand icon for any platform string using the shared platform config
const PlatformIcon = ({ platform }: { platform: string }) => {
  const Icon = getPlatformIcon(platform);
  return <Icon className="w-3.5 h-3.5" />;
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
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
                <Zap size={16} fill="white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">
                  {isUnlimited ? `${plan} Plan` : "Free Plan"}
                </p>
                {isUnlimited ? (
                  <a href="/api/billing-portal">
                    <Button size="sm" className="mt-3 bg-primary hover:bg-primary/90 text-white text-xs font-bold h-8 px-4 rounded-lg">
                      Manage Plan
                    </Button>
                  </a>
                ) : (
                  <a href="/api/checkout">
                    <Button size="sm" className="mt-3 bg-primary hover:bg-primary/90 text-white text-xs font-bold h-8 px-4 rounded-lg">
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
