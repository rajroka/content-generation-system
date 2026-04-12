import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json([]);

    const posts = await prisma.scheduledPost.findMany({
      where: {
        userId: user.id,
        status: { in: ["SCHEDULED", "DRAFT"] },
      },
      orderBy: { scheduledFor: "asc" },
    });

    return NextResponse.json(posts);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}