export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();
    
    const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const flagged = await prisma.generation.findMany({
      where: { isFlagged: true, isDeleted: false },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(flagged);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch flagged content" }, { status: 500 });
  }
}
