export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { endOfMonth, startOfMonth } from "date-fns";
import prisma from "@/lib/prisma";
import zernio from "@/lib/zernio";

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function isVideo(url: string) {
  return /\.(mp4|mov|webm|avi|mpeg|mkv)(\?|$)/i.test(url);
}

function getStoredZernioPostId(post: { zernioPostId?: string | null; failureReason?: string | null }) {
  if (post.zernioPostId) return post.zernioPostId;
  if (post.failureReason?.startsWith("zernio:")) return post.failureReason.slice("zernio:".length);
  return null;
}

async function getZernioPlatforms(userId: string, platforms: string[]) {
  const socialAccounts = await prisma.socialAccount.findMany({
    where: {
      userId,
      platform: { in: platforms as any },
      isActive: true,
      accountId: { not: null },
    },
  });

  const connectedPlatforms = socialAccounts.map((account) => account.platform as string);
  const missingPlatforms = platforms.filter((platform) => !connectedPlatforms.includes(platform));
  if (missingPlatforms.length > 0) {
    throw new HttpError(
      400,
      `Not connected to: ${missingPlatforms.join(", ")}. Go to Connections to link your accounts.`
    );
  }

  return socialAccounts.map((account) => ({
    platform:  account.platform.toLowerCase(),
    accountId: account.accountId!,
  }));
}

async function createZernioScheduledPost({
  userId,
  caption,
  platforms,
  scheduledFor,
  imageUrls,
}: {
  userId: string;
  caption: string;
  platforms: string[];
  scheduledFor: Date;
  imageUrls: string[];
}) {
  const zernioPlatforms = await getZernioPlatforms(userId, platforms);
  const mediaItems = imageUrls.map((url) => ({
    type: isVideo(url) ? "video" as const : "image" as const,
    url,
  }));

  const result = await zernio.posts.createPost({
    body: {
      content: caption,
      scheduledFor: scheduledFor.toISOString(),
      platforms: zernioPlatforms,
      ...(mediaItems.length > 0 && { mediaItems }),
    },
  });

  return result.data?.post?._id ?? null;
}

async function deleteZernioPost(postId: string) {
  await zernio.posts.deletePost({ path: { postId } });
}

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

    if (post.status === "PUBLISHED" || post.status === "CANCELLED") {
      return NextResponse.json(
        { error: `Cannot edit a ${post.status.toLowerCase()} post` },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { caption, scheduledFor, platforms, imageUrls, imageUrl, isDraft } = body;

    const nextStatus = isDraft === true ? "DRAFT" : isDraft === false ? "SCHEDULED" : post.status;
    const nextPlatforms = platforms !== undefined
      ? Array.isArray(platforms) ? platforms : []
      : post.platforms;
    const nextCaption = caption !== undefined ? caption.trim() : post.caption || "";
    const nextImageUrls: string[] = Array.isArray(imageUrls)
      ? imageUrls.filter(Boolean)
      : imageUrl !== undefined
        ? imageUrl ? [imageUrl] : []
        : post.imageUrls?.length
          ? post.imageUrls
          : post.imageUrl
            ? [post.imageUrl]
            : [];

    if (nextStatus === "SCHEDULED" && nextPlatforms.length === 0) {
      return NextResponse.json({ error: "Select at least one platform" }, { status: 400 });
    }

    const nextScheduledFor = nextStatus === "DRAFT"
      ? null
      : scheduledFor !== undefined
        ? scheduledFor ? new Date(scheduledFor) : null
        : post.scheduledFor;

    if (nextStatus === "SCHEDULED") {
      if (!nextScheduledFor) {
        return NextResponse.json({ error: "Schedule time is required" }, { status: 400 });
      }
      if (Number.isNaN(nextScheduledFor.getTime())) {
        return NextResponse.json({ error: "Invalid schedule time" }, { status: 400 });
      }
      if (nextScheduledFor <= new Date()) {
        return NextResponse.json({ error: "Cannot schedule in the past" }, { status: 400 });
      }
    }

    if (post.status === "DRAFT" && nextStatus === "SCHEDULED" && user.plan === "FREE") {
      const monthlyCount = await prisma.scheduledPost.count({
        where: {
          userId: user.id,
          status: { in: ["SCHEDULED", "PUBLISHED"] },
          createdAt: { gte: startOfMonth(new Date()), lte: endOfMonth(new Date()) },
        },
      });

      if (monthlyCount >= 15) {
        return NextResponse.json(
          { error: "Monthly schedule limit reached (15/month). Upgrade to Pro for unlimited." },
          { status: 403 }
        );
      }
    }

    const currentZernioPostId = getStoredZernioPostId(post);
    let nextZernioPostId = currentZernioPostId;

    if (post.status === "SCHEDULED" && nextStatus === "DRAFT" && currentZernioPostId) {
      await deleteZernioPost(currentZernioPostId);
      nextZernioPostId = null;
    } else if (nextStatus === "SCHEDULED" && nextScheduledFor) {
      const remoteShapeChanged =
        post.status !== "SCHEDULED" ||
        platforms !== undefined ||
        imageUrls !== undefined ||
        imageUrl !== undefined;

      if (!currentZernioPostId || remoteShapeChanged) {
        const replacementZernioPostId = await createZernioScheduledPost({
          userId: user.id,
          caption: nextCaption,
          platforms: nextPlatforms,
          scheduledFor: nextScheduledFor,
          imageUrls: nextImageUrls,
        });

        if (currentZernioPostId) {
          try {
            await deleteZernioPost(currentZernioPostId);
          } catch (err) {
            if (replacementZernioPostId) {
              await deleteZernioPost(replacementZernioPostId).catch(() => {});
            }
            throw err;
          }
        }

        nextZernioPostId = replacementZernioPostId;
      } else {
        await zernio.posts.updatePost({
          path: { postId: currentZernioPostId },
          body: {
            content: nextCaption,
            scheduledFor: nextScheduledFor.toISOString(),
          },
        });
      }
    }

    const updated = await prisma.scheduledPost.update({
      where: { id: params.id },
      data: {
        ...(caption !== undefined && { caption: nextCaption || null }),
        ...(platforms !== undefined && { platforms: nextPlatforms }),
        ...(imageUrls !== undefined && { imageUrls: nextImageUrls, imageUrl: nextImageUrls[0] || null }),
        ...(imageUrl !== undefined && imageUrls === undefined && { imageUrl, imageUrls: nextImageUrls }),
        scheduledFor: nextScheduledFor,
        status:       nextStatus as any,
        zernioPostId: nextZernioPostId,
        ...(post.failureReason?.startsWith("zernio:") && { failureReason: null }),
      },
    });

    if (post.status === "DRAFT" && nextStatus === "SCHEDULED" && user.plan === "FREE") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await prisma.usage.upsert({
        where:  { userId_date: { userId: user.id, date: today } },
        update: { scheduleCount: { increment: 1 } },
        create: { userId: user.id, date: today, scheduleCount: 1 },
      });
    }

    return NextResponse.json({ success: true, post: updated });
  } catch (err: any) {
    console.error("PATCH post error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: err.status || 500 }
    );
  }
}

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

    const zernioPostId = getStoredZernioPostId(post);
    if (zernioPostId && post.status === "SCHEDULED") {
      await deleteZernioPost(zernioPostId);
    }

    await prisma.scheduledPost.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE post error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: err.status || 500 }
    );
  }
}
