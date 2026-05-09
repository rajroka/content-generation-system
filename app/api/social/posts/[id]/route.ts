export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import zernio from "@/lib/zernio";

// ── GET /api/social/posts/[id] ────────────────────────────────────────────────
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const post = await prisma.scheduledPost.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    return NextResponse.json(post);
  } catch (err: any) {
    console.error("GET post error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ── PATCH /api/social/posts/[id] ──────────────────────────────────────────────
// Supports editing caption, scheduledFor, platforms, imageUrls
// Also handles status changes: DRAFT → SCHEDULED, SCHEDULED → DRAFT
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const post = await prisma.scheduledPost.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    // Cannot edit published or cancelled posts
    if (post.status === "PUBLISHED" || post.status === "CANCELLED") {
      return NextResponse.json(
        { error: `Cannot edit a ${post.status.toLowerCase()} post` },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { caption, scheduledFor, platforms, imageUrls, imageUrl, isDraft } = body;

    // Validate future date if scheduling
    if (scheduledFor && !isDraft) {
      const date = new Date(scheduledFor);
      if (date < new Date()) {
        return NextResponse.json({ error: "Cannot schedule in the past" }, { status: 400 });
      }
    }

    const newStatus = isDraft === true ? "DRAFT" : isDraft === false ? "SCHEDULED" : post.status;
    const newScheduledFor = isDraft ? null : scheduledFor ? new Date(scheduledFor) : post.scheduledFor;

    // If post has a Zernio ID and we're rescheduling, update via Zernio
    // (Zernio post ID is stored in zernioPostId field after schema migration)
    const zernioPostId = (post as any).zernioPostId;
    if (zernioPostId && newStatus === "SCHEDULED" && newScheduledFor) {
      try {
        // Zernio doesn't have a direct update endpoint in v0.2 — cancel and recreate
        // For now we just update locally; Zernio will handle at publish time
      } catch (zErr: any) {
        console.warn("Zernio update warning:", zErr.message);
      }
    }

    const updated = await prisma.scheduledPost.update({
      where: { id: params.id },
      data: {
        ...(caption !== undefined && { caption: caption.trim() || null }),
        ...(platforms !== undefined && { platforms }),
        ...(imageUrls !== undefined && { imageUrls, imageUrl: imageUrls[0] || null }),
        ...(imageUrl !== undefined && !imageUrls && { imageUrl }),
        scheduledFor: newScheduledFor,
        status:       newStatus as any,
      },
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (err: any) {
    console.error("PATCH post error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ── DELETE /api/social/posts/[id] ─────────────────────────────────────────────
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const post = await prisma.scheduledPost.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    // If it has a Zernio post ID, cancel it there too
    const zernioPostId = (post as any).zernioPostId;
    if (zernioPostId && post.status === "SCHEDULED") {
      try {
        await zernio.posts.deletePost(zernioPostId);
      } catch (zErr: any) {
        console.warn("Zernio delete warning:", zErr.message);
      }
    }

    await prisma.scheduledPost.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE post error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
