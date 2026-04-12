import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ImageIcon, History, CalendarDays } from "lucide-react";
import Link from "next/link";
import { startOfDay, endOfDay } from "date-fns";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });

  const today = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const [captionsToday, imagesToday, totalGenerations, scheduledCount, usage] = user
    ? await Promise.all([
        prisma.generation.count({
          where: { userId: user.id, createdAt: { gte: today, lte: todayEnd }, isDeleted: false },
        }),
        prisma.generation.count({
          where: { userId: user.id, imageUrl: { not: null }, createdAt: { gte: today, lte: todayEnd }, isDeleted: false },
        }),
        prisma.generation.count({ where: { userId: user.id, isDeleted: false } }),
        // prisma.scheduledPost.count({ where: { userId: user.id, status: "PENDING" } }),
        prisma.scheduledPost.count({ where: { userId: user.id, status: "SCHEDULED" } }),
        prisma.usage.findUnique({ where: { userId_date: { userId: user.id, date: today } } }),
      ])
    : [0, 0, 0, 0, null];

  const plan = user?.plan ?? "FREE";

  const stats = [
    { title: "Captions Generated", value: String(captionsToday), description: "Today", icon: <Sparkles className="w-4 h-4 text-primary" /> },
    { title: "Images Created", value: String(imagesToday), description: "Today", icon: <ImageIcon className="w-4 h-4 text-primary" /> },
    { title: "Total Generations", value: String(totalGenerations), description: "All time", icon: <History className="w-4 h-4 text-primary" /> },
    { title: "Scheduled Posts", value: String(scheduledCount), description: "Pending", icon: <CalendarDays className="w-4 h-4 text-primary" /> },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {clerkUser?.firstName ?? "there"} 👋</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your content today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Start generating</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">Create AI-powered captions and images in seconds.</p>
            <Button className="w-fit" asChild>
              <Link href="/dashboard/generate">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate content
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily usage</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Captions</span>
              <span className="font-medium">{captionsToday} / {plan === "FREE" ? 10 : "∞"}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: plan === "FREE" ? `${Math.min((captionsToday / 10) * 100, 100)}%` : "100%" }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Schedules</span>
              <span className="font-medium">{usage?.scheduleCount ?? 0} / {plan === "FREE" ? 5 : "∞"}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: plan === "FREE" ? `${Math.min(((usage?.scheduleCount ?? 0) / 5) * 100, 100)}%` : "100%" }}
              />
            </div>
            {plan === "FREE" && (
              <Button variant="outline" className="w-fit mt-1" asChild>
                <Link href="/pricing">Upgrade for unlimited</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}