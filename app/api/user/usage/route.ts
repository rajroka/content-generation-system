export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

const HARDCODED_LIMITS = {
  FREE: { dailyCaptions: 10, monthlySchedules: 15 },
  PRO:  { dailyCaptions: Infinity, monthlySchedules: Infinity },
};

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({
        captions:      0,
        schedules:     0,
        posts:         0,
        plan:          "FREE",
        captionLimit:  10,
        scheduleLimit: 15,
      });
    }

    const plan = user.plan as "FREE" | "PRO";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = startOfMonth(new Date());
    const monthEnd   = endOfMonth(new Date());

    // Fetch today's caption usage, PlanLimit row, and monthly post count in parallel
    const [usage, planLimitRow, monthlyPostCount] = await Promise.all([
      prisma.usage.findUnique({
        where: { userId_date: { userId: user.id, date: today } },
      }),
      prisma.planLimit.findUnique({ where: { plan } }),
      // Monthly schedules+publishes — matches the enforcement logic in publish/schedule routes
      prisma.scheduledPost.count({
        where: {
          userId:    user.id,
          status:    { in: ["SCHEDULED", "PUBLISHED"] },
          createdAt: { gte: monthStart, lte: monthEnd },
        },
      }),
    ]);

    // Resolve limits: prefer DB row, fall back to hardcoded defaults
    const defaults      = HARDCODED_LIMITS[plan];
    const captionLimit  = planLimitRow?.dailyCaptions ?? defaults.dailyCaptions;
    // PlanLimit table has no monthlySchedules column — always use hardcoded defaults
    const scheduleLimit = defaults.monthlySchedules;

    return NextResponse.json({
      captions:      usage?.captionCount ?? 0,
      schedules:     monthlyPostCount,          // real monthly total, matches enforcement
      posts:         usage?.postCount    ?? 0,
      plan,
      captionLimit:  captionLimit  === Infinity ? null : captionLimit,
      scheduleLimit: scheduleLimit === Infinity ? null : scheduleLimit,
    });
  } catch (err: any) {
    console.error("Usage route error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
