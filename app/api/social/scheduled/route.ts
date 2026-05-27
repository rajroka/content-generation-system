export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const includeAll = searchParams.get("all") === "true";

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ posts: [], stats: { scheduled: 0, published: 0 } });

    await prisma.scheduledPost.updateMany({
      where: {
        userId: user.id,
        status: "SCHEDULED",
        scheduledFor: { lte: new Date() },
      },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    // Return scheduled, published, and optionally failed posts for the calendar.
    const posts = await prisma.scheduledPost.findMany({
      where: {
        userId: user.id,
        status: includeAll
          ? { in: ["SCHEDULED", "PUBLISHED", "FAILED"] }
          : { in: ["SCHEDULED", "PUBLISHED"] },
      },
      orderBy: { scheduledFor: "asc" },
    });

    const [scheduled, published] = await Promise.all([
      prisma.scheduledPost.count({ where: { userId: user.id, status: "SCHEDULED" } }),
      prisma.scheduledPost.count({ where: { userId: user.id, status: "PUBLISHED" } }),
    ]);

    return NextResponse.json({ posts, stats: { scheduled, published } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
