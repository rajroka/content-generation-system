import { PRO_PLAN_PRICE_USD } from "@/lib/constants";

export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role;

    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where: {
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        isActive: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            generations: true,
            scheduledPosts: true,
          },
        },
      },
      orderBy: [
        { plan: "desc" },
        { updatedAt: "desc" },
      ],
    });

    const proUsers = users.filter((user) => user.plan === "PRO").length;
    const freeUsers = users.length - proUsers;
    const monthlyRevenue = proUsers * PRO_PLAN_PRICE_USD;

    return NextResponse.json({
      summary: {
        totalUsers: users.length,
        proUsers,
        freeUsers,
        monthlyRevenue,
      },
      subscriptions: users.map((user) => ({
        ...user,
        billingStatus: user.plan === "PRO" ? "Active" : "Free",
      })),
    });
  } catch (error) {
    console.error("Subscriptions error:", error);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}
