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
    if (!user) return NextResponse.json({ posts: [], stats: { scheduled: 0, drafts: 0, published: 0 } });

    // Return all statuses for the calendar (SCHEDULED, DRAFT, PUBLISHED)
    // so users can see their full history on the calendar
    const posts = await prisma.scheduledPost.findMany({
      where: {
        userId: user.id,
        status: includeAll
          ? { in: ["SCHEDULED", "DRAFT", "PUBLISHED", "FAILED"] }
          : { in: ["SCHEDULED", "DRAFT"] },
      },
      orderBy: { scheduledFor: "asc" },
    });

    // Real sidebar stats
    const [scheduled, drafts, published] = await Promise.all([
      prisma.scheduledPost.count({ where: { userId: user.id, status: "SCHEDULED" } }),
      prisma.scheduledPost.count({ where: { userId: user.id, status: "DRAFT" } }),
      prisma.scheduledPost.count({ where: { userId: user.id, status: "PUBLISHED" } }),
    ]);

    return NextResponse.json({ posts, stats: { scheduled, drafts, published } });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
