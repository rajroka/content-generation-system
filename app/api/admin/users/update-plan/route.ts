export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const validPlans = ["FREE", "PRO"] as const;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role;
    
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: targetUserId, plan } = await req.json();

    if (!targetUserId || !validPlans.includes(plan)) {
      return NextResponse.json({ error: "Invalid user or plan" }, { status: 400 });
    }

    // Fetch current plan to detect FREE → PRO transition
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { plan: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isUpgradingToPro = plan === "PRO" && targetUser.plan === "FREE";

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        plan,
        ...(isUpgradingToPro && { upgradedToPROAt: new Date() }),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}


