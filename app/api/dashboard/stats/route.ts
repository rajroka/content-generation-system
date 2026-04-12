import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user)
      return NextResponse.json({
        captionsToday: 0, imagesToday: 0,
        totalGenerations: 0, scheduledCount: 0, plan: "FREE",
      });

    const today    = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const [captionsToday, imagesToday, totalGenerations, scheduledCount] =
      await Promise.all([
        prisma.generation.count({
          where: { userId: user.id, createdAt: { gte: today, lte: todayEnd }, isDeleted: false },
        }),
        prisma.generation.count({
          where: { userId: user.id, imageUrl: { not: null }, createdAt: { gte: today, lte: todayEnd }, isDeleted: false },
        }),
        prisma.generation.count({ where: { userId: user.id, isDeleted: false } }),
        prisma.scheduledPost.count({ where: { userId: user.id, status: "SCHEDULED" } }),
      ]);

    return NextResponse.json({
      captionsToday, imagesToday, totalGenerations,
      scheduledCount, plan: user.plan ?? "FREE",
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}