export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json([], { status: 200 });

    const generations = await prisma.generation.findMany({
      where: { userId: user.id, isDeleted: false },
      orderBy: { createdAt: "desc" },
      select: {
        id:        true,
        platform:  true,
        topic:     true,
        caption:   true,
        hashtags:  true,
        createdAt: true,
      },
    });

    return NextResponse.json(generations);
  } catch {
    return NextResponse.json({ error: "Failed to fetch generations" }, { status: 500 });
  }
}
