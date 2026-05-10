export const dynamic = "force-dynamic";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role;
    
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get last 30 days data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Daily generations - fetch all and process in JS
    const generationsData = await prisma.generation.findMany({
      where: {
        isDeleted: false,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
        platform: true,
      },
    });

    // Group by date and include empty days so charts do not disappear on quiet days.
    const dateMap: { [key: string]: number } = {};
    for (let index = 29; index >= 0; index -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - index);
      dateMap[date.toISOString().split("T")[0]] = 0;
    }
    
    generationsData.forEach((gen) => {
      const date = gen.createdAt.toISOString().split("T")[0];
      dateMap[date] = (dateMap[date] || 0) + 1;
    });

    const dailyGenerations = Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    // Platform distribution
    const platformMap: { [key: string]: number } = {};
    generationsData.forEach((gen) => {
      const platform = gen.platform;
      platformMap[platform] = (platformMap[platform] || 0) + 1;
    });

    const platformDistribution = Object.entries(platformMap).map(
      ([platform, count]) => ({
        platform,
        count,
      })
    );

    // User growth for last 30 days
    const usersData = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const userDateMap: { [key: string]: number } = {};
    for (let index = 29; index >= 0; index -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - index);
      userDateMap[date.toISOString().split("T")[0]] = 0;
    }
    
    usersData.forEach((user) => {
      const date = user.createdAt.toISOString().split("T")[0];
      userDateMap[date] = (userDateMap[date] || 0) + 1;
    });

    const userGrowth = Object.entries(userDateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, users]) => ({ date, users }));

    // Total stats
    const [totalUsers, totalGenerations, totalImages, proUsers] = await Promise.all([
      prisma.user.count(),
      prisma.generation.count({ where: { isDeleted: false } }),
      prisma.generation.count({ where: { imageUrl: { not: null }, isDeleted: false } }),
      prisma.user.count({ where: { plan: "PRO" } }),
    ]);

    const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });
    const revenueData = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return {
        month: monthFormatter.format(date),
        revenue: Number((proUsers * 12).toFixed(2)),
      };
    });

    return NextResponse.json({
      dailyGenerations,
      platformDistribution,
      userGrowth,
      revenueData,
      totalStats: {
        totalUsers,
        totalGenerations,
        totalImages,
        proUsers,
        monthlyRevenue: proUsers * 12,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
