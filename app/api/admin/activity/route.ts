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