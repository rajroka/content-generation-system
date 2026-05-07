export const dynamic = "force-dynamic";

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ── Helpers ───────────────────────────────────────────────────────────────────

function isVideo(url: string) {
  return /\.(mp4|mov|webm|avi|mpeg|mkv)(\?|$)/i.test(url);
}

// Poll Instagram container status until FINISHED or ERROR (max 60s)
async function waitForInstagramContainer(containerId: string, accessToken: string): Promise<void> {
  const maxAttempts = 12;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const res  = await fetch(`https://graph.instagram.com/v18.0/${containerId}?fields=status_code&access_token=${accessToken}`);
    const data = await res.json();
    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR") throw new Error("Instagram media processing failed");
  }
  throw new Error("Instagram media processing timed out");
}

// ── Platform publishers ───────────────────────────────────────────────────────

async function postToTwitter(accessToken: string, caption: string) {
  const res  = await fetch("https://api.twitter.com/2/tweets", {
    method:  "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body:    JSON.stringify({ text: caption.slice(0, 280) }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.title || "Twitter post failed");
  return data;
}

async function postToFacebook(accessToken: string, caption: string, mediaUrl?: string) {
  // Get the user's managed pages
  const pagesRes  = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`);
  const pagesData = await pagesRes.json();
  const page      = pagesData.data?.[0];
  if (!page) throw new Error("No Facebook Page found. Connect a Page (not a personal account).");

  const pageToken = page.access_token;
  const pageId    = page.id;

  if (mediaUrl && isVideo(mediaUrl)) {
    // Video post
    const res  = await fetch(`https://graph.facebook.com/v18.0/${pageId}/videos`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ file_url: mediaUrl, description: caption, access_token: pageToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Facebook video post failed");
    return data;
  } else {
    // Photo or text post
    const body: Record<string, string> = { message: caption, access_token: pageToken };
    if (mediaUrl) body.url = mediaUrl;
    const endpoint = mediaUrl
      ? `https://graph.facebook.com/v18.0/${pageId}/photos`
      : `https://graph.facebook.com/v18.0/${pageId}/feed`;
    const res  = await fetch(endpoint, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Facebook post failed");
    return data;
  }
}

async function postToInstagram(accessToken: string, caption: string, mediaUrl?: string) {
  if (!mediaUrl) throw new Error("Instagram requires an image or video to post.");

  // Get IG user ID
  const userRes  = await fetch(`https://graph.instagram.com/me?fields=id&access_token=${accessToken}`);
  const userData = await userRes.json();
  if (!userRes.ok) throw new Error("Failed to get Instagram user ID");
  const igUserId = userData.id;

  const video = isVideo(mediaUrl);

  // Step 1: Create media container
  const containerBody: Record<string, string> = {
    caption,
    access_token: accessToken,
  };
  if (video) {
    containerBody.media_type = "REELS";
    containerBody.video_url  = mediaUrl;
  } else {
    containerBody.image_url = mediaUrl;
  }

  const containerRes  = await fetch(`https://graph.instagram.com/v18.0/${igUserId}/media`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(containerBody),
  });
  const containerData = await containerRes.json();
  if (!containerRes.ok) throw new Error(containerData.error?.message || "Instagram media creation failed");

  // Step 2: Wait for video processing (images are instant)
  if (video) {
    await waitForInstagramContainer(containerData.id, accessToken);
  }

  // Step 3: Publish
  const publishRes  = await fetch(`https://graph.instagram.com/v18.0/${igUserId}/media_publish`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ creation_id: containerData.id, access_token: accessToken }),
  });
  const publishData = await publishRes.json();
  if (!publishRes.ok) throw new Error(publishData.error?.message || "Instagram publish failed");
  return publishData;
}

async function postToLinkedIn(accessToken: string, caption: string, mediaUrl?: string) {
  // Get the member's URN
  const profileRes  = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const profile = await profileRes.json();
  if (!profileRes.ok) throw new Error("Failed to get LinkedIn profile");

  const authorUrn = `urn:li:person:${profile.sub}`;

  // Build the share content
  const shareContent: any = {
    author:         authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: caption },
        shareMediaCategory: mediaUrl ? (isVideo(mediaUrl) ? "VIDEO" : "IMAGE") : "NONE",
        ...(mediaUrl && {
          media: [{
            status:      "READY",
            originalUrl: mediaUrl,
          }],
        }),
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  const res  = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method:  "POST",
    headers: {
      Authorization:  `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(shareContent),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "LinkedIn post failed");
  return data;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { caption, platforms, mediaUrl, mediaUrls } = await req.json();

    // Support both old imageUrl/imageUrls and new mediaUrl/mediaUrls field names
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

    const socialAccounts = await prisma.socialAccount.findMany({
      where: { userId: user.id, platform: { in: platforms }, isActive: true },
    });

    const connectedPlatforms = socialAccounts.map((a) => a.platform);
    const missingPlatforms   = platforms.filter((p: string) => !connectedPlatforms.includes(p));

    if (missingPlatforms.length > 0) {
      return NextResponse.json(
        { error: `Not connected to: ${missingPlatforms.join(", ")}. Go to Connections to link your accounts.` },
        { status: 400 }
      );
    }

    const results: { platform: string; success: boolean; error?: string }[] = [];

    for (const account of socialAccounts) {
      try {
        switch (account.platform) {
          case "TWITTER":
            await postToTwitter(account.accessToken, caption || "");
            break;
          case "FACEBOOK":
            await postToFacebook(account.accessToken, caption || "", primaryMedia);
            break;
          case "INSTAGRAM":
            await postToInstagram(account.accessToken, caption || "", primaryMedia);
            break;
          case "LINKEDIN":
            await postToLinkedIn(account.accessToken, caption || "", primaryMedia);
            break;
          default:
            throw new Error(`Publishing to ${account.platform} is not yet supported.`);
        }
        results.push({ platform: account.platform, success: true });
      } catch (err: any) {
        console.error(`Publish error for ${account.platform}:`, err.message);
        results.push({ platform: account.platform, success: false, error: err.message });
      }
    }

    const successfulPlatforms = results.filter((r) => r.success).map((r) => r.platform);
    if (successfulPlatforms.length > 0) {
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

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await prisma.usage.upsert({
        where:  { userId_date: { userId: user.id, date: today } },
        update: { postCount: { increment: 1 } },
        create: { userId: user.id, date: today, postCount: 1 },
      });
    }

    return NextResponse.json({
      success: results.some((r) => r.success),
      partial: results.some((r) => r.success) && results.some((r) => !r.success),
      results,
    });
  } catch (err: any) {
    console.error("Publish API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
