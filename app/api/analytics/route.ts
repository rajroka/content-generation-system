import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) {
      return NextResponse.json({
        total: 0,
        platformCount: {},
        toneCount: {},
        topHashtags: [],
        last7Days: {},
        recentContents: [],
      });
    }

    const contents = await prisma.content.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });

    // --- Platform distribution ---
    const platformCount: Record<string, number> = {};
    for (const c of contents) {
      platformCount[c.platform] = (platformCount[c.platform] || 0) + 1;
    }

    // --- Tone distribution ---
    const toneCount: Record<string, number> = {};
    for (const c of contents) {
      toneCount[c.tone] = (toneCount[c.tone] || 0) + 1;
    }

    // --- Hashtag frequency ---
    const hashtagFreq: Record<string, number> = {};
    for (const c of contents) {
      for (const tag of c.hashtags) {
        hashtagFreq[tag] = (hashtagFreq[tag] || 0) + 1;
      }
    }
    const topHashtags = Object.entries(hashtagFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    // --- Last 7 days activity ---
    const last7Days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      last7Days[label] = 0;
    }
    for (const c of contents) {
      const d = new Date(c.createdAt);
      const now = new Date();
      const diffDays = Math.floor(
        (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays <= 6) {
        const label = d.toLocaleDateString("en-US", { weekday: "short" });
        if (label in last7Days) {
          last7Days[label] = (last7Days[label] || 0) + 1;
        }
      }
    }

    // --- Recent 5 for overview ---
    const recentContents = contents.slice(0, 5).map((c : any ) => ({
      id: c.id,
      topic: c.topic,
      platform: c.platform,
      tone: c.tone,
      imageUrl: c.imageUrl,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({
      total: contents.length,
      platformCount,
      toneCount,
      topHashtags,
      last7Days,
      recentContents,
    });
  } catch (error) {
    console.error("[ANALYTICS ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
