import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();
    
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get last 30 days data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Daily generations
    const dailyGenerations = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM "Generation"
      WHERE created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Platform distribution
    const platformDistribution = await prisma.$queryRaw`
      SELECT platform, COUNT(*) as count
      FROM "Generation"
      GROUP BY platform
    `;

    // User growth
    const userGrowth = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as users
      FROM "User"
      WHERE created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

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
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}