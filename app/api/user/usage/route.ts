export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const DEFAULT_LIMITS = {
  FREE: { dailyCaptions: 10, monthlySchedules: 15 },
  PRO:  { dailyCaptions: Infinity, monthlySchedules: Infinity },
};

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ captions: 0, schedules: 0, posts: 0, plan: "FREE", captionLimit: 10, scheduleLimit: 15 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const plan = user.plan ?? "FREE";

    const [usage, planLimit] = await Promise.all([
      prisma.usage.findUnique({
        where: { userId_date: { userId: user.id, date: today } },
      }),
      prisma.planLimit.findUnique({ where: { plan: plan as "FREE" | "PRO" } }),
    ]);

    const captionLimit   = planLimit?.dailyCaptions    ?? DEFAULT_LIMITS[plan as keyof typeof DEFAULT_LIMITS]?.dailyCaptions    ?? 10;
    const scheduleLimit  = planLimit ? null : DEFAULT_LIMITS[plan as keyof typeof DEFAULT_LIMITS]?.monthlySchedules ?? 15;

    return NextResponse.json({
      captions:      usage?.captionCount  ?? 0,
      schedules:     usage?.scheduleCount ?? 0,
      posts:         usage?.postCount     ?? 0,
      plan,
      captionLimit:  captionLimit === Infinity ? null : captionLimit,
      scheduleLimit: scheduleLimit === Infinity ? null : scheduleLimit,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
