import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  generateTitles,
  generateCaptions,
  generateHashtags,
} from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { topic, platform, tone } = body;

    if (!topic?.trim()) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }
    if (!platform || !tone) {
      return NextResponse.json(
        { error: "Platform and tone are required" },
        { status: 400 }
      );
    }

    // Generate all three in parallel — faster than sequential
    const [titles, captions, hashtags] = await Promise.all([
      generateTitles({ topic, platform, tone }),
      generateCaptions({ topic, platform, tone }),
      generateHashtags({ topic, platform, tone }),
    ]);

    return NextResponse.json({ titles, captions, hashtags });
  } catch (error) {
    console.error("[TEXT GENERATION ERROR]", error);
    return NextResponse.json(
      { error: "Content generation failed" },
      { status: 500 }
    );
  }
}
