export const dynamic = "force-dynamic";

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import zernio from "@/lib/zernio";

function isVideo(url: string) {
  return /\.(mp4|mov|webm|avi|mpeg|mkv)(\?|$)/i.test(url);
}

/**
 * Fetch image dimensions from a URL using a HEAD/GET request.
 * Returns null if dimensions can't be determined.
 */
async function getImageDimensions(url: string): Promise<{ width: number; height: number } | null> {
  try {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // JPEG: starts with FF D8, dimensions at SOF0 marker (FF C0)
    if (bytes[0] === 0xff && bytes[1] === 0xd8) {
      for (let i = 2; i < bytes.length - 8; i++) {
        if (bytes[i] === 0xff && bytes[i + 1] === 0xc0) {
          const height = (bytes[i + 5] << 8) | bytes[i + 6];
          const width  = (bytes[i + 7] << 8) | bytes[i + 8];
          return { width, height };
        }
      }
    }

    // PNG: starts with 89 50 4E 47, dimensions at bytes 16-23
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      const width  = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
      const height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
      return { width, height };
    }

    return null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { caption, platforms, mediaUrl, mediaUrls } = await req.json();

    const primaryMedia: string | undefined = mediaUrl || mediaUrls?.[0] || undefined;
    const allMedia: string[]               = mediaUrls || (mediaUrl ? [mediaUrl] : []);

    if (!caption?.trim() && !primaryMedia) {
      return NextResponse.json({ error: "Post must have a caption or media" }, { status: 400 });
    }
    if (!platforms || platforms.length === 0) {
      return NextResponse.json({ error: "Select at least one platform" }, { status: 400 });
    }

    const clerkUser = await currentUser();
    const user = await prisma.user.upsert({
      where:  { clerkId: userId },
      update: {},
      create: {
        clerkId:  userId,
        email:    clerkUser?.emailAddresses[0]?.emailAddress || `user_${userId}@fallback.com`,
        name:     `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() || null,
        imageUrl: clerkUser?.imageUrl || null,
        plan:     "FREE",
      },
    });

    // Fetch connected accounts from DB to get Zernio account IDs
    const socialAccounts = await prisma.socialAccount.findMany({
      where: { userId: user.id, platform: { in: platforms }, isActive: true },
    });

    const connectedPlatforms = socialAccounts.map((a) => a.platform as string);
    const missingPlatforms   = platforms.filter((p: string) => !connectedPlatforms.includes(p));

    if (missingPlatforms.length > 0) {
      return NextResponse.json(
        { error: `Not connected to: ${missingPlatforms.join(", ")}. Go to Connections to link your accounts.` },
        { status: 400 }
      );
    }

    // Check image aspect ratio for Instagram — auto-set contentType: "story" if too tall
    // Instagram feed requires 0.75–1.91. Below 0.75 = story/TikTok format.
    let instagramContentType: "story" | undefined;
    if (platforms.includes("INSTAGRAM") && primaryMedia && !isVideo(primaryMedia)) {
      const dims = await getImageDimensions(primaryMedia);
      if (dims) {
        const ratio = dims.width / dims.height;
        if (ratio < 0.75) {
          instagramContentType = "story";
        }
      }
    }

    // Build Zernio platforms array — apply Instagram-specific contentType if needed
    const zernioPlatforms = socialAccounts.map((account) => {
      const base = {
        platform:  account.platform.toLowerCase(),
        accountId: account.accountId!,
      };
      if (account.platform === "INSTAGRAM" && instagramContentType) {
        return { ...base, platformSpecificData: { contentType: instagramContentType } };
      }
      return base;
    });

    // Build mediaItems array from provided URLs
    const mediaItems = allMedia.map((url) => ({
      type: isVideo(url) ? "video" as const : "image" as const,
      url,
    }));

    // Publish immediately via Zernio
    const result = await zernio.posts.createPost({
      body: {
        content:    caption?.trim() || "",
        publishNow: true,
        platforms:  zernioPlatforms,
        ...(mediaItems.length > 0 && { mediaItems }),
      },
    });

    const zernioPostId = result.data?.post?._id;

    // Record in DB
    const successfulPlatforms = socialAccounts.map((a) => a.platform);
    await prisma.scheduledPost.create({
      data: {
        userId:       user.id,
        caption:      caption?.trim() || null,
        hashtags:     [],
        platforms:    successfulPlatforms as any,
        scheduledFor: new Date(),
        imageUrl:     primaryMedia || null,
        imageUrls:    allMedia,
        status:       "PUBLISHED",
        publishedAt:  new Date(),
      },
    });

    // Increment usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.usage.upsert({
      where:  { userId_date: { userId: user.id, date: today } },
      update: { postCount: { increment: 1 } },
      create: { userId: user.id, date: today, postCount: 1 },
    });

    return NextResponse.json({
      success:              true,
      postId:               zernioPostId,
      instagramContentType, // let frontend know if it was auto-posted as story
      results:              successfulPlatforms.map((p) => ({ platform: p, success: true })),
    });
  } catch (err: any) {
    console.error("Publish API Error:", err);
    const message = err?.message || "Internal Server Error";
    const status  = err?.statusCode === 400 ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
