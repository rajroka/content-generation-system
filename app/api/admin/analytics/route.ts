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
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
        platform: true,
      },
    });

    // Group by date
    const dailyGenerations: { date: string; count: number }[] = [];
    const dateMap: { [key: string]: number } = {};
    
    generationsData.forEach((gen) => {
      const date = gen.createdAt.toISOString().split("T")[0];
      dateMap[date] = (dateMap[date] || 0) + 1;
    });

    Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, count]) => {
        dailyGenerations.push({ date, count });
      });

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

    const userGrowth: { date: string; users: number }[] = [];
    const userDateMap: { [key: string]: number } = {};
    
    usersData.forEach((user) => {
      const date = user.createdAt.toISOString().split("T")[0];
      userDateMap[date] = (userDateMap[date] || 0) + 1;
    });

    Object.entries(userDateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, users]) => {
        userGrowth.push({ date, users });
      });

    // Total stats
    const [totalUsers, totalGenerations, totalImages, proUsers] = await Promise.all([
      prisma.user.count(),
      prisma.generation.count(),
      prisma.generation.count({ where: { imageUrl: { not: null } } }),
      prisma.user.count({ where: { plan: "PRO" } }),
    ]);

    return NextResponse.json({
      dailyGenerations,
      platformDistribution,
      userGrowth,
      revenueData: [
        { month: "Jan", revenue: 0 },
        { month: "Feb", revenue: 0 },
        { month: "Mar", revenue: proUsers * 9.99 },
      ],
      totalStats: {
        totalUsers,
        totalGenerations,
        totalImages,
        proUsers,
        monthlyRevenue: proUsers * 9.99,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
