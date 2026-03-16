import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { generatePostingPlan } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { platform } = await req.json();
    if (!platform) {
      return NextResponse.json({ error: "Platform is required" }, { status: 400 });
    }

    const plan = await generatePostingPlan(platform);
    return NextResponse.json({ plan });
  } catch (error) {
    console.error("[PLAN ERROR]", error);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
