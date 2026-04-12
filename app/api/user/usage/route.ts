import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ captions: 0, schedules: 0, posts: 0, plan: "FREE" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usage = await prisma.usage.findUnique({
      where: { userId_date: { userId: user.id, date: today } },
    });

    return NextResponse.json({
      captions:  usage?.captionCount  ?? 0,
      schedules: usage?.scheduleCount ?? 0,
      posts:     usage?.postCount     ?? 0,
      plan:      user.plan ?? "FREE",
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}