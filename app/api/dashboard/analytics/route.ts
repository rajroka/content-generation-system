export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { addDays, format, startOfDay, subDays } from "date-fns";

const RANGE_DAYS = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
} as const;

type RangeKey = keyof typeof RANGE_DAYS;

const SUPPORTED_PLATFORMS = ["INSTAGRAM", "FACEBOOK", "TIKTOK", "YOUTUBE"] as const;

function getRange(searchParams: URLSearchParams): RangeKey {
  const range = searchParams.get("range");
  return range === "7d" || range === "30d" || range === "90d" ? range : "30d";
}

function createDayMap(days: number, today: Date) {
  const dayMap: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const day = subDays(today, days - 1 - i);
    dayMap[format(day, "yyyy-MM-dd")] = 0;
  }
  return dayMap;
}

function toDayLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return format(new Date(year, month - 1, day), "MMM dd");
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const range = getRange(new URL(req.url).searchParams);
    const days = RANGE_DAYS[range];
    const now = new Date();
    const today = startOfDay(now);
    const rangeStart = startOfDay(subDays(today, days - 1));
    const futureEnd = addDays(now, days);

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({
        range,
        totals: {
          totalCaptionsGenerated: 0,
          postsPublished: 0,
          scheduledPosts: 0,
          connectedAccounts: 0,
        },
        captionTrend: [],
        publishingActivity: [],
        platformBreakdown: [],
        postStatusDistribution: [],
      });
    }

    const [
      totalCaptionsGenerated,
      postsPublished,
      scheduledPosts,
      connectedAccounts,
      generations,
      publishedPosts,
      platformPosts,
    ] = await Promise.all([
      prisma.generation.count({
        where: {
          userId: user.id,
          isDeleted: false,
          createdAt: { gte: rangeStart, lte: now },
        },
      }),
      prisma.scheduledPost.count({
        where: {
          userId: user.id,
          status: "PUBLISHED",
          publishedAt: { gte: rangeStart, lte: now },
        },
      }),
      prisma.scheduledPost.count({
        where: {
          userId: user.id,
          status: "SCHEDULED",
          scheduledFor: { gt: now, lte: futureEnd },
        },
      }),
      prisma.socialAccount.count({
        where: {
          userId: user.id,
          createdAt: { gte: rangeStart, lte: now },
        },
      }),
      prisma.generation.findMany({
        where: {
          userId: user.id,
          isDeleted: false,
          createdAt: { gte: rangeStart, lte: now },
        },
        select: { createdAt: true },
      }),
      prisma.scheduledPost.findMany({
        where: {
          userId: user.id,
          status: "PUBLISHED",
          publishedAt: { gte: rangeStart, lte: now },
        },
        select: { publishedAt: true },
      }),
      prisma.scheduledPost.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: rangeStart, lte: now },
        },
        select: { platforms: true },
      }),
    ]);

    const captionDayMap = createDayMap(days, today);
    for (const generation of generations) {
      const day = format(generation.createdAt, "yyyy-MM-dd");
      if (day in captionDayMap) captionDayMap[day]++;
    }

    const publishedDayMap = createDayMap(days, today);
    for (const post of publishedPosts) {
      if (!post.publishedAt) continue;
      const day = format(post.publishedAt, "yyyy-MM-dd");
      if (day in publishedDayMap) publishedDayMap[day]++;
    }

    const captionTrend = Object.entries(captionDayMap).map(([date, count]) => ({
      date,
      label: toDayLabel(date),
      count,
    }));

    const publishingActivity = Object.keys(captionDayMap).map((date) => ({
      date,
      label: toDayLabel(date),
      captionsGenerated: captionDayMap[date],
      postsPublished: publishedDayMap[date],
    }));

    const platformCounts: Record<string, number> = {};
    for (const post of platformPosts) {
      for (const platform of post.platforms) {
        if (!SUPPORTED_PLATFORMS.includes(platform as any)) continue;
        platformCounts[platform] = (platformCounts[platform] ?? 0) + 1;
      }
    }

    const platformBreakdown = SUPPORTED_PLATFORMS
      .map((platform) => ({ platform, count: platformCounts[platform] ?? 0 }))
      .filter((entry) => entry.count > 0);

    const postStatusDistribution = [
      { status: "PUBLISHED", count: postsPublished },
      { status: "SCHEDULED", count: scheduledPosts },
    ];

    return NextResponse.json({
      range,
      totals: {
        totalCaptionsGenerated,
        postsPublished,
        scheduledPosts,
        connectedAccounts,
      },
      captionTrend,
      publishingActivity,
      platformBreakdown,
      postStatusDistribution,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
