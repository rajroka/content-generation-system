export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin
    const client = await clerkClient();
    const adminUser = await client.users.getUser(userId);
    if (adminUser.publicMetadata?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch ALL users from Clerk (paginated)
    let allClerkUsers: Awaited<ReturnType<typeof client.users.getUserList>>["data"] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const page = await client.users.getUserList({ limit, offset });
      allClerkUsers = allClerkUsers.concat(page.data);
      if (page.data.length < limit) break;
      offset += limit;
    }

    const clerkIds = new Set(allClerkUsers.map((cu) => cu.id));

    // Upsert every Clerk user into the DB
    let synced = 0;
    for (const cu of allClerkUsers) {
      const email = cu.emailAddresses?.[0]?.emailAddress ?? "";
      const name  = [cu.firstName, cu.lastName].filter(Boolean).join(" ") || null;
      const role  = (cu.publicMetadata?.role as string) === "admin" ? "ADMIN" : "USER";

      await prisma.user.upsert({
        where:  { clerkId: cu.id },
        update: { email, name, imageUrl: cu.imageUrl ?? null },
        create: {
          clerkId:  cu.id,
          email,
          name,
          imageUrl: cu.imageUrl ?? null,
          plan:     "FREE",
          role,
          isActive: true,
        },
      });
      synced++;
    }

    // Find DB users whose clerkId is no longer in Clerk
    const dbUsers = await prisma.user.findMany({
      select: { id: true, clerkId: true },
    });

    const staleUsers = dbUsers.filter((u) => !clerkIds.has(u.clerkId));
    let removed = 0;

    for (const u of staleUsers) {
      try {
        // Manually delete all related records first to avoid FK constraint issues
        // (in case DB-level cascade wasn't applied due to migration history)
        await prisma.$transaction([
          prisma.socialAccount.deleteMany({ where: { userId: u.id } }),
          prisma.usage.deleteMany({ where: { userId: u.id } }),
          // Null out generationId on scheduledPosts before deleting generations
          prisma.scheduledPost.updateMany({
            where: { userId: u.id },
            data: { generationId: null },
          }),
          prisma.scheduledPost.deleteMany({ where: { userId: u.id } }),
          prisma.generation.deleteMany({ where: { userId: u.id } }),
          prisma.user.delete({ where: { id: u.id } }),
        ]);
        removed++;
      } catch (err: any) {
        console.error(`[sync] Failed to delete stale user ${u.id}:`, err?.message);
      }
    }

    console.log(`[sync] synced=${synced} removed=${removed}`);
    return NextResponse.json({ synced, removed });
  } catch (err: any) {
    console.error("[sync] fatal error:", err);
    return NextResponse.json({ error: "Sync failed", detail: err?.message }, { status: 500 });
  }
}
