export const dynamic = "force-dynamic";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role;
    
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get recent generations as activity
    const recentGenerations = await prisma.generation.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    const logs = recentGenerations.map((gen) => ({
      id: gen.id,
      action: "GENERATE",
      details: `Generated ${gen.platform.toLowerCase()} content: "${gen.topic}"`,
      userId: gen.userId,
      userEmail: gen.user.email,
      createdAt: gen.createdAt.toISOString(),
    }));

    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 });
  }
}
