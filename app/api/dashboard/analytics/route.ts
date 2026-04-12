import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startOfDay, subDays, format } from "date-fns";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user)
      return NextResponse.json({
        generationsOverTime: [],
        platformBreakdown: [],
        scheduledByStatus: [],
        usageOverTime: [],
        totals: { generations: 0, scheduled: 0, published: 0, connected: 0 },
      });

    const today = startOfDay(new Date());
    const last30 = subDays(today, 29);
    const last7  = subDays(today, 6);

    // 1. Generations over last 30 days
    const generations = await prisma.generation.findMany({
      where: { userId: user.id, isDeleted: false, createdAt: { gte: last30 } },
      select: { createdAt: true, platform: true },
    });

    // Build day-by-day map for last 30 days
    const dayMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = format(subDays(today, 29 - i), "MMM dd");
      dayMap[d] = 0;
    }
    for (const gen of generations) {
      const d = format(gen.createdAt, "MMM dd");
      if (d in dayMap) dayMap[d]++;
    }
    const generationsOverTime = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

    // 2. Platform breakdown (all time)
    const allGenerations = await prisma.generation.findMany({
      where: { userId: user.id, isDeleted: false },
      select: { platform: true },
    });
    const platformMap: Record<string, number> = {};
    for (const gen of allGenerations) {
      platformMap[gen.platform] = (platformMap[gen.platform] ?? 0) + 1;
    }
    const platformBreakdown = Object.entries(platformMap).map(([platform, count]) => ({
      platform,
      count,
    }));

    // 3. Scheduled posts by status
    const scheduledPosts = await prisma.scheduledPost.findMany({
      where: { userId: user.id },
      select: { status: true },
    });
    const statusMap: Record<string, number> = {};
    for (const post of scheduledPosts) {
      statusMap[post.status] = (statusMap[post.status] ?? 0) + 1;
    }
    const scheduledByStatus = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }));

    // 4. Usage over last 7 days
    const usageRows = await prisma.usage.findMany({
      where: { userId: user.id, date: { gte: last7 } },
      orderBy: { date: "asc" },
    });
    const usageDayMap: Record<string, { captions: number; schedules: number }> = {};
    for (let i = 0; i < 7; i++) {
      const d = format(subDays(today, 6 - i), "MMM dd");
      usageDayMap[d] = { captions: 0, schedules: 0 };
    }
    for (const row of usageRows) {
      const d = format(row.date, "MMM dd");
      if (d in usageDayMap) {
        usageDayMap[d].captions  = row.captionCount;
        usageDayMap[d].schedules = row.scheduleCount;
      }
    }
    const usageOverTime = Object.entries(usageDayMap).map(([date, data]) => ({
      date,
      captions:  data.captions,
      schedules: data.schedules,
    }));

    // 5. Totals
    const [totalGenerations, totalScheduled, totalPublished, totalConnected] =
      await Promise.all([
        prisma.generation.count({ where: { userId: user.id, isDeleted: false } }),
        prisma.scheduledPost.count({ where: { userId: user.id, status: "SCHEDULED" } }),
        prisma.scheduledPost.count({ where: { userId: user.id, status: "PUBLISHED" } }),
        prisma.socialAccount.count({ where: { userId: user.id, isActive: true } }),
      ]);

    return NextResponse.json({
      generationsOverTime,
      platformBreakdown,
      scheduledByStatus,
      usageOverTime,
      totals: {
        generations: totalGenerations,
        scheduled:   totalScheduled,
        published:   totalPublished,
        connected:   totalConnected,
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}