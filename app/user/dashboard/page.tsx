import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Send, History, Calendar, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { UpgradeNotifier } from "@/componentss/dashboard/UpgradeNotifier";

// Default plan limits — used as fallback if PlanLimit table is empty
const DEFAULT_LIMITS = {
  FREE: { dailyCaptions: 10, monthlySchedules: 15 },
  PRO:  { dailyCaptions: Infinity, monthlySchedules: Infinity },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;
  const upgraded = params.upgraded === "true";

  const clerkUser = await currentUser();

  let user = await prisma.user.findUnique({ where: { clerkId: userId } });
  let plan = user?.plan ?? "FREE";

  // Force DB update if we returned from a successful Stripe checkout
  if (upgraded && user && plan !== "PRO") {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { plan: "PRO" },
    });
    plan = "PRO";
  }

  const today      = startOfDay(new Date());
  const todayEnd   = endOfDay(new Date());
  const monthStart = startOfMonth(new Date());
  const monthEnd   = endOfMonth(new Date());

  // Read plan limits from DB, fall back to defaults
  const planLimitRecord = await prisma.planLimit.findUnique({
    where: { plan: plan as "FREE" | "PRO" },
  });

  const limits = {
    dailyCaptions:    planLimitRecord?.dailyCaptions    ?? DEFAULT_LIMITS[plan as keyof typeof DEFAULT_LIMITS]?.dailyCaptions    ?? 10,
    monthlySchedules: planLimitRecord ? Infinity : DEFAULT_LIMITS[plan as keyof typeof DEFAULT_LIMITS]?.monthlySchedules ?? 15,
  };

  const isUnlimited = plan === "PRO";

  const [captionsToday, postsPublished, totalGenerations, scheduledCount, monthlyScheduleCount] = user
    ? await Promise.all([
        prisma.generation.count({
          where: { userId: user.id, createdAt: { gte: today, lte: todayEnd }, isDeleted: false },
        }),
        prisma.scheduledPost.count({
          where: { userId: user.id, status: "PUBLISHED" },
        }),
        prisma.generation.count({
          where: { userId: user.id, isDeleted: false },
        }),
        prisma.scheduledPost.count({
          where: { userId: user.id, status: "SCHEDULED" },
        }),
        prisma.scheduledPost.count({
          where: {
            userId: user.id,
            status: { in: ["SCHEDULED", "PUBLISHED"] },
            createdAt: { gte: monthStart, lte: monthEnd },
          },
        }),
      ])
    : [0, 0, 0, 0, 0];

  const stats = [
    {
      title:       "Captions Today",
      value:       captionsToday,
      icon:        PenLine,
      description: isUnlimited ? "Unlimited" : `${captionsToday} / ${limits.dailyCaptions}`,
    },
    {
      title:       "Posts Published",
      value:       postsPublished,
      icon:        Send,
      description: "All time",
    },
    {
      title:       "Total Generated",
      value:       totalGenerations,
      icon:        History,
      description: "All time",
    },
    {
      title:       "Scheduled Posts",
      value:       scheduledCount,
      icon:        Calendar,
      description: "In queue",
    },
  ];

  const captionLimitDisplay    = isUnlimited ? "∞" : limits.dailyCaptions;
  const scheduleLimitDisplay   = isUnlimited ? "∞" : 15;
  const captionProgressWidth   = isUnlimited ? "100%" : `${Math.min((captionsToday / (limits.dailyCaptions || 10)) * 100, 100)}%`;
  const scheduleProgressWidth  = isUnlimited ? "100%" : `${Math.min((monthlyScheduleCount / 15) * 100, 100)}%`;

  return (
    <div className="p-4 sm:p-6">
      <UpgradeNotifier upgraded={upgraded} />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {clerkUser?.firstName} 👋</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          You have {scheduledCount} post{scheduledCount !== 1 ? "s" : ""} currently in queue
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground truncate">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.description}</p>
                </div>
                <div className="p-2 bg-muted rounded-lg shrink-0 ml-2">
                  <stat.icon size={18} className="text-[#0d7c8a]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hero Card */}
        <div className="lg:col-span-2 rounded-lg bg-[#0a192f] p-6 sm:p-8 text-white relative overflow-hidden flex flex-col justify-center min-h-[220px] sm:min-h-[280px]">
          <div className="relative z-10">
            <span className="bg-[#0d7c8a] text-white text-xs font-bold px-3 py-1 rounded-full">
              Generate Content
            </span>
            <h2 className="text-xl sm:text-2xl font-bold mt-4 mb-2 max-w-xs leading-tight">
              Create high-impact content in seconds
            </h2>
            <p className="text-sm text-gray-400 max-w-xs mb-5">
              AI-powered captions and hashtags optimised for every platform
            </p>
            <Link href="/user/generate">
              <Button className="bg-[#0d7c8a] hover:bg-[#0b6a75] text-white font-bold h-9 px-6 rounded-lg text-sm">
                Generate Now <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Usage Widget */}
        <Card className="border-none shadow-sm rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Captions — daily */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5 text-muted-foreground">
                  <span>Captions Today</span>
                  <span className="text-foreground">{captionsToday} / {captionLimitDisplay}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[#0d7c8a]" style={{ width: captionProgressWidth }} />
                </div>
              </div>

              {/* Schedules — monthly */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5 text-muted-foreground">
                  <span>Schedules This Month</span>
                  <span className="text-foreground">{monthlyScheduleCount} / {scheduleLimitDisplay}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: scheduleProgressWidth }} />
                </div>
              </div>

              {/* Plan Status */}
              <div className="pt-3 border-t">
                {isUnlimited ? (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#0d7c8a] rounded-lg flex items-center justify-center text-white shrink-0">
                      <Zap size={16} fill="white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{plan} Plan Active</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Enjoy unlimited access to all features</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#0d7c8a] rounded-lg flex items-center justify-center text-white shrink-0">
                      <Zap size={16} fill="white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Go Unlimited</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Unlock unlimited captions and schedules
                      </p>
                      <Link
                        href="/pricing"
                        className="text-xs font-bold text-[#0d7c8a] flex items-center hover:underline mt-1.5"
                      >
                        Upgrade Now <ArrowRight size={12} className="ml-1" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
