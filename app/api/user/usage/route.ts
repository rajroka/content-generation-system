export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

    // Fetch today's usage and optional PlanLimit DB row in parallel
    const [usage, planLimitRow] = await Promise.all([
      prisma.usage.findUnique({
        where: { userId_date: { userId: user.id, date: today } },
      }),
      prisma.planLimit.findUnique({ where: { plan } }),
    ]);

    // Resolve limits: prefer DB row, fall back to hardcoded defaults
    const defaults       = HARDCODED_LIMITS[plan];
    const captionLimit   = planLimitRow?.dailyCaptions ?? defaults.dailyCaptions;
    // PlanLimit table has no monthlySchedules column — always use hardcoded defaults
    const scheduleLimit  = defaults.monthlySchedules;

    return NextResponse.json({
      captions:      usage?.captionCount  ?? 0,
      schedules:     usage?.scheduleCount ?? 0,
      posts:         usage?.postCount     ?? 0,
      plan,
      captionLimit:  captionLimit  === Infinity ? null : captionLimit,
      scheduleLimit: scheduleLimit === Infinity ? null : scheduleLimit,
    });
  } catch (err: any) {
    console.error("Usage route error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
