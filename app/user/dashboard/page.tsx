// export const revalidate = 0; // This forces the dashboard to fetch fresh data on every load
export const dynamic = "force-dynamic";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, ImageIcon, History, Calendar, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  const plan = user?.plan ?? "FREE";
  const today = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  const [captionsToday, imagesToday, totalGenerations, scheduledCount, monthlyScheduleCount] = user
    ? await Promise.all([
        prisma.generation.count({ where: { userId: user.id, createdAt: { gte: today, lte: todayEnd }, isDeleted: false } }),
        prisma.generation.count({ where: { userId: user.id, imageUrl: { not: null }, createdAt: { gte: today, lte: todayEnd }, isDeleted: false } }),
        prisma.generation.count({ where: { userId: user.id, isDeleted: false } }),
        prisma.scheduledPost.count({ where: { userId: user.id, status: "SCHEDULED" } }),
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
    { title: "Captions", value: captionsToday, icon: <PenLine size={16} className="text-[#0d7c8a]" /> },
    { title: "Images", value: imagesToday, icon: <ImageIcon size={16} className="text-[#0d7c8a]" /> },
    { title: "Total", value: totalGenerations, icon: <History size={16} className="text-[#0d7c8a]" /> },
    { title: "Scheduled", value: scheduledCount, icon: <Calendar size={16} className="text-[#0d7c8a]" /> },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Welcome, {clerkUser?.firstName} 👋</h1>
        <p className="text-[12px] text-muted-foreground">You have <span className="text-[#0d7c8a] font-bold">{scheduledCount} posts</span> currently in queue.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm rounded-xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">{stat.icon}</div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hero Card */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0a192f] p-8 text-white relative overflow-hidden flex flex-col justify-center min-h-[300px]">
          <div className="relative z-10">
            <span className="bg-[#0d7c8a] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Update v2.4</span>
            <h2 className="text-2xl font-bold mt-4 mb-2 max-w-xs leading-tight">Create high-impact content in seconds.</h2>
            <p className="text-[12px] text-gray-400 max-w-xs mb-6">Optimized algorithms for maximum reach across Instagram and LinkedIn.</p>
            <Link href="/user/generate">
              <Button className="bg-[#0d7c8a] hover:bg-[#0b6a75] text-white font-bold h-9 px-6 rounded-lg text-xs">
                Generate Now <ArrowRight className="ml-2 w-3 h-3" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Side Widgets */}
        <div className="space-y-4">
          <Card className="border-none shadow-sm rounded-xl p-5">
            <h3 className="text-xs font-bold text-foreground mb-5">Usage</h3>
            <div className="space-y-5">
              {/* Captions — daily */}
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1.5 text-muted-foreground uppercase">
                  <span>Captions Today</span>
                  <span className="text-foreground">{captionsToday} / {plan === "FREE" ? 10 : "∞"}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0d7c8a]"
                    style={{ width: plan === "FREE" ? `${Math.min((captionsToday / 10) * 100, 100)}%` : "100%" }}
                  />
                </div>
              </div>
              {/* Schedules — monthly */}
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1.5 text-muted-foreground uppercase">
                  <span>Schedules This Month</span>
                  <span className="text-foreground">{monthlyScheduleCount} / {plan === "FREE" ? 15 : "∞"}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400"
                    style={{ width: plan === "FREE" ? `${Math.min((monthlyScheduleCount / 15) * 100, 100)}%` : "100%" }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {plan === "PRO" ? (
            <Card className="border-none shadow-sm rounded-xl bg-[#0d7c8a]/10 p-5">
              <div className="w-8 h-8 bg-[#0d7c8a] rounded-lg flex items-center justify-center mb-3 text-white">
                <Zap size={16} fill="white" />
              </div>
              <h3 className="text-xs font-bold text-foreground mb-1">Pro Plan Active</h3>
              <p className="text-[11px] text-muted-foreground mb-4">Enjoy unlimited captions and scheduled posts every month.</p>
            </Card>
          ) : (
            <Card className="border-none shadow-sm rounded-xl bg-[#0d7c8a]/10 p-5">
              <div className="w-8 h-8 bg-[#0d7c8a] rounded-lg flex items-center justify-center mb-3 text-white">
                <Zap size={16} fill="white" />
              </div>
              <h3 className="text-xs font-bold text-foreground mb-1">Go Unlimited</h3>
              <p className="text-[11px] text-muted-foreground mb-4">Unlimited captions, unlimited scheduled posts every month.</p>
              <Link href="/pricing" className="text-[11px] font-bold text-[#0d7c8a] flex items-center hover:underline">
                Upgrade Now <ArrowRight size={12} className="ml-1" />
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}