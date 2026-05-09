export const dynamic = "force-dynamic";

// TEMPORARY DEBUG ROUTE — DELETE AFTER USE
// GET  /api/test/debug          → list all social accounts
// POST /api/test/debug          → delete a social account by DB id
// Only works in development

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import zernio from "@/lib/zernio";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  const accounts = await prisma.socialAccount.findMany({
    include: { user: { select: { email: true, clerkId: true } } },
  });

  return NextResponse.json(
    accounts.map((a) => ({
      id:          a.id,
      platform:    a.platform,
      accountName: a.accountName,
      zernioId:    a.accountId,
      userEmail:   a.user.email,
    }))
  );
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const account = await prisma.socialAccount.findUnique({ where: { id } });
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Try to remove from Zernio first
  if (account.accountId) {
    try {
      await zernio.accounts.deleteAccount(account.accountId);
    } catch (e: any) {
      console.warn("Zernio delete warning:", e.message);
    }
  }

  await prisma.socialAccount.delete({ where: { id } });

  return NextResponse.json({ success: true, deleted: account.platform });
}
