export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserByClerkId } from "@/lib/user";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId(clerkId);

    if (!user) {
      return NextResponse.json([]);
    }

    const connections = await prisma.socialAccount.findMany({
      where: { userId: user.id },
      select: {
        platform: true,
        accountName: true,
        isActive: true,
        createdAt: true,
      },
    });

    const formattedConnections = connections.map(conn => ({
      platform: conn.platform,
      accountName: conn.accountName,
      isActive: conn.isActive,
      connectedAt: conn.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedConnections);
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json([], { status: 500 });
  }
}
