import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        socialAccounts: true,
      },
    });

    // Always return an array, even if no user or no accounts
    if (!user || !user.socialAccounts) {
      return NextResponse.json([]);
    }

    const connections = user.socialAccounts.map(account => ({
      platform: account.platform,
      accountName: account.accountName,
      isActive: account.isActive,
      connectedAt: account.createdAt.toISOString(),
    }));

    return NextResponse.json(connections);
  } catch (error) {
    console.error("Failed to fetch connections:", error);
    // Return empty array on error instead of error object
    return NextResponse.json([]);
  }
}