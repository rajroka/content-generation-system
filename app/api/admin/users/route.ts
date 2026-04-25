export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();
    
    // Verify admin
    const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        role: true,
        isActive: true,
        createdAt: true,
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
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
