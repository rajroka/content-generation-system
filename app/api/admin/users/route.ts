export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


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

    const users = await prisma.user.findMany({
      where: {
        role: Role.USER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        plan: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        upgradedToPROAt: true,
        _count: {
          select: {
            generations: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (err: any) {
    console.error("[admin/users] GET error:", err?.message ?? err);
    return NextResponse.json({ error: "Failed to fetch users", detail: err?.message }, { status: 500 });
  }
}
